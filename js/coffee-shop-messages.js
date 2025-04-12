// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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

// DOM Elements
const messagesTable = document.querySelector('.messages-table');
const refreshBtn = document.getElementById('refreshBtn');
const logoutButton = document.getElementById('logoutBtn');

// State management
let currentShopId = null;
let isLoading = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM fully loaded, initializing messages page...');
    
    // Check authentication state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            debugInfo('User is signed in', user);
            await initializePage(user);
            updateUserProfile(user);
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
    
    // Handle refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (currentShopId) {
                await loadMessages();
            }
        });
    }
});

// Initialize page
async function initializePage(user) {
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
        await loadMessages();
        
    } catch (error) {
        debugError('Error initializing page:', error);
        alert('Error loading message history. Please try again.');
    }
}

// Load messages
async function loadMessages() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        setLoadingState(true);
        
        const messagesRef = collection(db, 'sms_messages');
        const messageQuery = query(
            messagesRef,
            where('shop_id', '==', currentShopId),
            orderBy('sent_at', 'desc')
        );
        
        const messageSnapshot = await getDocs(messageQuery);
        
        // Clear existing table rows
        const tbody = messagesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (messageSnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">
                        <i class="fas fa-info-circle"></i>
                        Aucun message envoyé pour le moment
                    </td>
                </tr>
            `;
            return;
        }
        
        messageSnapshot.forEach((doc) => {
            const data = doc.data();
            const row = createTableRow(doc.id, data);
            tbody.appendChild(row);
        });
        
        debugInfo(`Loaded ${messageSnapshot.size} messages`);
    } catch (error) {
        debugError('Error loading messages:', error);
        showError('Error loading messages. Please try again.');
    } finally {
        isLoading = false;
        setLoadingState(false);
    }
}

// Create table row
function createTableRow(docId, data) {
    const row = document.createElement('tr');
    const sentDate = data.sent_at?.toDate() || new Date();
    const formattedDate = sentDate.toLocaleString();
    const recipientCount = data.phone_numbers?.length || 0;
    
    // Determine status icon and class
    let statusIcon, statusClass, statusText;
    switch (data.status) {
        case 'success':
            statusIcon = 'fa-check-circle';
            statusClass = 'success';
            statusText = 'Success';
            break;
        case 'partial':
            statusIcon = 'fa-exclamation-circle';
            statusClass = 'warning';
            statusText = 'Partial';
            break;
        case 'error':
            statusIcon = 'fa-times-circle';
            statusClass = 'error';
            statusText = 'Failed';
            break;
        default:
            statusIcon = 'fa-question-circle';
            statusClass = 'unknown';
            statusText = 'Unknown';
    }
    
    row.innerHTML = `
        <td>
            <div class="date">
                <i class="fas fa-calendar"></i>
                ${formattedDate}
            </div>
        </td>
        <td>
            <div class="message-preview">
                ${truncateText(data.message, 50)}
            </div>
        </td>
        <td>
            <div class="recipient-count">
                <i class="fas fa-users"></i>
                ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}
            </div>
        </td>
        <td>
            <span class="status-badge ${statusClass}">
                <i class="fas ${statusIcon}"></i>
                ${statusText}
            </span>
        </td>
        <td>
            <button class="btn-action view-details" title="View details">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    // Add event listener for view details button
    const viewDetailsButton = row.querySelector('.view-details');
    viewDetailsButton.addEventListener('click', () => showMessageDetails(docId, data));
    
    return row;
}

// Show message details in a modal
function showMessageDetails(docId, data) {
    // Get the message details container
    const messageDetailsContainer = document.getElementById('messageDetailsContainer');
    
    // Format the date
    const sentDate = data.sent_at?.toDate() || new Date();
    const formattedDate = sentDate.toLocaleString();
    
    // Count recipients
    const recipientCount = data.phone_numbers?.length || 0;
    
    // Determine status text
    let statusText;
    switch (data.status) {
        case 'success':
            statusText = 'Success';
            break;
        case 'partial':
            statusText = 'Partial';
            break;
        case 'error':
            statusText = 'Failed';
            break;
        default:
            statusText = 'Unknown';
    }
    
    // Create message details HTML
    const messageDetailsHTML = `
        <div class="message-details-card">
            <div class="card-header">
                <h3>Détails du message</h3>
                <button class="btn-close" id="closeDetailsBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="detail-row">
                    <span class="detail-label">Date d'envoi:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Message:</span>
                    <p class="detail-value">${data.message || 'No message content'}</p>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Destinataires:</span>
                    <span class="detail-value">${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Statut:</span>
                    <span class="detail-value">${statusText}</span>
                </div>
            </div>
        </div>
    `;
    
    // Update the container with the message details
    messageDetailsContainer.innerHTML = messageDetailsHTML;
    
    // Add event listener to close button
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    closeDetailsBtn.addEventListener('click', () => {
        messageDetailsContainer.innerHTML = '';
    });
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

function showError(message) {
    // You can implement a toast notification here
    console.error('Error:', message);
    alert(message);
} 