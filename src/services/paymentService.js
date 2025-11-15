import dotenv from 'dotenv';
import Flutterwave from 'flutterwave-node-v3';
import Stripe from 'stripe';

dotenv.config();

class PaymentService {
  constructor() {
    this.flutterwavePublicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
    this.flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    this.flutterwaveEncryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY;
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    this.stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Initialize Flutterwave SDK
    if (this.flutterwavePublicKey && this.flutterwaveSecretKey) {
      this.flutterwave = new Flutterwave(this.flutterwavePublicKey, this.flutterwaveSecretKey);
    }

    // Initialize Stripe SDK
    if (this.stripeSecretKey) {
      this.stripe = new Stripe(this.stripeSecretKey);
    }
  }

  // Flutterwave Payment Methods
  async initializeFlutterwavePayment(paymentData) {
    const {
      amount,
      email,
      phone,
      name,
      currency = 'USD',
      tx_ref,
      redirect_url,
      metadata = {}
    } = paymentData;

    if (!this.flutterwave) {
      throw new Error('Flutterwave credentials not configured');
    }

    try {
      const flutterwavePayload = {
        tx_ref,
        amount,
        currency,
        redirect_url,
        payment_options: 'card,account,ussd,mpesa,mobilemoneyghana,mobilemoneyrwanda,mobilemoneyzambia,mobilemoneyuganda,banktransfer',
        customer: {
          email,
          phone_number: phone,
          name
        },
        customizations: {
          title: 'Viewesta Platform',
          description: 'Movie Purchase',
          logo: process.env.FRONTEND_URL || 'https://viewesta.com/logo.png'
        },
        meta: metadata
      };

      const response = await this.flutterwave.Payment.initialize(flutterwavePayload);

      if (response.status === 'success') {
        return {
          payment_link: response.data.link,
          payment_data: flutterwavePayload,
          tx_ref
        };
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error) {
      throw new Error(`Flutterwave payment initialization failed: ${error.message}`);
    }
  }

  async verifyFlutterwavePayment(transactionId) {
    if (!this.flutterwave) {
      throw new Error('Flutterwave credentials not configured');
    }

    try {
      const response = await this.flutterwave.Transaction.verify({ id: transactionId });

      if (response.status === 'success') {
        return {
          status: 'success',
          data: {
            id: response.data.id,
            status: response.data.status,
            amount: response.data.amount,
            currency: response.data.currency,
            tx_ref: response.data.tx_ref
          }
        };
      } else {
        return {
          status: 'error',
          message: response.message || 'Payment verification failed'
        };
      }
    } catch (error) {
      throw new Error(`Flutterwave payment verification failed: ${error.message}`);
    }
  }

  // Stripe Payment Methods
  async createStripePaymentIntent(paymentData) {
    const {
      amount,
      currency = 'usd',
      metadata = {},
      customer_email
    } = paymentData;

    if (!this.stripe) {
      throw new Error('Stripe credentials not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        receipt_email: customer_email
      });

      return paymentIntent;
    } catch (error) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  async verifyStripePayment(paymentIntentId) {
    if (!this.stripe) {
      throw new Error('Stripe credentials not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Stripe payment verification failed: ${error.message}`);
    }
  }

  async verifyStripeWebhook(payload, signature) {
    if (!this.stripe || !this.stripeWebhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeWebhookSecret
      );
      return event;
    } catch (error) {
      throw new Error(`Stripe webhook verification failed: ${error.message}`);
    }
  }

  // Mobile Money (Flutterwave)
  async initializeMobileMoneyPayment(paymentData) {
    const {
      amount,
      email,
      phone,
      name,
      currency = 'UGX', // Default to African currency
      tx_ref,
      network // MTN, Airtel, etc.
    } = paymentData;

    return await this.initializeFlutterwavePayment({
      ...paymentData,
      payment_method: 'mobile_money',
      network
    });
  }

  // Generic payment initialization
  async initializePayment(paymentData) {
    const { payment_provider, payment_method } = paymentData;

    if (payment_provider === 'flutterwave') {
      if (payment_method === 'mobile_money') {
        return await this.initializeMobileMoneyPayment(paymentData);
      }
      return await this.initializeFlutterwavePayment(paymentData);
    } else if (payment_provider === 'stripe') {
      return await this.createStripePaymentIntent(paymentData);
    }

    throw new Error(`Unsupported payment provider: ${payment_provider}`);
  }

  // Generic payment verification
  async verifyPayment(paymentProvider, transactionId) {
    if (paymentProvider === 'flutterwave') {
      return await this.verifyFlutterwavePayment(transactionId);
    } else if (paymentProvider === 'stripe') {
      return await this.verifyStripePayment(transactionId);
    }

    throw new Error(`Unsupported payment provider: ${paymentProvider}`);
  }
}

export default new PaymentService();

