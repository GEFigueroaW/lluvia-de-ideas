// =========================================
// SISTEMA LIMPIO - COPYWRITING CON IA REAL
// =========================================

console.log('🚀 [CLEAN-SYSTEM] Iniciando sistema limpio...');

// Variables globales necesarias
window.currentIdeas = {};

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
    
    try {
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

// Función para formatear contenido
function formatContentText(content) {
    return content
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\r/g, '')
        .replace(/\s+\n/g, '\n')
        .replace(/\n\s+/g, '\n');
}

// Función para generar contenido REAL con DeepSeek API
async function generateWithDeepSeek(platform, keyword, type, userContext, includeCTA) {
    console.log(`[DEEPSEEK] 🚀 Iniciando generación REAL con IA...`);
    
    const DEEPSEEK_API_KEY = 'sk-195d3e74fc904857a632ee7b22b174ff';
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    // Configuración de tokens optimizada para atención reducida (2025)
    const platformTokens = {
        'X / Twitter': 85,       // ~60 palabras - Lectura en 8-10 segundos
        'TikTok': 115,          // ~80 palabras - Atención visual, no textual
        'Instagram': 215,       // ~150 palabras - Stories de 5-7 segundos
        'WhatsApp': 170,        // ~120 palabras - Mensajes directos rápidos
        'Facebook': 285,        // ~200 palabras - Feed scroll rápido
        'LinkedIn': 360,        // ~250 palabras - Profesional pero conciso
        'YouTube': 430,         // ~300 palabras - Descripciones escaneables
        'Telegram': 200         // ~140 palabras - Lectura móvil rápida
    };
    
    const maxTokens = platformTokens[platform] || 215; // Instagram como default (optimizado)
    
    console.log(`[DEEPSEEK] 📏 OPTIMIZADO 2025: ${maxTokens} tokens para ${platform} (≈${Math.round(maxTokens * 0.7)} palabras máximo)`);
    
    // Mostrar límite actualizado en la interfaz
    if (typeof showPlatformWordLimit === 'function') {
        showPlatformWordLimit(platform, Math.round(maxTokens * 0.7));
    }
    
    // System prompt optimizado para máximo impacto en mínimas palabras
    const systemPrompt = `Eres un copywriter experto en capturar atención ultra-rápida especializado en ${platform}. 

REGLAS CRÍTICAS: 
- Responde SIEMPRE en español
- MÁXIMO ${Math.round(maxTokens * 0.7)} palabras para ${platform}
- Cada palabra debe ser IMPRESCINDIBLE
- Estructura: Hook (1 línea) + Insight (2 líneas) + CTA (1 línea)
- Elimina TODAS las palabras de relleno
- Usa números específicos, no generalidades
- Provoca reacción emocional inmediata en primeras 5 palabras`;
    
    // User prompts específicos con instrucciones de longitud
    let userPrompt = '';
    
    if (type === 'Informativo y educativo') {
        userPrompt = `Crea copy educativo ULTRA-CONCISO para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}` : ''}

LÍMITE ESTRICTO: MÁXIMO ${Math.round(maxTokens * 0.7)} palabras para ${platform}.

ESTRUCTURA OBLIGATORIA:
❌ [Creencia/error común en 5-7 palabras]
✅ [Insight contraintuitivo específico en 15-20 palabras]
💡 [Acción concreta implementable HOY en 8-12 palabras]

PROHIBIDO: 
- Palabras de relleno ("realmente", "básicamente", "en general")
- Explicaciones largas
- Teoría sin acción
- Frases cliché

${includeCTA ? 'CTA INTEGRADO: Incluye llamada a la acción EN LA ESTRUCTURA, no como anexo.' : 'SIN CTA final.'}

EJEMPLO DE CONCISIÓN:
❌ NO: "Muchas personas piensan que para ser exitoso necesitan trabajar muchísimas horas"
✅ SÍ: "Trabajar 12+ horas = menos productividad"

RESPONDE en español, MÁXIMO ${Math.round(maxTokens * 0.7)} palabras.`;
    } else if (type === 'Venta directa y persuasivo') {
        userPrompt = `Crea copy de venta ULTRA-PERSUASIVO para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}` : ''}

LÍMITE ESTRICTO: MÁXIMO ${Math.round(maxTokens * 0.7)} palabras para ${platform}.

ESTRUCTURA DE CONVERSIÓN:
🔥 [Frustración específica en 5-8 palabras]
⚡ [Solución + beneficio cuantificado en 15-20 palabras]
🎯 [CTA directo + urgencia real en 8-12 palabras]

REGLAS DE PERSUASIÓN:
- Usa números específicos, no "muchos" o "varios"
- Menciona consecuencia CALCULABLE de no actuar
- Incluye prueba social concreta (no genérica)
- Crea urgencia auténtica (fecha, cantidad, tiempo)

PROHIBIDO:
- Promesas vagas ("cambiar tu vida")
- Urgencia falsa ("solo por hoy")
- Superlativos sin prueba ("el mejor", "único")

${includeCTA ? 'CTA INTEGRADO: La llamada a la acción es PARTE de la estructura, no extra.' : 'SIN CTA adicional.'}

EJEMPLO:
🔥 NO: "¿Te cuesta conseguir clientes?" 
🔥 SÍ: "3 meses sin clientes nuevos"

RESPONDE en español, MÁXIMO ${Math.round(maxTokens * 0.7)} palabras.`;
    } else if (type === 'Posicionamiento y branding') {
        userPrompt = `Crea copy de autoridad ULTRA-CONCISO para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}` : ''}

