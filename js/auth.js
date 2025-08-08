// =========================================
// MÓDULO DE AUTENTICACIÓN
// =========================================

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js';
import { handleError, showNotification, toggleButtonLoading } from './utils.js';

// =========================================
// VARIABLES GLOBALES
// =========================================
let currentUser = null;
const googleProvider = new GoogleAuthProvider();

// =========================================
// FUNCIONES DE AUTENTICACIÓN
// =========================================

/**
 * Inicializa el listener de estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 */
export function initAuthStateListener(callback) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (callback) callback(user);
    });
}

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {HTMLElement} button - Botón de submit (opcional)
 */
export async function signInWithEmail(email, password, button = null) {
    try {
        if (button) toggleButtonLoading(button, true);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
            showNotification('Por favor, verifica tu email antes de continuar.', 'warning');
            await signOut(auth);
            return false;
        }
        
        showNotification('¡Bienvenido de vuelta!', 'success');
        return true;
        
    } catch (error) {
        handleError(error, 'al iniciar sesión');
        return false;
    } finally {
        if (button) toggleButtonLoading(button, false);
    }
}

/**
 * Registra un nuevo usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} displayName - Nombre del usuario
 * @param {HTMLElement} button - Botón de submit (opcional)
 */
export async function registerWithEmail(email, password, displayName, button = null) {
    try {
        if (button) toggleButtonLoading(button, true);
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Actualizar el perfil con el nombre
        if (displayName) {
            await updateProfile(user, { displayName });
        }
        
        // Enviar email de verificación
        await sendEmailVerification(user);
        
        showNotification(
            'Cuenta creada exitosamente. Te hemos enviado un email de verificación.',
            'success'
        );
        
        // Cerrar sesión hasta que verifique el email
        await signOut(auth);
        return true;
        
    } catch (error) {
        handleError(error, 'al registrar usuario');
        return false;
    } finally {
        if (button) toggleButtonLoading(button, false);
    }
}

/**
 * Inicia sesión con Google
 * @param {HTMLElement} button - Botón de submit (opcional)
 */
export async function signInWithGoogle(button = null) {
    try {
        if (button) toggleButtonLoading(button, true);
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        showNotification(`¡Bienvenido, ${user.displayName}!`, 'success');
        return true;
        
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            handleError(error, 'al iniciar sesión con Google');
        }
        return false;
    } finally {
        if (button) toggleButtonLoading(button, false);
    }
}

/**
 * Cierra la sesión del usuario
 */
export async function logOut() {
    try {
        await signOut(auth);
        showNotification('Sesión cerrada correctamente', 'info');
        return true;
    } catch (error) {
        handleError(error, 'al cerrar sesión');
        return false;
    }
}

/**
 * Obtiene el usuario actual
 * @returns {Object|null} Usuario actual o null
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado
 */
export function isUserAuthenticated() {
    return currentUser !== null;
}

/**
 * Obtiene el token del usuario actual
 * @returns {Promise<string|null>} Token del usuario o null
 */
export async function getUserToken() {
    if (!currentUser) return null;
    
    try {
        return await currentUser.getIdToken();
    } catch (error) {
        handleError(error, 'al obtener token');
        return null;
    }
}

/**
 * Verifica si el usuario tiene email verificado
 * @returns {boolean} True si el email está verificado
 */
export function isEmailVerified() {
    return currentUser?.emailVerified || false;
}

/**
 * Reenvía el email de verificación
 */
export async function resendVerificationEmail() {
    if (!currentUser) {
        showNotification('No hay usuario autenticado', 'danger');
        return false;
    }
    
    try {
        await sendEmailVerification(currentUser);
        showNotification('Email de verificación enviado', 'success');
        return true;
    } catch (error) {
        handleError(error, 'al enviar email de verificación');
        return false;
    }
}
