// ============================================
// REGAL AQUA - ALL BUTTON FIXES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Initializing button fixes...');
    
  // Initialize all button handlers
  initNavButtons();
  initHeroButtons();
  initProductButtons();
  initCartButtons();
  initReviewButtons();
  initMapButtons();
  initFooterButtons();
  initModalButtons();
  initPaymentButtons();
  initAuthButtons();
    
  console.log('✅ All buttons initialized');
});

// ============================================
// 1. NAVIGATION BUTTONS
// ============================================

function initNavButtons() {
  // Login button
  const loginBtn = document.querySelector('.nav-login, #navLoginBtn, [href="login.html"]');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔑 Login clicked');
      window.location.href = 'login.html';
    });
  }
    
  // Signup button (if exists in nav)
  const signupBtn = document.querySelector('.nav-signup, #navSignupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📝 Signup clicked');
      window.location.href = 'signup.html';
    });
  }
    
  // Cart icon
  const cartBtn = document.querySelector('.nav-cart, .cart-icon, [href="cart.html"]');
  if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🛒 Cart clicked');
      window.location.href = 'cart.html';
    });
  }
    
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle, .hamburger, .mobile-menu-btn');
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📱 Menu toggle clicked');
      const navLinks = document.querySelector('.nav-links, .mobile-nav');
      if (navLinks) {
        navLinks.classList.toggle('active');
      }
    });
  }
}

// ============================================
// 2. HERO SECTION BUTTONS
// ============================================

function initHeroButtons() {
  // Order Now button
  const orderNowBtn = document.querySelector('.btn-hero-primary, .hero .btn-primary, [href="#products"]');
  if (orderNowBtn) {
    orderNowBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🛍️ Order Now clicked');
      const productsSection = document.getElementById('products') || document.querySelector('.products, [class*="product"]');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
    
  // Phone/Call button in hero
  const heroPhoneBtn = document.querySelector('.btn-hero-secondary, .hero .btn-secondary');
  if (heroPhoneBtn) {
    heroPhoneBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📞 Hero phone clicked');
      window.location.href = 'tel:+254745600024';
    });
  }
}

// ============================================
// 3. PRODUCT CARD BUTTONS
// ============================================

function initProductButtons() {
  // Buy Now buttons
  document.querySelectorAll('.btn-buy, .buy-now, [class*="buy"]').forEach(btn => {
    if (btn.hasAttribute('onclick')) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
            
      const card = this.closest('.product-card, [class*="product"]');
      const productId = card?.dataset?.product || card?.id || 'unknown';
      const productName = card?.querySelector('h3, .product-name')?.textContent || 'Product';
            
      console.log('💰 Buy Now:', productId);
            
      // Add to cart and go to checkout
      addToLocalCart(productId);
      window.location.href = 'payment.html';
    });
  });
    
  // Add to Cart buttons (plus icons)
  document.querySelectorAll('.btn-cart, .btn-icon, .add-to-cart, [class*="cart"]').forEach(btn => {
    // Skip if it's a buy button or explicitly handled inline
    if (btn.classList.contains('btn-buy') || btn.hasAttribute('onclick')) return;
        
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
            
      const card = this.closest('.product-card, [class*="product"]');
      const productId = card?.dataset?.product || 'unknown';
      const productName = card?.querySelector('h3, .product-name')?.textContent || 'Product';
            
      console.log('🛒 Add to cart:', productId);
            
      addToLocalCart(productId);
            
      // Visual feedback
      this.style.transform = 'scale(1.2)';
      setTimeout(() => this.style.transform = 'scale(1)', 200);
    });
  });
    
  // Request Quote buttons (for industrial products)
  document.querySelectorAll('.btn-request-quote, .request-quote, [class*="quote"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📋 Quote requested');
      openQuoteModal();
    });
  });
}

// ============================================
// 4. CART BUTTONS
// ============================================

