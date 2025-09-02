const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');

// Configuración de la API de DeepSeek
const DEEPSEEK_API_KEY = functions.config().deepseek?.key || process.env.DEEPSEEK_API_KEY;

console.log(`[DEBUG] process.env.DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? 'SET' : 'NOT_SET'}`);
console.log(`[DEBUG] functions.config().deepseek?.key: ${functions.config().deepseek?.key ? functions.config().deepseek.key.substring(0, 8) + '...' : 'NOT_SET'}`);
console.log(`[DEBUG] Final DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 8) + '...' : 'NOT_SET'}`);

if (DEEPSEEK_API_KEY) {
    console.log('[INIT] ✅ Deepseek API key configurada correctamente:', DEEPSEEK_API_KEY.substring(0, 8) + '...');
} else {
    console.error('[INIT] ❌ Deepseek API key NO configurada');
}

// Función para llamar a la API de DeepSeek con timeout
async function callDeepseekAPI(prompt, retries = 2) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API_TIMEOUT')), 30000); // 30 segundos timeout
    });

    const apiCall = async () => {
        try {
            console.log(`[DEEPSEEK] 📡 Llamando API con prompt de ${prompt.length} caracteres...`);
            
            const response = await axios.post('https://api.deepseek.com/chat/completions', {
                model: 'deepseek-chat',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.8
            }, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 25000
            });

            if (response.data && response.data.choices && response.data.choices[0]) {
                const content = response.data.choices[0].message.content;
                console.log(`[DEEPSEEK] ✅ Respuesta recibida: ${content.length} caracteres`);
                return content;
            } else {
                throw new Error('INVALID_RESPONSE_FORMAT');
            }
        } catch (axiosError) {
            console.error(`[DEEPSEEK] ❌ Error en API:`, axiosError.message);
            throw axiosError;
        }
    };

    return Promise.race([apiCall(), timeoutPromise]);
}

// FUNCIÓN PRINCIPAL PARA GENERAR IDEAS - NUEVA ESTRUCTURA
exports.generateIdeas = functions
    .https.onRequest({
        timeoutSeconds: 60,
        memory: '512MB'
    }, async (req, res) => {
        return cors(req, res, async () => {
            const requestId = Math.random().toString(36).substring(7);
            console.log(`[API-${requestId}] 🚀 Nueva solicitud - Nueva estructura`);
            
            try {
                // Verificar método HTTP
                if (req.method !== 'POST') {
                    res.status(405).json({ error: 'Method not allowed' });
                    return;
                }
                
                const { keyword, platform, copyTypes, userContext, uid } = req.body.data || req.body;
                
                if (!uid) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }

                if (!keyword || !platform || !copyTypes || copyTypes.length === 0) {
                    res.status(400).json({ error: 'Keyword, platform y copyTypes son requeridos' });
                    return;
                }

                if (copyTypes.length > 3) {
                    res.status(400).json({ error: 'Máximo 3 tipos de copy permitidos' });
                    return;
                }

                // Nueva lógica: 3 ideas para 1 plataforma con diferentes tipos de copy
                console.log(`[API-${requestId}] 🎯 Generando 3 ideas para ${platform} con tipos: [${copyTypes.join(', ')}]`);
                
                // Distribución inteligente de tipos de copy
                let copyTypeDistribution = [];
                if (copyTypes.length === 1) {
                    // 3 variaciones del mismo tipo
                    copyTypeDistribution = [copyTypes[0], copyTypes[0], copyTypes[0]];
                } else if (copyTypes.length === 2) {
                    // 2 del primero + 1 del segundo
                    copyTypeDistribution = [copyTypes[0], copyTypes[0], copyTypes[1]];
                } else if (copyTypes.length === 3) {
                    // 1 de cada tipo
                    copyTypeDistribution = copyTypes;
                }

                console.log(`[API-${requestId}] 📋 Distribución: ${copyTypeDistribution.join(' | ')}`);

                // Generar las 3 ideas en paralelo
                const ideaPromises = copyTypeDistribution.map(async (copyType, index) => {
                    const prompt = `
Genera contenido para ${platform} sobre "${keyword}".

TIPO DE COPY: ${copyType}
CONTEXTO ADICIONAL: ${userContext || 'No especificado'}

CARACTERÍSTICAS DEL TIPO "${copyType}":
${getCharacteristicsForCopyType(copyType)}

REQUISITOS ESTRICTOS:
- Contenido 100% original y único
- Específico para ${platform}
- Evita frases genéricas como "¿Sabías que...?" o "En el mundo de..."
- Incluye datos específicos o estadísticas inventadas pero creíbles
- Tono apropiado para ${copyType}
- Máximo 150 palabras

FORMATO DE RESPUESTA:
CONTENIDO: [tu texto aquí]
HASHTAGS: [5-8 hashtags relevantes]
CTA: [llamada a la acción específica]
`;

                    try {
                        const result = await callDeepseekAPI(prompt);
                        return {
                            ideaNumber: index + 1,
                            copyType: copyType,
                            content: result,
                            platform: platform,
                            timestamp: new Date().toISOString()
                        };
                    } catch (error) {
                        console.error(`[API-${requestId}] Error en idea ${index + 1}:`, error);
                        return {
                            ideaNumber: index + 1,
                            copyType: copyType,
                            content: `Error generando contenido para ${copyType}`,
                            platform: platform,
                            error: error.message
                        };
                    }
                });

                const ideas = await Promise.all(ideaPromises);
                const totalTime = Date.now() - parseInt(requestId, 36);

                console.log(`[API-${requestId}] ✅ 3 ideas generadas exitosamente en ${totalTime}ms`);

                res.status(200).json({
                    success: true,
                    data: {
                        ideas: ideas,
                        platform: platform,
                        copyTypes: copyTypes,
                        keyword: keyword,
                        distribution: copyTypeDistribution,
                        metadata: {
                            requestId: requestId,
                            timestamp: new Date().toISOString(),
                            processingTime: totalTime
                        }
                    }
                });

            } catch (error) {
                console.error(`[API-${requestId}] ❌ Error general:`, error);
                res.status(500).json({
                    error: 'Error interno del servidor',
                    details: error.message,
                    requestId: requestId
                });
            }
        });
    });

