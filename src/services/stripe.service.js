import Stripe from 'stripe';
import { logger } from '../utils/logger.js';

// Configurar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdefghijklmnopqrstuvwxyz');

class StripeService {
  async createPaymentSession({ courseId, courseName, price, currency = 'usd' }) {
    try {
      // Crear la sesión de pago en Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: courseName,
                description: `Curso: ${courseName}`,
                images: [], // Puedes agregar imágenes del curso aquí
              },
              unit_amount: price, // Precio en centavos
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment/success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/course/${courseId}`,
        metadata: {
          courseId: courseId,
          courseName: courseName,
        },
        customer_email: '', // Se puede obtener del usuario autenticado
      });

      logger.info(`Sesión de pago creada para el curso ${courseId}: ${session.id}`);
      return session;
    } catch (error) {
      logger.error('Error al crear sesión de pago:', error);
      throw error;
    }
  }

  async retrieveSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      logger.error('Error al recuperar sesión de pago:', error);
      throw error;
    }
  }

  async createPaymentIntent({ courseId, courseName, price, currency = 'usd', customerEmail }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: price,
        currency: currency,
        metadata: {
          courseId: courseId,
          courseName: courseName,
        },
        receipt_email: customerEmail,
      });

      logger.info(`Payment Intent creado para el curso ${courseId}: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error al crear Payment Intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error al confirmar pago:', error);
      throw error;
    }
  }

  async createCustomer({ email, name }) {
    try {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
      });

      logger.info(`Cliente creado: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error al crear cliente:', error);
      throw error;
    }
  }

  async retrieveCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      logger.error('Error al recuperar cliente:', error);
      throw error;
    }
  }

  async createRefund(paymentIntentId, amount = null) { //CHEQUEAR ESTO, IMPORTANTE COMO SE REALIZAN LOS REFOUNDS
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount, // Si es null, se reembolsa el monto completo
      });

      logger.info(`Reembolso creado: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error('Error al crear reembolso:', error);
      throw error;
    }
  }

  async handleWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret'
      );

      logger.info(`Webhook recibido: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        default:
          logger.info(`Evento no manejado: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error en webhook:', error);
      throw error;
    }
  }

  async handleCheckoutSessionCompleted(session) {
    try {
      const { courseId, courseName } = session.metadata;
      
      logger.info(`Pago completado para el curso ${courseId}: ${courseName}`);
      
      // Aquí puedes agregar lógica adicional como:
      // - Enviar email de confirmación
      // - Actualizar base de datos
      // - Agregar curso al usuario
      
      return { success: true };
    } catch (error) {
      logger.error('Error al manejar sesión completada:', error);
      throw error;
    }
  }

  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      const { courseId, courseName } = paymentIntent.metadata;
      
      logger.info(`Payment Intent exitoso para el curso ${courseId}: ${courseName}`);
      
      // Lógica adicional para pago exitoso
      
      return { success: true };
    } catch (error) {
      logger.error('Error al manejar Payment Intent exitoso:', error);
      throw error;
    }
  }

  async handlePaymentIntentFailed(paymentIntent) {
    try {
      const { courseId, courseName } = paymentIntent.metadata;
      
      logger.error(`Payment Intent fallido para el curso ${courseId}: ${courseName}`);
      
      // Lógica adicional para pago fallido
      
      return { success: true };
    } catch (error) {
      logger.error('Error al manejar Payment Intent fallido:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
