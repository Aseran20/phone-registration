// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { debug, debugError, debugWarn, debugInfo } from './debug.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCch3wlj9ft1psd8yEypdNA33C-7qCI4e0",
  authDomain: "test-a382b.firebaseapp.com",
  projectId: "test-a382b",
  storageBucket: "test-a382b.firebasestorage.app",
  messagingSenderId: "763775183510",
  appId: "1:763775183510:web:110e3b3a6c1c66ef6270b7",
  measurementId: "G-9N3C5LP43H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM fully loaded, initializing dashboard...');
    
    // Initialize elements
    const totalRegistrations = document.getElementById('totalRegistrations');
    const logoutButton = document.getElementById('logoutBtn');
    const sendSmsButton = document.getElementById('smsForm');
    
    // Check authentication state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            debugInfo('User is signed in', user);
            await loadDashboardData(user);
        } else {
            debugError('No user signed in');
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    });
    
    // Handle logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await auth.signOut();
                debugInfo('User logged out successfully');
                window.location.href = 'login.html';
            } catch (error) {
                debugError('Error logging out:', error);
                alert('Error logging out. Please try again.');
            }
        });
    } else {
        debugError('Logout button not found in the DOM');
    }
    
    // Handle SMS form submission
    if (sendSmsButton) {
        sendSmsButton.addEventListener('submit', async (event) => {
            event.preventDefault();
            const messageInput = document.getElementById('message');
            
            if (!messageInput) return;
            
            const message = messageInput.value.trim();
            
            if (!message) {
                alert('Please enter a message to send');
                return;
            }
            
            try {
                debug('Preparing to send SMS message');
                debugInfo('Message:', message);
                
                // Disable the submit button while processing
                const submitButton = sendSmsButton.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Get shop ID
                const shopsRef = collection(db, 'coffee_shops');
                const shopQuery = query(shopsRef, where('userId', '==', auth.currentUser.uid));
                const shopSnapshot = await getDocs(shopQuery);
                
                if (shopSnapshot.empty) {
                    throw new Error('No coffee shop found for this user');
                }
                
                const shopId = shopSnapshot.docs[0].id;
                debugInfo('Retrieved shop ID:', shopId);
                
                // Get all phone numbers for this shop
                const phonesRef = collection(db, 'phone_numbers');
                const phoneQuery = query(
                    phonesRef,
                    where('shop_id', '==', shopId)
                );
                
                const phoneSnapshot = await getDocs(phoneQuery);
                const phoneNumbers = phoneSnapshot.docs.map(doc => formatPhoneNumber(doc.data().phone_number));
                
                if (phoneNumbers.length === 0) {
                    alert('No registered phone numbers found for this shop.');
                    return;
                }
                
                // Send SMS through our API endpoint
                const response = await fetch('http://localhost:3000/api/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                        phoneNumbers
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to send SMS messages');
                }
                
                const result = await response.json();
                
                // Store the message in Firebase
                const messagesRef = collection(db, 'sms_messages');
                await addDoc(messagesRef, {
                    shop_id: shopId,
                    message: message,
                    phone_numbers: phoneNumbers,
                    sent_at: serverTimestamp(),
                    status: result.results.some(r => r.status === 'error') ? 'partial' : 'success',
                    results: result.results
                });
                
                // Check for any failed messages
                const failedMessages = result.results.filter(r => r.status === 'error');
                if (failedMessages.length > 0) {
                    debugWarn('Some messages failed to send:', failedMessages);
                    alert(`Warning: ${failedMessages.length} messages failed to send. Check the console for details.`);
                } else {
                    debugInfo('All SMS messages sent successfully');
                    alert('All messages sent successfully!');
                }
                
                // Clear the form
                messageInput.value = '';
                
            } catch (error) {
                debugError('Error sending SMS message:', error);
                alert('Error sending message. Please try again.');
            } finally {
                // Re-enable the submit button
                const submitButton = sendSmsButton.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send SMS to All';
            }
        });
    }
});

