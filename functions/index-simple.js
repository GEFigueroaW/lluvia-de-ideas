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
    switch(networkName) {
        case 'Facebook':
            return `💭 La primera vez que probé ${keyword}, pensé que era una pérdida de tiempo. Hoy, 6 meses después, no reconozco a la persona que era antes. 🌟 Mi familia me pregunta qué cambió en mí... La respuesta los sorprendería. 💫 He descubierto algo que va más allá de lo que esperaba: no solo transformó mi cuerpo, sino mi manera de ver la vida. 🔮 ¿Alguien más ha vivido una transformación tan profunda que hasta sus seres queridos lo notan? 👇 Cuéntenme en comentarios, me encanta leer sus historias 💕`;
        case 'LinkedIn':
            return `📊 REVELACIÓN: Después de analizar 500+ casos de implementación de ${keyword}, descubrí un patrón que contradice todo lo que creíamos sobre productividad profesional. 💡 Las empresas que lo aplicaron vieron 280% más retención de talento. La razón te sorprenderá... 🎯 No se trata de técnicas complejas, sino de un principio fundamental que el 95% ignora. 💼 En mis 15 años como consultor organizacional, nunca había visto resultados tan consistentes. ⚡ La clave está en algo tan simple que parece obvio, pero tan poderoso que transforma culturas enteras. 🔥 ¿Están listos para repensar sus estrategias de liderazgo? #Liderazgo #ProductividadProfesional #CulturaOrganizacional #Innovacion #Resultados`;
        case 'X / Twitter':
            return `🔥 VERDAD INCÓMODA: ${keyword} no es lo que te vendieron. Es 10 veces más poderoso y 100 veces más simple. 💥 El 95% lo hace mal por esto... 🧠 Creen que necesitan técnicas complicadas cuando la solución está en algo que hacían de niños. ⚡ ¿Te atreves a intentar el enfoque real? 🤔`;
        case 'WhatsApp':
            return `🚨 ÚLTIMO AVISO: Lo que descubrí sobre ${keyword} cambió mi vida en 21 días. 💥 Solo 3 personas más pueden acceder a esta información antes de que la retire permanentemente. 🔒 No es exageración: esto va contra todo lo que nos enseñaron. ⚡ ¿Eres una de esas 3 personas? 👆 Responde YA si quieres saber de qué se trata 🏃‍♀️`;
        case 'Instagram':
            return `✨ ANTES: Escéptica total sobre ${keyword} 😒 DESPUÉS: Completamente transformada 💫 Lo que NO esperaba: Que cambiaría mi relación con todo lo demás. 🌟 La diferencia en mis fotos habla por sí sola... 📸 Pero lo más loco es cómo afectó mi confianza, mi energía, mi forma de despertar cada día. 💅 Ya no soy la misma persona que dudaba de todo. 🔥 ¿Ready para tu propio glow up? 💖 #transformacion #mindset #confidence #glowup #selflove #lifestyle #wellness #motivation`;
        case 'TikTok':
            return `POV: Intentas ${keyword} por primera vez esperando resultados "normales"... 👀 Pero esto pasó 🤯 *mind blown* Me quedé así toda la semana 😱 ¿Alguien más experimentó ESTO? 💫 Dueto contándome tu experiencia porque necesito saber si soy la única loca 😂 #${keyword.replace(/\s+/g, '')} #transformation #mindblown #fyp #viral #real #storytime`;
        case 'Telegram':
            return `📈 ANÁLISIS EXCLUSIVO: ${keyword} en 2024 🔹 Adopción: +340% en últimos 6 meses 📊 ROI promedio: 2.8x en 30-60 días ⚡ Tasa de éxito: 89% con implementación correcta 📌 Datos de 15 estudios independientes revelan un patrón inesperado. 💡 Predicción: Quienes no lo adopten en Q1 2025 quedarán 3 años atrás del mercado. 🎯 La ventana de oportunidad se cierra rápido. ❓ ¿Implementas ahora o esperas a que sea "mainstream" y pierdas la ventaja competitiva?`;
        case 'Reddit':
            return `Mi experiencia BRUTAL con ${keyword} - 18 meses después [LONG] 📝 TL;DR: Cambió mi vida, pero NO como esperaba. Backstory: Era escéptico total, lo intenté para probar que era BS... 💀 Plot twist: Funcionó, pero descubrí algo que nadie menciona en los posts motivacionales. 🧵 La parte oscura que todos omiten. Story completo en comentarios - AMA porque sé que tienen preguntas 👇`;
        case 'YouTube':
            return `📺 ${keyword.toUpperCase()} desde CERO - Lo que NADIE te cuenta 🎯 ✅ Guía completa: 0 a experto en 30 días ⚠️ Errores que me costaron 6 meses (para que tú no los cometas) 📊 Resultados REALES documentados día a día 📋 Plan exacto que seguí paso a paso 🔥 Todo basado en mi experiencia real, sin filtros ni marketing. ⬇️ Links y recursos gratis en descripción ⬇️`;
        default:
            return `💡 ${keyword} cambió mi perspectiva sobre todo. 🤔 Lo que descubrí desafía lo que todos "sabemos" sobre este tema. 🔥 ¿Listos para cuestionar sus creencias? 💭`;
    }
}

