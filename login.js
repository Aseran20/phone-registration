document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const messageDiv = document.getElementById('message');
    
    try {
        // For demo purposes, we'll use a simple authentication
        // In a real application, this would connect to your Supabase auth
        if (email && password) {
            // Simulate successful login
            messageDiv.textContent = 'Login successful! Redirecting to dashboard...';
            messageDiv.className = 'success';
            
            // Store login state
            if (remember) {
                localStorage.setItem('sendoSwissLoggedIn', 'true');
                localStorage.setItem('sendoSwissEmail', email);
            } else {
                sessionStorage.setItem('sendoSwissLoggedIn', 'true');
                sessionStorage.setItem('sendoSwissEmail', email);
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            throw new Error('Please enter both email and password');
        }
    } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.className = 'error';
    }
}); 