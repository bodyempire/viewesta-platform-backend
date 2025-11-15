import express from 'express';
import { flutterwaveWebhook, stripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Webhook routes don't use standard auth - they use provider-specific verification
// These routes need raw body parsing for signature verification
// Note: These routes must be registered BEFORE express.json() middleware in index.js
router.post('/flutterwave', express.raw({ type: 'application/json' }), flutterwaveWebhook);
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;

