const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const {
  MPESA_CONFIG,
  hasLiveCredentials,
  sanitizePhoneNumber,
  sanitizeAmount,
  requestAccessToken,
  buildStkPushPayload,
  createMockReceipt
} = require('./payment-daraja');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);

if (!MPESA_CONFIG.CALLBACK_URL) {
  console.warn('⚠️  MPESA_CALLBACK_URL is not configured. Live STK Push will fail without a public callback URL.');
}

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static(path.join(__dirname, 'public')));

const transactions = new Map();
const manualPayments = new Map();

app.get('/api/health', (req, res) => {
  res.json({ success: true, uptime: process.uptime(), timestamp: Date.now() });
});

app.post('/api/payment/mpesa/stkpush', async (req, res) => {
  try {
    const { phoneNumber, amount, orderId, description } = req.body;
    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: phoneNumber, amount, orderId' });
    }

    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
    if (!sanitizedPhone) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format. Use 2547XXXXXXXX or 07XXXXXXXX' });
    }

    const amountValue = sanitizeAmount(amount);
    if (!amountValue) {
      return res.status(400).json({ success: false, error: 'Invalid amount. Use a whole number between 1 and 150000.' });
    }

    const checkoutRequestId = `mock-${Date.now()}`;
    const transaction = {
      orderId: String(orderId),
      phoneNumber: sanitizedPhone,
      amount: amountValue,
      description: description || `Regal Aqua payment for ${orderId}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      mock: true,
      checkoutRequestId,
      merchantRequestId: `mock-${Date.now()}`
    };

    if (!hasLiveCredentials()) {
      transactions.set(checkoutRequestId, transaction);
      setTimeout(() => {
        const pending = transactions.get(checkoutRequestId);
        if (!pending || pending.status !== 'pending') {
          return;
        }
        pending.status = 'completed';
        pending.mpesaReceipt = createMockReceipt();
        pending.amountPaid = amountValue;
      }, 3000);

      return res.json({
        success: true,
        mock: true,
        message: 'Sandbox payment request created. No live M-Pesa credentials detected.',
        checkoutRequestId,
        customerMessage: 'A test payment confirmation will be simulated.'
      });
    }

    const accessToken = await requestAccessToken();
    const payload = buildStkPushPayload(sanitizedPhone, amountValue, orderId, description);
    const response = await axios.post(
      `${MPESA_CONFIG.BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const checkoutId = response.data.CheckoutRequestID;
    const merchantRequestId = response.data.MerchantRequestID;

    const liveTransaction = {
      ...transaction,
      mock: false,
      checkoutRequestId: checkoutId,
      merchantRequestId,
      status: 'pending',
      liveResponse: response.data
    };

    transactions.set(checkoutId, liveTransaction);

    return res.json({
      success: true,
      mock: false,
      message: 'M-Pesa prompt sent successfully.',
      checkoutRequestId: checkoutId,
      merchantRequestId,
      customerMessage: 'Check your phone and enter your M-Pesa PIN to complete payment.'
    });
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate payment.',
      details: error.response?.data || error.message
    });
  }
});

app.post('/api/payment/mpesa/callback', (req, res) => {
  const callbackData = req.body?.Body?.stkCallback;
  if (!callbackData) {
    return res.json({ ResultCode: 0, ResultDesc: 'Callback received' });
  }

  const checkoutRequestId = callbackData.CheckoutRequestID;
  const transaction = transactions.get(checkoutRequestId);

  if (!transaction) {
    console.warn('Callback received for unknown transaction:', checkoutRequestId);
    return res.json({ ResultCode: 0, ResultDesc: 'Callback received' });
  }

  if (callbackData.ResultCode === 0) {
    const metadata = (callbackData.CallbackMetadata?.Item || []).reduce((acc, item) => {
      if (item.Name) {
        acc[item.Name] = item.Value;
      }
      return acc;
    }, {});

    transaction.status = 'completed';
    transaction.mpesaReceipt = metadata.MpesaReceiptNumber || createMockReceipt();
    transaction.amountPaid = metadata.Amount || transaction.amount;
    transaction.paidAt = new Date().toISOString();
    transaction.rawCallback = callbackData;
  } else {
    transaction.status = 'failed';
    transaction.failureReason = callbackData.ResultDesc || 'M-Pesa callback failed';
    transaction.paidAt = new Date().toISOString();
    transaction.rawCallback = callbackData;
  }

  return res.json({ ResultCode: 0, ResultDesc: 'Callback processed' });
});

app.get('/api/payment/status/:checkoutRequestId', (req, res) => {
  const transaction = transactions.get(req.params.checkoutRequestId);
  if (!transaction) {
    return res.status(404).json({ success: false, error: 'Transaction not found.' });
  }

  return res.json({
    success: true,
    status: transaction.status,
    orderId: transaction.orderId,
    amount: transaction.amount,
    amountPaid: transaction.amountPaid,
    mpesaReceipt: transaction.mpesaReceipt,
    failureReason: transaction.failureReason,
    mock: Boolean(transaction.mock)
  });
});

app.post('/api/payment/manual/submit', (req, res) => {
  const { paybill, account, amount, transactionCode, orderId } = req.body;
  if (!paybill || !account || !amount || !transactionCode) {
    return res.status(400).json({ success: false, error: 'Missing required fields for manual paybill submission.' });
  }

  const amountValue = sanitizeAmount(amount);
  if (!amountValue) {
    return res.status(400).json({ success: false, error: 'Invalid amount for manual submission.' });
  }

  const id = `manual-${Date.now()}`;
  manualPayments.set(id, {
    id,
    paybill: String(paybill),
    account: String(account),
    amount: amountValue,
    transactionCode: String(transactionCode),
    orderId: orderId ? String(orderId) : id,
    status: 'pending_verification',
    createdAt: new Date().toISOString()
  });

  return res.json({ success: true, message: 'Manual paybill submission received.', submissionId: id });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Regal Aqua Live backend is running.' });
});

app.listen(PORT, () => {
  console.log(`Regal Aqua Live backend listening on port ${PORT}`);
});
