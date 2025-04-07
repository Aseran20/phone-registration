import { supabase } from './js/supabase.js';

// Function to format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

// Function to load phone numbers
async function loadPhoneNumbers() {
    const phoneList = document.getElementById('phoneList');

    if (!phoneList) return;

    try {
        const { data, error } = await supabase
            .from('phone_numbers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        phoneList.innerHTML = data.map(phone => `
            <div class="phone-item">
                <span class="phone-number">${phone.phone_number}</span>
                <span class="phone-date">${new Date(phone.created_at).toLocaleDateString()}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading phone numbers:', error);
        if (phoneList) {
            phoneList.innerHTML = '<div class="error">Error loading phone numbers</div>';
        }
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
        const { data, error } = await supabase
            .from('phone_numbers')
            .insert([{ phone_number: phone }]);

        if (error) throw error;

        if (messageDiv) {
            messageDiv.textContent = 'Phone number registered successfully!';
            messageDiv.className = 'success';
        }
        
        if (document.getElementById('phone')) document.getElementById('phone').value = '';
        await loadPhoneNumbers();
    } catch (error) {
        console.error('Error:', error);
        if (messageDiv) {
            messageDiv.textContent = 'Error registering phone number. Please try again.';
            messageDiv.className = 'error';
        }
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll event listener for navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.background = 'var(--white)';
    }
});

// Handle CTA button clicks
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
        // You can add your lead capture form or demo booking logic here
        alert('Thank you for your interest! Our team will contact you shortly.');
    });
}); 