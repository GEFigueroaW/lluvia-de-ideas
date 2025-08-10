/**
 * =========================================
 * MÓDULO DE COPYWRITING PARA REDES SOCIALES
 * =========================================
 */

// Importar dependencias necesarias
import { functions } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { showNotification } from './utils.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-functions.js';

// Configuración de redes sociales
const SOCIAL_NETWORKS = {
    facebook: {
        name: 'Facebook',
        icon: 'fab fa-facebook-f',
        color: '#1877F2',
        premium: false
    },
    linkedin: {
        name: 'LinkedIn',
        icon: 'fab fa-linkedin-in',
        color: '#0A66C2',
        premium: true
    },
    twitter: {
        name: 'X / Twitter',
        icon: 'fab fa-x-twitter',
        color: '#000000',
        premium: true
    },
    whatsapp: {
        name: 'WhatsApp',
        icon: 'fab fa-whatsapp',
        color: '#25D366',
        premium: true
    },
    telegram: {
        name: 'Telegram',
        icon: 'fab fa-telegram-plane',
        color: '#0088CC',
        premium: true
    },
    reddit: {
        name: 'Reddit',
        icon: 'fab fa-reddit-alien',
        color: '#FF4500',
        premium: true
    },
    instagram: {
        name: 'Instagram',
        icon: 'fab fa-instagram',
        color: '#E4405F',
        premium: true
    },
    tiktok: {
        name: 'TikTok',
        icon: 'fab fa-tiktok',
        color: '#000000',
        premium: true
    },
    youtube: {
        name: 'YouTube',
        icon: 'fab fa-youtube',
        color: '#FF0000',
        premium: true
    }
};

// Tipos de copy
const COPY_TYPES = {
    'benefit': {
        name: 'De beneficio o solución',
        description: 'Cómo el producto mejora la vida del cliente.',
        premium: true
    },
    'launch': {
        name: 'De novedad o lanzamiento',
        description: 'Anuncia algo nuevo para atraer atención inmediata.',
        premium: true
    },
    'interaction': {
        name: 'De interacción o pregunta',
        description: 'Diseñado para generar respuestas de la audiencia.',
        premium: true
    },
    'urgency': {
        name: 'De urgencia o escasez',
        description: 'Genera sensación de urgencia para actuar.',
        premium: true
    },
    'educational': {
        name: 'Informativo o educativo',
        description: 'Comparte conocimiento útil.',
        premium: false
    },
    'informal': {
        name: 'Informal',
        description: 'Tono casual, cercano.',
        premium: false
    },
    'cta': {
        name: 'Llamada a la acción (CTA)',
        description: 'Motiva acción directa (comprar, registrarse).',
        premium: true
    },
    'storytelling': {
        name: 'Narrativo o storytelling',
        description: 'Cuenta una historia emocional.',
        premium: true
    },
    'branding': {
        name: 'Posicionamiento o branding',
        description: 'Refuerza imagen de marca.',
        premium: true
    },
    'testimonial': {
        name: 'Testimonio o prueba social',
        description: 'Muestra experiencias positivas de otros usuarios.',
        premium: true
    },
    'technical': {
        name: 'Técnico o profesional',
        description: 'Información especializada o técnica.',
        premium: false
    },
    'sales': {
        name: 'Venta directa o persuasivo',
        description: 'Convencimiento directo para cerrar ventas.',
        premium: true
    }
};

// Variables globales
let selectedSocialNetworks = new Set(['facebook']); // Facebook por defecto
let currentGenerationMode = 'multi';

let isUserPremium = false; // Se actualizará con el estado real del usuario

// Permitir que el main.js actualice el estado premium y refresque la UI
window.setCopywritingPremiumStatus = function(premium) {
    console.log('[COPYWRITING] setCopywritingPremiumStatus llamado con:', premium);
    isUserPremium = premium;
    
    // Si el DOM ya está listo, actualizar inmediatamente
    if (document.readyState === 'loading') {
        console.log('[COPYWRITING] DOM aún cargando, esperando...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[COPYWRITING] DOM listo, actualizando redes sociales...');
            setupSocialNetworks();
            setupCopyTypes();
            updatePremiumNotifications();
        });
    } else {
        console.log('[COPYWRITING] DOM listo, actualizando inmediatamente...');
        setupSocialNetworks();
        setupCopyTypes();
        updatePremiumNotifications();
    }
};

