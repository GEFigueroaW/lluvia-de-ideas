// =========================================
// SISTEMA LIMPIO - SOLO NUEVA ESTRUCTURA
// =========================================

console.log('🚀 [CLEAN-SYSTEM] Iniciando sistema limpio...');

// Variables globales necesarias
window.currentIdeas = {};

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
    
    // Crear elemento de notificación visual
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ${type === 'error' ? 'background: #ff4444;' : ''}
        ${type === 'warning' ? 'background: #ffaa00;' : ''}
        ${type === 'success' ? 'background: #00ff88; color: #003311;' : ''}
        ${type === 'info' ? 'background: #007AFF;' : ''}
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Función para mostrar progreso de generación
function showGenerationProgress(platform, typesCount) {
    console.log(`[PROGRESS] Generando para ${platform} - ${typesCount} tipos`);
    
    const progressDiv = document.createElement('div');
    progressDiv.id = 'generation-progress';
    progressDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10001;
        text-align: center;
        color: #333;
        backdrop-filter: blur(10px);
    `;
    
    progressDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 15px;">🤖</div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Generando Ideas...</h3>
        <p style="margin: 0; color: #666;">Para ${platform} • ${typesCount} tipo${typesCount > 1 ? 's' : ''}</p>
        <div style="margin-top: 20px; width: 200px; height: 4px; background: #eee; border-radius: 2px; overflow: hidden;">
            <div style="width: 0%; height: 100%; background: linear-gradient(45deg, #667eea, #764ba2); transition: width 0.3s; animation: progress 2s ease-in-out infinite;" id="progress-bar"></div>
        </div>
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(progressDiv);
}

// Función para ocultar progreso
function hideGenerationProgress() {
    const progressDiv = document.getElementById('generation-progress');
    if (progressDiv) {
        progressDiv.remove();
    }
}

// Función para obtener red social seleccionada (con fallback robusto)
function getSelectedSocialNetworkSafe() {
    try {
        // Opción 1: Función del carrusel
        if (typeof getSelectedSocialNetwork === 'function') {
            const network = getSelectedSocialNetwork();
            if (network && network !== 'undefined' && network !== '') {
                console.log('[CLEAN-SYSTEM] Red social desde carrusel:', network);
                return network;
            }
        }
        
        // Opción 2: Input oculto
        const hiddenInput = document.getElementById('singleSocialNetwork');
        if (hiddenInput && hiddenInput.value) {
            console.log('[CLEAN-SYSTEM] Red social desde input:', hiddenInput.value);
            return hiddenInput.value;
        }
        
        // Opción 3: Carrusel global
        if (window.socialCarousel) {
            const network = window.socialCarousel.getSelectedNetwork();
            if (network && network.name) {
                console.log('[CLEAN-SYSTEM] Red social desde window.socialCarousel:', network.name);
                return network.name;
            }
        }
        
        // Fallback
        console.log('[CLEAN-SYSTEM] Usando fallback: Facebook');
        return 'Facebook';
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error al obtener red social:', error);
        return 'Facebook';
    }
}

// Función principal de generación
async function generateCopywritingClean() {
    console.log('🚀 [CLEAN-SYSTEM] Iniciando generación limpia...');
    
    const generateBtn = document.getElementById('generateCopyBtn');
    if (!generateBtn) {
        showNotification('❌ Botón de generación no encontrado', 'error');
        return;
    }
    
    const originalText = generateBtn.textContent;
    
    try {
        // Obtener datos del formulario
        const platform = getSelectedSocialNetworkSafe();
        const keyword = document.getElementById('copyKeyword')?.value?.trim() || '';
        const copyTypes = Array.from(document.querySelectorAll('input[name="copyTypes"]:checked'))
            .map(cb => cb.value);
        const userContext = document.getElementById('copyContext')?.value?.trim() || '';
        const includeCTA = document.getElementById('includeCTA')?.checked || false;
        
        console.log('[CLEAN-SYSTEM] Datos del formulario:');
        console.log('- Plataforma:', platform);
        console.log('- Keyword:', keyword);
        console.log('- Copy Types:', copyTypes);
        console.log('- Context:', userContext);
        console.log('- Include CTA:', includeCTA);
        
        // Validaciones
        if (!keyword) {
            showNotification('⚠️ Por favor ingresa una palabra clave', 'warning');
            return;
        }
        
        if (copyTypes.length === 0) {
            showNotification('⚠️ Por favor selecciona al menos un tipo de copy', 'warning');
            return;
        }
        
        if (copyTypes.length > 3) {
            showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
            return;
        }
        
        // Actualizar botón
        generateBtn.textContent = 'Generando...';
        generateBtn.disabled = true;
        
        // Mostrar progreso
        showGenerationProgress(platform, copyTypes.length);
        
        // Simular llamada a API (reemplazar con la real)
        console.log('[CLEAN-SYSTEM] Simulando llamada a API...');
        
        // Para testing, crear ideas simuladas
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
        
        const simulatedIdeas = copyTypes.map((type, index) => ({
            copyType: type,
            content: `Esta es una idea simulada de tipo "${type}" para ${platform} sobre "${keyword}". ${userContext ? `Contexto: ${userContext}. ` : ''}${includeCTA ? 'Incluye llamada a la acción específica.' : ''}`,
            hashtags: `#${keyword.replace(/\s+/g, '')} #${platform} #Marketing`,
            platform: platform
        }));
        
        // Guardar ideas
        window.currentIdeas = {};
        simulatedIdeas.forEach((idea, index) => {
            window.currentIdeas[`idea${index + 1}`] = idea;
        });
        
        // Mostrar resultados
        displayResultsClean(window.currentIdeas);
        
        showNotification(`✅ ${simulatedIdeas.length} ideas generadas para ${platform}`, 'success');
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error en generación:', error);
        showNotification('❌ Error al generar ideas. Revisa la consola.', 'error');
    } finally {
        // Restaurar botón
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        hideGenerationProgress();
    }
}

