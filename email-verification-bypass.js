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
                    
                    const ADMIN_EMAILS = ['eugenfw@gmail.com', 'eugenfw@hotmail.com', 'admin@feedflow.com'];
                    
                    if (ADMIN_EMAILS.includes(user.email)) {
                        console.log('🔑 Administrador detectado');
                        
                        if (!user.emailVerified) {
                            console.log('⚠️ Email no verificado, aplicando bypass completo...');
                            
                            // Activar funciones premium globalmente
                            activatePremiumFeatures();
                            
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
                                console.log('✅ Bypass completo aplicado exitosamente');
                                
                                // Disparar evento personalizado para indicar que el usuario está listo
                                window.dispatchEvent(new CustomEvent('adminBypassComplete', {
                                    detail: { user: user, premiumActive: true }
                                }));
                                
                            }, 1000);
                        }
                    }
                }
            });
        }
    }, 3000);
})();

// Función para activar funciones premium
async function activatePremiumFeatures() {
    try {
        console.log('🚀 Activando funciones premium...');
        
        // Marcar como premium en localStorage
        localStorage.setItem('isPremiumGlobal', 'true');
        localStorage.setItem('premiumActivatedBy', 'admin');
        localStorage.setItem('premiumActivatedAt', new Date().toISOString());
        
        // Activar todas las redes sociales
        const socialNetworks = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'YouTube', 'WhatsApp', 'Telegram'];
        socialNetworks.forEach(network => {
            localStorage.setItem(`network_${network}_enabled`, 'true');
        });
        
        // Activar todos los tipos de copy
        const copyTypes = [
            'De beneficio o solución',
            'De novedad o lanzamiento', 
            'De interacción o pregunta',
            'De urgencia o escasez',
            'Informativo o educativo',
            'Informal',
            'Llamada a la acción (CTA)',
            'Narrativo o storytelling',
            'Posicionamiento o branding',
            'Testimonio o prueba social',
            'Técnico o profesional',
            'Venta directa o persuasivo'
        ];
        copyTypes.forEach(type => {
            localStorage.setItem(`copytype_${type}_enabled`, 'true');
        });
        
        // Configurar generaciones ilimitadas
        localStorage.setItem('unlimitedGenerations', 'true');
        localStorage.setItem('weeklyCredits', '999');
        
        console.log('✅ Funciones premium activadas localmente');
        
        // También intentar activar en Firestore si es posible
        if (window.activatePremiumFeatures) {
            await window.activatePremiumFeatures();
        }
        
    } catch (error) {
        console.error('❌ Error activando funciones premium:', error);
    }
}

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
    
    // Activar funciones premium
    activatePremiumFeatures();
    
    // Ocultar todas las notificaciones de verificación
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notif => {
        if (notif.textContent.includes('verifica') || notif.textContent.includes('email')) {
            notif.remove();
        }
    });
    
    console.log('🎉 Bypass manual completado con funciones premium');
    
    // Mostrar mensaje de éxito
    setTimeout(() => {
        alert('🎉 ¡Bypass completo activado!\n✅ Acceso desbloqueado\n✅ Funciones premium activadas\n✅ Todas las redes sociales disponibles\n✅ Todos los tipos de copy disponibles');
    }, 500);
};

console.log('📝 Bypass script cargado. Usa forceAdminBypass() si es necesario.');
