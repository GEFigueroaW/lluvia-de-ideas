const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Importar funciones de admin
const { initializeAppConfig, getAdminStats, isUserAdmin } = require('./admin');

// Exportar funciones de admin
exports.initializeAppConfig = initializeAppConfig;
exports.getAdminStats = getAdminStats;
exports.isUserAdmin = isUserAdmin;

// Configuración de Deepseek API
const DEEPSEEK_API_KEY = 'sk-97c8f4c543fa45acabaf02ebcac60f03';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

// Objeto de traducciones para el prompt
const translations = {
    es: {
        role: "Eres un experto coach en creación de contenido para redes sociales.",
        strictInstructions: "Ideas listas para copiar y publicar. Incluir suficientes emojis equilibrados. Seguir formato:",
        ideaFormat: "---IDEA_N---\nGancho Verbal Impactante: [...]\nTexto del Post: [...]\nHashtags: [...]\nLlamada a la Acción (CTA): [...]\nFormato Visual Sugerido: [...]\n---FIN_IDEA_N---",
        finalPhrase: "---FRASE_FINAL---\n[Frase Motivadora]\n---FIN_FRASE_FINAL---",
        multiPlatform: (platforms) => `Genera 1 idea para cada red social seleccionada: ${platforms.join(', ')}.`,
        singlePlatform: (platform) => `Genera 3 ideas distintas para la red social: ${platform}.`,
        example: "Ejemplo concreto de la respuesta esperada: Generar una idea para Facebook con el copy de 'Informativo o educativo'. El post debe ser sobre 'Cómo la IA puede ayudar a los pequeños negocios'. La respuesta debe ser en español. La respuesta de Deepseek debe ser un texto plano con el formato exactamente como se especifica.",
        copyType: "Tipo de Copy: ",
        copyDescription: "Descripción: "
    },
    en: {
        role: "You are an expert content creation coach for social media.",
        strictInstructions: "Ideas ready to copy and publish. Include balanced emojis. Follow this format:",
        ideaFormat: "---IDEA_N---\nImpactful Verbal Hook: [...]\nPost Text: [...]\nHashtags: [...]\nCall to Action (CTA): [...]\nSuggested Visual Format: [...]\n---FIN_IDEA_N---",
        finalPhrase: "---FRASE_FINAL---\n[Motivational Phrase]\n---FIN_FRASE_FINAL---",
        multiPlatform: (platforms) => `Generate 1 idea for each selected social network: ${platforms.join(', ')}.`,
        singlePlatform: (platform) => `Generate 3 distinct ideas for the social network: ${platform}.`,
        example: "Concrete example of the expected response: Generate one idea for Facebook with the 'Informative or educational' copy type. The post should be about 'How AI can help small businesses'. The response must be in English. The Deepseek response must be plain text with the format exactly as specified.",
        copyType: "Copy Type: ",
        copyDescription: "Description: "
    },
    pt: {
        role: "Você é um coach especialista em criação de conteúdo para redes sociais.",
        strictInstructions: "Ideias prontas para copiar e publicar. Inclua emojis equilibrados suficientes. Siga este formato:",
        ideaFormat: "---IDEA_N---\nGatilho Verbal Impactante: [...]\nTexto do Post: [...]\nHashtags: [...]\nChamada para Ação (CTA): [...]\nFormato Visual Sugerido: [...]\n---FIN_IDEA_N---",
        finalPhrase: "---FRASE_FINAL---\n[Frase Motivacional]\n---FIN_FRASE_FINAL---",
        multiPlatform: (platforms) => `Gere 1 ideia para cada rede social selecionada: ${platforms.join(', ')}.`,
        singlePlatform: (platform) => `Gere 3 ideias distintas para a rede social: ${platform}.`,
        example: "Exemplo concreto da resposta esperada: Gerar uma ideia para o Facebook com o tipo de copy 'Informativo ou educativo'. O post deve ser sobre 'Como a IA pode ajudar pequenas empresas'. A resposta deve ser em português. A resposta do Deepseek deve ser texto simples com o formato exatamente como especificado.",
        copyType: "Tipo de Copy: ",
        copyDescription: "Descrição: "
    }
};

const copyTypes = [
    { name: "De beneficio o solución", desc: "Cómo el producto mejora la vida del cliente." },
    { name: "De novedad o lanzamiento", desc: "Anuncia algo nuevo para atraer atención inmediata." },
    { name: "De interacción o pregunta", desc: "Diseñado para generar respuestas de la audiencia." },
    { name: "De urgencia o escasez", desc: "Genera sensación de urgencia para actuar." },
    { name: "Informativo o educativo", desc: "Comparte conocimiento útil." },
    { name: "Informal", desc: "Tono casual, cercano." },
    { name: "Llamada a la acción (CTA)", desc: "Motiva acción directa (comprar, registrarse)." },
    { name: "Narrativo o storytelling", desc: "Cuenta una historia emocional." },
    { name: "Posicionamiento o branding", desc: "Refuerza imagen de marca." },
    { name: "Testimonio o prueba social", desc: "Muestra experiencias positivas de otros usuarios." },
    { name: "Técnico o profesional", desc: "Información especializada o técnica." },
    { name: "Venta directa o persuasivo", desc: "Convencimiento directo para cerrar ventas." }
];