async function loadDashboardData(user) {
    try {
        // Get shop ID from coffee_shops collection
        const shopsRef = collection(db, 'coffee_shops');
        const shopQuery = query(shopsRef, where('userId', '==', user.uid));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
            debugError('No coffee shop found for this user');
            throw new Error('No coffee shop found for this user');
        }
        
        const shopDoc = shopSnapshot.docs[0];
        const shopId = shopDoc.id; // The document ID is the shop ID
        debugInfo('Retrieved shop ID:', shopId);

        // Load phone numbers count
        debug('Loading phone numbers count from Firebase...');
        const phonesRef = collection(db, 'phone_numbers');
        const phoneQuery = query(
            phonesRef,
            where('shop_id', '==', shopId)
        );

        const phoneSnapshot = await getDocs(phoneQuery);
        const totalCount = phoneSnapshot.size;
        
        // Count active numbers
        const activeCount = phoneSnapshot.docs.filter(doc => doc.data().active !== false).length;

        // Update total registrations count
        const totalRegistrationsElement = document.getElementById('totalRegistrations');
        if (totalRegistrationsElement) {
            totalRegistrationsElement.textContent = totalCount;
        }
        
        // Update active numbers count
        const activeNumbersElement = document.getElementById('activeNumbers');
        if (activeNumbersElement) {
            activeNumbersElement.textContent = activeCount;
        }
        
        // Update SMS sent count (placeholder for now)
        const smsSentElement = document.getElementById('smsSent');
        if (smsSentElement) {
            smsSentElement.textContent = '0'; // This would be updated with actual SMS count if available
        }

        // Update user profile
        updateUserProfile(user);

        debugInfo(`Loaded ${totalCount} total registrations, ${activeCount} active numbers`);

    } catch (error) {
        debugError('Error loading dashboard data:', error);
        alert('Error loading dashboard data. Please try again.');
    }
}

function updateUserProfile(user) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.displayName || 'Coffee Shop';
    }
}

// Helper function to get phone numbers based on recipient groups
async function getPhoneNumbersForRecipients(recipientGroups) {
    try {
        const shopId = 'Coffee123'; // This should be replaced with actual shop ID from user profile
        const phonesRef = collection(db, 'phone_numbers');
        const phoneQuery = query(
            phonesRef,
            where('shop_id', '==', shopId)
        );
        
        const phoneSnapshot = await getDocs(phoneQuery);
        const allPhones = phoneSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Filter phones based on recipient groups
        let selectedPhones = [];
        for (const group of recipientGroups) {
            switch (group) {
                case 'all':
                    selectedPhones = allPhones.map(p => formatPhoneNumber(p.phone_number));
                    break;
                case 'active':
                    selectedPhones = allPhones
                        .filter(p => p.active !== false)
                        .map(p => formatPhoneNumber(p.phone_number));
                    break;
                case 'today':
                    const today = new Date().toISOString().split('T')[0];
                    selectedPhones = allPhones
                        .filter(p => {
                            if (!p.created_at) return false;
                            const phoneDate = p.created_at.toDate().toISOString().split('T')[0];
                            return phoneDate === today;
                        })
                        .map(p => formatPhoneNumber(p.phone_number));
                    break;
            }
        }
        
        // Remove duplicates and ensure we have at least one phone number
        selectedPhones = [...new Set(selectedPhones)];
        if (selectedPhones.length === 0) {
            // For testing, add the provided phone number
            selectedPhones = ['+33766633413'];
        }
        
        debugInfo('Selected phone numbers:', selectedPhones);
        return selectedPhones;
    } catch (error) {
        debugError('Error getting phone numbers:', error);
        throw error;
    }
}

// Helper function to format phone numbers for Twilio
function formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // If the number already starts with +, return as is
    if (phone.startsWith('+')) {
        return phone;
    }
    
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If the number starts with country code
    if (cleaned.startsWith('41')) {
        return '+' + cleaned;
    }
    if (cleaned.startsWith('33')) {
        return '+' + cleaned;
    }
    
    // For numbers starting with 0
    if (cleaned.startsWith('0')) {
        // Swiss mobile numbers (07x, 08x, 09x)
        if (cleaned.match(/^0[7-9]/)) {
            return '+41' + cleaned.substring(1);
        }
        // French mobile numbers (06x, 07x)
        if (cleaned.match(/^0[6-7]/)) {
            return '+33' + cleaned.substring(1);
        }
        // Default to Swiss for other 0-prefixed numbers
        return '+41' + cleaned.substring(1);
    }
    
    // If it's just digits, assume Swiss number
    return '+41' + cleaned;
} 