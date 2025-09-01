const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Inicializar Firebase Admin
admin.initializeApp();

// Función optimizada para procesamiento paralelo
async function generateIdeasParallel(platforms, keyword, userContext, DEEPSEEK_API_KEY, requestId) {
    console.log(`[API-${requestId}] 🚀 Generando contenido para ${platforms.length} plataformas en paralelo...`);
    
    const platformPromises = platforms.map(async (platform) => {
        console.log(`[API-${requestId}] Iniciando generación para ${platform}`);
        
        try {
            if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.startsWith('sk-')) {
                // Llamar a DeepSeek en paralelo
                const prompt = buildPromptForPlatform(platform, keyword, userContext);
                const deepseekResponse = await callDeepseekAPI(prompt);
                
                if (deepseekResponse && deepseekResponse.contenido) {
                    return {
                        platform,
                        content: {
                            rawContent: deepseekResponse.contenido,
                            hashtags: deepseekResponse.hashtags || [],
                            cta: deepseekResponse.cta || '',
                            formato: platform
                        }
                    };
                } else {
                    throw new Error('RESPUESTA_INSUFICIENTE');
                }
            } else {
                throw new Error('API_KEY_NO_CONFIGURADA');
            }
        } catch (error) {
            console.log(`[API-${requestId}] ❌ Error para ${platform}: ${error.message}`);
            
            // Generar contenido de respaldo
            const fallbackContent = getExamplesForNetwork(platform, keyword, userContext);
            return {
                platform,
                content: {
                    rawContent: `⚠️ GENERADO CON TEMPLATES (${error.message})\n\n${fallbackContent}`,
                    hashtags: generateHashtagsForPlatform(platform, keyword),
                    cta: '',
                    formato: platform,
                    isFallback: true
                }
            };
        }
    });

    // Esperar todas las respuestas en paralelo
    const results = await Promise.allSettled(platformPromises);
    
    // Procesar resultados
    const ideas = {};
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            ideas[result.value.platform] = result.value.content;
        } else {
            const platform = platforms[index];
            console.log(`[API-${requestId}] ❌ Error crítico para ${platform}`);
            ideas[platform] = {
                rawContent: `⚠️ ERROR TÉCNICO - Intenta de nuevo`,
                hashtags: [],
                cta: '',
                formato: platform,
                isFallback: true
            };
        }
    });

    console.log(`[API-${requestId}] 🎯 Generación paralela completada`);
    return ideas;
}

module.exports = { generateIdeasParallel };