/**
 * Actualiza solo las notificaciones de premium sin alterar el estado
 */
function updatePremiumNotifications() {
    console.log('[COPYWRITING] updatePremiumNotifications llamado, isUserPremium:', isUserPremium);
    
    const notes = document.querySelectorAll('#socialNetworkNote, #copyTypeNote');
    notes.forEach(note => {
        if (isUserPremium) {
            note.textContent = '👑 Usuario Premium - Acceso completo a todas las funciones';
            note.style.color = '#10b981';
        } else {
            note.textContent = 'Usuario gratuito - Funciones limitadas';
            note.style.color = '#6b7280';
        }
    });
    
    console.log('[COPYWRITING] Notificaciones actualizadas');
}

/**
 * Inicializa el módulo de copywriting
 */
function initializeCopywriting() {
    console.log('[COPYWRITING] Inicializando módulo de copywriting...');
    console.log('[COPYWRITING] isUserPremium inicial:', isUserPremium);
    
    // Solo configurar elementos básicos aquí
    setupEventListeners();
    
    // Las redes sociales y tipos de copy se configurarán cuando se reciba el estado premium
    // desde main.js a través de setCopywritingPremiumStatus()
    
    console.log('[COPYWRITING] Módulo inicializado - esperando estado premium desde main.js');
}

/**
 * Configura la grilla de redes sociales
 */
function setupSocialNetworks() {
    console.log('[COPYWRITING] setupSocialNetworks iniciado, isUserPremium:', isUserPremium);
    const container = document.getElementById('socialNetworksContainer');
    if (!container) {
        console.log('[COPYWRITING] ERROR: No se encontró socialNetworksContainer');
        return;
    }

    container.innerHTML = '';

    Object.entries(SOCIAL_NETWORKS).forEach(([key, network]) => {
        const item = document.createElement('div');
        const isDisabled = !isUserPremium && network.premium;
        item.className = `social-network-item ${isDisabled ? 'disabled' : ''}`;
        item.dataset.network = key;

        // Facebook siempre seleccionado por defecto
        if (key === 'facebook') {
            item.classList.add('selected');
        }

        item.innerHTML = `
            <i class="${network.icon} social-network-icon" style="color: ${network.color}"></i>
            <span class="social-network-name">${network.name}</span>
        `;

        if (!network.premium || isUserPremium) {
            item.addEventListener('click', () => toggleSocialNetwork(key, item));
        }

        container.appendChild(item);
        
        // Log específico para depuración
        if (network.premium) {
            console.log(`[COPYWRITING] Red ${network.name}: ${isDisabled ? 'DESHABILITADA' : 'HABILITADA'}`);
        }
    });
    
    console.log('[COPYWRITING] setupSocialNetworks completado');
}

/**
 * Configura el select de tipos de copy
 */
function setupCopyTypes() {
    const select = document.getElementById('copyType');
    if (!select) return;

    select.innerHTML = '<option value="">Selecciona el tipo de copy...</option>';

    Object.entries(COPY_TYPES).forEach(([key, copyType]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = copyType.name;
        
        if (!isUserPremium && copyType.premium) {
            option.disabled = true;
            option.textContent += ' (Premium)';
        }

        select.appendChild(option);
    });
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Modo de generación
    document.querySelectorAll('input[name="generationMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentGenerationMode = e.target.value;
            updateSocialNetworkSelection();
        });
    });

    // Tipo de copy
    const copyTypeSelect = document.getElementById('copyType');
    if (copyTypeSelect) {
        copyTypeSelect.addEventListener('change', (e) => {
            showCopyTypeDescription(e.target.value);
        });
    }

    // Formulario
    const form = document.getElementById('copywritingForm');
    if (form) {
        form.addEventListener('submit', handleCopywritingSubmit);
    }
}

/**
 * Alterna la selección de una red social
 */