function initCartButtons() {
  // Quantity increase
  document.querySelectorAll('.qty-increase, .plus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input, .qty-value');
      if (input) {
        let val = parseInt(input.value) || 0;
        input.value = val + 1;
        updateCartTotal();
      }
    });
  });
    
  // Quantity decrease
  document.querySelectorAll('.qty-decrease, .minus-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input, .qty-value');
      if (input) {
        let val = parseInt(input.value) || 0;
        if (val > 1) input.value = val - 1;
        updateCartTotal();
      }
    });
  });
    
  // Remove item
  document.querySelectorAll('.remove-item, .delete-item, .cart-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.cart-item');
      if (item) {
        item.remove();
        updateCartTotal();
        updateCartCount();
      }
    });
  });
    
  // Checkout button
  const checkoutBtn = document.querySelector('.btn-checkout, .checkout-btn, [href="payment.html"]');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('💳 Checkout clicked');
      window.location.href = 'payment.html';
    });
  }
    
  // Continue shopping
  const continueBtn = document.querySelector('.btn-continue, .continue-shopping');
  if (continueBtn) {
    continueBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html#products';
    });
  }
}

// ============================================
// 5. REVIEW BUTTONS
// ============================================

function initReviewButtons() {
  // Write Review button
  const writeReviewBtn = document.querySelector('.btn-review, .write-review, #writeReviewBtn');
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('⭐ Write review clicked');
      openReviewModal();
    });
  }
    
  // Star rating in review form
  document.querySelectorAll('.star-rating .star, .rating-star').forEach(star => {
    star.addEventListener('click', function() {
      const rating = this.dataset.value || this.dataset.rating;
      document.getElementById('ratingValue').value = rating;
            
      // Update visual
      this.parentElement.querySelectorAll('.star, .rating-star').forEach(s => {
        const sVal = s.dataset.value || s.dataset.rating;
        s.style.color = sVal <= rating ? '#D4AF37' : 'rgba(212,175,55,0.3)';
      });
    });
  });
    
  // Submit review
  const submitReviewBtn = document.querySelector('#reviewSubmitBtn, .submit-review');
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener('click', function(e) {
      e.preventDefault();
      submitReview(e);
    });
  }
}

// ============================================
// 6. MAP BUTTONS
// ============================================

function initMapButtons() {
  // Get Directions
  document.querySelectorAll('.btn-directions, .get-directions, [class*="direction"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🗺️ Directions clicked');
      window.open('https://www.google.com/maps/dir/?api=1&destination=Kakamega,Kenya', '_blank');
    });
  });
    
  // Open in Google Maps
  document.querySelectorAll('.btn-maps, .open-maps, [class*="open-map"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🗺️ Open maps clicked');
      window.open('https://maps.google.com/?q=Kakamega,Kenya', '_blank');
    });
  });
    
  // Use GPS / My Location
  document.querySelectorAll('.btn-gps, .use-gps, .my-location, [class*="gps"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📍 GPS clicked');
      useGPS();
    });
  });
}

// ============================================
// 7. FOOTER BUTTONS
// ============================================

function initFooterButtons() {
  // Email links
  document.querySelectorAll('.footer-email, a[href^="mailto:"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      console.log('✉️ Footer email clicked');
      window.location.href = href || 'mailto:regaldrink@gmail.com';
    });
  });

  // Phone links
  document.querySelectorAll('.footer-phone, a[href^="tel:"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      console.log('📞 Footer phone clicked');
      window.location.href = href || 'tel:+254745600024';
    });
  });

  // Location / Maps links
  document.querySelectorAll('.footer-location, .footer-maps, a[href*="google.com/maps"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📍 Footer location clicked');
      const href = this.getAttribute('href');
      window.open(href || 'https://www.google.com/maps/dir/?api=1&destination=Kakamega,Kenya', '_blank');
    });
  });

  // Price list buttons
  document.querySelectorAll('.footer-price, .view-price-list').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('💰 Price list clicked');
      if (typeof openPriceListModal === 'function') {
        openPriceListModal();
      } else if (typeof openPriceModal === 'function') {
        openPriceModal();
      }
    });
  });
    
  // Social media links
  document.querySelectorAll('.social-link, .footer-social').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        window.open(href, '_blank');
      }
    });
  });
    
  // Quick links in footer
  document.querySelectorAll('.footer-links a, .quick-links a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// ============================================
// 8. MODAL BUTTONS
// ============================================

function initModalButtons() {
  // Close buttons
  document.querySelectorAll('.modal-close, .close-btn, [class*="close"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const modal = this.closest('.modal, .modal-overlay, [class*="modal"]');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    });
  });
    
  // Close on outside click
  document.querySelectorAll('.modal-overlay, .modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
        this.style.display = 'none';
      }
    });
  });
}

