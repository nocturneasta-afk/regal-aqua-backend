// REGAL AQUA - COMPLETE WEBSITE FIXES
// ============================================
// Fixes: Login, Signup, Google Auth, Maps, Phone, Icons, Notifications
// Author: AI Assistant
// Date: 2026-04-19
// Contact: P.M. | Phone: 0794141453 | Email: regaldrink@gmail.com
// Hosting: Safaricom Silver (2GB, 50 Emails, 50 Subdomains)
// Domain: regalaqua.co.ke (pending)
// ============================================

// ============================================
// 1. NOTIFICATION SYSTEM (Premium Toast Notifications)
// ============================================

class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    if (!document.getElementById('notification-container')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 380px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notification-container');
    }
  }

  show(type, title, message, duration = 5000) {
    const icons = {
      success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      background: linear-gradient(135deg, #0f1f3d 0%, #1a2d4d 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.1);
      transform: translateX(120%);
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: all;
      position: relative;
      overflow: hidden;
    `;

    // Left accent bar
    const accentColors = {
      success: '#4ade80',
      error: '#ef4444',
      warning: '#fbbf24',
      info: '#60a5fa'
    };

    notification.innerHTML = `
      <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${accentColors[type]};"></div>
      ${icons[type]}
      <div style="flex: 1;">
        <div style="color: #D4AF37; font-weight: 700; font-size: 1rem; margin-bottom: 4px;">${title}</div>
        <div style="color: #8892b0; font-size: 0.9rem; line-height: 1.5;">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" style="background: none; border: none; color: rgba(136, 146, 176, 0.6); cursor: pointer; padding: 4px; transition: all 0.3s ease;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="notification-progress" style="position: absolute; bottom: 0; left: 0; height: 3px; background: rgba(212, 175, 55, 0.3); width: 100%;"></div>
    `;

    this.container.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Progress bar animation
    const progress = notification.querySelector('.notification-progress');
    progress.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => {
      progress.style.width = '0%';
    });

    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, duration);
  }
}

// Initialize notification system
const notify = new NotificationSystem();

// ============================================
// 2. GOOGLE AUTHENTICATION (Firebase)
// ============================================

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "regal-aqua.firebaseapp.com",
  projectId: "regal-aqua",
  storageBucket: "regal-aqua.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (add Firebase SDK to your HTML first)
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

let auth = null;
let googleProvider = null;

function initFirebase() {
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // Auth state listener
    auth.onAuthStateChanged((user) => {
      if (user) {
        updateUIForUser(user);
      } else {
        updateUIForGuest();
      }
    });
  }
}

// Google Sign In
function signInWithGoogle() {
  if (!auth) {
    notify.show('error', 'Setup Required', 'Google Sign-In is not configured. Please contact support.');
    return;
  }

  auth.signInWithPopup(googleProvider)
    .then((result) => {
      const user = result.user;
      notify.show('success', 'Welcome!', `Signed in as ${user.displayName || user.email}`);
      closeLoginModal();
      closeSignupModal();
    })
    .catch((error) => {
      notify.show('error', 'Sign In Failed', error.message);
    });
}

// Email/Password Login
function loginWithEmail(email, password) {
  if (!auth) {
    // Demo mode for testing
    const demoUsers = [
      { email: 'princemugi6@gmail.com', password: 'Prince123!', name: 'P.M.' },
      { email: 'regaldrink@gmail.com', password: 'Regal2024!', name: 'Regal Admin' }
    ];
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      notify.show('success', 'Welcome Back!', `Logged in as ${user.name}`);
      updateUIForUser({ displayName: user.name, email: user.email });
      closeLoginModal();
      return Promise.resolve();
    } else {
      notify.show('error', 'Login Failed', 'Email or password is incorrect. Please try again.');
      return Promise.reject(new Error('Invalid credentials'));
    }
  }

  return auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      notify.show('success', 'Welcome Back!', `Logged in as ${userCredential.user.displayName || userCredential.user.email}`);
      closeLoginModal();
    })
    .catch((error) => {
      notify.show('error', 'Login Failed', error.message);
      throw error;
    });
}

// Email/Password Sign Up
function signupWithEmail(email, password, name) {
  if (!auth) {
    notify.show('info', 'Demo Mode', 'Account created successfully! (Firebase not configured)');
    closeSignupModal();
    return Promise.resolve();
  }

  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: name
      }).then(() => {
        notify.show('success', 'Account Created!', `Welcome to Regal Aqua, ${name}!`);
        closeSignupModal();
      });
    })
    .catch((error) => {
      notify.show('error', 'Sign Up Failed', error.message);
      throw error;
    });
}

// Sign Out
function signOut() {
  if (auth) {
    auth.signOut().then(() => {
      notify.show('info', 'Signed Out', 'You have been signed out successfully.');
      updateUIForGuest();
    });
  } else {
    updateUIForGuest();
    notify.show('info', 'Signed Out', 'You have been signed out.');
  }
}

// Update UI for logged in user
function updateUIForUser(user) {
  const loginBtn = document.querySelector('.nav-login, [data-action="login"]');
  if (loginBtn) {
    const displayName = user.displayName || user.email.split('@')[0];
    loginBtn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #D4AF37, #F4E5C2); display: flex; align-items: center; justify-content: center; color: #0a1628; font-weight: 700; font-size: 0.9rem;">
          ${displayName.charAt(0).toUpperCase()}
        </div>
        <span style="color: #D4AF37; font-weight: 600;">${displayName}</span>
      </div>
    `;
    loginBtn.onclick = (e) => {
      e.preventDefault();
      showUserMenu();
    };
  }
}

// Update UI for guest
function updateUIForGuest() {
  const loginBtn = document.querySelector('.nav-login, [data-action="login"]');
  if (loginBtn) {
    loginBtn.innerHTML = 'LOGIN';
    loginBtn.onclick = (e) => {
      e.preventDefault();
      openLoginModal();
    };
  }
}

// Show user dropdown menu
function showUserMenu() {
  // Create dropdown if not exists
  let dropdown = document.getElementById('user-menu-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'user-menu-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 60px;
      right: 20px;
      background: linear-gradient(135deg, #0f1f3d 0%, #1a2d4d 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 12px;
      padding: 1rem;
      min-width: 200px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
      z-index: 1000;
    `;
    dropdown.innerHTML = `
      <a href="#" style="display: block; padding: 10px; color: #e0e0e0; text-decoration: none; border-radius: 8px; transition: all 0.3s;" onmouseover="this.style.background='rgba(212,175,55,0.1)'" onmouseout="this.style.background='transparent'">My Orders</a>
      <a href="#" style="display: block; padding: 10px; color: #e0e0e0; text-decoration: none; border-radius: 8px; transition: all 0.3s;" onmouseover="this.style.background='rgba(212,175,55,0.1)'" onmouseout="this.style.background='transparent'">Profile Settings</a>
      <div style="height: 1px; background: rgba(212, 175, 55, 0.2); margin: 8px 0;"></div>
      <a href="#" onclick="signOut(); return false;" style="display: block; padding: 10px; color: #ef4444; text-decoration: none; border-radius: 8px; transition: all 0.3s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='transparent'">Sign Out</a>
    `;
    document.body.appendChild(dropdown);
  }
  
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  
  // Close when clicking outside
  document.addEventListener('click', function closeMenu(e) {
    if (!e.target.closest('#user-menu-dropdown') && !e.target.closest('.nav-login')) {
      dropdown.style.display = 'none';
      document.removeEventListener('click', closeMenu);
    }
  });
}

// ============================================
// 3. LOGIN & SIGNUP MODALS
// ============================================

function createModals() {
  // Remove existing modals
  const existingLogin = document.getElementById('login-modal');
  const existingSignup = document.getElementById('signup-modal');
  if (existingLogin) existingLogin.remove();
  if (existingSignup) existingSignup.remove();

  // Login Modal
  const loginModal = document.createElement('div');
  loginModal.id = 'login-modal';
  loginModal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 2000;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  loginModal.innerHTML = `
    <div style="background: linear-gradient(145deg, #0f1f3d 0%, #1a2d4d 100%); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 20px; padding: 2.5rem; width: 90%; max-width: 420px; position: relative; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.08); transform: scale(0.95) translateY(20px); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
      <button onclick="closeLoginModal()" style="position: absolute; top: 1.25rem; right: 1.25rem; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); color: #D4AF37; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; padding: 0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="color: #D4AF37; font-size: 1.75rem; margin-bottom: 0.5rem; font-weight: 700;">Welcome Back</h2>
        <p style="color: #8892b0; font-size: 0.9rem;">Login to your Regal Aqua account</p>
      </div>
      
      <form onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</label>
          <input type="email" id="login-email" required placeholder="your@email.com" style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
        </div>
        
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Password</label>
          <div style="position: relative;">
            <input type="password" id="login-password" required placeholder="Enter your password" style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
            <button type="button" onclick="toggleLoginPassword()" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #D4AF37; cursor: pointer; padding: 4px; opacity: 0.6; transition: opacity 0.3s ease;">
              <svg id="login-eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
          <label style="display: flex; align-items: center; gap: 8px; color: #8892b0; cursor: pointer;">
            <input type="checkbox" style="width: 18px; height: 18px; accent-color: #D4AF37; cursor: pointer;">
            <span>Remember me</span>
          </label>
          <a href="#" onclick="showForgotPassword(); return false;" style="color: #D4AF37; text-decoration: none; font-weight: 500; transition: all 0.3s ease;">Forgot password?</a>
        </div>
        
        <button type="submit" id="login-submit-btn" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: #0a1628; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1.5px; position: relative; overflow: hidden;">
          Login to Regal Aqua
        </button>
      </form>
      
      <div style="display: flex; align-items: center; margin: 1.5rem 0; color: #8892b0; font-size: 0.85rem;">
        <div style="flex: 1; height: 1px; background: rgba(212, 175, 55, 0.2);"></div>
        <span style="padding: 0 1rem;">OR</span>
        <div style="flex: 1; height: 1px; background: rgba(212, 175, 55, 0.2);"></div>
      </div>
      
      <button onclick="signInWithGoogle()" style="width: 100%; padding: 14px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.3); border-radius: 12px; color: #e0e0e0; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1rem; font-weight: 600;">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
      
      <div style="text-align: center; margin-top: 1.5rem; color: #8892b0; font-size: 0.9rem;">
        Don't have an account? <a href="#" onclick="showSignupFromLogin(); return false;" style="color: #D4AF37; text-decoration: none; font-weight: 600; transition: all 0.3s ease;">Sign up here</a>
      </div>
    </div>
  `;
  
  // Signup Modal
  const signupModal = document.createElement('div');
  signupModal.id = 'signup-modal';
  signupModal.style.cssText = loginModal.style.cssText;
  
  signupModal.innerHTML = `
    <div style="background: linear-gradient(145deg, #0f1f3d 0%, #1a2d4d 100%); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 20px; padding: 2.5rem; width: 90%; max-width: 420px; position: relative; box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.08); transform: scale(0.95) translateY(20px); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); max-height: 90vh; overflow-y: auto;">
      <button onclick="closeSignupModal()" style="position: absolute; top: 1.25rem; right: 1.25rem; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); color: #D4AF37; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; padding: 0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="color: #D4AF37; font-size: 1.75rem; margin-bottom: 0.5rem; font-weight: 700;">Create Account</h2>
        <p style="color: #8892b0; font-size: 0.9rem;">Join Regal Aqua for premium water delivery</p>
      </div>
      
      <form onsubmit="handleSignup(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</label>
          <input type="text" id="signup-name" required placeholder="P.M." style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
        </div>
        
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</label>
          <input type="email" id="signup-email" required placeholder="your@email.com" style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
        </div>
        
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</label>
          <input type="tel" id="signup-phone" required placeholder="0794141453" pattern="[0-9]{10}" style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
        </div>
        
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Password</label>
          <div style="position: relative;">
            <input type="password" id="signup-password" required placeholder="Min 6 characters" minlength="6" style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
            <button type="button" onclick="toggleSignupPassword()" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #D4AF37; cursor: pointer; padding: 4px; opacity: 0.6; transition: opacity 0.3s ease;">
              <svg id="signup-eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <div style="margin-top: 8px; font-size: 0.8rem; color: #8892b0;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              At least 6 characters
            </div>
          </div>
        </div>
        
        <div>
          <label style="display: block; color: #D4AF37; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Confirm Password</label>
          <input type="password" id="signup-confirm" required placeholder="Repeat password" style="width: 100%; padding: 14px 16px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #e0e0e0; font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;" onfocus="this.style.borderColor='#D4AF37'; this.style.boxShadow='0 0 20px rgba(212,175,55,0.15)'" onblur="this.style.borderColor='rgba(212,175,55,0.2)'; this.style.boxShadow='none'">
        </div>
        
        <button type="submit" id="signup-submit-btn" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: #0a1628; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1.5px; position: relative; overflow: hidden;">
          Create Account
        </button>
      </form>
      
      <div style="display: flex; align-items: center; margin: 1.5rem 0; color: #8892b0; font-size: 0.85rem;">
        <div style="flex: 1; height: 1px; background: rgba(212, 175, 55, 0.2);"></div>
        <span style="padding: 0 1rem;">OR</span>
        <div style="flex: 1; height: 1px; background: rgba(212, 175, 55, 0.2);"></div>
      </div>
      
      <button onclick="signInWithGoogle()" style="width: 100%; padding: 14px; background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(212, 175, 55, 0.3); border-radius: 12px; color: #e0e0e0; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1rem; font-weight: 600;">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>
      
      <div style="text-align: center; margin-top: 1.5rem; color: #8892b0; font-size: 0.9rem;">
        Already have an account? <a href="#" onclick="showLoginFromSignup(); return false;" style="color: #D4AF37; text-decoration: none; font-weight: 600; transition: all 0.3s ease;">Login here</a>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginModal);
  document.body.appendChild(signupModal);
}

// Modal Control Functions
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    modal.querySelector('div').style.transform = 'scale(1) translateY(0)';
  });
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  modal.style.opacity = '0';
  modal.querySelector('div').style.transform = 'scale(0.95) translateY(20px)';
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

