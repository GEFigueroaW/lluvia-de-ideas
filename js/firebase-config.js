// =========================================
// CONFIGURACIÓN DE FIREBASE
// =========================================

// Importar las funciones necesarias de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-functions.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCScJA-UGs3WcBnfAm-6K94ybZ4bzBahz8",
    authDomain: "brain-storm-8f0d8.firebaseapp.com",
    databaseURL: "https://brain-storm-8f0d8-default-rtdb.firebaseio.com",
    projectId: "brain-storm-8f0d8",
    storageBucket: "brain-storm-8f0d8.appspot.com",
    messagingSenderId: "401208607043",
    appId: "1:401208607043:web:1ec3ea3dabacbe11beaff6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Exportar para uso en otros módulos
export { auth, db, functions };
