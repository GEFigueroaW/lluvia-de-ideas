// Función para inicializar configuración de la app
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (solo si no está ya inicializado)
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Función para inicializar la configuración por defecto
exports.initializeAppConfig = functions.https.onCall(async (data, context) => {
    try {
        // Verificar que el usuario esté autenticado
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuario debe estar autenticado');
        }

        // Lista de emails de administradores autorizados
        const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
        
        // Verificar que el usuario sea administrador
        if (!ADMIN_EMAILS.includes(context.auth.token.email)) {
            throw new functions.https.HttpsError('permission-denied', 'Solo administradores pueden ejecutar esta función');
        }

        // Configuración por defecto
        const defaultConfig = {
            isPremiumGlobalActive: false,
            isLaunchPromoActive: false,
            weeklyCredits: 3,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth.token.email
        };

        // Crear o actualizar la configuración
        await db.collection('appConfig').doc('config').set(defaultConfig, { merge: true });

        return { success: true, message: 'Configuración inicializada correctamente' };
    } catch (error) {
        console.error('Error en initializeAppConfig:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Función para obtener estadísticas (solo para admins)
exports.getAdminStats = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Usuario debe estar autenticado');
        }

        const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
        
        if (!ADMIN_EMAILS.includes(context.auth.token.email)) {
            throw new functions.https.HttpsError('permission-denied', 'Solo administradores pueden ver estadísticas');
        }

        // Obtener estadísticas
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        
        let premiumUsers = 0;
        usersSnapshot.forEach(doc => {
            if (doc.data().isPremium) premiumUsers++;
        });

        // Obtener generaciones de hoy (si existe colección de logs)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let generationsToday = 0;
        try {
            const generationsSnapshot = await db.collection('generations')
                .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
                .get();
            generationsToday = generationsSnapshot.size;
        } catch (error) {
            // Si no existe la colección, mantener en 0
            console.log('Colección generations no existe aún');
        }

        return {
            totalUsers,
            premiumUsers,
            generationsToday,
            freeUsers: totalUsers - premiumUsers
        };
    } catch (error) {
        console.error('Error en getAdminStats:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Función para validar si un usuario es admin
exports.isUserAdmin = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            return { isAdmin: false };
        }

        const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
        
        return { 
            isAdmin: ADMIN_EMAILS.includes(context.auth.token.email),
            email: context.auth.token.email 
        };
    } catch (error) {
        console.error('Error en isUserAdmin:', error);
        return { isAdmin: false };
    }
});
