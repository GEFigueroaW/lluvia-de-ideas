// =========================================
// SISTEMA LIMPIO - SOLO NUEVA ESTRUCTURA
// =========================================

console.log('🚀 [CLEAN-SYSTEM] Iniciando sistema limpio...');

// Variables globales necesarias
window.currentIdeas = {};

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
    
    try {
        // Crear elemento de notificación visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ${type === 'error' ? 'background: #ff4444;' : ''}
            ${type === 'warning' ? 'background: #ffaa00;' : ''}
            ${type === 'success' ? 'background: #00ff88; color: #003311;' : ''}
            ${type === 'info' ? 'background: #007AFF;' : ''}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            try {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            } catch (e) {
                console.log('[NOTIFICATION] Error al remover notificación:', e);
            }
        }, 3000);
    } catch (error) {
        console.error('[NOTIFICATION] Error al crear notificación:', error);
    }
}

// Función para mostrar progreso de generación
function showGenerationProgress(platform, typesCount) {
    console.log(`[PROGRESS] Generando para ${platform} - ${typesCount} tipos`);
    
    const progressDiv = document.createElement('div');
    progressDiv.id = 'generation-progress';
    progressDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10001;
        text-align: center;
        color: #333;
        backdrop-filter: blur(10px);
    `;
    
    progressDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 15px;">🤖</div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Generando Ideas con IA...</h3>
        <p style="margin: 0; color: #666;">Para ${platform} • ${typesCount} tipo${typesCount > 1 ? 's' : ''}</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Conectando con DeepSeek API...</p>
        <div style="margin-top: 20px; width: 200px; height: 4px; background: #eee; border-radius: 2px; overflow: hidden;">
            <div style="width: 0%; height: 100%; background: linear-gradient(45deg, #667eea, #764ba2); transition: width 0.3s; animation: progress 8s ease-in-out infinite;" id="progress-bar"></div>
        </div>
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progress {
            0% { width: 0%; }
            25% { width: 30%; }
            50% { width: 60%; }
            75% { width: 85%; }
            100% { width: 100%; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(progressDiv);
}

// Función para ocultar progreso
function hideGenerationProgress() {
    const progressDiv = document.getElementById('generation-progress');
    if (progressDiv) {
        progressDiv.remove();
    }
}

// Función para formatear el contenido del texto
function formatContentText(content) {
    return content
        // Mejorar puntuación después de signos de interrogación y exclamación
        .replace(/([¿¡])([A-Z])/g, '$1 $2')
        .replace(/([?!])([A-Z])/g, '$1 $2')
        
        // Asegurar espacios después de puntos
        .replace(/\.([A-Z])/g, '. $1')
        
        // Mejorar espacios alrededor de dos puntos
        .replace(/:\s*([a-zA-Z])/g, ': $1')
        
        // Saltos de línea antes de emojis al inicio de oraciones
        .replace(/([.!?])\s*([🤔💭🌟🔍💡⚡🔥💰🚀🎯🎨🌍💎🔮🏆])/g, '$1\n\n$2')
        
        // Asegurar salto de línea después de preguntas reflexivas
        .replace(/(\?)\s*([A-ZÁÉÍÓÚÑ])/g, '$1\n\n$2')
        
        // Mejorar estructura de listas o puntos
        .replace(/\.\s*([A-Z][^.]*:)/g, '.\n\n$1')
        
        // Limpiar espacios múltiples
        .replace(/\s+/g, ' ')
        .trim();
}

// Función para generar prompts visuales según la plataforma
function generateVisualPrompt(platform, keyword, type, content) {
    const baseStyle = {
        'Instagram': {
            format: 'Imagen cuadrada (1080x1080)',
            style: 'Estilo feed de Instagram, colores vibrantes, alta calidad',
            elements: 'composición centrada, tipografía moderna'
        },
        'TikTok': {
            format: 'Video vertical (9:16)',
            style: 'Dinámico, trending, Gen Z appeal',
            elements: 'movimiento, texto animado, colores llamativos'
        },
        'LinkedIn': {
            format: 'Imagen horizontal (1200x627)',
            style: 'Profesional, corporativo, limpio',
            elements: 'gráficos de datos, colores sobrios, tipografía seria'
        },
        'Facebook': {
            format: 'Imagen horizontal (1200x630)',
            style: 'Familiar, accesible, colores cálidos',
            elements: 'fácil de leer, imágenes relacionables'
        },
        'Twitter': {
            format: 'Imagen horizontal (1200x675)',
            style: 'Conciso, impactante, viral',
            elements: 'mensaje claro, contraste alto'
        }
    };
    
    const visualStyle = baseStyle[platform] || baseStyle['Instagram'];
    
    const typePrompts = {
        'Informativo y educativo': `Crea una imagen ${visualStyle.format} que muestre "${keyword}" de manera educativa. ${visualStyle.style}. Incluye ${visualStyle.elements}, iconos informativos, gráficos explicativos y un diseño que invite al aprendizaje. El concepto debe transmitir conocimiento y curiosidad.`,
        
        'Venta directa y persuasivo': `Diseña una imagen ${visualStyle.format} promocional para "${keyword}" con enfoque de ventas. ${visualStyle.style}. Incorpora ${visualStyle.elements}, call-to-action visual, elementos de urgencia, y diseño persuasivo. Debe generar deseo de compra inmediata.`,
        
        'Posicionamiento y branding': `Crea una imagen ${visualStyle.format} de marca premium para "${keyword}". ${visualStyle.style}. Incluye ${visualStyle.elements}, logo elegante, diseño sofisticado y elementos que transmitan autoridad y confianza en la marca.`
    };
    
    let prompt = typePrompts[type] || typePrompts['Informativo y educativo'];
    
    // Agregar contexto específico de la plataforma
    const platformContext = {
        'Instagram': 'Optimizado para engagement y shares en stories.',
        'TikTok': 'Debe captar atención en los primeros 3 segundos.',
        'LinkedIn': 'Apropiado para audiencia profesional y networking.',
        'Facebook': 'Diseñado para generar comentarios y discusión.',
        'Twitter': 'Perfecto para retweets y conversaciones virales.'
    };
    
    prompt += ` ${platformContext[platform] || ''} Colores que complementen el tema "${keyword}" y generen impacto visual.`;
    
    return prompt;
}

// Función para copiar al portapapeles
function copyToClipboard(ideaKey) {
    try {
        const idea = window.currentIdeas[ideaKey];
        if (!idea) return;
        
        const textToCopy = `${idea.content}\n\n${idea.hashtags}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('✅ Copiado al portapapeles', 'success');
            }).catch(err => {
                console.error('Error copiando:', err);
                fallbackCopyTextToClipboard(textToCopy);
            });
        } else {
            fallbackCopyTextToClipboard(textToCopy);
        }
    } catch (error) {
        console.error('Error en copyToClipboard:', error);
        showNotification('❌ Error al copiar', 'error');
    }
}

