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
            { 
                name: 'Facebook', 
                icon: 'fab fa-facebook-f', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
            },
            { 
                name: 'Instagram', 
                icon: 'fab fa-instagram', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>'
            },
            { 
                name: 'LinkedIn', 
                icon: 'fab fa-linkedin-in', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
            },
            { 
                name: 'X / Twitter', 
                icon: 'fab fa-x-twitter', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
            },
            { 
                name: 'TikTok', 
                icon: 'fab fa-tiktok', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>'
            },
            { 
                name: 'WhatsApp', 
                icon: 'fab fa-whatsapp', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/></svg>'
            },
            { 
                name: 'Telegram', 
                icon: 'fab fa-telegram-plane', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>'
            },
            { 
                name: 'YouTube', 
                icon: 'fab fa-youtube', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
            },
            { 
                name: 'Reddit', 
                icon: 'fab fa-reddit-alien', 
                svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>'
            }
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
                                    ${network.svg}
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
