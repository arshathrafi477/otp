/**
 * In-memory OTP store.
 * Structure: { email: { otp, expiresAt, attempts } }
 * For production, replace with Redis or a database.
 */
const otpStore = new Map();

const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;

function saveOtp(email, otp) {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
}

function getOtp(email) {
  return otpStore.get(email.toLowerCase()) || null;
}

function deleteOtp(email) {
  otpStore.delete(email.toLowerCase());
}

function incrementAttempts(email) {
  const entry = otpStore.get(email.toLowerCase());
  if (entry) {
    entry.attempts += 1;
    otpStore.set(email.toLowerCase(), entry);
  }
}

function isExpired(entry) {
  return Date.now() > entry.expiresAt;
}

function isMaxAttemptsReached(entry) {
  return entry.attempts >= MAX_ATTEMPTS;
}

module.exports = {
  saveOtp,
  getOtp,
  deleteOtp,
  incrementAttempts,
  isExpired,
  isMaxAttemptsReached,
};
