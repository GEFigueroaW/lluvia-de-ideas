// ==========================================
// FORZADOR DE ENVÍO DE EMAIL DE VERIFICACIÓN
// ==========================================

// Ejecutar en la consola después de hacer login
async function forceEmailVerification() {
    try {
        // Importar Firebase auth
        const auth = window.firebase?.auth ? window.firebase.auth() : 
                    (await import('./js/firebase-config.js')).auth;
        
        const user = auth.currentUser;
        
        if (!user) {
            console.log('❌ No hay usuario logueado');
            alert('Por favor, inicia sesión primero');
            return;
        }
        
        console.log('📧 Usuario actual:', user.email);
        console.log('📧 Email verificado:', user.emailVerified);
        
        if (user.emailVerified) {
            console.log('✅ El email ya está verificado');
            alert('El email ya está verificado');
            return;
        }
        
        console.log('📧 Enviando email de verificación...');
        
        // Usar Firebase v9 syntax
        const { sendEmailVerification } = await import('https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js');
        
        await sendEmailVerification(user, {
            url: window.location.origin,
            handleCodeInApp: false
        });
        
        console.log('✅ Email de verificación enviado a:', user.email);
        alert(`✅ Email de verificación enviado a: ${user.email}\n\nRevisa:\n- Bandeja de entrada\n- Spam/Correo no deseado\n- Promociones\n\nEl remitente será: noreply@brain-storm-8f0d8.firebaseapp.com`);
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        
        if (error.code === 'auth/too-many-requests') {
            alert('❌ Demasiados intentos. Espera unos minutos e intenta de nuevo.');
        } else if (error.code === 'auth/user-token-expired') {
            alert('❌ Sesión expirada. Vuelve a iniciar sesión.');
        } else {
            alert(`❌ Error: ${error.message}`);
        }
    }
}

// Función para verificar manualmente (bypass administrativo)
async function adminVerifyEmail() {
    try {
        const auth = window.firebase?.auth ? window.firebase.auth() : 
                    (await import('./js/firebase-config.js')).auth;
        
        const user = auth.currentUser;
        
        if (!user) {
            console.log('❌ No hay usuario logueado');
            return;
        }
        
        console.log('🔧 Aplicando verificación administrativa...');
        
        // Marcar como verificado administrativamente
        localStorage.setItem('admin_email_verified', user.email);
        localStorage.setItem('admin_bypass_verification', 'true');
        localStorage.setItem('skip_email_verification', 'true');
        
        console.log('✅ Verificación administrativa aplicada');
        alert('✅ Verificación administrativa aplicada. Recargando página...');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error en verificación administrativa:', error);
    }
}

// Exportar funciones para uso global
window.forceEmailVerification = forceEmailVerification;
window.adminVerifyEmail = adminVerifyEmail;

console.log('📧 Herramientas de email cargadas:');
console.log('📧 forceEmailVerification() - Reenviar email de verificación');
console.log('🔧 adminVerifyEmail() - Bypass administrativo');

export { forceEmailVerification, adminVerifyEmail };
