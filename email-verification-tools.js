// Script para forzar reenvío de verificación de email
import { auth } from './js/firebase-config.js';
import { sendEmailVerification } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js';

async function forceResendVerification() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('❌ No hay usuario logueado');
            return;
        }
        
        if (user.emailVerified) {
            console.log('✅ Email ya está verificado');
            return;
        }
        
        console.log('📧 Reenviando email de verificación...');
        await sendEmailVerification(user);
        console.log('✅ Email de verificación enviado a:', user.email);
        alert('Email de verificación enviado. Revisa tu bandeja de entrada y spam.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error: ' + error.message);
    }
}

// Función para marcar como verificado administrativamente
async function forceMarkAsVerified() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('❌ No hay usuario logueado');
            return;
        }
        
        console.log('🔧 Forzando bypass de verificación...');
        
        // Recargar usuario
        await user.reload();
        
        // Simular que está verificado localmente
        localStorage.setItem('admin_verified_' + user.uid, 'true');
        
        console.log('✅ Bypass local aplicado');
        
        // Forzar actualización de la interfaz
        window.location.reload();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

window.forceResendVerification = forceResendVerification;
window.forceMarkAsVerified = forceMarkAsVerified;

console.log('📧 Funciones de verificación cargadas:');
console.log('- forceResendVerification() - Reenviar email');
console.log('- forceMarkAsVerified() - Bypass local');
