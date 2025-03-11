document.addEventListener('DOMContentLoaded', () => {
    // Remove the automatic redirect check
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Show correct form based on URL hash
    if (window.location.hash === '#register') {
        switchToRegister();
    }

    // Show rewards info after delay
    setTimeout(() => {
        document.getElementById('rewards-info')?.classList.remove('hidden');
    }, 1000);

    // Create and append keyboard
    createVirtualKeyboard();
    
    // Add focus listeners to input fields
    const inputFields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputFields.forEach(input => {
        input.addEventListener('focus', () => showKeyboard(input));
    });
});

// Remove the checkAuthStatus function as it's causing the redirect issue

async function handleLogin(e) {
    e.preventDefault();
    showLoading();

    try {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // Validate inputs
        if (!email || !password) {
            throw new Error('Please fill in all fields');
        }

        if (!email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store session data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', 'member');
        localStorage.setItem('isAuthenticated', 'true'); // Add this line

        showSuccess('Welcome back! Redirecting...');

        // Redirect to main page after successful login
        setTimeout(() => {
            window.location.href = '/?action=showOrderType'; // Add query parameter
        }, 1500);

    } catch (error) {
        showError(error.message);
        console.error('Login error:', error);
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    showLoading();

    try {
        const firstName = document.getElementById('register-firstname').value;
        const lastName = document.getElementById('register-lastname').value;
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (!email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        showSuccess('Registration successful! Please log in.');
        setTimeout(() => {
            switchToLogin();
        }, 1500);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function switchToRegister() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    
    // Show register container before animation
    registerContainer.classList.remove('hidden');
    registerContainer.classList.add('active');
    
    // Trigger reflow
    void registerContainer.offsetWidth;
    
    // Animate login out
    loginContainer.style.animation = 'slideOutForm 0.3s forwards';
    
    setTimeout(() => {
        loginContainer.classList.add('hidden');
        registerContainer.style.animation = 'slideInForm 0.3s forwards';
    }, 300);
}

function switchToLogin() {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    
    // Show login container
    loginContainer.classList.remove('hidden');
    
    // Trigger reflow
    void loginContainer.offsetWidth;
    
    // Start animations
    registerContainer.style.animation = 'slideOutForm 0.3s forwards';
    loginContainer.style.animation = 'slideInForm 0.3s forwards';
    
    // Remove active state from register
    registerContainer.classList.remove('active');
    
    // After animation completes
    setTimeout(() => {
        registerContainer.classList.add('hidden');
        // Reset transforms
        loginContainer.style.transform = 'translate(-50%, -50%)';
        loginContainer.style.opacity = '1';
        loginContainer.style.visibility = 'visible';
    }, 300);
}

function continueAsGuest() {
    localStorage.setItem('userType', 'guest');
    window.location.href = '/?action=showOrderType';
}

// Add function to check if current page is auth page
function isAuthPage() {
    return window.location.pathname.includes('auth.html');
}

// UI Helper Functions
function showLoading() {
    document.getElementById('loading-spinner')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-spinner')?.classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    if (successDiv && successText) {
        successText.textContent = message;
        successDiv.classList.remove('hidden');
        setTimeout(() => successDiv.classList.add('hidden'), 3000);
    }
}

function createVirtualKeyboard() {
    const keyboard = document.createElement('div');
    keyboard.className = 'virtual-keyboard';
    keyboard.id = 'virtual-keyboard';

    // Define keyboard layout
    const layout = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
        ['@', '.com', 'Space', '.', '@gmail.com', '@yahoo.com']
    ];

    // Create keyboard rows
    layout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyButton = document.createElement('div');
            keyButton.className = 'key';
            
            switch(key) {
                case 'Backspace':
                    keyButton.className += ' special';
                    keyButton.innerHTML = '<i class="fas fa-backspace"></i>';
                    keyButton.onclick = () => handleBackspace();
                    break;
                case 'Shift':
                    keyButton.className += ' special';
                    keyButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    keyButton.onclick = () => handleShift();
                    break;
                case 'Space':
                    keyButton.className += ' space';
                    keyButton.innerHTML = '&nbsp;';
                    keyButton.onclick = () => handleKey(' ');
                    break;
                case '.com':
                case '@gmail.com':
                case '@yahoo.com':
                    keyButton.className += ' wide';
                    keyButton.textContent = key;
                    keyButton.onclick = () => handleKey(key);
                    break;
                default:
                    keyButton.textContent = key;
                    keyButton.onclick = () => handleKey(key);
            }
            
            keyboardRow.appendChild(keyButton);
        });
        
        keyboard.appendChild(keyboardRow);
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'keyboard-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = hideKeyboard;
    keyboard.appendChild(closeButton);

    document.body.appendChild(keyboard);
}

let currentInput = null;
let isShifted = false;

function showKeyboard(inputElement) {
    currentInput = inputElement;
    const keyboard = document.getElementById('virtual-keyboard');
    keyboard.style.display = 'block';
}

function hideKeyboard() {
    const keyboard = document.getElementById('virtual-keyboard');
    keyboard.style.display = 'none';
    currentInput = null;
}

function handleKey(key) {
    if (!currentInput) return;
    
    if (key === '.com' || key === '@gmail.com') {
        // For email extensions, simply append
        currentInput.value += key;
        // Update cursor position to end
        currentInput.selectionStart = currentInput.selectionEnd = currentInput.value.length;
    } else {
        const value = currentInput.value;
        const selectionStart = currentInput.selectionStart || value.length;
        const selectionEnd = currentInput.selectionEnd || value.length;
        
        const newValue = 
            value.substring(0, selectionStart) +
            (isShifted ? key.toUpperCase() : key) +
            value.substring(selectionEnd);
            
        currentInput.value = newValue;
        
        // Set cursor position after the inserted character
        const newPosition = selectionStart + 1;
        currentInput.selectionStart = currentInput.selectionEnd = newPosition;

        // Turn off shift after one use
        if (isShifted) {
            handleShift();
        }
    }
    
    // Trigger input event to ensure proper validation
    const event = new Event('input', { bubbles: true });
    currentInput.dispatchEvent(event);
    
    currentInput.focus();
}

function handleBackspace() {
    if (!currentInput) return;
    
    const value = currentInput.value;
    const selectionStart = currentInput.selectionStart;
    const selectionEnd = currentInput.selectionEnd;

    // If there's a selection, delete the selected text
    if (selectionStart !== selectionEnd) {
        currentInput.value = value.slice(0, selectionStart) + value.slice(selectionEnd);
        currentInput.selectionStart = currentInput.selectionEnd = selectionStart;
    } 
    // If no selection and not at the start, delete one character
    else if (selectionStart > 0) {
        currentInput.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        currentInput.selectionStart = currentInput.selectionEnd = selectionStart - 1;
    }

    // Trigger input event for validation
    currentInput.dispatchEvent(new Event('input', { bubbles: true }));
    currentInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Keep focus on the input
    currentInput.focus();
}

function handleShift() {
    isShifted = !isShifted;
    const keys = document.querySelectorAll('.key:not(.special):not(.space):not(.wide)');
    keys.forEach(key => {
        key.textContent = isShifted ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
    });
}

// Hide keyboard when clicking outside
document.addEventListener('click', (e) => {
    const keyboard = document.getElementById('virtual-keyboard');
    const isKeyboard = e.target.closest('.virtual-keyboard');
    const isInput = e.target.tagName === 'INPUT';
    
    if (!isKeyboard && !isInput && keyboard.style.display === 'block') {
        hideKeyboard();
    }
});
