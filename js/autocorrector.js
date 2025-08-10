/**
 * Script para mejorar la funcionalidad del autocorrector
 * Mejora la experiencia de usuario con validación visual en tiempo real
 */

// Inicializar funciones del autocorrector cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeAutocorrector();
});

function initializeAutocorrector() {
    const fieldsWithSpellcheck = document.querySelectorAll('input[spellcheck="true"], textarea[spellcheck="true"]');
    
    fieldsWithSpellcheck.forEach(field => {
        // Añadir eventos para mejorar la experiencia visual
        field.addEventListener('focus', onFieldFocus);
        field.addEventListener('blur', onFieldBlur);
        field.addEventListener('input', onFieldInput);
        
        // Añadir atributos adicionales para mejor autocorrección
        field.setAttribute('data-autocorrect-enabled', 'true');
        
        // Para dispositivos móviles, añadir configuraciones específicas
        if (isMobileDevice()) {
            field.setAttribute('autocapitalize', field.type === 'text' ? 'words' : 'sentences');
            field.setAttribute('autocomplete', 'on');
        }
    });
    
    console.log(`🔤 Autocorrector inicializado en ${fieldsWithSpellcheck.length} campos`);
}

function onFieldFocus(event) {
    const field = event.target;
    const indicator = field.parentNode.querySelector('.autocorrect-indicator');
    
    if (indicator) {
        indicator.style.color = '#10b981';
        indicator.style.fontWeight = '500';
    }
    
    // Añadir clase para animación
    field.classList.add('autocorrect-active');
}

function onFieldBlur(event) {
    const field = event.target;
    const indicator = field.parentNode.querySelector('.autocorrect-indicator');
    
    if (indicator) {
        indicator.style.color = '#6b7280';
        indicator.style.fontWeight = 'normal';
    }
    
    // Remover clase de animación
    field.classList.remove('autocorrect-active');
}

function onFieldInput(event) {
    const field = event.target;
    const value = field.value;
    
    // Validaciones básicas en tiempo real
    if (value.length > 0) {
        // Verificar si hay palabras en mayúsculas innecesarias
        const hasUnnecessaryCaps = /[A-Z]{3,}/.test(value) && !isAcronym(value);
        
        // Verificar espacios múltiples
        const hasMultipleSpaces = /  +/.test(value);
        
        // Mostrar sugerencias sutiles
        updateFieldValidation(field, { hasUnnecessaryCaps, hasMultipleSpaces });
    }
}

function updateFieldValidation(field, validation) {
    const { hasUnnecessaryCaps, hasMultipleSpaces } = validation;
    let indicator = field.parentNode.querySelector('.field-validation');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'field-validation';
        indicator.style.cssText = `
            font-size: 11px;
            color: #f59e0b;
            margin-top: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        field.parentNode.appendChild(indicator);
    }
    
    let messages = [];
    
    if (hasUnnecessaryCaps) {
        messages.push('💡 Considera usar menos mayúsculas');
    }
    
    if (hasMultipleSpaces) {
        messages.push('💡 Hay espacios múltiples');
    }
    
    if (messages.length > 0) {
        indicator.textContent = messages.join(' • ');
        indicator.style.opacity = '1';
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 3000);
    } else {
        indicator.style.opacity = '0';
    }
}

function isAcronym(text) {
    // Lista de acrónimos comunes que deberían mantenerse en mayúsculas
    const commonAcronyms = ['CEO', 'CFO', 'CTO', 'USA', 'API', 'URL', 'HTML', 'CSS', 'AI', 'IA', 'SMS', 'SEO', 'ROI', 'KPI'];
    const words = text.toUpperCase().split(/\s+/);
    
    return words.some(word => commonAcronyms.includes(word));
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Funciones adicionales para mejorar la experiencia del autocorrector

/**
 * Función para limpiar texto con espacios múltiples
 */
function cleanMultipleSpaces(text) {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Función para capitalizar correctamente títulos
 */
function capitalizeTitle(text) {
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'via', 'y', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'con', 'por', 'para'];
    
    return text.toLowerCase().split(' ').map((word, index) => {
        if (index === 0 || !smallWords.includes(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');
}

/**
 * Añadir acceso directo de teclado para limpiar texto
 */
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Shift + L para limpiar espacios múltiples
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.hasAttribute('spellcheck') && activeElement.hasAttribute('data-autocorrect-enabled')) {
            event.preventDefault();
            const cleanedText = cleanMultipleSpaces(activeElement.value);
            
            if (cleanedText !== activeElement.value) {
                activeElement.value = cleanedText;
                
                // Mostrar notificación sutil
                showCleanupNotification(activeElement);
            }
        }
    }
});

function showCleanupNotification(field) {
    const notification = document.createElement('div');
    notification.textContent = '✨ Texto limpiado';
    notification.style.cssText = `
        position: absolute;
        background: #10b981;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    
    // Posicionar cerca del campo
    const rect = field.getBoundingClientRect();
    notification.style.left = rect.left + 'px';
    notification.style.top = (rect.bottom + 5) + 'px';
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remover después de 2 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Exportar funciones para uso global
window.AutocorrectorUtils = {
    cleanMultipleSpaces,
    capitalizeTitle,
    isMobileDevice
};
