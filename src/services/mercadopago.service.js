import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { logger } from '../utils/logger.js';

/**
 * Configuración de Mercado Pago
 * 
 * IMPORTANTE - CUENTAS DE PRUEBA:
 * Para probar la integración, necesitas crear cuentas de prueba en Mercado Pago:
 * 
 * 1. Ve a https://www.mercadopago.com/developers/panel/app
 * 2. Selecciona tu aplicación
 * 3. Ve a "Cuentas de prueba" y crea:
 *    - Cuenta VENDEDOR: Para configurar la aplicación y credenciales (esta es tu cuenta)
 *    - Cuenta COMPRADOR: Para probar el proceso de compra
 * 
 * NOTAS:
 * - Ambas cuentas deben ser del mismo país
 * - Usa el Access Token de la cuenta VENDEDOR en MERCADOPAGO_ACCESS_TOKEN
 * - Para iniciar sesión con usuarios de prueba, usa los últimos 6 dígitos del User ID
 *    o del Access Token cuando se solicite autenticación por email
 * - Puedes agregar saldo ficticio a las cuentas de prueba para simular pagos
 * - Usa las tarjetas de prueba de Mercado Pago para simular transacciones
 * 
 * DOCUMENTACIÓN:
 * - Cuentas de prueba: https://www.mercadopago.com/developers/es/docs/your-integrations/test/test-users
 * - Tarjetas de prueba: https://www.mercadopago.com/developers/es/docs/your-integrations/test/cards
 */
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

// Almacén para evitar procesamiento duplicado de pagos (en memoria, para desarrollo)
// En producción, debería usar Redis o base de datos
const processedPayments = new Set();

