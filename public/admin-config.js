// Admin emails whitelist — update with real admin emails
const ADMIN_EMAILS = [
  'princemugi6@gmail.com',
  'admin@regalaqua.co.ke'
];

if (typeof window !== 'undefined') window.ADMIN_EMAILS = ADMIN_EMAILS;

// Export for CommonJS (if used by server-side code)
if (typeof module !== 'undefined' && module.exports) module.exports = { ADMIN_EMAILS };