// Fallback para copiar texto
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('✅ Copiado al portapapeles', 'success');
        } else {
            showNotification('❌ Error al copiar', 'error');
        }
    } catch (err) {
        console.error('Fallback: Error al copiar', err);
        showNotification('❌ Error al copiar', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Función para copiar prompt visual
function copyVisualPrompt(ideaKey) {
    try {
        const idea = window.currentIdeas[ideaKey];
        if (!idea || !idea.visualPrompt) return;
        
        const textToCopy = idea.visualPrompt;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('✅ Prompt visual copiado', 'success');
            }).catch(err => {
                console.error('Error copiando prompt:', err);
                fallbackCopyTextToClipboard(textToCopy);
            });
        } else {
            fallbackCopyTextToClipboard(textToCopy);
        }
    } catch (error) {
        console.error('Error en copyVisualPrompt:', error);
        showNotification('❌ Error al copiar prompt', 'error');
    }
}

// Función para obtener red social seleccionada (con fallback robusto)
function getSelectedSocialNetworkSafe() {
    try {
        // Opción 1: Función del carrusel
        if (typeof getSelectedSocialNetwork === 'function') {
            const network = getSelectedSocialNetwork();
            if (network && network !== 'undefined' && network !== '') {
                console.log('[CLEAN-SYSTEM] Red social desde carrusel:', network);
                return network;
            }
        }
        
        // Opción 2: Input oculto
        const hiddenInput = document.getElementById('singleSocialNetwork');
        if (hiddenInput && hiddenInput.value) {
            console.log('[CLEAN-SYSTEM] Red social desde input:', hiddenInput.value);
            return hiddenInput.value;
        }
        
        // Opción 3: Carrusel global
        if (window.socialCarousel) {
            const network = window.socialCarousel.getSelectedNetwork();
            if (network && network.name) {
                console.log('[CLEAN-SYSTEM] Red social desde window.socialCarousel:', network.name);
                return network.name;
            }
        }
        
        // Fallback
        console.log('[CLEAN-SYSTEM] Usando fallback: Facebook');
        return 'Facebook';
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error al obtener red social:', error);
        return 'Facebook';
    }
}

