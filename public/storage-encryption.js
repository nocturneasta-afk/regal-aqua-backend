// ============================================
// CLIENT-SIDE STORAGE ENCRYPTION
// ============================================
// Encrypts sensitive data in localStorage using crypto-js

class SecureStorage {
  constructor(encryptionKey = null) {
    // Use provided key or derive from user/environment
    this.key = encryptionKey || this.deriveKey();
  }

  // Derive encryption key from browser/device info
  deriveKey() {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const combined = `${userAgent}-${language}-${timezone}`;
    
    // Use crypto-js to hash into a consistent key
    return CryptoJS.SHA256(combined).toString().substring(0, 32);
  }

  // Encrypt and store value
  setSecure(key, value) {
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.key).toString();
      localStorage.setItem(`sec_${key}`, encrypted);
      return true;
    } catch (error) {
      console.error(`Failed to encrypt ${key}:`, error.message);
      return false;
    }
  }

  // Retrieve and decrypt value
  getSecure(key) {
    try {
      const encrypted = localStorage.getItem(`sec_${key}`);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, this.key).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error(`Failed to decrypt ${key}:`, error.message);
      return null;
    }
  }

  // Remove encrypted item
  removeSecure(key) {
    try {
      localStorage.removeItem(`sec_${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error.message);
      return false;
    }
  }

  // Clear all encrypted items
  clearSecure() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sec_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear secure storage:', error.message);
      return false;
    }
  }

  // Store sensitive user token
  setToken(token) {
    return this.setSecure('auth_token', {
      value: token,
      storedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Retrieve token safely
  getToken() {
    const tokenData = this.getSecure('auth_token');
    if (!tokenData) return null;

    // Check if token expired
    if (new Date(tokenData.expiresAt) < new Date()) {
      this.removeSecure('auth_token');
      return null;
    }

    return tokenData.value;
  }

  // Store user data (non-sensitive parts only)
  setUser(userData) {
    const safe = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      firstName: userData.firstName,
      authMethod: userData.authMethod,
      phone: userData.phone || null
    };
    return this.setSecure('user_data', safe);
  }

  // Get user data
  getUser() {
    return this.getSecure('user_data');
  }

  // Store payment details temporarily
  setPaymentData(paymentData) {
    return this.setSecure('payment_data', paymentData);
  }

  // Get payment data
  getPaymentData() {
    return this.getSecure('payment_data');
  }

  // Clear payment data after use
  clearPaymentData() {
    return this.removeSecure('payment_data');
  }
}

// Initialize global secure storage
const secureStorage = new SecureStorage();

// Helper function to get CSRF token
async function getCSRFToken() {
  try {
    const response = await fetch('/api/auth/csrf-token', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Failed to get CSRF token');
    
    const data = await response.json();
    secureStorage.setSecure('csrf_token', data.token);
    secureStorage.setSecure('csrf_sessionId', data.sessionId);
    
    return data.token;
  } catch (error) {
    console.error('CSRF token error:', error);
    return null;
  }
}

// Helper to add CSRF token to requests
function addCSRFHeader(headers = {}) {
  const csrf = secureStorage.getSecure('csrf_token');
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }
  return headers;
}

console.log('✅ Secure storage initialized with encryption enabled');
