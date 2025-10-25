import express from "express";
import { mercadoPagoController } from "../controllers/mercadopago.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

export const mercadoPagoRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Webhook de Mercado Pago (público, MercadoPago lo llama)
mercadoPagoRouter.post("/webhook", mercadoPagoController.handleWebhook);

// Obtener métodos de pago (público para mostrar opciones)
mercadoPagoRouter.get("/payment-methods", mercadoPagoController.getPaymentMethods);

// ========== RUTAS PROTEGIDAS ==========

// Crear preferencia de pago
mercadoPagoRouter.post("/create-preference", authenticateToken, mercadoPagoController.createPreference);

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
