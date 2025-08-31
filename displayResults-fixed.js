// FUNCIÓN SIMPLIFICADA PARA MOSTRAR SOLO CONTENIDO UNIFICADO
function displayCopywritingResults(copies, params) {
    const container = document.getElementById('ideasContainer');
    if (!container) return;
    
    const { socialNetworks, generationMode, keyword, copyType } = params;
    const copyTypeInfo = COPY_TYPES[copyType];
    
    let html = `
        <div class="modern-copywriting-results animate__animated animate__fadeInUp">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="font-size: 2rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">
                    ✍️ Copywriting Generado
                </h3>
                <p style="color: var(--text-secondary); font-size: 1rem;">
                    <strong>${keyword}</strong> • ${copyTypeInfo.name}
                </p>
            </div>
            
            <div class="copywriting-results-grid">
    `;
    
    copies.forEach((copy, index) => {
        const networkKey = generationMode === 'single' ? socialNetworks[0] : socialNetworks[index % socialNetworks.length];
        const network = SOCIAL_NETWORKS[networkKey];
        
        // Determinar qué contenido mostrar - PRIORIZAR CONTENIDO UNIFICADO
        let unifiedContent = '';
        if (copy.rawContent) {
            unifiedContent = copy.rawContent;
        } else if (copy.gancho && copy.textoPost && copy.cta) {
            // Combinar las partes en un solo texto fluido
            unifiedContent = `${copy.gancho} ${copy.textoPost} ${copy.cta}`;
            if (copy.hashtags && copy.hashtags.length > 0) {
                unifiedContent += ` ${copy.hashtags.join(' ')}`;
            }
        } else if (copy.gancho) {
            unifiedContent = copy.gancho;
        } else if (copy.textoPost) {
            unifiedContent = copy.textoPost;
        } else {
            unifiedContent = 'Sin contenido generado';
        }
        
        html += `
            <div class="copywriting-result-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                <div class="copywriting-header">
                    <div class="social-network-badge">
                        <i class="${network.icon}" style="color: ${network.color}"></i>
                        <span>${network.name}</span>
                    </div>
                    ${copy.variation ? `<span class="variation-badge">Variación ${copy.variation}</span>` : ''}
                </div>
                <div class="copywriting-content">
                    <div class="copy-section content-section">
                        <div class="section-content unified-content">${unifiedContent.replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
                <div class="copywriting-actions">
                    <button class="copy-btn primary" onclick="copySingleCopy(${JSON.stringify(copy).replace(/"/g, '&quot;')}, '${network.name}')">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button class="copy-btn secondary" onclick="editCopy(${index})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="copywriting-global-actions">
                <button class="modern-btn" onclick="copyAllCopywriting()" style="background: var(--accent-gradient); color: white;">
                    <i class="fas fa-copy mr-2"></i>
                    Copiar Todo
                </button>
                
                <button class="modern-btn" onclick="generateNewCopywriting()" style="background: var(--secondary-gradient); color: white;">
                    <i class="fas fa-refresh mr-2"></i>
                    Generar Nuevas
                </button>
                
                <button class="modern-btn" onclick="exportCopywriting()" style="background: var(--dark-gradient); color: white;">
                    <i class="fas fa-download mr-2"></i>
                    Exportar
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Hacer scroll automático a los resultados
    setTimeout(() => {
        container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 500);
}
