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
            return `Historia personal: Ayer probé ${keyword}${contextText} y cambió todo. Mi familia está impresionada. ¿Alguien más lo ha intentado? Comenten 👇`;
        case 'LinkedIn':
            return `Análisis profesional: Tras implementar ${keyword} en 200+ proyectos${contextText}, confirmé ROI del 340%. Como estratega senior, estos son los KPIs críticos...`;
        case 'X / Twitter':
            return `🧵 THREAD: El secreto de ${keyword}${contextText} que cambió mi vida. Día 1: Escéptico, Día 30: Resultados, Día 90: Transformación ⬇️`;
        case 'WhatsApp':
            return `🚨 URGENTE sobre ${keyword}${contextText}. Últimos 3 cupos con 50% descuento. Solo hasta medianoche. ¿Te apuntas? Responde YA`;
        case 'Instagram':
            return `✨ La transformación con ${keyword}${contextText} que cambió todo 💫 Antes vs Después: Mindset limitado → Mentalidad ganadora ¿Ready? 💅`;
        case 'TikTok':
            return `POV: Intentas ${keyword}${contextText} por primera vez y... 🤯 VIDA = CAMBIADA ✨ No esperaba ESTO 👀`;
        case 'Telegram':
            return `📊 ANÁLISIS: ${keyword} en 2024${contextText}. Tendencias: +340% adopción, ROI 2.8x, implementación 15-30 días. Recomendación: implementar antes Q1 2025`;
        case 'Reddit':
            return `Mi experiencia REAL con ${keyword}${contextText} después de 18 meses. TL;DR: Cambió mi vida, pero no como esperaba. Story completo en comentarios...`;
        case 'YouTube':
            return `📺 TUTORIAL: ${keyword} desde CERO${contextText}. En este video: fundamentos, implementación paso a paso, errores comunes, plan 90 días. Links en descripción ⬇️`;
        default:
            return `Contenido específico para ${networkName} sobre ${keyword}${contextText}`;
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

// FUNCIÓN PARA LLAMAR A DEEPSEEK API
async function callDeepseekAPI(prompt) {
    console.log(`[DEEPSEEK] 🚀 Iniciando llamada con timeout de 45 segundos...`);
    
    const apiCall = async () => {
        const response = await axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "Eres un experto en copywriting para redes sociales. Genera contenido ÚNICO y ESPECÍFICO para cada plataforma, completamente diferente entre sí."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            max_tokens: 600,
            temperature: 0.3,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 45000 // 45 segundos optimizado
        });

        return response;
    };

    const result = await apiCall();
    console.log(`[DEEPSEEK] ✅ Respuesta exitosa en ${Date.now()} ms`);
    return result;
}

// FUNCIÓN PARA GENERAR PROMPTS ULTRA-ESPECÍFICOS
function generateUltraSpecificPrompt(keyword, platforms, userContext) {
    console.log(`[PROMPT] 🎯 Generando prompt ultra-específico para: ${platforms.join(', ')}`);
    
    const contextSection = userContext ? `CONTEXTO DEL USUARIO: ${userContext}\n\n` : '';
    
    const specificInstructions = platforms.map(platform => {
        const spec = SOCIAL_NETWORK_SPECS[platform];
        const example = getExamplesForNetwork(platform, keyword, userContext);
        
        return `${platform.toUpperCase()} (${spec.tone}):
- ${spec.optimalLength}, tono ${spec.tone}
- EJEMPLO OBLIGATORIO: "${example}"
- DIFERENCIA ABSOLUTA: NO repitas ni copies contenido de otras redes
- ESPECÍFICO: Adapta completamente al estilo único de ${platform}`;
    }).join('\n\n');

    return `${contextSection}TEMA: ${keyword}

INSTRUCCIONES CRÍTICAS:
- Genera contenido COMPLETAMENTE DIFERENTE para cada red social
- NUNCA copies o adaptes ligeramente el mismo mensaje
- Cada red debe tener SU PROPIO enfoque, estilo y estructura única
- USA el ejemplo como guía pero crea tu propio contenido

${specificInstructions}

IMPORTANTE: 
- NO uses frases genéricas como "descubre", "transforma tu vida"
- Cada red social debe tener contenido 100% único y específico
- FORMATO: [Nombre Red]: [contenido específico único]

Genera AHORA:`;
}

