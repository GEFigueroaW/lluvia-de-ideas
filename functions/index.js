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

// Configuraciones específicas para cada red social
const SOCIAL_NETWORK_SPECS = {
    'Facebook': {
        name: 'Facebook',
        maxLength: 2200,
        optimalLength: '50-80 palabras',
        tone: 'conversacional y personal',
        features: 'storytelling, emociones, comunidad',
        hashtags: 'máximo 2-3 hashtags',
        engagement: 'preguntas, polls, contenido que genere conversación',
        cta: 'botones de acción, enlaces externos'
    },
    'LinkedIn': {
        name: 'LinkedIn',
        maxLength: 3000,
        optimalLength: '100-150 palabras',
        tone: 'profesional pero humano',
        features: 'insights profesionales, networking, valor educativo',
        hashtags: '3-5 hashtags profesionales',
        engagement: 'comentarios reflexivos, conexiones profesionales',
        cta: 'invitaciones a conectar, compartir experiencias'
    },
    'X / Twitter': {
        name: 'X / Twitter',
        maxLength: 280,
        optimalLength: '120-180 caracteres',
        tone: 'directo y conciso',
        features: 'trending topics, tiempo real, viralidad',
        hashtags: '2-3 hashtags estratégicos',
        engagement: 'retweets, menciones, hilos',
        cta: 'enlaces cortos, menciones a usuarios'
    },
    'WhatsApp': {
        name: 'WhatsApp',
        maxLength: 4096,
        optimalLength: '30-60 palabras',
        tone: 'personal e íntimo',
        features: 'mensajería directa, urgencia, exclusividad',
        hashtags: 'no son efectivos',
        engagement: 'respuestas directas, llamadas a la acción',
        cta: 'números de teléfono, enlaces directos'
    },
    'Telegram': {
        name: 'Telegram',
        maxLength: 4096,
        optimalLength: '80-120 palabras',
        tone: 'informativo y técnico',
        features: 'canales, bots, comunidades especializadas',
        hashtags: 'uso moderado',
        engagement: 'forwards, reacciones, polls',
        cta: 'enlaces a canales, bots interactivos'
    },
    'Reddit': {
        name: 'Reddit',
        maxLength: 40000,
        optimalLength: '150-300 palabras',
        tone: 'auténtico y comunitario',
        features: 'subreddits especializados, discusiones profundas',
        hashtags: 'no se usan',
        engagement: 'upvotes, comentarios detallados',
        cta: 'discusión, AMA, recursos útiles'
    },
    'Instagram': {
        name: 'Instagram',
        maxLength: 2200,
        optimalLength: '100-150 palabras',
        tone: 'visual y aspiracional',
        features: 'contenido visual, stories, reels',
        hashtags: '5-10 hashtags relevantes',
        engagement: 'likes, shares, saves',
        cta: 'enlaces en bio, stories interactivas'
    },
    'TikTok': {
        name: 'TikTok',
        maxLength: 2200,
        optimalLength: '50-100 palabras',
        tone: 'joven y trendy',
        features: 'videos cortos, trends, música',
        hashtags: '3-5 hashtags trending',
        engagement: 'duetos, challenges, comentarios',
        cta: 'follow, like, share'
    },
    'YouTube': {
        name: 'YouTube',
        maxLength: 5000,
        optimalLength: '200-400 palabras',
        tone: 'educativo y entretenido',
        features: 'videos largos, tutoriales, entretenimiento',
        hashtags: '3-5 hashtags en descripción',
        engagement: 'suscripciones, likes, comentarios',
        cta: 'suscribirse, campana de notificaciones'
    }
};

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
        
        // NUEVO: Prompt específico para cada red social
        let prompt;
        
        if (platforms.length === 1) {
            // Generar 3 variaciones para una sola red social
            const platform = platforms[0];
            const spec = SOCIAL_NETWORK_SPECS[platform];
            
            if (spec) {
                prompt = `Genera 3 variaciones de copywriting profesional para ${spec.name} sobre "${keyword}".

ESPECIFICACIONES PARA ${spec.name.toUpperCase()}:
- Longitud óptima: ${spec.optimalLength}
- Tono: ${spec.tone}
- Características clave: ${spec.features}
- Hashtags: ${spec.hashtags}
- Engagement: ${spec.engagement}
- Call-to-action: ${spec.cta}

INSTRUCCIONES:
1. Crea 3 enfoques diferentes pero todos optimizados para ${spec.name}
2. Respeta las características específicas de la plataforma
3. Cada variación debe tener un hook diferente
4. Incluye emojis apropiados para el tono de ${spec.name}
5. Asegúrate de que el call-to-action sea específico para esta plataforma

FORMATO DE RESPUESTA EXACTO:
🎯 Gancho: [gancho principal]
📝 Texto: [texto completo del post]
🏷️ Hashtags: [hashtags específicos]
📞 CTA: [call-to-action]
🎨 Visual: [sugerencia visual]
---FIN---

🎯 Gancho: [gancho diferente]
📝 Texto: [texto completo del post]
🏷️ Hashtags: [hashtags específicos]
📞 CTA: [call-to-action]
🎨 Visual: [sugerencia visual]
---FIN---

🎯 Gancho: [gancho diferente]
📝 Texto: [texto completo del post]
🏷️ Hashtags: [hashtags específicos]
📞 CTA: [call-to-action]
🎨 Visual: [sugerencia visual]
---FIN---`;
            } else {
                // Fallback para redes no especificadas
                prompt = `Genera 3 variaciones de copywriting para ${platform} sobre "${keyword}".`;
            }
        } else {
            // Generar 1 copy específico para cada red social
            prompt = `Crea contenido COMPLETAMENTE DIFERENTE para cada red social sobre "${keyword}":

LINKEDIN: Enfoque profesional B2B, insights de negocio, 100-150 palabras, hashtags profesionales
FACEBOOK: Storytelling personal, conversacional, emocional, 50-80 palabras, máximo 3 hashtags
TWITTER: Conciso, impactante, viral, máximo 180 caracteres, 2-3 hashtags trending
WHATSAPP: Personal, urgente, directo, 30-60 palabras, sin hashtags

CRÍTICO: Cada red debe tener contenido 100% ÚNICO. No repetir frases.

FORMATO:
LinkedIn: [texto profesional único]
Facebook: [historia personal única]  
X / Twitter: [mensaje viral único]
WhatsApp: [mensaje personal único]`;
        }

        console.log(`[API] 🚀 Prompt específico generado para ${platforms.join(', ')}`);

        // CAMBIO CRÍTICO: SECUENCIAL en lugar de PARALELO para evitar problemas de timing
        console.log(`[API] 🔍 PASO 1: Validando usuario PRIMERO de forma secuencial...`);
        
        // PASO 1: Validar y crear usuario si es necesario (SECUENCIAL)
        const userDoc = await userRef.get();
        
        console.log(`[API] 🔍 PASO 2: Llamando a Deepseek API...`);
        
        // PASO 2: Llamar a la API (CON FALLBACK EMERGENCY)
        const deepseekResponse = await Promise.race([
            callDeepseekAPI(prompt),
            // Emergency fallback después de 15 segundos SOLO para la API
            new Promise((resolve) => {
                setTimeout(() => {
                    console.log('[API] ⚠️ EMERGENCY FALLBACK activado SOLO para API');
                    
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
                    
                    resolve(fallbackResponse);
                }, 15000)
            })
        ]);
        
        // LÍNEA POR LÍNEA: Validación segura del documento antes de usar .data()
        console.log(`[USER] 🔍 PASO 3: Verificando documento de usuario para ${uid}...`);
        console.log(`[USER] 📊 userDoc.exists: ${userDoc.exists}`);
        console.log(`[USER] 📊 userDoc.data type: ${typeof userDoc.data}`);
        
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
            console.log(`[USER] 📊 userData:`, {
                exists: !!userData,
                generationCredits: userData?.generationCredits,
                generationCreditsType: typeof userData?.generationCredits,
                isPremium: userData?.isPremium,
                isPremiumType: typeof userData?.isPremium
            });
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
        console.log(`[USER] 🔍 PASO 4: Verificando acceso para usuario ${uid}...`);
        
        let hasAccess = userData.generationCredits > 0 || userData.isPremium;
        let accessReason = '';
        
        console.log(`[USER] 📊 Acceso individual: generationCredits=${userData.generationCredits} > 0: ${userData.generationCredits > 0}`);
        console.log(`[USER] 📊 Acceso individual: isPremium=${userData.isPremium}`);
        console.log(`[USER] 📊 hasAccess inicial: ${hasAccess}`);
        
        // Si no tiene acceso individual, verificar premium global
        if (!hasAccess) {
            console.log(`[USER] 🔍 Sin acceso individual, verificando premium global...`);
            try {
                const configDoc = await db.collection('config').doc('app').get();
                console.log(`[USER] 📊 configDoc.exists: ${configDoc.exists}`);
                
                if (configDoc.exists) {
                    const configData = configDoc.data();
                    console.log(`[USER] 📊 configData.isPremiumGlobalActive: ${configData.isPremiumGlobalActive}`);
                    
                    const isGlobalPremiumActive = configData.isPremiumGlobalActive;
                    
                    if (isGlobalPremiumActive) {
                        // Verificar si la promoción global sigue vigente
                        const promoEndDate = configData.promoEndDate;
                        const currentDate = new Date();
                        const isPromoValid = !promoEndDate || promoEndDate.toDate() > currentDate;
                        
                        console.log(`[USER] 📊 promoEndDate: ${promoEndDate ? promoEndDate.toDate() : 'No definida'}`);
                        console.log(`[USER] 📊 currentDate: ${currentDate}`);
                        console.log(`[USER] 📊 isPromoValid: ${isPromoValid}`);
                        
                        if (isPromoValid) {
                            hasAccess = true;
                            accessReason = 'Premium Global Activo';
                            console.log(`[USER] ✅ Acceso concedido por Premium Global para usuario ${uid}`);
                        } else {
                            console.log(`[USER] ⚠️ Premium Global expirado el ${promoEndDate.toDate()}`);
                        }
                    } else {
                        console.log(`[USER] ⚠️ Premium Global NO está activo`);
                    }
                } else {
                    console.log(`[USER] ⚠️ No existe documento de configuración global`);
                }
            } catch (error) {
                console.log(`[USER] ⚠️ Error verificando premium global: ${error.message}`);
                console.error(`[USER] 📊 Error completo:`, error);
            }
        } else {
            accessReason = userData.isPremium ? 'Premium Individual' : `${userData.generationCredits} créditos`;
            console.log(`[USER] ✅ Acceso concedido por acceso individual: ${accessReason}`);
        }
        
        console.log(`[USER] 📊 RESULTADO FINAL: hasAccess=${hasAccess}, accessReason="${accessReason}"`);
        
        if (!hasAccess) {
            console.log(`[USER] ❌ Usuario ${uid} SIN ACCESO FINAL. Créditos: ${userData.generationCredits}, Premium Individual: ${userData.isPremium}, Premium Global: No`);
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
        if (error.message.includes('API falló')) {
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
    console.log('[PARSER] 🚀 Parse específico para redes sociales...');
    console.log('[PARSER] 📝 Texto recibido:', text.substring(0, 500) + '...');
    
    if (!text?.trim()) {
        return [createFallbackIdea()];
    }
    
    const ideas = [];
    
    // NUEVO: Parser para el formato específico por red social
    const newFormatMatches = text.matchAll(/🎯\s*Gancho:\s*([^\n]+)\s*📝\s*Texto:\s*([^🏷️]+)🏷️\s*Hashtags:\s*([^📞]+)📞\s*CTA:\s*([^🎨]+)🎨\s*Visual:\s*([^-]+)---FIN---/gi);
    
    console.log('[PARSER] 🔍 Buscando formato nuevo...');
    
    for (const match of newFormatMatches) {
        const hook = match[1]?.trim();
        const postText = match[2]?.trim();
        const hashtags = match[3]?.trim();
        const cta = match[4]?.trim();
        const visual = match[5]?.trim();
        
        console.log('[PARSER] ✅ Match encontrado:', { hook, postText: postText?.substring(0, 50), hashtags, cta });
        
        if (postText && postText.length > 10) {
            ideas.push({
                hook: hook || postText.substring(0, 50) + (postText.length > 50 ? '...' : ''),
                postText: postText,
                hashtags: hashtags?.split(/[,\s#]+/).filter(h => h.length > 1).slice(0, 5) || ['contenido'],
                cta: cta || 'Interactúa',
                visualFormat: visual || 'Imagen atractiva',
                socialNetwork: 'Específico'
            });
        }
    }
    
    // Formato alternativo: buscar por red social específica
    if (ideas.length === 0) {
        console.log('[PARSER] 🔍 Buscando por redes sociales específicas...');
        
        const socialNetworks = ['Facebook', 'LinkedIn', 'Twitter', 'X / Twitter', 'WhatsApp', 'Instagram', 'TikTok', 'Telegram', 'Reddit', 'YouTube'];
        
        for (const network of socialNetworks) {
            const networkRegex = new RegExp(`${network}:?\\s*([^\\n]+(?:\\n[^\\n]+)*)`, 'gi');
            const networkMatch = text.match(networkRegex);
            
            if (networkMatch && networkMatch[0]) {
                const content = networkMatch[0].replace(new RegExp(`${network}:?\\s*`, 'i'), '').trim();
                
                if (content.length > 20) {
                    // Extraer hashtags del contenido
                    const hashtagMatches = content.match(/#\w+/g) || [];
                    const cleanText = content.replace(/#\w+/g, '').trim();
                    
                    ideas.push({
                        hook: `${network} específico`,
                        postText: cleanText,
                        hashtags: hashtagMatches.length > 0 ? hashtagMatches.map(h => h.replace('#', '')) : ['marketing', network.toLowerCase()],
                        cta: 'Comparte tu experiencia',
                        visualFormat: 'Imagen atractiva',
                        socialNetwork: network
                    });
                    
                    console.log('[PARSER] ✅ Contenido específico para', network, ':', cleanText.substring(0, 50));
                }
            }
        }
    }
    
    // Regex mejorada para capturar el formato original (backward compatibility)
    if (ideas.length === 0) {
        console.log('[PARSER] 🔍 Usando parser de respaldo...');
        
        const matches = text.matchAll(/---IDEA_\d+---\s*(?:Red:\s*([^\n]+?)\s*)?(?:Texto:\s*([^-]+?)\s*)?Hashtags:\s*([^-]+?)\s*CTA:\s*([^-]+?)\s*---FIN_IDEA_\d+---/gi);
        
        for (const match of matches) {
            const socialNetwork = match[1]?.trim();
            const postText = (match[2] || match[1])?.trim();
            const hashtags = match[3]?.trim();
            const cta = match[4]?.trim();
            
            if (postText && postText.length > 10) {
                ideas.push({
                    hook: postText.substring(0, 50) + (postText.length > 50 ? '...' : ''),
                    postText: postText,
                    hashtags: hashtags?.split(/[,\s#]+/).filter(h => h.length > 1).slice(0, 5) || ['contenido'],
                    cta: cta || 'Interactúa',
                    visualFormat: 'Imagen atractiva',
                    socialNetwork: socialNetwork || 'General'
                });
            }
        }
    }
    
    // Fallback split básico si nada funciona
    if (ideas.length === 0) {
        console.log('[PARSER] 🔍 Usando split básico como último recurso...');
        
        const parts = text.split(/[\n\r]{2,}/).filter(part => part.trim().length > 20);
        
        parts.forEach((part, index) => {
            const cleanPart = part.trim();
            if (cleanPart.length > 20) {
                const hashtagMatches = cleanPart.match(/#\w+/g) || [];
                const cleanText = cleanPart.replace(/#\w+/g, '').trim();
                
                ideas.push({
                    hook: `Idea ${index + 1}`,
                    postText: cleanText,
                    hashtags: hashtagMatches.length > 0 ? hashtagMatches.map(h => h.replace('#', '')) : ['marketing'],
                    cta: 'Comparte',
                    visualFormat: 'Imagen atractiva',
                    socialNetwork: 'General'
                });
            }
        });
    }
    
    console.log('[PARSER] 📊 Total ideas parseadas:', ideas.length);
    
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

// FUNCIÓN DEBUG ESPECÍFICA PARA PROBLEMA DE CRÉDITOS
exports.debugCreditsError = functions.runWith({
    timeoutSeconds: 60,
    memory: '512MB'
}).https.onCall(async (data, context) => {
    console.log('[DEBUG] 🔍 Iniciando debug específico para error de créditos...');
    
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required for debug');
    }

    const uid = context.auth.uid;
    const email = context.auth.token.email;
    
    try {
        console.log(`[DEBUG] Usuario: ${email} (${uid})`);
        
        // PASO 1: Verificar documento del usuario
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        let debugInfo = {
            step1_userDoc: {
                exists: userDoc.exists,
                hasDataFunction: typeof userDoc.data === 'function'
            }
        };
        
        let userData = null;
        if (userDoc.exists && typeof userDoc.data === 'function') {
            userData = userDoc.data();
            debugInfo.step1_userDoc.userData = userData;
        }
        
        // PASO 2: Verificar lógica de acceso individual
        if (userData) {
            const hasCredits = userData.generationCredits > 0;
            const isPremium = userData.isPremium;
            const hasIndividualAccess = hasCredits || isPremium;
            
            debugInfo.step2_individualAccess = {
                generationCredits: userData.generationCredits,
                generationCreditsType: typeof userData.generationCredits,
                hasCredits: hasCredits,
                isPremium: isPremium,
                isPremiumType: typeof userData.isPremium,
                hasIndividualAccess: hasIndividualAccess
            };
        }
        
        // PASO 3: Verificar configuración premium global
        let hasGlobalAccess = false;
        try {
            const configDoc = await db.collection('config').doc('app').get();
            debugInfo.step3_globalConfig = {
                configExists: configDoc.exists,
                hasDataFunction: typeof configDoc.data === 'function'
            };
            
            if (configDoc.exists && typeof configDoc.data === 'function') {
                const configData = configDoc.data();
                debugInfo.step3_globalConfig.configData = configData;
                
                const isGlobalPremiumActive = configData.isPremiumGlobalActive;
                const promoEndDate = configData.promoEndDate;
                const isPromoValid = !promoEndDate || promoEndDate.toDate() > new Date();
                
                debugInfo.step3_globalConfig.verification = {
                    isGlobalPremiumActive: isGlobalPremiumActive,
                    isGlobalPremiumActiveType: typeof isGlobalPremiumActive,
                    promoEndDate: promoEndDate ? promoEndDate.toDate() : null,
                    currentDate: new Date(),
                    isPromoValid: isPromoValid,
                    hasGlobalAccess: isGlobalPremiumActive && isPromoValid
                };
                
                hasGlobalAccess = isGlobalPremiumActive && isPromoValid;
            }
        } catch (error) {
            debugInfo.step3_globalConfig.error = error.message;
        }
        
        // PASO 4: Simular lógica completa de la función principal
        const individualAccess = userData ? (userData.generationCredits > 0 || userData.isPremium) : false;
        const finalAccess = individualAccess || hasGlobalAccess;
        
        debugInfo.step4_finalVerification = {
            individualAccess: individualAccess,
            hasGlobalAccess: hasGlobalAccess,
            finalAccess: finalAccess,
            wouldThrowError: !finalAccess
        };
        
        // PASO 5: Si no tiene acceso, crear usuario y activar premium
        if (!finalAccess) {
            console.log('[DEBUG] 🔧 Usuario sin acceso, activando premium automáticamente...');
            
            // Crear/actualizar usuario
            const premiumUserData = {
                email: email,
                displayName: context.auth.token.name || 'Usuario Premium',
                generationCredits: 9999,
                isPremium: true,
                premiumUntil: admin.firestore.Timestamp.fromDate(new Date(Date.now() + (365 * 24 * 60 * 60 * 1000))),
                premiumSource: 'debug_auto_activation',
                premiumUpdatedAt: admin.firestore.Timestamp.now(),
                lastGenerationDate: null,
                createdAt: userDoc.exists ? userData.createdAt : admin.firestore.Timestamp.now(),
                photoURL: context.auth.token.picture || null
            };
            
            await userRef.set(premiumUserData, { merge: true });
            
            // Activar premium global
            const globalPremiumConfig = {
                isPremiumGlobalActive: true,
                promoEndDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + (365 * 24 * 60 * 60 * 1000))),
                promoDescription: 'Premium Global Debug Auto-Activation',
                allowAllSocialNetworks: true,
                allowAllCopyTypes: true,
                unlimitedGenerations: true,
                bypassCreditsCheck: true,
                lastUpdated: admin.firestore.Timestamp.now(),
                updatedBy: email,
                debugActivation: true
            };
            
            await db.collection('config').doc('app').set(globalPremiumConfig, { merge: true });
            
            debugInfo.step5_autoActivation = {
                userDataUpdated: premiumUserData,
                globalConfigUpdated: globalPremiumConfig,
                success: true
            };
        }
        
        console.log('[DEBUG] ✅ Debug completado:', debugInfo);
        
        return {
            success: true,
            debugInfo: debugInfo,
            recommendations: finalAccess ? 
                ['Usuario tiene acceso correcto'] : 
                ['Premium activado automáticamente', 'Reintentar generación de copywriting']
        };
        
    } catch (error) {
        console.error('[DEBUG] ❌ Error en debug:', error);
        throw new functions.https.HttpsError('internal', `Debug error: ${error.message}`);
    }
});
