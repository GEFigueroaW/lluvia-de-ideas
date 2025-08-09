// ==========================================
// SCRIPT DE DEBUGGING PARA ADMIN
// ==========================================

// Este script se puede ejecutar en la consola del navegador para debuggear problemas

console.log('=== INICIANDO DEBUG ADMIN ===');

// Verificar autenticación
import('./js/auth.js').then(authModule => {
    const user = authModule.getCurrentUser();
    console.log('Usuario actual:', user);
    console.log('Email:', user?.email);
    console.log('Email verificado:', user?.emailVerified);
    
    if (user) {
        // Verificar permisos
        const ADMIN_EMAILS = ['eugenfw@gmail.com', 'admin@feedflow.com'];
        const isAdmin = ADMIN_EMAILS.includes(user.email);
        console.log('¿Es admin?:', isAdmin);
        console.log('Lista de admins:', ADMIN_EMAILS);
        
        // Verificar acceso a Firestore
        import('./js/firebase-config.js').then(firebaseModule => {
            const { db } = firebaseModule;
            
            // Intentar leer configuración
            import('https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js').then(firestoreModule => {
                const { doc, getDoc } = firestoreModule;
                
                console.log('Intentando leer configuración...');
                
                getDoc(doc(db, 'config', 'app')).then(configDoc => {
                    if (configDoc.exists()) {
                        console.log('✅ Configuración encontrada:', configDoc.data());
                    } else {
                        console.log('⚠️ Configuración no existe, creando...');
                        
                        // Intentar crear configuración
                        const { setDoc } = firestoreModule;
                        const defaultConfig = {
                            freePromotionsEnabled: true,
                            premiumPromotionsEnabled: true,
                            maintenanceMode: false,
                            createdAt: new Date(),
                            createdBy: user.email
                        };
                        
                        setDoc(doc(db, 'config', 'app'), defaultConfig).then(() => {
                            console.log('✅ Configuración creada exitosamente');
                        }).catch(error => {
                            console.error('❌ Error creando configuración:', error);
                        });
                    }
                }).catch(error => {
                    console.error('❌ Error leyendo configuración:', error);
                    console.log('Código del error:', error.code);
                    console.log('Mensaje del error:', error.message);
                });
                
                // Verificar usuarios
                console.log('Intentando leer usuarios...');
                const { collection, query, limit, getDocs } = firestoreModule;
                
                getDocs(query(collection(db, 'users'), limit(1))).then(snapshot => {
                    console.log('✅ Acceso a usuarios exitoso. Total:', snapshot.size);
                }).catch(error => {
                    console.error('❌ Error leyendo usuarios:', error);
                });
            });
        });
    } else {
        console.log('❌ No hay usuario autenticado');
    }
});

console.log('=== FIN DEBUG ADMIN ===');