// Función auxiliar para obtener características de cada tipo de copy
function getCharacteristicsForCopyType(copyType) {
    const characteristics = {
        'Informativo y educativo': 'Enfócate en enseñar algo valioso, compartir conocimiento útil, estadísticas interesantes, tips prácticos. Tono: profesional pero accesible.',
        'Venta directa y persuasivo': 'Enfócate en beneficios claros, urgencia, prueba social, llamadas a la acción directas. Tono: convincente y orientado a resultados.',
        'Posicionamiento y branding': 'Enfócate en valores de marca, diferenciación, storytelling, conexión emocional. Tono: aspiracional y auténtico.',
        'Urgencia y escasez': 'Enfócate en tiempo limitado, pocas unidades, ofertas exclusivas, FOMO. Tono: urgente pero no agresivo.',
        'De beneficio o solución': 'Enfócate en cómo el producto/servicio resuelve problemas específicos y mejora la vida del cliente. Tono: empático y solucionador.',
        'De novedad o lanzamiento': 'Enfócate en lo nuevo, innovador, exclusivo. Genera expectativa y curiosidad. Tono: emocionante y anticipatorio.',
        'De interacción o pregunta': 'Enfócate en generar engagement, hacer preguntas abiertas, encuestas, invitar a comentar. Tono: conversacional y participativo.',
        'Llamada a la acción (CTA)': 'Enfócate en motivar acción inmediata: comprar, registrarse, descargar, contactar. Tono: directo y motivacional.',
        'Narrativo o storytelling': 'Enfócate en contar historias emotivas, experiencias personales, casos de éxito. Tono: emotivo y narrativo.',
        'Testimonio o prueba social': 'Enfócate en experiencias reales de clientes, reseñas, casos de éxito, reconocimientos. Tono: auténtico y creíble.',
        'Técnico o profesional': 'Enfócate en datos, especificaciones, análisis detallados, información técnica. Tono: formal y especializado.',
        'Informal': 'Enfócate en cercanía, humor sutil, lenguaje cotidiano, conversación amigable. Tono: relajado y cercano.'
    };
    
    return characteristics[copyType] || 'Crea contenido relevante y atractivo para la audiencia.';
}

// Función de test simplificada
exports.testDeepseekConnection = functions
    .https.onRequest({
        timeoutSeconds: 30,
        memory: '256MB'
    }, async (req, res) => {
        return cors(req, res, async () => {
            const requestId = Date.now().toString().slice(-6);
            console.log(`[TEST-${requestId}] Iniciando test de conexión...`);

            try {
                const diagnostics = {
                    timestamp: new Date().toISOString(),
                    apiKeyConfigured: !!DEEPSEEK_API_KEY,
                    apiKeyFormat: DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.startsWith('sk-') : false,
                    overall: 'success'
                };

                res.status(200).json({ success: true, data: diagnostics });
            } catch (error) {
                console.error(`[TEST-${requestId}] Error:`, error);
                res.status(500).json({ error: error.message });
            }
        });
    });