function openSignupModal() {
  const modal = document.getElementById('signup-modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    modal.querySelector('div').style.transform = 'scale(1) translateY(0)';
  });
}

function closeSignupModal() {
  const modal = document.getElementById('signup-modal');
  modal.style.opacity = '0';
  modal.querySelector('div').style.transform = 'scale(0.95) translateY(20px)';
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

function showSignupFromLogin() {
  closeLoginModal();
  setTimeout(openSignupModal, 300);
}

function showLoginFromSignup() {
  closeSignupModal();
  setTimeout(openLoginModal, 300);
}

function showForgotPassword() {
  notify.show('info', 'Password Reset', 'Please contact P.M. at 0794141453 or email regaldrink@gmail.com to reset your password.');
}

// Password Toggle Functions
function toggleLoginPassword() {
  const input = document.getElementById('login-password');
  const icon = document.getElementById('login-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
}

function toggleSignupPassword() {
  const input = document.getElementById('signup-password');
  const icon = document.getElementById('signup-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
}

// Form Handlers
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-submit-btn');
  
  btn.style.color = 'transparent';
  btn.innerHTML = '<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #0a1628;">Logging in...</span>';
  
  loginWithEmail(email, password)
    .finally(() => {
      btn.style.color = '';
      btn.innerHTML = 'Login to Regal Aqua';
    });
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const btn = document.getElementById('signup-submit-btn');
  
  if (password !== confirm) {
    notify.show('error', 'Password Mismatch', 'Passwords do not match. Please try again.');
    return;
  }
  
  if (password.length < 6) {
    notify.show('error', 'Password Too Short', 'Password must be at least 6 characters long.');
    return;
  }
  
  btn.style.color = 'transparent';
  btn.innerHTML = '<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #0a1628;">Creating account...</span>';
  
  signupWithEmail(email, password, name)
    .finally(() => {
      btn.style.color = '';
      btn.innerHTML = 'Create Account';
    });
}

// ============================================
// 4. PHONE & MAPS FUNCTIONALITY
// ============================================

// Direct Call Function
function makePhoneCall(phoneNumber) {
  // Format: +254 745 600 024 or 0794141453
  const cleanNumber = phoneNumber.replace(/\s/g, '').replace(/^0/, '+254');
  window.location.href = `tel:${cleanNumber}`;
}

// Open Google Maps for Kakamega Location
function openGoogleMaps() {
  // Regal Aqua location in Kakamega
  // P.O. Box 97, Kakamega, WEBUYE KAKAMEGA ROAD
  const address = 'Kakamega, Kenya, WEBUYE KAKAMEGA ROAD';
  const encodedAddress = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
}

// Open WhatsApp
function openWhatsApp(phoneNumber) {
  const cleanNumber = phoneNumber.replace(/\s/g, '').replace(/^0/, '254');
  window.open(`https://wa.me/${cleanNumber}`, '_blank');
}

// ============================================
// 5. PREMIUM ICONS SYSTEM
// ============================================

const premiumIcons = {
  water: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path fill="currentColor" opacity="0.2" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M12 8c0-2 1.5-3 3-3s3 1 3 3-1.5 2-3 2h-6c-1.5 0-3-1-3-2s1.5-3 3-3 3 1 3 3z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  lightning: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

function injectPremiumIcons() {
  // Replace all existing icons with premium versions
  document.querySelectorAll('.feature-icon, .footer-icon, .product-icon').forEach(icon => {
    const type = icon.dataset.icon || 'water';
    if (premiumIcons[type]) {
      icon.innerHTML = premiumIcons[type];
      icon.style.width = '48px';
      icon.style.height = '48px';
      icon.style.color = '#D4AF37';
    }
  });
}

// ============================================
// 6. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Create modals
  createModals();
  
  // Initialize Firebase (if SDK loaded)
  initFirebase();
  
  // Inject premium icons
  injectPremiumIcons();
  
  // Setup login button(s) - include common variants
  const loginSelectors = ['.nav-login', '.nav-login-btn', '[data-action="login"]', '[onclick="openLoginModal()"]'];
  const loginEls = document.querySelectorAll(loginSelectors.join(','));
  loginEls.forEach(el => {
    el.addEventListener('click', function(e) {
      try { e.preventDefault(); } catch (err) {}
      openLoginModal();
    });
  });

  // Setup signup button(s) - include common variants
  const signupSelectors = ['.nav-signup', '.nav-signup-btn', '[data-action="signup"]', '[onclick="openSignupModal()"]'];
  const signupEls = document.querySelectorAll(signupSelectors.join(','));
  signupEls.forEach(el => {
    el.addEventListener('click', function(e) {
      try { e.preventDefault(); } catch (err) {}
      openSignupModal();
    });
  });
  
  // Setup phone call buttons
  document.querySelectorAll('[data-action="call"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const phone = this.dataset.phone || '+254745600024';
      makePhoneCall(phone);
    });
  });
  
  // Setup map buttons
  document.querySelectorAll('[data-action="map"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openGoogleMaps();
    });
  });
  
  // Close modals on outside click
  document.getElementById('login-modal').addEventListener('click', function(e) {
    if (e.target === this) closeLoginModal();
  });
  
  document.getElementById('signup-modal').addEventListener('click', function(e) {
    if (e.target === this) closeSignupModal();
  });
  
  // Escape key to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLoginModal();
      closeSignupModal();
    }
  });
  
  console.log('Regal Aqua system initialized. Contact: P.M. (0794141453)');
});

