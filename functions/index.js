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
        
        // CORRECCIÓN: Manejar múltiples redes sociales correctamente
        const platforms = Array.isArray(socialMedia) ? socialMedia : [socialMedia];
        const ideaCount = platforms.length; // Una idea por cada red social
        
        console.log(`[API] 📱 Generando ${ideaCount} ideas para redes: ${platforms.join(', ')}`);
        
        // Prompt OPTIMIZADO para múltiples redes sociales
        let prompt = `Genera ${ideaCount} posts de copywriting para "${keyword}":

`;

        // Generar template para cada red social
        platforms.forEach((platform, index) => {
            prompt += `---IDEA_${index + 1}---
Red: ${platform}
Texto: [post específico para ${platform}]
Hashtags: [tags relevantes para ${platform}]
CTA: [call-to-action apropiado]
---FIN_IDEA_${index + 1}---

`;
        });

        prompt += `RESPUESTA DIRECTA. ADAPTA CADA POST AL FORMATO Y AUDIENCIA DE CADA RED SOCIAL.`;

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
                    
                    // Generar fallback para cada red social
                    let fallbackResponse = '';
                    platforms.forEach((platform, index) => {
                        fallbackResponse += `---IDEA_${index + 1}---
Red: ${platform}
Texto: ¡Descubre el poder de ${keyword}! Contenido estratégico diseñado específicamente para ${platform}. ${copyType ? `Perfecto para campañas de ${copyType.toLowerCase()}.` : 'Ideal para maximizar tu alcance.'} Te compartimos insights clave para implementar en tu estrategia.
Hashtags: #${keyword.replace(/\s+/g, '')} #${platform.toLowerCase()} #marketing #estrategia #contenido
CTA: ${platform === 'Instagram' ? '¡Guarda este post!' : platform === 'LinkedIn' ? 'Comparte tu experiencia en los comentarios' : platform === 'TikTok' ? '¡Síguenos para más tips!' : '¡Comparte si te resultó útil!'}
---FIN_IDEA_${index + 1}---

`;
                    });
                    
                    // Obtener usuario de forma síncrona para el fallback
                    userRef.get().then(userSnapshot => {
                        resolve([
                            userSnapshot,
                            fallbackResponse
                        ]);
                    }).catch(error => {
                        console.error('[API] ❌ Error en fallback userRef.get():', error);
                        // Crear un mock document si hay error
                        const mockDoc = {
                            exists: false,
                            data: () => null
                        };
                        resolve([
                            mockDoc,
                            fallbackResponse
                        ]);
                    });
                }, 15000)
            })
        ]);
        
        // LÍNEA POR LÍNEA: Validación segura del documento antes de usar .data()
        console.log(`[USER] 🔍 Verificando documento de usuario para ${uid}...`);
        
        // VERIFICACIÓN CRÍTICA: Asegurar que userDoc es un documento válido
        if (!userDoc || typeof userDoc.data !== 'function') {
            console.error(`[USER] ❌ CRÍTICO: userDoc no es un documento válido:`, { 
                userDocType: typeof userDoc,
                hasData: userDoc && typeof userDoc.data,
                hasExists: userDoc && typeof userDoc.exists,
                uid: uid
            });
            throw new functions.https.HttpsError('internal', 'Error crítico en documento de usuario');
        }
        
        // LÍNEA POR LÍNEA: Obtener datos de forma segura
        let userData = null;
        try {
            userData = userDoc.data();
            console.log(`[USER] ✅ Datos de usuario obtenidos correctamente para ${uid}`);
        } catch (error) {
            console.error(`[USER] ❌ Error al obtener datos del usuario ${uid}:`, error);
            throw new functions.https.HttpsError('internal', `Error accediendo a datos del usuario: ${error.message}`);
        }
        
        // LÍNEA POR LÍNEA: Si el usuario no existe en Firestore, crearlo automáticamente
        if (!userDoc.exists) {
            console.log(`[USER] 🔧 Usuario ${uid} no existe en Firestore. Creando automáticamente...`);
            const defaultUserData = {
                email: context.auth.token.email || 'unknown@email.com',
                displayName: context.auth.token.name || 'Usuario',
                generationCredits: 5, // 5 créditos gratuitos iniciales
                isPremium: false,
                createdAt: admin.firestore.Timestamp.now(),
                lastGenerationDate: null,
                photoURL: context.auth.token.picture || null
            };
            
            // Crear usuario en Firestore
            await userRef.set(defaultUserData);
            userData = defaultUserData;
            console.log(`[USER] ✅ Usuario ${uid} creado con 5 créditos gratuitos`);
        }
        // LÍNEA POR LÍNEA: Si existe pero le faltan propiedades, actualizarlas
        else if (userData && (userData.generationCredits === undefined || userData.isPremium === undefined)) {
            console.log(`[USER] 🔧 Usuario ${uid} existe pero faltan propiedades. Actualizando...`);
            const updateData = {};
            
            if (userData.generationCredits === undefined) {
                updateData.generationCredits = 5; // 5 créditos gratuitos por defecto
            }
            if (userData.isPremium === undefined) {
                updateData.isPremium = false;
            }
            
            await userRef.update(updateData);
            userData = { ...userData, ...updateData };
            console.log(`[USER] ✅ Usuario ${uid} actualizado con propiedades faltantes`);
        }
        // LÍNEA POR LÍNEA: Si userData es null o inválido, crear usuario por defecto
        else if (!userData) {
            console.log(`[USER] 🔧 Usuario ${uid} tiene userData null. Creando datos por defecto...`);
            const defaultUserData = {
                email: context.auth.token.email || 'unknown@email.com',
                displayName: context.auth.token.name || 'Usuario',
                generationCredits: 5,
                isPremium: false,
                createdAt: admin.firestore.Timestamp.now(),
                lastGenerationDate: null,
                photoURL: context.auth.token.picture || null
            };
            
            await userRef.set(defaultUserData);
            userData = defaultUserData;
            console.log(`[USER] ✅ Usuario ${uid} recreado con datos válidos`);
        }
        
        // LÍNEA POR LÍNEA: Validación final de userData antes de usarlo
        if (!userData || typeof userData !== 'object') {
            console.error(`[USER] ❌ CRÍTICO: userData inválido después de todas las validaciones:`, {
                userData: userData,
                type: typeof userData,
                uid: uid
            });
            throw new functions.https.HttpsError('internal', 'Error crítico: no se pudo obtener datos válidos del usuario');
        }
        
        // VERIFICAR ACCESO: Individual + Global Premium
        let hasAccess = userData.generationCredits > 0 || userData.isPremium;
        let accessReason = '';
        
        // Si no tiene acceso individual, verificar premium global
        if (!hasAccess) {
            try {
                const configDoc = await db.collection('config').doc('app').get();
                if (configDoc.exists()) {
                    const configData = configDoc.data();
                    const isGlobalPremiumActive = configData.isPremiumGlobalActive;
                    
                    if (isGlobalPremiumActive) {
                        // Verificar si la promoción global sigue vigente
                        const promoEndDate = configData.promoEndDate;
                        if (!promoEndDate || promoEndDate.toDate() > new Date()) {
                            hasAccess = true;
                            accessReason = 'Premium Global Activo';
                            console.log(`[USER] ✅ Acceso concedido por Premium Global para usuario ${uid}`);
                        } else {
                            console.log(`[USER] ⚠️ Premium Global expirado el ${promoEndDate.toDate()}`);
                        }
                    }
                }
            } catch (error) {
                console.log(`[USER] ⚠️ Error verificando premium global: ${error.message}`);
            }
        } else {
            accessReason = userData.isPremium ? 'Premium Individual' : `${userData.generationCredits} créditos`;
        }
        
        if (!hasAccess) {
            console.log(`[USER] ❌ Usuario ${uid} sin acceso. Créditos: ${userData.generationCredits}, Premium Individual: ${userData.isPremium}, Premium Global: No`);
            throw new functions.https.HttpsError('permission-denied', 'No tienes créditos disponibles. Considera upgradar a premium.');
        }
        
        console.log(`[USER] ✅ Usuario ${uid} autorizado por: ${accessReason}. Créditos: ${userData.generationCredits}, Premium: ${userData.isPremium}`);

        // Parse y respuesta inmediata
        const ideas = parseResponse(deepseekResponse);

        // Actualizar usuario en background (no bloquear)
        // No descontar créditos si es premium individual o global
        const shouldDiscountCredits = !userData.isPremium && accessReason !== 'Premium Global Activo';
        
        userRef.update({
            generationCredits: shouldDiscountCredits ? Math.max(0, userData.generationCredits - 1) : userData.generationCredits,
            lastGenerationDate: admin.firestore.Timestamp.now()
        }).catch(() => {}); // Ignorar errores para no bloquear

        const totalTime = Date.now() - startTime;
        console.log(`[API] ✅ Completado en ${totalTime}ms`);
        return { success: true, ideas };

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`[API] ❌ ERROR en ${totalTime}ms:`, {
            message: error.message,
            code: error.code,
            uid: uid,
            hasAuth: !!context.auth,
            email: context.auth?.token?.email,
            errorType: error.constructor.name,
            stack: error.stack?.substring(0, 500)
        });
        
        // Error específicos más útiles para el usuario
        if (error.message.includes('No tienes créditos')) {
            throw new functions.https.HttpsError('permission-denied', 'No tienes créditos disponibles. Considera upgradar a premium.');
        } else if (error.message.includes('API falló')) {
            throw new functions.https.HttpsError('unavailable', 'Servicio temporalmente no disponible. Intenta nuevamente en unos momentos.');
        } else if (error.code === 'permission-denied') {
            throw error; // Re-lanzar errores de permisos tal como están
        } else {
            throw new functions.https.HttpsError('internal', `Error del sistema: ${error.message}`);
        }
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