// Función para generar prompts visuales con IA real
async function generateVisualPromptWithAI(platform, keyword, type, content) {
    console.log(`[DEEPSEEK-VISUAL] 🎨 Generando prompt visual con IA real...`);
    
    const DEEPSEEK_API_KEY = 'sk-195d3e74fc904857a632ee7b22b174ff';
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    const systemPrompt = `Eres un experto en prompts para generación de imágenes y videos con IA. Creas prompts específicos y detallados para cada plataforma social.`;
    
    const userPrompt = `Basándote en este copywriting: "${content.substring(0, 200)}..."
    
    Genera un prompt específico para crear contenido visual en ${platform} sobre "${keyword}" de tipo "${type}".
    
    El prompt debe:
    - Ser específico para ${platform} (formato, estilo, dimensiones)
    - Describir elementos visuales que complementen el copy
    - Incluir estilo fotográfico/artístico apropiado
    - Ser claro y detallado para IA de imágenes/video
    - Tener entre 100-150 palabras
    
    Responde SOLO con el prompt, sin explicaciones adicionales.`;
    
    const requestBody = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.8
    };
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`DeepSeek Visual API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta inválida de DeepSeek Visual API');
    }
    
    console.log(`[DEEPSEEK-VISUAL] ✅ Prompt visual IA generado`);
    return data.choices[0].message.content.trim();
}

// Función para generar contenido REAL con DeepSeek API
async function generateWithDeepSeek(platform, keyword, type, userContext, includeCTA) {
    console.log(`[DEEPSEEK] 🚀 Iniciando generación REAL con IA...`);
    
    const DEEPSEEK_API_KEY = 'sk-195d3e74fc904857a632ee7b22b174ff';
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    // Crear prompt específico según el tipo de contenido
    let systemPrompt = '';
    let userPrompt = '';
    
    switch(type) {
        case 'Informativo y educativo':
            systemPrompt = `Eres un experto en copywriting educativo para redes sociales. Generas contenido reflexivo, educativo y que invita a pensar profundamente sobre el tema.`;
            userPrompt = `Crea un copywriting educativo para ${platform} sobre "${keyword}". 
            ${userContext ? `Contexto adicional: ${userContext}` : ''}
            El contenido debe:
            - Ser profundamente reflexivo e invitar a la introspección
            - Incluir preguntas que hagan pensar
            - Tener un enfoque educativo y transformador
            - Ser original y único (NO usar plantillas)
            - Tener entre 150-250 palabras
            ${includeCTA ? '- Incluir un call-to-action natural' : ''}`;
            break;
            
        case 'Venta directa y persuasivo':
            systemPrompt = `Eres un experto en copywriting persuasivo y ventas. Generas contenido que motiva a la acción de manera ética y efectiva.`;
            userPrompt = `Crea un copywriting persuasivo para ${platform} sobre "${keyword}".
            ${userContext ? `Contexto adicional: ${userContext}` : ''}
            El contenido debe:
            - Ser altamente persuasivo y motivador
            - Crear urgencia y deseo
            - Incluir beneficios claros y específicos
            - Ser original y único (NO usar plantillas)
            - Tener entre 120-200 palabras
            ${includeCTA ? '- Incluir un call-to-action fuerte y directo' : ''}`;
            break;
            
        case 'Posicionamiento y branding':
            systemPrompt = `Eres un experto en branding y posicionamiento de marca. Generas contenido que construye autoridad y confianza.`;
            userPrompt = `Crea un copywriting de branding para ${platform} sobre "${keyword}".
            ${userContext ? `Contexto adicional: ${userContext}` : ''}
            El contenido debe:
            - Posicionar como líder y experto
            - Transmitir autoridad y confianza
            - Diferenciarse de la competencia
            - Ser original y único (NO usar plantillas)
            - Tener entre 130-220 palabras
            ${includeCTA ? '- Incluir un call-to-action que refuerce el posicionamiento' : ''}`;
            break;
    }
    
    const requestBody = {
        model: "deepseek-chat",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user", 
                content: userPrompt
            }
        ],
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9
    };
    
    console.log(`[DEEPSEEK] 📤 Enviando request a API...`);
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[DEEPSEEK] ✅ Respuesta recibida de IA real`);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Respuesta inválida de DeepSeek API');
    }
    
    const content = data.choices[0].message.content.trim();
    
    // Formatear el contenido
    const formattedContent = formatContentText(content);
    
    // Generar prompt para imagen/video según la plataforma con IA real
    let visualPrompt;
    try {
        visualPrompt = await generateVisualPromptWithAI(platform, keyword, type, formattedContent);
    } catch (error) {
        console.log(`[DEEPSEEK] Error generando prompt visual, usando fallback`);
        visualPrompt = generateVisualPrompt(platform, keyword, type, formattedContent);
    }
    
    console.log(`[DEEPSEEK] 🎯 Contenido IA generado exitosamente`);
    
    return {
        content: formattedContent,
        platform: platform,
        copyType: type,
        generatedBy: '🤖 IA Real (DeepSeek)',
        isRealAI: true,
        visualPrompt: visualPrompt
    };
}

// Función para generar ideas con IA REAL usando DeepSeek
async function generateIdeaWithAI(platform, keyword, type, userContext, includeCTA) {
    console.log(`[AI] 🤖 Generando idea REAL con IA para ${type}...`);
    
    // Intentar con DeepSeek API primero
    try {
        return await generateWithDeepSeek(platform, keyword, type, userContext, includeCTA);
    } catch (error) {
        console.error(`[AI] Error con DeepSeek API:`, error);
        showNotification('Error con IA - usando sistema de respaldo', 'warning');
        return await generateFallbackIdea(platform, keyword, type, userContext, includeCTA);
    }
}

