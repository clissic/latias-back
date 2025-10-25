import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { logger } from '../utils/logger.js';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

class MercadoPagoService {
  async createPreference({ courseId, courseName, price, currency = 'USD', userId }) {
    try {
      const preference = new Preference(client);

      const preferenceData = {
        items: [
          {
            id: courseId,
            title: courseName,
            description: `Curso: ${courseName}`,
            quantity: 1,
            unit_price: price,
            currency_id: currency,
          }
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/pending`
        },
        auto_return: 'approved',
        external_reference: `${courseId}|${userId}`,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/mercadopago/webhook`,
        metadata: {
          courseId: courseId,
          courseName: courseName,
          userId: userId,
        }
      };

      const response = await preference.create({ body: preferenceData });
      
      logger.info(`Preferencia de Mercado Pago creada para el curso ${courseId}: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Error al crear preferencia de Mercado Pago:', error);
      throw error;
    }
  }

  async getPreference(preferenceId) {
    try {
      const preference = new Preference(client);
      const response = await preference.get({ id: preferenceId });
      return response;
    } catch (error) {
      logger.error('Error al obtener preferencia:', error);
      throw error;
    }
  }

  async getPayment(paymentId) {
    try {
      const payment = new Payment(client);
      const response = await payment.get({ id: paymentId });
      return response;
    } catch (error) {
      logger.error('Error al obtener pago:', error);
      throw error;
    }
  }

  async handleWebhook(body) {
    try {
      const { type, data } = body;

      logger.info(`Webhook de Mercado Pago recibido: ${type}`);

      switch (type) {
        case 'payment':
          await this.handlePaymentNotification(data.id);
          break;
        case 'merchant_order':
          await this.handleMerchantOrderNotification(data.id);
          break;
        default:
          logger.info(`Tipo de webhook no manejado: ${type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error en webhook de Mercado Pago:', error);
      throw error;
    }
  }

  async handlePaymentNotification(paymentId) {
    try {
      const payment = await this.getPayment(paymentId);
      
      logger.info(`Notificación de pago recibida: ${paymentId}, Estado: ${payment.status}`);
      
      // Solo procesar pagos aprobados
      if (payment.status === 'approved') {
        await this.processApprovedPayment(payment);
      } else {
        logger.info(`Pago ${paymentId} no está aprobado (estado: ${payment.status}), no se procesará`);
      }
      
      return { success: true, payment };
    } catch (error) {
      logger.error('Error al manejar notificación de pago:', error);
      throw error;
    }
  }

  async processApprovedPayment(payment) {
    try {
      const externalReference = payment.external_reference;
      
      if (!externalReference) {
        logger.error('Pago aprobado sin external_reference:', payment.id);
        return { success: false, error: 'No external_reference found' };
      }

      // Parsear external_reference para obtener courseId y userId
      const [courseId, userId] = externalReference.split('|');
      
      if (!courseId || !userId) {
        logger.error('External reference malformado:', externalReference);
        return { success: false, error: 'Invalid external_reference format' };
      }

      logger.info(`Procesando pago aprobado - Curso: ${courseId}, Usuario: ${userId}`);

      // Importar el servicio de cursos dinámicamente para evitar dependencias circulares
      const { coursesService } = await import('./courses.service.js');
      
      // Agregar el curso al usuario
      const result = await coursesService.purchaseCourse(userId, courseId);
      
      logger.info(`Curso ${courseId} agregado exitosamente al usuario ${userId}`);
      
      return { 
        success: true, 
        courseId, 
        userId, 
        result 
      };
    } catch (error) {
      logger.error('Error al procesar pago aprobado:', error);
      throw error;
    }
  }

  async handleMerchantOrderNotification(orderId) {
    try {
      logger.info(`Notificación de orden recibida: ${orderId}`);
      
      // Lógica adicional para manejar órdenes
      
      return { success: true };
    } catch (error) {
      logger.error('Error al manejar notificación de orden:', error);
      throw error;
    }
  }

  async createPayment({
    transaction_amount,
    description,
    payment_method_id,
    payer,
    installments = 1,
    external_reference
  }) {
    try {
      const payment = new Payment(client);

      const paymentData = {
        transaction_amount: transaction_amount,
        description: description,
        payment_method_id: payment_method_id,
        payer: payer,
        installments: installments,
        external_reference: external_reference
      };

      const response = await payment.create({ body: paymentData });
      
      logger.info(`Pago de Mercado Pago creado: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Error al crear pago:', error);
      throw error;
    }
  }

  async refundPayment(paymentId, amount = null) {
    try {
      const payment = new Payment(client);
      
      const refundData = {
        amount: amount // Si es null, se reembolsa el monto completo
      };

      const response = await payment.refund({ 
        id: paymentId, 
        body: refundData 
      });
      
      logger.info(`Reembolso creado: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Error al crear reembolso:', error);
      throw error;
    }
  }

  async getPaymentMethods() {
    try {
      // Mercado Pago no tiene un endpoint específico para obtener métodos de pago
      // Los métodos disponibles dependen del país y configuración de la cuenta
      const commonMethods = [
        {
          id: 'visa',
          name: 'Visa',
          type: 'credit_card'
        },
        {
          id: 'master',
          name: 'Mastercard',
          type: 'credit_card'
        },
        {
          id: 'amex',
          name: 'American Express',
          type: 'credit_card'
        },
        {
          id: 'rapipago',
          name: 'Rapipago',
          type: 'ticket'
        },
        {
          id: 'pagofacil',
          name: 'Pago Fácil',
          type: 'ticket'
        }
      ];

      return commonMethods;
    } catch (error) {
      logger.error('Error al obtener métodos de pago:', error);
      throw error;
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();
