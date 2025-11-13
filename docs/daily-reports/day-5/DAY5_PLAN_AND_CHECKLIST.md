# Viewesta Day 5 — Email (SendGrid) Integration Plan & Checklist

Date: October 30, 2025  
Scope: Email verification and password reset via SendGrid (SMTP with Nodemailer)

## 🎯 Objectives
- Wire SendGrid SMTP through Nodemailer
- Implement endpoints for verification and password reset
- Provide verification steps and sample requests

## ⚙️ Environment
- EMAIL_PROVIDER=sendgrid
- SENDGRID_API_KEY=...
- FROM_EMAIL=noreply@viewesta.com
- FROM_NAME=Viewesta Platform
- SMTP_HOST=smtp.sendgrid.net
- SMTP_PORT=587
- SMTP_USER=apikey
- SMTP_PASS=$SENDGRID_API_KEY (optional; if not set, service uses SENDGRID_API_KEY)

## 🧩 Implementation
- Email service: `apps/backend/src/services/emailService.js`
- Routes: `apps/backend/src/routes/authRoutes.js`
- Controllers: `apps/backend/src/controllers/authController.js`

### Endpoints
- POST `/api/auth/request-verify` { email }
- POST `/api/auth/verify` { token } or GET `/api/auth/verify?token=...`
- POST `/api/auth/request-reset` { email }
- POST `/api/auth/reset` { token, new_password }

## 🔎 Verification
1) Start backend with email env configured
2) Request verification → receive email → hit verify endpoint
3) Request reset → receive email → post reset with token + new password

## ✅ Checklist
- [ ] Env vars set for email provider
- [ ] Send verification email works
- [ ] Verify endpoint marks user `is_verified=true`
- [ ] Send reset email works
- [ ] Reset endpoint updates password
- [ ] Documentation updated


