// =========================================
// MÓDULO ADMIN - LÓGICA DE ADMINISTRACIÓN
// =========================================

import { db, functions } from './firebase-config.js';
import { 
    initAuthStateListener, 
    getCurrentUser,
    logOut 
} from './auth.js';
import { 
    showElement, 
    hideElement, 
    showNotification, 
    handleError,
    formatDate
} from './utils.js';
import { 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    doc, 
    updateDoc,
    getDoc,
    setDoc 
} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-functions.js';

// =========================================
// VARIABLES GLOBALES
// =========================================
let isAdmin = false;
let adminStats = null;
let users = [];

// Lista de administradores autorizados
const ADMIN_EMAILS = [
    'eugenfw@gmail.com',
    'admin@feedflow.com'
];

// =========================================
// ELEMENTOS DEL DOM
// =========================================
const elements = {
    // Secciones
    loadingSection: null,
    loginSection: null,
    adminSection: null,
    
    // Info del admin
    adminInfo: null,
    
    // Estadísticas
    totalUsersSpan: null,
    premiumUsersSpan: null,
    totalIdeasSpan: null,
    
    // Controles
    freePromotionsToggle: null,
    premiumPromotionsToggle: null,
    maintenanceToggle: null,
    
    // Tabla de usuarios
    usersTableBody: null,
    
    // Botones
    logoutBtn: null,
    refreshBtn: null
};

// =========================================
// INICIALIZACIÓN
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeEventListeners();
    initAuthStateListener(handleAuthStateChange);
});

/**
 * Inicializa las referencias a elementos del DOM
 */
function initializeElements() {
    // Secciones
    elements.loadingSection = document.getElementById('loadingSection');
    elements.loginSection = document.getElementById('loginSection');
    elements.adminSection = document.getElementById('adminSection');
    
    // Info del admin
    elements.adminInfo = document.getElementById('adminInfo');
    
    // Estadísticas
    elements.totalUsersSpan = document.getElementById('totalUsers');
    elements.premiumUsersSpan = document.getElementById('premiumUsers');
    elements.totalIdeasSpan = document.getElementById('totalIdeas');
    
    // Controles
    elements.freePromotionsToggle = document.getElementById('freePromotionsToggle');
    elements.premiumPromotionsToggle = document.getElementById('premiumPromotionsToggle');
    elements.maintenanceToggle = document.getElementById('maintenanceToggle');
    
    // Tabla
    elements.usersTableBody = document.getElementById('usersTableBody');
    
    // Botones
    elements.logoutBtn = document.getElementById('logoutBtn');
    elements.refreshBtn = document.getElementById('refreshBtn');
}

/**
 * Inicializa los event listeners
 */
function initializeEventListeners() {
    // Botón de logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Botón de refresh
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', loadAdminData);
    }
    
    // Toggles de configuración
    if (elements.freePromotionsToggle) {
        elements.freePromotionsToggle.addEventListener('change', handleFreePromotionsToggle);
    }
    
    if (elements.premiumPromotionsToggle) {
        elements.premiumPromotionsToggle.addEventListener('change', handlePremiumPromotionsToggle);
    }
    
    if (elements.maintenanceToggle) {
        elements.maintenanceToggle.addEventListener('change', handleMaintenanceToggle);
    }
}

// =========================================
// MANEJO DE AUTENTICACIÓN
// =========================================

/**
 * Maneja los cambios en el estado de autenticación
 */
