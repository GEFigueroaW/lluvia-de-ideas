// ==========================================
// VERIFICADOR AUTOMÁTICO DE EMAIL ADMIN
// ==========================================

import { auth } from './js/firebase-config.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js';

/**
 * Función para marcar automáticamente el email como verificado para administradores
 */
async function forceEmailVerificationForAdmin() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            return false;
        }

        const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
        
        if (!ADMIN_EMAILS.includes(user.email)) {
            console.log('❌ Usuario no es administrador');
            return false;
        }

        console.log('🔧 Forzando verificación de email para admin:', user.email);

        // Recargar el usuario para obtener el estado más reciente
        await user.reload();
        
        if (user.emailVerified) {
            console.log('✅ Email ya está verificado');
            return true;
        }

        // Para administradores, podemos simular que el email está verificado
        // actualizando el perfil y recargando
        await updateProfile(user, {
            displayName: user.displayName || 'Administrador'
        });

        console.log('✅ Perfil de administrador actualizado');
        
        // Recargar la página para que tome los cambios
        setTimeout(() => {
            window.location.reload();
        }, 1000);

        return true;

    } catch (error) {
        console.error('❌ Error forzando verificación:', error);
        return false;
    }
}

/**
 * Función para omitir la verificación de email para administradores
 */
async function bypassEmailVerificationForAdmin() {
    const user = auth.currentUser;
    if (!user) return false;

    const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
    
    if (ADMIN_EMAILS.includes(user.email)) {
        console.log('🔑 Administrador detectado, omitiendo verificación de email');
        
        // Marcar como verificado en el localStorage para bypass
        localStorage.setItem('admin_email_verified', user.email);
        localStorage.setItem('admin_bypass_verification', 'true');
        
        return true;
    }
    
    return false;
}

// Auto-ejecutar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        const user = auth.currentUser;
        if (user && ['eugenfw@gmail.com', 'admin@feedflow.com'].includes(user.email)) {
            if (!user.emailVerified) {
                console.log('🔧 Auto-bypass para administrador sin email verificado');
                await bypassEmailVerificationForAdmin();
            }
        }
    }, 2000);
});

// Exportar funciones para uso manual
window.forceEmailVerificationForAdmin = forceEmailVerificationForAdmin;
window.bypassEmailVerificationForAdmin = bypassEmailVerificationForAdmin;

export { forceEmailVerificationForAdmin, bypassEmailVerificationForAdmin };
