/**
 * Autocorrector intuitivo con sugerencias visuales
 * Subraya errores y muestra opciones de corrección
 */

// Base de datos de correcciones
const CORRECCIONES = {
    // Errores comunes de tipeo
    'marketting': ['marketing', 'market'],
    'marketin': ['marketing'],
    'merketing': ['marketing'],
    'copywrite': ['copywriting', 'copy'],
    'copywrting': ['copywriting'],
    'copywritng': ['copywriting'],
    'redes socales': ['redes sociales'],
    'redes sosiales': ['redes sociales'],
    
    // Tecnología
    'facebook': ['Facebook'],
    'instagram': ['Instagram'],
    'twitter': ['Twitter'],
    'linkedin': ['LinkedIn'],
    'whatsapp': ['WhatsApp'],
    'youtube': ['YouTube'],
    'tiktok': ['TikTok'],
    'telegram': ['Telegram'],
    'reddit': ['Reddit'],
    'iphone': ['iPhone'],
    'ipad': ['iPad'],
    'macbook': ['MacBook'],
    'android': ['Android'],
    'windows': ['Windows'],
    'apple': ['Apple'],
    'google': ['Google'],
    'microsoft': ['Microsoft'],
    'samsung': ['Samsung'],
    
    // Acentos y gramática
    'cafe': ['café'],
    'menu': ['menú'],
    'peru': ['Perú'],
    'mexico': ['México'],
    'bogota': ['Bogotá'],
    'medellin': ['Medellín'],
    'mas': ['más'],
    'tambien': ['también'],
    'facil': ['fácil'],
    'dificil': ['difícil'],
    'util': ['útil'],
    'movil': ['móvil'],
    'debil': ['débil'],
    'aver': ['a ver'],
    'ay': ['hay'],
    'ahi': ['ahí'],
    'asia': ['hacia'],
    'asta': ['hasta'],
    'echo': ['hecho'],
    'aora': ['ahora'],
    'despues': ['después'],
    'si': ['sí'],
    'solo': ['sólo'],
    
    // Errores de escritura rápida
    'q': ['que'],
    'x': ['por'],
    'xq': ['porque'],
    'xk': ['porque'],
    'tb': ['también'],
    'tmb': ['también'],
    'tbn': ['también'],
    'pq': ['porque'],
    'porq': ['porque']
};

let currentField = null;
let suggestionBox = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeIntuitiveAutocorrector();
});

function initializeIntuitiveAutocorrector() {
    const fields = document.querySelectorAll('input[type="text"], textarea');
    
    fields.forEach(field => {
        // Remover atributos nativos para control manual
        field.removeAttribute('spellcheck');
        field.removeAttribute('autocorrect');
        
        // Añadir eventos
        field.addEventListener('input', handleFieldInput);
        field.addEventListener('blur', handleFieldBlur);
        field.addEventListener('click', handleFieldClick);
        field.addEventListener('keydown', handleFieldKeydown);
        
        // Marcar como inicializado
        field.setAttribute('data-autocorrector-active', 'true');
    });
    
    // Crear el contenedor de sugerencias
    createSuggestionBox();
    
    console.log('🔤 Autocorrector intuitivo inicializado en', fields.length, 'campos');
}