exports.api = functions.https.onCall(async (data, context) => {
    // 1. Autenticación y Validación de Sesión
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const { generationMode, socialMedia, keyword, copyType, language } = data;

    if (!socialMedia || !keyword || !copyType) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
    }

    const t = translations[language] || translations.es;
    
    const userRef = db.collection('users').doc(uid);
    const appConfigRef = db.collection('appConfig').doc('config');
    const userDoc = await userRef.get();
    const appConfigDoc = await appConfigRef.get();
    const userData = userDoc.data();
    const appConfigData = appConfigDoc.data() || {};

    // 2. Evaluación de Estado Premium
    const isEffectivePremium = userData.isPremium || appConfigData.isPremiumGlobalActive || appConfigData.isLaunchPromoActive;

    // 3. Validación de Límites (solo para usuarios no premium efectivos)
    if (!isEffectivePremium) {
        const lastGenerationDate = userData.lastGenerationDate ? userData.lastGenerationDate.toDate() : new Date(0);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        if (lastGenerationDate < oneWeekAgo) {
            await userRef.update({ generationCredits: 3, lastGenerationDate: admin.firestore.Timestamp.now() });
            userData.generationCredits = 3;
        }
        
        if (userData.generationCredits <= 0) {
            throw new functions.https.HttpsError('failed-precondition', 'You have exhausted your weekly generation credits.');
        }
        
        // Validación de redes y copy types para usuarios gratuitos
        const allowedSocial = ["Facebook"];
        if (socialMedia.some(s => !allowedSocial.includes(s))) {
            throw new functions.https.HttpsError('permission-denied', 'Free users can only generate ideas for Facebook.');
        }

        const allowedCopyTypes = ["Informativo o educativo", "Informal", "Técnico o profesional"];
        if (!allowedCopyTypes.includes(copyType)) {
            throw new functions.https.HttpsError('permission-denied', 'Free users can only select specific copy types.');
        }
    }
    
    // 4. Construcción del Prompt
    const copyTypeDesc = copyTypes.find(c => c.name === copyType).desc;
    let instructionMode = '';
    if (generationMode === 'multi') {
        instructionMode = t.multiPlatform(socialMedia);
    } else {
        instructionMode = t.singlePlatform(socialMedia[0]);
    }

    const prompt = `${t.role} ${t.strictInstructions}
${t.ideaFormat}
${t.finalPhrase}

${instructionMode}
Palabra clave / tema central: ${keyword}
${t.copyType}${copyType}
${t.copyDescription}${copyTypeDesc}

El contenido generado siempre debe estar en ${language === 'es' ? 'español' : language === 'en' ? 'inglés' : 'portugués'}.`;

    try {
        console.log('Enviando prompt a Deepseek:', prompt);
        
        const response = await axios.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
            model: "deepseek-chat",
            messages: [
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 segundos timeout
        });

        console.log('Respuesta de Deepseek recibida:', response.data);

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Respuesta inválida de Deepseek API');
        }

        const rawText = response.data.choices[0].message.content;
        console.log('Texto raw de Deepseek:', rawText);
        
        const parsedIdeas = parseDeepseekResponse(rawText);
        console.log('Ideas parseadas:', parsedIdeas);

        if (parsedIdeas.length === 0) {
            // Si no se pudieron parsear las ideas, crear una respuesta de fallback
            parsedIdeas.push({
                hook: "Ideas generadas por IA",
                postText: rawText.substring(0, 500) + (rawText.length > 500 ? '...' : ''),
                hashtags: ['#contenido', '#redessociales', '#marketing'],
                cta: "¡Únete a la conversación!",
                visualFormat: "Imagen llamativa con texto superpuesto"
            });
        }

        // 5. Actualización de la base de datos
        await userRef.update({
            generationCredits: isEffectivePremium ? userData.generationCredits : userData.generationCredits - 1,
            lastGenerationDate: admin.firestore.Timestamp.now()
        });

        await db.collection('generations').add({
            userId: uid,
            timestamp: admin.firestore.Timestamp.now(),
            generationDetails: { generationMode, socialMedia, keyword, copyType },
            results: parsedIdeas
        });

        return { success: true, ideas: parsedIdeas };

    } catch (error) {
        console.error("Error completo al llamar a Deepseek API:", error);
        
        // Log más detallado del error
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
            console.error("Error request:", error.request);
        } else {
            console.error("Error message:", error.message);
        }
        
        throw new functions.https.HttpsError('internal', `Error generating ideas with Deepseek: ${error.message}`);
    }
});

