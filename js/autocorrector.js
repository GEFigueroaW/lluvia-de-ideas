/**
 * Script para autocorrector funcional con corrección real
 * Implementa corrección automática en tiempo real
 */

// Base de datos de correcciones comunes en español
const CORRECCIONES = {
    // Errores comunes de tipeo
    'q ': 'que ',
    'x ': 'por ',
    'xq': 'porque',
    'xk': 'porque',
    'tb': 'también',
    'tmb': 'también',
    'tbn': 'también',
    'pq': 'porque',
    'porq': 'porque',
    'pero': 'pero',
    'aver': 'a ver',
    'haber': 'a ver',
    'ay': 'hay',
    'ahi': 'ahí',
    'asia': 'hacia',
    'asta': 'hasta',
    'echo': 'hecho',
    'aora': 'ahora',
    'despues': 'después',
    'mas': 'más',
    'si': 'sí',
    'solo': 'sólo',
    'tambien': 'también',
    'facil': 'fácil',
    'dificil': 'difícil',
    'util': 'útil',
    'movil': 'móvil',
    'debil': 'débil',
    'fertil': 'fértil',
    
    // Palabras relacionadas con marketing/copywriting
    'marketting': 'marketing',
    'marketin': 'marketing',
    'merketing': 'marketing',
    'copywrite': 'copywriting',
    'copywrting': 'copywriting',
    'copywritng': 'copywriting',
    'redes socales': 'redes sociales',
    'redes sosiales': 'redes sociales',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'whatsapp': 'WhatsApp',
    'youtube': 'YouTube',
    'tiktok': 'TikTok',
    'telegram': 'Telegram',
    'reddit': 'Reddit',
    
    // Tecnología
    'iphone': 'iPhone',
    'ipad': 'iPad',
    'macbook': 'MacBook',
    'android': 'Android',
    'windows': 'Windows',
    'apple': 'Apple',
    'google': 'Google',
    'microsoft': 'Microsoft',
    'samsung': 'Samsung',
    
    // Correcciones de acentos
    'cafe': 'café',
    'menu': 'menú',
    'peru': 'Perú',
    'mexico': 'México',
    'bogota': 'Bogotá',
    'medellin': 'Medellín',
    'cali': 'Cali',
    'barranquilla': 'Barranquilla',
    'cartagena': 'Cartagena'
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeFunctionalAutocorrector();
});

function initializeFunctionalAutocorrector() {
    const fieldsWithSpellcheck = document.querySelectorAll('input[spellcheck="true"], textarea[spellcheck="true"]');
    
    fieldsWithSpellcheck.forEach(field => {
        // Remover eventos anteriores
        field.removeEventListener('input', handleAutocorrect);
        field.removeEventListener('blur', handleBlurCorrection);
        field.removeEventListener('keydown', handleKeyboardShortcuts);
        
        // Añadir nuevos eventos
        field.addEventListener('input', handleAutocorrect);
        field.addEventListener('blur', handleBlurCorrection);
        field.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Marcar como inicializado
        field.setAttribute('data-autocorrect-initialized', 'true');
        
        console.log(`🔤 Autocorrector funcional inicializado en: ${field.id || field.placeholder}`);
    });
    
    showAutocorrectorStatus(fieldsWithSpellcheck.length);
}

function handleAutocorrect(event) {
    const field = event.target;
    const cursorPosition = field.selectionStart;
    const value = field.value;
    
    // Autocorrección en tiempo real al escribir espacio
    if (event.inputType === 'insertText' && event.data === ' ') {
        const words = value.split(' ');
        const lastWord = words[words.length - 2]; // La palabra antes del espacio recién añadido
        
        if (lastWord && CORRECCIONES[lastWord.toLowerCase()]) {
            const correction = CORRECCIONES[lastWord.toLowerCase()];
            words[words.length - 2] = correction;
            
            const newValue = words.join(' ');
            field.value = newValue;
            
            // Mostrar notificación de corrección
            showCorrectionNotification(field, lastWord, correction);
            
            // Restaurar posición del cursor
            const newCursorPosition = cursorPosition + (correction.length - lastWord.length);
            field.setSelectionRange(newCursorPosition, newCursorPosition);
        }
    }
    
    // Validaciones visuales
    updateFieldValidation(field);
}

function handleBlurCorrection(event) {
    const field = event.target;
    let value = field.value;
    let correctionsMade = 0;
    
    // Corregir todas las palabras al perder el foco
    const words = value.split(/(\s+)/); // Mantener espacios
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (CORRECCIONES[word]) {
            words[i] = CORRECCIONES[word];
            correctionsMade++;
        }
    }
    
    if (correctionsMade > 0) {
        field.value = words.join('');
        showBulkCorrectionNotification(field, correctionsMade);
    }
    
    // Limpiar espacios múltiples
    field.value = cleanMultipleSpaces(field.value);
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Shift + L para limpiar y corregir
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        forceCorrectField(event.target);
    }
    
    // Ctrl/Cmd + Shift + C para capitalizar correctamente
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        capitalizeField(event.target);
    }
}

