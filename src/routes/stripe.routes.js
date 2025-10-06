import express from "express";
import { stripeController } from "../controllers/stripe.controller.js";

export const stripeRouter = express.Router();

// Crear sesión de pago (Checkout)
stripeRouter.post("/create-payment-session", stripeController.createPaymentSession);

// Crear Payment Intent (para pagos más avanzados)
stripeRouter.post("/create-payment-intent", stripeController.createPaymentIntent);

// Confirmar pago
stripeRouter.post("/confirm-payment", stripeController.confirmPayment);

// Recuperar sesión de pago
stripeRouter.get("/session/:sessionId", stripeController.retrieveSession);

// Crear cliente
stripeRouter.post("/create-customer", stripeController.createCustomer);

// Recuperar cliente
stripeRouter.get("/customer/:customerId", stripeController.retrieveCustomer);

// Crear reembolso
stripeRouter.post("/create-refund", stripeController.createRefund);

// Webhook de Stripe (importante: debe ser POST y sin middleware de JSON)
stripeRouter.post("/webhook", express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Procesar pago exitoso
stripeRouter.post("/process-successful-payment", stripeController.processSuccessfulPayment);
