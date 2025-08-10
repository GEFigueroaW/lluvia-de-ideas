/**
 * Autocorrector simple y funcional
 * Detecta errores y muestra sugerencias al hacer clic
 */

// Base de datos de correcciones
const CORRECCIONES = {
    // Marketing y copywriting
    'marketting': ['marketing'],
    'marketin': ['marketing'],
    'merketing': ['marketing'],
    'copywrite': ['copywriting'],
    'copywrting': ['copywriting'],
    'copywritng': ['copywriting'],
    
    // Redes sociales
    'facebook': ['Facebook'],
    'instagram': ['Instagram'],  
    'twitter': ['Twitter'],
    'linkedin': ['LinkedIn'],
    'whatsapp': ['WhatsApp'],
    'youtube': ['YouTube'],
    'tiktok': ['TikTok'],
    'telegram': ['Telegram'],
    'reddit': ['Reddit'],
    
    // Tecnología
    'iphone': ['iPhone'],
    'ipad': ['iPad'],
    'android': ['Android'],
    'apple': ['Apple'],
    'google': ['Google'],
    'microsoft': ['Microsoft'],
    'samsung': ['Samsung'],
    
    // Acentos comunes
    'cafe': ['café'],
    'menu': ['menú'],
    'peru': ['Perú'],
    'mexico': ['México'],
    'bogota': ['Bogotá'],
    'mas': ['más'],
    'tambien': ['también'],
    'facil': ['fácil'],
    'dificil': ['difícil'],
    'util': ['útil'],
    
    // Errores frecuentes
    'aver': ['a ver'],
    'ay': ['hay'],
    'ahi': ['ahí'],
    'echo': ['hecho'],
    'aora': ['ahora'],
    'despues': ['después'],
    'si': ['sí'],
    'solo': ['sólo']
};

let suggestionBox = null;
let currentField = null;
let currentWordSpan = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    initializeAutocorrector();
});

function initializeAutocorrector() {
    const fields = document.querySelectorAll('input[type="text"], textarea');
    
    fields.forEach(field => {
        // Múltiples eventos para asegurar compatibilidad
        field.addEventListener('input', debounce(() => checkSpelling(field), 500));
        field.addEventListener('click', (e) => handleFieldClick(field, e));
        field.addEventListener('mousedown', (e) => handleFieldClick(field, e));
        field.addEventListener('dblclick', (e) => handleFieldClick(field, e)); // Doble clic
        field.addEventListener('touchstart', (e) => handleFieldClick(field, e));
        field.addEventListener('focus', () => currentField = field);
        
        // Evento especial para cuando se selecciona texto
        field.addEventListener('selectionchange', () => {
            if (document.activeElement === field) {
                handleFieldClick(field, { type: 'selectionchange' });
            }
        });
        
        // Debug: verificar que se detectan los eventos
        field.addEventListener('click', () => {
            console.log('🖱️ Click detectado en campo:', field.id || field.name || 'sin-id');
        });
    });
    
    createSuggestionBox();
    console.log('🔤 Autocorrector inicializado en', fields.length, 'campos');
}

