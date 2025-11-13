# Viewesta Day 5 — Email (SendGrid) Integration — Implementation Report

Date: October 30, 2025  
Scope: Account email verification and password reset using SendGrid (via Nodemailer SMTP)  
Status: ✅ Implementation complete • ⏳ Live send testing pending credentials

---

## 🎯 Objectives
- Add email service wired to SendGrid via SMTP
- Provide endpoints for email verification and password reset
- Document env vars and verification steps aligned with the deep workflow

---

## ✅ What Was Implemented
- Email service module using Nodemailer/SMTP
- New auth endpoints added and wired to controllers
- Token-based flows for verify/reset using JWT
- Day 5 plan/checklist for onboarding and verification

Code references:
```38:73:apps/backend/src/routes/authRoutes.js
// Email verification & password reset
router.post('/request-verify', authController.requestVerifyEmail);
router.post('/verify', authController.verifyEmail);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset', authController.resetPassword);
```

```1:48:apps/backend/src/services/emailService.js
const nodemailer = require('nodemailer');
// createTransport() builds a SendGrid SMTP transporter using env vars
// sendEmail({ to, subject, html }) delivers messages with FROM from env
```

```1:16:apps/backend/src/controllers/authController.js
const { sendEmail, buildVerificationEmail, buildResetEmail } = require('../services/emailService');
```

```196:210:apps/backend/src/controllers/authController.js
module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  requestVerifyEmail,
  verifyEmail,
  requestPasswordReset,
  resetPassword
};
```

---

## ⚙️ Required Environment Variables
- EMAIL_PROVIDER=sendgrid
- SENDGRID_API_KEY=...
- FROM_EMAIL=noreply@viewesta.com
- FROM_NAME=Viewesta Platform
- SMTP_HOST=smtp.sendgrid.net
- SMTP_PORT=587
- SMTP_USER=apikey
- SMTP_PASS=(optional; if not set, service uses SENDGRID_API_KEY)

Note: Do not commit secrets. Use OS env/CI secrets.

---

## 🧪 Endpoints & Flows
- POST `/api/auth/request-verify`  body: `{ email }`
  - Sends a verification email with a 24h token
- POST `/api/auth/verify`  body: `{ token }`  or GET `/api/auth/verify?token=...`
  - Marks `users.is_verified = true`
- POST `/api/auth/request-reset`  body: `{ email }`
  - Sends a password reset email with a 1h token
- POST `/api/auth/reset`  body: `{ token, new_password }`
  - Validates token and updates `users.password_hash`

---

## 🔎 How To Verify (after adding credentials)
1) Set email env vars (above)  
2) Start backend  
3) Request verification → receive email → call verify endpoint with token  
4) Request reset → receive email → call reset endpoint with token + new password  

Windows quick commands (examples):
```bash
# Request verify
curl.exe -sS -H "Content-Type: application/json" -d '{"email":"user@example.com"}' http://localhost:3000/api/auth/request-verify

# Verify
curl.exe -sS -H "Content-Type: application/json" -d '{"token":"<PASTE_TOKEN>"}' http://localhost:3000/api/auth/verify

# Request reset
curl.exe -sS -H "Content-Type: application/json" -d '{"email":"user@example.com"}' http://localhost:3000/api/auth/request-reset

# Reset
curl.exe -sS -H "Content-Type: application/json" -d '{"token":"<PASTE_TOKEN>","new_password":"NewStrongPass!"}' http://localhost:3000/api/auth/reset
```

---

## 🐛 Notes & Edge Cases
- Tokens are JWT-based and time-limited (verify: 24h, reset: 1h)
- `API_BASE_URL` is used to build email links (falls back to localhost)
- Ensure `JWT_SECRET` is set in env for token creation/verification

---

## 📌 Next Steps (per Deep Workflow)
- Add HTML email templates and branding
- Add rate limiting on email endpoints
- Add audit logs for email sends
- Integrate provider webhooks (bounces/complaints) later

---

## ✅ Conclusion
Day 5 implementation is complete and fully documented. Once credentials are added, run the verification steps to confirm end-to-end email delivery.


