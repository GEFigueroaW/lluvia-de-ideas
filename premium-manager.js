// =========================================
// GESTOR DE SERVICIOS PREMIUM
// =========================================

import { db } from './js/firebase-config.js';
import { getCurrentUser } from './js/auth.js';
import { showNotification } from './js/utils.js';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

// Lista de administradores autorizados
const ADMIN_EMAILS = [
    'eugenfw@gmail.com',
    'eugenfw@hotmail.com',
    'admin@feedflow.com'
];

/**
 * Activa los servicios premium con opciones avanzadas
 */
async function activatePremiumServices() {
    try {
        const user = getCurrentUser();
        if (!user) {
            showNotification('Error: Usuario no autenticado', 'danger');
            return false;
        }

        if (!ADMIN_EMAILS.includes(user.email)) {
            showNotification('Error: No tienes permisos de administrador', 'danger');
            return false;
        }

        // Abrir modal para configurar la activación premium
        openPremiumActivationModal();
        return true;

    } catch (error) {
        console.error('Error al iniciar activación premium:', error);
        showNotification(`Error: ${error.message}`, 'danger');
        return false;
    }
}

/**
 * Abre el modal para configurar la activación premium
 */
function openPremiumActivationModal() {
    // Crear el modal si no existe
    let modal = document.getElementById('premiumActivationModal');
    
    if (!modal) {
        // Crear el modal
        modal = document.createElement('div');
        modal.id = 'premiumActivationModal';
        modal.className = 'modal';
        
        // Agregar el contenido del modal
        modal.innerHTML = `
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head" style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white;">
                    <p class="modal-card-title">
                        <i class="fas fa-crown"></i> 
                        Activar Servicios Premium
                    </p>
                    <button class="delete" aria-label="close" onclick="document.getElementById('premiumActivationModal').classList.remove('is-active')"></button>
                </header>
                <section class="modal-card-body">
                    <div class="field">
                        <label class="label">Tipo de Activación</label>
                        <div class="control">
                            <div class="select is-fullwidth">
                                <select id="premiumActivationType">
                                    <option value="global">Global (Todos los usuarios)</option>
                                    <option value="individual">Individual (Usuario específico)</option>
                                </select>
                            </div>
                        </div>
                        <p class="help">Global activará premium para todos los usuarios, individual solo para los seleccionados.</p>
                    </div>

                    <!-- Selector de usuario (aparece solo cuando es individual) -->
                    <div id="userSelectionContainer" class="field is-hidden">
                        <label class="label">Seleccionar Usuario</label>
                        <div class="control">
                            <div class="select is-fullwidth">
                                <select id="userSelector">
                                    <option value="">Cargando usuarios...</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Duración -->
                    <div class="field">
                        <label class="label">Duración</label>
                        <div class="control has-icons-right">
                            <input id="premiumDuration" class="input" type="number" min="1" value="30">
                            <span class="icon is-small is-right">
                                <i class="fas fa-calendar"></i>
                            </span>
                        </div>
                        <p class="help">Número de días que durará la activación premium.</p>
                    </div>
                    
                    <!-- Fecha específica de finalización -->
                    <div class="field">
                        <label class="label">O Fecha de Finalización Específica</label>
                        <div class="control has-icons-right">
                            <input id="premiumEndDate" class="input" type="date">
                            <span class="icon is-small is-right">
                                <i class="fas fa-calendar-alt"></i>
                            </span>
                        </div>
                        <p class="help">Alternativamente, establece una fecha exacta de finalización.</p>
                    </div>

                    <!-- Descripción -->
                    <div class="field">
                        <label class="label">Descripción de la Promoción</label>
                        <div class="control">
                            <textarea id="promoDescription" class="textarea" placeholder="Ej: Promoción de lanzamiento, Promoción de verano, etc."></textarea>
                        </div>
                    </div>

                    <!-- Funcionalidades Premium -->
                    <div class="field">
                        <label class="label">Funcionalidades a Activar</label>
                        <div class="control">
                            <label class="checkbox">
                                <input id="allowAllSocialNetworks" type="checkbox" checked>
                                Todas las redes sociales
                            </label>
                        </div>
                        <div class="control">
                            <label class="checkbox">
                                <input id="allowAllCopyTypes" type="checkbox" checked>
                                Todos los tipos de copywriting
                            </label>
                        </div>
                        <div class="control">
                            <label class="checkbox">
                                <input id="unlimitedGenerations" type="checkbox" checked>
                                Generaciones ilimitadas
                            </label>
                        </div>
                        <div class="control">
                            <label class="checkbox">
                                <input id="prioritySupport" type="checkbox" checked>
                                Soporte prioritario
                            </label>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot" style="justify-content: flex-end;">
                    <button id="cancelPremiumBtn" class="button" onclick="document.getElementById('premiumActivationModal').classList.remove('is-active')">
                        Cancelar
                    </button>
                    <button id="activatePremiumBtn" class="button is-primary">
                        <i class="fas fa-crown mr-2"></i> Activar Premium
                    </button>
                </footer>
            </div>
        `;
        
        // Añadir el modal al DOM
        document.body.appendChild(modal);
        
        // Agregar event listeners
        document.getElementById('premiumActivationType').addEventListener('change', toggleUserSelector);
        document.getElementById('activatePremiumBtn').addEventListener('click', executePremiumActivation);
    }
    
    // Mostrar el modal
    modal.classList.add('is-active');
    
    // Inicializar el selector de usuario
    toggleUserSelector();
    loadUsers();
}

