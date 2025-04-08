import { debug, debugError, debugInfo } from './debug.js';

// Initialize Firebase
const firebaseConfig = {
    // Your Firebase config object will go here
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const registrationForm = document.getElementById('registration-form');

// Handle form submission
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    debug('Registration form submitted');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const coffeeShopId = document.getElementById('coffee-shop-id').value;

    try {
        // Check if coffee shop ID is already taken
        const shopDoc = await db.collection('coffee_shops').doc(coffeeShopId).get();
        if (shopDoc.exists) {
            debugError('Coffee shop ID already exists');
            alert('This Coffee Shop ID is already taken. Please choose another one.');
            return;
        }

        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        debugInfo('User account created', { email });

        // Store coffee shop data
        await db.collection('coffee_shops').doc(coffeeShopId).set({
            userId: userCredential.user.uid,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        debugInfo('Coffee shop data stored', { coffeeShopId });

        // Redirect to dashboard
        window.location.href = '/coffee-shop-dashboard.html';
    } catch (error) {
        debugError('Registration error', error);
        alert(error.message);
    }
}); 