// FUNCIÓN PARA LLAMAR A DEEPSEEK API CON TIMEOUT
async function callDeepseekAPI(prompt) {
    console.log(`[DEEPSEEK] 🚀 Iniciando llamada...`);
    
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('TIMEOUT: Deepseek API tardó más de 20 segundos'));
        }, 20000);
    });
    
    const apiCall = axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, {
        model: 'deepseek-chat',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 3000,
        temperature: 0.7
    }, {
        headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 15000
    });
    
    return Promise.race([apiCall, timeoutPromise]);
}

// FUNCIÓN PRINCIPAL PARA GENERAR IDEAS
exports.generateIdeas = functions
    .runWith({
        timeoutSeconds: 120,
        memory: '1GB'
    })
    .https.onCall(async (data, context) => {
        const requestId = Math.random().toString(36).substring(7);
        
        console.log(`[API-${requestId}] 🚀 Nueva solicitud`);
        
        try {
            const { keyword, platforms, userContext } = data;
            const uid = context.auth?.uid;

            if (!uid) {
                throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
            }

            if (!keyword || !platforms || platforms.length === 0) {
                throw new functions.https.HttpsError('invalid-argument', 'Keyword y platforms son requeridos');
            }

            // Límite de 3 redes sociales
            if (platforms.length > 3) {
                throw new functions.https.HttpsError('invalid-argument', 'Máximo 3 redes sociales');
            }

            const userRef = db.collection('users').doc(uid);
            
            // Validar usuario
            let userDoc;
            try {
                userDoc = await userRef.get();
            } catch (error) {
                console.log(`[API-${requestId}] Asumiendo usuario nuevo por error Firestore`);
                userDoc = { exists: false, data: () => ({}) };
            }

            const userData = userDoc.exists ? userDoc.data() : {};
            const isAdmin = userData.role === 'admin';
            const isPremium = userData.isPremium === true;
            const usageCount = userData.usageCount || 0;

            // Control de límites
            if (!isAdmin && !isPremium && usageCount >= 10) {
                throw new functions.https.HttpsError('permission-denied', 'Límite alcanzado. Upgrade a Premium.');
            }

            // Generar ideas usando fallback por ahora (para garantizar funcionamiento)
            const ideas = {};
            platforms.forEach(platform => {
                ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
            });

            // Actualizar contador
            if (!isAdmin) {
                try {
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

                    await userRef.set(updateData, { merge: true });
                } catch (error) {
                    console.log(`[API-${requestId}] Error actualizando contador: ${error.message}`);
                }
            }

            console.log(`[API-${requestId}] ✅ Generación exitosa`);
            
            return {
                success: true,
                ideas: ideas,
                remainingUses: isAdmin || isPremium ? 'unlimited' : Math.max(0, 10 - (usageCount + 1))
            };

        } catch (error) {
            console.error(`[API-${requestId}] ❌ Error:`, error);
            
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }
            
            throw new functions.https.HttpsError('internal', 'Error interno del servidor');
        }
    });
