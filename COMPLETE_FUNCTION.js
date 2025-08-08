// CÓDIGO COMPLETO PARA PEGAR EN FIREBASE CONSOLE
// Copia todo este archivo y pégalo en Firebase Console → Functions → Editar código fuente

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Configuration, OpenAIApi } = require('openai');

admin.initializeApp();
const db = admin.firestore();

// Configuración del cliente Deepseek
const DEEPSEEK_API_KEY = 'sk-97c8f4c543fa45acabaf02ebcac60f03';
const deepseekConfig = new Configuration({
    apiKey: DEEPSEEK_API_KEY,
    basePath: "https://api.deepseek.com/v1"
});
const deepseekApi = new OpenAIApi(deepseekConfig);

// Traducciones
const translations = {
    es: {
        role: "Eres un experto coach en creación de contenido para redes sociales.",
        strictInstructions: "Ideas listas para copiar y publicar. Incluir suficientes emojis equilibrados. Seguir formato:",
        ideaFormat: "---IDEA_N---\nGancho Verbal Impactante: [...]\nTexto del Post: [...]\nHashtags: [...]\nLlamada a la Acción (CTA): [...]\nFormato Visual Sugerido: [...]\n---FIN_IDEA_N---",
        finalPhrase: "---FRASE_FINAL---\n[Frase Motivadora]\n---FIN_FRASE_FINAL---",
        multiPlatform: (platforms) => `Genera 1 idea para cada red social seleccionada: ${platforms.join(', ')}.`,
        singlePlatform: (platform) => `Genera 3 ideas distintas para la red social: ${platform}.`,
        copyType: "Tipo de Copy: ",
        copyDescription: "Descripción: "
    }
};

// Función principal
exports.api = functions.https.onCall(async (data, context) => {
    try {
        // Verificar autenticación
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuario debe estar autenticado');
        }

        const { generationMode, socialMedia, keyword, copyType, language = 'es' } = data;
        const userId = context.auth.uid;

        // Verificar configuración de la app
        const appConfigDoc = await db.collection('appConfig').doc('config').get();
        const appConfig = appConfigDoc.exists ? appConfigDoc.data() : {};

        // Verificar usuario
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Verificar si es premium
        const isPremium = userData.isPremium || appConfig.isPremiumGlobalActive || appConfig.isLaunchPromoActive;

        // Verificar créditos si no es premium
        if (!isPremium && userData.generationCredits <= 0) {
            throw new functions.https.HttpsError('permission-denied', 'Sin créditos disponibles');
        }

        // Construir prompt
        const t = translations[language] || translations.es;
        const modeText = generationMode === 'multi' 
            ? t.multiPlatform(socialMedia)
            : t.singlePlatform(socialMedia[0]);

        const prompt = `${t.role}

${t.strictInstructions}

${t.ideaFormat}

${modeText}

${t.copyType}${copyType}
Palabra clave: ${keyword}

Idioma de respuesta: ${language === 'es' ? 'Español' : language === 'en' ? 'English' : 'Português'}

Responde SOLO con las ideas en el formato especificado, sin explicaciones adicionales.`;

        // Llamar a Deepseek
        const response = await deepseekApi.createChatCompletion({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
            temperature: 0.7
        });

        const rawContent = response.data.choices[0].message.content;

        // Procesar respuesta (simplificado)
        const ideas = [];
        const ideaRegex = /---IDEA_(\d+)---(.*?)---FIN_IDEA_\d+---/gs;
        let match;

        while ((match = ideaRegex.exec(rawContent)) !== null) {
            const ideaContent = match[2].trim();
            const lines = ideaContent.split('\n').filter(line => line.trim());
            
            const idea = {
                socialMedia: generationMode === 'multi' ? socialMedia[ideas.length] || socialMedia[0] : socialMedia[0],
                hook: extractField(lines, 'Gancho Verbal Impactante') || extractField(lines, 'Impactful Verbal Hook') || '',
                postText: extractField(lines, 'Texto del Post') || extractField(lines, 'Post Text') || '',
                hashtags: extractHashtags(extractField(lines, 'Hashtags') || ''),
                cta: extractField(lines, 'Llamada a la Acción') || extractField(lines, 'Call to Action') || '',
                visualFormat: extractField(lines, 'Formato Visual Sugerido') || extractField(lines, 'Suggested Visual Format') || ''
            };
            ideas.push(idea);
        }

        // Descontar crédito si no es premium
        if (!isPremium) {
            await db.collection('users').doc(userId).update({
                generationCredits: admin.firestore.FieldValue.increment(-1)
            });
        }

        return { success: true, ideas };

    } catch (error) {
        console.error('Error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Funciones auxiliares
function extractField(lines, fieldName) {
    const line = lines.find(l => l.includes(fieldName + ':'));
    return line ? line.split(':').slice(1).join(':').trim() : '';
}

function extractHashtags(hashtagsText) {
    if (!hashtagsText) return [];
    return hashtagsText.split(/[\s,]+/).filter(tag => tag.startsWith('#')).slice(0, 5);
}
