/**
 * Google OAuth Authentication Module
 */

// Check authentication status on page load
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/me', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated && data.user) {
            showUserInfo(data.user);
        } else {
            showLoginButton();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showLoginButton();
    }
}

// Show user info in header
function showUserInfo(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const userPhoto = document.getElementById('userPhoto');
    const userName = document.getElementById('userName');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) {
        userInfo.style.display = 'flex';
        if (userPhoto && user.picture) {
            userPhoto.src = user.picture;
        }
        if (userName) {
            userName.textContent = user.name || user.email;
        }
    }
}

// Show login button
function showLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userInfo) userInfo.style.display = 'none';
}

// Handle Google Sign-In response
async function handleCredentialResponse(response) {
    try {
        const result = await fetch('/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                credential: response.credential
            })
        });
        
        const data = await result.json();
        
        if (data.status === 'ok' && data.user) {
            showUserInfo(data.user);
            // Optionally reload to refresh any user-specific content
            // window.location.reload();
        } else {
            console.error('Login failed:', data.message);
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login error. Please try again.');
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.status === 'ok') {
            showLoginButton();
            // Optionally reload
            window.location.reload();
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Initialize Google Sign-In
function initGoogleAuth() {
    // Load Google Sign-In library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
        // Initialize Google Sign-In
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: getGoogleClientId(),
                callback: handleCredentialResponse,
                auto_select: false,
            });
            
            // Render the sign-in button
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    window.google.accounts.id.prompt();
                });
            }
        }
    };
    
    document.head.appendChild(script);
}

// Get Google Client ID (you'll need to set this)
function getGoogleClientId() {
    // This should be set via environment variable or config
    // For development, you can hardcode it, but use env var in production
    return document.querySelector('meta[name="google-client-id"]')?.content || 
           'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
}

// Setup logout button listener
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initGoogleAuth();
    setupLogoutButton();
});

// Export for use in other modules
window.AuthModule = {
    checkAuthStatus,
    handleLogout,
    showUserInfo,
    showLoginButton
};
