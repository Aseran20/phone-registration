import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const coffeeShopId = document.getElementById('coffeeShopId').value;

            // Clear previous messages
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = '';
            }

            // Validate passwords match
            if (password !== confirmPassword) {
                if (messageDiv) {
                    messageDiv.textContent = 'Passwords do not match';
                    messageDiv.className = 'error';
                }
                return;
            }

            try {
                console.log('Attempting to create account with email:', email);
                
                // Check if coffee shop ID is already taken
                const shopDocRef = doc(db, 'coffee_shops', coffeeShopId);
                const shopDoc = await getDoc(shopDocRef);
                
                if (shopDoc.exists()) {
                    if (messageDiv) {
                        messageDiv.textContent = 'This Coffee Shop ID is already taken. Please choose another one.';
                        messageDiv.className = 'error';
                    }
                    return;
                }
                
                // Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // Store coffee shop data in Firestore
                await setDoc(shopDocRef, {
                    userId: userCredential.user.uid,
                    email: email,
                    shop_id: coffeeShopId, // Store the shop ID in the document for easy reference
                    createdAt: serverTimestamp()
                });
                
                // Send email verification
                await sendEmailVerification(userCredential.user);
                
                console.log('Account created successfully:', userCredential.user);

                if (messageDiv) {
                    messageDiv.textContent = 'Registration successful! Please check your email to verify your account.';
                    messageDiv.className = 'success';
                }

                // Clear the form
                form.reset();

                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = '/coffee-shop-login.html';
                }, 3000);

            } catch (error) {
                console.error('Registration error:', error);
                if (messageDiv) {
                    let errorMessage = 'Error during registration. Please try again.';
                    
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'This email is already registered. Please use a different email or login.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address. Please enter a valid email.';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                    }
                    
                    messageDiv.textContent = errorMessage;
                    messageDiv.className = 'error';
                }
            }
        });
    }
});