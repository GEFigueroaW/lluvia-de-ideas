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
let currentCopywritingData = []; // Almacenar datos de copywriting seguros

// Permitir que el main.js actualice el estado premium y refresque la UI
window.setCopywritingPremiumStatus = function(premium) {
    console.log('[COPYWRITING] setCopywritingPremiumStatus llamado con:', premium);
    isUserPremium = premium;
    
    // Siempre actualizar inmediatamente si el DOM está listo
    if (document.readyState === 'loading') {
        console.log('[COPYWRITING] DOM aún cargando, esperando...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[COPYWRITING] DOM listo, actualizando redes sociales...');
            initializeCopywritingElements();
        });
    } else {
        console.log('[COPYWRITING] DOM listo, actualizando inmediatamente...');
        initializeCopywritingElements();
    }
};

/**
 * Inicializa todos los elementos de copywriting
 */
function initializeCopywritingElements() {
    console.log('[COPYWRITING] initializeCopywritingElements iniciado');
    try {
        // Verificar si ya se inicializaron los elementos básicos
        if (window.copywritingBasicInitialized) {
            console.log('[COPYWRITING] Elementos básicos ya inicializados, actualizando con estado premium...');
        }
        
        setupSocialNetworks();
        setupCopyTypes();
        updatePremiumNotifications();
        console.log('[COPYWRITING] Elementos inicializados correctamente');
    } catch (error) {
        console.error('[COPYWRITING] Error inicializando elementos:', error);
    }
}

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
    
    // Configurar elementos básicos y event listeners
    setupEventListeners();
    
    // Inicializar elementos inmediatamente con estado gratuito por defecto
    // Se actualizarán cuando se reciba el estado premium real desde main.js
    initializeCopywritingElements();
    
    // Inicializar vista previa de plantillas
    updateTemplatePreview();
    
    console.log('[COPYWRITING] Módulo inicializado completamente');
}

/**
 * Configura la grilla de redes sociales
 */
function setupSocialNetworks() {
    console.log('[COPYWRITING] setupSocialNetworks iniciado, isUserPremium:', isUserPremium);
    const container = document.getElementById('socialNetworksContainer');
    if (!container) {
        console.warn('[COPYWRITING] ERROR: No se encontró socialNetworksContainer - reintentando en 500ms');
        // Reintentar después de un momento
        setTimeout(setupSocialNetworks, 500);
        return;
    }

    // Limpiar solo si hay elementos básicos para actualizar con el estado premium real
    container.innerHTML = '';

    Object.entries(SOCIAL_NETWORKS).forEach(([key, network]) => {
        const item = document.createElement('div');
        const isDisabled = !isUserPremium && network.premium;
        item.className = `social-network-item ${isDisabled ? 'disabled' : ''}`;
        item.dataset.network = key;

        // Facebook siempre seleccionado por defecto
        if (key === 'facebook') {
            item.classList.add('selected');
            selectedSocialNetworks.add('facebook'); // Asegurar que Facebook esté seleccionado
        }

        item.innerHTML = `
            <i class="${network.icon} social-network-icon" style="color: ${network.color}"></i>
            <span class="social-network-name">${network.name}</span>
        `;

        if (!network.premium || isUserPremium) {
            item.addEventListener('click', () => toggleSocialNetwork(key, item));
        } else {
            // Agregar mensaje para usuarios gratuitos
            item.title = 'Disponible solo para usuarios Premium';
        }

        container.appendChild(item);
        
        // Log específico para depuración
        if (network.premium) {
            console.log(`[COPYWRITING] Red ${network.name}: ${isDisabled ? 'DESHABILITADA' : 'HABILITADA'}`);
        }
    });
    
    // Actualizar vista previa de plantillas después de configurar las redes
    updateTemplatePreview();
    
    console.log('[COPYWRITING] setupSocialNetworks completado');
}

/**
 * Configura el select de tipos de copy
 */
