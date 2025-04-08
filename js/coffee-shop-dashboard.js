import { auth, db } from './firebase-config.js';
import { debug, debugError, debugWarn, debugInfo } from './debug.js';
import { collection, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize QR code
const qrCode = document.getElementById('qr-code');
const copyLinkButton = document.getElementById('copy-link-button');
const phoneList = document.getElementById('phone-list');
const totalRegistrations = document.getElementById('total-registrations');
const todayRegistrations = document.getElementById('today-registrations');
const activeUsers = document.getElementById('active-users');

// Generate registration link and QR code
const registrationLink = `${window.location.origin}/register-phone.html?shop=Coffee123`;
QRCode.toCanvas(qrCode, registrationLink, {
    width: 200,
    margin: 1,
    color: {
        dark: '#000000',
        light: '#ffffff'
    }
});

// Copy registration link
copyLinkButton.addEventListener('click', () => {
    navigator.clipboard.writeText(registrationLink)
        .then(() => {
            debugInfo('Registration link copied to clipboard');
            copyLinkButton.textContent = 'Copied!';
            setTimeout(() => {
                copyLinkButton.textContent = 'Copy Registration Link';
            }, 2000);
        })
        .catch(err => {
            debugError('Failed to copy registration link', err);
        });
});

// Load phone numbers
async function loadPhoneNumbers() {
    try {
        debug('Loading phone numbers...');
        
        // Get the current user's shop ID
        const user = auth.currentUser;
        if (!user) {
            debugError('No user logged in');
            return;
        }
        
        // Get the shop ID from the user's data
        const shopsRef = collection(db, 'coffee_shops');
        const shopQuery = query(shopsRef, where('userId', '==', user.uid));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
            debugError('No shop found for user');
            return;
        }
        
        const shopData = shopSnapshot.docs[0].data();
        const shopId = shopData.id || 'Coffee123'; // Use the shop ID or default to Coffee123
        
        debugInfo('Shop ID:', shopId);
        
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

        // Update statistics
        totalRegistrations.textContent = phones.length;
        const today = new Date().toISOString().split('T')[0];
        const todayPhones = phones.filter(phone => {
            const phoneDate = phone.created_at.toDate().toISOString().split('T')[0];
            return phoneDate === today;
        });
        todayRegistrations.textContent = todayPhones.length;
        activeUsers.textContent = phones.filter(phone => phone.active !== false).length;

        // Display phone numbers
        phoneList.innerHTML = phones.map(phone => `
            <div class="phone-item">
                <div class="phone-number">${phone.phone_number}</div>
                <div class="phone-date">${phone.created_at.toDate().toLocaleDateString()}</div>
                <div class="phone-status ${phone.active !== false ? 'active' : 'inactive'}">
                    ${phone.active !== false ? 'Active' : 'Inactive'}
                </div>
            </div>
        `).join('');

        debugInfo(`Loaded ${phones.length} phone numbers`);
    } catch (error) {
        debugError('Error loading phone numbers', error);
    }
}

// Check authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        debug('User is signed in', user);
        document.querySelector('.user-name').textContent = user.displayName || 'Coffee Shop';
        if (user.photoURL) {
            document.querySelector('.user-avatar img').src = user.photoURL;
        }
        loadPhoneNumbers();
    } else {
        debugWarn('No user is signed in');
        window.location.href = 'coffee-shop-login.html';
    }
});

// Handle logout
document.querySelector('.user-profile').addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            debug('User signed out');
            window.location.href = 'coffee-shop-login.html';
        })
        .catch(error => {
            debugError('Error signing out', error);
        });
}); 