function createSuggestionBox() {
    suggestionBox = document.createElement('div');
    suggestionBox.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 150px;
        max-width: 250px;
    `;
    document.body.appendChild(suggestionBox);
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!suggestionBox.contains(e.target) && e.target !== currentWordSpan) {
            hideSuggestions();
        }
    });
}

function checkSpelling(field) {
    if (!field.value) return;
    
    const words = field.value.split(/(\s+)/);
    let hasErrors = false;
    
    // Limpiar spans anteriores
    clearErrorSpans(field);
    
    words.forEach((word, index) => {
        const cleanWord = word.trim().toLowerCase();
        if (cleanWord && CORRECCIONES[cleanWord]) {
            hasErrors = true;
            markWordAsError(field, word, index);
        }
    });
}

function clearErrorSpans(field) {
    // Remover los spans de error anteriores
    field.style.background = '';
    field.style.backgroundImage = '';
}

function markWordAsError(field, word, index) {
    // En lugar de overlay, usar un enfoque más simple con eventos
    field.setAttribute('data-has-errors', 'true');
    
    // Añadir un indicador visual simple
    if (!field.style.borderBottom.includes('wavy')) {
        field.style.borderBottom = '2px solid #e5e7eb';
        field.style.borderBottomColor = field.style.borderBottomColor || '#e5e7eb';
    }
}

function handleFieldClick(field, event) {
    console.log('🎯 handleFieldClick ejecutado para:', field.id || 'campo-sin-id');
    console.log('📍 Evento:', event.type);
    
    // Pequeño delay para asegurar que el cursor esté posicionado
    setTimeout(() => {
        const cursorPosition = field.selectionStart;
        const text = field.value;
        console.log('📝 Texto completo:', text);
        console.log('📍 Posición cursor:', cursorPosition);
        
        // Buscar TODAS las palabras del texto, no solo en el cursor
        const words = text.split(/\s+/);
        console.log('📝 Palabras encontradas:', words);
        
        let foundErrorWord = null;
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            if (CORRECCIONES[cleanWord]) {
                console.log('🔍 Palabra con error encontrada:', word, '→', CORRECCIONES[cleanWord]);
                foundErrorWord = {
                    word: cleanWord,
                    original: word,
                    start: text.indexOf(word),
                    end: text.indexOf(word) + word.length
                };
            }
        });
        
        if (foundErrorWord) {
            console.log('✅ Mostrando sugerencias para:', foundErrorWord.word);
            showSuggestionsForWord(field, foundErrorWord);
        } else {
            // Si no hay errores, buscar la palabra actual en el cursor
            const wordInfo = getWordAtCursor(text, cursorPosition);
            if (wordInfo && CORRECCIONES[wordInfo.word.toLowerCase()]) {
                console.log('✅ Palabra en cursor con corrección:', wordInfo.word);
                showSuggestionsForWord(field, wordInfo);
            } else {
                console.log('❌ No hay corrección disponible');
                hideSuggestions();
            }
        }
    }, 10);
}

function getWordAtCursor(text, position) {
    console.log('🔍 getWordAtCursor - texto:', text.substring(Math.max(0, position-10), position+10));
    console.log('📍 Posición:', position);
    
    if (!text || position < 0) return null;
    
    // Encontrar la palabra en la posición del cursor
    let start = position;
    let end = position;
    
    // Si estamos en un espacio, buscar la palabra más cercana hacia atrás
    if (position > 0 && /\s/.test(text[position])) {
        start = position - 1;
    }
    
    // Buscar el inicio de la palabra
    while (start > 0 && /\w/.test(text[start - 1])) {
        start--;
    }
    
    // Buscar el final de la palabra (desde la posición inicial)
    end = Math.max(position, start);
    while (end < text.length && /\w/.test(text[end])) {
        end++;
    }
    
    if (start < end) {
        const wordFound = {
            word: text.substring(start, end),
            start: start,
            end: end
        };
        console.log('✅ Palabra encontrada:', wordFound);
        return wordFound;
    }
    
    console.log('❌ No se encontró palabra válida');
    return null;
}

function showSuggestionsForWord(field, wordInfo) {
    const suggestions = CORRECCIONES[wordInfo.word.toLowerCase()];
    if (!suggestions) return;
    
    // Limpiar contenido anterior
    suggestionBox.innerHTML = '';
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 8px 12px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        font-weight: 600;
        color: #495057;
        font-size: 12px;
    `;
    header.textContent = `"${wordInfo.word}" → Sugerencias:`;
    suggestionBox.appendChild(header);
    
    // Sugerencias
    suggestions.forEach(suggestion => {
        const option = document.createElement('div');
        option.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            transition: background-color 0.2s;
            border-bottom: 1px solid #f1f3f4;
        `;
        option.textContent = suggestion;
        
        option.addEventListener('mouseenter', () => {
            option.style.backgroundColor = '#e9ecef';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.backgroundColor = 'transparent';
        });
        
        option.addEventListener('click', () => {
            replaceWord(field, wordInfo, suggestion);
            hideSuggestions();
            showNotification(`"${wordInfo.word}" → "${suggestion}"`);
        });
        
        suggestionBox.appendChild(option);
    });
    
    // Opción "Mantener"
    const keepOption = document.createElement('div');
    keepOption.style.cssText = `
        padding: 6px 12px;
        cursor: pointer;
        font-size: 11px;
        color: #6c757d;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
        text-align: center;
    `;
    keepOption.textContent = `Mantener "${wordInfo.word}"`;
    keepOption.addEventListener('click', hideSuggestions);
    suggestionBox.appendChild(keepOption);
    
    // Posicionar y mostrar
    positionSuggestionBox(field);
    suggestionBox.style.display = 'block';
}

function positionSuggestionBox(field) {
    const rect = field.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    
    let top = rect.bottom + scrollY + 5;
    let left = rect.left + scrollX;
    
    // Ajustar si se sale de la pantalla
    if (left + 250 > window.innerWidth) {
        left = window.innerWidth - 250 - 10;
    }
    
    if (top + 150 > window.innerHeight + scrollY) {
        top = rect.top + scrollY - 150;
    }
    
    suggestionBox.style.top = top + 'px';
    suggestionBox.style.left = left + 'px';
}

function replaceWord(field, wordInfo, replacement) {
    const text = field.value;
    const newText = text.substring(0, wordInfo.start) + replacement + text.substring(wordInfo.end);
    
    field.value = newText;
    
    // Posicionar cursor
    const newPosition = wordInfo.start + replacement.length;
    field.setSelectionRange(newPosition, newPosition);
    
    // Rechequear ortografía
    setTimeout(() => checkSpelling(field), 100);
}

function hideSuggestions() {
    if (suggestionBox) {
        suggestionBox.style.display = 'none';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = `✓ ${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        z-index: 10001;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Función auxiliar para debounce
function debounce(func, wait) {
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

console.log('🔤 Autocorrector simple inicializado con', Object.keys(CORRECCIONES).length, 'correcciones');
