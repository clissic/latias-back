import { mercadoPagoService } from "../services/mercadopago.service.js";
import { coursesService } from "../services/courses.service.js";
import { userService } from "../services/users.service.js";
import { processedPaymentsModel } from "../DAO/models/processed-payments.model.js";
import { usersModel } from "../DAO/models/users.model.js";
import { logger } from "../utils/logger.js";

/**
 * Controlador de Mercado Pago
 * 
 * Maneja todas las operaciones relacionadas con pagos de Mercado Pago.
 * 
 * Para más información sobre configuración y pruebas, consulta:
 * - MERCADOPAGO_SETUP.md en la raíz del proyecto
 * - Documentación oficial: https://www.mercadopago.com/developers/es/docs
 */
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

      // Usar la moneda del curso si no se proporciona en el body
      const finalCurrency = currency || course.currency || 'USD';

      // Validar y convertir el precio a número
      // El servicio ya valida el precio, pero validamos aquí también para dar respuesta rápida
      const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0 || !isFinite(numericPrice)) {
        return res.status(400).json({
          status: "error",
          msg: "El precio debe ser un número válido mayor a 0",
          payload: {},
        });
      }

      // Obtener información del usuario autenticado si está disponible
      const userEmail = req.user?.email || null;
      const userFirstName = req.user?.firstName || null;
      const userLastName = req.user?.lastName || null;

      // Crear preferencia de pago
      const preference = await mercadoPagoService.createPreference({
        courseId,
        courseName,
        price: numericPrice,
        currency: finalCurrency,
        userId,
        payer: userEmail ? {
          email: userEmail,
          name: userFirstName || undefined,
          surname: userLastName || undefined,
        } : undefined,
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
  // NOTA: Las preferencias pueden contener información sensible, considerar agregar validación
  // de ownership si es necesario en el futuro
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
  // NOTA: Esta ruta debería tener validación de ownership similar a checkPaymentStatus
  // Por ahora solo requiere autenticación, pero se puede mejorar
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

      // VALIDACIÓN DE SEGURIDAD: Verificar que el pago pertenezca al usuario autenticado
      // o que sea Administrador
      if (payment.external_reference) {
        const [courseId, userId] = payment.external_reference.split('|');
        const authenticatedUserId = String(req.user?.userId);
        const paymentUserId = userId ? String(userId) : null;
        
        if (paymentUserId && !(Array.isArray(req.user?.category) && req.user.category.includes('Administrador')) && authenticatedUserId !== paymentUserId) {
          logger.warning(`Usuario ${authenticatedUserId} intentó acceder a pago del usuario ${paymentUserId}`);
          return res.status(403).json({
            status: "error",
            msg: "No tienes permisos para acceder a este pago",
            payload: {},
          });
        }
      }

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

  // Webhook de Mercado Pago (Checkout Pro)
  // Doc: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/payment-notifications
  // Si MERCADOPAGO_WEBHOOK_SECRET está definido, se valida la firma x-signature (HMAC SHA256).
  async handleWebhook(req, res) {
    try {
      const body = req.body;
      const signature = req.headers['x-signature'];
      const requestId = req.headers['x-request-id'];
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

      if (process.env.LOGGER_ENV === 'development') {
        logger.info(`Webhook recibido - Signature: ${signature ? 'presente' : 'ausente'}, Request ID: ${requestId || 'ausente'}`);
      }

      // Validación de firma (recomendado en producción)
      if (secret && signature) {
        const dataId = req.query['data.id'] || body?.data?.id;
        const parts = signature.split(',');
        let ts, v1;
        parts.forEach((part) => {
          const [key, value] = part.split('=').map((s) => s.trim());
          if (key === 'ts') ts = value;
          if (key === 'v1') v1 = value;
        });
        const manifest = `id:${dataId || ''};request-id:${requestId || ''};ts:${ts || ''};`;
        const crypto = await import('crypto');
        const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
        if (computed !== v1) {
          logger.warning('Webhook: firma inválida');
          return res.status(401).json({ status: "error", msg: "Firma inválida", payload: {} });
        }
      } else if (secret && !signature) {
        logger.warning('Webhook: MERCADOPAGO_WEBHOOK_SECRET definido pero no se recibió x-signature');
        return res.status(401).json({ status: "error", msg: "Firma requerida", payload: {} });
      }

      const type = body?.type || (body?.action ? body.action.split('.')[0] : null);
      if (!body || !type) {
        logger.warning('Webhook recibido sin tipo válido:', body);
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
      return res.status(200).json({
        status: "error",
        msg: "Error al procesar webhook (logueado para revisión)",
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

  // Crear reembolso (solo el dueño del pago o administrador)
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

      const payment = await mercadoPagoService.getPayment(paymentId);
      if (payment.external_reference) {
        const [, userId] = payment.external_reference.split('|');
        const authenticatedUserId = String(req.user?.userId);
        const paymentUserId = userId ? String(userId) : null;
        if (paymentUserId && !(Array.isArray(req.user?.category) && req.user.category.includes('Administrador')) && authenticatedUserId !== paymentUserId) {
          logger.warning(`Usuario ${authenticatedUserId} intentó reembolsar pago del usuario ${paymentUserId}`);
          return res.status(403).json({
            status: "error",
            msg: "No tienes permisos para reembolsar este pago",
            payload: {},
          });
        }
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

      // VALIDACIÓN DE SEGURIDAD: Verificar que el userId del pago coincida con el usuario autenticado
      // O permitir si es Administrador
      const authenticatedUserId = String(req.user?.userId);
      const paymentUserId = String(userId);
      
      if (!(Array.isArray(req.user?.category) && req.user.category.includes('Administrador')) && authenticatedUserId !== paymentUserId) {
        logger.warning(`Usuario ${authenticatedUserId} intentó procesar pago del usuario ${paymentUserId}`);
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para procesar este pago",
          payload: {},
        });
      }

      // Datos para el registro en processed_payments (y para respuestas)
      const course = await coursesService.findByCourseId(courseId);
      const user = await usersModel.findById(userId);
      const courseName = course?.courseName || "Curso no encontrado";
      const userEmail = user?.email || "";
      const userFirstName = user?.firstName || "";
      const userLastName = user?.lastName || "";

      // Agregar el curso al usuario usando el servicio existente
      // purchaseCourse ya tiene protección contra duplicados (verifica si ya está comprado)
      let result = null;
      let alreadyPurchased = false;
      try {
        result = await coursesService.purchaseCourse(userId, courseId);
      } catch (error) {
        if (error.message && error.message.includes("ya ha comprado")) {
          alreadyPurchased = true;
        } else {
          throw error;
        }
      }

      // Persistir en processed_payments si aún no existe (idempotente)
      const existingProcessed = await processedPaymentsModel.findByPaymentId(String(paymentId));
      if (!existingProcessed) {
        try {
          await processedPaymentsModel.create({
            paymentId: String(paymentId),
            courseId,
            courseName,
            userId,
            userEmail,
            userFirstName,
            userLastName,
            transactionAmount: payment.transaction_amount ?? 0,
            currency: payment.currency_id ?? "USD",
            paymentStatus: payment.status ?? "approved",
            paymentStatusDetail: payment.status_detail ?? "",
            externalReference,
            alreadyPurchased,
            errorMessage: null,
          });
          logger.info(`Pago ${paymentId} registrado en processed_payments desde processSuccessfulPayment`);
        } catch (dbError) {
          logger.error(`Error al guardar pago ${paymentId} en processed_payments:`, dbError);
        }
      }

      // Enviar email de confirmación de compra al usuario (no bloquear respuesta si falla)
      if (userEmail && !alreadyPurchased) {
        try {
          await userService.sendPurchaseConfirmationEmail({
            to: userEmail,
            userName: [userFirstName, userLastName].filter(Boolean).join(" ") || "Usuario",
            courseName,
            paymentId: String(paymentId),
            amount: payment.transaction_amount ?? 0,
            currency: payment.currency_id ?? "USD",
            courseId,
          });
        } catch (emailErr) {
          logger.error("Error al enviar email de confirmación de compra en processSuccessfulPayment:", emailErr?.message);
        }
      }

      return res.status(200).json({
        status: "success",
        msg: alreadyPurchased ? "El curso ya estaba asociado a este usuario" : "Pago procesado y curso agregado al usuario exitosamente",
        payload: {
          ...(result || {}),
          paymentId,
          alreadyPurchased,
        },
      });
    } catch (error) {
      logger.error("Error en processSuccessfulPayment:", error);
      
      // Si el error es que el curso ya fue comprado, no es un error crítico
      if (error.message && error.message.includes('ya ha comprado')) {
        return res.status(200).json({
          status: "success",
          msg: "El curso ya estaba asociado a este usuario",
          payload: { alreadyPurchased: true },
        });
      }
      
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
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

      // VALIDACIÓN DE SEGURIDAD: Verificar que el pago pertenezca al usuario autenticado
      // o que sea Administrador
      if (payment.external_reference) {
        const [courseId, userId] = payment.external_reference.split('|');
        const authenticatedUserId = String(req.user?.userId);
        const paymentUserId = userId ? String(userId) : null;
        
        // Solo validar si hay userId en el external_reference y el usuario no es Admin
        if (paymentUserId && !(Array.isArray(req.user?.category) && req.user.category.includes('Administrador')) && authenticatedUserId !== paymentUserId) {
          logger.warning(`Usuario ${authenticatedUserId} intentó verificar pago del usuario ${paymentUserId}`);
          return res.status(403).json({
            status: "error",
            msg: "No tienes permisos para verificar este pago",
            payload: {},
          });
        }
      }

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

  /**
   * [SOLO DESARROLLO] Simula la finalización de una compra sin pasar por Mercado Pago.
   * Asigna el curso al usuario y opcionalmente registra un pago en processed_payments con ID "DEV-...".
   * En producción: eliminar esta ruta o hacer que devuelva 404.
   * Ver MERCADOPAGO_SETUP.md y comentarios en mercadopago.routes.js.
   */
  async devCompletePurchase(req, res) {
    const isDev = process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_PAYMENT === "true";
    if (!isDev) {
      return res.status(404).json({
        status: "error",
        msg: "No disponible",
        payload: {},
      });
    }

    try {
      const { courseId, userId } = req.body;
      if (!courseId || !userId) {
        return res.status(400).json({
          status: "error",
          msg: "courseId y userId son requeridos",
          payload: {},
        });
      }

      const authenticatedUserId = String(req.user?.userId);
      const targetUserId = String(userId);
      const isAdmin = Array.isArray(req.user?.category) && req.user.category.includes("Administrador");
      if (!isAdmin && authenticatedUserId !== targetUserId) {
        logger.warning(`Dev purchase: usuario ${authenticatedUserId} intentó comprar como ${targetUserId}`);
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para simular esta compra",
          payload: {},
        });
      }

      const course = await coursesService.findByCourseId(courseId);
      if (!course) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      const user = await usersModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      let result = null;
      let alreadyPurchased = false;
      try {
        result = await coursesService.purchaseCourse(userId, courseId);
      } catch (error) {
        if (error.message && error.message.includes("ya ha comprado")) {
          alreadyPurchased = true;
        } else {
          throw error;
        }
      }

      const devPaymentId = `DEV-${Date.now()}-${courseId}`;
      const externalReference = `${courseId}|${userId}`;
      const existingProcessed = await processedPaymentsModel.findByPaymentId(devPaymentId);
      if (!existingProcessed) {
        try {
          await processedPaymentsModel.create({
            paymentId: devPaymentId,
            courseId,
            courseName: course.courseName || course.name || "Curso",
            userId,
            userEmail: user.email || "",
            userFirstName: user.firstName || "",
            userLastName: user.lastName || "",
            transactionAmount: course.price ?? 0,
            currency: course.currency ?? "USD",
            paymentStatus: "approved",
            paymentStatusDetail: "dev_simulation",
            externalReference,
            alreadyPurchased,
            errorMessage: null,
          });
          logger.info(`Dev: pago simulado ${devPaymentId} registrado en processed_payments`);
        } catch (dbError) {
          logger.error("Error al guardar pago dev en processed_payments:", dbError);
        }
      }

      // Enviar email de confirmación de compra al usuario (no bloquear respuesta si falla)
      if (user.email && !alreadyPurchased) {
        try {
          await userService.sendPurchaseConfirmationEmail({
            to: user.email,
            userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Usuario",
            courseName: course.courseName || course.name || "Curso",
            paymentId: devPaymentId,
            amount: course.price ?? 0,
            currency: course.currency ?? "USD",
            courseId,
          });
        } catch (emailErr) {
          logger.error("Error al enviar email de confirmación en devCompletePurchase:", emailErr?.message);
        }
      }

      return res.status(200).json({
        status: "success",
        msg: alreadyPurchased ? "El curso ya estaba asociado a este usuario" : "Compra simulada (dev). Curso asignado.",
        payload: {
          paymentId: devPaymentId,
          courseId,
          userId,
          alreadyPurchased,
          ...(result || {}),
        },
      });
    } catch (error) {
      logger.error("Error en devCompletePurchase:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener pagos procesados (solo Administrador)
  async getProcessedPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const paymentId = (req.query.paymentId || "").trim();
      const courseId = (req.query.courseId || "").trim();
      const courseName = (req.query.courseName || "").trim();
      const userEmail = (req.query.userEmail || "").trim();
      const userId = (req.query.userId || "").trim();
      const paymentStatus = (req.query.paymentStatus || "").trim();
      const currency = (req.query.currency || "").trim();

      const mongoose = await import("mongoose");
      const ObjectId = mongoose.default?.Types?.ObjectId;
      const filters = {};
      if (paymentId) filters.paymentId = new RegExp(paymentId, "i");
      if (courseId) filters.courseId = new RegExp(courseId, "i");
      if (courseName) filters.courseName = new RegExp(courseName, "i");
      if (userEmail) filters.userEmail = new RegExp(userEmail, "i");
      if (userId) {
        try {
          if (ObjectId && ObjectId.isValid(userId)) {
            filters.userId = new ObjectId(userId);
          } else {
            filters.userId = userId;
          }
        } catch (_) {
          filters.userId = userId;
        }
      }
      if (paymentStatus) filters.paymentStatus = paymentStatus;
      if (currency) filters.currency = new RegExp(currency, "i");

      const result = await processedPaymentsModel.getPaginated(filters, page, limit);

      return res.status(200).json({
        status: "success",
        msg: "Pagos procesados obtenidos exitosamente",
        payload: {
          docs: result.docs,
          totalDocs: result.totalDocs,
          limit: result.limit,
          page: result.page,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      });
    } catch (error) {
      logger.error("Error en getProcessedPayments:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
        payload: {},
      });
    }
  }
}

export const mercadoPagoController = new MercadoPagoController();
