// ============================================
// REGAL AQUA ADMIN DASHBOARD
// ============================================

// Admin credentials (in-code fallback admin account)
const ADMIN_CREDENTIALS = {
  user: 'Admin',
  password: 'Regalaqua2026' // Admin password as requested
};

// Check admin auth on load
document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = sessionStorage.getItem('adminAuth');
  if (isAdmin) {
    showDashboard();
    loadDashboardData();
  }

  // If Firebase is available, auto-promote users in ADMIN_EMAILS to admin session
  if (window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user && (window.ADMIN_EMAILS || []).includes(user.email)) {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify({
          name: user.displayName || 'P.M.',
          email: user.email,
          loginTime: new Date().toISOString()
        }));
        showDashboard();
        loadDashboardData();
      }
    });
  }
});

function adminLogin(event) {
  event.preventDefault();
  const identifier = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  // Allow login via the admin name + password
  if (identifier.toLowerCase() === (ADMIN_CREDENTIALS.user || '').toLowerCase() && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem('adminAuth', 'true');
    sessionStorage.setItem('adminUser', JSON.stringify({
      name: ADMIN_CREDENTIALS.user,
      email: null,
      loginTime: new Date().toISOString()
    }));
    showDashboard();
    loadDashboardData();
    return;
  }

  // (Optional) Allow using a whitelisted admin email with the same fallback password
  if ((window.ADMIN_EMAILS || []).includes(identifier) && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem('adminAuth', 'true');
    sessionStorage.setItem('adminUser', JSON.stringify({
      name: 'Admin',
      email: identifier,
      loginTime: new Date().toISOString()
    }));
    showDashboard();
    loadDashboardData();
    return;
  }

  alert('Invalid admin credentials!');
}

function adminLogout() {
  sessionStorage.removeItem('adminAuth');
  sessionStorage.removeItem('adminUser');
  location.reload();
}

function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';
}

function showSection(sectionId) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
  
  document.getElementById(sectionId).classList.add('active');
  event.target.classList.add('active');
}

// Load dashboard data
function loadDashboardData() {
  // Simulate data - replace with Firebase calls
  document.getElementById('totalUsers').textContent = '156';
  document.getElementById('totalReviews').textContent = '43';
  document.getElementById('totalOrders').textContent = '12';
  document.getElementById('totalRevenue').textContent = 'KSH 45,600';
  
  loadReviews();
  loadCustomers();
  loadSecurityLogs();
}

function loadReviews() {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  const container = document.getElementById('reviewsList');
  
  if (reviews.length === 0) {
    container.innerHTML = '<p class="empty-state">No reviews yet</p>';
    return;
  }
  
  container.innerHTML = reviews.map(r => `
    <div class="review-item" data-id="${r.id}">
      <div class="review-header">
        <strong>${r.customerName}</strong>
        <span class="rating">${'★'.repeat(r.rating)}</span>
        <span class="badge ${r.status}">${r.status}</span>
      </div>
      <p>${r.reviewText}</p>
      <small>${r.product} | ${r.date}</small>
      <div class="review-actions">
        <button onclick="approveReview('${r.id}')">Approve</button>
        <button onclick="flagReview('${r.id}')">Flag</button>
        <button onclick="deleteReview('${r.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function loadCustomers() {
  // Load from your database
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  // Render table...
}

function loadSecurityLogs() {
  const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
  const container = document.getElementById('loginAttempts');
  
  container.innerHTML = logs.map(log => `
    <div class="log-item ${log.type}">
      <span>${log.time}</span>
      <span>${log.ip}</span>
      <span>${log.action}</span>
    </div>
  `).join('');
}

function toggleSecurity(feature) {
  console.log('Toggling security:', feature);
  // Implement security toggles
}