// Función para mostrar resultados
function displayResultsClean(ideas) {
    console.log('[CLEAN-SYSTEM] Mostrando resultados:', ideas);
    
    let resultsContainer = document.getElementById('results');
    if (!resultsContainer) {
        // Crear contenedor de resultados si no existe
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'results';
        resultsContainer.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 15px;
            backdrop-filter: blur(10px);
        `;
        
        // Insertar después del formulario
        const form = document.getElementById('copywritingForm') || document.querySelector('form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(resultsContainer, form.nextSibling);
        } else {
            document.body.appendChild(resultsContainer);
        }
    }
    
    const ideaKeys = Object.keys(ideas);
    if (ideaKeys.length === 0) {
        resultsContainer.innerHTML = '<p>No hay ideas para mostrar.</p>';
        return;
    }
    
    let html = '<h2 style="color: white; margin-bottom: 20px;">💡 Ideas Generadas</h2>';
    
    ideaKeys.forEach((key, index) => {
        const idea = ideas[key];
        html += `
            <div style="
                background: rgba(255,255,255,0.1);
                padding: 20px;
                margin: 15px 0;
                border-radius: 10px;
                border-left: 4px solid #00ff88;
            ">
                <h3 style="color: #00ff88; margin: 0 0 10px 0;">${idea.copyType}</h3>
                <p style="color: white; line-height: 1.6; margin: 0 0 10px 0;">${idea.content}</p>
                <p style="color: #aaa; font-style: italic; margin: 0;">${idea.hashtags}</p>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
    
    // Scroll a resultados
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Manejar selección múltiple de tipos de copy
function handleCopyTypeSelectionClean() {
    const checkboxes = document.querySelectorAll('input[name="copyTypes"]');
    const maxSelections = 3;
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedCount = document.querySelectorAll('input[name="copyTypes"]:checked').length;
            
            if (selectedCount > maxSelections) {
                this.checked = false;
                showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
                return;
            }
            
            updateCopyTypeNoteClean(selectedCount);
        });
    });
}

// Actualizar nota explicativa
function updateCopyTypeNoteClean(selectedCount) {
    const noteElement = document.querySelector('.field-note');
    if (!noteElement) return;
    
    let noteText = '';
    if (selectedCount === 0) {
        noteText = '🎯 Selecciona 1-3 tipos de copy para generar ideas variadas.';
    } else if (selectedCount === 1) {
        noteText = '🎯 Obtendrás 3 variaciones del tipo seleccionado.';
    } else if (selectedCount === 2) {
        noteText = '🎯 Obtendrás 2 ideas del primer tipo + 1 del segundo.';
    } else if (selectedCount === 3) {
        noteText = '🎯 Obtendrás 1 idea de cada tipo seleccionado.';
    }
    
    noteElement.textContent = noteText;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ [CLEAN-SYSTEM] DOM cargado, inicializando...');
    
    // Manejar selección de tipos de copy
    handleCopyTypeSelectionClean();
    
    // Manejar envío del formulario
    const form = document.getElementById('copywritingForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            generateCopywritingClean();
        });
        console.log('✅ [CLEAN-SYSTEM] Formulario configurado');
    } else {
        console.warn('[CLEAN-SYSTEM] ⚠️ Formulario no encontrado');
    }
    
    // Configurar botón de generar directamente
    const generateBtn = document.getElementById('generateCopyBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateCopywritingClean();
        });
        console.log('✅ [CLEAN-SYSTEM] Botón generar configurado');
    } else {
        console.warn('[CLEAN-SYSTEM] ⚠️ Botón generar no encontrado');
    }
    
    // Inicializar nota
    updateCopyTypeNoteClean(1);
    
    console.log('🎉 [CLEAN-SYSTEM] Sistema limpio inicializado correctamente');
});

// Exponer funciones globalmente para compatibilidad
window.showNotification = showNotification;
window.generateCopywritingClean = generateCopywritingClean;
window.displayResultsClean = displayResultsClean;

console.log('✅ [CLEAN-SYSTEM] Script cargado correctamente');
