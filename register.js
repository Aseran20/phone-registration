// Function to format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

// Function to load phone numbers
async function loadPhoneNumbers() {
    try {
        const response = await fetch('/api/phones');
        const phones = await response.json();
        
        const phoneList = document.getElementById('phoneList');
        phoneList.innerHTML = phones.map(phone => `
            <div class="phone-item">
                <span class="phone-number">${phone.phone_number}</span>
                <span class="phone-date">${formatDate(phone.created_at)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading phone numbers:', error);
    }
}

// Load phone numbers when page loads
loadPhoneNumbers();

// Form submission handler
document.getElementById('phoneForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value;
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch('/api/save-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.textContent = 'Phone number saved successfully!';
            messageDiv.className = 'success';
            document.getElementById('phone').value = '';
            // Reload the phone numbers list
            loadPhoneNumbers();
        } else {
            throw new Error(data.message || 'Failed to save phone number');
        }
    } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.className = 'error';
    }
}); 