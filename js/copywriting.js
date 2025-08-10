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
    
    // Inicializar vista previa de plantillas
    updateTemplatePreview();
    
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
    
    // Actualizar vista previa de plantillas después de configurar las redes
    updateTemplatePreview();
    
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
        
        // Llamar a la función de Cloud Functions (CORREGIDO: generateIdeas)
        const generateFunction = httpsCallable(functions, 'generateIdeas');
        console.log('[COPYWRITING] Llamando a Cloud Function generateIdeas...');
        
        // Mapear los parámetros al formato correcto que espera generateIdeas
        const cloudFunctionParams = {
            keyword: params.keyword.trim(),
            platforms: params.socialNetworks.map(net => SOCIAL_NETWORKS[net] ? SOCIAL_NETWORKS[net].name : net), // Nombres de las redes
            userContext: `Tipo de copy: ${COPY_TYPES[params.copyType] ? COPY_TYPES[params.copyType].name : params.copyType}. ${params.context || ''}`.trim()
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
        
        console.log('[COPYWRITING] Resultado de generateIdeas:', result);
        
        // La función generateIdeas devuelve { ideas: {}, remainingUses: ..., isPremium: ..., isAdmin: ... }
        const ideas = result.data.ideas;
        console.log('[COPYWRITING] Ideas generadas:', ideas);
        
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
            optimalLength: '50-150 palabras',
            tone: 'emocional y conversacional',
            features: 'historias personales, comunidad, engagement emocional',
            hashtags: 'uso moderado (3-5)',
            engagement: 'reacciones, comentarios, shares',
            cta: 'preguntas directas, llamadas a la acción emocionales',
            psychologyTriggers: 'nostalgia, pertenencia grupal, validación social',
            contentDepth: 'historias que conecten emocionalmente, datos que sorprendan',
            reflectionPrompts: 'preguntas que inviten a compartir experiencias personales'
        },
        template: {
            structure: [
                {
                    section: 'hook',
                    label: '🎯 Gancho Inicial',
                    description: 'Pregunta provocadora, dato sorprendente o frase emocional',
                    examples: ['¿Sabías que el 87% de las personas...?', '🔥 Lo que descubrí ayer me dejó sin palabras...', '💡 Esta simple pregunta cambió mi perspectiva...']
                },
                {
                    section: 'development',
                    label: '📖 Desarrollo',
                    description: 'Historia breve, explicación o propuesta de valor que profundice',
                    examples: ['Hace una semana me encontré con...', 'Los estudios demuestran que...', 'Mi experiencia trabajando en... me enseñó que...']
                },
                {
                    section: 'engagement',
                    label: '✨ Conexión Emocional',
                    description: 'Beneficio principal, insight valioso o momento de reflexión',
                    examples: ['Esto me hizo reflexionar sobre...', 'La lección más importante fue...', 'Lo que realmente importa es...']
                },
                {
                    section: 'cta',
                    label: '💬 Call to Action',
                    description: 'Pregunta que invite a comentar y compartir experiencias',
                    examples: ['¿Tú qué opinas? 👇', '¿Has vivido algo similar?', '¿Cómo lo aplicarías en tu vida?']
                }
            ],
            baseTemplate: `🎯 [GANCHO_PROVOCADOR]

[HISTORIA_O_DESARROLLO_PROFUNDO]

✨ [INSIGHT_VALIOSO_O_REFLEXION]

💬 [PREGUNTA_REFLEXIVA] 👇

#[hashtag1] #[hashtag2] #[hashtag3]`
        }
    },
    twitter: {
        name: 'Twitter/X',
        characteristics: {
            maxLength: 280,
            optimalLength: '100-180 caracteres',
            tone: 'directo y contundente',
            features: 'brevedad, viralidad, debates, trending topics',
            hashtags: 'estratégicos (1-3)',
            engagement: 'retweets, likes, respuestas',
            cta: 'RT, respuestas, hilos',
            psychologyTriggers: 'urgencia, FOMO, controversia constructiva',
            contentDepth: 'datos impactantes condensados, opiniones fundamentadas',
            reflectionPrompts: 'statements que generen debate inteligente'
        },
        template: {
            structure: [
                {
                    section: 'hook',
                    label: '🚀 Hook Directo',
                    description: 'Dato impactante, opinión clara o pregunta contundente',
                    examples: ['🚀 Dato: El 90% de startups...', '🔥 Unpopular opinion:', '⚡ Plot twist:']
                },
                {
                    section: 'insight',
                    label: '💡 Insight Clave',
                    description: 'La esencia del mensaje, el punto más importante',
                    examples: ['El verdadero problema es...', 'Lo que nadie te dice...', 'La diferencia real está en...']
                },
                {
                    section: 'cta',
                    label: '🔄 CTA Viral',
                    description: 'Llamada a acción que fomente viralidad',
                    examples: ['🔄 RT si estás de acuerdo', '💭 ¿Tú qué piensas?', '🧵 Abro hilo 👇']
                }
            ],
            baseTemplate: `🚀 [DATO_IMPACTANTE] 

💡 [INSIGHT_PROFUNDO]

🔄 [CTA_VIRAL]

#[hashtag] #[hashtag2]`
        }
    },
    linkedin: {
        name: 'LinkedIn',
        characteristics: {
            maxLength: 3000,
            optimalLength: '100-200 palabras',
            tone: 'profesional y reflexivo',
            features: 'networking, thought leadership, casos profesionales',
            hashtags: 'profesionales (3-7)',
            engagement: 'comentarios profesionales, conexiones',
            cta: 'networking, debate profesional, conexiones',
            psychologyTriggers: 'autoridad, credibilidad, crecimiento profesional',
            contentDepth: 'casos reales, lecciones profesionales, insights de industria',
            reflectionPrompts: 'preguntas sobre aplicación práctica en el trabajo'
        },
        template: {
            structure: [
                {
                    section: 'opener',
                    label: '📊 Apertura Profesional',
                    description: 'Dato relevante, experiencia o insight de industria',
                    examples: ['📊 En mis 10 años en [industria]...', '💼 Algo que aprendí dirigiendo equipos...', '🎯 Los datos del último trimestre revelan...']
                },
                {
                    section: 'development',
                    label: '🔍 Desarrollo Estructurado',
                    description: 'Explicación detallada, contexto y análisis profundo',
                    examples: ['El contexto es importante porque...', 'Analizando los factores clave...', 'Mi experiencia me ha enseñado que...']
                },
                {
                    section: 'case',
                    label: '📈 Ejemplo Práctico',
                    description: 'Caso real, ejemplo concreto o aplicación práctica',
                    examples: ['Por ejemplo, en mi último proyecto...', 'Un caso que ilustra esto perfectamente...', 'Aplicamos esta estrategia en...']
                },
                {
                    section: 'cta',
                    label: '🤝 CTA de Networking',
                    description: 'Pregunta que invite al debate profesional y conexión',
                    examples: ['¿Cómo lo aplicas en tu industria?', '¿Qué estrategias han funcionado en tu experiencia?', '¿Estás de acuerdo con este enfoque?']
                }
            ],
            baseTemplate: `📊 [APERTURA_PROFESIONAL]

[DESARROLLO_Y_CONTEXTO_DETALLADO]

📈 Ejemplo: [CASO_REAL_O_APLICACION]

💡 [INSIGHT_PROFESIONAL]

🤝 [PREGUNTA_NETWORKING]

#[hashtag_profesional] #[industria] #[skill]`
        }
    },
    whatsapp: {
        name: 'WhatsApp',
        characteristics: {
            maxLength: 65536,
            optimalLength: '1-3 líneas',
            tone: 'directo y personal',
            features: 'inmediatez, personalización, urgencia',
            hashtags: 'no se usan',
            engagement: 'respuestas directas, reenvíos',
            cta: 'respuesta inmediata, acción específica',
            psychologyTriggers: 'urgencia, exclusividad, personalización',
            contentDepth: 'mensajes concisos pero impactantes',
            reflectionPrompts: 'preguntas directas que requieran respuesta inmediata'
        },
        template: {
            structure: [
                {
                    section: 'attention',
                    label: '🔥 Captador de Atención',
                    description: 'Palabra o frase que genere urgencia o interés inmediato',
                    examples: ['🔥 ¡URGENTE!', '💡 IMPORTANTE:', '🎯 Para ti específicamente:']
                },
                {
                    section: 'benefit',
                    label: '⚡ Beneficio/Urgencia',
                    description: 'El valor o la urgencia explicada brevemente',
                    examples: ['Tienes 24h para...', 'Descubrí algo que te interesa...', 'Oportunidad única para...']
                },
                {
                    section: 'cta',
                    label: '📲 CTA Inmediata',
                    description: 'Acción específica y clara para responder ahora',
                    examples: ['Responde con SÍ si te interesa', 'Envía tu pregunta ahora', '¿Nos vemos mañana a las 3?']
                }
            ],
            baseTemplate: `🔥 [ATENCION_URGENTE]
⚡ [BENEFICIO_O_RAZON]
📲 [ACCION_INMEDIATA]`
        }
    },
    telegram: {
        name: 'Telegram',
        characteristics: {
            maxLength: 4096,
            optimalLength: '30-60 palabras',
            tone: 'informativo y técnico',
            features: 'canales, bots, comunidades especializadas',
            hashtags: 'uso moderado',
            engagement: 'forwards, reacciones, polls',
            cta: 'enlaces a canales, bots interactivos',
            psychologyTriggers: 'información exclusiva, comunidad especializada',
            contentDepth: 'información valiosa y bien estructurada',
            reflectionPrompts: 'invitaciones a profundizar en el canal'
        },
        template: {
            structure: [
                {
                    section: 'title',
                    label: '📌 Titular Claro',
                    description: 'Título que capture la esencia del mensaje',
                    examples: ['📌 Guía Completa:', '🔧 Tutorial Rápido:', '📊 Análisis Semanal:']
                },
                {
                    section: 'development',
                    label: '💭 Desarrollo Conciso',
                    description: 'Explicación breve pero completa del contenido',
                    examples: ['Esta semana analizamos...', 'Los pasos son simples...', 'Los datos muestran...']
                },
                {
                    section: 'cta',
                    label: '👉 CTA Directo',
                    description: 'Instrucción clara o enlace específico',
                    examples: ['👉 Lee completo en:', '🔗 Descarga aquí:', '💬 Únete a la discusión:']
                }
            ],
            baseTemplate: `📌 [TITULO_ATRACTIVO]

[EXPLICACION_BREVE_PERO_VALIOSA]

👉 [INSTRUCCION_O_ENLACE]`
        }
    },
    instagram: {
        name: 'Instagram',
        characteristics: {
            maxLength: 2200,
            optimalLength: '50-100 palabras',
            tone: 'visual y aspiracional',
            features: 'contenido visual, stories, reels',
            hashtags: '5-10 hashtags relevantes',
            engagement: 'likes, shares, saves',
            cta: 'enlaces en bio, stories interactivas',
            psychologyTriggers: 'aspiración, inspiración, estética',
            contentDepth: 'mensajes inspiradores con contexto visual',
            reflectionPrompts: 'invitaciones a reflexionar sobre valores y aspiraciones'
        },
        template: {
            structure: [
                {
                    section: 'power_line',
                    label: '💥 Primera Línea Poderosa',
                    description: 'Frase que enganche visualmente y emocionalmente',
                    examples: ['💥 La vida cambió cuando entendí esto...', '✨ El secreto que nadie te cuenta...', '🌟 Si pudiera regresar en el tiempo...']
                },
                {
                    section: 'narrative',
                    label: '📖 Cuerpo Narrativo',
                    description: 'Historia, contexto o mensaje inspiracional',
                    examples: ['Durante años pensé que...', 'Mi mentora me dijo algo que...', 'Cada mañana recuerdo que...']
                },
                {
                    section: 'value',
                    label: '💎 Valor o Reflexión',
                    description: 'El mensaje principal, la lección o insight valioso',
                    examples: ['Lo que realmente importa es...', 'La verdadera fuerza viene de...', 'El éxito se mide por...']
                },
                {
                    section: 'cta',
                    label: '❤️ CTA Emocional',
                    description: 'Llamada a acción que conecte emocionalmente',
                    examples: ['❤️ Guarda si esto resuena contigo', '✨ Etiqueta a quien necesita leer esto', '💫 ¿Qué te ha enseñado tu experiencia?']
                }
            ],
            baseTemplate: `💥 [FRASE_PODEROSA]

[HISTORIA_O_CONTEXTO_INSPIRACIONAL]

💎 [VALOR_O_REFLEXION_PROFUNDA]

❤️ [CTA_EMOCIONAL]

#[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]`
        }
    },
    tiktok: {
        name: 'TikTok',
        characteristics: {
            maxLength: 2200,
            optimalLength: '1-2 líneas + video',
            tone: 'joven y trendy',
            features: 'videos cortos, trends, música',
            hashtags: '3-5 hashtags trending',
            engagement: 'duetos, challenges, comentarios',
            cta: 'follow, like, share',
            psychologyTriggers: 'FOMO, trending, autenticidad',
            contentDepth: 'mensajes rápidos pero impactantes',
            reflectionPrompts: 'retos que inviten a la participación'
        },
        template: {
            structure: [
                {
                    section: 'hook',
                    label: '🎯 Gancho Viral',
                    description: 'Pregunta, reto o frase que enganche en los primeros segundos',
                    examples: ['🎯 ¿Sabías que puedes...?', '😱 Esto te va a sorprender...', '🔥 El truco que nadie conoce...']
                },
                {
                    section: 'content',
                    label: '⚡ Contenido Rápido',
                    description: 'Información valiosa entregada de forma dinámica',
                    examples: ['En 30 segundos te explico...', 'Los 3 pasos son...', 'La diferencia está en...']
                },
                {
                    section: 'cta',
                    label: '📢 CTA Viral',
                    description: 'Llamada a acción para engagement y viralidad',
                    examples: ['📢 ¡Sígueme para más tips!', '🔄 Comparte si te gustó', '💬 ¿Tú qué opinas?']
                }
            ],
            baseTemplate: `🎯 [GANCHO_VIRAL]

⚡ [CONTENIDO_RAPIDO_VALIOSO]

📢 [CTA_ENGAGEMENT]

#[trend1] #[trend2] #[hashtag]`
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
            cta: 'discusión, AMA, recursos útiles',
            psychologyTriggers: 'autenticidad, conocimiento profundo, comunidad',
            contentDepth: 'análisis detallados, experiencias genuinas',
            reflectionPrompts: 'preguntas que generen discusión intelectual'
        },
        template: {
            structure: [
                {
                    section: 'title',
                    label: '📰 Título Llamativo',
                    description: 'Título que capture la atención y sea específico',
                    examples: ['📰 [Serio] Mi experiencia con...', '🔍 Análisis profundo de...', '💡 LPT: Lo que aprendí después de...']
                },
                {
                    section: 'content',
                    label: '📝 Contenido Detallado',
                    description: 'Historia, datos o guía con información valiosa',
                    examples: ['Context: Trabajo en [industria] desde hace...', 'Después de investigar durante meses...', 'Mi experiencia de 5 años me ha enseñado...']
                },
                {
                    section: 'insights',
                    label: '🧠 Insights Profundos',
                    description: 'Análisis, conclusiones o lecciones aprendidas',
                    examples: ['Lo que descubrí es que...', 'Los puntos clave son...', 'Mi consejo después de todo esto...']
                },
                {
                    section: 'discussion',
                    label: '💭 Debate',
                    description: 'Pregunta que invite a la discusión comunitaria',
                    examples: ['¿Ustedes qué opinan?', '¿Alguien ha tenido experiencias similares?', '¿Estoy equivocado en algo?']
                }
            ],
            baseTemplate: `📰 [TITULO_DESCRIPTIVO_Y_ESPECIFICO]

[HISTORIA_DATO_O_GUIA_DETALLADA]

🧠 Key insights:
- [Punto 1]
- [Punto 2] 
- [Punto 3]

💭 [PREGUNTA_PARA_DEBATE]

Edit: [Aclaraciones si son necesarias]`
        }
    },
    youtube: {
        name: 'YouTube',
        characteristics: {
            maxLength: 5000,
            optimalLength: '2-3 líneas (descripción)',
            tone: 'educativo y entretenido',
            features: 'videos largos, tutoriales, entretenimiento',
            hashtags: '3-5 hashtags en descripción',
            engagement: 'suscripciones, likes, comentarios',
            cta: 'suscribirse, campana de notificaciones',
            psychologyTriggers: 'curiosidad, valor educativo, entertainment',
            contentDepth: 'promesas de valor específicas y entrega real',
            reflectionPrompts: 'invitaciones a continuar aprendiendo'
        },
        template: {
            structure: [
                {
                    section: 'title',
                    label: '🎥 Título Optimizado',
                    description: 'Título que prometa valor específico y genere curiosidad',
                    examples: ['🎥 Cómo [lograr resultado] en [tiempo específico]', '🔍 La verdad sobre [tema controversial]', '💡 [Número] secretos que [audiencia] necesita saber']
                },
                {
                    section: 'summary',
                    label: '📄 Resumen de Valor',
                    description: 'Qué aprenderán y por qué es importante',
                    examples: ['En este video aprenderás...', 'Te muestro paso a paso...', 'Descubrirás los secretos de...']
                },
                {
                    section: 'structure',
                    label: '📋 Estructura del Contenido',
                    description: 'Lista de puntos principales o timestamps',
                    examples: ['🕐 Timestamps:', '📝 Lo que cubrimos:', '🎯 Puntos clave:']
                },
                {
                    section: 'cta',
                    label: '🔔 CTA de Suscripción',
                    description: 'Llamada a suscribirse y activar notificaciones',
                    examples: ['🔔 Suscríbete y activa la campana', '👍 Dale like si te ayudó', '💬 Déjame tu pregunta en comentarios']
                }
            ],
            baseTemplate: `🎥 [TITULO_CON_VALOR_ESPECIFICO]

[RESUMEN_BREVE_DEL_VALOR]

🎯 En este video:
✅ [Punto 1]
✅ [Punto 2] 
✅ [Punto 3]

🔔 Suscríbete y activa la campana para más contenido como este
👉 Links útiles: [recursos]

#[hashtag1] #[hashtag2] #[hashtag3]`
        }
    }
};