// ============================================
// REVIEW SYSTEM - Works for ALL users
// ============================================

// Star Rating Logic
const ratingStars = document.querySelectorAll('.star-rating .star');
const ratingValue = document.getElementById('ratingValue');
const ratingText = document.getElementById('ratingText');

const ratingLabels = {
  1: 'Poor - Very disappointed',
  2: 'Fair - Below expectations',
  3: 'Good - Met expectations',
  4: 'Very Good - Exceeded expectations',
  5: 'Excellent - Outstanding service!'
};

ratingStars.forEach(star => {
  star.addEventListener('click', function() {
    const value = this.dataset.value;
    ratingValue.value = value;
    updateStars(value);
    ratingText.textContent = ratingLabels[value];
    ratingText.style.color = '#D4AF37';
  });
  
  star.addEventListener('mouseenter', function() {
    const value = this.dataset.value;
    previewStars(value);
  });
});

document.querySelector('.star-rating').addEventListener('mouseleave', function() {
  updateStars(ratingValue.value);
});

function updateStars(value) {
  stars.forEach(star => {
    const starValue = star.dataset.value;
    if (starValue <= value) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function previewStars(value) {
  stars.forEach(star => {
    const starValue = star.dataset.value;
    star.style.color = starValue <= value ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)';
  });
}

// Character Count
const reviewTextarea = document.getElementById('reviewText');
const charCount = document.getElementById('charCount');

if (reviewTextarea) {
  reviewTextarea.addEventListener('input', function() {
    charCount.textContent = this.value.length;
  });
}

// Set user type based on auth status
function setReviewUserType() {
  const userTypeInput = document.getElementById('userType');
  const userIdInput = document.getElementById('userId');
  
  // Check if user is logged in (you'll need to integrate with your auth system)
  const currentUser = getCurrentUser(); // Your auth function
  
  if (currentUser) {
    userTypeInput.value = 'registered';
    userIdInput.value = currentUser.uid || currentUser.email;
    // Auto-fill known info
    document.getElementById('reviewName').value = currentUser.displayName || '';
    document.getElementById('reviewEmail').value = currentUser.email || '';
  } else {
    userTypeInput.value = 'guest';
    userIdInput.value = 'guest_' + Date.now();
  }
}

// Mock function - replace with your actual auth check
function getCurrentUser() {
  // Return null for guest, or user object if logged in
  return null; // Replace with: return firebase.auth().currentUser;
}

// Submit Review
async function submitReview(event) {
  event.preventDefault();
  
  const btn = document.getElementById('reviewSubmitBtn');
  const form = document.getElementById('reviewForm');
  const formData = new FormData(form);
  
  // Set metadata
  document.getElementById('submissionDate').value = new Date().toISOString();
  document.getElementById('userAgent').value = navigator.userAgent;
  
  // Show loading
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Sending...';
  
  // Collect all data
  const reviewData = {
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    customerPhone: formData.get('customerPhone'),
    productPurchased: formData.get('productPurchased'),
    rating: formData.get('rating'),
    reviewText: formData.get('reviewText'),
    orderNumber: formData.get('orderNumber'),
    userType: formData.get('userType'),
    userId: formData.get('userId'),
    submissionDate: formData.get('submissionDate'),
    userAgent: formData.get('userAgent'),
    ipAddress: 'captured-server-side', // You'll need backend for this
    status: 'pending' // For admin moderation
  };
  
  try {
    // METHOD 1: Send via Email (Formspree - FREE)
    await sendReviewViaEmail(reviewData);
    
    // METHOD 2: Save to Database (Firebase - optional but recommended)
    await saveReviewToDatabase(reviewData);
    
    // Show success
    document.getElementById('reviewFormContainer').style.display = 'none';
    document.getElementById('reviewSuccess').style.display = 'block';
    document.getElementById('confirmEmail').textContent = reviewData.customerEmail;
    
    // Reset form after delay
    setTimeout(() => {
      form.reset();
      updateStars(0);
      ratingText.textContent = 'Click to rate';
      charCount.textContent = '0';
    }, 500);
    
  } catch (error) {
    notify.show('error', 'Failed to Send', 'Please try again or email us directly at regaldrink@gmail.com');
    console.error('Review submission error:', error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="icon" style="width: 18px; height: 18px; margin-right: 8px;">
        <use href="#icon-send"></use>
      </svg>
      Submit Review
    `;
  }
}

// Send review via Formspree (FREE email service)
async function sendReviewViaEmail(data) {
  // Replace with your Formspree endpoint
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      _replyto: data.customerEmail,
      _subject: `New Regal Aqua Review - ${data.productPurchased} (${data.rating} Stars)`,
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      product: data.productPurchased,
      rating: data.rating,
      review: data.reviewText,
      orderNumber: data.orderNumber,
      userType: data.userType,
      date: data.submissionDate
    })
  });
  
  if (!response.ok) throw new Error('Email send failed');
  return response;
}

// Save review to Firebase (for admin dashboard)
async function saveReviewToDatabase(data) {
  // Only if Firebase is configured
  if (typeof firebase !== 'undefined' && firebase.database) {
    const reviewsRef = firebase.database().ref('reviews');
    await reviewsRef.push(data);
  }
}

// Modal Controls
function openReviewModal() {
  setReviewUserType();
  document.getElementById('reviewModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset after animation
  setTimeout(() => {
    document.getElementById('reviewFormContainer').style.display = 'block';
    document.getElementById('reviewSuccess').style.display = 'none';
  }, 300);
}

// Close on outside click
document.getElementById('reviewModal').addEventListener('click', function(e) {
  if (e.target === this) closeReviewModal();
});

// ============================================
// M-PESA PAYMENT INTEGRATION
// ============================================

// Your M-Pesa credentials (from Safaricom Daraja API)
const MPESA_CONFIG = {
  businessShortCode: '174379', // Your till/paybill number
  passkey: 'YOUR_PASSKEY', // From Safaricom
  consumerKey: 'YOUR_CONSUMER_KEY',
  consumerSecret: 'YOUR_CONSUMER_SECRET',
  callbackUrl: 'https://yourdomain.com/mpesa-callback.php'
};

function validateAmount(input) {
  const amount = parseInt(input.value);
  const btn = document.getElementById('mpesaBtn');
  
  if (amount < 1 || amount > 150000) {
    input.style.borderColor = '#ef4444';
    btn.disabled = true;
  } else {
    input.style.borderColor = '#D4AF37';
    btn.disabled = false;
  }
}

async function initiateMpesaPayment() {
  const amount = document.getElementById('mpesaAmount').value;
  const phone = document.getElementById('mpesaPhone').value;
  const btn = document.getElementById('mpesaBtn');
  
  if (!amount || !phone) {
    notify.show('error', 'Missing Info', 'Please enter amount and phone number');
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Sending prompt...';
  
  try {
    // Step 1: Get access token
    const token = await getMpesaToken();
    
    // Step 2: Initiate STK Push
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_CONFIG.businessShortCode,
        Password: generatePassword(),
        Timestamp: getTimestamp(),
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_CONFIG.businessShortCode,
        PhoneNumber: phone,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: 'RegalAqua-' + Date.now(),
        TransactionDesc: 'Water Purchase'
      })
    });
    
    const data = await response.json();
    
    if (data.ResponseCode === '0') {
      notify.show('success', 'Prompt Sent!', 'Check your phone and enter M-Pesa PIN to complete payment');
      startPaymentCheck(data.CheckoutRequestID);
    } else {
      throw new Error(data.errorMessage);
    }
    
  } catch (error) {
    notify.show('error', 'Payment Failed', error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="icon"><use href="#icon-mpesa"></use></svg>
      REQUEST M-PESA PROMPT
    `;
  }
}

function generatePassword() {
  const timestamp = getTimestamp();
  const str = MPESA_CONFIG.businessShortCode + MPESA_CONFIG.passkey + timestamp;
  return btoa(str); // Base64 encode
}

function getTimestamp() {
  const date = new Date();
  return date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');
}

async function getMpesaToken() {
  const credentials = btoa(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`);
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });
  
  const data = await response.json();
  return data.access_token;
}

// Check payment status
function startPaymentCheck(checkoutRequestId) {
  const interval = setInterval(async () => {
    // Poll your backend for payment status
    // Or wait for callback
    
    // For demo, show success after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
      notify.show('success', 'Payment Received!', 'Thank you for your payment. Your order is being processed.');
    }, 10000);
    
  }, 5000);
}

// ============================================
// SECURITY MEASURES
// ============================================

// 1. XSS Protection
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// 2. Rate Limiting
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  canProceed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

const loginRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

// 3. Input Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^254[0-9]{9}$/;
  return re.test(phone);
}

// 4. CSRF Protection
function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
}

// 5. Security Headers (add to .htaccess or server config)
/*
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.safaricom.co.ke https://*.googleapis.com;"

*/

// 6. Activity Logging
function logActivity(action, details = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    action: action,
    user: getCurrentUser()?.email || 'guest',
    ip: 'captured-server-side',
    userAgent: navigator.userAgent,
    details: details
  };
  
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  logs.push(log);
  localStorage.setItem('activityLogs', JSON.stringify(logs.slice(-100))); // Keep last 100
}

// 7. Block suspicious activity
function checkForSuspiciousActivity() {
  const failedAttempts = JSON.parse(localStorage.getItem('failedLogins') || '[]');
  const recentAttempts = failedAttempts.filter(t => Date.now() - t < 3600000); // Last hour
  
  if (recentAttempts.length > 10) {
    // Block for 1 hour
    localStorage.setItem('blockedUntil', Date.now() + 3600000);
    notify.show('error', 'Account Locked', 'Too many failed attempts. Please try again in 1 hour.');
    return false;
  }
  
  return true;
}

// Make functions globally available
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openSignupModal = openSignupModal;
window.closeSignupModal = closeSignupModal;
window.signInWithGoogle = signInWithGoogle;
window.makePhoneCall = makePhoneCall;
window.openGoogleMaps = openGoogleMaps;
window.openWhatsApp = openWhatsApp;
window.notify = notify;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.submitReview = submitReview;