function toggleSocialNetwork(networkKey, element) {
    if (element.classList.contains('disabled')) return;

    if (currentGenerationMode === 'single') {
        // Modo single: solo una red social
        document.querySelectorAll('.social-network-item').forEach(item => {
            item.classList.remove('selected');
        });
        selectedSocialNetworks.clear();
        
        element.classList.add('selected');
        selectedSocialNetworks.add(networkKey);
    } else {
        // Modo multi: múltiples redes sociales (MÁXIMO 3 para evitar timeout)
        if (selectedSocialNetworks.has(networkKey)) {
            // Si es Facebook y es el único seleccionado, no permitir deseleccionar
            if (networkKey === 'facebook' && selectedSocialNetworks.size === 1) {
                showNotification('Facebook debe estar siempre seleccionado para usuarios gratuitos', 'warning');
                return;
            }
            
            selectedSocialNetworks.delete(networkKey);
            element.classList.remove('selected');
        } else {
            // LÍMITE: Máximo 3 redes sociales para evitar timeout
            if (selectedSocialNetworks.size >= 3) {
                showNotification('Máximo 3 redes sociales para optimizar velocidad de generación', 'warning');
                return;
            }
            
            selectedSocialNetworks.add(networkKey);
            element.classList.add('selected');
        }
    }

    updateSocialNetworkNote();
}

/**
 * Actualiza la selección de redes sociales según el modo
 */
function updateSocialNetworkSelection() {
    if (currentGenerationMode === 'single') {
        // En modo single, solo mantener Facebook
        selectedSocialNetworks.clear();
        selectedSocialNetworks.add('facebook');
        
        document.querySelectorAll('.social-network-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.network === 'facebook') {
                item.classList.add('selected');
            }
        });
    }
    
    updateSocialNetworkNote();
}

/**
 * Actualiza la nota de redes sociales
 */
function updateSocialNetworkNote() {
    const note = document.getElementById('socialNetworkNote');
    if (!note) return;

    const count = selectedSocialNetworks.size;
    if (currentGenerationMode === 'single') {
        note.textContent = 'Selecciona UNA red social para generar 3 ideas diferentes';
    } else {
        note.textContent = `${count}/3 red${count !== 1 ? 'es' : ''} social${count !== 1 ? 'es' : ''} seleccionada${count !== 1 ? 's' : ''} - Máximo 3 para optimizar velocidad`;
    }
}

/**
 * Muestra la descripción del tipo de copy seleccionado
 */
function showCopyTypeDescription(copyTypeKey) {
    const descriptionDiv = document.getElementById('copyTypeDescription');
    if (!descriptionDiv || !copyTypeKey) {
        descriptionDiv.style.display = 'none';
        return;
    }

    const copyType = COPY_TYPES[copyTypeKey];
    if (copyType) {
        descriptionDiv.innerHTML = `
            <strong>${copyType.name}:</strong> ${copyType.description}
        `;
        descriptionDiv.classList.add('show');
        descriptionDiv.style.display = 'block';
    }
}

/**
 * Actualiza el estado del usuario internamente (solo cuando sea necesario)
 * NOTA: No debe sobrescribir isUserPremium cuando viene desde main.js
 */
function updateUserStatusInternal() {
    console.log('[COPYWRITING] updateUserStatusInternal llamado, isUserPremium actual:', isUserPremium);
    
    // NO sobrescribir isUserPremium aquí, ya viene actualizado desde main.js
    // isUserPremium ya fue establecido por setCopywritingPremiumStatus()
    
    setupSocialNetworks();
    setupCopyTypes();
    updatePremiumNotifications();
    
    console.log('[COPYWRITING] Estado interno actualizado - isUserPremium:', isUserPremium);
}

/**
 * Maneja el envío del formulario de copywriting
 */
