import { db, collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, doc, getDoc } from './firebase.js';
import { debug, debugError, debugInfo } from './debug.js';

debug('Phone registration script loaded');

// DOM Elements
const phoneForm = document.getElementById('phoneForm');
const phoneList = document.getElementById('phoneList');
const shopInfo = document.getElementById('shop-info');

// Get shop info from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get('shop');

// Get reference to shop info element
const shopInfoElement = document.getElementById('shop-info');

if (shopId) {
    // Display shop ID directly without querying Firebase
    shopInfoElement.innerHTML = `
        <div class="shop-header">
            <h3>Coffee Shop: ${shopId}</h3>
            <p>Welcome to our coffee community!</p>
        </div>
    `;
    shopInfoElement.style.display = 'block';
} else {
    // If no shop ID, show error message
    shopInfoElement.innerHTML = '<div class="error">No shop ID provided. Please use a valid registration link.</div>';
    shopInfoElement.style.display = 'block';
}

// Load shop information
async function loadShopInfo(shopId) {
    try {
        debug('Loading shop information for ID:', shopId);
        
        // Query the coffee_shops collection
        const shopsRef = collection(db, 'coffee_shops');
        const shopQuery = query(shopsRef, where('id', '==', shopId));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
            debugError('Shop not found');
            if (shopInfo) {
                shopInfo.innerHTML = '<div class="error">Shop not found. Please use a valid registration link.</div>';
            }
            return;
        }
        
        const shopData = shopSnapshot.docs[0].data();
        debugInfo('Shop data loaded:', shopData);
        
        // Display shop information
        if (shopInfo) {
            shopInfo.innerHTML = `
                <div class="shop-header">
                    <h2>${shopData.name || 'Coffee Shop'}</h2>
                    <p>${shopData.description || 'Welcome to our coffee shop!'}</p>
                </div>
            `;
        }
        
        // Load phone numbers for this shop
        loadPhoneNumbers(shopId);
    } catch (error) {
        debugError('Error loading shop information', error);
        if (shopInfo) {
            shopInfo.innerHTML = '<div class="error">Error loading shop information. Please try again later.</div>';
        }
    }
}

// Load phone numbers
async function loadPhoneNumbers(shopId) {
    try {
        debug('Loading phone numbers for shop:', shopId);
        
        // Query phone numbers for this shop
        const phonesRef = collection(db, 'phone_numbers');
        const phoneQuery = query(
            phonesRef, 
            where('shop_id', '==', shopId),
            orderBy('created_at', 'desc')
        );
        
        const phoneSnapshot = await getDocs(phoneQuery);
        const phones = phoneSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        debugInfo('Phone numbers loaded:', phones);
        
        // Display phone numbers
        if (phoneList) {
            if (phones.length === 0) {
                phoneList.innerHTML = '<div class="no-data">No phone numbers registered yet.</div>';
            } else {
                phoneList.innerHTML = phones.map(phone => `
                    <div class="phone-item">
                        <div class="phone-number">${phone.phone_number || 'N/A'}</div>
                        <div class="phone-date">${phone.created_at ? phone.created_at.toDate().toLocaleDateString() : 'N/A'}</div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        debugError('Error loading phone numbers', error);
        if (phoneList) {
            phoneList.innerHTML = '<div class="error">Error loading phone numbers. Please try again later.</div>';
        }
    }
}

// Phone number validation and formatting
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if the number starts with a country code
    if (cleaned.startsWith('41')) {
        // Swiss number starting with 41
        return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
        // Swiss number starting with 0, replace with 41
        return '+41' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
        // Add + if not present
        return '+' + cleaned;
    }
    
    return cleaned;
}

function isValidPhoneNumber(phone) {
    // Basic E.164 validation
    // Should start with + and contain only digits after that
    // Length should be between 8 and 15 digits (excluding +)
    const cleaned = phone.replace(/\D/g, '');
    return /^\+[1-9]\d{7,14}$/.test(phone) || /^[1-9]\d{7,14}$/.test(cleaned);
}

// Handle form submission
if (phoneForm) {
    phoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        debug('Phone form submitted');
        
        const phoneInput = document.getElementById('phone');
        const countryCodeSelect = document.getElementById('country-code');
        const phoneNumber = phoneInput.value.trim();
        const countryCode = countryCodeSelect.value;
        
        if (!phoneNumber) {
            debugError('Phone number is empty');
            alert('Please enter a phone number');
            return;
        }
        
        // Combine country code and phone number
        const fullPhoneNumber = countryCode + phoneNumber;
        debugInfo('Full phone number:', fullPhoneNumber);
        
        // Validate the full phone number
        if (!isValidPhoneNumber(fullPhoneNumber)) {
            debugError('Invalid phone number format');
            alert('Please enter a valid phone number');
            return;
        }
        
        try {
            debug('Saving phone number to Firestore');
            
            // Get shop ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const shopId = urlParams.get('shop');
            
            if (!shopId) {
                throw new Error('No shop ID provided');
            }
            
            // Save to Firestore
            const phonesRef = collection(db, 'phone_numbers');
            await addDoc(phonesRef, {
                phone_number: fullPhoneNumber,
                shop_id: shopId,
                created_at: serverTimestamp(),
                active: true
            });
            
            debugInfo('Phone number saved successfully');
            alert('Phone number registered successfully!');
            
            // Clear the form
            phoneInput.value = '';
            
            // Reload phone numbers
            loadPhoneNumbers(shopId);
        } catch (error) {
            debugError('Error saving phone number', error);
            alert('Error registering phone number: ' + error.message);
        }
    });
} 