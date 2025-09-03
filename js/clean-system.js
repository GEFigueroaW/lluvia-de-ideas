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
    
    // System prompt base
    const systemPrompt = `Eres un copywriter experto y filósofo del comportamiento humano especializado en ${platform}. IMPORTANTE: Responde SIEMPRE en español. Tu especialidad es crear contenido que provoca reflexión profunda, desafía creencias limitantes y genera insights transformadores.`;
    
    // User prompts específicos
    let userPrompt = '';
    
    if (type === 'Informativo y educativo') {
        userPrompt = `Crea un copy educativo profundo para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}` : ''}

CRITERIOS OBLIGATORIOS:
- Ofrece insights específicos y contradictorios a lo que normalmente se piensa
- Incluye preguntas que obliguen a cuestionar creencias actuales  
- Presenta un ángulo que el 95% no ha considerado
- Ofrece una idea accionable implementable HOY
- Conecta con aspiraciones profundas de crecimiento

PROHIBIDO: Frases cliché, consejos obvios, información genérica
${!includeCTA ? 'NO incluyas call-to-action.' : ''}

RESPONDE EN ESPAÑOL con contenido genuinamente valioso.`;
    } else if (type === 'Venta directa y persuasivo') {
        userPrompt = `Crea un copy persuasivo poderoso para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}` : ''}

CRITERIOS OBLIGATORIOS:
- Describe una frustración específica y visceral
- Muestra consecuencias reales calculables de NO actuar
- Presenta una solución contraintuitiva
- Incluye prueba específica o resultado real
- Crea urgencia auténtica basada en factores reales

PROHIBIDO: Promesas vagas, urgencia falsa, CTAs obvios
${!includeCTA ? 'NO incluyas call-to-action.' : ''}

RESPONDE EN ESPAÑOL siendo persuasivo pero ético.`;
    } else if (type === 'Posicionamiento y branding') {
        userPrompt = `Crea un copy de branding y autoridad para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}` : ''}

CRITERIOS OBLIGATORIOS:
- Demuestra experiencia real con ejemplo concreto
- Presenta filosofía única que te distingue
- Ofrece predicción o insight sobre el futuro
- Comparte framework o metodología específica
- Define claramente para quién ERES y para quién NO

PROHIBIDO: Lenguaje corporativo vacío, afirmaciones sin respaldo
${!includeCTA ? 'NO incluyas call-to-action.' : ''}

RESPONDE EN ESPAÑOL posicionando como verdadero experto.`;
    }
    
    const requestBody = {
        model: "deepseek-chat",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 800,
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
    
    // Generar prompt visual y CTA
    let visualPrompt = generateVisualPrompt(platform, keyword, type, formattedContent);
    let ctaContent = null;
    
    if (includeCTA) {
        ctaContent = generateFallbackCTA(platform, type);
    }
    
    console.log(`[DEEPSEEK] 🎯 Contenido IA generado exitosamente`);
    
    return {
        content: formattedContent,
        platform: platform,
        copyType: type,
        generatedBy: '🤖 IA Real (DeepSeek)',
        isRealAI: true,
        visualPrompt: visualPrompt,
        cta: ctaContent,
        includeCTA: includeCTA
    };
}

// Función para generar prompts visuales
function generateVisualPrompt(platform, keyword, type, content) {
    const isVideo = platform === 'TikTok' || platform === 'YouTube';
    
    if (isVideo) {
        return `Video para ${platform}: Persona explicando "${keyword}" de manera visual. Ambiente profesional pero casual. Incluye elementos gráficos o texto en pantalla que refuerce el mensaje principal. Estilo educativo y atractivo visualmente.`;
    } else {
        return `Imagen para ${platform}: Diseño gráfico minimalista con colores que transmitan confianza. Incluye una frase clave de "${keyword}" con tipografía moderna. Estilo profesional que invite a leer el contenido completo.`;
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
    
    let content = '';
    
    if (type === 'Informativo y educativo') {
        content = `🎯 Lo que nadie te dice sobre ${keyword}

La mayoría cree que ${keyword} es simple, pero hay aspectos ocultos que marcan la diferencia.

¿Sabías que el 80% de las personas comete este error fundamental?

Aquí tienes 3 insights que cambiarán tu perspectiva:

1. ${keyword} requiere un enfoque contraintuitivo
2. Los resultados dependen de factores que nadie menciona
3. La implementación correcta está en los detalles

${userContext ? `Aplicado a tu contexto: ${userContext}` : ''}

La pregunta real es: ¿estás dispuesto a cuestionar lo que creías saber?`;
    } else if (type === 'Venta directa y persuasivo') {
        content = `🚨 REALIDAD BRUTAL sobre ${keyword}

Mientras otros prometen resultados mágicos, te digo la verdad:

El 95% falla porque ignora ESTO ↓

${keyword} no es lo que te han vendido. Es más complejo, pero también más poderoso cuando lo haces bien.

✅ Los que triunfan saben estos secretos
❌ Los que fallan siguen consejos obsoletos

${userContext ? `En tu caso específico: ${userContext}` : ''}

La diferencia entre éxito y fracaso está en los próximos 30 días.`;
    } else {
        content = `💡 Mi enfoque contrario sobre ${keyword}

Después de años en esto, he descubierto que todos se equivocan.

La industria te vende una mentira sobre ${keyword}.

Mi metodología es diferente:
→ Analizo lo que funciona REALMENTE
→ Elimino lo que está de moda pero no sirve
→ Me enfoco en resultados, no en teorías

${userContext ? `Para tu contexto: ${userContext}` : ''}

No sigo tendencias. Creo estrategias que funcionan cuando otros fallan.`;
    }
    
    return {
        content: formatContentText(content),
        platform: platform,
        copyType: type,
        generatedBy: '🔄 Sistema de Respaldo',
        isRealAI: false,
        visualPrompt: generateVisualPrompt(platform, keyword, type, content),
        cta: includeCTA ? generateFallbackCTA(platform, type) : null,
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
    
    const types = [
        'Informativo y educativo',
        'Venta directa y persuasivo', 
        'Posicionamiento y branding'
    ];
    
    try {
        const ideas = await Promise.all(
            types.map(type => generateIdeaWithAI(platform, keyword, type, context, includeCTA))
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
                
                ${idea.cta ? `
                    <div style="
                        background: rgba(255,255,255,0.7);
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 15px;
                        border: 1px dashed ${borderColor};
                    ">
                        <strong style="color: ${borderColor};">📢 Call-to-Action:</strong><br>
                        ${idea.cta}
                    </div>
                ` : ''}
                
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
                    
                    ${idea.cta ? `
                        <button onclick="copyToClipboard('${index}', 'cta')" style="
                            background: rgba(${borderColor === '#2196f3' ? '33,150,243' : borderColor === '#9c27b0' ? '156,39,176' : '76,175,80'},0.8);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 0.9em;
                        ">📢 Copiar CTA</button>
                    ` : ''}
                    
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
    } else if (type === 'cta') {
        textToCopy = idea.cta || '';
    } else if (type === 'visual') {
        textToCopy = idea.visualPrompt;
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('¡Copiado al portapapeles!', 'success');
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
        showNotification('¡Copiado al portapapeles!', 'success');
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
    
    showNotification('¡Sistema IA listo para generar contenido!', 'success');
});

console.log('✅ [CLEAN-SYSTEM] Sistema cargado completamente');