async function handleCopywritingSubmit(e) {
    e.preventDefault();
    
    const keyword = document.getElementById('copyKeyword').value.trim();
    const copyType = document.getElementById('copyType').value;
    const context = document.getElementById('copyContext').value.trim();
    
    if (!keyword) {
        showNotification('Por favor ingresa una palabra clave o tema', 'warning');
        return;
    }
    
    if (!copyType) {
        showNotification('Por favor selecciona un tipo de copy', 'warning');
        return;
    }
    
    if (selectedSocialNetworks.size === 0) {
        showNotification('Por favor selecciona al menos una red social', 'warning');
        return;
    }
    
    try {
        await generateCopywriting({
            keyword,
            copyType,
            context,
            socialNetworks: Array.from(selectedSocialNetworks),
            generationMode: currentGenerationMode
        });
    } catch (error) {
        console.error('Error al generar copywriting:', error);
        showNotification('Error al generar el copywriting', 'error');
    }
}

/**
 * Genera el copywriting usando la API
 */
async function generateCopywriting(params) {
    const generateBtn = document.getElementById('generateCopyBtn');
    const originalText = generateBtn.innerHTML;
    
    try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';
        
        // Verificar que las dependencias estén disponibles
        if (!functions) {
            throw new Error('Firebase Functions no está disponible');
        }
        
        if (!getCurrentUser()) {
            throw new Error('Usuario no autenticado');
        }
        
        // Construir el prompt para la IA
        const prompt = buildCopywritingPrompt(params);
        console.log('[COPYWRITING] Prompt generado:', prompt);
        
        // Llamar a la función de Cloud Functions (usando la existente)
        const generateFunction = httpsCallable(functions, 'api');
        console.log('[COPYWRITING] Llamando a Cloud Function...');
        
        // Mapear los parámetros al formato que espera la Cloud Function
        const cloudFunctionParams = {
            generationMode: params.generationMode || 'single', // 'single' o 'multi'
            socialMedia: params.socialNetworks.map(net => SOCIAL_NETWORKS[net] ? SOCIAL_NETWORKS[net].name : net), // Nombres de las redes
            keyword: params.keyword.trim(),
            copyType: COPY_TYPES[params.copyType] ? COPY_TYPES[params.copyType].name : params.copyType, // Nombre del tipo de copy
            context: params.context || '', // CONTEXTO ADICIONAL DEL USUARIO
            language: 'es' // Español por defecto
        };
        
        // Validar parámetros antes de enviar
        if (!cloudFunctionParams.socialMedia || cloudFunctionParams.socialMedia.length === 0) {
            throw new Error('No se seleccionó ninguna red social');
        }
        
        if (!cloudFunctionParams.keyword || cloudFunctionParams.keyword.length === 0) {
            throw new Error('La palabra clave es requerida');
        }
        
        if (!cloudFunctionParams.copyType) {
            throw new Error('El tipo de copy es requerido');
        }
        
        console.log('[COPYWRITING] Parámetros validados y enviados a Cloud Function:', cloudFunctionParams);
        
        const result = await generateFunction(cloudFunctionParams);
        
        console.log('[COPYWRITING] Resultado de Cloud Function:', result);
        
        // La Cloud Function devuelve { success: true, ideas: [...] }
        const copies = result.data.ideas;
        console.log('[COPYWRITING] Ideas generadas:', copies);
        
        // Mostrar los resultados
        displayCopywritingResults(copies, params);
        
        // Guardar en historial
        await saveCopywritingSession(copies, params);
        
        showNotification('¡Copywriting generado exitosamente!', 'success');
        
    } catch (error) {
        console.error('[COPYWRITING] Error completo:', error);
        
        // Manejo específico de errores
        let errorMessage = 'Error al generar el copywriting';
        
        if (error.code === 'unauthenticated') {
            errorMessage = 'Debes iniciar sesión para generar copywriting';
        } else if (error.code === 'failed-precondition') {
            errorMessage = 'Has agotado tus créditos semanales. Actualiza a Premium para continuar.';
        } else if (error.code === 'permission-denied') {
            errorMessage = 'Esta función requiere una cuenta Premium';
        } else if (error.code === 'invalid-argument') {
            errorMessage = 'Los parámetros enviados no son válidos. Verifica tu selección.';
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }
        
        showNotification(errorMessage, 'error');
        
        // Log detallado para debugging
        console.error('[COPYWRITING] Detalles del error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            stack: error.stack
        });
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalText;
    }
}

