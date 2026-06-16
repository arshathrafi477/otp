const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an OTP email to the given address.
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 */
async function sendOtpEmail(to, otp) {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;

  const mailOptions = {
    from: `"OTP Verification" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification Code',
    text: `Your OTP is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1d4ed8; margin-bottom: 8px;">Verification Code</h2>
        <p style="color: #374151;">Use the code below to complete your verification:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #111827; background: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This code expires in <strong>${expiryMinutes} minutes</strong>. 
          Do not share it with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

module.exports = { sendOtpEmail };
