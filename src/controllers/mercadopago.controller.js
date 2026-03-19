import { mercadoPagoService } from "../services/mercadopago.service.js";
import { coursesService } from "../services/courses.service.js";
import { userService } from "../services/users.service.js";
import { shipRequestsService } from "../services/ship-requests.service.js";
import { processedPaymentsModel } from "../DAO/models/processed-payments.model.js";
import { pendingProcedurePaymentsModel } from "../DAO/models/pending-procedure-payments.model.js";
import { usersModel } from "../DAO/models/users.model.js";
import { boatsModel } from "../DAO/models/boats.model.js";
import { logger } from "../utils/logger.js";
import { walletService } from "../services/wallet.service.js";

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
      const { courseId, courseName, price, currency, userId, discountCode } = req.body;

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
        payer: userEmail
          ? {
              email: userEmail,
              name: userFirstName || undefined,
              surname: userLastName || undefined,
            }
          : undefined,
        discountCode,
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

  // Crear preferencia de pago para plan premium (gestoría)
  async createPremiumPreference(req, res) {
    try {
      const { planId, userId } = req.body;
      const validPlans = ['basico', 'navegante', 'capitan'];
      if (!planId || !validPlans.includes(planId)) {
        return res.status(400).json({
          status: "error",
          msg: "planId es requerido y debe ser: basico, navegante o capitan",
          payload: {},
        });
      }
      if (!userId) {
        return res.status(400).json({
          status: "error",
          msg: "userId es requerido",
          payload: {},
        });
      }
      const authenticatedUserId = String(req.user?.userId);
      const isAdmin = Array.isArray(req.user?.category) && req.user.category.includes('Administrador');
      if (!isAdmin && authenticatedUserId !== String(userId)) {
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para crear esta preferencia",
          payload: {},
        });
      }
      // Verificar si el usuario ya tiene un plan activo igual o superior
      try {
        const user = await usersModel.findById(userId);
        if (user?.premium?.isActive && user.premium?.subscription) {
          const current = String(user.premium.subscription || "").toLowerCase();
          const target = String(planId || "").toLowerCase();
          const rankOf = (planName) => {
            if (!planName) return 0;
            if (planName.includes("capitan") || planName.includes("capitán")) return 3;
            if (planName.includes("navegante")) return 2;
            if (planName.includes("basico") || planName.includes("básico")) return 1;
            return 0;
          };
          const currentRank = rankOf(current);
          const targetRank = rankOf(target);
          if (currentRank > 0 && targetRank > 0 && currentRank >= targetRank) {
            return res.status(400).json({
              status: "error",
              msg: "Ya cuentas con un plan igual o con mayores beneficios.",
              payload: {
                code: "PLAN_ALREADY_BETTER_OR_EQUAL",
                currentSubscription: user.premium.subscription,
              },
            });
          }
        }
      } catch (e) {
        logger.error("Error verificando plan premium existente:", e?.message || e);
        // No bloqueamos la compra si hay un error de lectura, solo lo registramos.
      }
      const userEmail = req.user?.email || null;
      const userFirstName = req.user?.firstName || null;
      const userLastName = req.user?.lastName || null;
      const preference = await mercadoPagoService.createPremiumPreference({
        planId,
        userId: String(userId),
        payer: userEmail ? { email: userEmail, name: userFirstName, surname: userLastName } : undefined,
      });
      return res.status(200).json({
        status: "success",
        msg: "Preferencia de pago creada",
        payload: {
          preferenceId: preference.id,
          initPoint: preference.init_point,
          sandboxInitPoint: preference.sandbox_init_point,
        },
      });
    } catch (error) {
      logger.error("Error en createPremiumPreference:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
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

      if (payment.live_mode === true && payment.external_reference) {
        const parts = payment.external_reference.split("|");
        const isCourse = parts.length >= 2 && parts[0] !== "premium" && parts[0] !== "procedure";
        if (isCourse) {
          const [courseId, userIdBuyer] = parts;
          try {
            const course = await coursesService.findByCourseId(courseId);
            const instructorId = course?.instructor?._id ?? course?.instructor;
            if (instructorId) {
              const refundAmount = amount != null ? Number(amount) : payment.transaction_amount ?? 0;
              if (Number.isFinite(refundAmount) && refundAmount > 0) {
                const { transactionsModel } = await import("../DAO/models/transactions.model.js");
                const existingRefund = await transactionsModel.findByPaymentId(`refund-${paymentId}`);
                if (!existingRefund) {
                  await walletService.registerRefund({
                    userId: instructorId,
                    amount: refundAmount,
                    currency: payment.currency_id || "USD",
                    paymentId: `refund-${paymentId}`,
                    sourceType: "course",
                    sourceId: course._id ?? courseId,
                  });
                  logger.info(`Reembolso ${paymentId} registrado en wallet para instructor ${instructorId}`);
                }
              }
            }
          } catch (walletErr) {
            logger.error(`Error registrando reembolso en wallet para paymentId ${paymentId}:`, walletErr);
          }
        }
      }

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

      // Parsear external_reference: "courseId|userId" (curso) o "premium|planId|userId" (plan gestoría)
      const externalReference = payment.external_reference;
      if (!externalReference) {
        return res.status(400).json({
          status: "error",
          msg: "El pago no tiene external_reference válido",
          payload: {},
        });
      }

      const parts = externalReference.split('|');
      const isPremium = parts[0] === 'premium';

      if (isPremium) {
        if (parts.length < 3 || !parts[1] || !parts[2]) {
          return res.status(400).json({
            status: "error",
            msg: "External reference premium malformado",
            payload: {},
          });
        }
        const planId = parts[1];
        const userId = parts[2];
        const authenticatedUserId = String(req.user?.userId);
        if (!(Array.isArray(req.user?.category) && req.user.category.includes('Administrador')) && authenticatedUserId !== String(userId)) {
          logger.warning(`Usuario ${authenticatedUserId} intentó procesar pago premium del usuario ${userId}`);
          return res.status(403).json({
            status: "error",
            msg: "No tienes permisos para procesar este pago",
            payload: {},
          });
        }
        await userService.activatePremiumPlan(userId, planId);
        const user = await usersModel.findById(userId);
        const planNames = { basico: "Plan Básico", navegante: "Plan Navegante", capitan: "Plan Capitán" };
        const courseName = planNames[planId] || `Plan ${planId}`;
        const existingProcessed = await processedPaymentsModel.findByPaymentId(String(paymentId));
        if (!existingProcessed) {
          try {
            await processedPaymentsModel.create({
              paymentId: String(paymentId),
              user: { id: userId, email: user?.email || "", firstName: user?.firstName || "", lastName: user?.lastName || "" },
              item: { type: "subscription", id: planId, name: courseName },
              amount: { value: payment.transaction_amount ?? 0, currency: payment.currency_id ?? "USD" },
              paymentStatus: payment.status ?? "approved",
              paymentStatusDetail: payment.status_detail ?? "",
              externalReference,
              errorMessage: null,
            });
          } catch (dbError) {
            logger.error(`Error al guardar pago premium ${paymentId} en processed_payments:`, dbError);
          }
        }
        return res.status(200).json({
          status: "success",
          msg: "Pago procesado y plan premium activado correctamente",
          payload: { paymentId, premium: true },
        });
      }

      // Trámite de flota: procedure|pendingId (o procedure|requestId en flujo antiguo)
      const isProcedure = parts[0] === "procedure";
      if (isProcedure && parts.length >= 2 && parts[1]) {
        const refId = parts[1];
        const pending = await pendingProcedurePaymentsModel.findById(refId);
        let request;
        if (pending) {
          const authenticatedUserId = String(req.user?.userId);
          if (authenticatedUserId !== String(pending.owner)) {
            return res.status(403).json({
              status: "error",
              msg: "No tienes permisos para procesar este pago",
              payload: {},
            });
          }
          request = await shipRequestsService.create({
            ship: pending.ship,
            owner: pending.owner,
            manager: pending.manager,
            type: pending.type || ["Solicitud de flota"],
            procedureTypes: pending.procedureTypes,
            notes: pending.notes,
            certificate: pending.certificate,
            number: pending.number,
            certificateIssueDate: pending.certificateIssueDate,
            certificateExpirationDate: pending.certificateExpirationDate,
            status: "Pendiente",
          });
          await pendingProcedurePaymentsModel.deleteOne(refId);
        } else {
          try {
            request = await shipRequestsService.getById(refId);
          } catch (e) {
            return res.status(404).json({ status: "error", msg: "Solicitud o sesión de pago no encontrada", payload: {} });
          }
          const ownerId = request?.owner?._id || request?.owner;
          const authenticatedUserId = String(req.user?.userId);
          if (!(Array.isArray(req.user?.category) && req.user.category.includes("Administrador")) && authenticatedUserId !== String(ownerId)) {
            return res.status(403).json({
              status: "error",
              msg: "No tienes permisos para procesar este pago",
              payload: {},
            });
          }
          if (request.status === "Pendiente de pago") {
            await shipRequestsService.updateStatus(refId, "Pendiente");
            const managerUser = request?.manager;
            const owner = request?.owner;
            const boat = request?.ship ? await boatsModel.findById(request.ship._id || request.ship) : null;
            if (managerUser?.email && owner && boat) {
              await userService.sendGestorFlotaProcedureRequestEmail({
                to: managerUser.email,
                requester: { firstName: owner.firstName, lastName: owner.lastName, email: owner.email, phone: owner.phone },
                boat: {
                  name: boat.name,
                  registrationNumber: boat.registrationNumber,
                  boatType: boat.boatType,
                  displacement: boat.displacement,
                  registrationCountry: boat.registrationCountry,
                  currentPort: boat.currentPort,
                  registrationPort: boat.registrationPort,
                },
                certificate: {
                  certificateType: request.certificate,
                  number: request.number,
                  issueDate: request.certificateIssueDate || request.requestedAt,
                  expirationDate: request.certificateExpirationDate || null,
                },
                procedureTypes: request.procedureTypes || [],
                notes: request.notes || "",
              });
            }
          }
        }
        const owner = request?.owner;
        const ownerId = owner?._id || request?.owner;
        const existingProcessed = await processedPaymentsModel.findByPaymentId(String(paymentId));
        if (!existingProcessed && ownerId) {
          try {
            const shipRef = request?.ship;
            const shipId = shipRef?._id ?? shipRef;
            await processedPaymentsModel.create({
              paymentId: String(paymentId),
              user: { id: ownerId, email: owner?.email || "", firstName: owner?.firstName || "", lastName: owner?.lastName || "" },
              item: { type: "procedure", id: request?._id ? String(request._id) : undefined, name: "Trámite de flota - Solicitud" },
              amount: { value: payment.transaction_amount ?? 0, currency: payment.currency_id ?? "USD" },
              paymentStatus: payment.status ?? "approved",
              paymentStatusDetail: payment.status_detail ?? "",
              externalReference,
              metadata: {
                requestType: Array.isArray(request?.type) && request.type[0] ? request.type[0] : undefined,
                procedureTypes: request?.procedureTypes || [],
                shipId: shipId || undefined,
                shipName: shipRef?.name || undefined,
                registrationNumber: shipRef?.registrationNumber || undefined,
              },
              errorMessage: null,
            });
            logger.info(`Pago trámite ${paymentId} registrado en processed_payments desde processSuccessfulPayment`);
          } catch (dbError) {
            logger.error(`Error al guardar pago trámite ${paymentId} en processed_payments:`, dbError);
          }
        }
        if (payment.live_mode === true && request?.manager) {
          try {
            await walletService.registerServicePaymentForGestor({
              requestId: request?._id ?? refId,
              request,
              payment,
              paymentId,
            });
          } catch (walletErr) {
            logger.error(`Error registrando wallet gestoría para paymentId ${paymentId}:`, walletErr);
          }
        }
        if (pending && request?.manager?.email && owner && request?.ship) {
          const boat = await boatsModel.findById(request.ship._id || request.ship);
          if (boat) {
            await userService.sendGestorFlotaProcedureRequestEmail({
              to: request.manager.email,
              requester: { firstName: owner.firstName, lastName: owner.lastName, email: owner.email, phone: owner.phone },
              boat: {
                name: boat.name,
                registrationNumber: boat.registrationNumber,
                boatType: boat.boatType,
                displacement: boat.displacement,
                registrationCountry: boat.registrationCountry,
                currentPort: boat.currentPort,
                registrationPort: boat.registrationPort,
              },
              certificate: {
                certificateType: request.certificate,
                number: request.number,
                issueDate: request.certificateIssueDate || request.requestedAt,
                expirationDate: request.certificateExpirationDate || null,
              },
              procedureTypes: request.procedureTypes || [],
              notes: request.notes || "",
            });
          }
        }
        return res.status(200).json({
          status: "success",
          msg: "Pago del trámite procesado correctamente. La solicitud quedó activa para tu gestor.",
          payload: { paymentId, procedure: true, requestId: request?._id || refId },
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

      const course = await coursesService.findByCourseId(courseId);
      const user = await usersModel.findById(userId);
      const courseName = course?.courseName || "Curso no encontrado";
      const userEmail = user?.email || "";
      const userFirstName = user?.firstName || "";
      const userLastName = user?.lastName || "";

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

      const existingProcessed = await processedPaymentsModel.findByPaymentId(String(paymentId));
      if (!existingProcessed) {
        try {
          await processedPaymentsModel.create({
            paymentId: String(paymentId),
            user: { id: userId, email: userEmail, firstName: userFirstName, lastName: userLastName },
            item: { type: "course", id: courseId, name: courseName },
            amount: { value: payment.transaction_amount ?? 0, currency: payment.currency_id ?? "USD" },
            paymentStatus: payment.status ?? "approved",
            paymentStatusDetail: payment.status_detail ?? "",
            externalReference,
            metadata: alreadyPurchased ? { alreadyPurchased: true } : undefined,
            errorMessage: null,
          });
          logger.info(`Pago ${paymentId} registrado en processed_payments desde processSuccessfulPayment`);
        } catch (dbError) {
          logger.error(`Error al guardar pago ${paymentId} en processed_payments:`, dbError);
        }
      }

      // Registrar ingreso para el instructor (wallet), solo si es un pago real (no dev / free)
      try {
        if (payment.status === "approved" && payment.live_mode === true) {
          await walletService.registerCourseSaleForInstructor({
            courseId,
            payment,
            paymentId,
          });
        } else {
          logger.info(
            `processSuccessfulPayment: pago ${paymentId} no registra wallet (status=${payment.status}, live_mode=${payment.live_mode})`
          );
        }
      } catch (walletErr) {
        logger.error(
          `Error registrando transacción de wallet para paymentId ${paymentId}, courseId ${courseId}:`,
          walletErr
        );
      }

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
            user: { id: userId, email: user.email || "", firstName: user.firstName || "", lastName: user.lastName || "" },
            item: { type: "course", id: courseId, name: course.courseName || course.name || "Curso" },
            amount: { value: course.price ?? 0, currency: course.currency ?? "USD" },
            paymentStatus: "approved",
            paymentStatusDetail: "dev_simulation",
            externalReference,
            provider: "mercadopago",
            metadata: { alreadyPurchased },
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

  /**
   * [SOLO DESARROLLO] Simula la activación de un plan premium sin pasar por Mercado Pago.
   * Activa el plan en el usuario y opcionalmente registra un pago en processed_payments con ID "DEV-premium-...".
   */
  async devCompletePremium(req, res) {
    const isDev = process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_PAYMENT === "true";
    if (!isDev) {
      return res.status(404).json({
        status: "error",
        msg: "No disponible",
        payload: {},
      });
    }

    try {
      const { planId, userId } = req.body;
      const validPlans = ["basico", "navegante", "capitan"];
      if (!planId || !userId || !validPlans.includes(planId)) {
        return res.status(400).json({
          status: "error",
          msg: "planId (basico, navegante o capitan) y userId son requeridos",
          payload: {},
        });
      }

      const authenticatedUserId = String(req.user?.userId);
      const targetUserId = String(userId);
      const isAdmin = Array.isArray(req.user?.category) && req.user.category.includes("Administrador");
      if (!isAdmin && authenticatedUserId !== targetUserId) {
        logger.warning(`Dev premium: usuario ${authenticatedUserId} intentó activar plan como ${targetUserId}`);
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para simular esta suscripción",
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

      await userService.activatePremiumPlan(userId, planId);

      const planNames = { basico: "Plan Básico", navegante: "Plan Navegante", capitan: "Plan Capitán" };
      const planPrices = { basico: 249, navegante: 359, capitan: 699 };
      const devPaymentId = `DEV-premium-${Date.now()}-${planId}`;
      const externalReference = `premium|${planId}|${userId}`;
      const existingProcessed = await processedPaymentsModel.findByPaymentId(devPaymentId);
      if (!existingProcessed) {
        try {
          await processedPaymentsModel.create({
            paymentId: devPaymentId,
            user: { id: userId, email: user.email || "", firstName: user.firstName || "", lastName: user.lastName || "" },
            item: { type: "subscription", id: planId, name: planNames[planId] || `Plan ${planId}` },
            amount: { value: planPrices[planId] ?? 0, currency: "USD" },
            paymentStatus: "approved",
            paymentStatusDetail: "dev_simulation",
            externalReference,
            provider: "mercadopago",
            errorMessage: null,
          });
          logger.info(`Dev: suscripción premium ${devPaymentId} registrada en processed_payments`);
        } catch (dbError) {
          logger.error("Error al guardar pago dev premium en processed_payments:", dbError);
        }
      }

      return res.status(200).json({
        status: "success",
        msg: "Suscripción premium simulada (dev). Plan activado.",
        payload: {
          paymentId: devPaymentId,
          planId,
          userId,
        },
      });
    } catch (error) {
      logger.error("Error en devCompletePremium:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
        payload: {},
      });
    }
  }

  /**
   * [SOLO DESARROLLO] Simula el pago de un trámite de flota sin pasar por Mercado Pago.
   * Crea el ship-request desde el pending, envía email al gestor y registra el pago en processed_payments con ID "DEV-procedure-...".
   */
  async devCompleteProcedure(req, res) {
    const isDev = process.env.NODE_ENV === "development" || process.env.ENABLE_DEV_PAYMENT === "true";
    if (!isDev) {
      return res.status(404).json({
        status: "error",
        msg: "No disponible",
        payload: {},
      });
    }

    try {
      const { pendingId, userId } = req.body;
      if (!pendingId || !userId) {
        return res.status(400).json({
          status: "error",
          msg: "pendingId y userId son requeridos",
          payload: {},
        });
      }

      const authenticatedUserId = String(req.user?.userId);
      const targetUserId = String(userId);
      const isAdmin = Array.isArray(req.user?.category) && req.user.category.includes("Administrador");
      if (!isAdmin && authenticatedUserId !== targetUserId) {
        logger.warning(`Dev procedure: usuario ${authenticatedUserId} intentó simular pago trámite como ${targetUserId}`);
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para simular este pago",
          payload: {},
        });
      }

      const pending = await pendingProcedurePaymentsModel.findById(pendingId);
      if (!pending) {
        return res.status(404).json({
          status: "error",
          msg: "Sesión de pago no encontrada o ya fue utilizada",
          payload: {},
        });
      }
      if (String(pending.owner) !== targetUserId) {
        return res.status(403).json({
          status: "error",
          msg: "No eres el titular de esta solicitud",
          payload: {},
        });
      }

      const request = await shipRequestsService.create({
        ship: pending.ship,
        owner: pending.owner,
        manager: pending.manager,
        type: pending.type || ["Solicitud de flota"],
        procedureTypes: pending.procedureTypes,
        notes: pending.notes,
        certificate: pending.certificate,
        number: pending.number,
        certificateIssueDate: pending.certificateIssueDate,
        certificateExpirationDate: pending.certificateExpirationDate,
        status: "Pendiente",
      });
      await pendingProcedurePaymentsModel.deleteOne(pendingId);

      const requestPopulated = await shipRequestsService.getById(request._id);
      const managerUser = requestPopulated?.manager;
      const owner = requestPopulated?.owner;
      const boat = requestPopulated?.ship ? await boatsModel.findById(requestPopulated.ship._id || requestPopulated.ship) : null;
      if (managerUser?.email && owner && boat) {
        await userService.sendGestorFlotaProcedureRequestEmail({
          to: managerUser.email,
          requester: {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
            phone: owner.phone,
          },
          boat: {
            name: boat.name,
            registrationNumber: boat.registrationNumber,
            boatType: boat.boatType,
            displacement: boat.displacement,
            registrationCountry: boat.registrationCountry,
            currentPort: boat.currentPort,
            registrationPort: boat.registrationPort,
          },
          certificate: {
            certificateType: requestPopulated.certificate,
            number: requestPopulated.number,
            issueDate: requestPopulated.certificateIssueDate || requestPopulated.requestedAt,
            expirationDate: requestPopulated.certificateExpirationDate || null,
          },
          procedureTypes: requestPopulated.procedureTypes || [],
          notes: requestPopulated.notes || "",
        });
      }

      const devPaymentId = `DEV-procedure-${Date.now()}-${pendingId}`;
      const externalReference = `procedure|${pendingId}`;
      const existingProcessed = await processedPaymentsModel.findByPaymentId(devPaymentId);
      if (!existingProcessed) {
        try {
          const shipRef = requestPopulated?.ship;
          const shipId = shipRef?._id ?? shipRef;
          await processedPaymentsModel.create({
            paymentId: devPaymentId,
            user: { id: pending.owner, email: owner?.email || "", firstName: owner?.firstName || "", lastName: owner?.lastName || "" },
            item: { type: "procedure", id: request?._id ? String(request._id) : undefined, name: "Trámite de flota - Solicitud" },
            amount: { value: 30, currency: "USD" },
            paymentStatus: "approved",
            paymentStatusDetail: "dev_simulation",
            externalReference,
            provider: "mercadopago",
            metadata: {
              requestType: Array.isArray(requestPopulated?.type) && requestPopulated.type[0] ? requestPopulated.type[0] : undefined,
              procedureTypes: requestPopulated?.procedureTypes || [],
              shipId: shipId || undefined,
              shipName: shipRef?.name || undefined,
              registrationNumber: shipRef?.registrationNumber || undefined,
            },
            errorMessage: null,
          });
          logger.info(`Dev: pago trámite ${devPaymentId} registrado en processed_payments`);
        } catch (dbError) {
          logger.error("Error al guardar pago dev trámite en processed_payments:", dbError);
        }
      }

      return res.status(200).json({
        status: "success",
        msg: "Pago del trámite simulado (dev). Solicitud creada y enviada al gestor.",
        payload: {
          paymentId: devPaymentId,
          requestId: request._id,
          userId: targetUserId,
        },
      });
    } catch (error) {
      logger.error("Error en devCompleteProcedure:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
        payload: {},
      });
    }
  }

  /**
   * Canje de curso gratuito por plan de gestoría.
   * Verifica que el usuario tenga freeCourses >= 1, asigna el curso, resta 1 a freeCourses
   * y registra el "pago" en processed_payments con ID FREE-... y monto 0.
   */
  async redeemFreeCourse(req, res) {
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
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para canjear este curso",
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

      const freeCourses = user.premium?.freeCourses ?? 0;
      if (freeCourses < 1) {
        return res.status(400).json({
          status: "error",
          msg: "Usuario no tiene cursos gratis disponibles para canjear",
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

      if (!alreadyPurchased) {
        const decrementResult = await userService.decrementFreeCourse(userId);
        if (!decrementResult.updated) {
          logger.warning(`redeemFreeCourse: no se pudo restar freeCourses para userId ${userId}`);
        }
      }

      const freePaymentId = `FREE-${Date.now()}-${courseId}`;
      const externalReference = `${courseId}|${userId}`;
      const existingProcessed = await processedPaymentsModel.findByPaymentId(freePaymentId);
      if (!existingProcessed) {
        try {
          await processedPaymentsModel.create({
            paymentId: freePaymentId,
            user: { id: userId, email: user.email || "", firstName: user.firstName || "", lastName: user.lastName || "" },
            item: { type: "course", id: courseId, name: course.courseName || course.name || "Curso" },
            amount: { value: 0, currency: "USD" },
            paymentStatus: "approved",
            paymentStatusDetail: "free_redeem",
            externalReference,
            provider: "mercadopago",
            metadata: { alreadyPurchased },
            errorMessage: null,
          });
          logger.info(`Canje gratis ${freePaymentId} registrado en processed_payments`);
        } catch (dbError) {
          logger.error("Error al guardar canje gratis en processed_payments:", dbError);
        }
      }

      return res.status(200).json({
        status: "success",
        msg: alreadyPurchased ? "El curso ya estaba asignado a este usuario" : "Curso canjeado correctamente.",
        payload: {
          paymentId: freePaymentId,
          courseId,
          userId,
          alreadyPurchased,
          ...(result || {}),
        },
      });
    } catch (error) {
      logger.error("Error en redeemFreeCourse:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener pagos procesados (solo Administrador). Filtros por nueva estructura: user.*, item.*, amount.*
  async getProcessedPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const paymentId = (req.query.paymentId || "").trim();
      const itemId = (req.query.itemId || req.query.courseId || "").trim();
      const itemName = (req.query.itemName || req.query.courseName || "").trim();
      const itemType = (req.query.itemType || "").trim();
      const userEmail = (req.query.userEmail || "").trim();
      const userId = (req.query.userId || "").trim();
      const paymentStatus = (req.query.paymentStatus || "").trim();
      const currency = (req.query.currency || "").trim();

      const mongoose = await import("mongoose");
      const ObjectId = mongoose.default?.Types?.ObjectId;
      const filters = {};
      if (paymentId) filters.paymentId = new RegExp(paymentId, "i");
      if (itemId) filters["item.id"] = new RegExp(itemId, "i");
      if (itemName) filters["item.name"] = new RegExp(itemName, "i");
      if (itemType) filters["item.type"] = itemType;
      if (userEmail) filters["user.email"] = new RegExp(userEmail, "i");
      if (userId) {
        try {
          filters["user.id"] = ObjectId && ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
        } catch (_) {
          filters["user.id"] = userId;
        }
      }
      if (paymentStatus) filters.paymentStatus = paymentStatus;
      if (currency) filters["amount.currency"] = new RegExp(currency, "i");

      const result = await processedPaymentsModel.getPaginated(filters, page, limit);

      return res.status(200).json({
        status: "success",
        msg: "Pagos procesados obtenidos exitosamente",
        payload: {
          docs: result.docs || [],
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
