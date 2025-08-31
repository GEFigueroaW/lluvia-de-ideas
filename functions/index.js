const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Configuración de Deepseek API
const DEEPSEEK_API_KEY = 'sk-97c8f4c543fa45acabaf02ebcac60f03';
const DEEPSEEK_ENDPOINTS = [
    'https://api.deepseek.com/v1'
];

console.log('[INIT] Deepseek API configurado');

// FUNCIÓN PARA GENERAR EJEMPLOS ESPECÍFICOS POR RED SOCIAL
function getExamplesForNetwork(networkName, keyword, userContext) {
    const contextText = userContext ? ` (contexto: ${userContext})` : '';
    
    switch(networkName) {
        case 'Facebook':
            return `💭 La primera vez que probé ${keyword}${contextText}, pensé que era una pérdida de tiempo. Hoy, 6 meses después, no reconozco a la persona que era antes. Mi familia me pregunta qué cambió... La respuesta los sorprendería. ¿Alguien más ha vivido una transformación así? Cuéntenme en comentarios 👇`;
        
        case 'LinkedIn':
            return `📊 REVELACIÓN: Después de analizar 500+ casos de implementación de ${keyword}${contextText}, descubrí un patrón que contradice todo lo que creíamos sobre productividad profesional. Las empresas que lo aplicaron vieron 280% más retención de talento. La razón te sorprenderá... ¿Están listos para repensar sus estrategias? 💡`;
        
        case 'X / Twitter':
            return `🔥 VERDAD INCÓMODA: ${keyword}${contextText} no es lo que te vendieron. Es 10 veces más poderoso y 100 veces más simple. El 95% lo hace mal por esto... ¿Te atreves a intentar el enfoque real? 💥`;
        
        case 'WhatsApp':
            return `🚨 ÚLTIMO AVISO: Lo que descubrí sobre ${keyword}${contextText} cambió mi vida en 21 días. Solo 3 personas más pueden acceder a esta información antes de que la retire. ¿Eres una de ellas? Responde YA si quieres saber qué es 👆`;
        
        case 'Instagram':
            return `✨ ANTES: Escéptica sobre ${keyword}${contextText} 
DESPUÉS: Completamente transformada 💫
Lo que NO esperaba: Que cambiaría mi relación con todo lo demás. La diferencia en mis fotos habla por sí sola... ¿Ready para tu glow up? 💅 #transformacion #mindset`;
        
        case 'TikTok':
            return `POV: Intentas ${keyword}${contextText} por primera vez esperando resultados "normales"... Pero esto pasó 👀 *mind blown* ¿Alguien más experimentó ESTO? Dueto contándome tu experiencia 🤯 #${keyword.replace(/\s+/g, '')} #transformation`;
        
        case 'Telegram':
            return `� ANÁLISIS EXCLUSIVO: ${keyword} en 2024${contextText}
🔹 Adopción: +340% en últimos 6 meses
🔹 ROI promedio: 2.8x en 30-60 días
🔹 Tasa de éxito: 89% con implementación correcta
📊 Datos de 15 estudios independientes
💡 Predicción: Quienes no lo adopten en Q1 2025 quedarán 3 años atrás
📌 ¿Implementas ahora o esperas a que sea "mainstream"?`;
        
        case 'Reddit':
            return `Mi experiencia BRUTAL con ${keyword}${contextText} - 18 meses después [LONG]
TL;DR: Cambió mi vida, pero NO como esperaba.
Backstory: Era escéptico total, lo intenté para probar que era BS...
Plot twist: Funcionó, pero descubrí algo que nadie menciona...
[Story completo en comentarios - AMA]`;
        
        case 'YouTube':
            return `📺 ${keyword.toUpperCase()} desde CERO - Lo que NADIE te cuenta${contextText}
✅ Guía completa: 0 a experto en 30 días
✅ Errores que me costaron 6 meses (para que tú no los cometas)
✅ Resultados REALES documentados día a día
✅ Plan exacto que seguí paso a paso
⬇️ Links y recursos en descripción ⬇️`;
        
        default:
            return `💡 ${keyword}${contextText} cambió mi perspectiva sobre todo. Lo que descubrí desafía lo que todos "sabemos" sobre este tema. ¿Listos para cuestionar sus creencias? 🤔`;
    }
}