function createSuggestionBox() {
    suggestionBox = document.createElement('div');
    suggestionBox.className = 'autocorrector-suggestions';
    suggestionBox.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: none;
        max-width: 200px;
        font-size: 14px;
    `;
    document.body.appendChild(suggestionBox);
}

function handleFieldInput(event) {
    const field = event.target;
    currentField = field;
    
    // Retrasar el análisis para evitar lag
    clearTimeout(field.analysisTimeout);
    field.analysisTimeout = setTimeout(() => {
        analyzeText(field);
    }, 300);
}

function handleFieldBlur(event) {
    // Ocultar sugerencias al perder foco
    setTimeout(() => {
        hideSuggestions();
    }, 200);
}

function handleFieldClick(event) {
    const field = event.target;
    const clickPosition = getCaretPosition(field);
    const word = getWordAtPosition(field, clickPosition);
    
    if (word && hasError(word.text)) {
        showSuggestions(word, field);
    } else {
        hideSuggestions();
    }
}

function handleFieldKeydown(event) {
    // ESC para cerrar sugerencias
    if (event.key === 'Escape') {
        hideSuggestions();
    }
}

function analyzeText(field) {
    const text = field.value;
    const words = getWordsWithPositions(text);
    
    // Limpiar marcas anteriores
    clearErrorHighlights(field);
    
    // Marcar palabras con errores
    words.forEach(word => {
        if (hasError(word.text)) {
            highlightError(field, word);
        }
    });
}

function getWordsWithPositions(text) {
    const words = [];
    const regex = /\b\w+\b/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        words.push({
            text: match[0],
            start: match.index,
            end: match.index + match[0].length
        });
    }
    
    return words;
}

function hasError(word) {
    const lowerWord = word.toLowerCase();
    return CORRECCIONES.hasOwnProperty(lowerWord);
}

function highlightError(field, word) {
    // Crear un overlay para mostrar el subrayado
    let overlay = field.parentNode.querySelector('.autocorrector-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'autocorrector-overlay';
        overlay.style.cssText = `
            position: absolute;
            pointer-events: none;
            font-family: inherit;
            font-size: inherit;
            padding: inherit;
            border: inherit;
            margin: inherit;
            white-space: pre-wrap;
            overflow: hidden;
            z-index: 1;
            color: transparent;
        `;
        
        // Posicionar el overlay
        const fieldRect = field.getBoundingClientRect();
        const parentRect = field.parentNode.getBoundingClientRect();
        
        overlay.style.left = (fieldRect.left - parentRect.left) + 'px';
        overlay.style.top = (fieldRect.top - parentRect.top) + 'px';
        overlay.style.width = fieldRect.width + 'px';
        overlay.style.height = fieldRect.height + 'px';
        
        field.parentNode.style.position = 'relative';
        field.parentNode.appendChild(overlay);
    }
    
    // Añadir subrayado ondulado rojo
    const text = field.value;
    const beforeError = text.substring(0, word.start);
    const errorText = text.substring(word.start, word.end);
    const afterError = text.substring(word.end);
    
    overlay.innerHTML = `${beforeError}<span style="border-bottom: 2px wavy #ff4444; background: rgba(255,68,68,0.1);">${errorText}</span>${afterError}`;
}

function clearErrorHighlights(field) {
    const overlay = field.parentNode.querySelector('.autocorrector-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function getCaretPosition(field) {
    return field.selectionStart;
}

function getWordAtPosition(field, position) {
    const text = field.value;
    const words = getWordsWithPositions(text);
    
    return words.find(word => position >= word.start && position <= word.end);
}

function showSuggestions(word, field) {
    const suggestions = CORRECCIONES[word.text.toLowerCase()];
    if (!suggestions || suggestions.length === 0) return;
    
    // Limpiar contenido anterior
    suggestionBox.innerHTML = '';
    
    // Crear encabezado
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 8px 12px;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        color: #666;
        font-size: 12px;
    `;
    header.textContent = `"${word.text}" - Sugerencias:`;
    suggestionBox.appendChild(header);
    
    // Crear opciones de sugerencias
    suggestions.forEach((suggestion, index) => {
        const option = document.createElement('div');
        option.className = 'suggestion-option';
        option.style.cssText = `
            padding: 10px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            transition: background 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        option.innerHTML = `
            <span style="font-weight: 500;">${suggestion}</span>
            <span style="font-size: 11px; color: #999;">Click para cambiar</span>
        `;
        
        option.addEventListener('mouseenter', () => {
            option.style.background = '#f8f9fa';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        
        option.addEventListener('click', () => {
            replaceWord(field, word, suggestion);
            hideSuggestions();
            showCorrectionNotification(word.text, suggestion);
        });
        
        suggestionBox.appendChild(option);
    });
    
    // Añadir opción "Mantener original"
    const keepOriginal = document.createElement('div');
    keepOriginal.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        background: #fff;
        color: #666;
        font-size: 12px;
        text-align: center;
        border-top: 1px solid #ddd;
    `;
    keepOriginal.textContent = 'Mantener "' + word.text + '"';
    keepOriginal.addEventListener('click', () => {
        hideSuggestions();
    });
    suggestionBox.appendChild(keepOriginal);
    
    // Posicionar cerca del campo
    positionSuggestionBox(field, word);
    
    // Mostrar
    suggestionBox.style.display = 'block';
}

function positionSuggestionBox(field, word) {
    const fieldRect = field.getBoundingClientRect();
    const textMetrics = getTextMetrics(field, word.start);
    
    let left = fieldRect.left + textMetrics.width;
    let top = fieldRect.bottom + 5;
    
    // Ajustar si se sale de la pantalla
    if (left + 200 > window.innerWidth) {
        left = fieldRect.right - 200;
    }
    
    if (top + 150 > window.innerHeight) {
        top = fieldRect.top - 150;
    }
    
    suggestionBox.style.left = left + 'px';
    suggestionBox.style.top = top + 'px';
}

function getTextMetrics(field, position) {
    // Crear un elemento temporal para medir texto
    const measurer = document.createElement('span');
    measurer.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: pre;
        font: ${getComputedStyle(field).font};
    `;
    measurer.textContent = field.value.substring(0, position);
    document.body.appendChild(measurer);
    
    const width = measurer.offsetWidth;
    document.body.removeChild(measurer);
    
    return { width };
}

function replaceWord(field, word, replacement) {
    const text = field.value;
    const newText = text.substring(0, word.start) + replacement + text.substring(word.end);
    
    field.value = newText;
    
    // Posicionar cursor después de la palabra reemplazada
    const newPosition = word.start + replacement.length;
    field.setSelectionRange(newPosition, newPosition);
    
    // Reanalizar después del cambio
    setTimeout(() => {
        analyzeText(field);
    }, 100);
}

function hideSuggestions() {
    if (suggestionBox) {
        suggestionBox.style.display = 'none';
    }
}

function showCorrectionNotification(original, corrected) {
    const notification = document.createElement('div');
    notification.innerHTML = `✨ "${original}" → "${corrected}"`;
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
        z-index: 10001;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animar salida
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2500);
}

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    if (suggestionBox && document.body.contains(suggestionBox)) {
        document.body.removeChild(suggestionBox);
    }
});

console.log('🔤 Autocorrector intuitivo cargado con', Object.keys(CORRECCIONES).length, 'correcciones');
