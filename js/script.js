import { db, collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, doc, getDoc } from './firebase.js';
import { debug, debugError, debugInfo } from './debug.js';

debug('Phone registration script loaded');

// DOM Elements
const phoneForm = document.getElementById('phoneForm');
const phoneList = document.getElementById('phoneList');
const shopInfo = document.getElementById('shop-info');

// Check if shop ID is provided in the URL
const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get('shop');

// Get the shop info element
const shopInfoElement = document.getElementById('shop-info');

// Check if shop ID is provided
if (shopId) {
    // If shop ID is provided, load shop information
    if (shopInfoElement) {
        shopInfoElement.innerHTML = `
            <div class="shop-header">
                <h3>Coffee Shop: ${shopId}</h3>
                <p>Welcome to our coffee community!</p>
            </div>
        `;
        shopInfoElement.style.display = 'block';
    }
    
    // Load shop information
    loadShopInfo(shopId);
} else {
    // If no shop ID, show error message
    if (shopInfoElement) {
        shopInfoElement.innerHTML = '<div class="error">No shop ID provided. Please use a valid registration link.</div>';
        shopInfoElement.style.display = 'block';
    }
}

// Load shop information
async function loadShopInfo(shopId) {
    try {
        debug('Loading shop information for ID:', shopId);
        
        // Query the coffee_shops collection
        const shopsRef = collection(db, 'coffee_shops');
        const shopQuery = query(shopsRef, where('shopId', '==', shopId));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
            // Try querying by businessName as a fallback
            const nameQuery = query(shopsRef, where('businessName', '==', shopId));
            const nameSnapshot = await getDocs(nameQuery);
            
            if (nameSnapshot.empty) {
                debugError('Shop not found');
                if (shopInfo) {
                    shopInfo.innerHTML = '<div class="error">Établissement non trouvé. Veuillez utiliser un lien d\'inscription valide.</div>';
                }
                return;
            }
            
            const shopData = nameSnapshot.docs[0].data();
            debugInfo('Shop data loaded by business name:', shopData);
            
            // Update the shop info display
            if (shopInfo) {
                shopInfo.innerHTML = `
                    <div class="shop-header">
                        <h3><i class="fas fa-store"></i> ${shopData.businessName}</h3>
                        <p>Rejoignez notre communauté et profitez de nos offres exclusives !</p>
                    </div>
                `;
                shopInfo.style.display = 'block';
            }
            
            // Load phone numbers for this shop
            loadPhoneNumbers(shopData.shopId);
            return;
        }
        
        const shopData = shopSnapshot.docs[0].data();
        debugInfo('Shop data loaded by ID:', shopData);
        
        // Update the shop info display
        if (shopInfo) {
            shopInfo.innerHTML = `
                <div class="shop-header">
                    <h3><i class="fas fa-store"></i> ${shopData.businessName}</h3>
                    <p>Rejoignez notre communauté et profitez de nos offres exclusives !</p>
                </div>
            `;
            shopInfo.style.display = 'block';
        }
        
        // Load phone numbers for this shop
        loadPhoneNumbers(shopId);
    } catch (error) {
        debugError('Error loading shop information:', error);
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
        
        const phoneInput = document.getElementById('phone');
        const countryCode = document.getElementById('country-code').value;
        const fullPhoneNumber = countryCode + phoneInput.value;
        
        try {
            debug('Saving phone number to Firestore');
            
            // Get shop ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const shopId = urlParams.get('shop');
            
            if (!shopId) {
                throw new Error('No shop ID provided');
            }
            
            // Get the actual shopId from the coffee_shops collection
            const shopsRef = collection(db, 'coffee_shops');
            const shopQuery = query(shopsRef, where('businessName', '==', shopId));
            const shopSnapshot = await getDocs(shopQuery);
            
            if (shopSnapshot.empty) {
                throw new Error('Shop not found');
            }
            
            const actualShopId = shopSnapshot.docs[0].data().shopId;
            
            // Save to Firestore
            const phonesRef = collection(db, 'phone_numbers');
            await addDoc(phonesRef, {
                phone_number: fullPhoneNumber,
                shop_id: actualShopId,
                created_at: serverTimestamp(),
                active: true
            });
            
            debugInfo('Phone number saved successfully');
            alert('Phone number registered successfully!');
            
            // Clear the form
            phoneInput.value = '';
            
            // Reload phone numbers
            loadPhoneNumbers(actualShopId);
        } catch (error) {
            debugError('Error saving phone number', error);
            alert('Error registering phone number: ' + error.message);
        }
    });
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-right') && !event.target.closest('.menu-button')) {
                navLinks.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}); 