const crypto = require('crypto');

/**
 * Generates a cryptographically secure numeric OTP.
 * @param {number} length - Number of digits (default: 6)
 * @returns {string} OTP string
 */
function generateOtp(length = parseInt(process.env.OTP_LENGTH) || 6) {
  const max = Math.pow(10, length);
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  const otp = (randomNumber % max).toString().padStart(length, '0');
  return otp;
}

module.exports = { generateOtp };