// Configuraciones específicas para cada red social
const SOCIAL_NETWORK_SPECS = {
    'Facebook': {
        name: 'Facebook',
        maxLength: 2200,
        optimalLength: '50-80 palabras',
        tone: 'conversacional y personal'
    },
    'LinkedIn': {
        name: 'LinkedIn',
        maxLength: 3000,
        optimalLength: '100-150 palabras',
        tone: 'profesional pero humano'
    },
    'X / Twitter': {
        name: 'X / Twitter',
        maxLength: 280,
        optimalLength: '180 caracteres máximo',
        tone: 'viral e impactante'
    },
    'WhatsApp': {
        name: 'WhatsApp',
        maxLength: 200,
        optimalLength: '30-50 palabras',
        tone: 'urgente y directo'
    },
    'Instagram': {
        name: 'Instagram',
        maxLength: 2200,
        optimalLength: '100-150 palabras',
        tone: 'visual y aspiracional'
    },
    'TikTok': {
        name: 'TikTok',
        maxLength: 150,
        optimalLength: '50-100 palabras',
        tone: 'trendy y generación Z'
    },
    'Telegram': {
        name: 'Telegram',
        maxLength: 4096,
        optimalLength: '80-120 palabras',
        tone: 'informativo y técnico'
    },
    'Reddit': {
        name: 'Reddit',
        maxLength: 10000,
        optimalLength: '150-300 palabras',
        tone: 'auténtico y comunitario'
    },
    'YouTube': {
        name: 'YouTube',
        maxLength: 5000,
        optimalLength: '200-400 palabras',
        tone: 'educativo y descriptivo'
    }
};

// FUNCIÓN PARA LLAMAR A DEEPSEEK API CON TIMEOUT ULTRA-AGRESIVO
async function callDeepseekAPI(prompt) {
    console.log(`[DEEPSEEK] 🚀 Iniciando llamada con timeout ultra-agresivo de 20 segundos...`);
    
    // Promise de timeout ultra-agresivo - 20 segundos total
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            console.error(`[DEEPSEEK] ⏰ TIMEOUT MANUAL: 20 segundos excedidos`);
            reject(new Error('TIMEOUT_MANUAL_20S: Deepseek API tardó más de 20 segundos'));
        }, 20000); // 20 segundos ultra-conservador
    });
    
    // Promise para la llamada API con timeout interno más corto
    const apiCall = async () => {
        try {
            console.log(`[DEEPSEEK] 📤 Enviando request con timeout de 15s...`);
            
            const startTime = Date.now();
            const response = await axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "Experto copywriting. Contenido ÚNICO por plataforma."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                max_tokens: 300, // Reducido aún más para velocidad máxima
                temperature: 0.1, // Mínima variación para velocidad
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // 15 segundos en axios (más agresivo)
            });
            
            const elapsed = Date.now() - startTime;
            console.log(`[DEEPSEEK] 📥 Respuesta recibida en ${elapsed}ms`);
            return response;
        } catch (error) {
            console.error(`[DEEPSEEK] ❌ Error en API call:`, error.message);
            // Si es timeout, lanzar error específico
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('TIMEOUT_AXIOS: Timeout en llamada HTTP');
            }
            throw error;
        }
    };

    try {
        // Race entre API call y timeout manual
        const result = await Promise.race([apiCall(), timeoutPromise]);
        console.log(`[DEEPSEEK] ✅ Respuesta exitosa recibida`);
        return result;
    } catch (error) {
        console.error(`[DEEPSEEK] ❌ Error final:`, error.message);
        
        // Log específico para timeouts
        if (error.message.includes('TIMEOUT')) {
            console.error(`[DEEPSEEK] ⏰ TIMEOUT DETECTADO: ${error.message}`);
        }
        
        throw error;
    }
}

