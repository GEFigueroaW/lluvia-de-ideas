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
    const startTime = Date.now();
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const { generationMode, socialMedia, keyword, copyType, language } = data;
    const uid = context.auth.uid;

    try {
        // PARALELO: Validación + Prompt + API simultáneos
        const userRef = db.collection('users').doc(uid);
        const platform = Array.isArray(socialMedia) ? socialMedia[0] : socialMedia;
        const ideaCount = generationMode === 'multi' ? '1 idea' : '2 ideas';
        
        // Prompt ultra-compacto
        const prompt = `${ideaCount} para ${platform}: "${keyword}" (${language || 'es'})

FORMATO:
---IDEA_1---
Texto: [post completo]
Hashtags: [5 hashtags]
CTA: [acción]
---FIN_IDEA_1---

RESPUESTA DIRECTA.`;

        // PARALELO: Validar usuario Y llamar API simultáneamente
        const [userDoc, deepseekResponse] = await Promise.all([
            userRef.get(),
            callDeepseekAPI(prompt)
        ]);
        
        // Validación rápida
        const userData = userDoc.data();
        if (!userDoc.exists || !(userData.generationCredits > 0 || userData.isPremium)) {
            throw new functions.https.HttpsError('permission-denied', 'No access');
        }

        // Parse y respuesta inmediata
        const ideas = parseResponse(deepseekResponse);

        // Actualizar usuario en background (no bloquear)
        userRef.update({
            generationCredits: userData.isPremium ? userData.generationCredits : Math.max(0, userData.generationCredits - 1),
            lastGenerationDate: admin.firestore.Timestamp.now()
        }).catch(() => {}); // Ignorar errores para no bloquear

        const totalTime = Date.now() - startTime;
        console.log(`[API] ✅ Completado en ${totalTime}ms`);
        return { success: true, ideas };

    } catch (error) {
        console.error('[API] ❌ ERROR:', error.message);
        throw new functions.https.HttpsError('internal', `Error: ${error.message}`);
    }
});

// FUNCIÓN DEEPSEEK ULTRA-RÁPIDA
async function callDeepseekAPI(prompt) {
    const startTime = Date.now();
    console.log('[DEEPSEEK] 🚀 Llamada ULTRA-RÁPIDA...');
    
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
                temperature: 0.3, // Reducido para respuestas más rápidas y consistentes
                max_tokens: 400, // Reducido para velocidad
                stream: false,
                top_p: 0.9, // Optimizado para velocidad
                frequency_penalty: 0,
                presence_penalty: 0
            },
            timeout: 10000, // Reducido a 10 segundos máximo
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
                'Connection': 'close' // Evitar keep-alive para reducir latencia
            }
        });
        
        const duration = Date.now() - startTime;
        console.log(`[DEEPSEEK] ✅ Respuesta en ${duration}ms`);
        return response.data?.choices?.[0]?.message?.content || '';
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[DEEPSEEK] ❌ Error en ${duration}ms:`, error.message);
        throw new Error(`API timeout en ${duration}ms: ${error.message}`);
    }
}

// PARSER ULTRA-EFICIENTE
function parseResponse(text) {
    console.log('[PARSER] 🚀 Parse rápido...');
    
    if (!text?.trim()) {
        return [createFallbackIdea()];
    }
    
    const ideas = [];
    
    // Regex optimizada para velocidad máxima
    const matches = text.matchAll(/---IDEA_\d+---\s*Texto:\s*([^-]+?)\s*Hashtags:\s*([^-]+?)\s*CTA:\s*([^-]+?)\s*---FIN_IDEA_\d+---/gi);
    
    for (const match of matches) {
        const postText = match[1]?.trim();
        if (postText && postText.length > 10) {
            ideas.push({
                hook: postText.substring(0, 50) + (postText.length > 50 ? '...' : ''),
                postText: postText,
                hashtags: match[2]?.split(/[,\s#]+/).filter(h => h.length > 1).slice(0, 5) || ['contenido'],
                cta: match[3]?.trim() || 'Interactúa',
                visualFormat: 'Imagen atractiva'
            });
        }
    }
    
    // Fallback inmediato si no hay ideas
    if (ideas.length === 0) {
        ideas.push(createFallbackIdea());
    }
    
    console.log(`[PARSER] ✅ ${ideas.length} ideas en modo rápido`);
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

// TEST DE VELOCIDAD
exports.testSpeed = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const startTime = Date.now();
    console.log('[SPEED_TEST] 🚀 Iniciando test de velocidad...');

    try {
        // Test con prompt minimalista
        const testPrompt = `1 idea Instagram: "marketing" (es)

---IDEA_1---
Texto: [post]
Hashtags: [hashtags]
CTA: [cta]
---FIN_IDEA_1---`;

        const apiStart = Date.now();
        const response = await callDeepseekAPI(testPrompt);
        const apiTime = Date.now() - apiStart;

        const parseStart = Date.now();
        const ideas = parseResponse(response);
        const parseTime = Date.now() - parseStart;

        const totalTime = Date.now() - startTime;

        console.log(`[SPEED_TEST] ✅ Completado en ${totalTime}ms`);
        
        return { 
            success: true, 
            timing: {
                total: totalTime,
                api: apiTime,
                parse: parseTime
            },
            ideas: ideas.length,
            message: `Generación completada en ${totalTime}ms`
        };

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`[SPEED_TEST] ❌ Error en ${totalTime}ms:`, error.message);
        throw new functions.https.HttpsError('internal', `Speed test failed in ${totalTime}ms: ${error.message}`);
    }
});

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
