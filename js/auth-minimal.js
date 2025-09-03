// ==========================================
// AUTENTICACIÓN MÍNIMA PARA FUNCIONAMIENTO
// ==========================================

console.log('🔐 [AUTH-MINIMAL] Inicializando autenticación mínima...');

// Estado de usuario por defecto
window.userProfile = {
    isAdmin: false,
    isPremium: false,
    emailVerified: false,
    uid: null,
    email: null
};

// Verificar bypass desde localStorage
function checkBypass() {
    const adminBypass = localStorage.getItem('feedflow_admin_bypass') === 'true';
    const premiumBypass = localStorage.getItem('feedflow_premium_bypass') === 'true';
    const emailVerified = localStorage.getItem('feedflow_email_verified') === 'true';
    
    if (adminBypass || premiumBypass || emailVerified) {
        console.log('🔓 [AUTH-MINIMAL] Bypass detectado');
        window.userProfile.isAdmin = adminBypass;
        window.userProfile.isPremium = premiumBypass;
        window.userProfile.emailVerified = emailVerified;
        return true;
    }
    return false;
}

// Función para mostrar la aplicación principal
function showMainApp() {
    console.log('✅ [AUTH-MINIMAL] Mostrando aplicación principal');
    
    // Ocultar elementos de autenticación si existen
    const authElements = document.querySelectorAll('.auth-container, .login-container, #loginSection');
    authElements.forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    // Mostrar elementos principales
    const mainElements = document.querySelectorAll('.main-container, .app-container, #mainApp, main, .copywriting-container');
    mainElements.forEach(el => {
        if (el) el.style.display = 'block';
    });
    
    // Buscar específicamente el generador de copywriting
    const copywritingSection = document.querySelector('#copywriting-generator, .form-container, .modern-container');
    if (copywritingSection) {
        copywritingSection.style.display = 'block';
    }
    
    // Si hay un formulario, asegurarse de que esté visible
    const form = document.getElementById('copywritingForm');
    if (form) {
        form.style.display = 'block';
        // Asegurarse de que el contenedor padre también esté visible
        let parent = form.parentElement;
        while (parent && parent !== document.body) {
            parent.style.display = 'block';
            parent = parent.parentElement;
        }
    }
}

// Función para verificar autenticación
function checkAuth() {
    console.log('🔍 [AUTH-MINIMAL] Verificando autenticación...');
    
    // Primero verificar bypass
    if (checkBypass()) {
        showMainApp();
        return;
    }
    
    // Para esta versión simplificada, permitir acceso directo
    console.log('🔓 [AUTH-MINIMAL] Permitiendo acceso directo sin autenticación');
    showMainApp();
}

// Función para bypass de admin (compatible con sistema anterior)
window.forceAdminBypass = function() {
    console.log('🔧 [AUTH-MINIMAL] Ejecutando bypass de administrador...');
    
    localStorage.setItem('feedflow_admin_bypass', 'true');
    localStorage.setItem('feedflow_premium_bypass', 'true');
    localStorage.setItem('feedflow_email_verified', 'true');
    
    window.userProfile.isAdmin = true;
    window.userProfile.isPremium = true;
    window.userProfile.emailVerified = true;
    
    showMainApp();
    
    // Mostrar notificación de éxito
    if (typeof showNotification === 'function') {
        showNotification('✅ Bypass de administrador activado', 'success');
    } else {
        console.log('✅ [AUTH-MINIMAL] Bypass de administrador activado');
    }
};

// Funciones compatibles con sistema anterior
window.isUserPremium = function() {
    return window.userProfile.isPremium || checkBypass();
};

window.getCurrentUser = function() {
    return window.userProfile.uid ? window.userProfile : null;
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [AUTH-MINIMAL] DOM cargado, inicializando autenticación...');
    
    // Pequeño delay para asegurar que todos los elementos estén cargados
    setTimeout(() => {
        checkAuth();
    }, 100);
});

// También ejecutar inmediatamente si el DOM ya está cargado
if (document.readyState === 'loading') {
    // DOM aún está cargando, esperar al evento DOMContentLoaded
} else {
    // DOM ya está cargado
    setTimeout(() => {
        checkAuth();
    }, 100);
}

console.log('✅ [AUTH-MINIMAL] Script de autenticación mínima cargado');
