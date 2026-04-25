// mpesa-config.js
// Client-side MPESA helper config (no sensitive keys here)
const MPESA_CLIENT_CONFIG = {
  paybill: '247247',
  account: '600 095',
  callbackUrl: '/api/payment/mpesa/callback',
  stkEndpoint: '/api/payment/mpesa/stkpush'
};

async function initiateStkPush(phone, amount, orderRef) {
  try {
    const res = await fetch(MPESA_CLIENT_CONFIG.stkEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount, accountReference: orderRef })
    });
    return await res.json();
  } catch (err) {
    console.error('STK Push error', err);
    throw err;
  }
}

window.MPESA = { initiateStkPush, config: MPESA_CLIENT_CONFIG };