// Función de respaldo con plantillas (solo cuando falla la IA real)
async function generateFallbackIdea(platform, keyword, type, userContext, includeCTA) {
    console.log(`[FALLBACK] ⚠️ Usando plantillas como respaldo...`);
    showNotification('Usando plantillas de respaldo - IA no disponible', 'warning');
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const templates = {
        'Informativo y educativo': [
            `🤔 ¿Te has preguntado alguna vez cómo ${keyword} podría estar transformando silenciosamente tu rutina diaria? La respuesta te sorprenderá: cada pequeña decisión relacionada con este tema es en realidad una puerta hacia nuevas posibilidades que quizás aún no has explorado.`,
            
            `💭 Reflexionemos juntos: ¿Qué pasaría si te dijera que todo lo que creías saber sobre ${keyword} es solo la punta del iceberg? Existe un universo de estrategias, enfoques y perspectivas que están esperando a ser descubiertos por mentes curiosas como la tuya.`,
            
            `🌟 Imagínate por un momento esto: cada experto en ${keyword} comenzó exactamente donde tú estás ahora, con dudas, preguntas y esa sensación de que hay algo más por aprender. La diferencia no está en el talento natural, sino en la disposición a cuestionar lo obvio y buscar respuestas más profundas.`,
            
            `🔍 ¿Sabías que las personas más exitosas en el ámbito de ${keyword} comparten un secreto que pocos conocen? No se trata de técnicas complejas o fórmulas mágicas, sino de una mentalidad específica que les permite ver oportunidades donde otros ven obstáculos.`,
            
            `💡 Aquí tienes algo en lo que pensar: si pudieras cambiar solo una cosa sobre tu enfoque hacia ${keyword}, ¿cuál sería? Esta simple pregunta ha llevado a miles de personas a descubrir estrategias revolucionarias que transformaron completamente sus resultados.`
        ],
        
        'Venta directa y persuasivo': [
            `🎯 Déjame hacerte una pregunta directa: ¿Cuánto tiempo más vas a permitir que la incertidumbre sobre ${keyword} te mantenga alejado de los resultados que realmente deseas? Cada día que pasa sin tomar acción es una oportunidad perdida que jamás regresará.`,
            
            `⚡ Imagínate despertando mañana sabiendo que finalmente tienes el control total sobre ${keyword}. ¿Cómo se sentiría esa confianza? ¿Qué cambiaría en tu vida cuando ya no tengas que preocuparte por este tema nunca más?`,
            
            `🔥 Te voy a revelar algo que la mayoría de las personas no quiere admitir: el momento perfecto para dominar ${keyword} nunca va a llegar. La única diferencia entre quienes triunfan y quienes se quedan atrás es la decisión de actuar a pesar de las dudas.`,
            
            `💰 ¿Qué valor le das realmente a tu tiempo? Porque mientras sigues posponiendo tu decisión sobre ${keyword}, otros están aprovechando cada segundo para construir la vida que tú también podrías tener. La pregunta no es si puedes permitirte invertir en esto, sino si puedes permitirte no hacerlo.`,
            
            `🚀 Aquí está la verdad incómoda: las excusas sobre ${keyword} que te dices a ti mismo son las mismas que se dijeron miles de personas antes que tú. La diferencia es que algunos decidieron dejar de justificarse y empezar a actuar. ¿En qué grupo quieres estar?`
        ],
        
        'Posicionamiento y branding': [
            `🏆 En un mundo donde todos hablan de ${keyword}, nosotros preferimos demostrar con hechos. Nuestra filosofía es simple: la excelencia no se proclama, se vive día a día en cada detalle, en cada decisión, en cada resultado que entregamos.`,
            
            `🎨 ¿Qué diferencia a una marca memorable de una olvidable? No es solo el logo o el mensaje, sino la capacidad de conectar emocionalmente con las aspiraciones más profundas de las personas. En el universo de ${keyword}, nosotros no vendemos productos, creamos experiencias transformadoras.`,
            
            `🌍 Reflexiona sobre esto: en una década, ¿cómo quieres que las personas recuerden su experiencia contigo en relación a ${keyword}? Nosotros hemos construido nuestra reputación pensando en ese legado, en ser recordados no por lo que vendimos, sino por las vidas que cambiamos.`,
            
            `💎 La verdadera autoridad en ${keyword} no se construye con promesas vacías, sino con una trayectoria sólida de resultados consistentes. Cada cliente que confía en nosotros se convierte en embajador de una filosofía que trasciende lo comercial: la búsqueda incansable de la excelencia.`,
            
            `🔮 Imagina por un momento el futuro de ${keyword}. Nosotros no solo lo imaginamos, lo estamos construyendo activamente. Cada innovación, cada mejora, cada nueva perspectiva que aportamos al mercado está diseñada pensando en las necesidades que aún no sabes que tienes.`
        ]
    };
    
    console.log(`[LOCAL-AI] Templates disponibles:`, Object.keys(templates));
    
    const platformLimits = {
        'Twitter': 240,
        'LinkedIn': 125,
        'Facebook': 500,
        'Instagram': 400,
        'TikTok': 300
    };
    
    const baseTemplates = templates[type] || templates['Informativo y educativo'];
    console.log(`[LOCAL-AI] Usando templates para tipo: ${type}, cantidad: ${baseTemplates.length}`);
    
    let content = baseTemplates[Math.floor(Math.random() * baseTemplates.length)];
    console.log(`[LOCAL-AI] Template base seleccionado: "${content}"`);
    
    // Agregar contexto si existe
    if (userContext && userContext.trim()) {
        content += ` ${userContext.trim()}`;
        console.log(`[LOCAL-AI] Agregado contexto: "${userContext}"`);
    }
    
    // Agregar CTA si se solicita
    if (includeCTA) {
        const ctas = [
            '¿Qué piensas sobre esto? Me encantaría conocer tu perspectiva en los comentarios.',
            'Reflexiona: ¿cómo aplicarías esto en tu situación particular? Comparte tu enfoque.',
            '¿Has experimentado algo similar? Tu experiencia podría inspirar a otros.',
            'Pregunta para reflexionar: ¿qué sería diferente en tu vida si aplicaras esto consistentemente?',
            '¿Cuál de estos puntos resuena más contigo? Me interesa saber por qué.',
            'Desafío personal: ¿te atreves a implementar esto en los próximos 7 días?',
            '¿Qué obstáculos ves para aplicar esto? Hablemos de soluciones juntos.'
        ];
        const selectedCTA = ctas[Math.floor(Math.random() * ctas.length)];
        content += ` ${selectedCTA}`;
        console.log(`[LOCAL-AI] Agregado CTA: "${selectedCTA}"`);
    }
    
    // Limitar según la plataforma
    const limit = platformLimits[platform] || 400;
    if (content.length > limit) {
        content = content.substring(0, limit - 3) + '...';
        console.log(`[LOCAL-AI] Contenido limitado a ${limit} caracteres`);
    }
    
    // Generar hashtags relevantes
    const hashtags = generateSmartHashtags(keyword, platform, type);
    console.log(`[LOCAL-AI] Hashtags generados: "${hashtags}"`);
    
    // Generar prompt para imagen/video según la plataforma
    const visualPrompt = generateVisualPrompt(platform, keyword, type, content);
    console.log(`[LOCAL-AI] Prompt visual generado: "${visualPrompt}"`);
    
    // Mejorar formato del contenido
    const formattedContent = formatContentText(content);
    
    const result = {
        copyType: type,
        content: formattedContent,
        hashtags: hashtags,
        platform: platform,
        visualPrompt: visualPrompt,
        generatedBy: '📄 Plantilla de Respaldo',
        isTemplate: true
    };
    
    console.log(`[FALLBACK] ⚠️ Plantilla generada como respaldo:`, result);
    return result;
}

