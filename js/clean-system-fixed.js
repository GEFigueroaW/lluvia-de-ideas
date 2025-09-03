// =========================================
// SISTEMA LIMPIO - VERSIÓN CORREGIDA
// =========================================

console.log('🚀 [CLEAN-SYSTEM] Iniciando sistema limpio corregido...');

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
        userPrompt = `Crea un copy educativo profundo para ${platform} sobre "${keyword}". 
        ${userContext ? `Contexto: ${userContext}` : ''}
        
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
        userPrompt = `Crea un copy persuasivo poderoso para ${platform} sobre "${keyword}".
        ${userContext ? `Contexto: ${userContext}` : ''}
        
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
        userPrompt = `Crea un copy de branding y autoridad para ${platform} sobre "${keyword}".
        ${userContext ? `Contexto: ${userContext}` : ''}
        
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
    let visualPrompt;
    try {
        visualPrompt = await generateVisualPromptWithAI(platform, keyword, type, formattedContent);
    } catch (error) {
        console.log(`[DEEPSEEK] Error generando prompt visual, usando fallback`);
        visualPrompt = generateVisualPrompt(platform, keyword, type, formattedContent);
    }
    
    let ctaContent = null;
    if (includeCTA) {
        try {
            ctaContent = await generateCTAWithAI(platform, keyword, type, formattedContent);
        } catch (error) {
            console.log(`[DEEPSEEK] Error generando CTA, usando fallback`);
            ctaContent = generateFallbackCTA(platform, type);
        }
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

// Función para generar prompts visuales con IA
async function generateVisualPromptWithAI(platform, keyword, type, content) {
    const DEEPSEEK_API_KEY = 'sk-195d3e74fc904857a632ee7b22b174ff';
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    const systemPrompt = `Eres un experto en prompts para IA visual. IMPORTANTE: Responde SIEMPRE en español.`;
    const userPrompt = `Crea un prompt para generar contenido visual en ${platform} sobre "${keyword}" que complemente: "${content.substring(0, 200)}..."`;
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.6,
            max_tokens: 250
        })
    });
    
    if (!response.ok) throw new Error('Error en prompt visual');
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Función para generar CTA con IA
async function generateCTAWithAI(platform, keyword, type, content) {
    const DEEPSEEK_API_KEY = 'sk-195d3e74fc904857a632ee7b22b174ff';
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    const systemPrompt = `Eres un experto en calls-to-action. IMPORTANTE: Responde SIEMPRE en español.`;
    const userPrompt = `Crea UN call-to-action específico para ${platform} sobre "${keyword}" que complemente: "${content.substring(0, 200)}..."`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.6,
                max_tokens: 100
            })
        });
        
        if (!response.ok) throw new Error('Error en CTA');
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        return generateFallbackCTA(platform, type);
    }
}

// Función de CTA de respaldo
function generateFallbackCTA(platform, type) {
    const ctas = {
        'Instagram': ['¿Qué opinas? Cuéntamelo en los comentarios 👇', 'Guarda este post si te sirvió ✨'],
        'LinkedIn': ['¿Cuál ha sido tu experiencia? Me encantaría leer tu perspectiva', 'Comparte si crees que puede ayudar a tu red'],
        'Facebook': ['Comparte tu experiencia en los comentarios', 'Etiqueta a alguien que necesite ver esto'],
        'TikTok': ['Comenta si te identificas 💭', 'Sígueme para más tips 🔥'],
        'Twitter': ['RT si estás de acuerdo 🔄', '¿Tu experiencia? Cuéntamela en los replies']
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

// Resto de funciones necesarias del sistema original...
// (Aquí irían las demás funciones como formatContentText, generateVisualPrompt, etc.)

console.log('✅ [CLEAN-SYSTEM] Sistema corregido cargado');