// Función para parsear la respuesta de Deepseek
function parseDeepseekResponse(text) {
    console.log('Parseando respuesta de Deepseek:', text);
    
    const ideas = [];
    
    // Patrones más flexibles para capturar las ideas
    const ideaPattern = /---IDEA_(\d+)---\s*(?:Gancho Verbal Impactante|Hook|Gancho):\s*(.*?)\s*(?:Texto del Post|Post Text|Texto):\s*(.*?)\s*(?:Hashtags):\s*(.*?)\s*(?:Llamada a la Acción|CTA|Call to Action).*?:\s*(.*?)\s*(?:Formato Visual Sugerido|Visual Format|Visual).*?:\s*(.*?)\s*---FIN_IDEA_\d+---/gis;
    
    const finalPhrasePattern = /---FRASE_FINAL---\s*(.*?)\s*---FIN_FRASE_FINAL---/s;
    
    let match;
    while ((match = ideaPattern.exec(text)) !== null) {
        ideas.push({
            hook: match[2].trim(),
            postText: match[3].trim(),
            hashtags: match[4].split(/\s+/).filter(tag => tag.startsWith('#') || tag.trim().length > 0),
            cta: match[5].trim(),
            visualFormat: match[6].trim()
        });
    }

    // Si no se encontraron ideas con el patrón estructurado, intentar parsing alternativo
    if (ideas.length === 0) {
        console.log('No se encontraron ideas con patrón estructurado, intentando parsing alternativo...');
        
        // Dividir por líneas y buscar contenido útil
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        let currentIdea = {};
        let ideaCount = 0;
        
        for (const line of lines) {
            const cleanLine = line.trim();
            
            if (cleanLine.includes('Gancho') || cleanLine.includes('Hook')) {
                if (Object.keys(currentIdea).length > 0) {
                    ideas.push(currentIdea);
                    currentIdea = {};
                }
                currentIdea.hook = cleanLine.split(':').slice(1).join(':').trim() || cleanLine;
            } else if (cleanLine.includes('Texto') || cleanLine.includes('Post')) {
                currentIdea.postText = cleanLine.split(':').slice(1).join(':').trim() || cleanLine;
            } else if (cleanLine.includes('#') && cleanLine.includes('Hashtag')) {
                const hashtags = cleanLine.split(':').slice(1).join(':').match(/#\w+/g) || [];
                currentIdea.hashtags = hashtags;
            } else if (cleanLine.includes('CTA') || cleanLine.includes('Acción')) {
                currentIdea.cta = cleanLine.split(':').slice(1).join(':').trim() || cleanLine;
            } else if (cleanLine.includes('Visual') || cleanLine.includes('Formato')) {
                currentIdea.visualFormat = cleanLine.split(':').slice(1).join(':').trim() || cleanLine;
            }
        }
        
        // Agregar la última idea si existe
        if (Object.keys(currentIdea).length > 0) {
            ideas.push(currentIdea);
        }
        
        // Si aún no hay ideas, crear una idea básica con todo el texto
        if (ideas.length === 0) {
            const chunks = text.split('\n\n').filter(chunk => chunk.trim().length > 20);
            
            for (let i = 0; i < Math.min(chunks.length, 3); i++) {
                ideas.push({
                    hook: `Idea ${i + 1}: Ideas generadas`,
                    postText: chunks[i].trim(),
                    hashtags: ['#contenido', '#redessociales', '#marketing'],
                    cta: '¡Únete a la conversación!',
                    visualFormat: 'Imagen atractiva con texto superpuesto'
                });
            }
        }
    }

    // Buscar frase final
    const finalPhraseMatch = text.match(finalPhrasePattern);
    const finalQuote = finalPhraseMatch ? finalPhraseMatch[1].trim() : "¡Sigue creando contenido increíble!";

    if (ideas.length > 0) {
        ideas[0].finalQuote = finalQuote;
    }

    console.log('Ideas parseadas finales:', ideas);
    return ideas;
}

// Funciones de administración (solo para usuarios con rol de admin)
exports.setPremiumGlobalStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
    }

    const { isPremiumGlobalActive, premiumGlobalEndDate, isLaunchPromoActive } = data;
    const updateData = {
        isPremiumGlobalActive: isPremiumGlobalActive !== undefined ? isPremiumGlobalActive : false,
        premiumGlobalEndDate: premiumGlobalEndDate ? admin.firestore.Timestamp.fromDate(new Date(premiumGlobalEndDate)) : null,
        isLaunchPromoActive: isLaunchPromoActive !== undefined ? isLaunchPromoActive : false
    };

    await db.collection('appConfig').doc('config').set(updateData, { merge: true });
    return { success: true, message: 'App configuration updated successfully.' };
});
