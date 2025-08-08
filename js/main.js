// =========================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN
// =========================================

import { db, functions } from './firebase-config.js';
import { 
    initAuthStateListener, 
    signInWithEmail, 
    registerWithEmail, 
    signInWithGoogle, 
    logOut,
    getCurrentUser 
} from './auth.js';
import { 
    showElement, 
    hideElement, 
    showNotification, 
    validateEmail, 
    validatePassword,
    handleError,
    toggleButtonLoading,
    debounce
} from './utils.js';
import { 
    saveIdeasSession, 
    loadUserIdeasHistory, 
    exportIdeasToJSON, 
    exportIdeasToTxt, 
    exportIdeasToMarkdown,
    getCachedUserIdeas,
    searchIdeas
} from './ideas-manager.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-functions.js';

// =========================================
// VARIABLES GLOBALES
// =========================================
let isGenerating = false;
let userProfile = null;
let currentIdeasSession = null;

// =========================================
// ELEMENTOS DEL DOM
// =========================================
const elements = {
    // Secciones principales
    loginSection: null,
    appSection: null,
    loadingSection: null,
    
    // Formularios
    loginForm: null,
    registerForm: null,
    ideaForm: null,
    
    // Campos de formulario
    loginEmail: null,
    loginPassword: null,
    registerName: null,
    registerEmail: null,
    registerPassword: null,
    ideaTopic: null,
    ideaContext: null,
    
    // Botones
    loginBtn: null,
    registerBtn: null,
    googleBtn: null,
    logoutBtn: null,
    generateBtn: null,
    showRegisterBtn: null,
    showLoginBtn: null,
    
    // Otros elementos
    userInfo: null,
    ideasContainer: null,
    premiumStatus: null,
    historyContainer: null,
    searchInput: null
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
    elements.loginSection = document.getElementById('loginSection');
    elements.appSection = document.getElementById('appSection');
    elements.loadingSection = document.getElementById('loadingSection');
    
    // Formularios
    elements.loginForm = document.getElementById('loginForm');
    elements.registerForm = document.getElementById('registerForm');
    elements.ideaForm = document.getElementById('ideaForm');
    
    // Campos de formulario
    elements.loginEmail = document.getElementById('loginEmail');
    elements.loginPassword = document.getElementById('loginPassword');
    elements.registerName = document.getElementById('registerName');
    elements.registerEmail = document.getElementById('registerEmail');
    elements.registerPassword = document.getElementById('registerPassword');
    elements.ideaTopic = document.getElementById('ideaTopic');
    elements.ideaContext = document.getElementById('ideaContext');
    
    // Botones
    elements.loginBtn = document.getElementById('loginBtn');
    elements.registerBtn = document.getElementById('registerBtn');
    elements.googleBtn = document.getElementById('googleBtn');
    elements.logoutBtn = document.getElementById('logoutBtn');
    elements.generateBtn = document.getElementById('generateBtn');
    elements.showRegisterBtn = document.getElementById('showRegister');
    elements.showLoginBtn = document.getElementById('showLogin');
    
    // Otros elementos
    elements.userInfo = document.getElementById('userInfo');
    elements.ideasContainer = document.getElementById('ideasContainer');
    elements.premiumStatus = document.getElementById('premiumStatus');
    elements.historyContainer = document.getElementById('historyContainer');
    elements.searchInput = document.getElementById('searchInput');
}

/**
 * Inicializa los event listeners
 */
