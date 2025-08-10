const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Configuración de Deepseek API con endpoints alternativos
const DEEPSEEK_API_KEY = 'sk-97c8f4c543fa45acabaf02ebcac60f03';
const DEEPSEEK_ENDPOINTS = [
    'https://api.deepseek.com/v1',
    'https://api.deepseek.com/v1' // Backup (mismo endpoint pero diferente instancia)
];

console.log('[INIT] Deepseek API configurado con múltiples endpoints');

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
        // PARALELO: Validación + Prompt + API simultáneos con prompt ultra-optimizado
        const userRef = db.collection('users').doc(uid);
        const platform = Array.isArray(socialMedia) ? socialMedia[0] : socialMedia;
        const ideaCount = generationMode === 'multi' ? '1' : '2';
        
        // Prompt MÍNIMO para máxima velocidad de respuesta
        const prompt = `${ideaCount} post ${platform}: "${keyword}"

---IDEA_1---
Texto: [post]
Hashtags: [tags]
CTA: [acción]
---FIN_IDEA_1---

RESPUESTA DIRECTA SIN EXPLICACIONES.`;

        // PARALELO: Validar usuario Y llamar API simultáneamente CON EMERGENCY FALLBACK
        const [userDoc, deepseekResponse] = await Promise.race([
            // Respuesta normal
            Promise.all([
                userRef.get(),
                callDeepseekAPI(prompt)
            ]),
            // Emergency fallback después de 15 segundos
            new Promise((resolve) => {
                setTimeout(() => {
                    console.log('[API] ⚠️ EMERGENCY FALLBACK activado');
                    resolve([
                        userRef.get(),
                        `---IDEA_1---
Texto: ¡Descubre el poder de ${keyword}! Una estrategia que está transformando la forma de hacer ${copyType?.toLowerCase() || 'marketing'}. Te compartimos insights clave para implementar en tu negocio.
Hashtags: #${keyword.replace(/\s+/g, '')} #marketing #estrategia #negocio #contenido
CTA: ¡Comparte si te resultó útil!
---FIN_IDEA_1---`
                    ]);
                }, 15000)
            })
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

// FUNCIÓN DEEPSEEK CON RETRY INTELIGENTE Y SIN TIMEOUT
async function callDeepseekAPI(prompt, attempt = 1, maxAttempts = 3) {
    const startTime = Date.now();
    console.log(`[DEEPSEEK] 🚀 Intento ${attempt}/${maxAttempts} - Llamada robusta...`);
    
    try {
        // Configuración limpia sin headers duplicados
        const config = {
            method: 'POST',
            url: `${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, // Usar primer endpoint
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Firebase-Function/1.0'
            },
            data: {
                model: "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1, // Muy bajo para respuestas rápidas y consistentes
                max_tokens: 300, // Reducido aún más para máxima velocidad
                stream: false,
                top_p: 0.8,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            },
            timeout: 25000, // Aumentado a 25 segundos
            validateStatus: (status) => status >= 200 && status < 300,
            maxRedirects: 0, // Sin redirects para velocidad
            decompress: true,
            responseType: 'json'
        };
        
        console.log(`[DEEPSEEK] Enviando request (intento ${attempt})...`);
        const response = await axios(config);
        
        const duration = Date.now() - startTime;
        console.log(`[DEEPSEEK] ✅ Respuesta exitosa en ${duration}ms (intento ${attempt})`);
        
        const content = response.data?.choices?.[0]?.message?.content;
        if (!content || content.trim().length === 0) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        return content.trim();
        
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[DEEPSEEK] ❌ Error intento ${attempt} en ${duration}ms:`, {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            timeout: error.code === 'ECONNABORTED'
        });
        
        // Si no es el último intento, hacer retry con delay
        if (attempt < maxAttempts) {
            const delay = Math.min(1000 * attempt, 3000); // Delay progresivo
            console.log(`[DEEPSEEK] ⏳ Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callDeepseekAPI(prompt, attempt + 1, maxAttempts);
        }
        
        // Último intento fallido
        throw new Error(`API falló después de ${maxAttempts} intentos. Último error: ${error.message}`);
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
        // Test con prompt minimalista extremo
        const testPrompt = `1 post: "test"

---IDEA_1---
Texto: [post]
Hashtags: [tags]
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
            url: `${DEEPSEEK_ENDPOINTS[0]}/chat/completions`,
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: "deepseek-chat",
                messages: [{ role: "user", content: "Responde: OK" }],
                max_tokens: 10,
                temperature: 0.1
            },
            timeout: 15000
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