/**
 * Alterna la visibilidad del selector de usuario según el tipo de activación
 */
async function toggleUserSelector() {
    const activationType = document.getElementById('premiumActivationType').value;
    const userSelectionContainer = document.getElementById('userSelectionContainer');
    
    if (activationType === 'individual') {
        userSelectionContainer.classList.remove('is-hidden');
        await loadUsers();
    } else {
        userSelectionContainer.classList.add('is-hidden');
    }
}

/**
 * Carga la lista de usuarios para el selector
 */
async function loadUsers() {
    try {
        const userSelector = document.getElementById('userSelector');
        userSelector.innerHTML = '<option value="">Cargando usuarios...</option>';
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                email: userData.email,
                displayName: userData.displayName || 'Sin nombre',
                isPremium: userData.isPremium || false
            });
        });
        
        // Ordenar usuarios: primero los que no son premium, luego por email
        users.sort((a, b) => {
            if (a.isPremium !== b.isPremium) {
                return a.isPremium ? 1 : -1; // No premium primero
            }
            return a.email.localeCompare(b.email);
        });
        
        // Generar opciones
        const options = users.map(user => `
            <option value="${user.id}">
                ${user.email} - ${user.displayName} ${user.isPremium ? '(Ya es Premium)' : ''}
            </option>
        `);
        
        userSelector.innerHTML = options.join('');
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        const userSelector = document.getElementById('userSelector');
        userSelector.innerHTML = '<option value="">Error al cargar usuarios</option>';
    }
}

/**
 * Ejecuta la activación premium con los parámetros seleccionados
 */
async function executePremiumActivation() {
    try {
        const activationType = document.getElementById('premiumActivationType').value;
        const durationDays = parseInt(document.getElementById('premiumDuration').value);
        const endDateInput = document.getElementById('premiumEndDate').value;
        const promoDescription = document.getElementById('promoDescription').value || 'Promoción activada manualmente';
        
        // Funcionalidades
        const allowAllSocialNetworks = document.getElementById('allowAllSocialNetworks').checked;
        const allowAllCopyTypes = document.getElementById('allowAllCopyTypes').checked;
        const unlimitedGenerations = document.getElementById('unlimitedGenerations').checked;
        const prioritySupport = document.getElementById('prioritySupport').checked;
        
        // Calcular fecha de finalización
        let promoEndDate;
        if (endDateInput) {
            promoEndDate = new Date(endDateInput);
        } else {
            promoEndDate = new Date();
            promoEndDate.setDate(promoEndDate.getDate() + durationDays);
        }
        
        // Mostrar indicador de carga
        const activateBtn = document.getElementById('activatePremiumBtn');
        activateBtn.classList.add('is-loading');
        activateBtn.disabled = true;
        
        if (activationType === 'global') {
            // Activación global
            await activateGlobalPremium(promoEndDate, promoDescription, {
                allowAllSocialNetworks,
                allowAllCopyTypes,
                unlimitedGenerations,
                prioritySupport
            });
            showNotification('✅ Premium GLOBAL activado exitosamente hasta ' + promoEndDate.toLocaleDateString(), 'success');
        } else {
            // Activación individual
            const userId = document.getElementById('userSelector').value;
            if (!userId) {
                showNotification('Selecciona un usuario para la activación individual', 'warning');
                activateBtn.classList.remove('is-loading');
                activateBtn.disabled = false;
                return;
            }
            
            await activateIndividualPremium(userId, promoEndDate, promoDescription, {
                allowAllSocialNetworks,
                allowAllCopyTypes,
                unlimitedGenerations,
                prioritySupport
            });
            showNotification('✅ Premium INDIVIDUAL activado exitosamente hasta ' + promoEndDate.toLocaleDateString(), 'success');
        }
        
        // Cerrar el modal
        document.getElementById('premiumActivationModal').classList.remove('is-active');
        
        // Si estamos en la página de admin, recargar datos
        if (window.loadAdminData) {
            await window.loadAdminData();
        }
        
    } catch (error) {
        console.error('Error al activar premium:', error);
        showNotification(`Error: ${error.message}`, 'danger');
        
        const activateBtn = document.getElementById('activatePremiumBtn');
        activateBtn.classList.remove('is-loading');
        activateBtn.disabled = false;
    }
}

