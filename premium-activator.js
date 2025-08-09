// =========================================
// ACTIVADOR AUTOMÁTICO DE FUNCIONES PREMIUM
// =========================================

import { db } from './js/firebase-config.js';
import { getCurrentUser } from './js/auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

/**
 * Activa automáticamente todas las funciones premium
 */
async function activatePremiumFeatures() {
    try {
        const user = getCurrentUser();
        if (!user) {
            console.error('❌ Usuario no autenticado');
            return false;
        }

        const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
        if (!ADMIN_EMAILS.includes(user.email)) {
            console.error('❌ Usuario no es administrador');
            return false;
        }

        console.log('🚀 Activando funciones premium...');

        // Configuración completa con todas las funciones premium activadas
        const premiumConfig = {
            // Configuraciones básicas
            freePromotionsEnabled: true,
            premiumPromotionsEnabled: true,
            maintenanceMode: false,
            
            // Funciones premium globales
            isPremiumGlobalActive: true,
            isLaunchPromoActive: true,
            
            // Configuraciones de acceso
            allowAllSocialNetworks: true,
            allowAllCopyTypes: true,
            unlimitedGenerations: true,
            
            // Configuraciones adicionales
            weeklyCredits: 999,
            premiumFeaturesEnabled: true,
            advancedAnalytics: true,
            prioritySupport: true,
            
            // Metadata
            createdAt: new Date(),
            lastUpdated: new Date(),
            updatedBy: user.email,
            version: '2.0-premium',
            
            // Configuración de promociones
            promoEndDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días
            promoDescription: 'Funciones premium activadas por administrador'
        };

        // Crear/actualizar en todas las ubicaciones posibles
        const promises = [
            setDoc(doc(db, 'config', 'app'), premiumConfig),
            setDoc(doc(db, 'appConfig', 'config'), premiumConfig),
            setDoc(doc(db, 'settings', 'global'), premiumConfig)
        ];

        await Promise.all(promises);

        console.log('✅ Funciones premium activadas exitosamente');
        console.log('📊 Configuración aplicada:', premiumConfig);

        // Verificar que se aplicó correctamente
        const verifyDoc = await getDoc(doc(db, 'config', 'app'));
        if (verifyDoc.exists()) {
            console.log('✅ Verificación exitosa:', verifyDoc.data());
            return true;
        } else {
            console.error('❌ Error en verificación');
            return false;
        }

    } catch (error) {
        console.error('❌ Error activando funciones premium:', error);
        return false;
    }
}

/**
 * Función para ejecutar desde la consola del navegador
 */
window.activatePremiumFeatures = activatePremiumFeatures;

// Auto-ejecutar si se detecta administrador
document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(async () => {
        const user = getCurrentUser();
        if (user && ['eugenfw@gmail.com', 'admin@feedflow.com'].includes(user.email)) {
            console.log('🔍 Administrador detectado, verificando configuración...');
            
            try {
                const configDoc = await getDoc(doc(db, 'config', 'app'));
                if (!configDoc.exists() || !configDoc.data().isPremiumGlobalActive) {
                    console.log('🚀 Auto-activando funciones premium...');
                    await activatePremiumFeatures();
                }
            } catch (error) {
                console.log('⚠️ Error en verificación automática:', error.message);
            }
        }
    }, 3000); // Esperar 3 segundos para que cargue la autenticación
});

export { activatePremiumFeatures };