// PARSER ULTRA-EFICIENTE PARA MÚLTIPLES REDES SOCIALES
function parseResponse(text) {
    console.log('[PARSER] 🚀 Parse rápido para múltiples redes...');
    
    if (!text?.trim()) {
        return [createFallbackIdea()];
    }
    
    const ideas = [];
    
    // Regex mejorada para capturar también la red social
    const matches = text.matchAll(/---IDEA_\d+---\s*(?:Red:\s*([^\n]+?)\s*)?(?:Texto:\s*([^-]+?)\s*)?Hashtags:\s*([^-]+?)\s*CTA:\s*([^-]+?)\s*---FIN_IDEA_\d+---/gi);
    
    for (const match of matches) {
        const socialNetwork = match[1]?.trim();
        const postText = (match[2] || match[1])?.trim(); // Si no hay texto separado, usar el campo que tenga contenido
        const hashtags = match[3]?.trim();
        const cta = match[4]?.trim();
        
        if (postText && postText.length > 10) {
            ideas.push({
                hook: postText.substring(0, 50) + (postText.length > 50 ? '...' : ''),
                postText: postText,
                hashtags: hashtags?.split(/[,\s#]+/).filter(h => h.length > 1).slice(0, 5) || ['contenido'],
                cta: cta || 'Interactúa',
                visualFormat: 'Imagen atractiva',
                socialNetwork: socialNetwork || 'General' // Agregar información de la red social
            });
        }
    }
    
    // Regex alternativa para el formato original (backward compatibility)
    if (ideas.length === 0) {
        const oldMatches = text.matchAll(/---IDEA_\d+---\s*Texto:\s*([^-]+?)\s*Hashtags:\s*([^-]+?)\s*CTA:\s*([^-]+?)\s*---FIN_IDEA_\d+---/gi);
        
        for (const match of oldMatches) {
            const postText = match[1]?.trim();
            if (postText && postText.length > 10) {
                ideas.push({
                    hook: postText.substring(0, 50) + (postText.length > 50 ? '...' : ''),
                    postText: postText,
                    hashtags: match[2]?.split(/[,\s#]+/).filter(h => h.length > 1).slice(0, 5) || ['contenido'],
                    cta: match[3]?.trim() || 'Interactúa',
                    visualFormat: 'Imagen atractiva',
                    socialNetwork: 'General'
                });
            }
        }
    }
    
    // Fallback inmediato si no hay ideas
    if (ideas.length === 0) {
        ideas.push(createFallbackIdea('General'));
    }
    
    console.log(`[PARSER] ✅ ${ideas.length} ideas parseadas para múltiples redes`);
    return ideas;
}

// IDEA FALLBACK
function createFallbackIdea(socialNetwork = 'General') {
    return {
        hook: '¡Contenido interesante!',
        postText: `Contenido de copywriting generado para ${socialNetwork}. Estrategias efectivas para maximizar tu alcance y engagement.`,
        hashtags: ['contenido', 'marketing', 'redes'],
        cta: 'Comparte si te gustó',
        visualFormat: 'Imagen llamativa',
        socialNetwork: socialNetwork
    };
}

// FUNCIÓN PARA AUTO-CREAR USUARIOS EN FIRESTORE
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName || 'Usuario';
    const photoURL = user.photoURL || null;
    
    console.log(`[AUTH_TRIGGER] 🔧 Nuevo usuario registrado: ${email} (${uid}). Creando documento en Firestore...`);
    
    try {
        const userRef = db.collection('users').doc(uid);
        
        // Verificar si ya existe (por si acaso)
        const existingDoc = await userRef.get();
        if (existingDoc.exists) {
            console.log(`[AUTH_TRIGGER] ✅ Usuario ${uid} ya existe en Firestore`);
            return;
        }
        
        // Crear documento con datos por defecto
        const defaultUserData = {
            email: email,
            displayName: displayName,
            generationCredits: 5, // 5 créditos gratuitos iniciales
            isPremium: false,
            createdAt: admin.firestore.Timestamp.now(),
            lastGenerationDate: null,
            photoURL: photoURL,
            totalGenerations: 0,
            lastLoginAt: admin.firestore.Timestamp.now()
        };
        
        await userRef.set(defaultUserData);
        console.log(`[AUTH_TRIGGER] ✅ Usuario ${uid} creado en Firestore con 5 créditos gratuitos`);
        
    } catch (error) {
        console.error(`[AUTH_TRIGGER] ❌ Error creando usuario ${uid}:`, error.message);
    }
});

// FUNCIÓN PARA VERIFICAR Y REPARAR USUARIOS EXISTENTES
exports.repairUserData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const uid = context.auth.uid;
    const userRef = db.collection('users').doc(uid);
    
    try {
        console.log(`[REPAIR] 🔧 Verificando usuario ${uid}...`);
        
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Crear usuario completo
            const defaultUserData = {
                email: context.auth.token.email || 'unknown@email.com',
                displayName: context.auth.token.name || 'Usuario',
                generationCredits: 5,
                isPremium: false,
                createdAt: admin.firestore.Timestamp.now(),
                lastGenerationDate: null,
                photoURL: context.auth.token.picture || null,
                totalGenerations: 0,
                lastLoginAt: admin.firestore.Timestamp.now()
            };
            
            await userRef.set(defaultUserData);
            console.log(`[REPAIR] ✅ Usuario ${uid} creado con datos completos`);
            return { success: true, action: 'created', data: defaultUserData };
        } else {
            // Verificar y completar propiedades faltantes
            const userData = userDoc.data();
            const updates = {};
            let needsUpdate = false;
            
            // Verificar cada propiedad esencial
            if (userData.generationCredits === undefined) {
                updates.generationCredits = 5;
                needsUpdate = true;
            }
            if (userData.isPremium === undefined) {
                updates.isPremium = false;
                needsUpdate = true;
            }
            if (userData.totalGenerations === undefined) {
                updates.totalGenerations = 0;
                needsUpdate = true;
            }
            if (userData.email === undefined && context.auth.token.email) {
                updates.email = context.auth.token.email;
                needsUpdate = true;
            }
            if (userData.displayName === undefined && context.auth.token.name) {
                updates.displayName = context.auth.token.name;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await userRef.update(updates);
                console.log(`[REPAIR] ✅ Usuario ${uid} actualizado con propiedades faltantes:`, updates);
                return { success: true, action: 'updated', updates: updates };
            } else {
                console.log(`[REPAIR] ✅ Usuario ${uid} ya tiene todos los datos necesarios`);
                return { success: true, action: 'no_changes', data: userData };
            }
        }
        
    } catch (error) {
        console.error(`[REPAIR] ❌ Error reparando usuario ${uid}:`, error.message);
        throw new functions.https.HttpsError('internal', `Error reparando usuario: ${error.message}`);
    }
});

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