// FUNCIÓN PARA GENERAR PROMPTS PSICOLÓGICAMENTE OPTIMIZADOS
function generateUltraSpecificPrompt(keyword, platforms, userContext) {
    console.log(`[PROMPT] 🧠 Generando prompt psicológicamente optimizado para: ${platforms.join(', ')}`);
    
    const contextSection = userContext ? `${userContext}\n` : '';
    
    return `🎯 MISIÓN: Crear copywriting PSICOLÓGICAMENTE IRRESISTIBLE que genere REFLEXIÓN PROFUNDA, EMOCIÓN AUTÉNTICA y ACCIÓN INMEDIATA.

${contextSection}
TEMA CENTRAL: "${keyword}"

🧠 PRINCIPIOS PSICOLÓGICOS OBLIGATORIOS:
• Generar CURIOSIDAD irresistible que pare el scroll
• Provocar REFLEXIÓN personal profunda 
• Conectar con EMOCIONES reales (aspiración, nostalgia, urgencia, transformación)
• Incluir INSIGHTS que cambien perspectivas
• Despertar DESEO de actuar o experimentar
• Usar STORYTELLING que genere identificación emocional

📋 ESPECIFICACIONES POR PLATAFORMA:

${platforms.map(platform => {
    switch(platform) {
        case 'Facebook':
            return `🔵 FACEBOOK - Historia Personal Profunda:
• GANCHO emocional que genere identificación inmediata
• DESARROLLO con experiencia personal auténtica que inspire
• PREGUNTA reflexiva que invite al diálogo profundo
• Tono: íntimo, vulnerable, inspirador
• Objetivo: Generar comentarios reflexivos y shares emocionales`;

        case 'LinkedIn':
            return `💼 LINKEDIN - Insight Profesional Transformador:
• REVELACIÓN contraintuitiva sobre ${keyword} en el ámbito profesional
• CASO REAL con métricas específicas y lecciones aprendidas
• REFLEXIÓN sobre aplicación práctica en crecimiento profesional
• Tono: autoridad, credibilidad, pensamiento estratégico
• Objetivo: Generar debate intelectual y conexiones de valor`;

        case 'X / Twitter':
            return `🐦 X/TWITTER - Bomba de Reflexión:
• STATEMENT contundente que desafíe creencias comunes
• INSIGHT condensado pero profundo sobre ${keyword}
• PREGUNTA o reflexión que genere debate inteligente
• Tono: directo, provocativo, memorable
• Objetivo: Retweets masivos y respuestas reflexivas`;

        case 'Instagram':
            return `📸 INSTAGRAM - Transformación Visual:
• ANTES/DESPUÉS emocional relacionado con ${keyword}
• MENSAJE aspiracional que inspire cambio personal
• LLAMADA a documentar su propia transformación
• Tono: aspiracional, auténtico, motivador
• Objetivo: Saves masivos y shares en stories`;

        case 'WhatsApp':
            return `💬 WHATSAPP - Urgencia Personal:
• REVELACIÓN íntima sobre ${keyword} que genere FOMO
• BENEFICIO específico con timeframe limitado
• ACCIÓN inmediata clara y específica
• Tono: personal, urgente, exclusivo
• Objetivo: Reenvíos inmediatos y acción directa`;

        case 'TikTok':
            return `🎵 TIKTOK - Hook Viral:
• MOMENTO "mind-blown" relacionado con ${keyword}
• TRANSFORMACIÓN rápida y visual
• TREND que invite a crear contenido similar
• Tono: sorprendente, entretenido, relatable
• Objetivo: Duetos, respuestas y viralización`;

        case 'Telegram':
            return `📡 TELEGRAM - Análisis Profundo:
• DATOS sorprendentes sobre ${keyword} con fuentes
• ANÁLISIS detallado con predicciones específicas
• RECOMENDACIONES accionables basadas en investigación
• Tono: analítico, informado, estratégico
• Objetivo: Forwards a grupos relevantes y discusión`;

        case 'Reddit':
            return `🤓 REDDIT - Experiencia Auténtica:
• STORY real, detallada y honesta sobre ${keyword}
• LECCIONES específicas aprendidas a través de errores
• INVITACIÓN a compartir experiencias similares
• Tono: honesto, humilde, detallado
• Objetivo: Upvotes y comentarios con experiencias propias`;

        case 'YouTube':
            return `📺 YOUTUBE - Valor Educativo Profundo:
• TUTORIAL paso a paso con ${keyword} y resultados reales
• TRANSFORMACIÓN documentada con antes/después
• CALL-TO-ACTION específica para aplicar el conocimiento
• Tono: educativo, práctico, inspirador
• Objetivo: Suscripciones y implementación real`;

        default:
            return `📱 ${platform.toUpperCase()} - Contenido Reflexivo:
• INSIGHT profundo sobre ${keyword} específico para esta plataforma
• REFLEXIÓN que genere pensamiento crítico
• ACCIÓN específica que invite al engagement auténtico`;
    }
}).join('\n\n')}

🔥 FORMATO DE RESPUESTA OBLIGATORIO:

${platforms.map(platform => `**${platform.toUpperCase()}:**
[Contenido psicológicamente optimizado que cumpla TODOS los criterios arriba especificados]`).join('\n\n')}

⚡ CRITERIOS DE EXCELENCIA CRÍTICOS:
✅ DEBE generar emoción auténtica (no superficial)
✅ DEBE incluir elemento de reflexión o insight
✅ DEBE provocar DESEO de actuar/experimentar/cambiar
✅ DEBE ser memorable y quoteable
✅ DEBE conectar con aspiraciones o miedos reales
✅ Español latino natural, sin errores ortográficos`;
}

