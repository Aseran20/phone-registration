import { debug, debugError, debugInfo, debugWarn } from './debug.js';
import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

debug('Admin script loaded');

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in and is an admin
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            debugInfo('User is logged in', user);
            
            // Check if user is an admin
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid), where('role', '==', 'admin')));
            
            if (userDoc.empty) {
                debugWarn('User is not an admin, redirecting to dashboard');
                window.location.href = '/dashboard.html';
                return;
            }
            
            debugInfo('User is an admin, loading admin panel');
            loadAdminPanel();
        } else {
            debugWarn('No user is logged in, redirecting to login');
            window.location.href = '/login.html';
        }
    });
});

async function loadAdminPanel() {
    try {
        // Load users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        debugInfo('Loaded users:', users);
        
        // Display users in the admin panel
        const usersList = document.getElementById('usersList');
        if (usersList) {
            usersList.innerHTML = users.map(user => `
                <div class="user-item">
                    <div class="user-email">${user.email || 'N/A'}</div>
                    <div class="user-role">${user.role || 'user'}</div>
                    <div class="user-actions">
                        <button class="btn-secondary" onclick="resetUserPassword('${user.id}')">Reset Password</button>
                        <button class="btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        
        // Load coffee shops
        const shopsSnapshot = await getDocs(collection(db, 'coffee_shops'));
        const shops = shopsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        debugInfo('Loaded coffee shops:', shops);
        
        // Display coffee shops in the admin panel
        const shopsList = document.getElementById('shopsList');
        if (shopsList) {
            shopsList.innerHTML = shops.map(shop => `
                <div class="shop-item">
                    <div class="shop-name">${shop.name || 'Unnamed Shop'}</div>
                    <div class="shop-email">${shop.email || 'N/A'}</div>
                    <div class="shop-actions">
                        <button class="btn-secondary" onclick="viewShopDetails('${shop.id}')">View Details</button>
                        <button class="btn-danger" onclick="deleteShop('${shop.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        debugError('Error loading admin panel', error);
        alert('Error loading admin panel. Please try again.');
    }
}

// These functions would need to be implemented based on your specific requirements
window.resetUserPassword = async (userId) => {
    // Implementation for resetting user password
    alert('Password reset functionality not implemented yet.');
};

window.deleteUser = async (userId) => {
    // Implementation for deleting a user
    alert('Delete user functionality not implemented yet.');
};

window.viewShopDetails = async (shopId) => {
    // Implementation for viewing shop details
    alert('View shop details functionality not implemented yet.');
};

window.deleteShop = async (shopId) => {
    // Implementation for deleting a shop
    alert('Delete shop functionality not implemented yet.');
}; 