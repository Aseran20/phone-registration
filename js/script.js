import { db, collection, addDoc, getDocs, query, orderBy, where } from './firebase.js';
import { debug, debugError, debugInfo } from './debug.js';

debug('Phone registration script loaded');

// Get shop ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get('shop');

// Load shop information
async function loadShopInfo() {
    if (!shopId) {
        debug('No shop ID provided');
        return null;
    }

    try {
        const shopsRef = collection(db, 'coffee_shops');
        const q = query(shopsRef, where('id', '==', shopId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            debugError('No shop found with ID:', shopId);
            return null;
        }

        const shopData = querySnapshot.docs[0].data();
        debugInfo('Shop data loaded:', shopData);
        return shopData;
    } catch (error) {
        debugError('Error loading shop information:', error);
        return null;
    }
}

// Display shop information
function displayShopInfo(shopData) {
    const shopInfoElement = document.getElementById('shop-info');
    if (!shopInfoElement) {
        debugError('Shop info element not found');
        return;
    }

    if (!shopData) {
        shopInfoElement.innerHTML = '<p class="error">Invalid shop link. Please contact the coffee shop.</p>';
        return;
    }

    shopInfoElement.innerHTML = `
        <div class="shop-header">
            <h3>${shopData.name}</h3>
            <p>${shopData.description || 'Register your phone number to receive exclusive offers!'}</p>
        </div>
    `;
}

// Load phone numbers
async function loadPhoneNumbers() {
    const phoneList = document.getElementById('phoneList');
    if (!phoneList) return;

    try {
        const phonesRef = collection(db, 'phone_numbers');
        let q;
        
        if (shopId) {
            // If we have a shop ID, only show numbers for that shop
            q = query(phonesRef, 
                where('shop_id', '==', shopId),
                orderBy('created_at', 'desc')
            );
        } else {
            // If no shop ID, show all numbers (for admin)
            q = query(phonesRef, orderBy('created_at', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            phoneList.innerHTML = '<p class="no-numbers">No phone numbers registered yet.</p>';
            return;
        }

        phoneList.innerHTML = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="phone-item">
                    <span class="phone-number">${data.phone_number}</span>
                    <span class="phone-date">${new Date(data.created_at.toDate()).toLocaleString()}</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        debugError('Error loading phone numbers:', error);
        phoneList.innerHTML = '<p class="error-message">Error loading phone numbers</p>';
    }
}

// Handle form submission
document.getElementById('phoneForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    
    if (!phone) {
        alert('Please enter a phone number');
        return;
    }

    try {
        const phonesRef = collection(db, 'phone_numbers');
        await addDoc(phonesRef, {
            phone_number: phone,
            shop_id: shopId || null,
            created_at: new Date()
        });

        document.getElementById('phone').value = '';
        loadPhoneNumbers();
        debugInfo('Phone number registered successfully:', phone);
        alert('Phone number registered successfully!');
    } catch (error) {
        debugError('Error saving phone number:', error);
        alert('Error registering phone number');
    }
});

// Initialize page
async function initializePage() {
    if (shopId) {
        const shopData = await loadShopInfo();
        displayShopInfo(shopData);
    }
    await loadPhoneNumbers();
}

// Load everything when page loads
document.addEventListener('DOMContentLoaded', initializePage); 