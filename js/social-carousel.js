/**
 * ===============================
 * CARRUSEL DE REDES SOCIALES
 * ===============================
 */

class SocialCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentIndex = 0;
        this.socialNetworks = [
            { name: 'Facebook', icon: 'fab fa-facebook-f', fallback: 'fab fa-facebook', text: 'f' },
            { name: 'Instagram', icon: 'fab fa-instagram', fallback: 'fab fa-instagram', text: '📷' },
            { name: 'LinkedIn', icon: 'fab fa-linkedin-in', fallback: 'fab fa-linkedin', text: 'in' },
            { name: 'X / Twitter', icon: 'fab fa-x-twitter', fallback: 'fab fa-twitter', text: '🐦' },
            { name: 'TikTok', icon: 'fab fa-tiktok', fallback: 'fab fa-tiktok', text: '♪' },
            { name: 'WhatsApp', icon: 'fab fa-whatsapp', fallback: 'fab fa-whatsapp', text: '💬' },
            { name: 'Telegram', icon: 'fab fa-telegram-plane', fallback: 'fab fa-telegram', text: '✈️' },
            { name: 'YouTube', icon: 'fab fa-youtube', fallback: 'fab fa-youtube', text: '▶️' },
            { name: 'Reddit', icon: 'fab fa-reddit-alien', fallback: 'fab fa-reddit', text: '👽' }
        ];
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateSelection();
        
        // Auto-seleccionar el primer elemento
        this.selectNetwork(0);
        
        // Verificar y aplicar fallbacks para íconos
        this.checkIconFallbacks();
    }

    checkIconFallbacks() {
        // Esperar un poco para que los íconos se carguen
        setTimeout(() => {
            this.items.forEach((item, index) => {
                const primaryIcon = item.querySelector('.social-icon i:first-child');
                const fallbackIcon = item.querySelector('.social-icon i:last-child');
                const textFallback = item.querySelector('.icon-text-fallback');
                
                if (primaryIcon && fallbackIcon && textFallback) {
                    // Verificar si el ícono principal se cargó correctamente
                    const computedStyle = window.getComputedStyle(primaryIcon, '::before');
                    const content = computedStyle.getPropertyValue('content');
                    
                    // Si no hay contenido o es "none", usar fallback
                    if (!content || content === 'none' || content === '""') {
                        primaryIcon.style.display = 'none';
                        fallbackIcon.style.display = 'inline-block';
                        
                        // Si el fallback tampoco funciona, usar texto
                        setTimeout(() => {
                            const fallbackStyle = window.getComputedStyle(fallbackIcon, '::before');
                            const fallbackContent = fallbackStyle.getPropertyValue('content');
                            
                            if (!fallbackContent || fallbackContent === 'none' || fallbackContent === '""') {
                                fallbackIcon.style.display = 'none';
                                textFallback.style.display = 'inline-block';
                            }
                        }, 200);
                    }
                }
            });
        }, 500);
        
        // Verificación adicional para asegurar que algo se muestre
        setTimeout(() => {
            this.items.forEach((item) => {
                const socialIcon = item.querySelector('.social-icon');
                const allIcons = socialIcon.querySelectorAll('i');
                const textFallback = socialIcon.querySelector('.icon-text-fallback');
                
                // Si ningún ícono es visible, mostrar el texto
                const hasVisibleIcon = Array.from(allIcons).some(icon => {
                    return window.getComputedStyle(icon).display !== 'none';
                });
                
                if (!hasVisibleIcon && textFallback) {
                    textFallback.style.display = 'inline-block';
                    console.log('Usando fallback de texto para:', item.dataset.network);
                }
            });
        }, 1000);
    }

    render() {
        const carouselHTML = `
            <div class="social-carousel">
                <div class="carousel-container">
                    <button class="carousel-nav prev" type="button">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    <div class="carousel-track">
                        ${this.socialNetworks.map((network, index) => `
                            <div class="social-item" data-network="${network.name}" data-index="${index}">
                                <div class="social-icon">
                                    <i class="${network.icon}" style="display: inline-block;"></i>
                                    <i class="${network.fallback}" style="display: none;"></i>
                                    <span class="icon-text-fallback" style="display: none; font-size: inherit; font-weight: bold;">${network.text}</span>
                                </div>
                                <div class="social-name">${network.name}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button class="carousel-nav next" type="button">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="carousel-indicators">
                    ${this.socialNetworks.map((_, index) => `
                        <div class="indicator" data-index="${index}"></div>
                    `).join('')}
                </div>
                
                <input type="hidden" id="singleSocialNetwork" name="socialNetwork" value="">
            </div>
        `;

        this.container.innerHTML = carouselHTML;
        
        // Referencias DOM
        this.track = this.container.querySelector('.carousel-track');
        this.items = this.container.querySelectorAll('.social-item');
        this.indicators = this.container.querySelectorAll('.indicator');
        this.prevBtn = this.container.querySelector('.carousel-nav.prev');
        this.nextBtn = this.container.querySelector('.carousel-nav.next');
        this.hiddenInput = this.container.querySelector('#singleSocialNetwork');
    }

    bindEvents() {
        // Navegación con botones
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        // Click en items
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => this.selectNetwork(index));
        });

        // Click en indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.selectNetwork(index));
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (this.container.contains(document.activeElement) || 
                document.activeElement === document.body) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.next();
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        // Ya está seleccionado el actual
                        break;
                }
            }
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;
        let isScrolling = false;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = false;
        });

        this.container.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                isScrolling = false;
                e.preventDefault(); // Prevenir scroll vertical
            } else {
                isScrolling = true;
            }
        });

        this.container.addEventListener('touchend', (e) => {
            if (!startX || isScrolling) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) { // Mínimo 50px para activar swipe
                if (diffX > 0) {
                    this.next(); // Swipe left -> next
                } else {
                    this.prev(); // Swipe right -> prev
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }

    prev() {
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.socialNetworks.length - 1;
        this.updateSelection();
    }

    next() {
        this.currentIndex = this.currentIndex < this.socialNetworks.length - 1 ? this.currentIndex + 1 : 0;
        this.updateSelection();
    }

    selectNetwork(index) {
        this.currentIndex = index;
        this.updateSelection();
    }

    updateSelection() {
        // Actualizar clases de items
        this.items.forEach((item, index) => {
            item.classList.remove('active', 'side');
            
            if (index === this.currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.add('side');
            }
        });

        // Actualizar indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // Actualizar input oculto
        const selectedNetwork = this.socialNetworks[this.currentIndex];
        this.hiddenInput.value = selectedNetwork.name;

        // Trigger custom event para notificar el cambio
        const changeEvent = new CustomEvent('socialNetworkChanged', {
            detail: {
                network: selectedNetwork.name,
                index: this.currentIndex
            }
        });
        this.container.dispatchEvent(changeEvent);

        console.log(`[CAROUSEL] Red social seleccionada: ${selectedNetwork.name}`);
    }

    // Método público para obtener la red seleccionada
    getSelectedNetwork() {
        return this.socialNetworks[this.currentIndex];
    }

    // Método público para seleccionar una red por nombre
    selectByName(networkName) {
        const index = this.socialNetworks.findIndex(n => n.name === networkName);
        if (index !== -1) {
            this.selectNetwork(index);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Buscar el contenedor del carrusel
    const carouselContainer = document.querySelector('.social-network-selector');
    
    if (carouselContainer) {
        // Agregar ID si no lo tiene
        if (!carouselContainer.id) {
            carouselContainer.id = 'socialCarouselContainer';
        }
        
        // Inicializar carrusel
        window.socialCarousel = new SocialCarousel(carouselContainer.id);
        
        // Escuchar cambios de red social
        carouselContainer.addEventListener('socialNetworkChanged', function(e) {
            console.log('[MAIN] Red social cambiada:', e.detail.network);
            
            // Actualizar nota de distribución si existe
            const distributionNote = document.querySelector('.field-note');
            if (distributionNote && distributionNote.textContent.includes('ideas diferentes')) {
                distributionNote.innerHTML = `🎯 Obtendrás 3 ideas diferentes para <strong>${e.detail.network}</strong>`;
            }
        });
    }
});

// Función helper para obtener la red social seleccionada (para compatibilidad)
function getSelectedSocialNetwork() {
    if (window.socialCarousel) {
        return window.socialCarousel.getSelectedNetwork().name;
    }
    
    // Fallback al input hidden
    const hiddenInput = document.getElementById('singleSocialNetwork');
    return hiddenInput ? hiddenInput.value : '';
}
