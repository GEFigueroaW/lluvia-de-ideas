// Script de prueba para copywriting
const admin = require('firebase-admin');

// Configurar Firebase Admin
admin.initializeApp({
    projectId: 'brain-storm-8f0d8'
});

const db = admin.firestore();
const functions = admin.functions();

async function testCopywriting() {
    console.log('🚀 Iniciando test de copywriting...');
    
    try {
        // Crear token de autenticación simulado
        const testUid = 'test-user-' + Date.now();
        const customToken = await admin.auth().createCustomToken(testUid);
        
        console.log('✅ Token creado para usuario:', testUid);
        
        // Crear usuario de prueba
        await db.collection('users').doc(testUid).set({
            email: 'test@example.com',
            generationCredits: 10,
            isPremium: false,
            createdAt: admin.firestore.Timestamp.now()
        });
        
        console.log('✅ Usuario de prueba creado');
        
        // Parámetros de prueba
        const testParams = {
            generationMode: 'single',
            socialMedia: 'Instagram',
            keyword: 'marketing digital',
            copyType: 'Informativo o educativo',
            language: 'español'
        };
        
        console.log('📝 Parámetros de prueba:', testParams);
        console.log('🔗 Llamando a la función API...');
        
        // Simular llamada a la función
        const callable = functions.httpsCallable('api');
        const result = await callable(testParams);
        
        console.log('✅ Resultado recibido:', result.data);
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
        console.error('📊 Detalles del error:', {
            code: error.code,
            details: error.details,
            stack: error.stack?.split('\n').slice(0, 5)
        });
    }
}

// Ejecutar test
testCopywriting().then(() => {
    console.log('🏁 Test completado');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});