// Configuraciones específicas para cada red social
const SOCIAL_NETWORK_SPECS = {
    facebook: {
        name: 'Facebook',
        characteristics: {
            maxLength: 2200,
            optimalLength: '50-80 palabras',
            tone: 'conversacional y personal',
            features: 'storytelling, emociones, comunidad',
            hashtags: 'máximo 2-3 hashtags',
            engagement: 'preguntas, polls, contenido que genere conversación',
            cta: 'botones de acción, enlaces externos'
        }
    },
    linkedin: {
        name: 'LinkedIn',
        characteristics: {
            maxLength: 3000,
            optimalLength: '100-150 palabras',
            tone: 'profesional pero humano',
            features: 'insights profesionales, networking, valor educativo',
            hashtags: '3-5 hashtags profesionales',
            engagement: 'comentarios reflexivos, conexiones profesionales',
            cta: 'invitaciones a conectar, compartir experiencias'
        }
    },
    twitter: {
        name: 'X / Twitter',
        characteristics: {
            maxLength: 280,
            optimalLength: '120-180 caracteres',
            tone: 'directo y conciso',
            features: 'trending topics, tiempo real, viralidad',
            hashtags: '2-3 hashtags estratégicos',
            engagement: 'retweets, menciones, hilos',
            cta: 'enlaces cortos, menciones a usuarios'
        }
    },
    whatsapp: {
        name: 'WhatsApp',
        characteristics: {
            maxLength: 4096,
            optimalLength: '30-60 palabras',
            tone: 'personal e íntimo',
            features: 'mensajería directa, urgencia, exclusividad',
            hashtags: 'no son efectivos',
            engagement: 'respuestas directas, llamadas a la acción',
            cta: 'números de teléfono, enlaces directos'
        }
    },
    telegram: {
        name: 'Telegram',
        characteristics: {
            maxLength: 4096,
            optimalLength: '80-120 palabras',
            tone: 'informativo y técnico',
            features: 'canales, bots, comunidades especializadas',
            hashtags: 'uso moderado',
            engagement: 'forwards, reacciones, polls',
            cta: 'enlaces a canales, bots interactivos'
        }
    },
    reddit: {
        name: 'Reddit',
        characteristics: {
            maxLength: 40000,
            optimalLength: '150-300 palabras',
            tone: 'auténtico y comunitario',
            features: 'subreddits especializados, discusiones profundas',
            hashtags: 'no se usan',
            engagement: 'upvotes, comentarios detallados',
            cta: 'discusión, AMA, recursos útiles'
        }
    },
    instagram: {
        name: 'Instagram',
        characteristics: {
            maxLength: 2200,
            optimalLength: '100-150 palabras',
            tone: 'visual y aspiracional',
            features: 'contenido visual, stories, reels',
            hashtags: '5-10 hashtags relevantes',
            engagement: 'likes, shares, saves',
            cta: 'enlaces en bio, stories interactivas'
        }
    },
    tiktok: {
        name: 'TikTok',
        characteristics: {
            maxLength: 2200,
            optimalLength: '50-100 palabras',
            tone: 'joven y trendy',
            features: 'videos cortos, trends, música',
            hashtags: '3-5 hashtags trending',
            engagement: 'duetos, challenges, comentarios',
            cta: 'follow, like, share'
        }
    },
    youtube: {
        name: 'YouTube',
        characteristics: {
            maxLength: 5000,
            optimalLength: '200-400 palabras',
            tone: 'educativo y entretenido',
            features: 'videos largos, tutoriales, entretenimiento',
            hashtags: '3-5 hashtags en descripción',
            engagement: 'suscripciones, likes, comentarios',
            cta: 'suscribirse, campana de notificaciones'
        }
    }
};

/**
 * Construye el prompt para la IA según los parámetros
 */