// Función para generar hashtags inteligentes
function generateSmartHashtags(keyword, platform, type) {
    const baseHashtags = [`#${keyword.replace(/\s+/g, '')}`];
    
    const platformHashtags = {
        'Instagram': ['#insta', '#photo', '#viral', '#trending'],
        'TikTok': ['#fyp', '#viral', '#trending', '#tiktok'],
        'Twitter': ['#twitter', '#trending', '#viral'],
        'LinkedIn': ['#linkedin', '#professional', '#career', '#business'],
        'Facebook': ['#facebook', '#social', '#community']
    };
    
    const typeHashtags = {
        'Informativo y educativo': ['#tips', '#educational', '#learn', '#knowledge'],
        'Venta directa y persuasivo': ['#sale', '#offer', '#deal', '#limited'],
        'Posicionamiento y branding': ['#brand', '#quality', '#premium', '#leader']
    };
    
    const allHashtags = [
        ...baseHashtags,
        ...(platformHashtags[platform] || ['#social']),
        ...(typeHashtags[type] || ['#content']),
        '#marketing'
    ];
    
    // Seleccionar 4-5 hashtags aleatorios
    const selectedHashtags = [];
    const shuffled = allHashtags.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
        if (!selectedHashtags.includes(shuffled[i])) {
            selectedHashtags.push(shuffled[i]);
        }
    }
    
    return selectedHashtags.join(' ');
}

