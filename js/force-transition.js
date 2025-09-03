// ==========================================
// FORZAR TRANSICIÓN DE PANTALLA DE CARGA
// ==========================================

console.log('🔄 [TRANSITION] Script de transición cargado');

// Función para forzar la transición
function forceTransition() {
    console.log('🔄 [TRANSITION] Forzando transición desde pantalla de carga...');
    
    // Ocultar pantalla de carga
    const loadingSection = document.getElementById('loadingSection');
    if (loadingSection) {
        loadingSection.style.display = 'none';
        loadingSection.style.visibility = 'hidden';
        loadingSection.style.opacity = '0';
        loadingSection.classList.add('is-hidden');
        console.log('✅ [TRANSITION] Pantalla de carga ocultada');
    }
    
    // Mostrar contenido principal
    const mainApp = document.getElementById('mainApp');
    if (mainApp) {
        mainApp.style.display = 'block';
        mainApp.style.visibility = 'visible';
        mainApp.style.opacity = '1';
        mainApp.classList.remove('is-hidden');
        console.log('✅ [TRANSITION] Aplicación principal mostrada');
    }
    
    // Forzar visibilidad de todo el contenido
    const allSections = document.querySelectorAll('section:not(#loadingSection):not(#loginSection)');
    allSections.forEach(section => {
        section.style.display = 'block';
        section.style.visibility = 'visible';
        section.classList.remove('is-hidden');
    });
    
    // Asegurar que el body esté completamente visible
    document.body.style.overflow = 'auto';
    document.body.style.visibility = 'visible';
    
    console.log('🎉 [TRANSITION] Transición completada');
}

// Ejecutar transición después de 1 segundo
setTimeout(forceTransition, 1000);

// También exponer globalmente para poder ejecutar desde consola
window.forceTransition = forceTransition;

// Ejecutar al cargar completamente la página
window.addEventListener('load', () => {
    console.log('📄 [TRANSITION] Página completamente cargada');
    setTimeout(forceTransition, 500);
});

console.log('✅ [TRANSITION] Script de transición inicializado');
