// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCScJA-UGs3WcBnfAm-6K94ybZ4bzBahz8",
  authDomain: "brain-storm-8f0d8.firebaseapp.com",
  databaseURL: "https://brain-storm-8f0d8-default-rtdb.firebaseio.com",
  projectId: "brain-storm-8f0d8",
  storageBucket: "brain-storm-8f0d8.firebasestorage.app",
  messagingSenderId: "401208607043",
  appId: "1:401208607043:web:1ec3ea3dabacbe11beaff6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