// ============================================
// 9. PAYMENT PAGE BUTTONS
// ============================================

function initPaymentButtons() {
  // M-Pesa pay button
  const mpesaBtn = document.querySelector('#mpesaBtn, .btn-mpesa');
  if (mpesaBtn) {
    mpesaBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('💳 M-Pesa clicked');
      if (typeof initiateMpesaPayment === 'function') {
        initiateMpesaPayment();
      } else {
        alert('M-Pesa payment system loading...');
      }
    });
  }
    
  // Back to home from payment
  const backBtn = document.querySelector('.btn-back, .back-home');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
}

// ============================================
// 10. AUTH PAGE BUTTONS
// ============================================

function initAuthButtons() {
  // Only run on auth pages
  if (!window.location.pathname.includes('login') && 
    !window.location.pathname.includes('signup')) return;
    
  // Password toggle
  document.querySelectorAll('.password-toggle, .toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input[type="password"], input[type="text"]');
      if (input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
      }
    });
  });
    
  // Google sign in
  document.querySelectorAll('.btn-google, .google-signin').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔵 Google signin clicked');
      if (typeof signInWithGoogle === 'function') {
        signInWithGoogle();
      }
    });
  });
    
  // Form submissions
  const loginForm = document.querySelector('#loginForm, form[action*="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (typeof handleLogin === 'function') {
        handleLogin(e);
      }
    });
  }
    
  const signupForm = document.querySelector('#signupForm, form[action*="signup"]');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (typeof handleSignup === 'function') {
        handleSignup(e);
      }
    });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function addToLocalCart(productId, price, size) {
  // This helper is for legacy product-card handlers in button-fixes.js only.
  // The main page cart uses the inline addToCart(name, price, size) implementation.
  let cart = JSON.parse(localStorage.getItem('regalCart') || '[]');
  let itemDetails = null;

  if (price !== undefined && typeof productId === 'string') {
    itemDetails = {
      id: `${productId}-${size || ''}`.trim(),
      name: productId,
      price: Number(price) || 0,
      size: size || '',
      image: 'logo.png'
    };
  } else {
    const products = {
      '500ml': { name: 'Regal Mini (500ml)', price: 50, image: 'bottle-500ml.svg' },
      '5l': { name: 'Regal Family (5L)', price: 222, image: 'REGAL AQUA 5 LITERS' },
      '5L': { name: 'Regal Family (5L)', price: 222, image: 'REGAL AQUA 5 LITERS' },
      '10l': { name: 'Regal Party (10L)', price: 350, image: 'REGAL AQUA 10 L' },
      '10L': { name: 'Regal Party (10L)', price: 350, image: 'REGAL AQUA 10 L' },
      '20l': { name: 'Regal Bulk (20L)', price: 600, image: 'REGAL AQUA 20 L' },
      '20L': { name: 'Regal Bulk (20L)', price: 600, image: 'REGAL AQUA 20 L' },
      '50l': { name: 'Regal Commercial (50L)', price: 1500, image: 'REGAL_AQUA_50_00_LITERS' },
      '50L': { name: 'Regal Commercial (50L)', price: 1500, image: 'REGAL_AQUA_50_00_LITERS' },
      '10000l': { name: '10,000L Water Buzzer', price: 0, image: 'regal aqua water buzzer.jpg' },
      '10000L': { name: '10,000L Water Buzzer', price: 0, image: 'regal aqua water buzzer.jpg' },
      '10000l-buzzer': { name: '10,000L Water Buzzer', price: 0, image: 'regal aqua water buzzer.jpg' }
    };

    const product = products[productId] || {
      name: 'Regal Aqua Product',
      price: 0,
      image: 'logo.png'
    };

    itemDetails = {
      id: productId,
      name: product.name,
      price: product.price,
      size: '',
      image: product.image
    };
  }

  const existing = cart.find(item => item.id === itemDetails.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: itemDetails.id,
      name: itemDetails.name,
      price: itemDetails.price,
      size: itemDetails.size,
      quantity: 1,
      image: itemDetails.image
    });
  }

  localStorage.setItem('regalCart', JSON.stringify(cart));
  updateCartCount();
  showNotification('success', 'Added to Cart', `${itemDetails.name} added`);
  console.log('🛒 Cart updated:', cart);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('regalCart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
  const badge = document.querySelector('.cart-count, #cartCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateCartTotal() {
  // Recalculate cart total
  const cart = JSON.parse(localStorage.getItem('regalCart') || '[]');
  let total = 0;
    
  document.querySelectorAll('.cart-item').forEach(item => {
    const price = parseInt(item.dataset.price) || 0;
    const qty = parseInt(item.querySelector('input, .qty-value')?.value) || 1;
    total += price * qty;
  });
    
  const totalEl = document.querySelector('.cart-total, #cartTotal');
  if (totalEl) {
    totalEl.textContent = 'KSH ' + total.toLocaleString();
  }
}

function openReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    console.error('Review modal not found');
    alert('Review system loading...');
  }
}

