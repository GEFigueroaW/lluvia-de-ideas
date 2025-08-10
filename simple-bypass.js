// ==========================================
// FUNCIONES GLOBALES DE BYPASS SIMPLIFICADAS
// ==========================================

// Función para bypass de administrador
window.forceAdminBypass = function() {
    console.log('🔧 Ejecutando bypass de administrador...');
    
    // Simular usuario premium y admin
    localStorage.setItem('feedflow_admin_bypass', 'true');
    localStorage.setItem('feedflow_premium_bypass', 'true');
    localStorage.setItem('feedflow_email_verified', 'true');
    
    // Si hay un objeto global de estado del usuario, actualizarlo
    if (window.userProfile) {
        window.userProfile.isAdmin = true;
        window.userProfile.isPremium = true;
        window.userProfile.emailVerified = true;
    }
    
    // Mostrar notificación
    if (window.showNotification) {
        window.showNotification('🚀 Bypass activado: Admin + Premium + Email verificado', 'success');
    } else {
        console.log('✅ Bypass activado: Admin + Premium + Email verificado');
    }
    
    // Recargar la página después de un momento
    setTimeout(() => {
        location.reload();
    }, 1500);
};

// Función para forzar verificación de email
window.forceEmailVerification = function() {
    console.log('📧 Forzando verificación de email...');
    
    localStorage.setItem('feedflow_email_verified', 'true');
    
    if (window.showNotification) {
        window.showNotification('✅ Email marcado como verificado', 'success');
    } else {
        console.log('✅ Email marcado como verificado');
    }
    
    setTimeout(() => {
        location.reload();
    }, 1000);
};

// Función para limpiar todos los bypass
window.clearAllBypass = function() {
    console.log('🧹 Limpiando todos los bypass...');
    
    localStorage.removeItem('feedflow_admin_bypass');
    localStorage.removeItem('feedflow_premium_bypass');
    localStorage.removeItem('feedflow_email_verified');
    
    console.log('✅ Bypass limpiados');
    location.reload();
};

// Auto-ejecutar bypass si está en localStorage
(function() {
    const hasAdminBypass = localStorage.getItem('feedflow_admin_bypass') === 'true';
    const hasPremiumBypass = localStorage.getItem('feedflow_premium_bypass') === 'true';
    const hasEmailVerified = localStorage.getItem('feedflow_email_verified') === 'true';
    
    if (hasAdminBypass || hasPremiumBypass || hasEmailVerified) {
        console.log('🔧 Bypass detectado en localStorage:', {
            admin: hasAdminBypass,
            premium: hasPremiumBypass,
            emailVerified: hasEmailVerified
        });
    }
})();

console.log('🔧 Funciones de bypass cargadas:', {
    forceAdminBypass: 'disponible',
    forceEmailVerification: 'disponible', 
    clearAllBypass: 'disponible'
});
