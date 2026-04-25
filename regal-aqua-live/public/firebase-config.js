// ============================================
// REGAL AQUA - FIREBASE CONFIGURATION
// ============================================
// Firebase Configuration with REAL API Keys
// This file initializes Firebase for all pages

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCtGlV5OwqLPbLLnQ2XhBFuo4lcOsQ9ZMw",
  authDomain: "regal-aqua.firebaseapp.com",
  databaseURL: "https://regal-aqua-default-rtdb.firebaseio.com",
  projectId: "regal-aqua",
  storageBucket: "regal-aqua.firebasestorage.app",
  messagingSenderId: "429452940813",
  appId: "1:429452940813:web:23aa6e1cdfbe0fd2796744",
  measurementId: "G-EV4JTFB8EJ"
};

function loadFirebaseConfig() {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
    
    try {
      window.auth = firebase.auth();
      window.database = firebase.database();
      
      // Set persistence to LOCAL so users stay logged in
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch((error) => {
          console.error('Firebase persistence error:', error);
        });
      
      console.log('✅ Firebase initialized successfully');
    } catch (e) {
      console.error('Firebase services initialization error:', e);
    }
  } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
    try {
      window.auth = firebase.auth();
      window.database = firebase.database();
    } catch (e) {
      console.error('Firebase services error:', e);
    }
  }
}

// Global Firebase error handler
window.handleFirebaseError = (error) => {
  const errorCode = error.code || 'unknown';
  const errorMessage = error.message || 'An error occurred';
  
  const friendlyMessages = {
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups.',
    'auth/unauthorized-domain': 'This domain is not authorized for Firebase.',
    'auth/invalid-api-key': 'Invalid Firebase API key.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'database/permission-denied': 'Permission denied. Please log in again.'
  };
  
  return friendlyMessages[errorCode] || errorMessage;
};

// Auto-initialize Firebase
if (typeof window !== 'undefined') {
  function tryInit() {
    if (typeof firebase !== 'undefined') {
      loadFirebaseConfig();
    }
  }

  if (typeof firebase === 'undefined') {
    window.addEventListener('DOMContentLoaded', tryInit, { once: true });
  } else {
    tryInit();
  }
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FIREBASE_CONFIG;
}
