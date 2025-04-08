import { db, collection, addDoc, getDocs, query, orderBy } from './firebase.js';
import debug from './debug.js';

debug.info('Phone registration script loaded');

// Load phone numbers when the page loads
document.addEventListener('DOMContentLoaded', () => {
    debug.info('DOM loaded, initializing phone registration');
    loadPhoneNumbers();
});

// Function to load phone numbers
async function loadPhoneNumbers() {
    debug.info('Loading phone numbers from Firebase');
    try {
        const phonesRef = collection(db, 'phone_numbers');
        const q = query(phonesRef, orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const phones = [];
        querySnapshot.forEach((doc) => {
            phones.push({
                id: doc.id,
                ...doc.data()
            });
        });

        debug.info(`Loaded ${phones.length} phone numbers successfully`);
        displayPhoneNumbers(phones);
    } catch (error) {
        debug.error('Failed to load phone numbers:', error);
        showMessage('Error loading phone numbers. Please try again later.', 'error');
    }
}

// Function to display phone numbers
function displayPhoneNumbers(phones) {
    debug.info('Displaying phone numbers in the list');
    const phoneList = document.getElementById('phoneList');
    if (!phoneList) {
        debug.warn('Phone list element not found');
        return;
    }

    phoneList.innerHTML = '';
    phones.forEach(phone => {
        const phoneElement = document.createElement('div');
        phoneElement.className = 'phone-item';
        phoneElement.textContent = phone.phone_number;
        phoneList.appendChild(phoneElement);
    });
}

// Function to show messages
function showMessage(message, type = 'success') {
    debug.info(`Showing ${type} message:`, message);
    const messageElement = document.getElementById('message');
    if (!messageElement) {
        debug.warn('Message element not found');
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 3000);
}

// Handle form submission
document.getElementById('phoneForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    debug.info('Phone form submitted');

    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();

    if (!phone) {
        debug.warn('Empty phone number submitted');
        showMessage('Please enter a phone number', 'error');
        return;
    }

    debug.info('Attempting to save phone number:', phone);
    try {
        const phonesRef = collection(db, 'phone_numbers');
        await addDoc(phonesRef, {
            phone_number: phone,
            created_at: new Date()
        });

        debug.info('Phone number saved successfully');
        showMessage('Phone number registered successfully!');
        phoneInput.value = '';
        loadPhoneNumbers();
    } catch (error) {
        debug.error('Failed to save phone number:', error);
        showMessage('Error registering phone number. Please try again.', 'error');
    }
}); 