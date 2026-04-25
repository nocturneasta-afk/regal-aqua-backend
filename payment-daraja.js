const axios = require('axios');

const MPESA_ENV = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox';
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  PASSKEY: process.env.MPESA_PASSKEY || '',
  SHORTCODE: process.env.MPESA_SHORTCODE || '247247',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || '',
  BASE_URL
};

function isPlaceholder(value) {
  if (!value || typeof value !== 'string') {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 || normalized.includes('your_') || normalized.includes('_here') || normalized.includes('demo_');
}

function hasLiveCredentials() {
  return [
    MPESA_CONFIG.CONSUMER_KEY,
    MPESA_CONFIG.CONSUMER_SECRET,
    MPESA_CONFIG.PASSKEY,
    MPESA_CONFIG.SHORTCODE,
    MPESA_CONFIG.CALLBACK_URL
  ].every((value) => value && !isPlaceholder(value));
}

function sanitizePhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return null;
  }

  let phone = rawPhone.replace(/[^0-9]/g, '');

  if (phone.length === 10 && phone.startsWith('0')) {
    phone = `254${phone.slice(1)}`;
  }

  if (phone.length === 9 && /^[7-9]/.test(phone)) {
    phone = `254${phone}`;
  }

  if (phone.length === 12 && phone.startsWith('254')) {
    return phone;
  }

  return null;
}

function sanitizeAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 1 || value > 150000 || !Number.isInteger(value)) {
    return null;
  }
  return value;
}

function getTimestamp() {
  return new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}

function createPassword(timestamp) {
  return Buffer.from(`${MPESA_CONFIG.SHORTCODE}${MPESA_CONFIG.PASSKEY}${timestamp}`).toString('base64');
}

async function requestAccessToken() {
  const authToken = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(`${MPESA_CONFIG.BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${authToken}`
    }
  });

  return response.data.access_token;
}

function buildStkPushPayload(phoneNumber, amount, orderId, description = 'Regal Aqua Purchase') {
  const timestamp = getTimestamp();
  const password = createPassword(timestamp);

  return {
    BusinessShortCode: MPESA_CONFIG.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: MPESA_CONFIG.SHORTCODE,
    PhoneNumber: phoneNumber,
    CallBackURL: MPESA_CONFIG.CALLBACK_URL,
    AccountReference: String(orderId).slice(0, 20),
    TransactionDesc: description
  };
}

function createMockReceipt() {
  return `RA${Date.now()}`;
}

module.exports = {
  MPESA_CONFIG,
  hasLiveCredentials,
  sanitizePhoneNumber,
  sanitizeAmount,
  requestAccessToken,
  buildStkPushPayload,
  createMockReceipt
};