async function handleAuthStateChange(user) {
    hideElement(elements.loadingSection);
    
    if (user && user.emailVerified) {
        console.log('=== DEBUG DOM ELEMENTS ===');
        console.log('adminInfo:', elements.adminInfo);
        console.log('loginSection:', elements.loginSection);
        console.log('appSection:', elements.appSection);
        console.log('isAdmin?:', true);
        console.log('--- FIN DEBUG DOM ELEMENTS ---');
        
        const adminCheck = await checkAdminStatus(user);
        if (adminCheck) {
            isAdmin = true;
            console.log('=== VERIFICACIÓN ADMIN INICIADA ===');
            console.log('Email del usuario:', user.email);
            console.log('ADMIN_EMAILS:', ADMIN_EMAILS);
            console.log('✅ Usuario admin detectado por email:', user.email);
            console.log('¿Es admin?:', true);
            console.log('Mostrando botón de admin...');
            console.log('--- checkAdminStatus iniciado ---');
            console.log('Email del usuario:', user.email);
            console.log('Lista de admins: ', ADMIN_EMAILS);
            console.log('✅ Usuario admin detectado por email:', user.email);
            console.log('Botón de admin mostrado para:', user.email);
            console.log('=== VERIFICACIÓN ADMIN FINALIZADA ===');
            
            showAdminSection();
            updateAdminInfo(user);
            await loadAdminData();
        } else {
            showAccessDenied();
        }
    } else {
        showLoginRequired();
    }
}

/**
 * Verifica si el usuario es administrador
 */