function buildCopywritingPrompt(params) {
    const { keyword, copyType, context, socialNetworks, generationMode } = params;
    const copyTypeInfo = COPY_TYPES[copyType];
    
    if (generationMode === 'single') {
        // Generar 3 variaciones para una sola red social
        const networkKey = socialNetworks[0];
        const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
        
        return `Genera 3 variaciones de copywriting profesional para ${networkSpec.name} sobre "${keyword}".

TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}

ESPECIFICACIONES PARA ${networkSpec.name.toUpperCase()}:
- Longitud óptima: ${networkSpec.characteristics.optimalLength}
- Tono: ${networkSpec.characteristics.tone}
- Características clave: ${networkSpec.characteristics.features}
- Hashtags: ${networkSpec.characteristics.hashtags}
- Engagement: ${networkSpec.characteristics.engagement}
- Call-to-action: ${networkSpec.characteristics.cta}

${context ? `CONTEXTO ADICIONAL: ${context}\n` : ''}

INSTRUCCIONES:
1. Crea 3 enfoques diferentes pero todos optimizados para ${networkSpec.name}
2. Respeta las características específicas de la plataforma
3. Cada variación debe tener un hook diferente
4. Incluye emojis apropiados para el tono de ${networkSpec.name}
5. Asegúrate de que el call-to-action sea específico para esta plataforma

FORMATO DE RESPUESTA:
Variación 1: [texto completo]
Variación 2: [texto completo]
Variación 3: [texto completo]`;

    } else {
        // Generar 1 copy específico para cada red social
        let prompt = `Genera copywriting específico y optimizado para cada red social sobre "${keyword}".

TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}
${context ? `CONTEXTO: ${context}\n` : ''}

GENERA UN COPY ÚNICO Y ESPECÍFICO PARA CADA PLATAFORMA:

`;

        socialNetworks.forEach(networkKey => {
            const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
            prompt += `
${networkSpec.name.toUpperCase()}:
- Longitud: ${networkSpec.characteristics.optimalLength}
- Tono: ${networkSpec.characteristics.tone}
- Enfoque: ${networkSpec.characteristics.features}
- Hashtags: ${networkSpec.characteristics.hashtags}
- CTA: ${networkSpec.characteristics.cta}
`;
        });

        prompt += `
INSTRUCCIONES CRÍTICAS:
1. Cada copy debe ser COMPLETAMENTE DIFERENTE y adaptado a su plataforma
2. LinkedIn: Profesional con insights de valor
3. Twitter: Conciso, impactante, trending
4. Facebook: Conversacional, storytelling
5. WhatsApp: Directo, personal, urgente
6. Instagram: Visual, aspiracional, lifestyle
7. TikTok: Trendy, joven, viral
8. Telegram: Informativo, técnico
9. Reddit: Auténtico, comunitario
10. YouTube: Educativo, descriptivo

FORMATO DE RESPUESTA:
[Red Social]: [copy específico completamente adaptado]
[Red Social]: [copy específico completamente adaptado]
...`;

        return prompt;
    }
}

/**
 * Muestra los resultados del copywriting generado
 */
