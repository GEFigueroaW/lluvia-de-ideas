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

// URLs de respaldo
const DEEPSEEK_FALLBACK_URLS = [
    'https://api.deepseek.com/v1',
    'https://api.deepseek.com'
];

// Validar configuración al inicializar
if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith('sk-')) {
    console.error('[INIT] CRITICAL: Invalid Deepseek API key');
    throw new Error('Invalid Deepseek API key configuration');
}

console.log('[INIT] Deepseek API configurado correctamente con URL:', DEEPSEEK_BASE_URL);

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

// Función de prueba para verificar conectividad con Deepseek
// Nuevo endpoint de test avanzado
exports.testDeepseekAdvanced = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const results = [];

    try {
        console.log('[ADVANCED_TEST] Iniciando test avanzado de Deepseek...');
        
        // Test 1: Conectividad básica
        try {
            const basicResponse = await axios({
                method: 'GET',
                url: 'https://api.deepseek.com',
                timeout: 10000,
                headers: { 'User-Agent': 'Test/1.0' }
            });
            results.push({
                test: 'basic_connectivity',
                success: true,
                status: basicResponse.status,
                message: 'Conectividad básica OK'
            });
        } catch (error) {
            results.push({
                test: 'basic_connectivity',
                success: false,
                error: error.message,
                code: error.code
            });
        }

        // Test 2: Endpoint de modelos
        try {
            const modelsResponse = await axios({
                method: 'GET',
                url: 'https://api.deepseek.com/v1/models',
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            results.push({
                test: 'models_endpoint',
                success: true,
                status: modelsResponse.status,
                message: 'Endpoint de modelos accesible'
            });
        } catch (error) {
            results.push({
                test: 'models_endpoint',
                success: false,
                error: error.message,
                code: error.code,
                status: error.response?.status
            });
        }

        // Test 3: Chat completions
        try {
            const chatResponse = await axios({
                method: 'POST',
                url: 'https://api.deepseek.com/v1/chat/completions',
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: "Responde solo: Test OK" }],
                    max_tokens: 10,
                    temperature: 0.1
                },
                timeout: 15000
            });
            
            results.push({
                test: 'chat_completions',
                success: true,
                status: chatResponse.status,
                message: chatResponse.data.choices[0].message.content,
                usage: chatResponse.data.usage
            });
        } catch (error) {
            results.push({
                test: 'chat_completions',
                success: false,
                error: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data
            });
        }

        return { 
            success: true, 
            results,
            summary: {
                total_tests: results.length,
                passed: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length
            }
        };

    } catch (error) {
        console.error('[ADVANCED_TEST] Error general:', error.message);
        throw new functions.https.HttpsError('internal', `Advanced test failed: ${error.message}`);
    }
});

exports.testDeepseekConnection = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    try {
        console.log('[TEST] Iniciando prueba de conectividad con Deepseek...');
        
        // Prueba simple con prompt corto
        const testPrompt = "Responde solo: 'Test exitoso'";
        
        const response = await axios({
            method: 'POST',
            url: `${DEEPSEEK_BASE_URL}/chat/completions`,
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: "deepseek-chat",
                messages: [{ role: "user", content: testPrompt }],
                max_tokens: 50,
                temperature: 0.1
            },
            timeout: 10000
        });

        console.log('[TEST] ✅ Conexión exitosa:', response.status);
        return { 
            success: true, 
            status: response.status,
            message: response.data.choices[0].message.content,
            apiUrl: DEEPSEEK_BASE_URL
        };

    } catch (error) {
        console.error('[TEST] ❌ Error de conectividad:', error.message);
        throw new functions.https.HttpsError('internal', `Connection test failed: ${error.message}`);
    }
});

