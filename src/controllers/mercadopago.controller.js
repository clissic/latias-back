import { mercadoPagoService } from "../services/mercadopago.service.js";
import { coursesService } from "../services/courses.service.js";
import { logger } from "../utils/logger.js";

class MercadoPagoController {
  // Crear preferencia de pago
  async createPreference(req, res) {
    try {
      const { courseId, courseName, price, currency, userId } = req.body;

      // Validar datos requeridos
      if (!courseId || !courseName || !price || !userId) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos courseId, courseName, price y userId son requeridos",
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

      // Crear preferencia de pago
      const preference = await mercadoPagoService.createPreference({
        courseId,
        courseName,
        price,
        currency,
        userId,
      });

      return res.status(200).json({
        status: "success",
        msg: "Preferencia de pago creada exitosamente",
        payload: {
          preferenceId: preference.id,
          initPoint: preference.init_point,
          sandboxInitPoint: preference.sandbox_init_point,
        },
      });
    } catch (error) {
      logger.error("Error en createPreference:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener preferencia
  async getPreference(req, res) {
    try {
      const { preferenceId } = req.params;

      if (!preferenceId) {
        return res.status(400).json({
          status: "error",
          msg: "El preferenceId es requerido",
          payload: {},
        });
      }

      const preference = await mercadoPagoService.getPreference(preferenceId);

      return res.status(200).json({
        status: "success",
        msg: "Preferencia obtenida exitosamente",
        payload: {
          preference,
        },
      });
    } catch (error) {
      logger.error("Error en getPreference:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener pago
  async getPayment(req, res) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({
          status: "error",
          msg: "El paymentId es requerido",
          payload: {},
        });
      }

      const payment = await mercadoPagoService.getPayment(paymentId);

      return res.status(200).json({
        status: "success",
        msg: "Pago obtenido exitosamente",
        payload: {
          payment,
        },
      });
    } catch (error) {
      logger.error("Error en getPayment:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Webhook de Mercado Pago
  async handleWebhook(req, res) {
    try {
      const body = req.body;

      if (!body || !body.type) {
        return res.status(400).json({
          status: "error",
          msg: "Datos de webhook inválidos",
          payload: {},
        });
      }

      const result = await mercadoPagoService.handleWebhook(body);

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

  // Crear pago directo
  async createPayment(req, res) {
    try {
      const {
        transaction_amount,
        description,
        payment_method_id,
        payer,
        installments,
        external_reference
      } = req.body;

      // Validar datos requeridos
      if (!transaction_amount || !description || !payment_method_id || !payer) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos transaction_amount, description, payment_method_id y payer son requeridos",
          payload: {},
        });
      }

      const payment = await mercadoPagoService.createPayment({
        transaction_amount,
        description,
        payment_method_id,
        payer,
        installments,
        external_reference
      });

      return res.status(200).json({
        status: "success",
        msg: "Pago creado exitosamente",
        payload: {
          payment,
        },
      });
    } catch (error) {
      logger.error("Error en createPayment:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Crear reembolso
  async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount } = req.body;

      if (!paymentId) {
        return res.status(400).json({
          status: "error",
          msg: "El paymentId es requerido",
          payload: {},
        });
      }

      const refund = await mercadoPagoService.refundPayment(paymentId, amount);

      return res.status(200).json({
        status: "success",
        msg: "Reembolso creado exitosamente",
        payload: {
          refund,
        },
      });
    } catch (error) {
      logger.error("Error en refundPayment:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener métodos de pago
  async getPaymentMethods(req, res) {
    try {
      const paymentMethods = await mercadoPagoService.getPaymentMethods();

      return res.status(200).json({
        status: "success",
        msg: "Métodos de pago obtenidos exitosamente",
        payload: {
          paymentMethods,
        },
      });
    } catch (error) {
      logger.error("Error en getPaymentMethods:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Procesar pago exitoso (después de que Mercado Pago confirme el pago)
  async processSuccessfulPayment(req, res) {
    try {
      const { paymentId } = req.body;

      if (!paymentId) {
        return res.status(400).json({
          status: "error",
          msg: "El campo paymentId es requerido",
          payload: {},
        });
      }

      // Obtener información del pago
      const payment = await mercadoPagoService.getPayment(paymentId);

      if (payment.status !== 'approved') {
        return res.status(400).json({
          status: "error",
          msg: "El pago no ha sido aprobado",
          payload: {},
        });
      }

      // Parsear external_reference para obtener courseId y userId
      const externalReference = payment.external_reference;
      if (!externalReference) {
        return res.status(400).json({
          status: "error",
          msg: "El pago no tiene external_reference válido",
          payload: {},
        });
      }

      const [courseId, userId] = externalReference.split('|');
      
      if (!courseId || !userId) {
        return res.status(400).json({
          status: "error",
          msg: "External reference malformado",
          payload: {},
        });
      }

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

  // Verificar estado de pago
  async checkPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res.status(400).json({
          status: "error",
          msg: "El paymentId es requerido",
          payload: {},
        });
      }

      const payment = await mercadoPagoService.getPayment(paymentId);

      return res.status(200).json({
        status: "success",
        msg: "Estado de pago obtenido exitosamente",
        payload: {
          paymentId: payment.id,
          status: payment.status,
          statusDetail: payment.status_detail,
          transactionAmount: payment.transaction_amount,
          externalReference: payment.external_reference,
        },
      });
    } catch (error) {
      logger.error("Error en checkPaymentStatus:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }
}

export const mercadoPagoController = new MercadoPagoController();
