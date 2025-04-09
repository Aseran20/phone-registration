// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCch3wlj9ft1psd8yEypdNA33C-7qCI4e0",
    authDomain: "test-a382b.firebaseapp.com",
    projectId: "test-a382b",
    storageBucket: "test-a382b.firebasestorage.app",
    messagingSenderId: "763775183510",
    appId: "1:763775183510:web:110e3b3a6c1c66ef6270b7",
    measurementId: "G-9N3C5LP43H"
};

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore for use in other files
export const auth = getAuth(app);
export const db = getFirestore(app); 