function initializeEventListeners() {
    // Formularios
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    if (elements.ideaForm) {
        elements.ideaForm.addEventListener('submit', handleGenerateIdeas);
    }
    
    // Botones de navegación
    if (elements.showRegisterBtn) {
        elements.showRegisterBtn.addEventListener('click', showRegisterForm);
    }
    
    if (elements.showLoginBtn) {
        elements.showLoginBtn.addEventListener('click', showLoginForm);
    }
    
    // Botón de Google
    if (elements.googleBtn) {
        elements.googleBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // Botón de logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Validación en tiempo real
    if (elements.registerPassword) {
        elements.registerPassword.addEventListener('input', 
            debounce(validatePasswordField, 500)
        );
    }
    
    if (elements.registerEmail) {
        elements.registerEmail.addEventListener('blur', validateEmailField);
    }
}

// =========================================
// MANEJO DE AUTENTICACIÓN
// =========================================

/**
 * Maneja los cambios en el estado de autenticación
 * @param {Object} user - Usuario autenticado o null
 */
async function handleAuthStateChange(user) {
    hideElement(elements.loadingSection);
    
    if (user && user.emailVerified) {
        await loadUserProfile(user);
        await loadUserIdeasHistory(); // Cargar historial de ideas
        showAppSection();
        updateUserInfo(user);
        updateHistoryDisplay(); // Mostrar historial
    } else {
        showLoginSection();
        if (user && !user.emailVerified) {
            showNotification(
                'Por favor verifica tu email para continuar.',
                'warning'
            );
        }
    }
}

/**
 * Maneja el login con email
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    
    if (!validateEmail(email)) {
        showNotification('Por favor ingresa un email válido', 'danger');
        return;
    }
    
    await signInWithEmail(email, password, elements.loginBtn);
}

/**
 * Maneja el registro con email
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    
    // Validaciones
    if (!name) {
        showNotification('Por favor ingresa tu nombre', 'danger');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Por favor ingresa un email válido', 'danger');
        return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showNotification(passwordValidation.errors.join('<br>'), 'danger');
        return;
    }
    
    const success = await registerWithEmail(email, password, name, elements.registerBtn);
    if (success) {
        showLoginForm();
        elements.registerForm.reset();
    }
}

/**
 * Maneja el login con Google
 */
async function handleGoogleLogin() {
    await signInWithGoogle(elements.googleBtn);
}

/**
 * Maneja el logout
 */
async function handleLogout() {
    const success = await logOut();
    if (success) {
        userProfile = null;
        clearIdeasContainer();
    }
}

// =========================================
// FUNCIONES DE UI
// =========================================

/**
 * Muestra la sección de login
 */
function showLoginSection() {
    hideElement(elements.appSection);
    showElement(elements.loginSection);
}

/**
 * Muestra la sección de la aplicación
 */
function showAppSection() {
    hideElement(elements.loginSection);
    showElement(elements.appSection);
}

/**
 * Muestra el formulario de registro
 */
function showRegisterForm() {
    hideElement(elements.loginForm?.parentElement);
    showElement(elements.registerForm?.parentElement);
}

/**
 * Muestra el formulario de login
 */
function showLoginForm() {
    hideElement(elements.registerForm?.parentElement);
    showElement(elements.loginForm?.parentElement);
}

/**
 * Actualiza la información del usuario en la UI
 */
function updateUserInfo(user) {
    if (elements.userInfo && user) {
        elements.userInfo.textContent = `¡Hola, ${user.displayName || user.email}!`;
    }
    
    if (elements.premiumStatus && userProfile) {
        const isPremium = userProfile.isPremium || false;
        elements.premiumStatus.textContent = isPremium ? 'Premium' : 'Gratuito';
        elements.premiumStatus.className = `badge ${isPremium ? 'is-premium' : 'is-regular'}`;
    }
}

// =========================================
// FUNCIONES DE GENERACIÓN DE IDEAS
// =========================================

/**
 * Maneja la generación de ideas
 */
async function handleGenerateIdeas(e) {
    e.preventDefault();
    
    if (isGenerating) return;
    
    const topic = elements.ideaTopic.value.trim();
    const context = elements.ideaContext.value.trim();
    
    if (!topic) {
        showNotification('Por favor ingresa un tema', 'danger');
        return;
    }
    
    await generateIdeas(topic, context);
}

/**
 * Genera ideas usando la función de Cloud Functions
 */
async function generateIdeas(topic, context) {
    try {
        isGenerating = true;
        toggleButtonLoading(elements.generateBtn, true);
        
        // Llamar a la función de Cloud Functions
        const generateIdeasFunction = httpsCallable(functions, 'api');
        const result = await generateIdeasFunction({
            topic,
            context,
            userId: getCurrentUser()?.uid
        });
        
        const ideas = result.data.ideas;
        
        // Guardar la sesión de ideas en Firestore
        const sessionId = await saveIdeasSession(ideas, topic, context);
        const session = { ideas, topic, context, sessionId, id: sessionId };
        
        currentIdeasSession = session;
        window.currentSession = session; // Para las funciones de UI modernas
        
        displayIdeas(ideas, topic);
        
        showNotification('¡Ideas generadas exitosamente!', 'success');
        
    } catch (error) {
        handleError(error, 'al generar ideas');
    } finally {
        isGenerating = false;
        toggleButtonLoading(elements.generateBtn, false);
    }
}

/**
 * Muestra las ideas generadas en la UI con diseño moderno
 */
function displayIdeas(ideas, topic) {
    if (!elements.ideasContainer || !ideas || !Array.isArray(ideas)) return;
    
    const ideasHtml = `
        <div class="modern-ideas-container animate__animated animate__fadeInUp">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="font-size: 2rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">
                    💡 Ideas para: ${topic}
                </h3>
                <p style="color: var(--text-secondary); font-size: 1rem;">
                    Generadas con IA • ${ideas.length} ideas creativas
                </p>
            </div>
            
            <div class="modern-ideas-list">
                ${ideas.map((idea, index) => `
                    <div class="modern-idea-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                        <div class="modern-idea-number">${index + 1}</div>
                        <div class="modern-idea-content" style="flex: 1;">
                            <h4>${idea.title || `Idea Creativa ${index + 1}`}</h4>
                            <p>${idea.description || idea}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="modern-idea-actions">
                <button class="modern-btn" onclick="copyAllIdeas()" style="background: var(--accent-gradient); color: white;">
                    <i class="fas fa-copy mr-2"></i>
                    Copiar Todas
                </button>
                
                <div class="dropdown is-hoverable">
                    <div class="dropdown-trigger">
                        <button class="modern-btn" style="background: var(--secondary-gradient); color: white;">
                            <i class="fas fa-download mr-2"></i>
                            Exportar
                            <i class="fas fa-chevron-down ml-2"></i>
                        </button>
                    </div>
                    <div class="dropdown-menu" role="menu" style="min-width: 180px;">
                        <div class="dropdown-content" style="border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
                            <a class="dropdown-item" onclick="exportCurrentSession('json')" style="padding: 0.75rem 1rem;">
                                <i class="fas fa-code mr-2"></i>
                                Formato JSON
                            </a>
                            <a class="dropdown-item" onclick="exportCurrentSession('txt')" style="padding: 0.75rem 1rem;">
                                <i class="fas fa-file-alt mr-2"></i>
                                Archivo de Texto
                            </a>
                            <a class="dropdown-item" onclick="exportCurrentSession('md')" style="padding: 0.75rem 1rem;">
                                <i class="fab fa-markdown mr-2"></i>
                                Markdown
                            </a>
                        </div>
                    </div>
                </div>
                
                <button class="modern-btn" onclick="generateNewIdeas()" style="background: var(--dark-gradient); color: white;">
                    <i class="fas fa-plus mr-2"></i>
                    Generar Más
                </button>
            </div>
        </div>
    `;
    
    elements.ideasContainer.innerHTML = ideasHtml;
}

/**
 * Limpia el contenedor de ideas
 */
function clearIdeasContainer() {
    if (elements.ideasContainer) {
        elements.ideasContainer.innerHTML = '';
    }
}

// =========================================
// FUNCIONES DE PERFIL
// =========================================

/**
 * Carga el perfil del usuario desde Firestore
 */
async function loadUserProfile(user) {
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            userProfile = userDoc.data();
        } else {
            userProfile = {
                isPremium: false,
                ideasGenerated: 0,
                createdAt: new Date()
            };
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        userProfile = { isPremium: false, ideasGenerated: 0 };
    }
}

// =========================================
// VALIDACIONES
// =========================================

/**
 * Valida el campo de email en tiempo real
 */
function validateEmailField() {
    const email = elements.registerEmail.value.trim();
    const isValid = validateEmail(email);
    
    elements.registerEmail.style.borderColor = isValid ? '#28a745' : '#dc3545';
}

/**
 * Valida el campo de contraseña en tiempo real
 */
function validatePasswordField() {
    const password = elements.registerPassword.value;
    const validation = validatePassword(password);
    
    elements.registerPassword.style.borderColor = validation.isValid ? '#28a745' : '#dc3545';
    
    // Mostrar ayuda de validación
    let helpElement = document.getElementById('password-help');
    if (!helpElement) {
        helpElement = document.createElement('div');
        helpElement.id = 'password-help';
        helpElement.className = 'help';
        elements.registerPassword.parentElement.appendChild(helpElement);
    }
    
    if (!validation.isValid && password.length > 0) {
        helpElement.innerHTML = validation.errors.join('<br>');
        helpElement.style.color = '#dc3545';
    } else if (validation.isValid) {
        helpElement.innerHTML = '✓ Contraseña válida';
        helpElement.style.color = '#28a745';
    } else {
        helpElement.innerHTML = '';
    }
}

// =========================================
// FUNCIONES DE HISTORIAL DE IDEAS
// =========================================

/**
 * Actualiza la visualización del historial de ideas
 */
function updateHistoryDisplay() {
    if (!elements.historyContainer) return;
    
    const cachedIdeas = getCachedUserIdeas();
    
    if (cachedIdeas.length === 0) {
        elements.historyContainer.innerHTML = `
            <div class="has-text-centered p-4">
                <span class="icon is-large has-text-grey-light">
                    <i class="fas fa-history fa-2x"></i>
                </span>
                <p class="has-text-grey">No hay sesiones guardadas aún</p>
            </div>
        `;
        return;
    }
    
    const historyHtml = cachedIdeas.map(session => `
        <div class="history-item card mb-3" data-session-id="${session.id}">
            <div class="card-content">
                <div class="media">
                    <div class="media-left">
                        <span class="icon is-large has-text-primary">
                            <i class="fas fa-lightbulb fa-2x"></i>
                        </span>
                    </div>
                    <div class="media-content">
                        <p class="title is-6">${session.topic}</p>
                        <p class="subtitle is-7 has-text-grey">
                            ${session.ideaCount} ideas • ${formatDate(session.createdAt)}
                        </p>
                        ${session.context ? `<p class="is-size-7">${session.context.substring(0, 100)}...</p>` : ''}
                    </div>
                    <div class="media-right">
                        <div class="buttons are-small">
                            <button class="button is-small is-primary" onclick="viewIdeasSession('${session.id}')">
                                <span class="icon">
                                    <i class="fas fa-eye"></i>
                                </span>
                            </button>
                            <div class="dropdown is-hoverable">
                                <div class="dropdown-trigger">
                                    <button class="button is-small is-info" aria-haspopup="true">
                                        <span class="icon">
                                            <i class="fas fa-download"></i>
                                        </span>
                                    </button>
                                </div>
                                <div class="dropdown-menu" role="menu">
                                    <div class="dropdown-content">
                                        <a class="dropdown-item" onclick="exportSession('${session.id}', 'json')">JSON</a>
                                        <a class="dropdown-item" onclick="exportSession('${session.id}', 'txt')">TXT</a>
                                        <a class="dropdown-item" onclick="exportSession('${session.id}', 'md')">MD</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.historyContainer.innerHTML = historyHtml;
}

// =========================================
// FUNCIONES GLOBALES (para HTML)
// =========================================

/**
 * Copia todas las ideas al portapapeles
 */
window.copyAllIdeas = async function() {
    const ideas = Array.from(document.querySelectorAll('.idea-content')).map(
        (idea, index) => `${index + 1}. ${idea.textContent.trim()}`
    ).join('\n\n');
    
    try {
        await navigator.clipboard.writeText(ideas);
        showNotification('Ideas copiadas al portapapeles', 'success', 2000);
    } catch (error) {
        console.error('Error al copiar:', error);
        showNotification('Error al copiar al portapapeles', 'danger');
    }
};

/**
 * Exporta la sesión actual de ideas
 */
window.exportCurrentSession = function(format) {
    if (!currentIdeasSession) {
        showNotification('No hay sesión actual para exportar', 'warning');
        return;
    }
    
    const session = {
        topic: currentIdeasSession.topic,
        context: currentIdeasSession.context,
        ideas: currentIdeasSession.ideas,
        createdAt: new Date(),
        ideaCount: currentIdeasSession.ideas.length
    };
    
    switch (format) {
        case 'json':
            exportIdeasToJSON(session);
            break;
        case 'txt':
            exportIdeasToTxt(session);
            break;
        case 'md':
            exportIdeasToMarkdown(session);
            break;
        default:
            showNotification('Formato no válido', 'danger');
    }
};

/**
 * Exporta una sesión específica
 */
window.exportSession = function(sessionId, format) {
    const cachedIdeas = getCachedUserIdeas();
    const session = cachedIdeas.find(s => s.id === sessionId);
    
    if (!session) {
        showNotification('Sesión no encontrada', 'danger');
        return;
    }
    
    switch (format) {
        case 'json':
            exportIdeasToJSON(session);
            break;
        case 'txt':
            exportIdeasToTxt(session);
            break;
        case 'md':
            exportIdeasToMarkdown(session);
            break;
        default:
            showNotification('Formato no válido', 'danger');
    }
};

/**
 * Visualiza una sesión específica de ideas
 */
window.viewIdeasSession = async function(sessionId) {
    const cachedIdeas = getCachedUserIdeas();
    const session = cachedIdeas.find(s => s.id === sessionId);
    
    if (!session) {
        showNotification('Sesión no encontrada', 'danger');
        return;
    }
    
    // Mostrar las ideas en el contenedor principal
    displayIdeas(session.ideas, session.topic);
    
    // Actualizar la sesión actual
    currentIdeasSession = session;
    window.currentSession = session;
    
    showNotification('Sesión cargada correctamente', 'success', 2000);
};

/**
 * Copia todas las ideas al portapapeles
 */
function copyAllIdeas() {
    const currentSession = window.currentSession;
    if (!currentSession || !currentSession.ideas) {
        showNotification('No hay ideas para copiar', 'warning');
        return;
    }
    
    const ideasText = currentSession.ideas
        .map((idea, index) => `${index + 1}. ${idea.title || `Idea ${index + 1}`}\n   ${idea.description || idea}`)
        .join('\n\n');
    
    const fullText = `💡 Ideas para: ${currentSession.topic}\n\n${ideasText}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
        showNotification('¡Ideas copiadas al portapapeles!', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar las ideas', 'danger');
    });
}

/**
 * Genera nuevas ideas para el mismo tema
 */
async function generateNewIdeas() {
    const currentSession = window.currentSession;
    if (!currentSession || !currentSession.topic) {
        showNotification('No hay tema actual para generar más ideas', 'warning');
        return;
    }
    
    const generateBtn = document.querySelector('.modern-idea-actions .modern-btn:last-child');
    if (generateBtn) {
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';
        generateBtn.disabled = true;
    }
    
    try {
        await generateIdeas(currentSession.topic);
    } catch (error) {
        console.error('Error al generar nuevas ideas:', error);
        showNotification('Error al generar nuevas ideas', 'danger');
    } finally {
        if (generateBtn) {
            generateBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Generar Más';
            generateBtn.disabled = false;
        }
    }
}
