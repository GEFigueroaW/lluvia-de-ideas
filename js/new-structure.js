// =========================================
// NUEVA LÓGICA PARA 3 IDEAS - 1 RED SOCIAL
// =========================================

// Manejar selección múltiple de tipos de copy
function handleCopyTypeSelection() {
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
            
            // Actualizar la nota explicativa
            updateCopyTypeNote(selectedCount);
        });
    });
}

// Actualizar nota explicativa según selección
function updateCopyTypeNote(selectedCount) {
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

// Generar copywriting con nueva estructura
async function generateCopywritingNew() {
    console.log('[NEW-STRUCTURE] 🚀 Iniciando generación de copywriting...');
    const generateBtn = document.getElementById('generateCopyBtn');
    const originalText = generateBtn.textContent;
    
    try {
        // Obtener datos del formulario con validación robusta
        let platform;
        try {
            platform = getSelectedSocialNetwork();
            console.log('[NEW-STRUCTURE] 📱 Plataforma obtenida:', platform);
        } catch (error) {
            console.error('[NEW-STRUCTURE] ❌ Error al obtener red social:', error);
            platform = 'Facebook'; // Fallback por defecto
        }
        
        // Si aún es null o undefined, usar Facebook como fallback
        if (!platform || platform === 'undefined' || platform === '') {
            console.log('[NEW-STRUCTURE] ⚠️ Plataforma vacía, usando Facebook como fallback');
            platform = 'Facebook';
        }
        
        const keyword = document.getElementById('copyKeyword').value.trim();
        const copyTypes = Array.from(document.querySelectorAll('input[name="copyTypes"]:checked'))
            .map(cb => cb.value);
            
        console.log('[NEW-STRUCTURE] 📝 Datos del formulario:');
        console.log('- Plataforma:', platform);
        console.log('- Keyword:', keyword);
        console.log('- Copy Types:', copyTypes);
        const userContext = document.getElementById('copyContext').value.trim();
        const includeCTA = document.getElementById('includeCTA').checked;
        
        // Validaciones
        if (!keyword) {
            console.log('[NEW-STRUCTURE] ❌ Keyword vacío');
            showNotification('⚠️ Por favor ingresa una palabra clave', 'warning');
            return;
        }
        
        if (copyTypes.length === 0) {
            console.log('[NEW-STRUCTURE] ❌ No hay tipos de copy seleccionados');
            showNotification('⚠️ Por favor selecciona al menos un tipo de copy', 'warning');
            return;
        }
        
        if (copyTypes.length > 3) {
            console.log('[NEW-STRUCTURE] ❌ Demasiados tipos de copy seleccionados');
            showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
            return;
        }
        
        console.log('[NEW-STRUCTURE] ✅ Validaciones pasadas, iniciando generación...');
        
        // UI de loading
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generando 3 Ideas...';
        
        // Mostrar indicador de progreso
        showGenerationProgress(platform, copyTypes.length);
        
        // Preparar contexto con CTA
        const finalContext = includeCTA 
            ? `${userContext} INCLUIR llamada a la acción específica.`
            : `${userContext} SIN llamada a la acción - contenido reflexivo.`;
        
        // Llamar a la API
        const response = await fetch('https://us-central1-brain-storm-8f0d8.cloudfunctions.net/generateIdeas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keyword: keyword,
                platform: platform,
                copyTypes: copyTypes,
                userContext: finalContext,
                uid: getCurrentUserId() || 'anonymous-' + Date.now()
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error del servidor');
        }
        
        const result = await response.json();
        
        if (result.data.success) {
            displayResults(result.data);
            showNotification('✅ ¡3 ideas generadas exitosamente!', 'success');
        } else {
            throw new Error('Error en la generación de ideas');
        }
        
    } catch (error) {
        console.error('Error generando copywriting:', error);
        showNotification('❌ Error: ' + error.message, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Generar 3 Ideas de Copywriting';
        hideGenerationProgress();
    }
}

// Mostrar progreso de generación
function showGenerationProgress(platform, typeCount) {
    const progressContainer = document.getElementById('ideasContainer');
    if (!progressContainer) return;
    
    progressContainer.innerHTML = `
        <div class="modern-content-card has-text-centered" style="padding: 3rem;">
            <div class="generation-progress">
                <div class="progress-icon">
                    <i class="fas fa-brain fa-3x" style="color: #667eea; animation: pulse 1.5s infinite;"></i>
                </div>
                <h3 style="margin: 2rem 0 1rem 0; color: #2d3748;">Generando Ideas para ${platform}</h3>
                <p style="color: #718096; margin-bottom: 2rem;">
                    Creando ${typeCount === 1 ? '3 variaciones' : typeCount === 2 ? '2 + 1 ideas' : '1 idea de cada tipo'}...
                </p>
                
                <div class="progress-steps">
                    <div class="step active">
                        <div class="step-number">1</div>
                        <span>Analizando contexto</span>
                    </div>
                    <div class="step active">
                        <div class="step-number">2</div>
                        <span>Generando con IA</span>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <span>Optimizando resultados</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Ocultar progreso
function hideGenerationProgress() {
    // Se ocultará automáticamente cuando se muestren los resultados
}

// Mostrar resultados de las 3 ideas
function displayResults(data) {
    const container = document.getElementById('ideasContainer');
    if (!container) return;
    
    const { ideas, remainingUses } = data;
    const ideaKeys = Object.keys(ideas).sort(); // idea_1, idea_2, idea_3
    
    let html = `
        <div class="modern-content-card">
            <div class="results-header">
                <h2 style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                    <div style="width: 50px; height: 50px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-lightbulb" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <span style="color: #2d3748;">3 Ideas para ${ideas[ideaKeys[0]]?.platform}</span>
                        <small style="display: block; color: #718096; font-weight: 400; font-size: 0.875rem;">
                            Usos restantes: ${remainingUses === 'unlimited' ? '∞' : remainingUses}
                        </small>
                    </div>
                </h2>
            </div>
            
            <div class="ideas-grid">
    `;
    
    ideaKeys.forEach((ideaKey, index) => {
        const idea = ideas[ideaKey];
        const ideaNumber = index + 1;
        const isTemplate = idea.rawContent.includes('⚠️ GENERADO CON TEMPLATES');
        
        html += `
            <div class="idea-card ${isTemplate ? 'template-warning' : 'ai-generated'}">
                <div class="idea-header">
                    <div class="idea-number">${ideaNumber}</div>
                    <div class="idea-meta">
                        <h3>${idea.copyType}</h3>
                        <span class="generation-badge ${isTemplate ? 'template' : 'ai'}">
                            ${isTemplate ? '📋 Template' : '🧠 IA'}
                        </span>
                    </div>
                </div>
                
                <div class="idea-content">
                    <div class="copy-text">
                        ${formatCopyText(idea.rawContent)}
                    </div>
                    
                    ${idea.hashtags && idea.hashtags.length > 0 ? `
                        <div class="hashtags">
                            <strong>Hashtags:</strong>
                            ${idea.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${idea.cta ? `
                        <div class="cta-section">
                            <strong>CTA:</strong> ${idea.cta}
                        </div>
                    ` : ''}
                </div>
                
                <div class="idea-actions">
                    <button onclick="copyToClipboard('${ideaKey}')" class="action-btn copy">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button onclick="showVisualFormat('${ideaKey}')" class="action-btn visual">
                        <i class="fas fa-image"></i> Formato Visual
                    </button>
                    <button onclick="editIdea('${ideaKey}')" class="action-btn edit">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="results-footer">
                <div class="generation-summary">
                    <div class="summary-item">
                        <i class="fas fa-share-alt"></i>
                        <span>Plataforma: ${ideas[ideaKeys[0]]?.platform}</span>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-palette"></i>
                        <span>Tipos: ${[...new Set(ideaKeys.map(key => ideas[key].copyType))].join(', ')}</span>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-clock"></i>
                        <span>Generado: ${new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button onclick="generateCopywritingNew()" class="modern-btn is-primary">
                        <i class="fas fa-refresh mr-2"></i>Generar Nuevas Ideas
                    </button>
                    <button onclick="copyAllIdeas()" class="modern-btn is-secondary">
                        <i class="fas fa-copy mr-2"></i>Copiar Todas
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Formatear texto del copy
function formatCopyText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Copiar idea individual al portapapeles
function copyToClipboard(ideaKey) {
    const ideas = window.currentIdeas || {};
    const idea = ideas[ideaKey];
    
    if (!idea) return;
    
    let textToCopy = idea.rawContent;
    if (idea.hashtags && idea.hashtags.length > 0) {
        textToCopy += '\n\n' + idea.hashtags.join(' ');
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('✅ Idea copiada al portapapeles', 'success');
    });
}

// Copiar todas las ideas
function copyAllIdeas() {
    const ideas = window.currentIdeas || {};
    const ideaKeys = Object.keys(ideas).sort();
    
    let allText = '';
    ideaKeys.forEach((key, index) => {
        const idea = ideas[key];
        const ideaNumber = index + 1;
        
        allText += `IDEA ${ideaNumber} - ${idea.copyType}\n`;
        allText += '='.repeat(50) + '\n';
        allText += idea.rawContent + '\n';
        
        if (idea.hashtags && idea.hashtags.length > 0) {
            allText += '\nHashtags: ' + idea.hashtags.join(' ') + '\n';
        }
        
        allText += '\n' + '-'.repeat(30) + '\n\n';
    });
    
    navigator.clipboard.writeText(allText).then(() => {
        showNotification('✅ Todas las ideas copiadas al portapapeles', 'success');
    });
}

// Mostrar formato visual
function showVisualFormat(ideaKey) {
    const ideas = window.currentIdeas || {};
    const idea = ideas[ideaKey];
    
    if (!idea || !idea.formatoVisual) {
        showNotification('⚠️ Formato visual no disponible', 'warning');
        return;
    }
    
    // Mostrar modal con formato visual
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Formato Visual para IA</h3>
                <button onclick="this.closest('.modal-overlay').remove()" class="close-btn">×</button>
            </div>
            <div class="modal-body">
                <p style="white-space: pre-wrap; line-height: 1.6;">${idea.formatoVisual}</p>
            </div>
            <div class="modal-footer">
                <button onclick="copyVisualFormat('${ideaKey}')" class="modern-btn is-primary">
                    <i class="fas fa-copy mr-2"></i>Copiar Formato
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Función auxiliar para obtener ID del usuario
function getCurrentUserId() {
    // Implementar según tu sistema de autenticación
    return localStorage.getItem('userId') || null;
}

// Función auxiliar para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Implementar según tu sistema de notificaciones
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    handleCopyTypeSelection();
    
    // Manejar envío del formulario
    const form = document.getElementById('copywritingForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            generateCopywritingNew();
        });
    }
    
    // Inicializar nota
    updateCopyTypeNote(1); // Por defecto hay 1 seleccionado
});

// Guardar ideas en variable global para acceso posterior
window.displayResults = function(data) {
    window.currentIdeas = data.ideas;
    displayResults(data);
};