function setupCopyTypes() {
    console.log('[COPYWRITING] setupCopyTypes iniciado');
    const select = document.getElementById('copyType');
    if (!select) {
        console.warn('[COPYWRITING] ERROR: No se encontró copyType select - reintentando en 500ms');
        // Reintentar después de un momento
        setTimeout(setupCopyTypes, 500);
        return;
    }

    // Limpiar solo si hay elementos básicos para actualizar con el estado premium real
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
    
    console.log('[COPYWRITING] setupCopyTypes completado');
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

    // CTA Toggle
    const ctaToggle = document.getElementById('includeCTA');
    if (ctaToggle) {
        ctaToggle.addEventListener('change', (e) => {
            updateCTADescription(e.target.checked);
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
    updateTemplatePreview(); // Actualizar la vista previa de plantillas
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
 * Actualiza la descripción del CTA toggle
 */
function updateCTADescription(includeCTA) {
    const onText = document.querySelector('.cta-on-text');
    const offText = document.querySelector('.cta-off-text');
    
    if (onText && offText) {
        if (includeCTA) {
            onText.style.display = 'inline';
            offText.style.display = 'none';
        } else {
            onText.style.display = 'none';
            offText.style.display = 'inline';
        }
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
    const includeCTA = document.getElementById('includeCTA').checked;
    
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
            includeCTA,
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
        
        // Llamar a la función de Cloud Functions (CORREGIDO: generateIdeas)
        const generateFunction = httpsCallable(functions, 'generateIdeas');
        console.log('[COPYWRITING] Llamando a Cloud Function generateIdeas...');
        
        // Mapear los parámetros al formato correcto que espera generateIdeas
        const cloudFunctionParams = {
            keyword: params.keyword.trim(),
            platforms: params.socialNetworks.map(net => SOCIAL_NETWORKS[net] ? SOCIAL_NETWORKS[net].name : net), // Nombres de las redes
            userContext: `Tipo de copy: ${COPY_TYPES[params.copyType] ? COPY_TYPES[params.copyType].name : params.copyType}. ${params.includeCTA ? 'Incluir llamada a la acción específica.' : 'Contenido reflexivo SIN llamada a la acción.'} ${params.context || ''}`.trim()
        };
        
        // Validar parámetros antes de enviar
        if (!cloudFunctionParams.platforms || cloudFunctionParams.platforms.length === 0) {
            throw new Error('No se seleccionó ninguna red social');
        }
        
        if (!cloudFunctionParams.keyword || cloudFunctionParams.keyword.length === 0) {
            throw new Error('La palabra clave es requerida');
        }
        
        console.log('[COPYWRITING] Parámetros validados y enviados a generateIdeas:', cloudFunctionParams);
        
        const result = await generateFunction(cloudFunctionParams);
        
        console.log('[COPYWRITING] Resultado RAW de generateIdeas:', result);
        console.log('[COPYWRITING] Resultado.data:', result.data);
        
        // Verificar que la respuesta no sea un fallback de plantillas
        if (result.data && result.data.ideas) {
            console.log('[COPYWRITING] Ideas recibidas:', result.data.ideas);
            
            // Verificar si son plantillas y mostrar warning pero no bloquear
            const ideasString = JSON.stringify(result.data.ideas);
            if (ideasString.includes('GENERADO CON TEMPLATES') || ideasString.includes('Tiempo de espera agotado')) {
                console.warn('[COPYWRITING] ⚠️ DETECTADO FALLBACK DE PLANTILLAS - La IA no está disponible, usando contenido de respaldo');
                
                // Mostrar notificación al usuario pero permitir el contenido
                const notificationElement = document.querySelector('.copywriting-results');
                if (notificationElement) {
                    const warningDiv = document.createElement('div');
                    warningDiv.className = 'alert alert-warning';
                    warningDiv.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Modo de Respaldo Activado:</strong> La IA no está disponible temporalmente. 
                        Se está usando contenido de plantillas como alternativa.
                    `;
                    notificationElement.insertBefore(warningDiv, notificationElement.firstChild);
                }
            }
        } else {
            console.error('[COPYWRITING] Respuesta de generateIdeas no tiene formato esperado:', result);
            throw new Error('La respuesta de la IA no tiene el formato esperado');
        }
        
        // La función generateIdeas devuelve { ideas: {}, remainingUses: ..., isPremium: ..., isAdmin: ... }
        const ideas = result.data.ideas;
        console.log('[COPYWRITING] Ideas extraídas para procesar:', ideas);
        
        // Procesar y formatear las ideas para copywriting
        const copies = processCopywritingResponse(ideas, params);
        
        console.log('[COPYWRITING] Copies formateados:', copies);
        
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
// Configuraciones profundas y psicológicamente optimizadas para cada red social
const SOCIAL_NETWORK_SPECS = {
    facebook: {
        name: 'Facebook',
        characteristics: {
            maxLength: 2000,
            optimalLength: 'Máx. 150 palabras',
            maxWords: 150,
            tone: 'emocional y conversacional',
            features: 'historias personales, comunidad, engagement emocional',
            hashtags: 'uso moderado (3-5)',
            engagement: 'reacciones, comentarios, shares',
            cta: 'preguntas directas, llamadas a la acción emocionales',
            psychologyTriggers: 'nostalgia, pertenencia grupal, validación social',
            contentDepth: 'historias que conecten emocionalmente, datos que sorprendan',
            reflectionPrompts: 'preguntas que inviten a compartir experiencias personales',
            visualRequired: 'recomendado'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '🎯 Gancho Verbal Impactante',
                    description: 'Pregunta provocadora, dato sorprendente o frase emocional que pare el scroll',
                    examples: ['¿Sabías que el 87% de las personas...?', '🔥 Lo que descubrí ayer cambió mi vida...', '💡 Esta simple verdad te va a impactar...']
                },
                {
                    section: 'texto_post',
                    label: '📖 Texto del Post',
                    description: 'Historia profunda, desarrollo emocional con la cantidad exacta de palabras necesarias para impactar',
                    examples: ['Mi historia comenzó cuando...', 'Los expertos revelan que...', 'Después de 10 años investigando esto...']
                },
                {
                    section: 'cta',
                    label: '🚀 Llamada a la Acción (CTA)',
                    description: 'CTA específico que motive a tomar acción concreta según el tema (motivación→actuar, venta→intentar, yoga→practicar)',
                    examples: ['¡Empieza HOY mismo!', '¿Te atreves a intentarlo?', '🧘‍♀️ Dedica 10 minutos hoy a ti mismo']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '3-5 hashtags estratégicos y relevantes',
                    examples: ['#motivacion #exito #cambio', '#emprendimiento #marketing #ventas', '#yoga #bienestar #salud']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Propuesta específica para imagen/video con detalles precisos para IA (ESPAÑOL LATINO PERFECTO, texto ultra-legible, sin errores, resultado perfecto al primer intento)',
                    examples: ['Imagen: persona sonriendo en paisaje natural, texto en ESPAÑOL LATINO PERFECTO sin errores ortográficos, tipografía grande y legible, alto contraste...', 'Video: demostración de 30 segundos, subtítulos en ESPAÑOL LATINO IMPECABLE, fondo sólido para legibilidad...']
                }
            ],
            baseTemplate: `🎯 Gancho Verbal Impactante: [FRASE_QUE_PARE_EL_SCROLL]

📖 Texto del Post: [DESARROLLO_PROFUNDO_E_IMPACTANTE]

🚀 Llamada a la Acción (CTA): [ACCION_ESPECIFICA_DEL_TEMA]

#️⃣ Hashtags: [3-5 hashtags relevantes]

🎨 Formato Visual Sugerido: [PROPUESTA_DETALLADA_PARA_IA]`
        }
    },
    twitter: {
        name: 'Twitter/X',
        characteristics: {
            maxLength: 280,
            optimalLength: 'Máx. 280 caracteres (~50 palabras)',
            maxWords: 50,
            tone: 'directo y contundente',
            features: 'brevedad, viralidad, debates, trending topics',
            hashtags: 'estratégicos (1-3)',
            engagement: 'retweets, likes, respuestas',
            cta: 'RT, respuestas, hilos',
            psychologyTriggers: 'urgencia, FOMO, controversia constructiva',
            contentDepth: 'datos impactantes condensados, opiniones fundamentadas',
            reflectionPrompts: 'statements que generen debate inteligente',
            visualRequired: 'opcional'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '🚀 Gancho Verbal Impactante',
                    description: 'Hook directo que impacte en máximo 50 palabras',
                    examples: ['🚀 BOMBA: El 90% de emprendedores...', '⚡ REVELACIÓN que cambió todo:', '🔥 Dato que nadie te cuenta:']
                },
                {
                    section: 'texto_post',
                    label: '💡 Texto del Post',
                    description: 'Mensaje conciso pero profundo con insight clave',
                    examples: ['La diferencia entre ricos y pobres no es el dinero...', 'El secreto del éxito en 3 palabras...']
                },
                {
                    section: 'cta',
                    label: '🔄 Llamada a la Acción (CTA)',
                    description: 'CTA viral que motive acción específica del tema',
                    examples: ['💪 ¡Actúa HOY!', '🔄 RT si vas a intentarlo', '💭 ¿Te atreves?']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '1-3 hashtags trending y relevantes',
                    examples: ['#motivacion #accion', '#emprendimiento #exito', '#disciplina #resultados']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Imagen simple, gráfico claro o meme ligero entendible en 2 segundos',
                    examples: ['Gráfico simple: estadística en español latino, fondo contrastante, números grandes...', 'Imagen: quote destacado, tipografía limpia...']
                }
            ],
            baseTemplate: `🚀 Gancho Verbal Impactante: [HOOK_DIRECTO_IMPACTANTE]

💡 Texto del Post: [INSIGHT_CLAVE_CONCISO]

🔄 Llamada a la Acción (CTA): [ACCION_VIRAL_ESPECIFICA]

#️⃣ Hashtags: [1-3 hashtags trending]

🎨 Formato Visual Sugerido: [VISUAL_SIMPLE_Y_CLARO]`
        }
    },
    linkedin: {
        name: 'LinkedIn',
        characteristics: {
            maxLength: 3000,
            optimalLength: 'Máx. 200 palabras',
            maxWords: 200,
            tone: 'profesional y reflexivo',
            features: 'networking, thought leadership, casos profesionales',
            hashtags: 'profesionales (3-7)',
            engagement: 'comentarios profesionales, conexiones',
            cta: 'networking, debate profesional, conexiones',
            psychologyTriggers: 'autoridad, credibilidad, crecimiento profesional',
            contentDepth: 'casos reales, lecciones profesionales, insights de industria',
            reflectionPrompts: 'preguntas sobre aplicación práctica en el trabajo',
            visualRequired: 'opcional'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '📊 Gancho Verbal Impactante',
                    description: 'Apertura profesional que capte atención inmediata',
                    examples: ['📊 REVELACIÓN: En mis 10 años como CEO...', '💼 ERROR que cometen 95% de emprendedores...', '🎯 Datos que cambiarán tu perspectiva...']
                },
                {
                    section: 'texto_post',
                    label: '🔍 Texto del Post',
                    description: 'Desarrollo profesional estructurado con caso real y análisis profundo',
                    examples: ['Mi experiencia dirigiendo equipos me enseñó...', 'Analicemos los factores clave...', 'Un caso que ilustra perfectamente...']
                },
                {
                    section: 'cta',
                    label: '🤝 Llamada a la Acción (CTA)',
                    description: 'CTA de networking que motive acción profesional específica',
                    examples: ['🚀 ¡Implementa esta estrategia HOY!', '💪 ¿Te atreves a aplicarlo?', '🎯 ¡Empieza a diferenciarte YA!']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '3-7 hashtags profesionales relevantes',
                    examples: ['#liderazgo #estrategia #resultados', '#emprendimiento #innovacion #crecimiento', '#marketing #ventas #networking']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Imagen profesional, limpia, con branding discreto',
                    examples: ['Infografía profesional: datos en español latino, colores corporativos, tipografía sans-serif...', 'Imagen: profesional en oficina moderna, iluminación natural...']
                }
            ],
            baseTemplate: `📊 Gancho Verbal Impactante: [APERTURA_PROFESIONAL_IMPACTANTE]

🔍 Texto del Post: [DESARROLLO_CON_CASO_REAL]

🤝 Llamada a la Acción (CTA): [ACCION_PROFESIONAL_ESPECIFICA]

#️⃣ Hashtags: [3-7 hashtags profesionales]

🎨 Formato Visual Sugerido: [IMAGEN_PROFESIONAL_DETALLADA]`
        }
    },
    whatsapp: {
        name: 'WhatsApp',
        characteristics: {
            maxLength: 65536,
            optimalLength: 'Máx. 40 palabras',
            maxWords: 40,
            tone: 'directo y personal',
            features: 'inmediatez, personalización, urgencia',
            hashtags: 'no se usan',
            engagement: 'respuestas directas, reenvíos',
            cta: 'respuesta inmediata, acción específica',
            psychologyTriggers: 'urgencia, exclusividad, personalización',
            contentDepth: 'mensajes concisos pero impactantes',
            reflectionPrompts: 'preguntas directas que requieran respuesta inmediata',
            visualRequired: 'opcional'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '🔥 Gancho Verbal Impactante',
                    description: 'Frase inicial que genere urgencia inmediata',
                    examples: ['🔥 ¡URGENTE!', '💡 OPORTUNIDAD única:', '🎯 Solo para TI:']
                },
                {
                    section: 'texto_post',
                    label: '⚡ Texto del Post',
                    description: 'Beneficio o urgencia explicada brevemente pero con impacto',
                    examples: ['Tienes 24h para aprovechar...', 'Descubrí el secreto que...', 'Esta oportunidad no se repetirá...']
                },
                {
                    section: 'cta',
                    label: '📲 Llamada a la Acción (CTA)',
                    description: 'Acción inmediata y específica según el tema',
                    examples: ['💪 ¡ACTÚA AHORA!', '🚀 ¡Empieza HOY!', '📲 Responde SÍ si estás listo']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: 'No se usan hashtags en WhatsApp',
                    examples: ['[No aplica para WhatsApp]']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Imagen simple y clara, formato cuadrado o vertical',
                    examples: ['Imagen cuadrada: mensaje clave en español latino, colores llamativos, texto grande y legible...', 'Captura simple: sin exceso de información...']
                }
            ],
            baseTemplate: `🔥 Gancho Verbal Impactante: [URGENCIA_INMEDIATA]

⚡ Texto del Post: [BENEFICIO_IMPACTANTE]

📲 Llamada a la Acción (CTA): [ACCION_INMEDIATA_ESPECIFICA]

🎨 Formato Visual Sugerido: [IMAGEN_SIMPLE_Y_CLARA]`
        }
    },
    telegram: {
        name: 'Telegram',
        characteristics: {
            maxLength: 4096,
            optimalLength: 'Máx. 60 palabras',
            maxWords: 60,
            tone: 'informativo y técnico',
            features: 'canales, bots, comunidades especializadas',
            hashtags: 'uso moderado',
            engagement: 'forwards, reacciones, polls',
            cta: 'enlaces a canales, bots interactivos',
            psychologyTriggers: 'información exclusiva, comunidad especializada',
            contentDepth: 'información valiosa y bien estructurada',
            reflectionPrompts: 'invitaciones a profundizar en el canal',
            visualRequired: 'opcional'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '📌 Gancho Verbal Impactante',
                    description: 'Titular claro que capture atención inmediata',
                    examples: ['📌 EXCLUSIVO: Estrategia secreta...', '🔧 TUTORIAL que cambiará todo:', '📊 DATOS que nadie comparte:']
                },
                {
                    section: 'texto_post',
                    label: '💭 Texto del Post',
                    description: 'Desarrollo conciso pero valioso con información exclusiva',
                    examples: ['Esta técnica aumentó mis ventas 300%...', 'Los pasos que siguieron los expertos...', 'La metodología que usan los profesionales...']
                },
                {
                    section: 'cta',
                    label: '👉 Llamada a la Acción (CTA)',
                    description: 'Instrucción clara para acción específica',
                    examples: ['💪 ¡Implementa esto HOY!', '🚀 ¡Empieza a aplicarlo!', '👉 ¡Únete y transforma tu vida!']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '2-3 hashtags relevantes (uso moderado)',
                    examples: ['#estrategia #resultados', '#tutorial #experto', '#exclusivo #comunidad']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Infografía compacta o captura relevante',
                    examples: ['Infografía: pasos numerados en español latino, iconos claros, colores contrastantes...', 'Captura: herramienta o resultado, texto legible...']
                }
            ],
            baseTemplate: `📌 Gancho Verbal Impactante: [TITULAR_EXCLUSIVO]

💭 Texto del Post: [INFORMACION_VALIOSA_CONCISA]

👉 Llamada a la Acción (CTA): [INSTRUCCION_ESPECIFICA]

#️⃣ Hashtags: [2-3 hashtags relevantes]

🎨 Formato Visual Sugerido: [INFOGRAFIA_O_CAPTURA_DETALLADA]`
        }
    },
    instagram: {
        name: 'Instagram',
        characteristics: {
            maxLength: 2200,
            optimalLength: 'Máx. 100 palabras en texto',
            maxWords: 100,
            tone: 'visual y aspiracional',
            features: 'contenido visual, stories, reels',
            hashtags: '8-15 hashtags relevantes',
            engagement: 'likes, shares, saves',
            cta: 'enlaces en bio, stories interactivas',
            psychologyTriggers: 'aspiración, inspiración, estética',
            contentDepth: 'mensajes inspiradores con contexto visual',
            reflectionPrompts: 'invitaciones a reflexionar sobre valores y aspiraciones',
            visualRequired: 'obligatorio'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '💥 Gancho Verbal Impactante',
                    description: 'Primera línea poderosa que enganche visualmente',
                    examples: ['💥 Lo que cambió mi vida para siempre...', '✨ El secreto que me costó años descubrir...', '🌟 Si pudiera volver atrás...']
                },
                {
                    section: 'texto_post',
                    label: '📖 Texto del Post',
                    description: 'Historia inspiracional, contexto emocional con máximo 100 palabras',
                    examples: ['Durante años busqué la felicidad en lugares equivocados...', 'Mi mentora me dijo algo que transformó mi perspectiva...', 'Cada mañana me levanto recordando que...']
                },
                {
                    section: 'cta',
                    label: '❤️ Llamada a la Acción (CTA)',
                    description: 'CTA emocional que motive acción específica del tema',
                    examples: ['💪 ¡Empieza tu transformación HOY!', '🧘‍♀️ ¡Dedica 10 min a tu bienestar!', '✨ ¡Atrévete a brillar!']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '8-15 hashtags relevantes para viralidad',
                    examples: ['#motivacion #transformacion #vida #exito #felicidad #crecimiento #inspiracion #cambio', '#yoga #bienestar #salud #mindfulness #paz #equilibrio #autocuidado #lifestyle']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Imagen/video obligatorio de alta calidad, formato 1:1 o 4:5',
                    examples: ['Imagen: persona en pose inspiradora, luz natural, colores cálidos, texto motivacional en ESPAÑOL LATINO PERFECTO sin errores ortográficos, tipografía bold legible con alto contraste, resultado perfecto al primer intento...', 'Reel: transformación de 15 seg, música inspiradora, subtítulos en ESPAÑOL LATINO IMPECABLE, tipografía grande visible...']
                }
            ],
            baseTemplate: `💥 Gancho Verbal Impactante: [PRIMERA_LINEA_PODEROSA]

📖 Texto del Post: [HISTORIA_INSPIRACIONAL_100_PALABRAS]

❤️ Llamada a la Acción (CTA): [ACCION_ESPECIFICA_MOTIVADORA]

#️⃣ Hashtags: [8-15 hashtags estratégicos]

🎨 Formato Visual Sugerido: [VISUAL_OBLIGATORIO_DETALLADO]`
        }
    },
    tiktok: {
        name: 'TikTok',
        characteristics: {
            maxLength: 2200,
            optimalLength: 'Máx. 2 líneas de texto',
            maxWords: 25,
            tone: 'joven y trendy',
            features: 'videos cortos, trends, música',
            hashtags: '3-5 hashtags trending',
            engagement: 'duetos, challenges, comentarios',
            cta: 'follow, like, share',
            psychologyTriggers: 'FOMO, trending, autenticidad',
            contentDepth: 'mensajes rápidos pero impactantes',
            reflectionPrompts: 'retos que inviten a la participación',
            visualRequired: 'obligatorio'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '🎯 Gancho Verbal Impactante',
                    description: 'Pregunta o reto viral que enganche en 3 segundos',
                    examples: ['🎯 ¿Sabías que en 30 días puedes...?', '😱 Esto cambió mi vida y te va a impactar...', '🔥 El truco que NADIE te cuenta...']
                },
                {
                    section: 'texto_post',
                    label: '⚡ Texto del Post',
                    description: 'Máximo 2 líneas con información valiosa y rápida',
                    examples: ['En 30 segundos te explico el secreto...', 'Los 3 pasos que cambiaron todo...', 'La técnica que usan los expertos...']
                },
                {
                    section: 'cta',
                    label: '📢 Llamada a la Acción (CTA)',
                    description: 'CTA viral que motive acción específica inmediata',
                    examples: ['💪 ¡Inténtalo HOY y cuéntame!', '🚀 ¡Sígueme y transforma tu vida!', '🔄 ¡Comparte si te atreves!']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '3-5 hashtags trending y relevantes',
                    examples: ['#viral #motivacion #cambio', '#tutorial #tips #vida', '#transformation #mindset #success']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Video vertical 9:16 obligatorio, 7-15 seg para viralidad',
                    examples: ['Video vertical: demostración rápida, iluminación natural, subtítulos en ESPAÑOL LATINO PERFECTO ultra-legibles, tipografía grande visible, alto contraste, resultado viral perfecto al primer intento...', 'Transformation video: antes/después, música trending, texto overlay en ESPAÑOL LATINO IMPECABLE...']
                }
            ],
            baseTemplate: `🎯 Gancho Verbal Impactante: [PREGUNTA_O_RETO_VIRAL]

⚡ Texto del Post: [2_LINEAS_IMPACTANTES]

📢 Llamada a la Acción (CTA): [ACCION_VIRAL_INMEDIATA]

#️⃣ Hashtags: [3-5 hashtags trending]

🎨 Formato Visual Sugerido: [VIDEO_VERTICAL_OBLIGATORIO_7-15_SEG]`
        }
    },
    reddit: {
        name: 'Reddit',
        characteristics: {
            maxLength: 40000,
            optimalLength: 'Máx. 300 palabras',
            maxWords: 300,
            tone: 'auténtico y comunitario',
            features: 'subreddits especializados, discusiones profundas',
            hashtags: 'no se usan',
            engagement: 'upvotes, comentarios detallados',
            cta: 'discusión, AMA, recursos útiles',
            psychologyTriggers: 'autenticidad, conocimiento profundo, comunidad',
            contentDepth: 'análisis detallados, experiencias genuinas',
            reflectionPrompts: 'preguntas que generen discusión intelectual',
            visualRequired: 'opcional'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '📰 Gancho Verbal Impactante',
                    description: 'Título llamativo y específico que capture atención',
                    examples: ['📰 [SERIO] Mi experiencia de 10 años me enseñó...', '🔍 ANÁLISIS: Por qué el 90% falla en...', '💡 LPT: Lo que aprendí perdiendo $50k...']
                },
                {
                    section: 'texto_post',
                    label: '📝 Texto del Post',
                    description: 'Contenido detallado, historia genuina o guía valiosa con máximo 300 palabras',
                    examples: ['Context: Después de trabajar 10 años en...', 'Mi experiencia perdiendo todo me enseñó...', 'Investigué durante 2 años y descubrí...']
                },
                {
                    section: 'cta',
                    label: '💭 Llamada a la Acción (CTA)',
                    description: 'Pregunta que invite debate y acción específica',
                    examples: ['💪 ¿Cuál ha sido tu experiencia aplicando esto?', '🚀 ¿Alguien más se atreve a intentarlo?', '💭 ¿Qué estrategias han funcionado en su caso?']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: 'No se usan hashtags en Reddit',
                    examples: ['[No aplica para Reddit]']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Imagen opcional relevante y explicativa, sin branding excesivo',
                    examples: ['Gráfico explicativo: datos en español, colores neutros, tipografía clara y legible...', 'Captura de pantalla: resultados reales, información verificable...']
                }
            ],
            baseTemplate: `📰 Gancho Verbal Impactante: [TITULO_ESPECIFICO_LLAMATIVO]

📝 Texto del Post: [HISTORIA_O_GUIA_DETALLADA_300_PALABRAS]

💭 Llamada a la Acción (CTA): [PREGUNTA_DEBATE_Y_ACCION]

🎨 Formato Visual Sugerido: [IMAGEN_OPCIONAL_EXPLICATIVA]`
        }
    },
    youtube: {
        name: 'YouTube',
        characteristics: {
            maxLength: 5000,
            optimalLength: 'Descripción máx. 150 palabras',
            maxWords: 150,
            tone: 'educativo y entretenido',
            features: 'videos largos, tutoriales, entretenimiento',
            hashtags: '3-5 hashtags en descripción',
            engagement: 'suscripciones, likes, comentarios',
            cta: 'suscribirse, campana de notificaciones',
            psychologyTriggers: 'curiosidad, valor educativo, entertainment',
            contentDepth: 'promesas de valor específicas y entrega real',
            reflectionPrompts: 'invitaciones a continuar aprendiendo',
            visualRequired: 'obligatorio'
        },
        template: {
            structure: [
                {
                    section: 'gancho',
                    label: '🎥 Gancho Verbal Impactante',
                    description: 'Título optimizado que prometa valor específico',
                    examples: ['🎥 Cómo logré [resultado específico] en [tiempo]', '🔍 La VERDAD sobre [tema] que nadie cuenta', '💡 [Número] secretos que cambiarán tu [área]']
                },
                {
                    section: 'texto_post',
                    label: '📄 Texto del Post',
                    description: 'Descripción con valor claro y estructura del contenido (máx. 150 palabras)',
                    examples: ['En este video te muestro paso a paso...', 'Descubrirás los secretos que usan...', 'Te enseño la metodología exacta que...']
                },
                {
                    section: 'cta',
                    label: '🔔 Llamada a la Acción (CTA)',
                    description: 'CTA de suscripción y acción específica del tema',
                    examples: ['💪 ¡Implementa esto HOY y cuéntame!', '🚀 ¡Suscríbete y transforma tu vida!', '🔔 ¡Activa la campana y sé el primero!']
                },
                {
                    section: 'hashtags',
                    label: '#️⃣ Hashtags',
                    description: '3-5 hashtags relevantes en descripción',
                    examples: ['#tutorial #motivacion #exito', '#emprendimiento #estrategia #resultados', '#lifestyle #bienestar #cambio']
                },
                {
                    section: 'formato_visual',
                    label: '🎨 Formato Visual Sugerido',
                    description: 'Video obligatorio horizontal 16:9 o Shorts 9:16, miniatura llamativa',
                    examples: ['Video horizontal HD: inicio impactante en 3 seg, audio claro, iluminación profesional. Miniatura: texto en ESPAÑOL LATINO PERFECTO ultra-legible, tipografía bold grande, colores contrastantes, expresión emocional, resultado clickeable perfecto al primer intento...', 'YouTube Short vertical: demostración rápida, subtítulos en ESPAÑOL LATINO IMPECABLE automáticos activados...']
                }
            ],
            baseTemplate: `🎥 Gancho Verbal Impactante: [TITULO_CON_VALOR_ESPECIFICO]

📄 Texto del Post: [DESCRIPCION_CON_ESTRUCTURA_150_PALABRAS]

🔔 Llamada a la Acción (CTA): [SUSCRIPCION_Y_ACCION_ESPECIFICA]

#️⃣ Hashtags: [3-5 hashtags relevantes]

🎨 Formato Visual Sugerido: [VIDEO_OBLIGATORIO_CON_MINIATURA_DETALLADA]`
        }
    }
};

/**
 * Procesa la respuesta de la IA para copywriting
 */
function processCopywritingResponse(ideas, params) {
    console.log('[DEBUG] processCopywritingResponse recibió:', ideas);
    console.log('[DEBUG] Parámetros:', params);
    
    const { socialNetworks, generationMode } = params;
    const copies = [];
    
    // VALIDACIÓN: Detectar si son plantillas y mostrar aviso pero continuar
    if (typeof ideas === 'string' && ideas.includes('GENERADO CON TEMPLATES')) {
        console.warn('[WARNING] Sistema usando plantillas de respaldo - La IA no está disponible temporalmente');
        // Continuar procesando pero marcar como contenido de respaldo
    }
    
    // Si la respuesta es un objeto con plataformas como claves
    if (typeof ideas === 'object' && !Array.isArray(ideas)) {
        Object.entries(ideas).forEach(([platform, content]) => {
            console.log(`[DEBUG] Procesando plataforma ${platform}:`, content);
            
            // Validar que no sean plantillas
            if (typeof content === 'string' && content.includes('GENERADO CON TEMPLATES')) {
                console.error(`[ERROR] Plantilla detectada en ${platform}:`, content);
                throw new Error(`Contenido de plantilla detectado para ${platform}. La IA no está generando contenido real.`);
            }
            
            if (typeof content === 'string') {
                // Procesar el texto para extraer estructura
                const processedCopy = parseAICopyContent(content, platform);
                copies.push({
                    platform,
                    ...processedCopy
                });
            } else if (typeof content === 'object') {
                // Si ya viene estructurado
                copies.push({
                    platform,
                    ...content
                });
            }
        });
    } 
    // Si la respuesta es texto plano
    else if (typeof ideas === 'string') {
        // Validar que no sean plantillas
        if (ideas.includes('GENERADO CON TEMPLATES') || ideas.includes('Tiempo de espera agotado')) {
            console.error('[ERROR] Respuesta de plantilla detectada:', ideas);
            throw new Error('El sistema está devolviendo plantillas en lugar de contenido generado por IA. Verifica la configuración de DeepSeek.');
        }
        
        if (generationMode === 'single' && socialNetworks.length === 1) {
            // Dividir en variaciones para una sola plataforma
            const variations = parseVariations(ideas);
            variations.forEach((variation, index) => {
                copies.push({
                    platform: socialNetworks[0],
                    variation: index + 1,
                    ...parseAICopyContent(variation, socialNetworks[0])
                });
            });
        } else {
            // Dividir por plataformas
            socialNetworks.forEach((platform, index) => {
                const platformSection = extractPlatformContent(ideas, platform);
                copies.push({
                    platform,
                    ...parseAICopyContent(platformSection, platform)
                });
            });
        }
    } else {
        console.error('[ERROR] Tipo de respuesta no reconocido:', typeof ideas, ideas);
        throw new Error('Formato de respuesta de IA no reconocido. Contacta al administrador.');
    }
    
    console.log('[DEBUG] Copies procesados:', copies);
    return copies;
}

/**
 * Función de debug específica para LinkedIn
 */
function debugLinkedInContent(content, result) {
    console.log('🔍 [LINKEDIN DEBUG] Contenido original:', content);
    console.log('🔍 [LINKEDIN DEBUG] Resultado parseado:', result);
    
    // Verificar si el contenido contiene los iconos específicos de LinkedIn
    const linkedinIcons = ['📊', '🔍'];
    const hasLinkedInIcons = linkedinIcons.some(icon => content.includes(icon));
    console.log('🔍 [LINKEDIN DEBUG] Contiene iconos de LinkedIn:', hasLinkedInIcons);
    
    // Verificar estructura específica
    const hasGancho = result.gancho && result.gancho.length > 0;
    const hasTexto = result.textoPost && result.textoPost.length > 0;
    const hasFormatoVisual = result.formatoVisual && result.formatoVisual.length > 0;
    
    console.log('🔍 [LINKEDIN DEBUG] Estructura detectada:', {
        gancho: hasGancho,
        texto: hasTexto,
        formatoVisual: hasFormatoVisual
    });
    
    if (!hasGancho || !hasTexto || !hasFormatoVisual) {
        console.error('❌ [LINKEDIN ERROR] Estructura incompleta detectada');
    }
    
    return result;
}

/**
 * Parsea el contenido de texto de IA para extraer la nueva estructura específica
 */
function parseAICopyContent(content, platform) {
    console.log(`[DEBUG] parseAICopyContent para ${platform}:`, content);
    
    const result = {
        gancho: '',
        textoPost: '',
        cta: '',
        hashtags: [],
        formatoVisual: '',
        rawContent: content
    };
    
    // Buscar patrones específicos en la nueva estructura
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const cleanLine = line.trim();
        
        // Detectar Gancho Verbal Impactante (AMPLIADO para incluir todos los iconos específicos)
        if (cleanLine.match(/^(🎯|📊|🚀|💥|📌|🎥|📰|🔥|💡|Gancho Verbal Impactante:|Gancho:|Hook:)/i)) {
            result.gancho = cleanLine.replace(/^(🎯|📊|🚀|💥|📌|🎥|📰|🔥|💡|Gancho Verbal Impactante:|Gancho:|Hook:)\s*/i, '');
        }
        // Detectar Texto del Post (AMPLIADO para incluir todos los iconos específicos)
        else if (cleanLine.match(/^(📖|🔍|💡|⚡|💭|📝|Texto del Post:|Texto:|Desarrollo:|Post:)/i)) {
            result.textoPost = cleanLine.replace(/^(📖|🔍|💡|⚡|💭|📝|Texto del Post:|Texto:|Desarrollo:|Post:)\s*/i, '');
        }
        // Detectar Llamada a la Acción (CTA) (AMPLIADO para incluir todos los iconos específicos)
        else if (cleanLine.match(/^(🚀|🤝|🔄|❤️|📲|👉|📢|💭|🔔|Llamada a la Acción|CTA:|Call to action:)/i)) {
            result.cta = cleanLine.replace(/^(🚀|🤝|🔄|❤️|📲|👉|📢|💭|🔔|Llamada a la Acción \(CTA\):|Llamada a la Acción:|CTA:|Call to action:)\s*/i, '');
        }
        // Detectar hashtags
        else if (cleanLine.match(/^(#️⃣|Hashtags:|#)/i) || cleanLine.includes('#')) {
            const hashtags = cleanLine.match(/#\w+/g) || [];
            if (hashtags.length > 0) {
                result.hashtags = hashtags;
            } else {
                // Si no hay hashtags detectados pero menciona hashtags
                result.hashtags = [cleanLine.replace(/^(#️⃣|Hashtags:)\s*/i, '')];
            }
        }
        // Detectar Formato Visual Sugerido
        else if (cleanLine.match(/^(🎨|Formato Visual Sugerido:|Visual:|Imagen:|Formato visual:)/i)) {
            result.formatoVisual = cleanLine.replace(/^(🎨|Formato Visual Sugerido:|Visual:|Imagen:|Formato visual:)\s*/i, '');
        }
        // Si no coincide con ningún patrón específico, podría ser continuación del texto
        else if (!cleanLine.match(/^(🎯|📊|🚀|💥|📌|🎥|📰|🔥|💡|📖|🔍|⚡|💭|📝|🤝|🔄|❤️|📲|👉|�|#️⃣|🎨|---|VARIACIÓN|Variación|\*\*)/i) && cleanLine.length > 10) {
            // Si no tenemos texto del post aún, esto podría ser parte de él
            if (!result.textoPost && result.gancho) {
                result.textoPost = cleanLine;
            }
            // O podría ser continuación del texto existente
            else if (result.textoPost && !result.cta) {
                result.textoPost += ' ' + cleanLine;
            }
        }
    });
    
    // Limpiar y validar resultados
    result.gancho = result.gancho.replace(/^\[|\]$/g, '').trim();
    result.textoPost = result.textoPost.replace(/^\[|\]$/g, '').trim();
    result.cta = result.cta.replace(/^\[|\]$/g, '').trim();
    result.formatoVisual = result.formatoVisual.replace(/^\[|\]$/g, '').trim();
    
    // Si no se detectó estructura específica, intentar extraer el contenido de manera más flexible
    if (!result.gancho && !result.textoPost) {
        console.log(`[DEBUG] No se detectó estructura para ${platform}, intentando extracción flexible`);
        const contentLines = lines.filter(line => 
            !line.match(/^(---|VARIACIÓN|Variación|\*\*)/i) && 
            line.length > 5
        );
        
        if (contentLines.length > 0) {
            result.gancho = contentLines[0] || '';
            result.textoPost = contentLines.slice(1, -1).join(' ') || '';
            result.cta = contentLines[contentLines.length - 1] || '';
        }
    }
    
    console.log(`[DEBUG] Resultado parseado para ${platform}:`, result);
    
    // Debug específico para LinkedIn
    if (platform === 'linkedin') {
        return debugLinkedInContent(content, result);
    }
    
    return result;
}/**
 * Divide el texto en variaciones
 */
function parseVariations(text) {
    const variations = [];
    const sections = text.split(/Variación \d+:|Variación \d+\:/i);
    
    sections.forEach(section => {
        const trimmed = section.trim();
        if (trimmed) {
            variations.push(trimmed);
        }
    });
    
    // Si no se encontraron variaciones marcadas, dividir por párrafos largos
    if (variations.length <= 1) {
        const paragraphs = text.split(/\n\s*\n/);
        return paragraphs.filter(p => p.trim().length > 50);
    }
    
    return variations;
}

/**
 * Extrae contenido específico para una plataforma
 */
function extractPlatformContent(text, platform) {
    const platformName = SOCIAL_NETWORKS[platform]?.name;
    if (!platformName) return text;
    
    // Buscar secciones marcadas por plataforma
    const regex = new RegExp(`(${platformName}|${platform}):?([\\s\\S]*?)(?=(?:Facebook|LinkedIn|Twitter|Instagram|TikTok|YouTube|===)|$)`, 'i');
    const match = text.match(regex);
    
    if (match && match[2]) {
        return match[2].trim();
    }
    
    // Si no se encuentra, retornar una porción del texto
    const sentences = text.split(/[.!?]/).filter(s => s.trim());
    return sentences.slice(0, 3).join('. ') + '.';
}

/**
 * Construye el prompt para la IA según los parámetros
 */
function buildCopywritingPrompt(params) {
    const { keyword, copyType, context, socialNetworks, generationMode } = params;
    const copyTypeInfo = COPY_TYPES[copyType];
    
    if (generationMode === 'single') {
        // Generar 3 variaciones IMPACTANTES para una sola red social
        const networkKey = socialNetworks[0];
        const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
        
        return `🎯 MISIÓN: Crear copywriting IRRESISTIBLE y PERSUASIVO para ${networkSpec.name} que PARE el scroll y genere ACCIÓN INMEDIATA.

TEMA: "${keyword}"
TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}
${context ? `CONTEXTO ESPECÍFICO: ${context}` : ''}

📋 ESTRUCTURA OBLIGATORIA para ${networkSpec.name.toUpperCase()}:
${networkSpec.template.structure.map(section => 
    `${section.label}: ${section.description} - Ejemplos: ${section.examples.join(' | ')}`
).join('\n')}

🚨 LÍMITES ESTRICTOS:
• Máximo ${networkSpec.characteristics.maxWords} palabras en el texto del post
• Tono: ${networkSpec.characteristics.tone}
• Visual: ${networkSpec.characteristics.visualRequired}
• Triggers psicológicos: ${networkSpec.characteristics.psychologyTriggers}

🎯 INSTRUCCIONES CRÍTICAS - GENERAR 3 VARIACIONES IRRESISTIBLES:

VARIACIÓN 1 - ENFOQUE EMOCIONAL:
• Gancho que genere IMPACTO emocional inmediato
• Texto que conecte con el CORAZÓN y genere nostalgia/aspiración
• CTA que motive ACCIÓN ESPECÍFICA del tema (si es motivación→actuar, si es venta→intentar, si es yoga→practicar)
• Formato visual que apoye la emoción

VARIACIÓN 2 - ENFOQUE RACIONAL:
• Gancho con DATOS impactantes o estadísticas sorprendentes
• Texto con argumentos LÓGICOS y beneficios concretos
• CTA que invite a EXPERIMENTAR o PROBAR basado en la lógica
• Formato visual que muestre resultados/datos

VARIACIÓN 3 - ENFOQUE ASPIRACIONAL:
• Gancho que pinte el FUTURO DESEADO o transformación
• Texto que inspire y muestre la MEJOR VERSIÓN de sí mismos
• CTA que invite a DAR EL PRIMER PASO hacia esa transformación
• Formato visual que represente el estado aspiracional

📝 FORMATO DE RESPUESTA OBLIGATORIO:

**VARIACIÓN 1 - EMOCIONAL:**

🎯 Gancho Verbal Impactante: [gancho emocional que pare el scroll]

📖 Texto del Post: [máximo ${networkSpec.characteristics.maxWords} palabras, desarrollo emocional profundo]

🚀 Llamada a la Acción (CTA): [acción específica motivadora para ${keyword}]

#️⃣ Hashtags: [hashtags relevantes]

🎨 Formato Visual Sugerido: [descripción detallada para IA, idioma español latino, sin errores]

---

**VARIACIÓN 2 - RACIONAL:**

🎯 Gancho Verbal Impactante: [gancho con datos/estadísticas]

📖 Texto del Post: [máximo ${networkSpec.characteristics.maxWords} palabras, argumentos lógicos]

🚀 Llamada a la Acción (CTA): [acción basada en lógica para ${keyword}]

#️⃣ Hashtags: [hashtags relevantes]

🎨 Formato Visual Sugerido: [descripción detallada para IA, idioma español latino, sin errores]

---

**VARIACIÓN 3 - ASPIRACIONAL:**

🎯 Gancho Verbal Impactante: [gancho aspiracional/transformación]

📖 Texto del Post: [máximo ${networkSpec.characteristics.maxWords} palabras, mensaje inspirador]

🚀 Llamada a la Acción (CTA): [acción hacia transformación para ${keyword}]

#️⃣ Hashtags: [hashtags relevantes]

🎨 Formato Visual Sugerido: [descripción detallada para IA, idioma español latino, sin errores]

🔥 CRITERIOS DE EXCELENCIA OBLIGATORIOS:
✅ DEBE generar curiosidad irresistible
✅ DEBE incluir acción específica del tema (no solo "comenta")
✅ DEBE respetar límite de palabras
✅ DEBE incluir visual detallado para IA
✅ Texto legible, sin errores ortográficos
✅ Español latino cuando aplique`;

    } else {
        // Generar 1 copy ESPECÍFICO y PERSUASIVO para cada red social
        let prompt = `🎯 MISIÓN: Crear copywriting ESPECÍFICO y PERSUASIVO para cada plataforma que genere ACCIÓN INMEDIATA y RESULTADOS REALES.

TEMA CENTRAL: "${keyword}"
TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}
${context ? `CONTEXTO ESPECÍFICO: ${context}` : ''}

🚨 INSTRUCCIONES CRÍTICAS:
• Cada copy DEBE ser único y específico para su plataforma
• DEBE incluir acción específica del tema (motivación→actuar, venta→intentar, yoga→practicar)
• DEBE respetar límites de palabras exactos
• DEBE incluir formato visual detallado para IA
• Texto en ESPAÑOL LATINO PERFECTO, ultra-legible, sin errores ortográficos, gramática impecable, resultado perfecto al primer intento

📋 ESPECIFICACIONES POR PLATAFORMA:

`;

        socialNetworks.forEach(networkKey => {
            const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
            prompt += `
🎯 ${networkSpec.name.toUpperCase()} (Máx. ${networkSpec.characteristics.maxWords} palabras):
   • Tono: ${networkSpec.characteristics.tone}
   • Visual: ${networkSpec.characteristics.visualRequired}
   • Triggers: ${networkSpec.characteristics.psychologyTriggers}
   • Engagement: ${networkSpec.characteristics.engagement}
   
   ESTRUCTURA OBLIGATORIA:
${networkSpec.template.structure.map(section => 
    `   ${section.label}: ${section.description}`
).join('\n')}
`;
        });

        prompt += `

📝 FORMATO DE RESPUESTA OBLIGATORIO (para cada red seleccionada):

**[NOMBRE DE LA RED SOCIAL]:**

🎯 Gancho Verbal Impactante: [gancho que pare el scroll específico para esta red]

📖 Texto del Post: [desarrollo profundo respetando límite de palabras]

🚀 Llamada a la Acción (CTA): [acción específica del tema "${keyword}" - NO solo comentar]

#️⃣ Hashtags: [hashtags relevantes o "No aplica" si la red no los usa]

🎨 Formato Visual Sugerido: [descripción DETALLADA para IA con idioma español latino especificado, sin errores ortográficos]

---

[SIGUIENTE RED SOCIAL...]

🔥 CRITERIOS DE EXCELENCIA PARA CADA PLATAFORMA:

📘 FACEBOOK: Historia emocional + datos sorprendentes + CTA específica
🔗 LINKEDIN: Caso profesional + insight de industria + acción de crecimiento  
🐦 TWITTER: Opinión contundente + dato impactante + acción viral
💬 WHATSAPP: Urgencia personal + beneficio claro + acción inmediata
📱 TELEGRAM: Info técnica + análisis + acción de implementación
📷 INSTAGRAM: Inspiración visual + transformación + acción motivadora
🎵 TIKTOK: Hook viral + valor rápido + acción trendy
🔴 REDDIT: Experiencia auténtica + análisis detallado + debate + acción
🎬 YOUTUBE: Promesa específica + estructura clara + acción de implementación

✅ CADA COPY DEBE:
• Generar CURIOSIDAD irresistible
• Incluir ACCIÓN específica del tema (no genérica)
• Respetar LÍMITES de palabras exactos
• Describir VISUAL para IA (ESPAÑOL LATINO PERFECTO, ultra-legible, tipografía grande, alto contraste, resultado perfecto al primer intento)
• Ser ÚNICO para su plataforma
• Motivar RESULTADOS reales`;

        return prompt;
    }
}

/**
 * Muestra información detallada de la plantilla para una red social específica
 */
function showNetworkTemplate(networkKey) {
    console.log('[COPYWRITING] Mostrando template para:', networkKey);
    
    const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
    if (!networkSpec || !networkSpec.template) {
        console.warn('[COPYWRITING] No se encontró spec para red:', networkKey);
        return `<div class="network-template-error">Template no disponible para ${networkKey}</div>`;
    }
    
    try {
        return `
            <div class="network-template-info">
                <div class="template-header">
                    <h4>📋 Plantilla para ${networkSpec.name}</h4>
                    <p class="template-description">Estructura psicológicamente optimizada</p>
                </div>
                
                <div class="template-structure">
                    <h5>🏗️ Estructura Requerida:</h5>
                    ${networkSpec.template.structure.map(section => `
                        <div class="structure-section">
                            <div class="section-label">${section.label}</div>
                            <div class="section-description">${section.description}</div>
                            <div class="section-examples">
                                <strong>Ejemplos:</strong>
                                ${section.examples.map(example => `<span class="example-tag">${example}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="template-psychology">
                    <h5>🧠 Triggers Psicológicos:</h5>
                    <p>${networkSpec.characteristics.psychologyTriggers}</p>
                    
                    <h5>💡 Profundidad de Contenido:</h5>
                    <p>${networkSpec.characteristics.contentDepth}</p>
                    
                    <h5>🤔 Prompts de Reflexión:</h5>
                    <p>${networkSpec.characteristics.reflectionPrompts}</p>
                </div>
                
                <div class="template-base">
                    <h5>📝 Plantilla Base:</h5>
                    <pre class="base-template">${networkSpec.template.baseTemplate}</pre>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('[COPYWRITING] Error generando template:', error);
        return `<div class="network-template-error">Error generando template para ${networkKey}</div>`;
    }
}

/**
 * Maneja el toggle de mostrar/ocultar detalles técnicos de las plantillas
 */
function toggleTemplateDetails() {
    const detailsContainer = document.getElementById('templateDetails');
    const toggleIcon = document.getElementById('toggleIcon');
    const toggleText = document.getElementById('toggleText');
    
    if (!detailsContainer || !toggleIcon || !toggleText) {
        console.warn('[COPYWRITING] Elementos del toggle no encontrados');
        return;
    }
    
    const isHidden = detailsContainer.style.display === 'none';
    
    if (isHidden) {
        // Mostrar detalles
        detailsContainer.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-up';
        toggleText.textContent = 'Ocultar detalles';
        console.log('[COPYWRITING] Detalles técnicos mostrados');
    } else {
        // Ocultar detalles
        detailsContainer.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-down';
        toggleText.textContent = 'Ver detalles técnicos';
        console.log('[COPYWRITING] Detalles técnicos ocultados');
    }
}

// Exponer la función globalmente para el onclick
window.toggleTemplateDetails = toggleTemplateDetails;

/**
 * Actualiza la interfaz para mostrar plantillas cuando se selecciona una red social
 * CON OPCIÓN COLAPSABLE - Botón para mostrar/ocultar detalles técnicos
 */
function updateTemplatePreview() {
    console.log('[COPYWRITING] updateTemplatePreview iniciado con opción colapsable');
    
    const templateContainer = document.getElementById('templatePreview');
    if (!templateContainer) {
        console.log('[COPYWRITING] templatePreview no encontrado, saltando actualización');
        return;
    }
    
    const selectedNetworks = Array.from(document.querySelectorAll('.social-network-item.selected'))
        .map(btn => btn.dataset.network)
        .filter(network => network); // Filtrar valores undefined
    
    console.log('[COPYWRITING] Redes seleccionadas para template:', selectedNetworks);
    
    if (selectedNetworks.length === 0) {
        templateContainer.innerHTML = `
            <div class="no-template-preview">
                <p>📋 Selecciona una red social para ver información sobre la optimización</p>
            </div>
        `;
        return;
    }
    
    try {
        const networkNames = selectedNetworks.map(network => {
            const networkSpec = SOCIAL_NETWORK_SPECS[network];
            return networkSpec ? networkSpec.name : network;
        }).join(', ');
        
        templateContainer.innerHTML = `
            <div class="templates-preview">
                <div class="template-summary">
                    <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        ✨ Optimización Activa para: <strong>${networkNames}</strong>
                    </h4>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        El contenido se generará usando estrategias psicológicamente optimizadas para cada plataforma.
                    </p>
                    
                    <button id="toggleTemplateDetails" class="template-toggle-btn" onclick="toggleTemplateDetails()">
                        <i class="fas fa-chevron-down" id="toggleIcon"></i>
                        <span id="toggleText">Ver detalles técnicos</span>
                    </button>
                </div>
                
                <div id="templateDetails" class="template-details" style="display: none;">
                    <div class="template-details-content">
                        <h5 style="color: var(--text-primary); margin: 1rem 0 0.5rem 0; font-size: 0.875rem;">
                            🔬 Estructuras Psicológicas Aplicadas:
                        </h5>
                        ${selectedNetworks.map(network => showNetworkTemplate(network)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        console.log('[COPYWRITING] Template preview con opción colapsable actualizado correctamente');
    } catch (error) {
        console.error('[COPYWRITING] Error actualizando template preview:', error);
        // Fallback simple en caso de error
        templateContainer.innerHTML = `
            <div class="no-template-preview">
                <p>📋 Contenido optimizado para: ${networkNames}</p>
            </div>
        `;
    }
}

/**
 * Muestra los resultados del copywriting generado - VERSIÓN CORREGIDA
 */
function displayCopywritingResults(copies, params) {
    console.log('[DEBUG] displayCopywritingResults llamada con:', copies, params);
    const container = document.getElementById('ideasContainer');
    if (!container) return;
    
    // Almacenar datos seguros para las funciones de copia
    currentCopywritingData = copies.map((copy, index) => {
        const networkKey = params.generationMode === 'single' ? params.socialNetworks[0] : params.socialNetworks[index % params.socialNetworks.length];
        const network = SOCIAL_NETWORKS[networkKey];
        
        // Construir contenido completo para mostrar
        let contenidoCompleto = '';
        if (copy.rawContent) {
            contenidoCompleto = copy.rawContent;
        } else if (copy.gancho && copy.textoPost && copy.cta) {
            contenidoCompleto = `${copy.gancho}\n\n${copy.textoPost}\n\n${copy.cta}`;
            if (copy.hashtags && copy.hashtags.length > 0) {
                contenidoCompleto += `\n\n${copy.hashtags.join(' ')}`;
            }
        } else if (copy.gancho) {
            contenidoCompleto = copy.gancho;
        } else if (copy.textoPost) {
            contenidoCompleto = copy.textoPost;
        } else {
            contenidoCompleto = 'Sin contenido generado';
        }
        
        return {
            contenido: contenidoCompleto,
            formatoVisual: copy.formatoVisual || '',
            networkName: network.name,
            networkKey: networkKey,
            variation: copy.variation
        };
    });
    
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
    
    currentCopywritingData.forEach((copyData, index) => {
        const { contenido, formatoVisual, networkName, networkKey, variation } = copyData;
        const network = SOCIAL_NETWORKS[networkKey];
        
        // Verificar si hay formato visual
        const tieneFormatoVisual = formatoVisual.trim().length > 0;
        
        console.log(`[DEBUG] Red ${network.name}: tieneFormatoVisual=${tieneFormatoVisual}, formatoVisual="${formatoVisual}"`);
        
        html += `
            <div class="copywriting-result-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                <div class="copywriting-header">
                    <div class="social-network-badge">
                        <i class="${network.icon}" style="color: ${network.color}"></i>
                        <span>${network.name}</span>
                    </div>
                    ${variation ? `<span class="variation-badge">Variación ${variation}</span>` : ''}
                </div>
                
                <div class="copywriting-content">
                    <div class="copy-section content-section">
                        <div class="section-content main-content">${contenido.replace(/\n/g, '<br>')}</div>
                    </div>
                    ${tieneFormatoVisual ? `
                    <div class="copy-section visual-section">
                        <div class="section-header">
                            <h4>🎨 Formato Visual Sugerido</h4>
                            <small>Especificaciones para IA generativa (${network.name})</small>
                        </div>
                        <div class="section-content visual-format-content">
                            ${formatoVisual.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="copywriting-actions">
                    <button class="copy-btn primary" onclick="copiarCopywritingSeguro(${index}, 'contenido')">
                        <i class="fas fa-copy"></i> Copiar Copywriting
                    </button>
                    ${tieneFormatoVisual ? `
                    <button class="copy-btn visual" onclick="copiarCopywritingSeguro(${index}, 'visual')">
                        <i class="fas fa-palette"></i> Copiar Formato Visual
                    </button>
                    ` : ''}
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
    
    console.log('[DEBUG] HTML generado correctamente');
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
 * Copia solo el texto del copywriting (sin formato visual)
 */
function copyCopywritingText(copyObject, networkName) {
    console.log('[DEBUG] copyCopywritingText llamada con:', copyObject, networkName);
    let copyText = '';
    
    if (typeof copyObject === 'string') {
        copyText = copyObject;
    } else if (copyObject.contenidoCompleto) {
        copyText = copyObject.contenidoCompleto;
    } else {
        // Construir el copywriting sin formato visual
        if (copyObject.gancho) {
            copyText += `${copyObject.gancho}\n\n`;
        }
        
        if (copyObject.textoPost) {
            copyText += `${copyObject.textoPost}\n\n`;
        }
        
        if (copyObject.cta) {
            copyText += `${copyObject.cta}\n\n`;
        }
        
        if (copyObject.hashtags && copyObject.hashtags.length > 0) {
            copyText += `${copyObject.hashtags.join(' ')}`;
        }
        
        // Si no hay estructura, usar el contenido raw
        if (!copyText && copyObject.rawContent) {
            copyText = copyObject.rawContent;
        }
    }
    
    console.log('[DEBUG] Texto a copiar:', copyText);
    navigator.clipboard.writeText(copyText.trim()).then(() => {
        showNotification(`📝 Copywriting de ${networkName} copiado al portapapeles`, 'success');
    }).catch(err => {
        console.error('Error al copiar copywriting:', err);
        showNotification('❌ Error al copiar el copywriting', 'error');
    });
}

/**
 * Copia solo el formato visual sugerido
 */
function copyVisualFormat(formatoVisual, networkName) {
    console.log('[DEBUG] copyVisualFormat llamada con:', formatoVisual, networkName);
    const visualText = `🎨 FORMATO VISUAL PARA ${networkName.toUpperCase()}:\n\n${formatoVisual}`;
    
    console.log('[DEBUG] Formato visual a copiar:', visualText);
    navigator.clipboard.writeText(visualText).then(() => {
        showNotification(`🎨 Formato visual de ${networkName} copiado al portapapeles`, 'success');
    }).catch(err => {
        console.error('Error al copiar formato visual:', err);
        showNotification('❌ Error al copiar el formato visual', 'error');
    });
}

/**
 * Copia un copy individual (función legacy mantenida para compatibilidad)
 */
function copySingleCopy(copyObject, networkName) {
    let copyText = '';
    
    if (typeof copyObject === 'string') {
        copyText = copyObject;
    } else {
        // Formatear el objeto de copy de manera más profesional
        if (copyObject.hook) {
            copyText += `🎯 GANCHO:\n${copyObject.hook}\n\n`;
        }
        
        if (copyObject.postText) {
            copyText += `📝 CONTENIDO:\n${copyObject.postText}\n\n`;
        }
        
        if (copyObject.hashtags && copyObject.hashtags.length > 0) {
            copyText += `#️⃣ HASHTAGS:\n${copyObject.hashtags.join(' ')}\n\n`;
        }
        
        if (copyObject.cta) {
            copyText += `📢 CALL TO ACTION:\n${copyObject.cta}\n\n`;
        }
        
        if (copyObject.visualFormat) {
            copyText += `🎨 SUGERENCIA VISUAL:\n${copyObject.visualFormat}\n\n`;
        }
        
        // Si no hay estructura, usar el contenido raw
        if (!copyText && copyObject.rawContent) {
            copyText = copyObject.rawContent;
        }
    }
    
    navigator.clipboard.writeText(copyText.trim()).then(() => {
        showNotification(`✅ Copy de ${networkName} copiado al portapapeles`, 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('❌ Error al copiar el copy', 'error');
    });
}

/**
 * Ejecuta un diagnóstico manual de la conexión DeepSeek
 */
async function runDeepSeekDiagnostic() {
    const diagnosticBtn = document.getElementById('diagnosticBtn');
    const diagnosticResults = document.getElementById('diagnosticResults');
    
    if (!diagnosticBtn || !diagnosticResults) {
        showNotification('Elementos de diagnóstico no encontrados', 'error');
        return;
    }
    
    try {
        // Cambiar estado del botón
        const originalText = diagnosticBtn.innerHTML;
        diagnosticBtn.disabled = true;
        diagnosticBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Diagnosticando...';
        
        // Mostrar área de resultados
        diagnosticResults.style.display = 'block';
        diagnosticResults.innerHTML = `
            <div class="diagnostic-loading">
                <i class="fas fa-cog fa-spin"></i>
                <p>Ejecutando diagnóstico de IA...</p>
            </div>
        `;
        
        // Llamar a la función de diagnóstico
        const testFunction = httpsCallable(functions, 'testDeepseekConnection');
        const result = await testFunction();
        
        console.log('[DIAGNOSTIC] Resultado del diagnóstico:', result);
        
        if (result.data.success) {
            displayDiagnosticResults(result.data.diagnostics, result.data.summary);
        } else {
            diagnosticResults.innerHTML = `
                <div class="diagnostic-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Error en el diagnóstico</h4>
                    <p>${result.data.error}</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('[DIAGNOSTIC] Error ejecutando diagnóstico:', error);
        
        let errorMessage = 'Error al ejecutar el diagnóstico';
        if (error.code === 'unauthenticated') {
            errorMessage = 'Debes iniciar sesión para ejecutar el diagnóstico';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        diagnosticResults.innerHTML = `
            <div class="diagnostic-error">
                <i class="fas fa-times-circle"></i>
                <h4>Error</h4>
                <p>${errorMessage}</p>
            </div>
        `;
        
    } finally {
        // Restaurar botón
        diagnosticBtn.disabled = false;
        diagnosticBtn.innerHTML = originalText;
    }
}

/**
 * Muestra los resultados del diagnóstico
 */
function displayDiagnosticResults(diagnostics, summary) {
    const diagnosticResults = document.getElementById('diagnosticResults');
    
    const overallStatus = diagnostics.overall;
    const statusColors = {
        'healthy': '#10b981',
        'degraded': '#f59e0b', 
        'unhealthy': '#ef4444',
        'unknown': '#6b7280'
    };
    
    const statusIcons = {
        'healthy': 'fas fa-check-circle',
        'degraded': 'fas fa-exclamation-triangle',
        'unhealthy': 'fas fa-times-circle',
        'unknown': 'fas fa-question-circle'
    };
    
    let resultsHtml = `
        <div class="diagnostic-results">
            <div class="diagnostic-header">
                <i class="${statusIcons[overallStatus]}" style="color: ${statusColors[overallStatus]}"></i>
                <h4>Diagnóstico de IA</h4>
                <span class="overall-status" style="color: ${statusColors[overallStatus]}">${overallStatus.toUpperCase()}</span>
            </div>
            
            <div class="diagnostic-summary">
                <p>${summary}</p>
                <small>Ejecutado: ${new Date(diagnostics.timestamp).toLocaleString()}</small>
            </div>
            
            <div class="diagnostic-tests">
    `;
    
    Object.entries(diagnostics.tests).forEach(([testName, testResult]) => {
        const testStatusColor = {
            'pass': '#10b981',
            'fail': '#ef4444',
            'partial': '#f59e0b',
            'skip': '#6b7280'
        }[testResult.status];
        
        const testStatusIcon = {
            'pass': 'fas fa-check',
            'fail': 'fas fa-times',
            'partial': 'fas fa-exclamation',
            'skip': 'fas fa-minus'
        }[testResult.status];
        
        resultsHtml += `
            <div class="diagnostic-test">
                <div class="test-header">
                    <i class="${testStatusIcon}" style="color: ${testStatusColor}"></i>
                    <strong>${testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                    <span class="test-status" style="color: ${testStatusColor}">${testResult.status.toUpperCase()}</span>
                </div>
                <div class="test-message">${testResult.message}</div>
                <div class="test-details">${testResult.details}</div>
            </div>
        `;
    });
    
    resultsHtml += `
            </div>
            
            <div class="diagnostic-actions">
                <button class="diagnostic-btn" onclick="runDeepSeekDiagnostic()">
                    <i class="fas fa-redo"></i> Ejecutar de nuevo
                </button>
                <button class="diagnostic-btn secondary" onclick="closeDiagnostic()">
                    <i class="fas fa-times"></i> Cerrar
                </button>
            </div>
        </div>
    `;
    
    diagnosticResults.innerHTML = resultsHtml;
}

/**
 * Cierra el panel de diagnóstico
 */
function closeDiagnostic() {
    const diagnosticResults = document.getElementById('diagnosticResults');
    if (diagnosticResults) {
        diagnosticResults.style.display = 'none';
    }
}

// FUNCIONES GLOBALES SEGURAS PARA BOTONES
window.copiarCopywritingSeguro = function(index, tipo) {
    console.log('[DEBUG] copiarCopywritingSeguro:', index, tipo);
    
    if (!currentCopywritingData || !currentCopywritingData[index]) {
        console.error('Datos de copywriting no encontrados:', index);
        showNotification('❌ Error: Datos no disponibles', 'error');
        return;
    }
    
    const copyData = currentCopywritingData[index];
    let textoACopiar = '';
    
    if (tipo === 'contenido') {
        textoACopiar = copyData.contenido;
        navigator.clipboard.writeText(textoACopiar).then(() => {
            showNotification(`📝 Copywriting de ${copyData.networkName} copiado`, 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showNotification('❌ Error al copiar', 'error');
        });
    } else if (tipo === 'visual') {
        textoACopiar = `🎨 FORMATO VISUAL PARA ${copyData.networkName.toUpperCase()}:\n\n${copyData.formatoVisual}`;
        navigator.clipboard.writeText(textoACopiar).then(() => {
            showNotification(`🎨 Formato visual de ${copyData.networkName} copiado`, 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showNotification('❌ Error al copiar formato visual', 'error');
        });
    }
};

window.copiarSoloTexto = function(contenido, plataforma) {
    console.log('[DEBUG] copiarSoloTexto (legacy):', contenido, plataforma);
    navigator.clipboard.writeText(contenido).then(() => {
        showNotification(`📝 Copywriting de ${plataforma} copiado`, 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('❌ Error al copiar', 'error');
    });
};

window.copiarSoloVisual = function(formatoVisual, plataforma) {
    console.log('[DEBUG] copiarSoloVisual (legacy):', formatoVisual, plataforma);
    const texto = `🎨 FORMATO VISUAL PARA ${plataforma.toUpperCase()}:\n\n${formatoVisual}`;
    navigator.clipboard.writeText(texto).then(() => {
        showNotification(`🎨 Formato visual de ${plataforma} copiado`, 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('❌ Error al copiar formato visual', 'error');
    });
};

// Exportar funciones para uso global - NUEVA UBICACIÓN AL FINAL DEL ARCHIVO
window.runDeepSeekDiagnostic = runDeepSeekDiagnostic;
window.closeDiagnostic = closeDiagnostic;
window.copyCopywritingText = copyCopywritingText;
window.copyVisualFormat = copyVisualFormat;

/* FUNCIONES DE EDICIÓN REMOVIDAS - Ya no son necesarias
/**
 * Permite editar un copy específico
 */
/* function editCopy(copyIndex) {
    // Función removida - ya no se usa el botón de editar
}

/**
 * Entra en modo edición para un copy
 */
/* function enterEditMode(copyIndex) {
    // Función removida - ya no se usa el botón de editar
}

/**
 * Guarda las ediciones realizadas
 */
/* function saveCopyEdits(copyIndex) {
    // Función removida - ya no se usa el botón de editar
} */

/**
 * Copia todos los copies generados
 */
function copyAllCopywriting() {
    if (!currentCopywritingData || currentCopywritingData.length === 0) {
        showNotification('❌ No hay copywriting para copiar', 'warning');
        return;
    }
    
    let allCopies = '';
    currentCopywritingData.forEach((copyData, index) => {
        const { contenido, formatoVisual, networkName, variation } = copyData;
        
        // Agregar encabezado de la red social
        allCopies += `=== ${networkName.toUpperCase()}`;
        if (variation) {
            allCopies += ` - VARIACIÓN ${variation}`;
        }
        allCopies += ` ===\n\n`;
        
        // Agregar contenido del copy
        allCopies += `📝 COPYWRITING:\n${contenido}\n\n`;
        
        // Agregar formato visual si existe
        if (formatoVisual && formatoVisual.trim().length > 0) {
            allCopies += `🎨 FORMATO VISUAL:\n${formatoVisual}\n\n`;
        }
        
        allCopies += '---\n\n';
    });
    
    navigator.clipboard.writeText(allCopies.trim()).then(() => {
        showNotification('📋 Todos los copywritings copiados al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('❌ Error al copiar los copywritings', 'error');
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