// FUNCIÓN PRINCIPAL PARA GENERAR IDEAS
exports.generateIdeas = functions
    .runWith({
        timeoutSeconds: 540, // 9 minutos máximo
        memory: '1GB'
    })
    .https.onCall(async (data, context) => {
        console.log(`[API] 🚀 === NUEVA SOLICITUD ===`);
        console.log(`[API] 📝 Keyword: ${data.keyword}`);
        console.log(`[API] 🌐 Platforms: ${data.platforms}`);
        console.log(`[API] 👤 UID: ${context.auth?.uid}`);

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
            console.log(`[API] 🎯 Prompt generado para ${platforms.length} plataformas`);

            console.log(`[API] 🔍 PASO 1: Validando usuario...`);
            
            // PASO 1: Validar usuario
            const userDoc = await userRef.get();
            
            console.log(`[API] 🔍 PASO 2: Llamando a Deepseek API directamente...`);
            
            // PASO 2: Llamar a la API DIRECTAMENTE (SIN Promise.race)
            const deepseekResponse = await callDeepseekAPI(prompt);
            
            console.log(`[API] 🔍 PASO 3: Verificando documento de usuario...`);
            
            if (!userDoc || typeof userDoc.data !== 'function') {
                console.error(`[API] ❌ CRÍTICO: userDoc no es válido`);
                throw new functions.https.HttpsError('internal', 'Error de validación de usuario');
            }

            // Obtener datos del usuario de forma segura
            const userData = userDoc.exists ? userDoc.data() : {};
            console.log(`[API] 📊 Usuario existe: ${userDoc.exists}`);

            // Verificar límites de usuario
            const isAdmin = userData.role === 'admin';
            const isPremium = userData.isPremium === true;
            const usageCount = userData.usageCount || 0;
            const lastUsage = userData.lastUsage;

            console.log(`[API] 👤 Admin: ${isAdmin}, Premium: ${isPremium}, Uso: ${usageCount}`);

            // Control de límites
            if (!isAdmin && !isPremium && usageCount >= 10) {
                throw new functions.https.HttpsError('permission-denied', 'Límite de generaciones alcanzado. Upgrade a Premium para continuar.');
            }

            // Extraer contenido de la respuesta
            const content = deepseekResponse.data.choices[0].message.content;
            console.log(`[API] 📝 Contenido generado con ${content.length} caracteres`);

            // Parsear el contenido por redes sociales
            const ideas = {};
            platforms.forEach(platform => {
                const regex = new RegExp(`${platform.replace('/', '\\/')}:?\\s*([\\s\\S]*?)(?=\\n(?:[A-Z]|$)|$)`, 'i');
                const match = content.match(regex);
                
                if (match && match[1]) {
                    ideas[platform] = match[1].trim();
                } else {
                    // Fallback específico por red
                    ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
                }
            });

            // Actualizar contador si no es admin
            if (!isAdmin) {
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
                console.log(`[API] 📊 Contador actualizado: ${newUsageCount}`);
            }

            const result = {
                ideas,
                remainingUses: isAdmin ? 'unlimited' : isPremium ? 'unlimited' : Math.max(0, 10 - (usageCount + 1)),
                isPremium,
                isAdmin,
                timestamp: Date.now()
            };

            console.log(`[API] ✅ Respuesta exitosa para ${platforms.length} plataformas`);
            return result;

        } catch (error) {
            console.error(`[API] ❌ Error en generateIdeas:`, error);
            
            if (error.code && error.message) {
                throw error;
            }
            
            if (error.response?.status === 401) {
                throw new functions.https.HttpsError('internal', 'Error de autenticación con la API');
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