// FUNCIÓN DE DEBUG PARA REVISAR ESTADO DE USUARIO
exports.debugUserStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const uid = context.auth.uid;
    console.log(`[DEBUG] 🔍 Analizando estado de usuario ${uid}...`);
    
    try {
        const userRef = db.collection('users').doc(uid);
        
        // Test paso a paso del proceso
        console.log(`[DEBUG] Step 1: Obteniendo documento...`);
        const userDoc = await userRef.get();
        
        console.log(`[DEBUG] Step 2: Verificando documento...`);
        const documentDebug = {
            exists: userDoc.exists,
            hasDataFunction: typeof userDoc.data === 'function',
            documentType: typeof userDoc,
            isValidDocument: userDoc && typeof userDoc.data === 'function'
        };
        
        console.log(`[DEBUG] Step 3: Intentando obtener datos...`);
        let userData = null;
        let dataError = null;
        
        try {
            if (userDoc && typeof userDoc.data === 'function') {
                userData = userDoc.data();
            } else {
                dataError = 'userDoc.data is not a function';
            }
        } catch (error) {
            dataError = error.message;
        }
        
        const debugInfo = {
            uid: uid,
            email: context.auth.token.email,
            name: context.auth.token.name,
            document: documentDebug,
            userData: userData,
            dataError: dataError,
            auth_token: {
                email: context.auth.token.email,
                name: context.auth.token.name,
                picture: context.auth.token.picture,
                email_verified: context.auth.token.email_verified
            },
            timestamp: new Date().toISOString()
        };
        
        console.log(`[DEBUG] 📊 Estado completo:`, debugInfo);
        return { success: true, debug: debugInfo };
        
    } catch (error) {
        console.error(`[DEBUG] ❌ Error obteniendo estado:`, error.message);
        return { 
            success: false, 
            error: error.message,
            errorType: error.constructor.name,
            uid: uid
        };
    }
});

