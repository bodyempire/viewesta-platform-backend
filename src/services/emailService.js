import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASSWORD
  }
});

const fromAddress = `${process.env.EMAIL_FROM_NAME || 'Viewesta Platform'} <${process.env.EMAIL_FROM || 'noreply@viewesta.com'}>`;

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${token}`;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: 'Verify Your Viewesta Account',
    html: `
      <h1>Welcome to Viewesta!</h1>
      <p>Thank you for registering with Viewesta Platform.</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p><a href="${verificationUrl}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: 'Reset Your Viewesta Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <p><a href="${resetUrl}" style="padding: 12px 24px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error.message);
    return false;
  }
};

