/* =========================================
   CAROUSEL CONTROLLER - BOTONES OPTIMIZADOS
   ========================================= */

class OptimizedCopyCarousel {
    constructor() {
        this.carousel = document.getElementById('copyCarousel');
        this.container = document.querySelector('.copy-carousel-container');
        this.viewport = document.querySelector('.copy-carousel-viewport');
        this.controls = document.querySelector('.copy-carousel-controls');
        this.items = [];
        this.selectedTypes = [];
        this.currentIndex = 0;
        this.maxSelections = 3;
        this.isInitialized = false;
        
        console.log('🎠 [OPTIMIZED] Iniciando carousel optimizado...');
        this.init();
    }
    
    init() {
        if (!this.carousel) {
            console.error('❌ [CAROUSEL] Elemento carousel no encontrado');
            return;
        }
        
        this.items = Array.from(this.carousel.querySelectorAll('.copy-carousel-item'));
        
        if (this.items.length === 0) {
            console.error('❌ [CAROUSEL] No se encontraron elementos del carousel');
            return;
        }
        
        this.ensureControlsExist();
        this.setupEventListeners();
        this.updatePositions();
        this.selectDefaultTypes();
        this.updateSelections();
        this.isInitialized = true;
        
        console.log('✅ [CAROUSEL] Inicializado con', this.items.length, 'elementos');
        this.debugCarouselState();
    }
    
    ensureControlsExist() {
        if (!this.controls) {
            console.log('🔧 [CAROUSEL] Creando controles del carousel...');
            
            const controlsHTML = `
                <div class="copy-carousel-controls">
                    <button type="button" class="copy-carousel-btn" onclick="optimizedCarousel.rotate(-1)" title="🔼 VER TIPOS ANTERIORES">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button type="button" class="copy-carousel-btn" onclick="optimizedCarousel.rotate(1)" title="🔽 VER MÁS TIPOS">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            `;
            
            if (this.container) {
                this.container.insertAdjacentHTML('beforeend', controlsHTML);
                this.controls = this.container.querySelector('.copy-carousel-controls');
                console.log('✅ [CAROUSEL] Controles creados exitosamente');
            } else {
                console.error('❌ [CAROUSEL] Container no encontrado, no se pueden crear controles');
            }
        } else {
            console.log('✅ [CAROUSEL] Controles ya existen');
        }
        
        // Asegurar que los botones tengan event listeners
        this.setupControlButtons();
    }
    
    setupControlButtons() {
        const upBtn = this.container?.querySelector('.copy-carousel-btn:first-child');
        const downBtn = this.container?.querySelector('.copy-carousel-btn:last-child');
        
        if (upBtn && downBtn) {
            // Remover listeners existentes
            upBtn.removeEventListener('click', this.handleUpClick);
            downBtn.removeEventListener('click', this.handleDownClick);
            
            // Agregar nuevos listeners
            this.handleUpClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.rotate(-1);
            };
            
            this.handleDownClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.rotate(1);
            };
            
            upBtn.addEventListener('click', this.handleUpClick);
            downBtn.addEventListener('click', this.handleDownClick);
            