async function checkAdminStatus(user) {
    try {
        // Verificar por email
        if (ADMIN_EMAILS.includes(user.email)) {
            return true;
        }
        
        // Verificar en la base de datos
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.isAdmin === true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Maneja el logout
 */
async function handleLogout() {
    const success = await logOut();
    if (success) {
        isAdmin = false;
        adminStats = null;
        users = [];
    }
}

// =========================================
// FUNCIONES DE UI
// =========================================

/**
 * Muestra la sección de administración
 */
function showAdminSection() {
    hideElement(elements.loginSection);
    showElement(elements.adminSection);
}

/**
 * Muestra mensaje de login requerido
 */
function showLoginRequired() {
    hideElement(elements.adminSection);
    showElement(elements.loginSection);
    
    if (elements.loginSection) {
        elements.loginSection.innerHTML = `
            <div class="hero is-fullheight">
                <div class="hero-body">
                    <div class="container has-text-centered">
                        <div class="card" style="max-width: 500px; margin: 0 auto;">
                            <div class="card-content">
                                <span class="icon is-large has-text-warning">
                                    <i class="fas fa-sign-in-alt fa-3x"></i>
                                </span>
                                <h1 class="title is-4 mt-4">Acceso Requerido</h1>
                                <p class="subtitle">Debes iniciar sesión para acceder al panel de administración.</p>
                                <a href="index.html" class="button is-primary is-large">
                                    <span class="icon">
                                        <i class="fas fa-home"></i>
                                    </span>
                                    <span>Ir al Login</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Muestra mensaje de acceso denegado
 */
function showAccessDenied() {
    hideElement(elements.adminSection);
    showElement(elements.loginSection);
    
    if (elements.loginSection) {
        elements.loginSection.innerHTML = `
            <div class="hero is-fullheight">
                <div class="hero-body">
                    <div class="container has-text-centered">
                        <div class="card" style="max-width: 500px; margin: 0 auto;">
                            <div class="card-content">
                                <span class="icon is-large has-text-danger">
                                    <i class="fas fa-shield-alt fa-3x"></i>
                                </span>
                                <h1 class="title is-4 mt-4">Acceso Denegado</h1>
                                <p class="subtitle">No tienes permisos para acceder al panel de administración.</p>
                                <div class="buttons is-centered">
                                    <a href="index.html" class="button is-primary">
                                        <span class="icon">
                                            <i class="fas fa-home"></i>
                                        </span>
                                        <span>Ir al Inicio</span>
                                    </a>
                                    <button class="button is-light" onclick="location.reload()">
                                        <span class="icon">
                                            <i class="fas fa-refresh"></i>
                                        </span>
                                        <span>Reintentar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Actualiza la información del administrador
 */
function updateAdminInfo(user) {
    if (elements.adminInfo && user) {
        elements.adminInfo.textContent = `${user.displayName || user.email}`;
    }
}

// =========================================
// CARGA DE DATOS
// =========================================

/**
 * Carga todos los datos del panel de administración
 */
async function loadAdminData() {
    try {
        showNotification('Cargando datos del panel...', 'info', 2000);
        
        await Promise.all([
            loadAdminStats(),
            loadUsers(),
            loadAppConfig()
        ]);
        
        updateStatsDisplay();
        updateUsersTable();
        
        showNotification('Datos cargados correctamente', 'success', 2000);
        
    } catch (error) {
        handleError(error, 'al cargar datos del panel');
    }
}

/**
 * Carga las estadísticas de administración
 */
async function loadAdminStats() {
    try {
        // Cargar usuarios
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        
        const allUsers = [];
        let premiumCount = 0;
        let totalIdeas = 0;
        
        usersSnapshot.forEach((doc) => {
            const userData = { id: doc.id, ...doc.data() };
            allUsers.push(userData);
            
            if (userData.isPremium) {
                premiumCount++;
            }
            
            totalIdeas += userData.ideasGenerated || 0;
        });
        
        users = allUsers;
        adminStats = {
            totalUsers: allUsers.length,
            premiumUsers: premiumCount,
            totalIdeas: totalIdeas,
            lastUpdated: new Date()
        };
        
    } catch (error) {
        console.error('Error loading admin stats:', error);
        throw error;
    }
}

/**
 * Carga la lista de usuarios
 */
async function loadUsers() {
    try {
        const usersQuery = query(
            collection(db, 'users'), 
            orderBy('createdAt', 'desc'), 
            limit(50)
        );
        const snapshot = await getDocs(usersQuery);
        
        users = [];
        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        throw error;
    }
}

/**
 * Carga la configuración de la aplicación
 */
async function loadAppConfig() {
    try {
        // Intentar cargar desde config/app primero
        let configDoc = await getDoc(doc(db, 'config', 'app'));
        
        // Si no existe, intentar desde appConfig/config
        if (!configDoc.exists()) {
            configDoc = await getDoc(doc(db, 'appConfig', 'config'));
        }
        
        // Si tampoco existe, crear configuración inicial
        if (!configDoc.exists()) {
            console.log('--- VERIFICACIÓN ADMIN INICIADA ---');
            console.log('Usuario logeado:', getCurrentUser()?.email);
            console.log('ADMIN_EMAILS:', ADMIN_EMAILS);
            
            const currentUserEmail = getCurrentUser()?.email;
            console.log('Lista de admins:', ADMIN_EMAILS);
            console.log('✅ Usuario admin detectado por email:', currentUserEmail);
            
            if (ADMIN_EMAILS.includes(currentUserEmail)) {
                console.log('¿Es admin?:', true);
                console.log('Botón admin encontrado para:', currentUserEmail);
                console.log('--- VERIFICACIÓN ADMIN FINALIZADA ---');
                await initializeDefaultConfig();
                // Intentar cargar de nuevo después de inicializar
                configDoc = await getDoc(doc(db, 'config', 'app'));
            }
        }
        
        if (configDoc.exists()) {
            const config = configDoc.data();
            console.log('=== VERIFICACIÓN ADMIN INICIADA ===');
            console.log('Email del usuario:', getCurrentUser()?.email);
            console.log('Lista de admins:', ADMIN_EMAILS);
            console.log('✅ Usuario admin detectado por email:', getCurrentUser()?.email);
            console.log('¿Es admin?:', true);
            console.log('Mostrando botón de admin...');
            console.log('--- checkAdminStatus iniciado ---');
            console.log('Email del usuario:', getCurrentUser()?.email);
            console.log('Lista de admins: ', ADMIN_EMAILS);
            console.log('✅ Usuario admin detectado por email:', getCurrentUser()?.email);
            console.log('Botón de admin mostrado para:', getCurrentUser()?.email);
            console.log('=== VERIFICACIÓN ADMIN FINALIZADA ===');
            
            // Actualizar toggles
            if (elements.freePromotionsToggle) {
                elements.freePromotionsToggle.checked = config.freePromotionsEnabled || false;
            }
            if (elements.premiumPromotionsToggle) {
                elements.premiumPromotionsToggle.checked = config.premiumPromotionsEnabled || false;
            }
            if (elements.maintenanceToggle) {
                elements.maintenanceToggle.checked = config.maintenanceMode || false;
            }
        }
    } catch (error) {
        console.error('Error loading app config:', error);
        handleError(error, 'al cargar configuración');
    }
}

/**
 * Inicializa la configuración por defecto
 */
async function initializeDefaultConfig() {
    try {
        const defaultConfig = {
            freePromotionsEnabled: true,
            premiumPromotionsEnabled: true,
            maintenanceMode: false,
            createdAt: new Date(),
            createdBy: getCurrentUser()?.email || 'system'
        };
        
        // Crear en ambas ubicaciones para compatibilidad
        await Promise.all([
            updateDoc(doc(db, 'config', 'app'), defaultConfig).catch(async () => {
                // Si el documento no existe, crearlo
                await setDoc(doc(db, 'config', 'app'), defaultConfig);
            }),
            updateDoc(doc(db, 'appConfig', 'config'), defaultConfig).catch(async () => {
                // Si el documento no existe, crearlo
                await setDoc(doc(db, 'appConfig', 'config'), defaultConfig);
            })
        ]);
        
        console.log('Configuración inicial creada');
        
    } catch (error) {
        console.error('Error al crear configuración inicial:', error);
    }
}

// =========================================
// ACTUALIZACIÓN DE UI
// =========================================

/**
 * Actualiza la visualización de estadísticas
 */
function updateStatsDisplay() {
    if (!adminStats) return;
    
    if (elements.totalUsersSpan) {
        elements.totalUsersSpan.textContent = adminStats.totalUsers;
    }
    if (elements.premiumUsersSpan) {
        elements.premiumUsersSpan.textContent = adminStats.premiumUsers;
    }
    if (elements.totalIdeasSpan) {
        elements.totalIdeasSpan.textContent = adminStats.totalIdeas;
    }
}

/**
 * Actualiza la tabla de usuarios
 */
function updateUsersTable() {
    if (!elements.usersTableBody || !users) return;
    
    const tableHtml = users.map(user => `
        <tr>
            <td>
                <div class="media">
                    <div class="media-left">
                        <figure class="image is-32x32">
                            <img class="is-rounded" src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="Avatar">
                        </figure>
                    </div>
                    <div class="media-content">
                        <strong>${user.displayName || 'Sin nombre'}</strong><br>
                        <small class="has-text-grey">${user.email}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge ${user.isPremium ? 'is-premium' : 'is-regular'}">
                    ${user.isPremium ? 'Premium' : 'Gratuito'}
                </span>
            </td>
            <td>${user.ideasGenerated || 0}</td>
            <td>${formatDate(user.createdAt?.toDate())}</td>
            <td>
                <div class="buttons are-small">
                    <button class="button is-small is-info" onclick="toggleUserPremium('${user.id}', ${!user.isPremium})">
                        ${user.isPremium ? 'Quitar Premium' : 'Hacer Premium'}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    elements.usersTableBody.innerHTML = tableHtml;
}

// =========================================
// MANEJO DE CONTROLES
// =========================================

/**
 * Maneja el toggle de promociones gratuitas
 */
async function handleFreePromotionsToggle(event) {
    await updateAppConfig('freePromotionsEnabled', event.target.checked);
}

/**
 * Maneja el toggle de promociones premium
 */
async function handlePremiumPromotionsToggle(event) {
    await updateAppConfig('premiumPromotionsEnabled', event.target.checked);
}

/**
 * Maneja el toggle de modo mantenimiento
 */
async function handleMaintenanceToggle(event) {
    await updateAppConfig('maintenanceMode', event.target.checked);
}

/**
 * Actualiza la configuración de la aplicación
 */
async function updateAppConfig(key, value) {
    try {
        const updates = {
            [key]: value,
            lastUpdated: new Date(),
            updatedBy: getCurrentUser()?.email || 'system'
        };
        
        // Actualizar en ambas ubicaciones para compatibilidad
        const promises = [];
        
        // Intentar actualizar config/app
        promises.push(
            updateDoc(doc(db, 'config', 'app'), updates).catch(async (error) => {
                if (error.code === 'not-found') {
                    // Si el documento no existe, crearlo con configuración completa
                    await setDoc(doc(db, 'config', 'app'), {
                        freePromotionsEnabled: key === 'freePromotionsEnabled' ? value : true,
                        premiumPromotionsEnabled: key === 'premiumPromotionsEnabled' ? value : true,
                        maintenanceMode: key === 'maintenanceMode' ? value : false,
                        ...updates
                    });
                } else {
                    throw error;
                }
            })
        );
        
        // Intentar actualizar appConfig/config también para compatibilidad
        promises.push(
            updateDoc(doc(db, 'appConfig', 'config'), updates).catch(async (error) => {
                if (error.code === 'not-found') {
                    await setDoc(doc(db, 'appConfig', 'config'), {
                        freePromotionsEnabled: key === 'freePromotionsEnabled' ? value : true,
                        premiumPromotionsEnabled: key === 'premiumPromotionsEnabled' ? value : true,
                        maintenanceMode: key === 'maintenanceMode' ? value : false,
                        ...updates
                    });
                } else {
                    throw error;
                }
            })
        );
        
        await Promise.all(promises);
        
        showNotification(`Configuración actualizada: ${key}`, 'success', 2000);
        
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        handleError(error, 'al actualizar configuración');
        
        // Revertir el toggle si falló la actualización
        const toggle = document.getElementById(key === 'freePromotionsEnabled' ? 'freePromotionsToggle' : 
                                           key === 'premiumPromotionsEnabled' ? 'premiumPromotionsToggle' : 
                                           'maintenanceToggle');
        if (toggle) {
            toggle.checked = !value;
        }
    }
}

// =========================================
// FUNCIONES GLOBALES (para HTML)
// =========================================

/**
 * Alterna el estado premium de un usuario
 */
window.toggleUserPremium = async function(userId, isPremium) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isPremium: isPremium,
            premiumUpdatedAt: new Date(),
            premiumUpdatedBy: getCurrentUser()?.uid
        });
        
        showNotification(
            `Usuario ${isPremium ? 'promovido a' : 'degradado de'} premium`,
            'success'
        );
        
        // Recargar datos
        await loadAdminData();
        
    } catch (error) {
        handleError(error, 'al actualizar estado premium');
    }
};

/**
 * Exporta los datos de usuarios a CSV
 */
window.exportUsersToCSV = function() {
    if (!users || users.length === 0) {
        showNotification('No hay datos para exportar', 'warning');
        return;
    }
    
    const csvHeaders = ['ID', 'Nombre', 'Email', 'Premium', 'Ideas Generadas', 'Fecha Registro'];
    const csvData = users.map(user => [
        user.id,
        user.displayName || 'Sin nombre',
        user.email,
        user.isPremium ? 'Sí' : 'No',
        user.ideasGenerated || 0,
        formatDate(user.createdAt?.toDate())
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_feedflow_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Datos exportados correctamente', 'success');
};

/**
 * Inicializa la configuración de la aplicación manualmente
 */
window.initializeAppConfig = async function() {
    try {
        showNotification('Inicializando configuración...', 'info');
        await initializeDefaultConfig();
        await loadAppConfig();
        showNotification('Configuración inicializada correctamente', 'success');
    } catch (error) {
        console.error('Error al inicializar configuración:', error);
        showNotification('Error al inicializar configuración', 'danger');
    }
};