function displayCopywritingResults(copies, params) {
    const container = document.getElementById('ideasContainer');
    if (!container) return;
    
    const { socialNetworks, generationMode, keyword, copyType } = params;
    const copyTypeInfo = COPY_TYPES[copyType];
    
    let html = `
        <div class="modern-copywriting-results animate__animated animate__fadeInUp">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="font-size: 2rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">
                    ✍️ Copywriting Generado
                </h3>
                <p style="color: var(--text-secondary); font-size: 1rem;">
                    <strong>${keyword}</strong> • ${copyTypeInfo.name}
                </p>
            </div>
            
            <div class="copywriting-results-grid">
    `;
    
    copies.forEach((copy, index) => {
        const networkKey = generationMode === 'single' ? socialNetworks[0] : socialNetworks[index % socialNetworks.length];
        const network = SOCIAL_NETWORKS[networkKey];
        
        html += `
            <div class="copywriting-result-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                <div class="copywriting-header">
                    <div class="social-network-badge">
                        <i class="${network.icon}" style="color: ${network.color}"></i>
                        <span>${network.name}</span>
                    </div>
                    ${generationMode === 'single' ? `<span class="variation-badge">Variación ${index + 1}</span>` : ''}
                </div>
                <div class="copywriting-content">
                    <div class="copy-section">
                        <strong>🎯 Gancho:</strong> ${copy.hook || copy.description || copy}
                    </div>
                    ${copy.postText ? `<div class="copy-section">
                        <strong>📝 Texto:</strong> ${copy.postText}
                    </div>` : ''}
                    ${copy.hashtags && copy.hashtags.length > 0 ? `<div class="copy-section">
                        <strong>#️⃣ Hashtags:</strong> ${copy.hashtags.join(' ')}
                    </div>` : ''}
                    ${copy.cta ? `<div class="copy-section">
                        <strong>📢 CTA:</strong> ${copy.cta}
                    </div>` : ''}
                    ${copy.visualFormat ? `<div class="copy-section">
                        <strong>🎨 Visual:</strong> ${copy.visualFormat}
                    </div>` : ''}
                </div>
                <div class="copywriting-actions">
                    <button class="copy-btn" onclick="copySingleCopy(${JSON.stringify(copy).replace(/"/g, '&quot;')}, '${network.name}')">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="copywriting-global-actions">
                <button class="modern-btn" onclick="copyAllCopywriting()" style="background: var(--accent-gradient); color: white;">
                    <i class="fas fa-copy mr-2"></i>
                    Copiar Todo
                </button>
                
                <button class="modern-btn" onclick="generateNewCopywriting()" style="background: var(--secondary-gradient); color: white;">
                    <i class="fas fa-refresh mr-2"></i>
                    Generar Nuevas
                </button>
                
                <button class="modern-btn" onclick="exportCopywriting()" style="background: var(--dark-gradient); color: white;">
                    <i class="fas fa-download mr-2"></i>
                    Exportar
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Hacer scroll automático a los resultados
    setTimeout(() => {
        container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 500);
}

/**
 * Copia un copy individual
 */
function copySingleCopy(copyObject, networkName) {
    let copyText = '';
    
    if (typeof copyObject === 'string') {
        copyText = copyObject;
    } else {
        // Formatear el objeto de copy
        if (copyObject.hook) copyText += `🎯 ${copyObject.hook}\n\n`;
        if (copyObject.postText) copyText += `📝 ${copyObject.postText}\n\n`;
        if (copyObject.hashtags && copyObject.hashtags.length > 0) {
            copyText += `#️⃣ ${copyObject.hashtags.join(' ')}\n\n`;
        }
        if (copyObject.cta) copyText += `📢 ${copyObject.cta}\n\n`;
        if (copyObject.visualFormat) copyText += `🎨 ${copyObject.visualFormat}`;
    }
    
    navigator.clipboard.writeText(copyText.trim()).then(() => {
        showNotification(`Copy de ${networkName} copiado al portapapeles`, 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar el copy', 'error');
    });
}

/**
 * Copia todos los copies generados
 */
function copyAllCopywriting() {
    const copyItems = document.querySelectorAll('.copywriting-result-item');
    if (copyItems.length === 0) return;
    
    let allCopies = '';
    copyItems.forEach((item, index) => {
        const networkName = item.querySelector('.social-network-badge span').textContent;
        const copyContent = item.querySelector('.copywriting-content');
        
        // Extraer todo el contenido del copy
        let copyText = `=== ${networkName} ===\n`;
        const sections = copyContent.querySelectorAll('.copy-section');
        sections.forEach(section => {
            copyText += section.textContent + '\n';
        });
        copyText += '\n';
        
        allCopies += copyText;
    });
    
    navigator.clipboard.writeText(allCopies.trim()).then(() => {
        showNotification('Todos los copies copiados al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar los copies', 'error');
    });
}

/**
 * Genera nuevos copywritings con los mismos parámetros
 */
function generateNewCopywriting() {
    const form = document.getElementById('copywritingForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

/**
 * Exporta los copywritings
 */
function exportCopywriting() {
    // TODO: Implementar exportación de copywriting
    showNotification('Función de exportación en desarrollo', 'info');
}

/**
 * Guarda la sesión de copywriting
 */
async function saveCopywritingSession(copies, params) {
    // TODO: Implementar guardado en Firestore
    console.log('Guardando sesión de copywriting:', { copies, params });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCopywriting);
} else {
    initializeCopywriting();
}

// Exportar funciones para uso global
window.copySingleCopy = copySingleCopy;
window.copyAllCopywriting = copyAllCopywriting;
window.generateNewCopywriting = generateNewCopywriting;
window.exportCopywriting = exportCopywriting;