            console.log('✅ [CAROUSEL] Event listeners agregados a los botones SÚPER VISIBLES');
        }
    }
    
    setupEventListeners() {
        // Click en elementos para seleccionar
        this.items.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSelection(item, index);
            });
        });
        
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.copy-carousel-container')) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.rotate(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.rotate(1);
                }
            }
        });
        
        // Touch gestures para móvil
        this.setupTouchControls();
        
        console.log('✅ [CAROUSEL] Event listeners configurados');
    }
    
    setupTouchControls() {
        if (!this.viewport) return;
        
        let startY = 0;
        let endY = 0;
        
        this.viewport.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        this.viewport.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            const deltaY = startY - endY;
            
            if (Math.abs(deltaY) > 50) { // Minimum swipe distance
                if (deltaY > 0) {
                    this.rotate(1); // Swipe up = next
                } else {
                    this.rotate(-1); // Swipe down = previous
                }
            }
        }, { passive: true });
    }
    
    rotate(direction) {
        if (!this.isInitialized) return;
        
        this.currentIndex += direction;
        
        // Wrap around
        if (this.currentIndex >= this.items.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.items.length - 1;
        }
        
        this.updatePositions();
        console.log('🔄 [CAROUSEL] Rotado, nuevo índice:', this.currentIndex);
        
        // Feedback visual
        this.showRotationFeedback(direction);
    }
    
    showRotationFeedback(direction) {
        const btn = direction > 0 ? 
            this.controls?.querySelector('.copy-carousel-btn:last-child') : 
            this.controls?.querySelector('.copy-carousel-btn:first-child');
            
        if (btn) {
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    }
    
    updatePositions() {
        this.items.forEach((item, index) => {
            const relativePosition = index - this.currentIndex;
            item.setAttribute('data-position', relativePosition);
            
            // Normalizar posición para el rango visible
            let normalizedPosition = relativePosition;
            const totalItems = this.items.length;
            
            if (normalizedPosition > totalItems / 2) {
                normalizedPosition -= totalItems;
            } else if (normalizedPosition < -totalItems / 2) {
                normalizedPosition += totalItems;
            }
            
            // Aplicar transformaciones específicas
            this.applyTransform(item, normalizedPosition);
        });
    }
    
    applyTransform(item, position) {
        let transform = '';
        let opacity = 1;
        let zIndex = 5;
        
        switch (position) {
            case 0: // Centro
                transform = 'translateY(-50%) translateZ(0px) rotateX(0deg)';
                opacity = 1;
                zIndex = 5;
                break;
            case 1: // Abajo
                transform = 'translateY(-50%) translateZ(-100px) rotateX(30deg) translateY(80px)';
                opacity = 0.7;
                zIndex = 4;
                break;
            case -1: // Arriba
                transform = 'translateY(-50%) translateZ(-100px) rotateX(-30deg) translateY(-80px)';
                opacity = 0.7;
                zIndex = 4;
                break;
            case 2: // Más abajo
                transform = 'translateY(-50%) translateZ(-200px) rotateX(60deg) translateY(160px)';
                opacity = 0.4;
                zIndex = 3;
                break;
            case -2: // Más arriba
                transform = 'translateY(-50%) translateZ(-200px) rotateX(-60deg) translateY(-160px)';
                opacity = 0.4;
                zIndex = 3;
                break;
            default: // Ocultos
                transform = 'translateY(-50%) translateZ(-300px) rotateX(90deg)';
                opacity = 0;
                zIndex = 1;
                break;
        }
        
        item.style.transform = transform;
        item.style.opacity = opacity;
        item.style.zIndex = zIndex;
    }
    
    toggleSelection(item, index) {
        const copyType = item.getAttribute('data-copy');
        
        if (this.selectedTypes.includes(copyType)) {
            // Deseleccionar
            this.selectedTypes = this.selectedTypes.filter(type => type !== copyType);
            item.classList.remove('selected');
            console.log('❌ [SELECTION] Deseleccionado:', copyType);
        } else if (this.selectedTypes.length < this.maxSelections) {
            // Seleccionar
            this.selectedTypes.push(copyType);
            item.classList.add('selected');
            console.log('✅ [SELECTION] Seleccionado:', copyType);
        } else {
            // Máximo alcanzado
            this.showMaxSelectionAlert();
            return;
        }
        
        this.updateSelections();
        this.updateFormInputs();
        
        // Feedback visual
        this.showSelectionFeedback(item);
    }
    
    showSelectionFeedback(item) {
        item.style.transform = item.style.transform + ' scale(1.05)';
        setTimeout(() => {
            // Restaurar transform original
            this.updatePositions();
        }, 200);
    }
    
    selectDefaultTypes() {
        const defaultTypes = [
            'Informativo y educativo',
            'Venta directa y persuasivo', 
            'Posicionamiento y branding'
        ];
        
        defaultTypes.forEach(type => {
            const item = this.items.find(item => item.getAttribute('data-copy') === type);
            if (item && !this.selectedTypes.includes(type)) {
                this.selectedTypes.push(type);
                item.classList.add('selected');
            }
        });
        
        console.log('🎯 [DEFAULT] Tipos predeterminados seleccionados:', this.selectedTypes);
    }
    
    updateSelections() {
        const countElement = document.getElementById('selectionsCount');
        const listElement = document.getElementById('selectionsList');
        
        if (countElement) {
            countElement.textContent = `${this.selectedTypes.length}/${this.maxSelections}`;
        }
        
        if (listElement) {
            if (this.selectedTypes.length === 0) {
                listElement.innerHTML = '<span class="no-selections">Ningún tipo seleccionado</span>';
            } else {
                listElement.innerHTML = this.selectedTypes.map(type => `
                    <span class="selected-tag">
                        ${type}
                        <button class="remove-btn" onclick="optimizedCarousel.removeSelection('${type}')" title="Eliminar">
                            ×
                        </button>
                    </span>
                `).join('');
            }
        }
    }
    
    removeSelection(copyType) {
        this.selectedTypes = this.selectedTypes.filter(type => type !== copyType);
        
        // Remover clase selected del elemento
        const item = this.items.find(item => item.getAttribute('data-copy') === copyType);
        if (item) {
            item.classList.remove('selected');
        }
        
        this.updateSelections();
        this.updateFormInputs();
        console.log('🗑️ [REMOVE] Eliminado:', copyType);
    }
    
    updateFormInputs() {
        // Actualizar checkboxes ocultos para compatibilidad con el formulario existente
        const checkboxes = document.querySelectorAll('input[name="copyTypes"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.selectedTypes.includes(checkbox.value);
        });
    }
    
    showMaxSelectionAlert() {
        this.showNotification('⚠️ Máximo 3 selecciones', 'Solo puedes seleccionar hasta 3 tipos de copy', 'warning');
    }
    
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification is-${type} copy-notification`;
        notification.innerHTML = `
            <button class="delete" onclick="this.parentElement.remove()"></button>
            <strong>${title}</strong><br>
            ${message}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            padding: 1rem;
            background: white;
            border-left: 4px solid #667eea;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    // Métodos públicos
    getSelectedTypes() {
        return [...this.selectedTypes];
    }
    
    setSelectedTypes(types) {
        this.selectedTypes = [];
        this.items.forEach(item => item.classList.remove('selected'));
        
        types.forEach(type => {
            if (this.selectedTypes.length < this.maxSelections) {
                const item = this.items.find(item => item.getAttribute('data-copy') === type);
                if (item) {
                    this.selectedTypes.push(type);
                    item.classList.add('selected');
                }
            }
        });
        
        this.updateSelections();
        this.updateFormInputs();
    }
    
    debugCarouselState() {
        console.log('🔍 [DEBUG] Estado del carousel:', {
            initialized: this.isInitialized,
            itemsCount: this.items.length,
            currentIndex: this.currentIndex,
            selectedTypes: this.selectedTypes,
            hasControls: !!this.controls,
            hasContainer: !!this.container,
            hasViewport: !!this.viewport
        });
    }
}