/**
 * Procesa la respuesta de la IA para copywriting
 */
function processCopywritingResponse(ideas, params) {
    const { socialNetworks, generationMode } = params;
    const copies = [];
    
    // Si la respuesta es un objeto con plataformas como claves
    if (typeof ideas === 'object' && !Array.isArray(ideas)) {
        Object.entries(ideas).forEach(([platform, content]) => {
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
    }
    
    return copies;
}

/**
 * Parsea el contenido de texto de IA para extraer estructura
 */
function parseAICopyContent(content, platform) {
    const result = {
        hook: '',
        postText: '',
        hashtags: [],
        cta: '',
        visualFormat: '',
        rawContent: content
    };
    
    // Buscar patrones comunes en el texto
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        const cleanLine = line.trim();
        
        // Detectar ganchos/hooks
        if (cleanLine.match(/^(🎯|Gancho:|Hook:|Título:|HOOK:)/i)) {
            result.hook = cleanLine.replace(/^(🎯|Gancho:|Hook:|Título:|HOOK:)\s*/i, '');
        }
        // Detectar CTAs
        else if (cleanLine.match(/^(📢|CTA:|Call to action:|Llamada a la acción:)/i)) {
            result.cta = cleanLine.replace(/^(📢|CTA:|Call to action:|Llamada a la acción:)\s*/i, '');
        }
        // Detectar hashtags
        else if (cleanLine.match(/^(#️⃣|Hashtags:|#)/i) || cleanLine.includes('#')) {
            const hashtags = cleanLine.match(/#\w+/g) || [];
            result.hashtags = hashtags;
        }
        // Detectar formato visual
        else if (cleanLine.match(/^(🎨|Visual:|Imagen:|Formato visual:)/i)) {
            result.visualFormat = cleanLine.replace(/^(🎨|Visual:|Imagen:|Formato visual:)\s*/i, '');
        }
        // El resto va al texto principal
        else if (!cleanLine.match(/^(Variación|===|---)/i)) {
            if (!result.postText) {
                result.postText = cleanLine;
            } else {
                result.postText += '\n' + cleanLine;
            }
        }
    });
    
    // Si no se detectó estructura, usar todo como texto principal
    if (!result.hook && !result.postText && !result.cta) {
        result.postText = content.trim();
        
        // Intentar extraer un gancho del primer párrafo
        const firstSentence = content.split(/[.!?]/)[0];
        if (firstSentence && firstSentence.length < 100) {
            result.hook = firstSentence.trim();
            result.postText = content.replace(firstSentence, '').trim();
        }
    }
    
    return result;
}

/**
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
        // Generar 3 variaciones profundas para una sola red social
        const networkKey = socialNetworks[0];
        const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
        
        return `Actúa como un experto copywriter especializado en ${networkSpec.name} con conocimiento profundo en psicología del consumidor.

TEMA: "${keyword}"
TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}
${context ? `CONTEXTO ESPECÍFICO: ${context}\n` : ''}

ESPECIFICACIONES PSICOLÓGICAS PARA ${networkSpec.name.toUpperCase()}:
• Longitud óptima: ${networkSpec.characteristics.optimalLength}
• Tono requerido: ${networkSpec.characteristics.tone}
• Características clave: ${networkSpec.characteristics.features}
• Hashtags: ${networkSpec.characteristics.hashtags}
• Engagement: ${networkSpec.characteristics.engagement}
• CTA específico: ${networkSpec.characteristics.cta}
• Triggers psicológicos: ${networkSpec.characteristics.psychologyTriggers}
• Profundidad de contenido: ${networkSpec.characteristics.contentDepth}
• Prompts de reflexión: ${networkSpec.characteristics.reflectionPrompts}

ESTRUCTURA REQUERIDA PARA ${networkSpec.name}:
${networkSpec.template.structure.map(section => 
    `${section.label}: ${section.description}\n   Ejemplos: ${section.examples.join(' | ')}`
).join('\n')}

PLANTILLA BASE:
${networkSpec.template.baseTemplate}

INSTRUCCIONES CRÍTICAS PARA GENERAR 3 VARIACIONES PROFUNDAS:
1. VARIACIÓN 1 - ENFOQUE EMOCIONAL: Conecta profundamente con emociones, usa storytelling que haga reflexionar
2. VARIACIÓN 2 - ENFOQUE RACIONAL: Presenta datos, estadísticas, argumentos lógicos que convenzan
3. VARIACIÓN 3 - ENFOQUE ASPIRACIONAL: Inspira acción, muestra el futuro deseado, genera aspiración

CRITERIOS DE CALIDAD OBLIGATORIOS:
✅ Cada variación debe hacer que el lector PARE y REFLEXIONE
✅ Debe generar una respuesta emocional o intelectual inmediata
✅ El contenido debe ser VALIOSO y MEMORABLE
✅ Debe invitar genuinamente a la interacción y participación
✅ Optimizado específicamente para los triggers psicológicos de ${networkSpec.name}

FORMATO DE RESPUESTA:
Variación 1 - Emocional:
[copy completo siguiendo la estructura requerida]

Variación 2 - Racional:
[copy completo siguiendo la estructura requerida]

Variación 3 - Aspiracional:
[copy completo siguiendo la estructura requerida]`;

    } else {
        // Generar 1 copy específico y profundo para cada red social
        let prompt = `Actúa como un experto copywriter multiplatforma con conocimiento profundo en psicología del consumidor y especialización en cada red social.

TEMA CENTRAL: "${keyword}"
TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}
${context ? `CONTEXTO ESPECÍFICO: ${context}\n` : ''}

MISIÓN: Crear copywriting que no solo venda, sino que haga PENSAR, REFLEXIONAR y genere conversaciones significativas.

ESPECIFICACIONES DETALLADAS POR PLATAFORMA:

`;

        socialNetworks.forEach(networkKey => {
            const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
            prompt += `
🎯 ${networkSpec.name.toUpperCase()}:
   • Longitud: ${networkSpec.characteristics.optimalLength}
   • Tono: ${networkSpec.characteristics.tone}
   • Enfoque: ${networkSpec.characteristics.features}
   • Hashtags: ${networkSpec.characteristics.hashtags}
   • CTA: ${networkSpec.characteristics.cta}
   • Triggers psicológicos: ${networkSpec.characteristics.psychologyTriggers}
   • Profundidad: ${networkSpec.characteristics.contentDepth}
   • Reflexión: ${networkSpec.characteristics.reflectionPrompts}
   
   Estructura requerida:
${networkSpec.template.structure.map(section => 
    `   ${section.label}: ${section.description}`
).join('\n')}
   
   Plantilla base:
${networkSpec.template.baseTemplate.split('\n').map(line => `   ${line}`).join('\n')}
`;
        });

        prompt += `

INSTRUCCIONES CRÍTICAS PARA CADA PLATAFORMA:

📘 FACEBOOK: Historia personal que conecte emocionalmente, datos sorprendentes, pregunta que invite a compartir experiencias. Debe generar nostalgia o pertenencia grupal.

🔗 LINKEDIN: Caso profesional real, insight de industria, aplicación práctica. Debe establecer autoridad y generar networking genuino.

🐦 TWITTER/X: Opinión contundente con datos, declaración que genere debate inteligente. Debe ser retweeteable y memorable.

💬 WHATSAPP: Mensaje directo con valor inmediato, sentido de urgencia personalizada. Debe generar respuesta inmediata.

📱 TELEGRAM: Información técnica valiosa, análisis profundo pero conciso. Debe aportar conocimiento específico.

📷 INSTAGRAM: Historia inspiracional con mensaje profundo, call-to-action emocional. Debe ser guardable y compartible.

🎵 TIKTOK: Hook viral con valor rápido pero impactante. Debe ser tendencia y generar participación.

🔴 REDDIT: Experiencia auténtica con análisis detallado, invitación a debate comunitario. Debe ser genuino y útil.

🎬 YOUTUBE: Promesa de valor específica con estructura clara. Debe generar suscripción y engagement.

CRITERIOS DE EXCELENCIA OBLIGATORIOS:
✅ Cada copy debe ser ÚNICO y ESPECÍFICO para su plataforma
✅ Debe hacer que la audiencia PARE su scroll y PRESTE ATENCIÓN
✅ Contenido VALIOSO que la audiencia quiera guardar/compartir
✅ Genera REFLEXIÓN y CONVERSACIÓN genuina
✅ Optimizado para los triggers psicológicos específicos de cada red
✅ Invita a la ACCIÓN de manera natural y convincente

FORMATO DE RESPUESTA (por cada red social seleccionada):
[Nombre de la Red Social]:
[copy completo siguiendo su estructura específica y plantilla base]

---

[Siguiente Red Social]:
[copy completo siguiendo su estructura específica y plantilla base]

[continuar para todas las redes seleccionadas]`;

        return prompt;
    }
}

/**
 * Muestra información detallada de la plantilla para una red social específica
 */
function showNetworkTemplate(networkKey) {
    const networkSpec = SOCIAL_NETWORK_SPECS[networkKey];
    if (!networkSpec || !networkSpec.template) return '';
    
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
}

/**
 * Actualiza la interfaz para mostrar plantillas cuando se selecciona una red social
 */
function updateTemplatePreview() {
    const selectedNetworks = Array.from(document.querySelectorAll('.social-network-btn.selected'))
        .map(btn => btn.dataset.network);
    
    const templateContainer = document.getElementById('templatePreview');
    if (!templateContainer) return;
    
    if (selectedNetworks.length === 0) {
        templateContainer.innerHTML = `
            <div class="no-template-preview">
                <p>📋 Selecciona una red social para ver su plantilla optimizada</p>
            </div>
        `;
        return;
    }
    
    templateContainer.innerHTML = `
        <div class="templates-preview">
            <h3>📋 Plantillas Optimizadas Seleccionadas</h3>
            <p class="templates-intro">Estas son las estructuras psicológicamente optimizadas que se usarán:</p>
            ${selectedNetworks.map(network => showNetworkTemplate(network)).join('')}
        </div>
    `;
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
                    ${copy.variation ? `<span class="variation-badge">Variación ${copy.variation}</span>` : ''}
                </div>
                <div class="copywriting-content">
                    ${copy.hook ? `<div class="copy-section hook-section">
                        <div class="section-label">🎯 Gancho Principal</div>
                        <div class="section-content">${copy.hook}</div>
                    </div>` : ''}
                    
                    ${copy.postText ? `<div class="copy-section content-section">
                        <div class="section-label">📝 Contenido</div>
                        <div class="section-content">${copy.postText.replace(/\n/g, '<br>')}</div>
                    </div>` : ''}
                    
                    ${copy.hashtags && copy.hashtags.length > 0 ? `<div class="copy-section hashtags-section">
                        <div class="section-label">#️⃣ Hashtags</div>
                        <div class="section-content hashtags-list">
                            ${copy.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                        </div>
                    </div>` : ''}
                    
                    ${copy.cta ? `<div class="copy-section cta-section">
                        <div class="section-label">📢 Call to Action</div>
                        <div class="section-content cta-text">${copy.cta}</div>
                    </div>` : ''}
                    
                    ${copy.visualFormat ? `<div class="copy-section visual-section">
                        <div class="section-label">🎨 Sugerencia Visual</div>
                        <div class="section-content">${copy.visualFormat}</div>
                    </div>` : ''}
                    
                    ${!copy.hook && !copy.postText && copy.rawContent ? `<div class="copy-section content-section">
                        <div class="section-label">📝 Contenido Completo</div>
                        <div class="section-content">${copy.rawContent.replace(/\n/g, '<br>')}</div>
                    </div>` : ''}
                </div>
                <div class="copywriting-actions">
                    <button class="copy-btn primary" onclick="copySingleCopy(${JSON.stringify(copy).replace(/"/g, '&quot;')}, '${network.name}')">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button class="copy-btn secondary" onclick="editCopy(${index})">
                        <i class="fas fa-edit"></i> Editar
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
 * Permite editar un copy específico
 */
function editCopy(copyIndex) {
    const copyItems = document.querySelectorAll('.copywriting-result-item');
    const copyItem = copyItems[copyIndex];
    
    if (!copyItem) return;
    
    const contentDiv = copyItem.querySelector('.copywriting-content');
    const isEditing = contentDiv.classList.contains('editing');
    
    if (isEditing) {
        // Guardar cambios
        saveCopyEdits(copyIndex);
    } else {
        // Entrar en modo edición
        enterEditMode(copyIndex);
    }
}

/**
 * Entra en modo edición para un copy
 */
function enterEditMode(copyIndex) {
    const copyItems = document.querySelectorAll('.copywriting-result-item');
    const copyItem = copyItems[copyIndex];
    const contentDiv = copyItem.querySelector('.copywriting-content');
    const editBtn = copyItem.querySelector('.copy-btn.secondary');
    
    // Marcar como editando
    contentDiv.classList.add('editing');
    editBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    editBtn.classList.add('save-mode');
    
    // Hacer editables todas las secciones de contenido
    const sections = contentDiv.querySelectorAll('.section-content');
    sections.forEach(section => {
        const currentText = section.innerText || section.textContent;
        section.innerHTML = `<textarea class="edit-textarea">${currentText}</textarea>`;
    });
    
    showNotification('✏️ Modo edición activado. Modifica el texto y guarda los cambios.', 'info');
}

/**
 * Guarda las ediciones realizadas
 */
function saveCopyEdits(copyIndex) {
    const copyItems = document.querySelectorAll('.copywriting-result-item');
    const copyItem = copyItems[copyIndex];
    const contentDiv = copyItem.querySelector('.copywriting-content');
    const editBtn = copyItem.querySelector('.copy-btn.secondary');
    
    // Obtener los nuevos valores
    const textareas = contentDiv.querySelectorAll('.edit-textarea');
    textareas.forEach(textarea => {
        const newText = textarea.value;
        const sectionContent = textarea.parentElement;
        sectionContent.innerHTML = newText.replace(/\n/g, '<br>');
    });
    
    // Salir del modo edición
    contentDiv.classList.remove('editing');
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar';
    editBtn.classList.remove('save-mode');
    
    showNotification('✅ Cambios guardados correctamente', 'success');
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
