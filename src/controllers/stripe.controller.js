import { stripeService } from "../services/stripe.service.js";
import { coursesService } from "../services/courses.service.js";
import { logger } from "../utils/logger.js";

class StripeController {
  // Crear sesión de pago
  async createPaymentSession(req, res) {
    try {
      const { courseId, courseName, price, currency } = req.body;

      // Validar datos requeridos
      if (!courseId || !courseName || !price) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos courseId, courseName y price son requeridos",
          payload: {},
        });
      }

      // Verificar que el curso existe
      const course = await coursesService.findByCourseId(courseId);
      if (!course) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      // Crear sesión de pago
      const session = await stripeService.createPaymentSession({
        courseId,
        courseName,
        price,
        currency,
      });

      return res.status(200).json({
        status: "success",
        msg: "Sesión de pago creada exitosamente",
        payload: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error) {
      logger.error("Error en createPaymentSession:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Crear Payment Intent (para pagos más avanzados)
  async createPaymentIntent(req, res) {
    try {
      const { courseId, courseName, price, currency, customerEmail } = req.body;

      // Validar datos requeridos
      if (!courseId || !courseName || !price) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos courseId, courseName y price son requeridos",
          payload: {},
        });
      }

      // Verificar que el curso existe
      const course = await coursesService.findByCourseId(courseId);
      if (!course) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      // Crear Payment Intent
      const paymentIntent = await stripeService.createPaymentIntent({
        courseId,
        courseName,
        price,
        currency,
        customerEmail,
      });

      return res.status(200).json({
        status: "success",
        msg: "Payment Intent creado exitosamente",
        payload: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error) {
      logger.error("Error en createPaymentIntent:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Confirmar pago
  async confirmPayment(req, res) {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          status: "error",
          msg: "El paymentIntentId es requerido",
          payload: {},
        });
      }

      const paymentIntent = await stripeService.confirmPayment(paymentIntentId);

      return res.status(200).json({
        status: "success",
        msg: "Pago confirmado exitosamente",
        payload: {
          paymentIntent,
        },
      });
    } catch (error) {
      logger.error("Error en confirmPayment:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Recuperar sesión de pago
  async retrieveSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          status: "error",
          msg: "El sessionId es requerido",
          payload: {},
        });
      }

      const session = await stripeService.retrieveSession(sessionId);

      return res.status(200).json({
        status: "success",
        msg: "Sesión recuperada exitosamente",
        payload: {
          session,
        },
      });
    } catch (error) {
      logger.error("Error en retrieveSession:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Crear cliente
  async createCustomer(req, res) {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos email y name son requeridos",
          payload: {},
        });
      }

      const customer = await stripeService.createCustomer({ email, name });

      return res.status(200).json({
        status: "success",
        msg: "Cliente creado exitosamente",
        payload: {
          customer,
        },
      });
    } catch (error) {
      logger.error("Error en createCustomer:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Recuperar cliente
  async retrieveCustomer(req, res) {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        return res.status(400).json({
          status: "error",
          msg: "El customerId es requerido",
          payload: {},
        });
      }

      const customer = await stripeService.retrieveCustomer(customerId);

      return res.status(200).json({
        status: "success",
        msg: "Cliente recuperado exitosamente",
        payload: {
          customer,
        },
      });
    } catch (error) {
      logger.error("Error en retrieveCustomer:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Crear reembolso
  async createRefund(req, res) {
    try {
      const { paymentIntentId, amount } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          status: "error",
          msg: "El paymentIntentId es requerido",
          payload: {},
        });
      }

      const refund = await stripeService.createRefund(paymentIntentId, amount);

      return res.status(200).json({
        status: "success",
        msg: "Reembolso creado exitosamente",
        payload: {
          refund,
        },
      });
    } catch (error) {
      logger.error("Error en createRefund:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Webhook de Stripe
  async handleWebhook(req, res) {
    try {
      const payload = req.body;
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({
          status: "error",
          msg: "Firma de webhook requerida",
          payload: {},
        });
      }

      const result = await stripeService.handleWebhook(payload, signature);

      return res.status(200).json({
        status: "success",
        msg: "Webhook procesado exitosamente",
        payload: result,
      });
    } catch (error) {
      logger.error("Error en handleWebhook:", error);
      return res.status(400).json({
        status: "error",
        msg: "Error al procesar webhook",
        payload: {},
      });
    }
  }

  // Procesar pago exitoso (después de que Stripe confirme el pago)
  async processSuccessfulPayment(req, res) {
    try {
      const { sessionId, userId } = req.body;

      if (!sessionId || !userId) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos sessionId y userId son requeridos",
          payload: {},
        });
      }

      // Recuperar la sesión de Stripe
      const session = await stripeService.retrieveSession(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({
          status: "error",
          msg: "El pago no ha sido completado",
          payload: {},
        });
      }

      const { courseId } = session.metadata;

      // Agregar el curso al usuario usando el servicio existente
      const result = await coursesService.purchaseCourse(userId, courseId);

      return res.status(200).json({
        status: "success",
        msg: "Pago procesado y curso agregado al usuario exitosamente",
        payload: result,
      });
    } catch (error) {
      logger.error("Error en processSuccessfulPayment:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }
}

export const stripeController = new StripeController();