/**
 * Activa el premium de forma global para todos los usuarios
 */
async function activateGlobalPremium(endDate, description, features) {
    try {
        const user = getCurrentUser();
        
        // Configuración premium global
        const premiumConfig = {
            isPremiumGlobalActive: true,
            promoEndDate: endDate,
            promoDescription: description,
            
            // Funcionalidades premium
            allowAllSocialNetworks: features.allowAllSocialNetworks,
            allowAllCopyTypes: features.allowAllCopyTypes,
            unlimitedGenerations: features.unlimitedGenerations,
            prioritySupport: features.prioritySupport,
            
            // Metadatos
            lastUpdated: new Date(),
            updatedBy: user.email
        };
        
        // Actualizar ambas ubicaciones de configuración
        const promises = [
            updateDoc(doc(db, 'config', 'app'), premiumConfig),
            updateDoc(doc(db, 'appConfig', 'config'), premiumConfig).catch(e => {
                // Si no existe, crear el documento
                if (e.code === 'not-found') {
                    return setDoc(doc(db, 'appConfig', 'config'), {
                        ...premiumConfig,
                        createdAt: new Date(),
                        createdBy: user.email
                    });
                }
                throw e;
            })
        ];
        
        await Promise.all(promises);
        
        console.log('✅ Premium global activado exitosamente:', {
            endDate,
            features,
            updatedBy: user.email
        });
        
        // Registrar la acción en los logs
        await setDoc(doc(db, 'adminLogs', `premium_global_${Date.now()}`), {
            action: 'activate_premium_global',
            admin: user.email,
            timestamp: new Date(),
            endDate: endDate,
            description: description,
            features: features
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error al activar premium global:', error);
        throw error;
    }
}

/**
 * Activa el premium para un usuario individual
 */
async function activateIndividualPremium(userId, endDate, description, features) {
    try {
        const currentUser = getCurrentUser();
        
        // Obtener datos actuales del usuario
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('El usuario seleccionado no existe');
        }
        
        // Actualizar usuario con status premium
        await updateDoc(doc(db, 'users', userId), {
            isPremium: true,
            premiumUntil: endDate,
            premiumSource: 'admin',
            premiumDescription: description,
            premiumFeatures: features,
            premiumUpdatedAt: new Date(),
            premiumUpdatedBy: currentUser.email
        });
        
        console.log('✅ Premium individual activado exitosamente para usuario:', {
            userId,
            endDate,
            features,
            updatedBy: currentUser.email
        });
        
        // Registrar la acción en los logs
        await setDoc(doc(db, 'adminLogs', `premium_individual_${userId}_${Date.now()}`), {
            action: 'activate_premium_individual',
            admin: currentUser.email,
            timestamp: new Date(),
            userId: userId,
            endDate: endDate,
            description: description,
            features: features
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error al activar premium individual:', error);
        throw error;
    }
}

// Exportar la función para uso global
window.activatePremiumServices = activatePremiumServices;

export { activatePremiumServices };
