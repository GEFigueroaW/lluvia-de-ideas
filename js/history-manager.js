// =========================================
// HISTORIAL DE IDEAS - FUNCIONALIDAD COMPLETA
// =========================================

console.log('📚 [HISTORY] Inicializando sistema de historial...');

// Variables para el historial
let userIdeasHistory = [];
let currentHistoryFilter = '';

// Estructura de datos del historial
/*
Cada elemento del historial tendrá:
{
    id: 'unique-id',
    timestamp: Date.now(),
    date: 'formatted-date',
    platform: 'Instagram',
    keyword: 'marketing digital',
    copyTypes: ['Informativo y educativo', 'Venta directa'],
    context: 'optional context',
    ideas: [
        {
            type: 'Informativo y educativo',
            content: 'El contenido generado...'
        }
    ]
}
*/

// Función para guardar una sesión en el historial
function saveToHistory(sessionData) {
    console.log('💾 [HISTORY] Guardando sesión en historial...');
    
    const historyItem = {
        id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        platform: sessionData.platform || 'No especificada',
        keyword: sessionData.keyword || 'Sin tema',
        copyTypes: sessionData.copyTypes || [],
        context: sessionData.context || '',
        ideas: sessionData.ideas || []
    };
    
    // Obtener historial actual del localStorage
    let currentHistory = JSON.parse(localStorage.getItem('feedflow_history') || '[]');
    
    // Agregar nueva sesión al inicio
    currentHistory.unshift(historyItem);
    
    // Mantener máximo 50 sesiones para evitar que crezca demasiado
    if (currentHistory.length > 50) {
        currentHistory = currentHistory.slice(0, 50);
    }
    
    // Guardar en localStorage
    localStorage.setItem('feedflow_history', JSON.stringify(currentHistory));
    
    // Actualizar variable global
    userIdeasHistory = currentHistory;
    
    // Actualizar display
    updateHistoryDisplay();
    
    console.log('✅ [HISTORY] Sesión guardada:', historyItem.id);
    showNotification('💾 Sesión guardada en el historial', 'success');
}

// Función para cargar el historial
function loadHistory() {
    console.log('📂 [HISTORY] Cargando historial...');
    
    try {
        const historyData = localStorage.getItem('feedflow_history');
        userIdeasHistory = historyData ? JSON.parse(historyData) : [];
        
        console.log(`📊 [HISTORY] Cargadas ${userIdeasHistory.length} sesiones`);
        updateHistoryDisplay();
        
    } catch (error) {
        console.error('❌ [HISTORY] Error al cargar historial:', error);
        userIdeasHistory = [];
        updateHistoryDisplay();
    }
}

// Función para actualizar el display del historial
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) {
        console.log('⚠️ [HISTORY] Container no encontrado');
        return;
    }
    
    console.log(`🔄 [HISTORY] Actualizando display con ${userIdeasHistory.length} sesiones`);
    
    // Filtrar historial si hay búsqueda activa
    let filteredHistory = userIdeasHistory;
    if (currentHistoryFilter) {
        filteredHistory = userIdeasHistory.filter(item => 
            item.keyword.toLowerCase().includes(currentHistoryFilter.toLowerCase()) ||
            item.platform.toLowerCase().includes(currentHistoryFilter.toLowerCase()) ||
            item.copyTypes.some(type => type.toLowerCase().includes(currentHistoryFilter.toLowerCase()))
        );
    }
    
    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-empty">
                <div class="empty-icon">
                    <i class="fas fa-history"></i>
                </div>
                <h4>No hay sesiones guardadas</h4>
                <p>Genera tu primera idea para ver el historial aquí</p>
            </div>
        `;
        return;
    }
    
    // Generar HTML para cada sesión
    const historyHTML = filteredHistory.map(session => `
        <div class="history-item" data-session-id="${session.id}">
            <div class="history-header">
                <div class="history-title">
                    <strong>${session.keyword}</strong>
                    <span class="history-platform">${session.platform}</span>
                </div>
                <div class="history-date">${session.date}</div>
            </div>
            <div class="history-meta">
                <span class="history-types">${session.copyTypes.length} tipos: ${session.copyTypes.join(', ')}</span>
                <span class="history-count">${session.ideas.length} ideas</span>
            </div>
            <div class="history-actions">
                <button class="history-btn view-btn" onclick="viewHistorySession('${session.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="history-btn copy-btn" onclick="copyHistorySession('${session.id}')">
                    <i class="fas fa-copy"></i> Copiar
                </button>
                <button class="history-btn export-btn" onclick="exportHistorySession('${session.id}')">
                    <i class="fas fa-download"></i> Exportar
                </button>
                <button class="history-btn delete-btn" onclick="deleteHistorySession('${session.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    historyContainer.innerHTML = historyHTML;
}

