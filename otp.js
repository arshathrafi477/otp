const express = require('express');
const router = express.Router();
const { generateOtp } = require('../utils/generateOtp');
const { sendOtpEmail } = require('../services/emailService');
const {
  saveOtp,
  getOtp,
  deleteOtp,
  incrementAttempts,
  isExpired,
  isMaxAttemptsReached,
} = require('../utils/otpStore');

// Simple email format validator
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/otp/send
 * Body: { email }
 * Generates and emails an OTP to the given address.
 */
router.post('/send', async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  try {
    const otp = generateOtp();
    saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    console.log(`[OTP] Sent to ${email}: ${otp}`); // Remove in production
    return res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('[OTP] Send error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Check email configuration.' });
  }
});

/**
 * POST /api/otp/verify
 * Body: { email, otp }
 * Verifies the OTP for the given email.
 */
router.post('/verify', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  const entry = getOtp(email);

  if (!entry) {
    return res.status(404).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
  }

  if (isExpired(entry)) {
    deleteOtp(email);
    return res.status(410).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  if (isMaxAttemptsReached(entry)) {
    deleteOtp(email);
    return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
  }

  if (entry.otp !== otp.toString().trim()) {
    incrementAttempts(email);
    const remaining = 3 - (entry.attempts + 1);
    return res.status(400).json({
      success: false,
      message: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'No attempts remaining.'}`,
    });
  }

  // OTP is correct
  deleteOtp(email);
  return res.json({ success: true, message: 'Email verified successfully!' });
});

/**
 * POST /api/otp/resend
 * Body: { email }
 * Deletes any existing OTP and sends a fresh one.
 */
router.post('/resend', async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  deleteOtp(email); // Clear previous OTP

  try {
    const otp = generateOtp();
    saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    console.log(`[OTP] Resent to ${email}: ${otp}`); // Remove in production
    return res.json({ success: true, message: `New OTP sent to ${email}` });
  } catch (err) {
    console.error('[OTP] Resend error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
});

module.exports = router;