function openPriceModal() {
  const modal = document.getElementById('priceModal') || document.getElementById('priceListModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  } else {
    // Redirect to price list section
    window.location.href = 'index.html#prices';
  }
}

function openQuoteModal() {
  const modal = document.getElementById('quoteModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  } else {
    // Fallback: alert or email
    window.location.href = 'mailto:regaldrink@gmail.com?subject=Quote Request';
  }
}

function useGPS() {
  if (!navigator.geolocation) {
    showNotification('error', 'GPS Error', 'Geolocation not supported');
    return;
  }
    
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
            
      // Update map if exists
      const map = document.getElementById('googleMap');
      if (map) {
        map.src = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1`;
      }
            
      showNotification('success', 'Location Found', 'Showing your location');
    },
    (error) => {
      showNotification('error', 'GPS Error', 'Unable to get location');
    }
  );
}

function showNotification(type, title, message) {
  // Remove existing notifications
  document.querySelectorAll('.notification-toast').forEach(n => n.remove());
    
  const notif = document.createElement('div');
  notif.className = 'notification-toast';
  notif.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #0f1f3d, #1a2d4d);
    border: 1px solid rgba(212,175,55,0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    min-width: 300px;
    max-width: 400px;
    z-index: 9999;
    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    transform: translateX(400px);
    transition: transform 0.4s ease;
  `;
    
  const colors = {
    success: '#4ade80',
    error: '#ef4444',
    warning: '#fbbf24',
    info: '#60a5fa'
  };
    
  const icons = {
    success: '✓',
    error: '✗',
    warning: '!',
    info: 'ℹ'
  };
    
  notif.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="color: ${colors[type]}; font-size: 1.5rem; font-weight: bold;">${icons[type]}</div>
      <div style="flex: 1;">
        <div style="color: #D4AF37; font-weight: 700; margin-bottom: 4px;">${title}</div>
        <div style="color: #8892b0; font-size: 0.9rem; line-height: 1.4;">${message}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #8892b0; cursor: pointer; font-size: 1.2rem;">×</button>
    </div>
  `;
    
  document.body.appendChild(notif);
    
  // Animate in
  requestAnimationFrame(() => {
    notif.style.transform = 'translateX(0)';
  });
    
  // Auto remove
  setTimeout(() => {
    notif.style.transform = 'translateX(400px)';
    setTimeout(() => notif.remove(), 400);
  }, 5000);
}

// Initialize cart count on load
updateCartCount();

// ============================================
// QUICK BUTTON AUDIT (auto-run)
// Scans for clickable elements with no obvious handler and reports them
// Attaches safe fallback handlers for anchors with fragment links
// ============================================
function runQuickAudit() {
  const elems = Array.from(document.querySelectorAll('button, a, [role="button"], [tabindex]'));
  const report = [];

  elems.forEach((el) => {
    // Ignore hidden or disabled
    if (el.offsetParent === null || el.disabled) return;

    const hasInline = !!(el.getAttribute && (el.getAttribute('onclick') || el.getAttribute('href')));
    const hasDataset = el.dataset && Object.keys(el.dataset).length > 0;
    const hasRoleHandler = el.dataset && el.dataset.regalHandler === '1';

    const probableHandler = hasInline || hasDataset || hasRoleHandler || (typeof el.onclick === 'function');

    if (!probableHandler) {
      report.push(el);

      // Attach a safe fallback for anchors with fragment targets
      if (el.tagName.toLowerCase() === 'a') {
        const href = el.getAttribute('href');
        if (href && href.startsWith('#')) {
          el.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          });
          el.dataset.regalHandler = '1';
        }
      }
    }
  });

  console.log(`Button audit: found ${elems.length} clickable elements, ${report.length} without obvious handlers.`);
  if (report.length > 0) console.table(report.map((el, i) => ({ index: i+1, tag: el.tagName, text: (el.textContent||'').trim().slice(0,40), classes: el.className }))); 
  return report;
}

// Expose manual test function
window.testAllButtons = runQuickAudit;

// Run audit shortly after load so other scripts can attach handlers first
setTimeout(() => {
  try { runQuickAudit(); } catch (e) { console.warn('Quick audit failed', e); }
}, 1200);

// ============================================
// AUTO FIXES: apply non-destructive DOM fixes
// - Ensure buttons have explicit types
// - Prevent default on anchors with href="#"
// - Add role/button and tabindex for non-interactive anchors
// ============================================
function applyAutoDomFixes() {
  let fixes = 0;

  // Buttons: set type to 'button' where missing (avoid accidental form submits)
  document.querySelectorAll('button').forEach(btn => {
    if (!btn.hasAttribute('type')) {
      const inForm = !!btn.closest('form');
      const cls = (btn.className || '').toLowerCase();
      const id = (btn.id || '').toLowerCase();
      // Heuristic: if contains 'submit' keep as submit, otherwise set to button
      if (inForm && (cls.includes('submit') || id.includes('submit'))) {
        btn.setAttribute('type', 'submit');
      } else {
        btn.setAttribute('type', 'button');
      }
      fixes++;
    }
  });

  // Anchors with href="#" or empty href: prevent default and mark role
  document.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#') {
      // avoid modifying mailto/tel/javascript
      a.addEventListener('click', (e) => e.preventDefault());
      if (!a.hasAttribute('role')) a.setAttribute('role', 'button');
      if (!a.hasAttribute('tabindex')) a.setAttribute('tabindex', '0');
      a.dataset.regalHandler = '1';
      fixes++;
    }
  });

  // Anchors that are fragments but target missing: prevent default
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      const target = document.querySelector(href);
      if (!target) {
        a.addEventListener('click', (e) => e.preventDefault());
        a.dataset.regalHandler = '1';
        fixes++;
      }
    }
  });

  // Expose count and log
  console.log(`Auto DOM fixes applied: ${fixes}`);
  return fixes;
}

// Run auto-fixes after a short delay so initial scripts attach first
setTimeout(() => {
  try { applyAutoDomFixes(); } catch (e) { console.warn('Auto DOM fixes failed', e); }
}, 1600);

