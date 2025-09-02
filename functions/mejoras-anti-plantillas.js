/**
 * MEJORAS ANTI-PLANTILLAS PARA CLOUD FUNCTIONS
 * Implementación controlada para evitar fallback a templates
 */

// 1. Función de validación mejorada
function isValidDeepseekResponse(response, platform) {
    if (!response) {
        console.log('[VALIDATION] Respuesta nula o undefined');
        return false;
    }
    
    // Si es objeto estructurado
    if (typeof response === 'object' && response.contenido) {
        const isValid = response.contenido.length >= 20;
        console.log(`[VALIDATION] Respuesta estructurada para ${platform}: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'} (${response.contenido.length} chars)`);
        return isValid;
    }
    
    // Si es string
    if (typeof response === 'string') {
        const trimmed = response.trim();
        
        // Longitud mínima reducida de 30 a 15 caracteres
        if (trimmed.length < 15) {
            console.log(`[VALIDATION] Respuesta muy corta para ${platform}: ${trimmed.length} chars`);
            return false;
        }
        
        // Verificar que no sea solo espacios, puntos o caracteres repetidos
        if (/^[\s\.]{3,}$/.test(trimmed)) {
            console.log(`[VALIDATION] Respuesta con solo espacios/puntos para ${platform}`);
            return false;
        }
        
        // Verificar que contenga palabras reales (no solo números o símbolos)
        const wordCount = (trimmed.match(/\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}\b/g) || []).length;
        if (wordCount < 3) {
            console.log(`[VALIDATION] Muy pocas palabras válidas para ${platform}: ${wordCount} palabras`);
            return false;
        }
        
        console.log(`[VALIDATION] Respuesta para ${platform}: VÁLIDA (${trimmed.length} chars, ${wordCount} palabras)`);
        return true;
    }
    
    console.log(`[VALIDATION] Tipo de respuesta no reconocido para ${platform}:`, typeof response);
    return false;
}

// 2. Timeout y reintentos mejorados
async function callDeepseekAPIWithRetry(prompt, platform = 'unknown', maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[DEEPSEEK] 🚀 Intento ${attempt}/${maxRetries} para ${platform}...`);
            
            // Timeout progresivo: aumenta con cada intento
            const timeout = attempt === 1 ? 35000 : attempt === 2 ? 45000 : 60000;
            console.log(`[DEEPSEEK] ⏱️ Timeout configurado: ${timeout/1000}s para intento ${attempt}`);
            
            const result = await callDeepseekAPI(prompt, timeout);
            console.log(`[DEEPSEEK] ✅ Éxito en intento ${attempt} para ${platform}`);
            return result;
        } catch (error) {
            console.log(`[DEEPSEEK] ❌ Intento ${attempt}/${maxRetries} falló para ${platform}: ${error.message}`);
            
            // Si es el último intento, lanzar el error
            if (attempt === maxRetries) {
                console.log(`[DEEPSEEK] 💔 Todos los intentos fallaron para ${platform}`);
                throw error;
            }
            
            // Pausa progresiva antes del reintento
            const delay = attempt === 1 ? 2000 : 3000;
            console.log(`[DEEPSEEK] ⏳ Esperando ${delay/1000}s antes del reintento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 3. Prompt mejorado para LinkedIn (ejemplo)
const improvedLinkedInPrompt = `📊 GENERA COPYWRITING PROFESIONAL PARA LINKEDIN

TEMA: "keyword_placeholder"
CONTEXTO: contexto_placeholder

📋 INSTRUCCIONES OBLIGATORIAS:
• Máximo 200 palabras total
• Tono profesional y reflexivo
• FORMATO OBLIGATORIO con iconos exactos mostrados abajo

🔥 ESTRUCTURA OBLIGATORIA (USA ESTOS ICONOS EXACTOS):

📊 Gancho Verbal Impactante: [Apertura profesional con dato o insight]

🔍 Texto del Post: [Análisis profesional o caso de estudio - máximo 120 palabras]

🤝 Llamada a la Acción (CTA): [Acción profesional persuasiva]

#️⃣ Hashtags: [3-7 hashtags profesionales]

🎨 Formato Visual Sugerido: [Descripción para IA: imagen profesional, infografía]

IMPORTANTE: Debe tener mínimo 100 palabras totales y usar EXACTAMENTE los iconos mostrados.`;

module.exports = {
    isValidDeepseekResponse,
    callDeepseekAPIWithRetry,
    improvedLinkedInPrompt
};
