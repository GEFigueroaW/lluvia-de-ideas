// ==========================================
// INSTRUCCIONES PARA VERIFICAR EMAIL
// ==========================================

console.log(`
🔧 SOLUCIONES PARA VERIFICACIÓN DE EMAIL:

📋 OPCIÓN 1: Usar el botón en la interfaz
   - Inicia sesión con eugenfw@hotmail.com
   - Haz clic en el botón rojo "🔧 Bypass Admin"

📋 OPCIÓN 2: Ejecutar en consola
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Ejecuta: forceAdminBypass()

📋 OPCIÓN 3: Verificación automática de email
   - Ejecuta: firebase.auth().currentUser.reload()

📋 OPCIÓN 4: Si nada funciona
   - Ve directamente a: https://brain-storm-8f0d8.web.app/admin.html
   - Usa las funciones de administrador ahí

🎯 COMANDOS ÚTILES:
   - forceAdminBypass() → Fuerza el acceso a la app
   - firebase.auth().currentUser → Ver usuario actual
   - location.reload() → Recargar página

🔍 DEBUGGING:
   - console.log(firebase.auth().currentUser)
   - console.log('Email verificado:', firebase.auth().currentUser?.emailVerified)
`);

// Función helper para debugging
window.debugAuth = function() {
    const user = firebase.auth().currentUser;
    console.log('=== DEBUG AUTENTICACIÓN ===');
    console.log('Usuario:', user);
    console.log('Email:', user?.email);
    console.log('Email verificado:', user?.emailVerified);
    console.log('UID:', user?.uid);
    console.log('=== FIN DEBUG ===');
    return user;
};

// Función para recargar usuario
window.reloadUser = async function() {
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            await user.reload();
            console.log('✅ Usuario recargado');
            console.log('Email verificado ahora:', user.emailVerified);
            return true;
        } else {
            console.log('❌ No hay usuario logueado');
            return false;
        }
    } catch (error) {
        console.error('❌ Error recargando usuario:', error);
        return false;
    }
};

console.log('🚀 Helpers de debugging cargados: debugAuth(), reloadUser(), forceAdminBypass()');
