// =========================================
// UTILIDADES GENERALES
// =========================================

/**
 * Muestra un elemento con animación
 * @param {HTMLElement} element - Elemento a mostrar
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('is-hidden');
        element.classList.add('animate__animated', 'animate__fadeIn');
    }
}

/**
 * Oculta un elemento
 * @param {HTMLElement} element - Elemento a ocultar
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('is-hidden');
        element.classList.remove('animate__animated', 'animate__fadeIn');
    }
}

/**
 * Muestra una notificación temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, danger, warning, info)
 * @param {number} duration - Duración en milisegundos (default: 5000)
 */
export function showNotification(message, type = 'info', duration = 5000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification is-${type} animate__animated animate__fadeInDown`;
    notification.innerHTML = `
        <button class="delete" onclick="this.parentElement.remove()"></button>
        ${message}
    `;
    
    // Añadir al DOM
    const container = document.querySelector('.notifications-container') || document.body;
    container.appendChild(notification);
    
    // Auto-eliminar después del tiempo especificado
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('animate__fadeOutUp');
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

/**
 * Muestra/oculta un spinner de carga en un botón
 * @param {HTMLElement} button - Botón donde mostrar el spinner
 * @param {boolean} loading - True para mostrar, false para ocultar
 */
export function toggleButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<div class="loading-animation" style="width: 20px; height: 20px; border-width: 2px;"></div>';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Enviar';
    }
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} Objeto con isValid y errors
 */
export function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Formatea una fecha
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatDate(date) {
    if (!date) return 'N/A';
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('es-ES', options).format(new Date(date));
}

/**
 * Debounce function - limita la frecuencia de ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} Función debounced
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Manejo de errores centralizado
 * @param {Error} error - Error a manejar
 * @param {string} context - Contexto donde ocurrió el error
 */
export function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    let userMessage = 'Ha ocurrido un error inesperado.';
    
    // Mensajes específicos para errores comunes de Firebase
    switch (error.code) {
        case 'auth/user-not-found':
            userMessage = 'No existe una cuenta con este email.';
            break;
        case 'auth/wrong-password':
            userMessage = 'Contraseña incorrecta.';
            break;
        case 'auth/email-already-in-use':
            userMessage = 'Ya existe una cuenta con este email.';
            break;
        case 'auth/weak-password':
            userMessage = 'La contraseña es muy débil.';
            break;
        case 'auth/invalid-email':
            userMessage = 'El email no es válido.';
            break;
        case 'auth/network-request-failed':
            userMessage = 'Error de conexión. Verifica tu internet.';
            break;
        case 'functions/not-found':
            userMessage = 'Servicio no disponible temporalmente.';
            break;
        case 'functions/permission-denied':
            userMessage = 'No tienes permisos para realizar esta acción.';
            break;
        default:
            if (error.message) {
                userMessage = error.message;
            }
    }
    
    showNotification(userMessage, 'danger');
}

/**
 * Scroll suave a un elemento
 * @param {string} selector - Selector del elemento
 */
export function smoothScrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Texto copiado al portapapeles', 'success', 2000);
    } catch (error) {
        console.error('Error al copiar:', error);
        showNotification('Error al copiar al portapapeles', 'danger');
    }
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