function forceCorrectField(field) {
    const originalValue = field.value;
    let correctedValue = originalValue;
    let corrections = 0;
    
    // Aplicar todas las correcciones
    Object.keys(CORRECCIONES).forEach(error => {
        const regex = new RegExp('\\b' + error + '\\b', 'gi');
        const matches = correctedValue.match(regex);
        if (matches) {
            correctedValue = correctedValue.replace(regex, CORRECCIONES[error]);
            corrections += matches.length;
        }
    });
    
    // Limpiar espacios múltiples
    correctedValue = cleanMultipleSpaces(correctedValue);
    
    if (correctedValue !== originalValue) {
        field.value = correctedValue;
        showForceCorrectionNotification(field, corrections);
    } else {
        showNoCorrectionNotification(field);
    }
}

function capitalizeField(field) {
    const originalValue = field.value;
    const capitalizedValue = capitalizeTitle(originalValue);
    
    if (capitalizedValue !== originalValue) {
        field.value = capitalizedValue;
        showCapitalizationNotification(field);
    }
}

function updateFieldValidation(field) {
    const value = field.value;
    let warnings = [];
    
    // Detectar errores comunes
    if (/[A-Z]{3,}/.test(value) && !isAcronym(value)) {
        warnings.push('💡 Muchas mayúsculas');
    }
    
    if (/  +/.test(value)) {
        warnings.push('💡 Espacios múltiples');
    }
    
    // Detectar palabras con errores conocidos
    const errorWords = Object.keys(CORRECCIONES).filter(error => 
        new RegExp('\\b' + error + '\\b', 'i').test(value)
    );
    
    if (errorWords.length > 0) {
        warnings.push(`💡 ${errorWords.length} error${errorWords.length > 1 ? 'es' : ''} detectado${errorWords.length > 1 ? 's' : ''}`);
    }
    
    showFieldWarnings(field, warnings);
}

function showFieldWarnings(field, warnings) {
    let warningDiv = field.parentNode.querySelector('.field-warnings');
    
    if (!warningDiv) {
        warningDiv = document.createElement('div');
        warningDiv.className = 'field-warnings';
        warningDiv.style.cssText = `
            font-size: 11px;
            color: #f59e0b;
            margin-top: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        field.parentNode.appendChild(warningDiv);
    }
    
    if (warnings.length > 0) {
        warningDiv.textContent = warnings.join(' • ');
        warningDiv.style.opacity = '1';
        
        // Auto-ocultar después de 4 segundos
        setTimeout(() => {
            warningDiv.style.opacity = '0';
        }, 4000);
    } else {
        warningDiv.style.opacity = '0';
    }
}

// Funciones de notificación
function showCorrectionNotification(field, original, corrected) {
    showNotification(`✨ "${original}" → "${corrected}"`, 'correction');
}

function showBulkCorrectionNotification(field, count) {
    showNotification(`✨ ${count} corrección${count > 1 ? 'es' : ''} realizada${count > 1 ? 's' : ''}`, 'bulk-correction');
}

function showForceCorrectionNotification(field, count) {
    showNotification(`🔧 ${count} corrección${count > 1 ? 'es' : ''} forzada${count > 1 ? 's' : ''}`, 'force-correction');
}

function showNoCorrectionNotification(field) {
    showNotification(`✅ Texto ya está correcto`, 'no-correction');
}

function showCapitalizationNotification(field) {
    showNotification(`🔤 Capitalización aplicada`, 'capitalization');
}

function showAutocorrectorStatus(fieldsCount) {
    showNotification(`🔤 Autocorrector funcional activado en ${fieldsCount} campo${fieldsCount > 1 ? 's' : ''}`, 'status');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `autocorrect-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animar salida y remover
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Funciones utilitarias
function cleanMultipleSpaces(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function capitalizeTitle(text) {
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'via', 'y', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'con', 'por', 'para'];
    
    return text.toLowerCase().split(' ').map((word, index) => {
        if (index === 0 || !smallWords.includes(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');
}

function isAcronym(text) {
    const commonAcronyms = ['CEO', 'CFO', 'CTO', 'USA', 'API', 'URL', 'HTML', 'CSS', 'AI', 'IA', 'SMS', 'SEO', 'ROI', 'KPI', 'FAQ', 'PDF'];
    const words = text.toUpperCase().split(/\s+/);
    return words.some(word => commonAcronyms.includes(word));
}

// Exportar para uso global
window.AutocorrectorFuncional = {
    forceCorrectField,
    capitalizeField,
    cleanMultipleSpaces,
    capitalizeTitle,
    CORRECCIONES
};

console.log('🔤 Autocorrector funcional cargado con', Object.keys(CORRECCIONES).length, 'correcciones');
