// Admin credentials (in a real application, this would be handled securely on the server)
const ADMIN_EMAIL = 'admin@erasmus.com';
const ADMIN_PASSWORD = 'admin123';

function handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Basic admin authentication
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Store admin session
        const adminSession = {
            isAdmin: true,
            email: email,
            loginTime: new Date().toISOString()
        };

        if (remember) {
            localStorage.setItem('adminSession', JSON.stringify(adminSession));
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
        }

        // Redirect to admin dashboard
        window.location.href = 'admin-panel.html';
    } else {
        alert('Geçersiz email veya şifre!');
    }
}

// Check if admin is already logged in
function checkAdminSession() {
    const adminSession = JSON.parse(localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession'));
    
    if (adminSession && adminSession.isAdmin) {
        window.location.href = 'admin-panel.html';
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkAdminSession);
