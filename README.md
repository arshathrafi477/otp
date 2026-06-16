# OTP Verification — Node.js & Express

A lightweight email-based one-time password (OTP) verification system built with Node.js, Express, and Nodemailer. Includes a ready-to-use HTML frontend.

---

## Features

- **Send OTP** — generates a cryptographically secure 6-digit code and emails it
- **Verify OTP** — validates the code with expiry and attempt-limit enforcement
- **Resend OTP** — clears the previous code and issues a fresh one
- **HTML frontend** — multi-step verification UI served by Express
- **Configurable** — OTP length, expiry time, and email provider via `.env`

---

## Project Structure

```
otp-verification/
├── public/
│   └── index.html          # Multi-step OTP verification UI
├── src/
│   ├── server.js           # Express app entry point
│   ├── routes/
│   │   └── otp.js          # /api/otp/* route handlers
│   ├── services/
│   │   └── emailService.js # Nodemailer email sender
│   └── utils/
│       ├── generateOtp.js  # Crypto-secure OTP generator
│       └── otpStore.js     # In-memory OTP storage
├── .env.example
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your SMTP credentials:

```env
PORT=3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password   # Use a Gmail App Password, not your login password

OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
```

> **Gmail users:** Enable 2FA, then create an [App Password](https://myaccount.google.com/apppasswords) and use it as `EMAIL_PASS`.

### 3. Run the server

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the UI.

---

## API Reference

Base URL: `http://localhost:3000/api/otp`

---

### `POST /send`

Generates an OTP and sends it to the specified email address.

**Request body**

```json
{ "email": "user@example.com" }
```

**Success response** `200`

```json
{ "success": true, "message": "OTP sent to user@example.com" }
```

**Error responses**

| Status | Reason |
|--------|--------|
| `400` | Missing or invalid email |
| `500` | Email delivery failure |

---

### `POST /verify`

Verifies the OTP submitted for the given email.

**Request body**

```json
{ "email": "user@example.com", "otp": "482910" }
```

**Success response** `200`

```json
{ "success": true, "message": "Email verified successfully!" }
```

**Error responses**

| Status | Reason |
|--------|--------|
| `400` | Missing fields or incorrect OTP |
| `404` | No OTP found for this email |
| `410` | OTP has expired |
| `429` | Too many failed attempts |

---

### `POST /resend`

Invalidates the current OTP and sends a new one.

**Request body**

```json
{ "email": "user@example.com" }
```

**Success response** `200`

```json
{ "success": true, "message": "New OTP sent to user@example.com" }
```

---

## OTP Behaviour

| Property | Default | Configurable via |
|----------|---------|-----------------|
| Length | 6 digits | `OTP_LENGTH` in `.env` |
| Expiry | 5 minutes | `OTP_EXPIRY_MINUTES` in `.env` |
| Max attempts | 3 | `MAX_ATTEMPTS` in `otpStore.js` |

After **3 failed attempts** or **expiry**, the OTP is deleted and the user must request a new one.

---

## Production Considerations

**Replace in-memory storage** — the default `Map`-based store is lost on server restart. For production, use Redis:

```js
// Example with ioredis
const redis = require('ioredis');
const client = new redis();

async function saveOtp(email, otp) {
  await client.set(`otp:${email}`, JSON.stringify({ otp, attempts: 0 }), 'EX', 300);
}
```

**Other recommendations:**

- Add rate limiting (e.g. `express-rate-limit`) on the `/send` and `/resend` endpoints
- Use HTTPS in production (behind a reverse proxy like Nginx)
- Remove `console.log(otp)` lines from `otp.js` before deploying
- Consider SMS delivery (Twilio) as an alternative or fallback to email

---

## Health Check

```bash
GET /api/health
# → { "status": "ok", "message": "OTP Verification Server is running" }
```

---

## License

MIT
