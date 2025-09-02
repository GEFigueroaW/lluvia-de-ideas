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
            { name: 'Facebook', icon: 'fab fa-facebook-f', emoji: 'fab fa-facebook-f' },
            { name: 'Instagram', icon: 'fab fa-instagram', emoji: 'fab fa-instagram' },
            { name: 'LinkedIn', icon: 'fab fa-linkedin-in', emoji: 'fab fa-linkedin-in' },
            { name: 'X / Twitter', icon: 'fab fa-x-twitter', emoji: 'fab fa-x-twitter' },
            { name: 'TikTok', icon: 'fab fa-tiktok', emoji: 'fab fa-tiktok' },
            { name: 'WhatsApp', icon: 'fab fa-whatsapp', emoji: 'fab fa-whatsapp' },
            { name: 'Telegram', icon: 'fab fa-telegram-plane', emoji: 'fab fa-telegram-plane' },
            { name: 'YouTube', icon: 'fab fa-youtube', emoji: 'fab fa-youtube' },
            { name: 'Reddit', icon: 'fab fa-reddit-alien', emoji: 'fab fa-reddit-alien' }
        ];
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateSelection();
        
        // Auto-seleccionar el primer elemento
        this.selectNetwork(0);
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
                                    <i class="${network.icon}"></i>
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