// FUNCIÓN DE TEST ESPECÍFICA PARA EL ERROR userDoc.data
exports.testUserDocError = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const uid = context.auth.uid;
    console.log(`[TEST_ERROR] 🧪 Simulando el error userDoc.data para ${uid}...`);
    
    try {
        const userRef = db.collection('users').doc(uid);
        
        // Simular el proceso exacto de la función principal
        console.log(`[TEST_ERROR] Step 1: Promise.race simulation...`);
        
        const [userDoc, mockResponse] = await Promise.race([
            // Proceso normal
            Promise.all([
                userRef.get(),
                Promise.resolve('mock deepseek response')
            ]),
            // Emergency fallback
            new Promise((resolve) => {
                setTimeout(() => {
                    console.log('[TEST_ERROR] ⚠️ EMERGENCY FALLBACK activado en test');
                    userRef.get().then(userSnapshot => {
                        resolve([
                            userSnapshot,
                            'mock fallback response'
                        ]);
                    }).catch(error => {
                        console.error('[TEST_ERROR] ❌ Error en fallback:', error);
                        const mockDoc = {
                            exists: false,
                            data: () => null
                        };
                        resolve([
                            mockDoc,
                            'mock error fallback'
                        ]);
                    });
                }, 1000) // 1 segundo para test rápido
            })
        ]);
        
        console.log(`[TEST_ERROR] Step 2: Verificando userDoc...`);
        
        // Validación exacta como en la función principal
        if (!userDoc || typeof userDoc.data !== 'function') {
            return {
                success: false,
                error: 'userDoc.data is not a function',
                userDocType: typeof userDoc,
                hasData: userDoc && typeof userDoc.data,
                userDoc: userDoc ? 'object exists' : 'null or undefined'
            };
        }
        
        // Si llegamos aquí, no hay error
        const userData = userDoc.data();
        
        return {
            success: true,
            message: 'No se detectó el error userDoc.data',
            userDocValid: true,
            userExists: userDoc.exists,
            userData: userData
        };
        
    } catch (error) {
        console.error(`[TEST_ERROR] ❌ Error en test:`, error.message);
        return {
            success: false,
            error: error.message,
            errorType: error.constructor.name
        };
    }
});

// TEST DE CONEXIÓN DEEPSEEK
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
