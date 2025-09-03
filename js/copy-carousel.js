// Carrusel vertical de tipos de copy
class CopyCarousel {
    constructor() {
        this.carousel = document.getElementById('copyCarousel');
        this.items = [];
        this.selectedTypes = [];
        this.currentIndex = 0;
        this.maxSelections = 3;
        
        this.init();
    }
    
    init() {
        if (!this.carousel) return;
        
        this.items = Array.from(this.carousel.querySelectorAll('.copy-carousel-item'));
        this.setupEventListeners();
        this.updatePositions();
        this.updateSelections();
        
        console.log('🎠 Copy Carousel inicializado con', this.items.length, 'elementos');
    }
    
    setupEventListeners() {
        // Click en elementos para seleccionar
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => {
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
    }
    
    rotate(direction) {
        this.currentIndex += direction;
        
        // Wrap around
        if (this.currentIndex >= this.items.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.items.length - 1;
        }
        
        this.updatePositions();
        console.log('🔄 Carousel rotado, nuevo índice:', this.currentIndex);
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
            console.log('❌ Deseleccionado:', copyType);
        } else if (this.selectedTypes.length < this.maxSelections) {
            // Seleccionar
            this.selectedTypes.push(copyType);
            item.classList.add('selected');
            console.log('✅ Seleccionado:', copyType);
        } else {
            // Máximo alcanzado
            this.showMaxSelectionAlert();
            return;
        }
        
        this.updateSelections();
        this.updateFormInputs();
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
        console.log('🗑️ Eliminado:', copyType);
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
                        <button class="remove-btn" onclick="copyCarousel.removeSelection('${type}')" title="Eliminar">
                            ×
                        </button>
                    </span>
                `).join('');
            }
        }
    }
    
    updateFormInputs() {
        // Actualizar checkboxes ocultos para compatibilidad con el formulario existente
        const checkboxes = document.querySelectorAll('input[name="copyTypes"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.selectedTypes.includes(checkbox.value);
        });
    }
    
    showMaxSelectionAlert() {
        // Crear notificación moderna en lugar de alert
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
    
    // Método público para obtener selecciones
    getSelectedTypes() {
        return [...this.selectedTypes];
    }
    
    // Método público para establecer selecciones programáticamente
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
}

// Función global para rotar el carrusel (llamada desde los botones)
function rotateCopyCarousel(direction) {
    if (window.copyCarousel) {
        window.copyCarousel.rotate(direction);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que todo esté cargado
    setTimeout(() => {
        if (document.getElementById('copyCarousel')) {
            window.copyCarousel = new CopyCarousel();
            console.log('🎠 Copy Carousel inicializado globalmente');
        }
    }, 500);
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