LÍMITE ESTRICTO: MÁXIMO ${Math.round(maxTokens * 0.7)} palabras para ${platform}.

ESTRUCTURA DE AUTORIDAD:
💭 [Creencia común que desafías en 5-8 palabras]
🎪 [Tu filosofía única + ejemplo específico en 15-20 palabras]
🚀 [Para quién eres + resultado en 8-12 palabras]

CRITERIOS DE POSICIONAMIENTO:
- Demuestra experiencia con caso específico, no genérico
- Define claramente para quién NO eres (exclusividad)
- Presenta metodología/framework propio
- Usa datos concretos de tu experiencia

PROHIBIDO:
- Lenguaje corporativo vacío
- Afirmaciones sin respaldo específico
- "Ayudo a empresas" (muy genérico)
- "Años de experiencia" sin especificar

${includeCTA ? 'CTA INTEGRADO: Llamada a la acción ES PARTE de la estructura de autoridad.' : 'SIN CTA adicional.'}

EJEMPLO:
💭 NO: "El networking es clave para el éxito"
💭 SÍ: "Eventos networking = pérdida de tiempo"

RESPONDE en español, MÁXIMO ${Math.round(maxTokens * 0.7)} palabras.`;
    }
    
    const requestBody = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: maxTokens,
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
    const formattedContent = formatContentText(content);
    
    // Generar prompt visual
    let visualPrompt = generateVisualPrompt(platform, keyword, type, formattedContent);
    
    console.log(`[DEEPSEEK] 🎯 Contenido IA generado exitosamente`);
    
    return {
        content: formattedContent,
        platform: platform,
        copyType: type,
        generatedBy: '🤖 IA Real (DeepSeek)',
        isRealAI: true,
        visualPrompt: visualPrompt,
        cta: null, // Ya no se genera por separado
        includeCTA: includeCTA
    };
}

// Función para generar prompts visuales específicos y detallados
function generateVisualPrompt(platform, keyword, type, content) {
    const isVideo = platform === 'TikTok' || platform === 'YouTube';
    
    // Obtener formato y dimensiones específicas por plataforma
    const platformSpecs = {
        'Instagram': {
            format: 'imagen cuadrada 1080x1080px',
            aspectRatio: '1:1',
            orientation: 'cuadrada'
        },
        'Facebook': {
            format: 'imagen rectangular 1200x630px',
            aspectRatio: '16:9',
            orientation: 'horizontal'
        },
        'LinkedIn': {
            format: 'imagen rectangular 1200x627px',
            aspectRatio: '16:9',
            orientation: 'horizontal'
        },
        'X / Twitter': {
            format: 'imagen rectangular 1200x675px',
            aspectRatio: '16:9',
            orientation: 'horizontal'
        },
        'TikTok': {
            format: 'video vertical 1080x1920px',
            aspectRatio: '9:16',
            orientation: 'vertical'
        },
        'YouTube': {
            format: 'video horizontal 1920x1080px o thumbnail 1280x720px',
            aspectRatio: '16:9',
            orientation: 'horizontal'
        },
        'WhatsApp': {
            format: 'imagen cuadrada 1080x1080px',
            aspectRatio: '1:1',
            orientation: 'cuadrada'
        },
        'Telegram': {
            format: 'imagen rectangular 1280x640px',
            aspectRatio: '2:1',
            orientation: 'horizontal'
        }
    };
    
    const specs = platformSpecs[platform] || platformSpecs['Instagram'];
    
    // Extraer palabras clave del contenido para el prompt
    const mainTheme = keyword;
    const contentSnippet = content.substring(0, 100).replace(/[^\w\s]/gi, '');
    
    if (isVideo) {
        return `VIDEO PARA ${platform.toUpperCase()}:

