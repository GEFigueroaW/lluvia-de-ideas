/**
 * =========================================
 * INICIALIZADOR INMEDIATO DE COPYWRITING
 * =========================================
 * Este script se ejecuta inmediatamente para mostrar las redes sociales
 * y tipos de copy sin esperar a que se cargue el módulo principal
 */

// Configuración mínima de redes sociales (versión simplificada)
const BASIC_SOCIAL_NETWORKS = {
    facebook: { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877F2', premium: false },
    linkedin: { name: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0A66C2', premium: true },
    twitter: { name: 'X / Twitter', icon: 'fab fa-x-twitter', color: '#000000', premium: true },
    whatsapp: { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366', premium: true },
    telegram: { name: 'Telegram', icon: 'fab fa-telegram-plane', color: '#0088CC', premium: true },
    reddit: { name: 'Reddit', icon: 'fab fa-reddit-alien', color: '#FF4500', premium: true },
    instagram: { name: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F', premium: true },
    tiktok: { name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000', premium: true },
    youtube: { name: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000', premium: true }
};

// Configuración mínima de tipos de copy
const BASIC_COPY_TYPES = {
    'educational': { name: 'Informativo o educativo', premium: false },
    'informal': { name: 'Informal', premium: false },
    'technical': { name: 'Técnico o profesional', premium: false },
    'benefit': { name: 'De beneficio o solución', premium: true },
    'launch': { name: 'De novedad o lanzamiento', premium: true },
    'interaction': { name: 'De interacción o pregunta', premium: true },
    'urgency': { name: 'De urgencia o escasez', premium: true },
    'cta': { name: 'Llamada a la acción (CTA)', premium: true },
    'storytelling': { name: 'Narrativo o storytelling', premium: true },
    'branding': { name: 'Posicionamiento o branding', premium: true },
    'testimonial': { name: 'Testimonio o prueba social', premium: true },
    'sales': { name: 'Venta directa o persuasivo', premium: true }
};

/**
 * Inicializa las redes sociales básicas inmediatamente
 */
function initBasicSocialNetworks() {
    console.log('[COPYWRITING-INIT] 📱 Inicializando redes sociales básicas...');
    
    const container = document.getElementById('socialNetworksContainer');
    if (!container) {
        console.log('[COPYWRITING-INIT] ❌ Container no encontrado, elemento puede no existir aún');
        return false;
    }

    // Solo inicializar si no hay contenido o si el contenido es básico
    if (container.children.length > 0) {
        console.log('[COPYWRITING-INIT] ⚠️ Ya hay contenido en el container, verificando si necesita actualización...');
        // Si ya hay elementos, no sobrescribir a menos que parezcan incompletos
        if (container.children.length >= 3) {
            console.log('[COPYWRITING-INIT] ✅ Container ya tiene contenido suficiente, saltando...');
            return true;
        }
    }

    try {
        // Crear grilla usando las clases CSS existentes
        if (!container.classList.contains('social-networks-grid')) {
            container.className = 'social-networks-grid';
        }

        // Limpiar contenido existente
        container.innerHTML = '';

        Object.entries(BASIC_SOCIAL_NETWORKS).forEach(([key, network]) => {
            const item = document.createElement('div');
            const isDisabled = network.premium; // Por defecto, usuario gratuito
            item.className = `social-network-item ${isDisabled ? 'disabled' : ''}`;
            item.dataset.network = key;

            // Facebook seleccionado por defecto
            if (key === 'facebook') {
                item.classList.add('selected');
            }

            item.innerHTML = `
                <i class="${network.icon} social-network-icon" style="color: ${network.color}"></i>
                <span class="social-network-name">${network.name}</span>
            `;

            // Agregar click básico solo para Facebook (usuario gratuito)
            if (key === 'facebook') {
                item.addEventListener('click', () => {
                    // Solo cambiar la clase visual, la lógica completa se manejará en el módulo principal
                    const allItems = container.querySelectorAll('.social-network-item');
                    allItems.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                });
            } else if (network.premium) {
                item.title = 'Disponible solo para usuarios Premium';
                item.addEventListener('click', () => {
                    console.log('[COPYWRITING-INIT] ⚠️ Función premium, se requiere upgrade');
                });
            }

            container.appendChild(item);
        });

        console.log('[COPYWRITING-INIT] ✅ Redes sociales básicas inicializadas correctamente');
        console.log('[COPYWRITING-INIT] 📊 Elementos creados:', container.children.length);
        return true;
        
    } catch (error) {
        console.error('[COPYWRITING-INIT] ❌ Error inicializando redes sociales:', error);
        return false;
    }
}

/**
 * Inicializa los tipos de copy básicos inmediatamente
 */
function initBasicCopyTypes() {
    console.log('[COPYWRITING-INIT] ✍️ Inicializando tipos de copy básicos...');
    
    const select = document.getElementById('copyType');
    if (!select) {
        console.log('[COPYWRITING-INIT] ✍️ Select copyType no encontrado - usando nueva estructura con checkboxes');
        return true; // Retornar true porque no es un error en la nueva estructura
    }

    // Solo inicializar si no hay opciones o solo tiene la opción por defecto
    if (select.children.length > 1) {
        console.log('[COPYWRITING-INIT] ⚠️ Ya hay opciones en el select, verificando...');
        // Si ya hay más de una opción, probablemente ya está inicializado
        if (select.children.length >= 5) {
            console.log('[COPYWRITING-INIT] ✅ Select ya tiene suficientes opciones, saltando...');
            return true;
        }
    }

    try {
        // Limpiar y agregar opción por defecto
        select.innerHTML = '<option value="">Selecciona el tipo de copy...</option>';

        Object.entries(BASIC_COPY_TYPES).forEach(([key, copyType]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = copyType.name;
            
            if (copyType.premium) {
                option.disabled = true;
                option.textContent += ' (Premium)';
                option.style.color = '#999';
            }

            select.appendChild(option);
        });

        console.log('[COPYWRITING-INIT] ✅ Tipos de copy básicos inicializados correctamente');
        console.log('[COPYWRITING-INIT] 📊 Opciones creadas:', select.children.length);
        return true;
        
    } catch (error) {
        console.error('[COPYWRITING-INIT] ❌ Error inicializando tipos de copy:', error);
        return false;
    }
}

/**
 * Inicialización principal inmediata con múltiples estrategias
 */
function initCopywritingImmediate() {
    console.log('[COPYWRITING-INIT] 🚀 Iniciando inicialización con múltiples estrategias...');
    
    // Estrategia 1: Inmediata si el DOM ya está listo
    if (document.readyState === 'loading') {
        console.log('[COPYWRITING-INIT] DOM cargando, usando DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', executeInit);
    } else {
        console.log('[COPYWRITING-INIT] DOM ya listo, ejecutando inmediatamente...');
        executeInit();
    }
    
    // Estrategia 2: Reintentos con timeouts
    setTimeout(() => {
        console.log('[COPYWRITING-INIT] ⏰ Retry después de 1 segundo...');
        executeInit();
    }, 1000);
    
    // Estrategia 3: Retry final después de 3 segundos
    setTimeout(() => {
        console.log('[COPYWRITING-INIT] ⏰ Retry final después de 3 segundos...');
        executeInit();
    }, 3000);
}

/**
 * Función que ejecuta la inicialización
 */
function executeInit() {
    console.log('[COPYWRITING-INIT] Ejecutando inicialización...');
    try {
        initBasicSocialNetworks();
        initBasicCopyTypes();
        console.log('[COPYWRITING-INIT] ✅ Inicialización ejecutada');
    } catch (error) {
        console.error('[COPYWRITING-INIT] ❌ Error en inicialización:', error);
    }
}

// Ejecutar inmediatamente
initCopywritingImmediate();

// Marcar que se ha ejecutado la inicialización básica
window.copywritingBasicInitialized = true;

console.log('[COPYWRITING-INIT] Script de inicialización inmediata cargado');
