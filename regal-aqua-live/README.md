# Regal Aqua Live Backend

A clean Render-ready backend for Regal Aqua payment operations.

## Setup

1. Copy `regal-aqua-live/.env.example` to `regal-aqua-live/.env`.
2. Set your Safaricom M-Pesa Daraja credentials:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_PASSKEY`
   - `MPESA_SHORTCODE`
   - `MPESA_CALLBACK_URL`
3. Set `ALLOWED_ORIGINS` to your frontend origin (for example: `https://your-frontend-domain.com`).
4. If you are testing with Sandbox credentials, set `MPESA_ENV=sandbox`.

## Install

```bash
cd regal-aqua-live
npm install
```

## Run

```bash
npm start
```

## Endpoints

- `GET /api/health`
- `POST /api/payment/mpesa/stkpush`
- `POST /api/payment/mpesa/callback`
- `GET /api/payment/status/:checkoutRequestId`
- `POST /api/payment/manual/submit`

## Notes for Render

- Set Render environment variables using the values in `.env.example`.
- `MPESA_CALLBACK_URL` must be the public HTTPS callback URL for your Render app.
- If live M-Pesa credentials are not configured, the STK push endpoint falls back to sandbox mock mode.
