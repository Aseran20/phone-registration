import { createClient } from '@supabase/supabase-js';
import { debug, debugError, debugInfo } from './debug.js';

// Initialize Supabase client
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if user has admin access
async function checkAdminAccess() {
    debug('Checking admin access...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        debugError('Error checking session:', error);
        window.location.href = '/login.html';
        return;
    }

    if (!session) {
        debug('No active session found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        debugError('User is not an admin:', profileError);
        window.location.href = '/dashboard.html';
        return;
    }

    debugInfo('Admin access confirmed for user:', session.user.email);
}

// Generate registration link
async function generateRegistrationLink() {
    debug('Generating registration link...');
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: 'user@example.com',
        options: {
            redirectTo: `${window.location.origin}/register.html`
        }
    });

    if (error) {
        debugError('Error generating registration link:', error);
        alert('Error generating registration link');
        return;
    }

    debug('Registration link generated successfully');
    return data.properties.action_link;
}

// Copy link to clipboard
function copyToClipboard(text) {
    debug('Copying to clipboard:', text);
    navigator.clipboard.writeText(text)
        .then(() => {
            debugInfo('Link copied to clipboard');
            alert('Link copied to clipboard!');
        })
        .catch(err => {
            debugError('Error copying to clipboard:', err);
            alert('Error copying to clipboard');
        });
}

// Download QR code
function downloadQRCode(url) {
    debug('Downloading QR code for URL:', url);
    const qr = new QRCode(document.createElement('div'), {
        text: url,
        width: 256,
        height: 256
    });
    
    const canvas = qr._el.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'registration-qr.png';
    link.href = canvas.toDataURL();
    link.click();
    debugInfo('QR code downloaded');
}

// Load phone numbers
async function loadPhoneNumbers() {
    debug('Loading phone numbers...');
    const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        debugError('Error loading phone numbers:', error);
        return;
    }

    const phoneList = document.getElementById('phone-list');
    if (!phoneList) {
        debugError('Phone list element not found');
        return;
    }

    phoneList.innerHTML = data.map(phone => `
        <div class="phone-item">
            <span class="phone-number">${phone.number}</span>
            <span class="phone-date">${new Date(phone.created_at).toLocaleString()}</span>
        </div>
    `).join('');

    debugInfo(`Loaded ${data.length} phone numbers`);
}

// Initialize admin page
async function initAdminPage() {
    debug('Initializing admin page...');
    await checkAdminAccess();
    await loadPhoneNumbers();

    // Set up real-time subscription for phone numbers
    const channel = supabase
        .channel('phone_numbers')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'phone_numbers' 
        }, () => {
            debug('Phone numbers changed, reloading...');
            loadPhoneNumbers();
        })
        .subscribe();

    debugInfo('Admin page initialized successfully');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminPage); 