// FUNCIÓN PRINCIPAL PARA GENERAR IDEAS CON TIMEOUT ULTRA-AGRESIVO
exports.generateIdeas = functions
    .runWith({
        timeoutSeconds: 120, // 2 minutos MÁXIMO (reducido de 540s)
        memory: '1GB'
    })
    .https.onCall(async (data, context) => {
        const requestId = Math.random().toString(36).substring(7);
        const startTime = Date.now();
        
        console.log(`[API-${requestId}] 🚀 === NUEVA SOLICITUD === (timeout: 120s)`);
        console.log(`[API-${requestId}] 📝 Keyword: ${data.keyword}`);
        console.log(`[API-${requestId}] 🌐 Platforms: ${data.platforms}`);
        console.log(`[API-${requestId}] 👤 UID: ${context.auth?.uid}`);
        console.log(`[API-${requestId}] ⏰ Start time: ${new Date().toISOString()}`);

        try {
            const { keyword, platforms, userContext } = data;
            const uid = context.auth?.uid;

            if (!uid) {
                throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
            }

            if (!keyword || !platforms || platforms.length === 0) {
                throw new functions.https.HttpsError('invalid-argument', 'Keyword y platforms son requeridos');
            }

            // LÍMITE DE 3 REDES SOCIALES PARA OPTIMIZAR VELOCIDAD
            if (platforms.length > 3) {
                throw new functions.https.HttpsError('invalid-argument', 'Máximo 3 redes sociales para optimizar velocidad y evitar timeouts');
            }

            const userRef = db.collection('users').doc(uid);
            
            // Generar prompt ultra-específico
            const prompt = generateUltraSpecificPrompt(keyword, platforms, userContext);
            console.log(`[API-${requestId}] 🎯 Prompt generado para ${platforms.length} plataformas`);

            console.log(`[API-${requestId}] 🔍 PASO 1: Validando usuario...`);
            
            // PASO 1: Validar usuario - YA NO SE USA, SE MOVIÓ ABAJO
            
            console.log(`[API-${requestId}] 🔍 PASO 2: Llamando a Deepseek API con timeout de 20 segundos...`);
            
            // PASO 2: Llamar a la API con timeout ultra-agresivo y fallback inmediato
            let deepseekResponse;
            let content;
            let usingFallback = false;
            
            try {
                console.log(`[API-${requestId}] ⏱️ Iniciando llamada con timeout de 20 segundos...`);
                const apiStartTime = Date.now();
                
                deepseekResponse = await callDeepseekAPI(prompt);
                content = deepseekResponse.data.choices[0].message.content;
                
                const apiElapsed = Date.now() - apiStartTime;
                console.log(`[API-${requestId}] ✅ Contenido API recibido en ${apiElapsed}ms: ${content.length} caracteres`);
            } catch (apiError) {
                console.error(`[API-${requestId}] ❌ Error en Deepseek API:`, apiError.message);
                
                // Log específico para timeouts
                if (apiError.message.includes('TIMEOUT') || apiError.message.includes('deadline')) {
                    console.error(`[API-${requestId}] ⏰ TIMEOUT DETECTADO en API: ${apiError.message}`);
                }
                
                // FALLBACK INMEDIATO: Si falla la API, usar ejemplos específicos
                console.log(`[API-${requestId}] 🔄 Activando fallback inmediato por error: ${apiError.message}`);
                content = null; // Marcador para usar fallback
                usingFallback = true;
            }
            
            // OPERACIONES DE FIRESTORE CON TIMEOUT
            console.log(`[API-${requestId}] 🔍 PASO 3: Validando usuario con timeout...`);
            
            let userDoc;
            try {
                // Timeout para operación Firestore
                const firestoreTimeout = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('FIRESTORE_TIMEOUT: Validación de usuario tardó más de 5 segundos'));
                    }, 5000); // 5 segundos para Firestore
                });
                
                const firestoreOperation = userRef.get();
                userDoc = await Promise.race([firestoreOperation, firestoreTimeout]);
                
                console.log(`[API-${requestId}] ✅ Usuario validado exitosamente`);
            } catch (firestoreError) {
                console.error(`[API-${requestId}] ❌ Error en Firestore:`, firestoreError.message);
                
                if (firestoreError.message.includes('TIMEOUT')) {
                    console.error(`[API-${requestId}] ⏰ TIMEOUT en Firestore: ${firestoreError.message}`);
                }
                
                // Si falla Firestore, asumir usuario nuevo pero continuar
                console.log(`[API-${requestId}] 🔄 Asumiendo usuario nuevo por error Firestore`);
                userDoc = { exists: false, data: () => ({}) };
            }

            // Obtener datos del usuario de forma segura
            const userData = userDoc.exists ? userDoc.data() : {};
            console.log(`[API-${requestId}] 📊 Usuario existe: ${userDoc.exists}`);

            // Verificar límites de usuario
            const isAdmin = userData.role === 'admin';
            const isPremium = userData.isPremium === true;
            const usageCount = userData.usageCount || 0;

            console.log(`[API-${requestId}] 👤 Admin: ${isAdmin}, Premium: ${isPremium}, Uso: ${usageCount}`);

            // Control de límites
            if (!isAdmin && !isPremium && usageCount >= 10) {
                throw new functions.https.HttpsError('permission-denied', 'Límite de generaciones alcanzado. Upgrade a Premium para continuar.');
            }

            // PASO 4: Parsear contenido con máxima eficiencia
            console.log(`[API-${requestId}] 🔍 PASO 4: Parseando contenido...`);
            const ideas = {};
            
            if (content && content.length > 0 && !usingFallback) {
                // Si tenemos contenido de la API, parsearlo
                console.log(`[API-${requestId}] 📝 Parseando contenido API: ${content.length} caracteres`);
                
                platforms.forEach(platform => {
                    const regex = new RegExp(`${platform.replace('/', '\\/')}:?\\s*([\\s\\S]*?)(?=\\n(?:[A-Z]|$)|$)`, 'i');
                    const match = content.match(regex);
                    
                    if (match && match[1] && match[1].trim().length > 0) {
                        ideas[platform] = match[1].trim();
                        console.log(`[API-${requestId}] ✅ Parseado ${platform}: ${match[1].trim().length} chars`);
                    } else {
                        // Fallback específico por red si no se puede parsear
                        console.log(`[API-${requestId}] 🔄 Fallback para ${platform} - no se pudo parsear`);
                        ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
                    }
                });
            } else {
                // Si no hay contenido de API, usar fallback para todas las plataformas
                console.log(`[API-${requestId}] 🔄 Usando fallback completo para todas las plataformas`);
                platforms.forEach(platform => {
                    ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
                });
            }

            // PASO 5: Actualizar contador con timeout para Firestore
            console.log(`[API-${requestId}] 🔍 PASO 5: Actualizando contador de usuario...`);
            
            if (!isAdmin) {
                try {
                    const updateTimeout = new Promise((_, reject) => {
                        setTimeout(() => {
                            reject(new Error('FIRESTORE_UPDATE_TIMEOUT: Actualización tardó más de 3 segundos'));
                        }, 3000); // 3 segundos para actualización
                    });
                    
                    const newUsageCount = usageCount + 1;
                    const updateData = {
                        usageCount: newUsageCount,
                        lastUsage: admin.firestore.FieldValue.serverTimestamp()
                    };

                    if (!userDoc.exists) {
                        updateData.email = context.auth.token.email || 'unknown';
                        updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
                        updateData.isPremium = false;
                        updateData.role = 'user';
                    }

                    const updateOperation = userRef.set(updateData, { merge: true });
                    await Promise.race([updateOperation, updateTimeout]);
                    
                    console.log(`[API-${requestId}] 📊 Contador actualizado: ${newUsageCount}`);
                } catch (updateError) {
                    console.error(`[API-${requestId}] ⚠️ Error actualizando contador (no crítico):`, updateError.message);
                    // No bloqueamos la respuesta por esto
                }
            }

            const result = {
                ideas,
                remainingUses: isAdmin ? 'unlimited' : isPremium ? 'unlimited' : Math.max(0, 10 - (usageCount + 1)),
                isPremium,
                isAdmin,
                timestamp: Date.now()
            };

            const totalElapsed = Date.now() - startTime;
            console.log(`[API-${requestId}] ✅ Respuesta exitosa en ${totalElapsed}ms para ${platforms.length} plataformas`);
            console.log(`[API-${requestId}] 🏁 Request completado: ${new Date().toISOString()}`);
            
            return result;

        } catch (error) {
            const totalElapsed = Date.now() - startTime;
            console.error(`[API-${requestId}] ❌ Error después de ${totalElapsed}ms:`, error);
            
            // Log específico para debugging deadline-exceeded
            if (error.message && error.message.includes('deadline-exceeded')) {
                console.error(`[API-${requestId}] ⏰ DEADLINE-EXCEEDED detectado. Detalles:`, {
                    message: error.message,
                    stack: error.stack,
                    platforms: data.platforms,
                    keyword: data.keyword,
                    timestamp: new Date().toISOString(),
                    elapsedMs: totalElapsed
                });
            }
            
            // Log específico para timeouts
            if (error.message && (error.message.includes('TIMEOUT') || error.message.includes('timeout'))) {
                console.error(`[API-${requestId}] ⏰ TIMEOUT detectado. Detalles:`, {
                    message: error.message,
                    platforms: data.platforms?.length || 'unknown',
                    keyword: data.keyword || 'unknown',
                    timestamp: new Date().toISOString(),
                    elapsedMs: totalElapsed
                });
            }
            
            if (error.code && error.message) {
                throw error;
            }
            
            if (error.response?.status === 401) {
                throw new functions.https.HttpsError('internal', 'Error de autenticación con la API');
            }
            
            if (error.message && (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
                throw new functions.https.HttpsError('deadline-exceeded', `Timeout detectado: ${error.message}. Intenta con menos redes sociales.`);
            }
            
            // Error específico para deadline-exceeded
            if (error.message && error.message.includes('deadline-exceeded')) {
                throw new functions.https.HttpsError('deadline-exceeded', `Operación tardó demasiado: ${error.message}`);
            }
            
            throw new functions.https.HttpsError('internal', `Error interno: ${error.message}`);
        }
    });

