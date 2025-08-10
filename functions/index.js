const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Configuración de Deepseek API
const DEEPSEEK_API_KEY = 'sk-97c8f4c543fa45acabaf02ebcac60f03';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

console.log('[INIT] Deepseek API configurado correctamente');

// FUNCIÓN PRINCIPAL DE API - ULTRA OPTIMIZADA
exports.api = functions.runWith({
    timeoutSeconds: 300,
    memory: '1GB'
}).https.onCall(async (data, context) => {
    console.log('[API] ⚡ INICIO OPTIMIZADO');
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { generationMode, socialMedia, keyword, copyType, language } = data;
    const uid = context.auth.uid;

    try {
        // 1. Validación de usuario
        console.log('[API] Validando usuario...');
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();
        const hasCredits = userData.generationCredits > 0 || userData.isPremium;
        
        if (!hasCredits) {
            throw new functions.https.HttpsError('permission-denied', 'No credits available');
        }

        // 2. Prompt ultra-simple
        console.log('[API] Creando prompt...');
        const platform = Array.isArray(socialMedia) ? socialMedia[0] : socialMedia;
        const ideaCount = generationMode === 'multi' ? '1 idea' : '2 ideas';
        
        const prompt = `Crea ${ideaCount} para ${platform} sobre "${keyword}" en ${language || 'español'}.

Formato EXACTO:
---IDEA_1---
Texto: [post completo para redes sociales]
Hashtags: [5 hashtags relevantes]
CTA: [llamada a acción clara]
---FIN_IDEA_1---

Responde SOLO en ese formato. Sé breve y directo.`;

        console.log('[API] Prompt:', prompt.length, 'chars');

        // 3. Llamada a Deepseek
        console.log('[API] Llamando Deepseek...');
        const response = await callDeepseekAPI(prompt);
        console.log('[API] ✅ Respuesta obtenida');

        // 4. Parse
        const ideas = parseResponse(response);
        console.log('[API] ✅ Ideas parseadas:', ideas.length);

        // 5. Actualizar usuario
        await userRef.update({
            generationCredits: userData.isPremium ? userData.generationCredits : Math.max(0, userData.generationCredits - 1),
            lastGenerationDate: admin.firestore.Timestamp.now()
        });

        console.log('[API] ✅ COMPLETADO');
        return { success: true, ideas };

    } catch (error) {
        console.error('[API] ❌ ERROR:', error.message);
        throw new functions.https.HttpsError('internal', `Error: ${error.message}`);
    }
});

// FUNCIÓN DEEPSEEK
async function callDeepseekAPI(prompt) {
    console.log('[DEEPSEEK] Llamada...');
    
    try {
        const response = await axios({
            method: 'POST',
            url: `${DEEPSEEK_BASE_URL}/chat/completions`,
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
                max_tokens: 500,
                stream: false
            },
            timeout: 20000
        });
        
        console.log('[DEEPSEEK] ✅ Status:', response.status);
        return response.data?.choices?.[0]?.message?.content || '';
        
    } catch (error) {
        console.error('[DEEPSEEK] ❌ Error:', error.message);
        throw new Error(`Deepseek error: ${error.message}`);
    }
}

// PARSER
function parseResponse(text) {
    console.log('[PARSER] Parsing...');
    
    if (!text?.trim()) {
        return [createFallbackIdea()];
    }
    
    const ideas = [];
    const pattern = /---IDEA_(\d+)---\s*Texto:\s*(.*?)\s*Hashtags:\s*(.*?)\s*CTA:\s*(.*?)\s*---FIN_IDEA_\d+---/gis;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
        const idea = {
            hook: match[2]?.substring(0, 50) || 'Hook',
            postText: match[2] || '',
            hashtags: (match[3] || '').split(/[,\s#]+/).filter(h => h.length > 0).slice(0, 5),
            cta: match[4] || 'Interactúa',
            visualFormat: 'Imagen atractiva'
        };
        
        if (idea.postText.length > 10) {
            ideas.push(idea);
        }
    }
    
    if (ideas.length === 0) {
        ideas.push(createFallbackIdea());
    }
    
    console.log('[PARSER] ✅ Ideas:', ideas.length);
    return ideas;
}

// IDEA FALLBACK
function createFallbackIdea() {
    return {
        hook: '¡Contenido interesante!',
        postText: 'Contenido de copywriting generado para tus redes sociales.',
        hashtags: ['contenido', 'marketing', 'redes'],
        cta: 'Comparte si te gustó',
        visualFormat: 'Imagen llamativa'
    };
}

// TEST
exports.testDeepseekConnection = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    try {
        console.log('[TEST] Probando...');
        
        const response = await axios({
            method: 'POST',
            url: `${DEEPSEEK_BASE_URL}/chat/completions`,
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: "deepseek-chat",
                messages: [{ role: "user", content: "Responde: OK" }],
                max_tokens: 10
            },
            timeout: 10000
        });

        console.log('[TEST] ✅ Éxito');
        return { 
            success: true, 
            status: response.status,
            message: response.data.choices[0].message.content
        };

    } catch (error) {
        console.error('[TEST] ❌ Error:', error.message);
        throw new functions.https.HttpsError('internal', `Test failed: ${error.message}`);
    }
});
