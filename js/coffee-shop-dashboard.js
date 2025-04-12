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

// Global variables
let currentShopId = null;

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
            await initializeDashboard(user);
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
                
                // Send SMS via Netlify function
                const response = await fetch('/.netlify/functions/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        phoneNumbers: phoneNumbers
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

    // Character counter functionality
    const messageTextarea = document.getElementById('message');
    const charCounter = document.querySelector('.char-counter');
    const MAX_LENGTH = 160;

    if (messageTextarea && charCounter) {
        messageTextarea.addEventListener('input', () => {
            const length = messageTextarea.value.length;
            charCounter.textContent = `${length}/${MAX_LENGTH} caractères`;
            
            // Update counter color based on remaining characters
            charCounter.classList.remove('near-limit', 'at-limit');
            if (length >= MAX_LENGTH * 0.9) { // 90% of limit
                charCounter.classList.add('at-limit');
            } else if (length >= MAX_LENGTH * 0.8) { // 80% of limit
                charCounter.classList.add('near-limit');
            }
        });
    }
});

async function initializeDashboard(user) {
    try {
        // Get shop ID
        const shopsRef = collection(db, 'coffee_shops');
        const shopQuery = query(shopsRef, where('userId', '==', user.uid));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
            throw new Error('No coffee shop found for this user');
        }
        
        const shopDoc = shopSnapshot.docs[0];
        currentShopId = shopDoc.id;
        const shopData = shopDoc.data();
        
        debugInfo('Retrieved shop ID:', currentShopId);
        
        // Update user profile with business name
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = shopData.businessName;
        }
        
        // Set up registration link
        setupRegistrationLink(shopData.businessName);
        
        // Load dashboard data
        await loadDashboardData(user);
        
    } catch (error) {
        debugError('Error initializing dashboard:', error);
        alert('Error loading dashboard. Please try again.');
    }
}

// Set up registration link
function setupRegistrationLink(businessName) {
    const registrationLink = document.getElementById('registrationLink');
    const copyButton = document.getElementById('copyLinkBtn');
    
    if (registrationLink && copyButton) {
        // Create the registration link
        const baseUrl = window.location.origin;
        const registrationUrl = `${baseUrl}/register-phone.html?shop=${encodeURIComponent(businessName)}`;
        
        // Set the link in the input
        registrationLink.value = registrationUrl;
        
        // Add copy functionality
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(registrationUrl);
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copié !';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copier';
                }, 2000);
            } catch (error) {
                debugError('Error copying to clipboard:', error);
                alert('Error copying to clipboard. Please try again.');
            }
        });
    }
}

async function loadDashboardData(user) {
    try {
        if (!currentShopId) {
            throw new Error('Shop ID not initialized');
        }
        
        // Get phone numbers count
        const phonesRef = collection(db, 'phone_numbers');
        const phoneQuery = query(phonesRef, where('shop_id', '==', currentShopId));
        const phoneSnapshot = await getDocs(phoneQuery);
        
        // Update stats
        const totalRegistrations = document.getElementById('totalRegistrations');
        const activeNumbers = document.getElementById('activeNumbers');
        
        if (totalRegistrations) {
            totalRegistrations.textContent = phoneSnapshot.size;
        }
        
        if (activeNumbers) {
            const activeCount = phoneSnapshot.docs.filter(doc => doc.data().active !== false).length;
            activeNumbers.textContent = activeCount;
        }
        
        // Get messages count
        const messagesRef = collection(db, 'sms_messages');
        const messageQuery = query(messagesRef, where('shop_id', '==', currentShopId));
        const messageSnapshot = await getDocs(messageQuery);
        
        const totalMessages = document.getElementById('totalMessages');
        if (totalMessages) {
            totalMessages.textContent = messageSnapshot.size;
        }
        
    } catch (error) {
        debugError('Error loading dashboard data:', error);
        alert('Error loading dashboard data. Please try refreshing the page.');
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
    
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If the number already starts with +41, ensure it's in the correct format
    if (phone.startsWith('+41')) {
        // Ensure it's exactly 12 digits after the +
        if (phone.length === 12) {
            return phone;
        }
        // If not, clean and reformat
        cleaned = phone.substring(3).replace(/\D/g, '');
    }
    
    // Handle numbers starting with 41
    if (cleaned.startsWith('41')) {
        cleaned = cleaned.substring(2);
    }
    
    // Handle numbers starting with 0
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // For Swiss mobile numbers, ensure they start with 7 and have exactly 9 digits
    if (cleaned.match(/^7/)) {
        // Pad with zeros if necessary to ensure 9 digits
        cleaned = cleaned.padStart(9, '0');
        return '+41' + cleaned;
    }
    
    // For any other format, assume Swiss and ensure proper length
    cleaned = cleaned.padStart(9, '0');
    return '+41' + cleaned;
} 