exports.api = functions.runWith({
    timeoutSeconds: 180, // Aumentado a 3 minutos
    memory: '512MB' // Aumentado a 512MB
}).https.onCall(async (data, context) => {
    // 1. Validación inicial más estricta
    console.log('[API] Inicio de función con datos:', JSON.stringify(data, null, 2));
    
    if (!context.auth) {
        console.error('[API] Error: Usuario no autenticado');
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const uid = context.auth.uid;
    console.log('[API] Usuario autenticado:', uid);
    
    // Validación de parámetros
    const { generationMode, socialMedia, keyword, copyType, language = 'es' } = data;
    
    if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
        console.error('[API] Error: socialMedia inválido', socialMedia);
        throw new functions.https.HttpsError('invalid-argument', 'socialMedia must be a non-empty array');
    }
    
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        console.error('[API] Error: keyword inválido', keyword);
        throw new functions.https.HttpsError('invalid-argument', 'keyword must be a non-empty string');
    }
    
    if (!copyType || typeof copyType !== 'string') {
        console.error('[API] Error: copyType inválido', copyType);
        throw new functions.https.HttpsError('invalid-argument', 'copyType must be a string');
    }

    console.log('[API] Parámetros validados correctamente');

    const t = translations[language] || translations.es;
    
    try {
        // 2. Obtener datos del usuario con timeout
        console.log('[API] Obteniendo datos del usuario...');
        const userRef = db.collection('users').doc(uid);
        const appConfigRef = db.collection('appConfig').doc('config');
        
        const [userDoc, appConfigDoc] = await Promise.all([
            userRef.get(),
            appConfigRef.get()
        ]);
        
        const userData = userDoc.exists ? userDoc.data() : {};
        const appConfigData = appConfigDoc.exists ? appConfigDoc.data() : {};
        
        console.log('[API] Datos del usuario obtenidos:', { 
            userExists: userDoc.exists, 
            isPremium: userData.isPremium,
            credits: userData.generationCredits 
        });

        // 3. Evaluación de Estado Premium
        const isEffectivePremium = userData.isPremium || appConfigData.isPremiumGlobalActive || appConfigData.isLaunchPromoActive;
        console.log('[API] Estado premium efectivo:', isEffectivePremium);

        // 4. Validación de Límites para usuarios gratuitos
        if (!isEffectivePremium) {
            console.log('[API] Validando límites para usuario gratuito...');
            
            const lastGenerationDate = userData.lastGenerationDate ? userData.lastGenerationDate.toDate() : new Date(0);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            if (lastGenerationDate < oneWeekAgo) {
                console.log('[API] Renovando créditos semanales...');
                await userRef.update({ 
                    generationCredits: 3, 
                    lastGenerationDate: admin.firestore.Timestamp.now() 
                });
                userData.generationCredits = 3;
            }
            
            if (userData.generationCredits <= 0) {
                console.error('[API] Error: Créditos agotados');
                throw new functions.https.HttpsError('failed-precondition', 'Generation credits exhausted');
            }
            
            // Validación de redes sociales para usuarios gratuitos
            const allowedSocial = ["Facebook"];
            if (socialMedia.some(s => !allowedSocial.includes(s))) {
                console.error('[API] Error: Red social no permitida para usuario gratuito');
                throw new functions.https.HttpsError('permission-denied', 'Free users can only use Facebook');
            }

            // Validación de tipos de copy para usuarios gratuitos
            const allowedCopyTypes = ["Informativo o educativo", "Informal", "Técnico o profesional"];
            if (!allowedCopyTypes.includes(copyType)) {
                console.error('[API] Error: Tipo de copy no permitido para usuario gratuito');
                throw new functions.https.HttpsError('permission-denied', 'Copy type not allowed for free users');
            }
        }
        
        // 5. Construcción del Prompt optimizado
        console.log('[API] Construyendo prompt...');
        const copyTypeDesc = copyTypes.find(c => c.name === copyType)?.desc || 'Descripción no disponible';
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
Palabra clave / tema central: ${keyword.trim()}
${t.copyType}${copyType}
${t.copyDescription}${copyTypeDesc}

El contenido generado siempre debe estar en ${language === 'es' ? 'español' : language === 'en' ? 'inglés' : 'portugués'}.`;

        console.log('[API] Prompt construido, longitud:', prompt.length);

        // 6. Llamada a Deepseek con configuración optimizada
        console.log('[API] Iniciando llamada a Deepseek API...');
        
        const deepseekResponse = await callDeepseekAPI(prompt);
        console.log('[API] Respuesta de Deepseek obtenida exitosamente');
        
        const parsedIdeas = parseDeepseekResponse(deepseekResponse);
        console.log('[API] Ideas parseadas:', parsedIdeas.length);

        // 7. Validar que tenemos ideas válidas
        if (!parsedIdeas || parsedIdeas.length === 0) {
            console.log('[API] No se generaron ideas válidas, creando fallback...');
            parsedIdeas.push(createFallbackIdea(keyword, copyType));
        }

        // 8. Actualización de la base de datos
        console.log('[API] Actualizando base de datos...');
        await Promise.all([
            userRef.update({
                generationCredits: isEffectivePremium ? userData.generationCredits : Math.max(0, userData.generationCredits - 1),
                lastGenerationDate: admin.firestore.Timestamp.now()
            }),
            db.collection('generations').add({
                userId: uid,
                timestamp: admin.firestore.Timestamp.now(),
                generationDetails: { generationMode, socialMedia, keyword, copyType, language },
                results: parsedIdeas
            })
        ]);

        console.log('[API] Función completada exitosamente');
        return { success: true, ideas: parsedIdeas };

    } catch (error) {
        console.error('[API] Error en función principal:', error);
        
        // Manejo específico de errores
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        
        // Error genérico
        const errorMessage = error.message || 'Unknown error occurred';
        console.error('[API] Error detallado:', {
            message: errorMessage,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        
        throw new functions.https.HttpsError('internal', `Error generating ideas: ${errorMessage}`);
    }
});

// Función optimizada para llamar a Deepseek API
async function callDeepseekAPI(prompt, retries = 2) {
    console.log('[DEEPSEEK] Iniciando llamada a API con prompt longitud:', prompt.length);
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        console.log(`[DEEPSEEK] Intento ${attempt}/${retries + 1}`);
        
        try {
            // Test de conectividad básica primero
            console.log('[DEEPSEEK] Verificando conectividad...');
            
            // Configuración simplificada y más robusta
            const requestData = {
                model: "deepseek-chat",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 1200, // Reducido aún más
                stream: false
            };

            console.log('[DEEPSEEK] Datos de request preparados');

            // Configuración alternativa con User-Agent simple
            const response = await axios({
                method: 'POST',
                url: `${DEEPSEEK_BASE_URL}/chat/completions`,
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: requestData,
                timeout: 30000, // 30 segundos para dar más tiempo
                httpAgent: false, // Deshabilitar keep-alive
                httpsAgent: false,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            
            console.log('[DEEPSEEK] Respuesta recibida con status:', response.status);
            console.log('[DEEPSEEK] Headers de respuesta:', response.headers);
            
            if (response.status === 200) {
                if (!response.data) {
                    throw new Error('Respuesta vacía del servidor');
                }

                if (!response.data.choices || !response.data.choices[0]) {
                    throw new Error(`Estructura de respuesta inválida: ${JSON.stringify(response.data)}`);
                }

                const content = response.data.choices[0].message?.content;
                if (!content) {
                    throw new Error('Sin contenido en la respuesta');
                }

                console.log('[DEEPSEEK] ✅ Respuesta exitosa, longitud:', content.length);
                return content;
            } else {
                throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
            }

        } catch (error) {
            console.error(`[DEEPSEEK] ❌ Error en intento ${attempt}:`, {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                isAxiosError: error.isAxiosError,
                isTimeout: error.code === 'ECONNABORTED'
            });

            // Si es el último intento, determinar el tipo de error específico
            if (attempt > retries) {
                if (error.code === 'ECONNABORTED') {
                    throw new Error('Timeout - La API tardó demasiado en responder');
                } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    throw new Error('No se puede conectar a la API de Deepseek - Verifica tu conexión');
                } else if (error.code === 'ETIMEDOUT') {
                    throw new Error('Timeout de conexión - La red está muy lenta');
                } else if (error.response) {
                    const status = error.response.status;
                    const errorMsg = error.response.data?.error?.message || 'Error desconocido de API';
                    
                    if (status === 401) {
                        throw new Error('API Key inválida o expirada');
                    } else if (status === 403) {
                        throw new Error('Sin permisos para usar esta API');
                    } else if (status === 429) {
                        throw new Error('Límite de rate excedido - Intenta más tarde');
                    } else if (status >= 500) {
                        throw new Error(`Error del servidor de Deepseek: ${errorMsg}`);
                    } else {
                        throw new Error(`Error de API (${status}): ${errorMsg}`);
                    }
                } else if (error.request) {
                    throw new Error('Sin respuesta del servidor - Verifica tu conexión a internet');
                } else {
                    throw new Error(`Error de configuración: ${error.message}`);
                }
            }

            // Backoff exponencial para retry
            const delay = Math.min(Math.pow(2, attempt) * 1000, 5000); // Max 5 segundos
            console.log(`[DEEPSEEK] Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Función para crear idea de fallback
function createFallbackIdea(keyword, copyType) {
    console.log('[FALLBACK] Creando idea de respaldo...');
    
    const fallbackIdeas = {
        "Informativo o educativo": {
            hook: `📚 ¿Sabías que ${keyword} puede transformar tu día a día?`,
            postText: `Descubre cómo ${keyword} está revolucionando la forma en que trabajamos y vivimos. Te compartimos información valiosa que te ayudará a estar al día con las últimas tendencias.`,
            hashtags: ['#educacion', '#aprendizaje', '#conocimiento', `#${keyword.toLowerCase().replace(/\s+/g, '')}`],
            cta: '👆 ¡Comparte si te resultó útil!',
            visualFormat: 'Infografía con datos clave y colores profesionales'
        },
        "Informal": {
            hook: `¡Hola! 👋 Hablemos de ${keyword}`,
            postText: `¿Ya probaste ${keyword}? Te cuento mi experiencia y por qué creo que vale la pena conocer más sobre este tema. ¡Me encantaría saber tu opinión!`,
            hashtags: ['#casual', '#conversacion', '#opinion', `#${keyword.toLowerCase().replace(/\s+/g, '')}`],
            cta: '💬 ¡Cuéntame tu experiencia en los comentarios!',
            visualFormat: 'Imagen casual y amigable con tonos cálidos'
        },
        "Técnico o profesional": {
            hook: `🔧 Análisis técnico: ${keyword}`,
            postText: `Desde una perspectiva técnica, ${keyword} presenta características interesantes que vale la pena analizar. Aquí tienes un resumen de los aspectos más relevantes.`,
            hashtags: ['#tecnico', '#profesional', '#analisis', `#${keyword.toLowerCase().replace(/\s+/g, '')}`],
            cta: '🔗 ¿Quieres profundizar en el tema?',
            visualFormat: 'Diseño limpio y profesional con gráficos técnicos'
        }
    };

    return fallbackIdeas[copyType] || {
        hook: `✨ Descubre ${keyword}`,
        postText: `${keyword} es un tema fascinante que merece nuestra atención. Te compartimos una perspectiva interesante sobre este importante asunto.`,
        hashtags: ['#contenido', '#interesante', `#${keyword.toLowerCase().replace(/\s+/g, '')}`],
        cta: '👍 ¡Dale like si te gustó!',
        visualFormat: 'Imagen atractiva con colores vibrantes'
    };
}
// Función optimizada para parsear la respuesta de Deepseek
function parseDeepseekResponse(text) {
    console.log('[PARSER] Iniciando parseo, longitud del texto:', text.length);
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.error('[PARSER] Texto inválido o vacío');
        return [];
    }
    
    const ideas = [];
    
    try {
        // Patrón principal más robusto
        const ideaPattern = /---IDEA_(\d+)---\s*(?:Gancho Verbal Impactante|Hook|Gancho):\s*(.*?)\s*(?:Texto del Post|Post Text|Texto):\s*(.*?)\s*(?:Hashtags):\s*(.*?)\s*(?:Llamada a la Acción|CTA|Call to Action).*?:\s*(.*?)\s*(?:Formato Visual Sugerido|Visual Format|Visual).*?:\s*(.*?)\s*---FIN_IDEA_\d+---/gis;
        
        let match;
        while ((match = ideaPattern.exec(text)) !== null) {
            const idea = {
                hook: cleanText(match[2]),
                postText: cleanText(match[3]),
                hashtags: extractHashtags(match[4]),
                cta: cleanText(match[5]),
                visualFormat: cleanText(match[6])
            };
            
            // Validar que la idea tenga contenido mínimo
            if (idea.hook && idea.postText) {
                ideas.push(idea);
                console.log(`[PARSER] Idea ${ideas.length} parseada exitosamente`);
            }
        }

        // Si el patrón principal no funcionó, intentar parsing alternativo
        if (ideas.length === 0) {
            console.log('[PARSER] Patrón principal falló, intentando parsing alternativo...');
            return parseAlternativeFormat(text);
        }

        // Agregar frase final si existe
        const finalPhrasePattern = /---FRASE_FINAL---\s*(.*?)\s*---FIN_FRASE_FINAL---/s;
        const finalPhraseMatch = text.match(finalPhrasePattern);
        
        if (finalPhraseMatch && ideas.length > 0) {
            ideas[0].finalQuote = cleanText(finalPhraseMatch[1]) || "¡Sigue creando contenido increíble!";
        }

        console.log(`[PARSER] Parseo completado: ${ideas.length} ideas extraídas`);
        return ideas;

    } catch (error) {
        console.error('[PARSER] Error durante el parseo:', error);
        return parseAlternativeFormat(text);
    }
}

// Función auxiliar para limpiar texto
function cleanText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/\s+/g, ' ').replace(/^\[|\]$/g, '');
}

