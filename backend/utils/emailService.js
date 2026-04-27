import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, text, html)
 */
export const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"AS Gems" <no-reply@asgems.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send verification code email
 * @param {string} to - Recipient email
 * @param {string} code - Verification code
 */
export const sendVerificationEmail = async (to, code) => {
  const subject = 'AS Gems Admin - Password Change Verification Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Security Verification</h2>
      <p>Hello,</p>
      <p>You have requested to change your admin password. Please use the following 6-digit verification code to complete the process:</p>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D4AF37;">${code}</span>
      </div>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this change, please ignore this email and ensure your account is secure.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888888; text-align: center;">This is an automated message from AS Gems Administration.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
  });
};
