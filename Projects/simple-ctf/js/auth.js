/**
 * TechVault Corp - Authentication Module
 * 
 * Handles user login, session management, and token validation.
 * 
 * NOTE: This module uses client-side validation for demo purposes.
 * In production, all auth should be server-side validated.
 * 
 * @author TechVault Dev Team
 * @version 3.2.1
 * @since 2024-01-10
 */

// CTF VULNERABILITY 1: Hardcoded admin credentials
// TODO: Move to server-side validation before production release
const ADMIN_CREDENTIALS = {
    username: 'sysadmin',
    // CTF: MD5 hash of the password "admin123" - crackable!
    passwordHash: '0192023a7bbd73250516f069df18b500',
    // CTF: The hash algorithm is also exposed
    algorithm: 'md5'
};

// CTF VULNERABILITY 2: JWT-like token structure (client-side generated)
const TOKEN_CONFIG = {
    issuer: 'techvault-corp',
    algorithm: 'HS256',
    expiresIn: 86400 // 24 hours
};

// CTF VULNERABILITY 3: Debug endpoints exposed in source
const DEBUG_ENDPOINTS = {
    health: '/api/health',
    config: '/api/config',
    users: '/api/users',  // CTF: Exposed user enumeration endpoint
    debug: '/api/debug'   // CTF: Full debug info endpoint
};

/**
 * Simple MD5 implementation for password hashing
 * NOTE: In production, use bcrypt/scrypt/argon2
 * 
 * CTF: This is intentionally weak - MD5 is not secure for password hashing
 */
function simpleMD5(string) {
    // This is a simplified MD5 for the CTF - in reality we'd use a library
    // The hash '0192023a7bbd73250516f069df18b500' is MD5('admin123')
    // CTF participants can use online rainbow tables or hashcat to crack it
    return string; // Placeholder - actual validation happens client-side
}

/**
 * Generate a JWT-like token (client-side - NOT secure!)
 * CTF: This simulates a real vulnerability where tokens are generated client-side
 */
function generateToken(payload) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    
    const tokenPayload = btoa(JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + TOKEN_CONFIG.expiresIn,
        iss: TOKEN_CONFIG.issuer
    }));
    
    // CTF: Fake signature - in reality this would be server-side
    const signature = btoa('techvault_' + payload.user + '_' + Date.now());
    
    return `${header}.${tokenPayload}.${signature}`;
}

/**
 * Validate credentials against hardcoded values
 * CTF: This entire validation is client-side and can be bypassed
 */
function validateCredentials(username, password) {
    // CTF: The comparison is done client-side with MD5
    // An attacker can:
    // 1. Read the source to find the hash
    // 2. Crack the MD5 hash to find the password
    // 3. OR bypass by directly setting localStorage values
    // 4. OR modify the validateCredentials function in DevTools
    
    if (username !== ADMIN_CREDENTIALS.username) {
        return { success: false, message: 'Usuário não encontrado' };
    }
    
    // CTF: MD5 comparison - the hash can be reversed
    // For the CTF: MD5('admin123') = '0192023a7bbd73250516f069df18b500'
    const passwordHash = computeMD5(password);
    
    if (passwordHash !== ADMIN_CREDENTIALS.passwordHash) {
        return { success: false, message: 'Senha incorreta' };
    }
    
    return { success: true, message: 'Autenticação bem-sucedida' };
}

/**
 * Compute MD5 hash (simplified for CTF)
 * In production, this should NEVER be done client-side
 */
function computeMD5(input) {
    // Pre-computed hashes for the CTF
    // MD5('admin123') = '0192023a7bbd73250516f069df18b500'
    // MD5('password') = '5f4dcc3b5aa765d61d8327deb882cf99'
    // MD5('letmein') = '0d107d09f5bbe40cade3de5c71e9e9b7'
    // MD5('qwerty') = 'd8578edf8458ce06fbc5bb76a58c5ca4'
    
    const commonPasswords = {
        'admin123': '0192023a7bbd73250516f069df18b500',
        'password': '5f4dcc3b5aa765d61d8327deb882cf99',
        'letmein': '0d107d09f5bbe40cade3de5c71e9e9b7',
        'qwerty': 'd8578edf8458ce06fbc5bb76a58c5ca4',
        'admin': '21232f297a57a5a743894a0e4a801fc3',
        'techvault': 'a]8f5e2b3c4d5e6f7a8b9c0d1e2f3a4b5'
    };
    
    return commonPasswords[input.toLowerCase()] || 'unknown';
}

/**
 * Handle login form submission
 * CTF: The entire auth flow is client-side
 */
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showLoginError('Preencha todos os campos');
                return;
            }
            
            const result = validateCredentials(username, password);
            
            if (result.success) {
                // Generate session data
                const sessionData = {
                    username: username,
                    role: 'admin',
                    loginTime: new Date().toISOString(),
                    sessionId: 'sess_' + Math.random().toString(36).substr(2, 9)
                };
                
                // Generate JWT-like token
                const token = generateToken({
                    user: username,
                    role: 'admin',
                    permissions: ['read', 'write', 'admin']
                });
                
                // Store in localStorage (CTF: insecure storage)
                localStorage.setItem('tv_session', btoa(JSON.stringify(sessionData)));
                localStorage.setItem('tv_auth_token', token);
                
                // CTF: Also store debug info
                localStorage.setItem('tv_debug', JSON.stringify({
                    method: 'client_side_auth',
                    hashAlgorithm: 'md5',
                    note: 'auth_bypass_possible'
                }));
                
                // CTF: Log sensitive info to console
                console.log('[Auth] Login successful for:', username);
                console.log('[Auth] Token generated:', token);
                console.log('[Auth] Session:', sessionData);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showLoginError(result.message);
            }
        });
    }
    
    function showLoginError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 3000);
        }
    }
});

// CTF VULNERABILITY 4: Exposed API for credential testing
// This simulates a real scenario where internal APIs are left exposed
const TechVaultAuth = {
    // CTF: These can be called from the browser console
    login: function(user, pass) {
        return validateCredentials(user, pass);
    },
    
    // CTF: Information disclosure
    getConfig: function() {
        return {
            hashAlgorithm: ADMIN_CREDENTIALS.algorithm,
            issuer: TOKEN_CONFIG.issuer,
            // CTF: Exposes the expected hash format
            hashExample: ADMIN_CREDENTIALS.passwordHash,
            endpoints: DEBUG_ENDPOINTS
        };
    },
    
    // CTF: Token manipulation helper
    createToken: function(payload) {
        return generateToken(payload);
    }
};

// Make it accessible from console
window.TechVaultAuth = TechVaultAuth;

// CTF: Version info and debug mode
console.log('='.repeat(50));
console.log('[TechVault Auth] v3.2.1 loaded');
console.log('[TechVault Auth] Debug mode: enabled');
console.log('[TechVault Auth] Access TechVaultAuth object from console');
console.log('[TechVault Auth] Try: TechVaultAuth.getConfig()');
console.log('='.repeat(50));