// Funciones globales de compatibilidad
function rotateCopyCarousel(direction) {
    if (window.optimizedCarousel && window.optimizedCarousel.isInitialized) {
        window.optimizedCarousel.rotate(direction);
    } else {
        console.warn('⚠️ [GLOBAL] Carousel no está inicializado');
    }
}

function getSelectedCopyTypes() {
    if (window.optimizedCarousel && window.optimizedCarousel.selectedTypes.length > 0) {
        console.log('🎯 [GLOBAL] Tipos seleccionados:', window.optimizedCarousel.selectedTypes);
        return window.optimizedCarousel.selectedTypes;
    }
    
    // Fallback a tipos predeterminados
    const defaultTypes = [
        'Informativo y educativo',
        'Venta directa y persuasivo', 
        'Posicionamiento y branding'
    ];
    
    console.log('⚠️ [GLOBAL] No hay selección, usando tipos predeterminados:', defaultTypes);
    return defaultTypes;
}

// Inicialización mejorada
function initOptimizedCarousel() {
    if (document.getElementById('copyCarousel')) {
        window.optimizedCarousel = new OptimizedCopyCarousel();
        console.log('🎠 [GLOBAL] Carousel optimizado inicializado');
        return true;
    } else {
        console.warn('⚠️ [GLOBAL] Elemento carousel no encontrado');
        return false;
    }
}

// Múltiples métodos de inicialización para asegurar que funcione
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 [DOM] DOMContentLoaded disparado');
    setTimeout(() => {
        initOptimizedCarousel();
    }, 500);
});

// Fallback si DOMContentLoaded ya pasó
if (document.readyState === 'loading') {
    // El DOM aún se está cargando
    console.log('📄 [DOM] Estado: loading');
} else {
    // El DOM ya se cargó
    console.log('📄 [DOM] Estado:', document.readyState);
    setTimeout(() => {
        initOptimizedCarousel();
    }, 100);
}

// Último recurso - init después de window.load
window.addEventListener('load', function() {
    console.log('🪟 [WINDOW] Load event disparado');
    setTimeout(() => {
        if (!window.optimizedCarousel || !window.optimizedCarousel.isInitialized) {
            console.log('🔄 [FALLBACK] Intentando inicializar carousel...');
            initOptimizedCarousel();
        }
    }, 1000);
});

// CSS para animaciones de notificación
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .copy-notification {
        border-left: 4px solid #667eea !important;
    }
`;
document.head.appendChild(notificationStyles);

console.log('🚀 [SCRIPT] Optimized Copy Carousel script cargado');
