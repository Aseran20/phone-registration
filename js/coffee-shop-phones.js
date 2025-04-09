import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const phoneNumbersTable = document.getElementById('phoneNumbersTable');
const refreshBtn = document.getElementById('refreshBtn');
const logoutButton = document.getElementById('logoutBtn');

// State management
let currentShopId = null;
let isLoading = false;

// Authentication state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        debugInfo('User is signed in', user);
        initializeDashboard(user);
        updateUserProfile(user);
    } else {
        debugError('No user signed in');
        window.location.href = 'login.html';
    }
});

// Initialize dashboard
async function initializeDashboard(user) {
    try {
        // Get shop ID
        const shopsRef = collection(db, 'coffee_shops');
        const shopQuery = query(shopsRef, where('userId', '==', user.uid));
        const shopSnapshot = await getDocs(shopQuery);
        
        if (shopSnapshot.empty) {
            throw new Error('No coffee shop found for this user');
        }
        
        currentShopId = shopSnapshot.docs[0].id;
        debugInfo('Retrieved shop ID:', currentShopId);
        
        // Load initial data
        await loadPhoneNumbers();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        debugError('Error initializing dashboard:', error);
        alert('Error loading dashboard. Please try again.');
    }
}

// Load phone numbers
async function loadPhoneNumbers() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        setLoadingState(true);
        
        const phonesRef = collection(db, 'phone_numbers');
        const phoneQuery = query(
            phonesRef,
            where('shop_id', '==', currentShopId)
        );
        
        const phoneSnapshot = await getDocs(phoneQuery);
        
        // Clear existing table rows
        const tbody = phoneNumbersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (phoneSnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="no-data">
                        <i class="fas fa-info-circle"></i>
                        No phone numbers registered yet
                    </td>
                </tr>
            `;
            return;
        }
        
        phoneSnapshot.forEach((doc) => {
            const data = doc.data();
            const row = createTableRow(doc.id, data);
            tbody.appendChild(row);
        });

        debugInfo(`Loaded ${phoneSnapshot.size} phone numbers`);
    } catch (error) {
        debugError('Error loading phone numbers:', error);
        showError('Error loading phone numbers. Please try again.');
    } finally {
        isLoading = false;
        setLoadingState(false);
    }
}

// Create table row
function createTableRow(docId, data) {
    const row = document.createElement('tr');
    const registrationDate = data.created_at?.toDate() || new Date();
    
    row.innerHTML = `
        <td>
            <div class="phone-number">
                <i class="fas fa-phone"></i>
                ${data.phone_number}
            </div>
        </td>
        <td>
            <div class="date">
                <i class="fas fa-calendar"></i>
                ${registrationDate.toLocaleDateString()}
            </div>
        </td>
        <td>
            <span class="status-badge ${data.active !== false ? 'active' : 'inactive'}">
                <i class="fas fa-${data.active !== false ? 'check-circle' : 'times-circle'}"></i>
                ${data.active !== false ? 'Active' : 'Inactive'}
            </span>
        </td>
        <td class="actions">
            <button class="btn-action toggle-status" title="${data.active !== false ? 'Deactivate' : 'Activate'}">
                <i class="fas fa-toggle-${data.active !== false ? 'on' : 'off'}"></i>
            </button>
            <button class="btn-action delete-number" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    // Add event listeners for actions
    const toggleButton = row.querySelector('.toggle-status');
    const deleteButton = row.querySelector('.delete-number');
    
    toggleButton.addEventListener('click', () => togglePhoneNumberStatus(docId, data.active === false));
    deleteButton.addEventListener('click', () => deletePhoneNumber(docId));
    
    return row;
}

// Toggle phone number status
async function togglePhoneNumberStatus(docId, newStatus) {
    try {
        const phoneNumberRef = doc(db, 'phone_numbers', docId);
        await updateDoc(phoneNumberRef, {
            active: newStatus
        });
        await loadPhoneNumbers();
        showSuccess(`Phone number ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
        debugError('Error updating status:', error);
        showError('Error updating status. Please try again.');
    }
}

// Delete phone number
async function deletePhoneNumber(docId) {
    if (confirm('Are you sure you want to delete this phone number?')) {
        try {
            await deleteDoc(doc(db, 'phone_numbers', docId));
            await loadPhoneNumbers();
            showSuccess('Phone number deleted successfully');
        } catch (error) {
            debugError('Error deleting phone number:', error);
            showError('Error deleting phone number. Please try again.');
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', async () => {
        await loadPhoneNumbers();
    });
}

// Update user profile
function updateUserProfile(user) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.displayName || 'Coffee Shop Owner';
    }
}

// UI Helper functions
function setLoadingState(loading) {
    const refreshIcon = refreshBtn.querySelector('i');
    if (loading) {
        refreshIcon.classList.add('fa-spin');
        refreshBtn.disabled = true;
    } else {
        refreshIcon.classList.remove('fa-spin');
        refreshBtn.disabled = false;
    }
}

function showSuccess(message) {
    // You can implement a toast notification here
    console.log('Success:', message);
}

function showError(message) {
    // You can implement a toast notification here
    console.error('Error:', message);
    alert(message);
}

// Logout functionality
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        debugInfo('User logged out successfully');
        window.location.href = 'login.html';
    } catch (error) {
        debugError('Error signing out:', error);
        showError('Error signing out. Please try again.');
    }
}); 