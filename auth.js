/**
 * Abyssinia Coffee - Secure Authentication Logic
 * Following OWASP Frontend Security Principles
 */

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navExtras = document.querySelector('.nav-extras');
    if (!navExtras) return;

    if (currentUser) {
        // User is logged in - show initials and logout
        navExtras.innerHTML = `
            <div class="user-controls" style="display: flex; align-items: center; gap: 15px;">
                <span class="user-initials" title="${currentUser.username}">${currentUser.initials || 'U'}</span>
                <button onclick="performLogout()" class="logout-btn" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
    }
}

function performLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

/**
 * OWASP Helper: Securely show messages using textContent to prevent XSS (A03)
 */
function showAuthMessage(elementId, text, type = "error") {
    const box = document.getElementById(elementId);
    if (!box) return;

    box.textContent = text; // Secure against XSS
    box.className = type === "success" ? "success-box" : "error-box";
    box.style.display = "block";
}

/**
 * Toggle Password Visibility
 * Swaps between password and text type
 */
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        iconElement.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        iconElement.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

/**
 * Strict Email Validation: Must have @ and at least one .
 */
function isValidEmail(email) {
    return email.includes('@') && email.split('@')[1].includes('.');
}

/**
 * Phone Validation: Exactly 10 digits
 */
function isValidPhone(phone) {
    const stripped = phone.replace(/[^0-9]/g, '');
    return stripped.length === 10;
}

/**
 * OWASP Helper: Validate Password Strength (A02)
 * Rules: 8+ chars, 1 Upper, 1 Number, 1 Special Char
 */
function isPasswordStrong(password) {
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return strongRegex.test(password);
}

/**
 * Mock Secure User Fetch
 */
async function getAuthUsers() {
    try {
        const res = await fetch('db.json');
        if (res.ok) {
            const data = await res.json();
            return data.users || [];
        }
    } catch (e) {
        // Fallback for demo/file protocol
        return [
            { "id": 1, "username": "admin", "email": "admin@coffee.com", "password": "123", "role": "admin" },
            { "id": 3, "username": "Elias Tesfaye", "email": "elias@coffee.com", "password": "123", "role": "user" }
        ];
    }
}