ESPECIFICACIONES TÉCNICAS:
- Formato: ${specs.format}
- Relación de aspecto: ${specs.aspectRatio}
- Orientación: ${specs.orientation}
- Duración: 15-30 segundos para TikTok, 60-90 segundos para YouTube
- Calidad: HD mínimo, 4K preferible

CONTENIDO VISUAL:
- Protagonista: Persona profesional de 25-40 años explicando "${mainTheme}" de manera dinámica y educativa
- Escenario: Fondo limpio y profesional (oficina moderna, estudio, o exterior bien iluminado)
- Iluminación: Natural o profesional, evitar sombras duras
- Ángulos: Combinación de plano medio, primer plano y planos detalle
- Movimiento: Gestos naturales, transiciones suaves, elementos gráficos animados

ELEMENTOS GRÁFICOS SUPERPUESTOS:
- Título principal en español latino: relacionado con "${mainTheme}"
- Texto en pantalla: Tipografía sans-serif moderna, alta legibilidad
- Idioma: ESPAÑOL LATINO exclusivamente, ortografía impecable
- Tamaño de texto: Mínimo 24pt para legibilidad en móviles
- Contraste: Alto contraste entre texto y fondo para máxima visibilidad
- Animaciones: Aparición progresiva de puntos clave, íconos relevantes

ESTILO VISUAL:
- Paleta de colores: Profesional y moderna (azules, verdes, o colores corporativos)
- Estética: Limpia, minimalista, enfocada en el mensaje
- Marca de agua sutil (opcional)

ELEMENTOS DE ENGAGEMENT:
- Call-to-action visual al final
- Elementos que inviten a la interacción (flechas, íconos)
- Subtítulos completos en español latino con ortografía perfecta`;
    } else {
        return `IMAGEN PARA ${platform.toUpperCase()}:

ESPECIFICACIONES TÉCNICAS:
- Formato: ${specs.format}
- Relación de aspecto: ${specs.aspectRatio}
- Orientación: ${specs.orientation}
- Resolución: HD mínimo (300 DPI para impresión)
- Formato de archivo: PNG o JPG de alta calidad

COMPOSICIÓN VISUAL:
- Tema central: "${mainTheme}" representado de manera visualmente atractiva
- Estilo: Diseño gráfico profesional y moderno
- Layout: Composición equilibrada con jerarquía visual clara
- Espacio: Suficiente espacio en blanco para respiración visual

