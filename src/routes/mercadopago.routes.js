import express from "express";
import { mercadoPagoController } from "../controllers/mercadopago.controller.js";
import { authenticateToken, validateUserOwnership, authorizeByCategory } from "../middleware/auth.middleware.js";

export const mercadoPagoRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Webhook de Mercado Pago (público, MercadoPago lo llama)
mercadoPagoRouter.post("/webhook", mercadoPagoController.handleWebhook);

// Obtener métodos de pago (público para mostrar opciones)
mercadoPagoRouter.get("/payment-methods", mercadoPagoController.getPaymentMethods);

// ========== RUTAS PROTEGIDAS ==========

// Crear preferencia de pago (valida que el usuario solo cree preferencias para sí mismo, a menos que sea admin)
mercadoPagoRouter.post("/create-preference", authenticateToken, validateUserOwnership(), mercadoPagoController.createPreference);

// Crear preferencia de pago para plan premium (gestoría)
mercadoPagoRouter.post("/create-premium-preference", authenticateToken, mercadoPagoController.createPremiumPreference);

// Obtener preferencia
mercadoPagoRouter.get("/preference/:preferenceId", authenticateToken, mercadoPagoController.getPreference);

// Obtener pago
mercadoPagoRouter.get("/payment/:paymentId", authenticateToken, mercadoPagoController.getPayment);

// Crear pago directo
mercadoPagoRouter.post("/create-payment", authenticateToken, mercadoPagoController.createPayment);

// Crear reembolso
mercadoPagoRouter.post("/refund/:paymentId", authenticateToken, mercadoPagoController.refundPayment);

// Verificar estado de pago
mercadoPagoRouter.get("/payment-status/:paymentId", authenticateToken, mercadoPagoController.checkPaymentStatus);

// Procesar pago exitoso
mercadoPagoRouter.post("/process-successful-payment", authenticateToken, mercadoPagoController.processSuccessfulPayment);

// ---------- SOLO DESARROLLO: simular compra sin Mercado Pago (sandbox no redirige a localhost).
// En producción: eliminar esta ruta o no exponer el botón en el front. Ver MERCADOPAGO_SETUP.md.
mercadoPagoRouter.post("/dev-complete-purchase", authenticateToken, mercadoPagoController.devCompletePurchase);

// ---------- SOLO DESARROLLO: simular activación de plan premium sin Mercado Pago.
mercadoPagoRouter.post("/dev-complete-premium", authenticateToken, mercadoPagoController.devCompletePremium);

// ---------- SOLO DESARROLLO: simular pago de trámite de flota sin Mercado Pago.
mercadoPagoRouter.post("/dev-complete-procedure", authenticateToken, mercadoPagoController.devCompleteProcedure);

// Canjear curso gratuito (plan gestoría): verifica freeCourses, asigna curso, resta 1, registra pago $0.
mercadoPagoRouter.post("/redeem-free-course", authenticateToken, mercadoPagoController.redeemFreeCourse);

// Obtener pagos procesados (solo Administrador)
mercadoPagoRouter.get("/processed-payments", authenticateToken, authorizeByCategory(["Administrador"]), mercadoPagoController.getProcessedPayments);
