// SCRIPT DE DIAGNÓSTICO PARA FIREBASE HOSTING
// Pegue este script en la consola del navegador en https://brain-storm-8f0d8.web.app/

console.log('🔍 INICIANDO DIAGNÓSTICO DE REDES SOCIALES');
console.log('==========================================');

// Verificar elementos del DOM
setTimeout(() => {
    console.log('📋 1. VERIFICANDO ELEMENTOS DEL DOM');
    
    const container = document.getElementById('socialNetworksContainer');
    console.log('socialNetworksContainer encontrado:', !!container);
    
    if (container) {
        console.log('Contenido del container:', container.innerHTML.length > 0 ? 'CON CONTENIDO' : 'VACÍO');
        console.log('Número de elementos hijo:', container.children.length);
        
        if (container.children.length > 0) {
            console.log('Primer elemento:', container.children[0].outerHTML);
        }
    }
    
    const copySelect = document.getElementById('copyType');
    console.log('copyType select encontrado:', !!copySelect);
    
    if (copySelect) {
        console.log('Número de opciones:', copySelect.children.length);
        if (copySelect.children.length > 1) {
            console.log('Segunda opción:', copySelect.children[1].textContent);
        }
    }
    
    console.log('');
    console.log('📋 2. VERIFICANDO SCRIPTS');
    
    // Verificar si el script de inicialización se cargó
    console.log('copywritingBasicInitialized:', window.copywritingBasicInitialized);
    
    // Verificar errores en consola
    const scripts = document.querySelectorAll('script[src]');
    console.log('Scripts cargados:', scripts.length);
    
    scripts.forEach((script, index) => {
        if (script.src.includes('copywriting')) {
            console.log(`Script ${index + 1}: ${script.src}`);
        }
    });
    
    console.log('');
    console.log('📋 3. VERIFICANDO CSS Y ESTILOS');
    
    // Verificar estilos CSS
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('Hojas de estilo cargadas:', stylesheets.length);
    
    // Verificar Font Awesome
    const faIcons = document.querySelectorAll('i[class*="fa-"]');
    console.log('Iconos Font Awesome encontrados:', faIcons.length);
    
    console.log('');
    console.log('📋 4. INTENTANDO INICIALIZACIÓN MANUAL');
    
    // Intentar inicialización manual
    if (!container || container.children.length === 0) {
        console.log('🔧 Intentando inicialización manual...');
        
        // Configuración básica de redes sociales
        const MANUAL_SOCIAL_NETWORKS = {
            facebook: { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877F2', premium: false },
            linkedin: { name: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0A66C2', premium: true },
            twitter: { name: 'X / Twitter', icon: 'fab fa-x-twitter', color: '#000000', premium: true },
        };
        
        if (container) {
            container.innerHTML = '';
            
            Object.entries(MANUAL_SOCIAL_NETWORKS).forEach(([key, network]) => {
                const item = document.createElement('div');
                item.className = `social-network-item ${network.premium ? 'disabled' : ''}`;
                item.dataset.network = key;
                
                if (key === 'facebook') {
                    item.classList.add('selected');
                }
                
                item.innerHTML = `
                    <i class="${network.icon}" style="color: ${network.color}; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                    <span style="font-size: 0.75rem; font-weight: 600; text-align: center;">${network.name}</span>
                `;
                
                container.appendChild(item);
            });
            
            console.log('✅ Inicialización manual completada');
            console.log('Elementos agregados:', container.children.length);
        }
    }
    
    // Verificar select de tipos de copy
    if (copySelect && copySelect.children.length <= 1) {
        console.log('🔧 Agregando tipos de copy manualmente...');
        
        const MANUAL_COPY_TYPES = [
            'Informativo o educativo',
            'Informal',
            'Técnico o profesional',
            'De beneficio o solución (Premium)',
            'De novedad o lanzamiento (Premium)',
        ];
        
        copySelect.innerHTML = '<option value="">Selecciona el tipo de copy...</option>';
        
        MANUAL_COPY_TYPES.forEach((type, index) => {
            const option = document.createElement('option');
            option.value = `type_${index}`;
            option.textContent = type;
            if (type.includes('Premium')) {
                option.disabled = true;
            }
            copySelect.appendChild(option);
        });
        
        console.log('✅ Tipos de copy agregados manualmente');
    }
    
    console.log('');
    console.log('🎯 DIAGNÓSTICO COMPLETADO');
    console.log('==========================================');
    
}, 3000);

// También ejecutar inmediatamente
console.log('👀 Estado inicial inmediato:');
console.log('- DOM ready state:', document.readyState);
console.log('- socialNetworksContainer:', !!document.getElementById('socialNetworksContainer'));
console.log('- copyType select:', !!document.getElementById('copyType'));
