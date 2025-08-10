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
        // Modo multi: múltiples redes sociales
        if (selectedSocialNetworks.has(networkKey)) {
            // Si es Facebook y es el único seleccionado, no permitir deseleccionar
            if (networkKey === 'facebook' && selectedSocialNetworks.size === 1) {
                showNotification('Facebook debe estar siempre seleccionado para usuarios gratuitos', 'warning');
                return;
            }
            
            selectedSocialNetworks.delete(networkKey);
            element.classList.remove('selected');
        } else {
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
        note.textContent = `${count} red${count !== 1 ? 'es' : ''} social${count !== 1 ? 'es' : ''} seleccionada${count !== 1 ? 's' : ''} - Se generará 1 idea por cada una`;
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
        
        // Construir el prompt para la IA
        const prompt = buildCopywritingPrompt(params);
        
        // Llamar a la función de Cloud Functions (usando la existente)
        const generateFunction = httpsCallable(functions, 'api');
        const result = await generateFunction({
            topic: prompt,
            context: `Generar copywriting para redes sociales`,
            userId: getCurrentUser()?.uid,
            type: 'copywriting'
        });
        
        const copies = result.data.ideas;
        
        // Mostrar los resultados
        displayCopywritingResults(copies, params);
        
        // Guardar en historial
        await saveCopywritingSession(copies, params);
        
        showNotification('¡Copywriting generado exitosamente!', 'success');
        
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalText;
    }
}

/**
 * Construye el prompt para la IA según los parámetros
 */
function buildCopywritingPrompt(params) {
    const { keyword, copyType, context, socialNetworks, generationMode } = params;
    const copyTypeInfo = COPY_TYPES[copyType];
    
    let prompt = `Genera copywriting profesional para redes sociales con las siguientes especificaciones:

PALABRA CLAVE/TEMA: ${keyword}
TIPO DE COPY: ${copyTypeInfo.name} - ${copyTypeInfo.description}`;

    if (generationMode === 'single') {
        const networkName = SOCIAL_NETWORKS[socialNetworks[0]].name;
        prompt += `\n\nGENERA 3 VARIACIONES diferentes para ${networkName}, cada una con un enfoque único pero manteniendo el tipo de copy especificado.`;
    } else {
        const networkNames = socialNetworks.map(net => SOCIAL_NETWORKS[net].name).join(', ');
        prompt += `\n\nGENERA 1 COPY específicamente optimizado para cada una de estas redes sociales: ${networkNames}`;
        prompt += `\nAdapta el tono, longitud y formato según las características de cada plataforma.`;
    }

    if (context) {
        prompt += `\n\nCONTEXTO ADICIONAL: ${context}`;
    }

    prompt += `\n\nREQUISITOS:
- Texto atractivo y persuasivo
- Adecuado para la plataforma específica
- Incluye emojis relevantes cuando sea apropiado
- Longitud apropiada para cada red social
- Call-to-action claro cuando corresponda
- Tono profesional pero enganchador`;

    return prompt;
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
                    <p>${copy.description || copy}</p>
                </div>
                <div class="copywriting-actions">
                    <button class="copy-btn" onclick="copySingleCopy('${copy.description || copy}', '${network.name}')">
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
}

/**
 * Copia un copy individual
 */
function copySingleCopy(copyText, networkName) {
    navigator.clipboard.writeText(copyText).then(() => {
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
    const copyItems = document.querySelectorAll('.copywriting-content p');
    if (copyItems.length === 0) return;
    
    let allCopies = '';
    document.querySelectorAll('.copywriting-result-item').forEach((item, index) => {
        const networkName = item.querySelector('.social-network-badge span').textContent;
        const copyText = item.querySelector('.copywriting-content p').textContent;
        allCopies += `${networkName}:\n${copyText}\n\n`;
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