// FUNCIÓN PARA OBTENER ESTADO DEL USUARIO
exports.getUserStatus = functions.https.onCall(async (data, context) => {
    try {
        const uid = context.auth?.uid;
        if (!uid) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
        }

        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return {
                usageCount: 0,
                remainingUses: 10,
                isPremium: false,
                isAdmin: false
            };
        }

        const userData = userDoc.data();
        const isAdmin = userData.role === 'admin';
        const isPremium = userData.isPremium === true;
        const usageCount = userData.usageCount || 0;

        return {
            usageCount,
            remainingUses: isAdmin ? 'unlimited' : isPremium ? 'unlimited' : Math.max(0, 10 - usageCount),
            isPremium,
            isAdmin,
            email: userData.email
        };

    } catch (error) {
        console.error('Error en getUserStatus:', error);
        throw new functions.https.HttpsError('internal', 'Error interno del servidor');
    }
});

// FUNCIÓN AUTOCORRECTOR
exports.autocorrect = functions.https.onCall(async (data, context) => {
    console.log('[AUTOCORRECT] 🔧 Iniciando corrección de texto...');
    
    try {
        const { text } = data;
        
        if (!text || typeof text !== 'string') {
            throw new functions.https.HttpsError('invalid-argument', 'Texto requerido para corrección');
        }

        // Diccionario de correcciones expandido
        const corrections = {
            // Errores comunes
            'ola': 'hola',
            'ablando': 'hablando',
            'aber': 'a ver',
            'aver': 'a ver',
            'asia': 'hacia',
            'asía': 'hacía',
            'ase': 'hace',
            'asé': 'hice',
            'ay': 'ahí',
            'ahí': 'ahí',
            'ahi': 'ahí',
            'aya': 'haya',
            'haya': 'haya',
            'cayó': 'calló',
            'callo': 'calló',
            'valla': 'vaya',
            'balla': 'vaya',
            'tubo': 'tuvo',
            'estubo': 'estuvo',
            'estaba': 'estaba',
            'iba': 'iba',
            'biba': 'viva',
            'viba': 'viva',
            'disen': 'dicen',
            'asen': 'hacen',
            'acer': 'hacer',
            'aser': 'hacer',
            'cojer': 'coger',
            'cojió': 'cogió',
            'llo': 'yo',
            'lla': 'ya',
            'yega': 'llega',
            'yegar': 'llegar',
            'yevar': 'llevar',
            'yevo': 'llevo',
            'porke': 'porque',
            'xke': 'porque',
            'pq': 'porque',
            'q': 'que',
            'x': 'por',
            'salu2': 'saludos',
            'saluz': 'saludos',
            'weno': 'bueno',
            'bueno': 'bueno',
            'noxe': 'noche',
            'muxo': 'mucho',
            'muxos': 'muchos',
            'muxas': 'muchas',
            'xd': 'jaja',
            'jjj': 'jaja',
            'jejeje': 'jaja',
            'jajaja': 'jaja',
            'jeje': 'jaja',
            'tkm': 'te quiero mucho',
            'tqm': 'te quiero mucho',
            'grax': 'gracias',
            'gracias': 'gracias',
            'grasias': 'gracias',
            'grasia': 'gracias',
            'tmbien': 'también',
            'tambien': 'también',
            'tmb': 'también',
            'bn': 'bien',
            'vien': 'bien',
            'entonses': 'entonces',
            'entoses': 'entonces',
            'aora': 'ahora',
            'ahorita': 'ahora',
            'horita': 'ahora',
            'ora': 'ahora',
            'despues': 'después',
            'desp': 'después',
            'dps': 'después',
            'mas': 'más',
            'sta': 'está',
            'estas': 'estás',
            'estes': 'estés',
            'este': 'esté',
            'teneis': 'tenéis',
            'tenes': 'tienes',
            'tener': 'tener',
            'queres': 'quieres',
            'qres': 'quieres',
            'saves': 'sabes',
            'sabes': 'sabes',
            'sabe': 'sabe',
            'save': 'sabe',
            'quiero': 'quiero',
            'kiero': 'quiero',
            'kierO': 'quiero',
            'pueden': 'pueden',
            'puede': 'puede',
            'puedo': 'puedo',
            'pudo': 'pudo',
            'podria': 'podría',
            'podrias': 'podrías',
            'seria': 'sería',
            'serias': 'serías',
            'estaria': 'estaría',
            'estarias': 'estarías',
            'aria': 'haría',
            'arias': 'harías',
            'tendria': 'tendría',
            'tendrias': 'tendrías',
            'vendria': 'vendría',
            'vendrias': 'vendrías',
            'daria': 'daría',
            'darias': 'darías',
            'sabria': 'sabría',
            'sabrias': 'sabrías',
            'habria': 'habría',
            'habrias': 'habrías',
            'gustaria': 'gustaría',
            'gustarias': 'gustarías',
            'bamos': 'vamos',
            'vamo': 'vamos',
            'vamO': 'vamos',
            'bn': 'bien'
        };

        console.log(`[AUTOCORRECT] 📝 Texto original: "${text.substring(0, 100)}..."`);

        // Aplicar correcciones palabra por palabra
        let correctedText = text;
        let correctionCount = 0;

        // Separar por palabras manteniendo espacios y puntuación
        const words = text.split(/(\s+|[.,;:!?()[\]{}""''""''…\-–—])/);
        
        const correctedWords = words.map(word => {
            const cleanWord = word.toLowerCase().trim();
            
            if (corrections[cleanWord]) {
                correctionCount++;
                console.log(`[AUTOCORRECT] ✏️ Corrección: "${word}" → "${corrections[cleanWord]}"`);
                return corrections[cleanWord];
            }
            
            return word;
        });

        correctedText = correctedWords.join('');

        // Limpiar espacios múltiples
        correctedText = correctedText.replace(/\s+/g, ' ').trim();

        console.log(`[AUTOCORRECT] ✅ ${correctionCount} correcciones aplicadas`);
        console.log(`[AUTOCORRECT] 📝 Texto corregido: "${correctedText.substring(0, 100)}..."`);

        return {
            correctedText,
            originalText: text,
            corrections: correctionCount,
            message: correctionCount > 0 
                ? `Se corrigieron ${correctionCount} errores.`
                : 'No se encontraron errores para corregir.'
        };

    } catch (error) {
        console.error('[AUTOCORRECT] ❌ Error:', error);
        throw new functions.https.HttpsError('internal', 'Error en la corrección de texto');
    }
});

console.log('[INIT] ✅ Funciones Firebase inicializadas correctamente');