ELEMENTOS DE TEXTO:
- Idioma: ESPAÑOL LATINO exclusivamente
- Ortografía: Perfecta, sin errores gramaticales ni de acentuación
- Tipografía: Sans-serif moderna y legible (Arial, Helvetica, Roboto, o similar)
- Jerarquía tipográfica: Título principal (28-36pt), subtítulo (18-24pt), texto secundario (14-16pt)
- Contraste: Alto contraste entre texto y fondo para máxima legibilidad
- Alineación: Centrada o alineada a la izquierda según el diseño

CONTENIDO TEXTUAL SUGERIDO:
- Título principal: Frase impactante sobre "${mainTheme}"
- Elementos clave: 2-3 puntos principales del mensaje
- Call-to-action: Invitación clara a la acción
- Toda la información debe ser comprensible instantáneamente

PALETA DE COLORES:
- Primarios: Azules profesionales (#2196F3, #1976D2) o verdes corporativos (#4CAF50, #388E3C)
- Secundarios: Grises elegantes para texto (#424242, #757575)
- Acentos: Color vibrante para destacar elementos importantes (#FF5722, #E91E63)
- Fondo: Blanco o gris muy claro para máximo contraste

ELEMENTOS VISUALES:
- Íconos: Modernos, minimalistas, relacionados con "${mainTheme}"
- Formas geométricas: Simples y elegantes para enmarcar contenido
- Imágenes complementarias: Si se incluyen, que sean de alta calidad y relevantes
- Efectos: Sutiles sombras o gradientes para profundidad

OPTIMIZACIÓN PARA ${platform}:
- Legibilidad en dispositivos móviles garantizada
- Elementos importantes alejados de los bordes (margen de seguridad)
- Diseño que funcione tanto en feed como en vista completa
- Consistencia con la estética de la plataforma`;
    }
}

// Función de CTA de respaldo
function generateFallbackCTA(platform, type) {
    const ctas = {
        'Instagram': ['¿Qué opinas? Cuéntamelo en los comentarios 👇', 'Guarda este post si te sirvió ✨'],
        'LinkedIn': ['¿Cuál ha sido tu experiencia? Me encantaría leer tu perspectiva', 'Comparte si crees que puede ayudar a tu red'],
        'Facebook': ['Comparte tu experiencia en los comentarios', 'Etiqueta a alguien que necesite ver esto'],
        'TikTok': ['Comenta si te identificas 💭', 'Sígueme para más tips 🔥'],
        'Twitter': ['RT si estás de acuerdo 🔄', '¿Tu experiencia? Cuéntamela en los replies'],
        'YouTube': ['Dale like si te ayudó 👍', 'Suscríbete para más contenido así']
    };
    
    const platformCTAs = ctas[platform] || ctas['Instagram'];
    return platformCTAs[Math.floor(Math.random() * platformCTAs.length)];
}

// Función principal para generar ideas
async function generateIdeaWithAI(platform, keyword, type, userContext, includeCTA) {
    console.log(`[AI] 🤖 Generando idea REAL con IA para ${type}...`);
    
    try {
        return await generateWithDeepSeek(platform, keyword, type, userContext, includeCTA);
    } catch (error) {
        console.error(`[AI] Error con DeepSeek API:`, error);
        showNotification('Error con IA - usando sistema de respaldo', 'warning');
        return await generateFallbackIdea(platform, keyword, type, userContext, includeCTA);
    }
}

// Sistema de respaldo en caso de error con IA
async function generateFallbackIdea(platform, keyword, type, userContext, includeCTA) {
    console.log(`[FALLBACK] Usando sistema de respaldo para ${type}...`);
    
    // Usar las mismas configuraciones de longitud que la IA principal
    const platformWords = {
        'X / Twitter': 100,      // Tweets concisos
        'TikTok': 180,          // Videos cortos
        'Instagram': 320,       // Posts engagement óptimo
        'WhatsApp': 220,        // Mensajes directos
        'Facebook': 400,        // Posts con buen alcance
        'LinkedIn': 500,        // Contenido profesional
        'YouTube': 650,         // Descripciones completas
        'Telegram': 280         // Canales y grupos
    };
    
    const targetWords = platformWords[platform] || 320; // Instagram como default
    console.log(`[FALLBACK] 📏 Generando ≈${targetWords} palabras para ${platform}`);
    
    let content = '';
    
    if (type === 'Informativo y educativo') {
        if (platform === 'X / Twitter') {
            content = `🎯 La verdad sobre ${keyword} que nadie menciona:

El 80% comete este error básico ↓

${keyword} no es lo que piensas. Requiere un enfoque contraintuitivo que el 95% ignora.

3 insights clave:
→ Los resultados dependen de factores ocultos
→ La implementación correcta está en los detalles
→ El timing es más importante que la técnica

${userContext ? `Para tu caso: ${userContext.substring(0, 50)}...` : ''}

¿Estás dispuesto a cuestionar lo que creías saber?${includeCTA ? '\n\n💬 Cuéntame: ¿cuál insight te sorprendió?' : ''}`;
        } else if (platform === 'TikTok') {
            content = `🎯 Lo que NADIE te dice sobre ${keyword}

La mayoría cree que es simple, pero...

¿Sabías que el 80% comete este error fundamental?

3 insights que cambiarán todo:
1. ${keyword} requiere un enfoque contraintuitivo
2. Los resultados dependen de factores que nadie menciona  
3. La implementación correcta está en los detalles

${userContext ? `En tu contexto: ${userContext.substring(0, 80)}` : ''}

La pregunta real: ¿estás dispuesto a cuestionar lo que creías saber?${includeCTA ? '\n\n💭 Comenta cuál insight te impactó más' : ''}`;
        } else {
            content = `🎯 Lo que nadie te dice sobre ${keyword}

La mayoría cree que ${keyword} es simple, pero hay aspectos ocultos que marcan la diferencia.

¿Sabías que el 80% de las personas comete este error fundamental?

Aquí tienes 3 insights que cambiarán tu perspectiva:

1. ${keyword} requiere un enfoque contraintuitivo
2. Los resultados dependen de factores que nadie menciona
3. La implementación correcta está en los detalles

${userContext ? `Aplicado a tu contexto: ${userContext}` : ''}

La pregunta real es: ¿estás dispuesto a cuestionar lo que creías saber?${includeCTA ? '\n\n💬 Cuéntame en los comentarios: ¿cuál de estos insights te sorprendió más?' : ''}`;
        }
    } else if (type === 'Venta directa y persuasivo') {
        if (platform === 'X / Twitter') {
            content = `🚨 REALIDAD BRUTAL sobre ${keyword}

El 95% falla porque ignora ESTO ↓

${keyword} no es lo que te vendieron. Es más complejo, pero más poderoso cuando se hace bien.

✅ Los que triunfan: conocen estos secretos
❌ Los que fallan: siguen consejos obsoletos

${userContext ? `Tu caso: ${userContext.substring(0, 60)}...` : ''}

La diferencia está en los próximos 30 días.${includeCTA ? '\n\n🔥 ¿Listo? Escríbeme "SÍ"' : ''}`;
        } else if (platform === 'TikTok') {
            content = `🚨 REALIDAD BRUTAL sobre ${keyword}

Mientras otros prometen resultados mágicos, te digo la verdad:

El 95% falla porque ignora ESTO ↓

${keyword} no es lo que te han vendido. Es más complejo, pero también más poderoso cuando lo haces bien.

✅ Los que triunfan saben estos secretos
❌ Los que fallan siguen consejos obsoletos

${userContext ? `En tu caso específico: ${userContext.substring(0, 100)}` : ''}

La diferencia entre éxito y fracaso está en los próximos 30 días.${includeCTA ? '\n\n🔥 ¿Listo para cambiar tu enfoque? Comenta "SÍ"' : ''}`;
        } else {
            content = `🚨 REALIDAD BRUTAL sobre ${keyword}

Mientras otros prometen resultados mágicos, te digo la verdad:

El 95% falla porque ignora ESTO ↓

${keyword} no es lo que te han vendido. Es más complejo, pero también más poderoso cuando lo haces bien.

✅ Los que triunfan saben estos secretos
❌ Los que fallan siguen consejos obsoletos

${userContext ? `En tu caso específico: ${userContext}` : ''}

La diferencia entre éxito y fracaso está en los próximos 30 días.${includeCTA ? '\n\n🔥 ¿Listo para cambiar tu enfoque? Escríbeme "SÍ" en los comentarios.' : ''}`;
        }
    } else {
        if (platform === 'X / Twitter') {
            content = `💡 Mi enfoque contrario sobre ${keyword}

Después de años: todos se equivocan.

La industria vende una mentira sobre ${keyword}.

Mi metodología:
→ Analizo lo que funciona REALMENTE  
→ Elimino modas que no sirven
→ Me enfoco en resultados, no teorías

${userContext ? `Tu contexto: ${userContext.substring(0, 50)}...` : ''}

No sigo tendencias. Creo estrategias que funcionan.${includeCTA ? '\n\n👑 Sígueme para más insights' : ''}`;
        } else if (platform === 'TikTok') {
            content = `💡 Mi enfoque contrario sobre ${keyword}

Después de años en esto, he descubierto que todos se equivocan.

La industria te vende una mentira sobre ${keyword}.

Mi metodología es diferente:
→ Analizo lo que funciona REALMENTE
→ Elimino lo que está de moda pero no sirve  
→ Me enfoco en resultados, no en teorías

${userContext ? `Para tu contexto: ${userContext.substring(0, 100)}` : ''}

No sigo tendencias. Creo estrategias que funcionan cuando otros fallan.${includeCTA ? '\n\n👑 Sígueme para más insights contraintuitivos' : ''}`;
        } else {
            content = `💡 Mi enfoque contrario sobre ${keyword}

Después de años en esto, he descubierto que todos se equivocan.

La industria te vende una mentira sobre ${keyword}.

Mi metodología es diferente:
→ Analizo lo que funciona REALMENTE
→ Elimino lo que está de moda pero no sirve
→ Me enfoco en resultados, no en teorías

${userContext ? `Para tu contexto: ${userContext}` : ''}

No sigo tendencias. Creo estrategias que funcionan cuando otros fallan.${includeCTA ? '\n\n👑 Sígueme para más insights contraintuitivos que realmente funcionan.' : ''}`;
        }
    }
    
    return {
        content: formatContentText(content),
        platform: platform,
        copyType: type,
        generatedBy: '🔄 Sistema de Respaldo',
        isRealAI: false,
        visualPrompt: generateVisualPrompt(platform, keyword, type, content),
        cta: null, // Ya no se genera por separado
        includeCTA: includeCTA
    };
}

// Función para generar 3 ideas
async function generateThreeIdeas() {
    console.log('[GENERATE] 🎯 Iniciando generación de 3 ideas...');
    
    // Obtener datos del formulario con los IDs correctos
    const platform = getSelectedSocialNetwork ? getSelectedSocialNetwork() : 'Instagram';
    const keyword = document.getElementById('copyKeyword').value.trim();
    const context = document.getElementById('copyContext').value.trim();
    const includeCTA = document.getElementById('includeCTA').checked;
    
    console.log('[GENERATE] Datos obtenidos:', {platform, keyword, context, includeCTA});
    
    if (!keyword) {
        showNotification('Por favor ingresa una palabra clave', 'warning');
        return;
    }
    
    // Mostrar loading en el contenedor correcto
    const resultsDiv = document.getElementById('ideasContainer');
    if (!resultsDiv) {
        showNotification('Error: No se encontró contenedor de resultados', 'error');
        return;
    }
    
    resultsDiv.innerHTML = `
        <div class="modern-content-card has-text-centered" style="min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div style="font-size: 3em; margin-bottom: 20px;">🤖</div>
            <div style="font-size: 1.5em; margin-bottom: 10px; font-weight: 600;">Generando contenido con IA real...</div>
            <div style="color: #666; margin-bottom: 20px;">Esto puede tardar unos segundos</div>
            <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
    `;
    
    // Obtener tipos seleccionados del carousel
    const selectedTypes = getSelectedCopyTypes ? getSelectedCopyTypes() : [
        'Informativo y educativo',
        'Venta directa y persuasivo', 
        'Posicionamiento y branding'
    ];
    
    console.log('[GENERATE] 🎯 Tipos a generar:', selectedTypes);
    
    try {
        const ideas = await Promise.all(
            selectedTypes.map(type => generateIdeaWithAI(platform, keyword, type, context, includeCTA))
        );
        
        window.currentIdeas = {
            platform,
            keyword,
            context,
            includeCTA,
            ideas
        };
        
        displayResults(ideas);
        showNotification('¡3 ideas generadas con IA real!', 'success');
        
        // Guardar en historial
        if (typeof window.historyManager !== 'undefined') {
            try {
                window.historyManager.saveToHistory(platform, keyword, context, ideas, selectedTypes);
                console.log('[HISTORY] ✅ Sesión guardada en historial');
            } catch (error) {
                console.error('[HISTORY] Error al guardar en historial:', error);
            }
        }
        
    } catch (error) {
        console.error('[GENERATE] Error:', error);
        showNotification('Error al generar ideas', 'error');
        resultsDiv.innerHTML = `
            <div class="modern-content-card has-text-centered" style="min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="font-size: 2em; margin-bottom: 20px; color: #ff4444;">❌</div>
                <div style="font-size: 1.2em; margin-bottom: 10px; color: #ff4444;">Error al generar ideas</div>
                <div style="color: #666;">Intenta de nuevo</div>
            </div>
        `;
    }
}

// Función para mostrar resultados
function displayResults(ideas) {
    const resultsDiv = document.getElementById('ideasContainer');
    if (!resultsDiv) {
        console.error('[DISPLAY] No se encontró contenedor de resultados');
        return;
    }
    
    let html = `
        <div class="modern-content-card">
            <div style="margin-bottom: 30px; text-align: center;">
                <h2 style="color: #333; margin-bottom: 10px; font-size: 1.8rem; font-weight: 700;">🎯 3 Ideas Generadas</h2>
                <div style="color: #666; font-size: 0.9em;">
                    Plataforma: <strong style="color: #667eea;">${ideas[0].platform}</strong> | 
                    Palabra clave: <strong style="color: #667eea;">${window.currentIdeas.keyword}</strong>
                </div>
            </div>
    `;
    
    ideas.forEach((idea, index) => {
        const bgColor = index === 0 ? '#e3f2fd' : index === 1 ? '#f3e5f5' : '#e8f5e8';
        const borderColor = index === 0 ? '#2196f3' : index === 1 ? '#9c27b0' : '#4caf50';
        
        html += `
            <div style="
                border: 2px solid ${borderColor};
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 25px;
                background: ${bgColor};
                position: relative;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                ">
                    <h3 style="
                        color: ${borderColor};
                        margin: 0;
                        font-size: 1.1em;
                        font-weight: bold;
                    ">${idea.copyType}</h3>
                    <div style="
                        background: ${borderColor};
                        color: white;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 0.8em;
                        font-weight: bold;
                    ">${idea.generatedBy}</div>
                </div>
                
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    border-left: 4px solid ${borderColor};
                    white-space: pre-wrap;
                    line-height: 1.6;
                ">${idea.content}</div>
                
                <div style="
                    background: rgba(255,255,255,0.7);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                ">
                    <strong style="color: ${borderColor};">🎨 Prompt Visual:</strong><br>
                    <em>${idea.visualPrompt}</em>
                </div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="copyToClipboard('${index}', 'content')" style="
                        background: ${borderColor};
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 0.9em;
                    ">📋 Copiar Contenido</button>
                    
                    <button onclick="copyToClipboard('${index}', 'visual')" style="
                        background: rgba(${borderColor === '#2196f3' ? '33,150,243' : borderColor === '#9c27b0' ? '156,39,176' : '76,175,80'},0.6);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 0.9em;
                    ">🎨 Copiar Prompt Visual</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    resultsDiv.innerHTML = html;
}

// Función para copiar al portapapeles
function copyToClipboard(index, type) {
    const idea = window.currentIdeas.ideas[index];
    let textToCopy = '';
    
    if (type === 'content') {
        textToCopy = idea.content;
    } else if (type === 'visual') {
        textToCopy = idea.visualPrompt;
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const typeText = type === 'content' ? 'Contenido' : 'Prompt Visual';
            showNotification(`¡${typeText} copiado al portapapeles!`, 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showNotification('Error al copiar', 'error');
        });
    } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        const typeText = type === 'content' ? 'Contenido' : 'Prompt Visual';
        showNotification(`¡${typeText} copiado al portapapeles!`, 'success');
    }
}