class MercadoPagoService {
  /**
   * Crea una preferencia de pago en Mercado Pago
   * @param {Object} params - Parámetros de la preferencia
   * @param {string} params.courseId - ID del curso
   * @param {string} params.courseName - Nombre del curso
   * @param {number} params.price - Precio del curso
   * @param {string} params.currency - Código de moneda (USD, UYU, etc.)
   * @param {string} params.userId - ID del usuario que realiza la compra
   * @param {Object} params.payer - Información del pagador (opcional)
   * @returns {Promise<Object>} - Respuesta de Mercado Pago con la preferencia creada
   */
  async createPreference({ courseId, courseName, price, currency = 'USD', userId, payer }) {
    let preferenceData = null; // Declarar fuera del try para que esté disponible en el catch
    
    try {
      const preference = new Preference(client);

      // Obtener URLs con validación más estricta
      let frontendUrl = process.env.FRONTEND_URL;
      let backendUrl = process.env.BACKEND_URL;

      // Log para debug
      logger.info(`Variables de entorno - FRONTEND_URL: ${frontendUrl}, BACKEND_URL: ${backendUrl}`);

      // Limpiar y validar frontendUrl
      if (frontendUrl) {
        frontendUrl = frontendUrl.trim();
      }
      if (!frontendUrl || frontendUrl === '' || frontendUrl === 'undefined' || frontendUrl === 'null') {
        frontendUrl = 'http://localhost:5173';
        logger.warning(`FRONTEND_URL no configurada o inválida, usando valor por defecto: ${frontendUrl}`);
      }

      // Limpiar y validar backendUrl
      if (backendUrl) {
        backendUrl = backendUrl.trim();
      }
      if (!backendUrl || backendUrl === '' || backendUrl === 'undefined' || backendUrl === 'null') {
        backendUrl = 'http://localhost:3000';
        logger.warning(`BACKEND_URL no configurada o inválida, usando valor por defecto: ${backendUrl}`);
      }

      // Construir URLs finales
      // NOTA: Por ahora todas las URLs redirigen a success, pero se pueden crear rutas específicas
      // para failure y pending si se requiere manejo diferenciado
      const successUrl = `${frontendUrl}/payment/success`;
      const failureUrl = `${frontendUrl}/payment/success`; // TODO: Crear ruta /payment/failure si se necesita
      const pendingUrl = `${frontendUrl}/payment/success`; // TODO: Crear ruta /payment/pending si se necesita
      const notificationUrl = `${backendUrl}/api/mercadopago/webhook`;

      // Validación final de URLs
      if (!successUrl || successUrl.includes('undefined') || successUrl.includes('null')) {
        throw new Error(`URL de éxito inválida: ${successUrl}. FRONTEND_URL debe estar configurada correctamente.`);
      }

      logger.info(`URLs configuradas - Success: ${successUrl}, Notification: ${notificationUrl}`);

      // Construir objeto back_urls de forma explícita y validar
      const backUrls = {
        success: String(successUrl).trim(),
        failure: String(failureUrl).trim(),
        pending: String(pendingUrl).trim()
      };

      // Validar que todas las URLs estén definidas y no estén vacías
      if (!backUrls.success || backUrls.success === '' || backUrls.success === 'undefined') {
        throw new Error(`back_urls.success es inválido: "${backUrls.success}"`);
      }
      if (!backUrls.failure || backUrls.failure === '' || backUrls.failure === 'undefined') {
        throw new Error(`back_urls.failure es inválido: "${backUrls.failure}"`);
      }
      if (!backUrls.pending || backUrls.pending === '' || backUrls.pending === 'undefined') {
        throw new Error(`back_urls.pending es inválido: "${backUrls.pending}"`);
      }

      // Validar y formatear el precio correctamente
      // Asegurar que el precio sea un número, no un string
      let finalPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
      
      // Validar que el precio sea un número válido y positivo
      if (isNaN(finalPrice) || finalPrice <= 0 || !isFinite(finalPrice)) {
        throw new Error(`El precio debe ser un número válido mayor a 0. Valor recibido: ${price} (tipo: ${typeof price})`);
      }

      // Algunas monedas no permiten decimales (ej: CLP, JPY)
      // Para estas monedas, redondear a entero
      const currenciesWithoutDecimals = ['CLP', 'JPY', 'VND', 'KRW'];
      const currencyCode = String(currency).toUpperCase();
      
      if (currenciesWithoutDecimals.includes(currencyCode)) {
        finalPrice = Math.round(finalPrice);
        logger.info(`Moneda ${currencyCode} no permite decimales. Precio redondeado a: ${finalPrice}`);
      } else {
        // Para otras monedas, asegurar máximo 2 decimales y que sea un número válido
        finalPrice = Math.round(finalPrice * 100) / 100;
        // Asegurar que no sea NaN o Infinity
        if (!isFinite(finalPrice)) {
          throw new Error(`Precio inválido después del formateo: ${finalPrice}`);
        }
      }

      // Validar currency_id
      if (!currencyCode || currencyCode.length !== 3) {
        throw new Error(`currency_id inválido: ${currencyCode}. Debe ser un código de 3 letras (ej: USD, UYU, ARS)`);
      }

      logger.info(`Precio formateado: ${finalPrice}, Moneda: ${currencyCode}`);

      // Construir el objeto de preferencia en el orden correcto
      preferenceData = {
        items: [
          {
            id: String(courseId),
            title: String(courseName),
            description: `Curso: ${courseName}`,
            quantity: 1,
            unit_price: finalPrice,
            currency_id: currencyCode,
          }
        ],
        back_urls: {
          success: backUrls.success,
          failure: backUrls.failure,
          pending: backUrls.pending
        },
        auto_return: 'approved',
        external_reference: `${courseId}|${userId}`,
        notification_url: String(notificationUrl).trim(),
        statement_descriptor: 'LATIAS ACADEMIA',
        metadata: {
          courseId: String(courseId),
          courseName: String(courseName),
          userId: String(userId),
        },
        // Configuración de métodos de pago
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        }
      };

      // Agregar información del payer si está disponible
      if (payer && payer.email) {
        preferenceData.payer = {
          email: String(payer.email),
        };
        if (payer.name) {
          preferenceData.payer.name = String(payer.name);
        }
        if (payer.surname) {
          preferenceData.payer.surname = String(payer.surname);
        }
        logger.info(`Payer agregado a la preferencia: ${payer.email}`);
      }

      // Validación final exhaustiva del item
      const item = preferenceData.items[0];
      if (!item.unit_price || item.unit_price <= 0) {
        throw new Error(`unit_price inválido: ${item.unit_price}. Debe ser un número mayor a 0`);
      }
      if (!item.currency_id || item.currency_id.length !== 3) {
        throw new Error(`currency_id inválido: ${item.currency_id}. Debe ser un código de 3 letras`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`quantity inválido: ${item.quantity}. Debe ser un número mayor a 0`);
      }

      // Log del objeto completo antes de enviarlo (solo en desarrollo)
      if (process.env.LOGGER_ENV === 'development') {
        const preferenceDataStr = JSON.stringify(preferenceData, null, 2);
        logger.info(`Preferencia completa: ${preferenceDataStr}`);
      }
      logger.info(`Item validado - unit_price: ${item.unit_price}, currency_id: ${item.currency_id}, quantity: ${item.quantity}`);

      // Validación final exhaustiva
      if (!preferenceData.back_urls) {
        throw new Error('preferenceData.back_urls no está definido');
      }
      if (!preferenceData.back_urls.success || typeof preferenceData.back_urls.success !== 'string' || preferenceData.back_urls.success.trim() === '') {
        throw new Error(`back_urls.success no es válido: "${preferenceData.back_urls.success}"`);
      }

      // IMPORTANTE: Mercado Pago puede rechazar localhost con auto_return
      // Si estamos en desarrollo con localhost, quitar auto_return temporalmente
      const isLocalhost = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
      if (isLocalhost && preferenceData.auto_return) {
        logger.warning('Detectado localhost - removiendo auto_return para evitar errores de Mercado Pago');
        delete preferenceData.auto_return;
      }

      const response = await preference.create({ body: preferenceData });
      
      logger.info(`Preferencia de Mercado Pago creada para el curso ${courseId}: ${response.id}`);
      return response;
    } catch (error) {
      // Log detallado del error
      logger.error('Error al crear preferencia de Mercado Pago:', {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
        response: error.response?.data || error.response,
        status: error.status || error.statusCode
      });
      
      // Si el error menciona back_urls, loggear el objeto que intentamos enviar
      if (error.message && error.message.includes('back_url') && preferenceData) {
        logger.error('Objeto preferenceData que causó el error:', JSON.stringify(preferenceData, null, 2));
      }
      
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
        const result = await this.processApprovedPayment(payment);
        return { success: true, payment, processed: result };
      } else if (payment.status === 'pending') {
        logger.info(`Pago ${paymentId} está pendiente. Se procesará cuando sea aprobado.`);
        return { success: true, payment, status: 'pending' };
      } else {
        logger.info(`Pago ${paymentId} no está aprobado (estado: ${payment.status}), no se procesará`);
        return { success: true, payment, status: payment.status };
      }
    } catch (error) {
      logger.error('Error al manejar notificación de pago:', error);
      throw error;
    }
  }

  async processApprovedPayment(payment) {
    try {
      const paymentId = String(payment.id);
      
      // Prevenir procesamiento duplicado del mismo pago
      if (processedPayments.has(paymentId)) {
        logger.warning(`Pago ${paymentId} ya fue procesado anteriormente, omitiendo procesamiento duplicado`);
        return { 
          success: true, 
          alreadyProcessed: true,
          message: 'Este pago ya fue procesado anteriormente'
        };
      }

      const externalReference = payment.external_reference;
      
      if (!externalReference) {
        logger.error('Pago aprobado sin external_reference:', paymentId);
        return { success: false, error: 'No external_reference found' };
      }

      // Parsear external_reference para obtener courseId y userId
      const [courseId, userId] = externalReference.split('|');
      
      if (!courseId || !userId) {
        logger.error('External reference malformado:', externalReference);
        return { success: false, error: 'Invalid external_reference format' };
      }

      logger.info(`Procesando pago aprobado - Curso: ${courseId}, Usuario: ${userId}, Payment ID: ${paymentId}`);

      // Marcar el pago como procesado ANTES de intentar agregarlo (idempotencia)
      processedPayments.add(paymentId);

      // Importar el servicio de cursos dinámicamente para evitar dependencias circulares
      const { coursesService } = await import('./courses.service.js');
      
      // Agregar el curso al usuario
      // purchaseCourse ya tiene protección contra duplicados (verifica si ya está comprado)
      try {
        const result = await coursesService.purchaseCourse(userId, courseId);
        logger.info(`Curso ${courseId} agregado exitosamente al usuario ${userId} (Payment ID: ${paymentId})`);
        return { 
          success: true, 
          courseId, 
          userId, 
          paymentId,
          result 
        };
      } catch (error) {
        // Si el curso ya fue comprado, no es un error crítico (puede ser procesamiento duplicado)
        if (error.message && error.message.includes('ya ha comprado')) {
          logger.warning(`Intento de comprar curso duplicado - Curso: ${courseId}, Usuario: ${userId}, Payment ID: ${paymentId}`);
          return { 
            success: true, 
            courseId, 
            userId, 
            paymentId,
            alreadyPurchased: true,
            message: 'El curso ya estaba asociado al usuario'
          };
        }
        // Si hay otro error, remover el pago del set para permitir reintento
        processedPayments.delete(paymentId);
        throw error;
      }
    } catch (error) {
      logger.error('Error al procesar pago aprobado:', error);
      throw error;
    }
  }

  async handleMerchantOrderNotification(orderId) {
    try {
      logger.info(`Notificación de orden recibida: ${orderId}`);
      
      // Las órdenes de Mercado Pago pueden contener múltiples pagos
      // Por ahora solo logueamos, pero se puede implementar lógica adicional si es necesario
      // En la mayoría de los casos, los webhooks de 'payment' son suficientes
      
      return { success: true, orderId };
    } catch (error) {
      logger.error('Error al manejar notificación de orden:', error);
      throw error;
    }
  }

  // NOTA: Este método crea pagos directos (sin preferencia)
  // Actualmente no se usa en el flujo principal que usa Checkout Pro con preferencias
  // Se mantiene para posibles casos de uso futuros (pagos directos desde el backend)
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
      
      logger.info(`Pago directo de Mercado Pago creado: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Error al crear pago directo:', error);
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

  // Obtener métodos de pago disponibles
  // NOTA: Mercado Pago no tiene un endpoint público para obtener métodos de pago
  // Los métodos disponibles dependen del país y configuración de la cuenta
  // Este método devuelve métodos comunes, pero en producción debería consultarse
  // la API de Mercado Pago o configurarse según el país de la cuenta
  async getPaymentMethods() {
    try {
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