// Función para ver una sesión del historial
function viewHistorySession(sessionId) {
    console.log('👁️ [HISTORY] Viendo sesión:', sessionId);
    
    const session = userIdeasHistory.find(item => item.id === sessionId);
    if (!session) {
        showNotification('❌ Sesión no encontrada', 'error');
        return;
    }
    
    // Crear modal para mostrar la sesión
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
        <div class="history-modal-content">
            <div class="history-modal-header">
                <h3>📝 ${session.keyword}</h3>
                <button class="history-modal-close" onclick="this.closest('.history-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="history-modal-body">
                <div class="session-info">
                    <p><strong>Plataforma:</strong> ${session.platform}</p>
                    <p><strong>Fecha:</strong> ${session.date}</p>
                    <p><strong>Tipos:</strong> ${session.copyTypes.join(', ')}</p>
                    ${session.context ? `<p><strong>Contexto:</strong> ${session.context}</p>` : ''}
                </div>
                <div class="session-ideas">
                    ${session.ideas.map((idea, index) => `
                        <div class="idea-preview">
                            <h4>💡 Idea ${index + 1} - ${idea.type}</h4>
                            <div class="idea-content">${idea.content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="history-modal-footer">
                <button class="history-btn copy-btn" onclick="copyHistorySession('${sessionId}')">
                    <i class="fas fa-copy"></i> Copiar Todo
                </button>
                <button class="history-btn export-btn" onclick="exportHistorySession('${sessionId}')">
                    <i class="fas fa-download"></i> Exportar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Función para copiar una sesión al portapapeles
async function copyHistorySession(sessionId) {
    console.log('📋 [HISTORY] Copiando sesión:', sessionId);
    
    const session = userIdeasHistory.find(item => item.id === sessionId);
    if (!session) {
        showNotification('❌ Sesión no encontrada', 'error');
        return;
    }
    
    const textToCopy = `📝 ${session.keyword} - ${session.platform}
📅 ${session.date}
🎯 Tipos: ${session.copyTypes.join(', ')}
${session.context ? `📋 Contexto: ${session.context}\n` : ''}
${'='.repeat(50)}

${session.ideas.map((idea, index) => `💡 IDEA ${index + 1} - ${idea.type}
${idea.content}

`).join('')}`;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showNotification('📋 Sesión copiada al portapapeles', 'success');
    } catch (error) {
        console.error('Error al copiar:', error);
        showNotification('❌ Error al copiar al portapapeles', 'error');
    }
}

// Función para exportar una sesión
function exportHistorySession(sessionId) {
    console.log('💾 [HISTORY] Exportando sesión:', sessionId);
    
    const session = userIdeasHistory.find(item => item.id === sessionId);
    if (!session) {
        showNotification('❌ Sesión no encontrada', 'error');
        return;
    }
    
    const dataToExport = {
        session: session,
        exportDate: new Date().toISOString(),
        exportedBy: 'FeedFlow'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedflow_${session.keyword.replace(/[^a-z0-9]/gi, '_')}_${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('💾 Sesión exportada', 'success');
}

// Función para eliminar una sesión
function deleteHistorySession(sessionId) {
    console.log('🗑️ [HISTORY] Eliminando sesión:', sessionId);
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta sesión del historial?')) {
        return;
    }
    
    // Filtrar el historial para remover la sesión
    userIdeasHistory = userIdeasHistory.filter(item => item.id !== sessionId);
    
    // Actualizar localStorage
    localStorage.setItem('feedflow_history', JSON.stringify(userIdeasHistory));
    
    // Actualizar display
    updateHistoryDisplay();
    
    showNotification('🗑️ Sesión eliminada del historial', 'success');
}

// Función para configurar la búsqueda en el historial
function setupHistorySearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        currentHistoryFilter = e.target.value;
        updateHistoryDisplay();
    });
    
    console.log('🔍 [HISTORY] Búsqueda configurada');
}

// Función para limpiar todo el historial
function clearAllHistory() {
    if (!confirm('¿Estás seguro de que quieres eliminar TODO el historial? Esta acción no se puede deshacer.')) {
        return;
    }
    
    userIdeasHistory = [];
    localStorage.removeItem('feedflow_history');
    updateHistoryDisplay();
    
    showNotification('🗑️ Historial completamente eliminado', 'success');
}

// Funciones globales para usar desde HTML
window.viewHistorySession = viewHistorySession;
window.copyHistorySession = copyHistorySession;
window.exportHistorySession = exportHistorySession;
window.deleteHistorySession = deleteHistorySession;
window.clearAllHistory = clearAllHistory;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadHistory();
        setupHistorySearch();
        console.log('✅ [HISTORY] Sistema de historial inicializado');
    }, 1000);
});

// Función para que otros módulos puedan guardar en el historial
window.saveToHistory = saveToHistory;

console.log('📚 [HISTORY] Módulo de historial cargado');