// Función fallback con ideas creativas
async function generateFallbackIdea(platform, keyword, type, userContext, includeCTA) {
    console.log(`[FALLBACK] Generando idea creativa para ${type}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const creativeIdeas = {
        'Informativo y educativo': `� Aquí tienes una reflexión profunda sobre ${keyword}: cada pequeño paso que das hacia la comprensión de este tema es en realidad una inversión en tu crecimiento personal. ${userContext ? `Especialmente considerando tu contexto: ${userContext}.` : ''} ¿Te has preguntado cómo este conocimiento podría impactar no solo tu presente, sino también las decisiones que tomarás en el futuro?`,
        
        'Venta directa y persuasivo': `🎯 Seamos honestos por un momento: la diferencia entre donde estás ahora y donde quieres estar con respecto a ${keyword} no es casualidad, es decisión. ${userContext ? `En tu situación específica: ${userContext}.` : ''} La pregunta real no es si necesitas actuar, sino si estás dispuesto a dar el primer paso hacia la transformación que buscas.`,
        
        'Posicionamiento y branding': `🌟 En el saturado universo de ${keyword}, nosotros elegimos un camino diferente: la autenticidad por encima de las promesas vacías. ${userContext ? `Entendemos particularmente situaciones como: ${userContext}.` : ''} Nuestra reputación no se construye con marketing, sino con resultados reales en la vida de personas reales.`
    };
    
    let content = creativeIdeas[type] || creativeIdeas['Informativo y educativo'];
    
    if (includeCTA) {
        content += ` ¿Qué opinas? Me gustaría conocer tu perspectiva sobre este enfoque.`;
    }
    
    const hashtags = generateSmartHashtags(keyword, platform, type);
    const formattedContent = formatContentText(content);
    const visualPrompt = generateVisualPrompt(platform, keyword, type, formattedContent);
    
    return {
        copyType: type,
        content: formattedContent,
        hashtags: hashtags,
        platform: platform,
        visualPrompt: visualPrompt
    };
}

// Función principal de generación
async function generateCopywritingClean() {
    console.log('🚀 [CLEAN-SYSTEM] Iniciando generación limpia...');
    
    const generateBtn = document.getElementById('generateCopyBtn');
    if (!generateBtn) {
        showNotification('❌ Botón de generación no encontrado', 'error');
        return;
    }
    
    const originalText = generateBtn.textContent;
    
    try {
        // Obtener datos del formulario
        const platform = getSelectedSocialNetworkSafe();
        const keyword = document.getElementById('copyKeyword')?.value?.trim() || '';
        const copyTypes = Array.from(document.querySelectorAll('input[name="copyTypes"]:checked'))
            .map(cb => cb.value);
        const userContext = document.getElementById('copyContext')?.value?.trim() || '';
        const includeCTA = document.getElementById('includeCTA')?.checked || false;
        
        console.log('[CLEAN-SYSTEM] Datos del formulario:');
        console.log('- Plataforma:', platform);
        console.log('- Keyword:', keyword);
        console.log('- Copy Types:', copyTypes);
        console.log('- Context:', userContext);
        console.log('- Include CTA:', includeCTA);
        
        // Validaciones
        if (!keyword) {
            showNotification('⚠️ Por favor ingresa una palabra clave', 'warning');
            return;
        }
        
        if (copyTypes.length === 0) {
            showNotification('⚠️ Por favor selecciona al menos un tipo de copy', 'warning');
            return;
        }
        
        if (copyTypes.length > 3) {
            showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
            return;
        }
        
        // Actualizar botón
        generateBtn.textContent = 'Generando...';
        generateBtn.disabled = true;
        
        // Mostrar progreso
        showGenerationProgress(platform, copyTypes.length);
        
        // Llamada a API de IA - Sistema robusto con múltiples alternativas
        console.log('[CLEAN-SYSTEM] Generando ideas con IA...');
        console.log('[CLEAN-SYSTEM] Tipos de copy a generar:', copyTypes);
        
        const generatedIdeas = [];
        
        for (let i = 0; i < copyTypes.length; i++) {
            const type = copyTypes[i];
            console.log(`[CLEAN-SYSTEM] Procesando tipo ${i + 1}/${copyTypes.length}: "${type}"`);
            
            try {
                const idea = await generateIdeaWithAI(platform, keyword, type, userContext, includeCTA);
                console.log(`[CLEAN-SYSTEM] Idea generada para "${type}":`, idea);
                generatedIdeas.push(idea);
            } catch (error) {
                console.error(`[CLEAN-SYSTEM] Error generando idea para ${type}:`, error);
                // Fallback con idea creativa
                const fallbackIdea = await generateFallbackIdea(platform, keyword, type, userContext, includeCTA);
                console.log(`[CLEAN-SYSTEM] Idea fallback para "${type}":`, fallbackIdea);
                generatedIdeas.push(fallbackIdea);
            }
        }
        
        console.log('[CLEAN-SYSTEM] Todas las ideas generadas:', generatedIdeas);
        const ideas = generatedIdeas;
        
        // Guardar ideas
        window.currentIdeas = {};
        ideas.forEach((idea, index) => {
            window.currentIdeas[`idea${index + 1}`] = idea;
        });
        
        // Mostrar resultados
        displayResultsClean(window.currentIdeas);
        
        const successCount = ideas.filter(idea => !idea.content.includes('Error al generar')).length;
        const errorCount = ideas.length - successCount;
        
        if (errorCount === 0) {
            showNotification(`✅ ${successCount} ideas generadas exitosamente para ${platform}`, 'success');
        } else if (successCount > 0) {
            showNotification(`⚠️ ${successCount} ideas generadas, ${errorCount} con errores`, 'warning');
        } else {
            showNotification(`❌ Error generando todas las ideas. Verifica tu conexión.`, 'error');
        }
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error en generación:', error);
        showNotification('❌ Error al generar ideas. Revisa la consola.', 'error');
    } finally {
        // Restaurar botón
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        hideGenerationProgress();
    }
}

// Función para mostrar resultados
function displayResultsClean(ideas) {
    console.log('[CLEAN-SYSTEM] === MOSTRANDO RESULTADOS ===');
    console.log('[CLEAN-SYSTEM] Ideas recibidas:', ideas);
    console.log('[CLEAN-SYSTEM] Tipo de ideas:', typeof ideas);
    console.log('[CLEAN-SYSTEM] Cantidad de ideas:', Object.keys(ideas).length);
    
    let resultsContainer = document.getElementById('results');
    if (!resultsContainer) {
        console.log('[CLEAN-SYSTEM] Creando contenedor de resultados...');
        // Crear contenedor de resultados si no existe
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'results';
        resultsContainer.style.cssText = `
            margin-top: 30px !important;
            padding: 30px !important;
            background: #f8f9fa !important;
            border-radius: 20px !important;
            border: 2px solid #e9ecef !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
            max-width: 100% !important;
            width: 100% !important;
            min-height: fit-content !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-sizing: border-box !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            display: flex !important;
            flex-direction: column !important;
            flex-grow: 1 !important;
        `;
        
        // Insertar después del formulario
        const form = document.getElementById('copywritingForm') || document.querySelector('form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(resultsContainer, form.nextSibling);
            console.log('[CLEAN-SYSTEM] Contenedor insertado después del formulario');
        } else {
            document.body.appendChild(resultsContainer);
            console.log('[CLEAN-SYSTEM] Contenedor agregado al body');
        }
    } else {
        console.log('[CLEAN-SYSTEM] Usando contenedor existente');
    }
    
    const ideaKeys = Object.keys(ideas);
    console.log('[CLEAN-SYSTEM] Claves de ideas:', ideaKeys);
    
    if (ideaKeys.length === 0) {
        console.log('[CLEAN-SYSTEM] No hay ideas para mostrar');
        resultsContainer.innerHTML = '<p style="color: #333; text-align: center; font-size: 16px; font-weight: bold;">No hay ideas para mostrar.</p>';
        return;
    }

    console.log('[CLEAN-SYSTEM] Generando HTML para mostrar...');
    
    let html = '<h2 style="color: #333 !important; margin-bottom: 20px; text-align: center; font-weight: bold; font-size: 24px;">💡 Ideas Generadas por IA</h2>';
    
    ideaKeys.forEach((key, index) => {
        const idea = ideas[key];
        const isError = idea.content.includes('Error al generar');
        
        console.log(`[CLEAN-SYSTEM] Procesando idea ${index + 1}:`, idea);
        
        html += `
            <div style="
                background: ${isError ? '#ffebee !important' : '#ffffff !important'};
                padding: 25px !important;
                margin: 20px 0 !important;
                border-radius: 15px !important;
                border-left: 4px solid ${isError ? '#f44336' : '#2196F3'} !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                border: 1px solid #e0e0e0 !important;
                width: 100% !important;
                min-height: fit-content !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                flex-grow: 1 !important;
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">
                <h3 style="
                    color: ${isError ? '#f44336' : '#1976D2'} !important; 
                    margin: 0 0 15px 0 !important; 
                    display: block !important; 
                    font-size: 18px !important; 
                    font-weight: bold !important;
                    font-family: Arial, sans-serif !important;
                    line-height: 1.4 !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    white-space: normal !important;
                ">
                    ${isError ? '❌' : (idea.isRealAI ? '🤖' : (idea.isTemplate ? '📄' : '✨'))} ${idea.copyType}${idea.generatedBy ? ` - ${idea.generatedBy}` : ''}
                </h3>
                <p style="
                    color: #212121 !important; 
                    line-height: 1.8 !important; 
                    margin: 0 0 20px 0 !important; 
                    font-size: 16px !important; 
                    font-weight: 400 !important;
                    font-family: Arial, sans-serif !important;
                    text-align: left !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    white-space: pre-line !important;
                    max-width: 100% !important;
                    min-height: fit-content !important;
                    height: auto !important;
                    overflow: visible !important;
                    hyphens: auto !important;
                    flex-grow: 1 !important;
                    display: block !important;
                ">${idea.content}</p>
                
                ${idea.visualPrompt ? `
                <div style="
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
                    padding: 15px !important;
                    border-radius: 10px !important;
                    border-left: 3px solid #28a745 !important;
                    margin: 15px 0 !important;
                ">
                    <h4 style="
                        color: #28a745 !important;
                        margin: 0 0 10px 0 !important;
                        font-size: 14px !important;
                        font-weight: bold !important;
                        font-family: Arial, sans-serif !important;
                    ">🎨 Prompt para Imagen/Video (${idea.platform}):</h4>
                    <p style="
                        color: #495057 !important;
                        font-size: 13px !important;
                        line-height: 1.6 !important;
                        margin: 0 !important;
                        font-family: Arial, sans-serif !important;
                        white-space: pre-line !important;
                    ">${idea.visualPrompt}</p>
                </div>
                ` : ''}
                
                <div style="
                    display: flex !important; 
                    flex-wrap: wrap !important;
                    justify-content: space-between !important; 
                    align-items: flex-start !important; 
                    margin-top: 20px !important; 
                    padding-top: 15px !important; 
                    border-top: 1px solid #e0e0e0 !important;
                    gap: 10px !important;
                ">
                    <p style="
                        color: #666666 !important; 
                        font-style: italic !important; 
                        margin: 0 !important; 
                        font-size: 14px !important;
                        font-family: Arial, sans-serif !important;
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                        white-space: normal !important;
                        flex: 1 !important;
                        min-width: 200px !important;
                    ">${idea.hashtags}</p>
                    <div style="display: flex !important; gap: 10px !important; flex-wrap: wrap !important;">
                        ${!isError ? `<button onclick="copyToClipboard('${key}')" style="
                            background: linear-gradient(45deg, #2196F3, #1976D2) !important;
                            color: white !important;
                            border: none !important;
                            padding: 10px 16px !important;
                            border-radius: 8px !important;
                            cursor: pointer !important;
                            font-size: 12px !important;
                            font-weight: 600 !important;
                            transition: all 0.2s ease !important;
                            box-shadow: 0 2px 8px rgba(33,150,243,0.3) !important;
                            font-family: Arial, sans-serif !important;
                            white-space: nowrap !important;
                            flex-shrink: 0 !important;
                        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 15px rgba(33,150,243,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(33,150,243,0.3)'">
                            📋 Copiar Copy
                        </button>` : ''}
                        ${!isError && idea.visualPrompt ? `<button onclick="copyVisualPrompt('${key}')" style="
                            background: linear-gradient(45deg, #28a745, #20c997) !important;
                            color: white !important;
                            border: none !important;
                            padding: 10px 16px !important;
                            border-radius: 8px !important;
                            cursor: pointer !important;
                            font-size: 12px !important;
                            font-weight: 600 !important;
                            transition: all 0.2s ease !important;
                            box-shadow: 0 2px 8px rgba(40,167,69,0.3) !important;
                            font-family: Arial, sans-serif !important;
                            white-space: nowrap !important;
                            flex-shrink: 0 !important;
                        " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 15px rgba(40,167,69,0.4)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(40,167,69,0.3)'">
                            🎨 Copiar Prompt Visual
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    console.log('[CLEAN-SYSTEM] HTML generado:', html.substring(0, 200) + '...');
    
    // Agregar estilos responsivos y de ajuste automático
    const responsiveStyle = document.createElement('style');
    responsiveStyle.innerHTML = `
        #results * {
            box-sizing: border-box !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
        }
        
        #results {
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
        }
        
        #results > div {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            height: auto !important;
        }
        
        @media (max-width: 768px) {
            #results > div > div:last-child {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 15px !important;
            }
            
            #results button {
                width: 100% !important;
                max-width: 200px !important;
            }
        }
    `;
    
    if (!document.getElementById('responsive-results-style')) {
        responsiveStyle.id = 'responsive-results-style';
        document.head.appendChild(responsiveStyle);
    }
    
    resultsContainer.innerHTML = html;
    
    // Asegurar que el contenedor sea visible
    resultsContainer.style.display = 'block';
    resultsContainer.style.visibility = 'visible';
    resultsContainer.style.opacity = '1';
    
    console.log('[CLEAN-SYSTEM] Contenido insertado en el DOM');
    
    // Scroll a resultados
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        console.log('[CLEAN-SYSTEM] Scroll a resultados ejecutado');
    }, 100);
}

// Manejar selección múltiple de tipos de copy
function handleCopyTypeSelectionClean() {
    const checkboxes = document.querySelectorAll('input[name="copyTypes"]');
    const maxSelections = 3;
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedCount = document.querySelectorAll('input[name="copyTypes"]:checked').length;
            
            if (selectedCount > maxSelections) {
                this.checked = false;
                showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
                return;
            }
            
            updateCopyTypeNoteClean(selectedCount);
        });
    });
}

// Actualizar nota explicativa
function updateCopyTypeNoteClean(selectedCount) {
    const noteElement = document.querySelector('.field-note');
    if (!noteElement) return;
    
    let noteText = '';
    if (selectedCount === 0) {
        noteText = '🎯 Selecciona 1-3 tipos de copy para generar ideas variadas.';
    } else if (selectedCount === 1) {
        noteText = '🎯 Obtendrás 3 variaciones del tipo seleccionado.';
    } else if (selectedCount === 2) {
        noteText = '🎯 Obtendrás 2 ideas del primer tipo + 1 del segundo.';
    } else if (selectedCount === 3) {
        noteText = '🎯 Obtendrás 1 idea de cada tipo seleccionado.';
    }
    
    noteElement.textContent = noteText;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ [CLEAN-SYSTEM] DOM cargado, inicializando...');
    
    try {
        // Manejar selección de tipos de copy
        handleCopyTypeSelectionClean();
        
        // Manejar envío del formulario
        const form = document.getElementById('copywritingForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                generateCopywritingClean();
            });
            console.log('✅ [CLEAN-SYSTEM] Formulario configurado');
        } else {
            console.warn('[CLEAN-SYSTEM] ⚠️ Formulario no encontrado');
            
            // Buscar formulario con otros selectores
            const alternativeForm = document.querySelector('form');
            if (alternativeForm) {
                alternativeForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    generateCopywritingClean();
                });
                console.log('✅ [CLEAN-SYSTEM] Formulario alternativo configurado');
            }
        }
        
        // Configurar botón de generar directamente
        const generateBtn = document.getElementById('generateCopyBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                generateCopywritingClean();
            });
            console.log('✅ [CLEAN-SYSTEM] Botón generar configurado');
        } else {
            console.warn('[CLEAN-SYSTEM] ⚠️ Botón generar no encontrado');
            
            // Buscar botón con otros selectores
            const alternativeBtn = document.querySelector('button[type="submit"], .btn-generate, .generate-btn');
            if (alternativeBtn) {
                alternativeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    generateCopywritingClean();
                });
                console.log('✅ [CLEAN-SYSTEM] Botón alternativo configurado');
            }
        }
        
        // Inicializar nota
        updateCopyTypeNoteClean(1);
        
        console.log('🎉 [CLEAN-SYSTEM] Sistema limpio inicializado correctamente');
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error en inicialización:', error);
    }
});

// Exponer funciones globalmente para compatibilidad
window.showNotification = showNotification;
window.generateCopywritingClean = generateCopywritingClean;
window.displayResultsClean = displayResultsClean;
window.copyToClipboard = copyToClipboard;
window.copyVisualPrompt = copyVisualPrompt;

console.log('✅ [CLEAN-SYSTEM] Script cargado correctamente');