// Función auxiliar para extraer hashtags
function extractHashtags(text) {
    if (!text || typeof text !== 'string') return ['#contenido'];
    
    // Buscar hashtags existentes
    const hashtagsFound = text.match(/#\w+/g) || [];
    
    // Si no hay hashtags, crear algunos basados en el texto
    if (hashtagsFound.length === 0) {
        const words = text.toLowerCase().split(/\s+/).filter(word => 
            word.length > 3 && 
            !['para', 'con', 'por', 'una', 'los', 'las', 'del', 'que'].includes(word)
        );
        
        return words.slice(0, 3).map(word => `#${word}`).concat(['#contenido']);
    }
    
    return hashtagsFound.slice(0, 5); // Máximo 5 hashtags
}

// Función de parsing alternativo para formatos menos estructurados
function parseAlternativeFormat(text) {
    console.log('[PARSER] Iniciando parsing alternativo...');
    
    const ideas = [];
    const lines = text.split('\n').filter(line => line.trim().length > 10);
    
    let currentIdea = {};
    let ideaCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lowerLine = line.toLowerCase();
        
        // Detectar inicio de nueva idea
        if (lowerLine.includes('idea') && (lowerLine.includes('1') || lowerLine.includes('2') || lowerLine.includes('3'))) {
            if (Object.keys(currentIdea).length > 1) {
                ideas.push(validateAndCompleteIdea(currentIdea, ideaCount));
                ideaCount++;
            }
            currentIdea = {};
        }
        
        // Extraer componentes
        if (lowerLine.includes('gancho') || lowerLine.includes('hook')) {
            currentIdea.hook = extractContent(line);
        } else if (lowerLine.includes('texto') || lowerLine.includes('post')) {
            currentIdea.postText = extractContent(line);
        } else if (line.includes('#')) {
            currentIdea.hashtags = extractHashtags(line);
        } else if (lowerLine.includes('cta') || lowerLine.includes('acción')) {
            currentIdea.cta = extractContent(line);
        } else if (lowerLine.includes('visual') || lowerLine.includes('formato')) {
            currentIdea.visualFormat = extractContent(line);
        }
        
        // Si no hemos identificado el componente pero parece contenido útil
        else if (!currentIdea.postText && line.length > 30 && !line.includes(':')) {
            currentIdea.postText = line;
        }
    }
    
    // Agregar la última idea
    if (Object.keys(currentIdea).length > 1) {
        ideas.push(validateAndCompleteIdea(currentIdea, ideaCount));
    }
    
    // Si aún no tenemos ideas, crear una básica con todo el texto
    if (ideas.length === 0) {
        console.log('[PARSER] No se pudieron extraer ideas estructuradas, creando idea básica...');
        const chunks = text.split('\n\n').filter(chunk => chunk.trim().length > 20);
        
        if (chunks.length > 0) {
            ideas.push({
                hook: "💡 Ideas generadas por IA",
                postText: chunks[0].trim().substring(0, 300) + (chunks[0].length > 300 ? '...' : ''),
                hashtags: ['#contenido', '#ia', '#marketing'],
                cta: "¿Qué opinas de esta idea?",
                visualFormat: "Imagen atractiva con texto superpuesto"
            });
        }
    }
    
    console.log(`[PARSER] Parsing alternativo completado: ${ideas.length} ideas`);
    return ideas;
}

// Función auxiliar para extraer contenido después de ":"
function extractContent(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return line.trim();
    return line.substring(colonIndex + 1).trim();
}

// Función auxiliar para validar y completar ideas
function validateAndCompleteIdea(idea, index) {
    const completed = {
        hook: idea.hook || `💡 Idea ${index + 1}`,
        postText: idea.postText || "Contenido generado por IA para redes sociales.",
        hashtags: idea.hashtags || ['#contenido', '#redessociales'],
        cta: idea.cta || "¡Comparte tu opinión!",
        visualFormat: idea.visualFormat || "Imagen atractiva y llamativa"
    };
    
    return completed;
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