// Event listeners cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] 🎯 Página cargada, configurando eventos...');
    
    // Buscar el botón correcto del formulario
    const generateBtn = document.getElementById('generateCopyBtn');
    const copyForm = document.getElementById('copywritingForm');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateThreeIdeas();
        });
        console.log('[INIT] ✅ Botón de generar configurado');
    } else {
        console.error('[INIT] ❌ No se encontró el botón generateCopyBtn');
    }
    
    if (copyForm) {
        copyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateThreeIdeas();
        });
        console.log('[INIT] ✅ Formulario configurado');
    }
    
    showNotification('🚀 Sistema IA optimizado 2025 - Copys ultra-concisos para máximo impacto!', 'success');
    
    // Inicializar el sistema de historial
    if (typeof window.historyManager !== 'undefined') {
        console.log('[INIT] ✅ Inicializando sistema de historial...');
        window.historyManager.loadHistory();
    } else {
        console.warn('[INIT] ⚠️ Sistema de historial no disponible');
    }
});

// Función para mostrar límite de palabras por plataforma
function showPlatformWordLimit(platform, wordLimit) {
    try {
        // Buscar contenedor donde mostrar la información
        const formSection = document.querySelector('#copywritingForm');
        if (!formSection) return;
        
        // Remover indicador anterior si existe
        const existingIndicator = document.querySelector('.optimization-notice');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Crear nuevo indicador
        const limitIndicator = document.createElement('div');
        limitIndicator.className = 'optimization-notice';
        limitIndicator.innerHTML = `
            <h4><span class="optimization-icon">⚡</span> Optimización 2025 Activada</h4>
            <p><strong>${platform}:</strong> Máximo <span class="platform-word-limit">${wordLimit} palabras</span> para capturar atención ultra-rápida</p>
        `;
        
        // Insertar antes del formulario
        formSection.parentNode.insertBefore(limitIndicator, formSection);
        
        // Auto-remover después de 8 segundos
        setTimeout(() => {
            if (limitIndicator.parentNode) {
                limitIndicator.style.animation = 'slideOutOptimization 0.5s ease';
                setTimeout(() => {
                    if (limitIndicator.parentNode) {
                        limitIndicator.parentNode.removeChild(limitIndicator);
                    }
                }, 500);
            }
        }, 8000);
        
    } catch (error) {
        console.log('[PLATFORM-LIMIT] Error al mostrar límite:', error);
    }
}

console.log('✅ [CLEAN-SYSTEM] Sistema cargado completamente');
