// ==========================================
// BYPASS TEMPORAL PARA VERIFICACIÓN DE EMAIL
// ==========================================

/**
 * Función que se ejecuta automáticamente para bypass de verificación
 */
(function() {
    console.log('🔧 Bypass de verificación de email iniciado...');
    
    // Esperar a que Firebase esté listo
    setTimeout(() => {
        // Verificar si hay un usuario logueado
        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('👤 Usuario detectado:', user.email);
                    
                    const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
                    
                    if (ADMIN_EMAILS.includes(user.email)) {
                        console.log('🔑 Administrador detectado');
                        
                        if (!user.emailVerified) {
                            console.log('⚠️ Email no verificado, aplicando bypass...');
                            
                            // Ocultar mensajes de verificación
                            const verificationMessages = document.querySelectorAll('.notification');
                            verificationMessages.forEach(msg => {
                                if (msg.textContent.includes('verifica') || msg.textContent.includes('email')) {
                                    msg.style.display = 'none';
                                }
                            });
                            
                            // Forzar acceso a la aplicación
                            setTimeout(() => {
                                const loginSection = document.getElementById('loginSection');
                                const appSection = document.getElementById('appSection');
                                
                                if (loginSection) loginSection.classList.add('is-hidden');
                                if (appSection) appSection.classList.remove('is-hidden');
                                
                                // Mostrar notificación de bypass
                                console.log('✅ Bypass aplicado exitosamente');
                                
                                // Disparar evento personalizado para indicar que el usuario está listo
                                window.dispatchEvent(new CustomEvent('adminBypassComplete', {
                                    detail: { user: user }
                                }));
                                
                            }, 1000);
                        }
                    }
                }
            });
        }
    }, 3000);
})();

// Función para forzar bypass manual
window.forceAdminBypass = function() {
    console.log('🚀 Forzando bypass manual...');
    
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    
    if (loginSection) {
        loginSection.classList.add('is-hidden');
        console.log('✅ Login section ocultada');
    }
    if (appSection) {
        appSection.classList.remove('is-hidden');
        console.log('✅ App section mostrada');
    }
    
    // Ocultar todas las notificaciones de verificación
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notif => {
        if (notif.textContent.includes('verifica') || notif.textContent.includes('email')) {
            notif.remove();
        }
    });
    
    console.log('🎉 Bypass manual completado');
};

console.log('📝 Bypass script cargado. Usa forceAdminBypass() si es necesario.');
