import express from "express";
import { paymentMethodsController } from "../controllers/payment-methods.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

export const paymentMethodsRouter = express.Router();

// Todas las rutas de métodos de pago requieren autenticación
paymentMethodsRouter.post("/users/:userId/payment-methods", authenticateToken, paymentMethodsController.addPaymentMethod);
paymentMethodsRouter.get("/users/:userId/payment-methods", authenticateToken, paymentMethodsController.getUserPaymentMethods);
paymentMethodsRouter.delete("/users/:userId/payment-methods/:tokenId", authenticateToken, paymentMethodsController.removePaymentMethod);
paymentMethodsRouter.put("/users/:userId/payment-methods/:tokenId/default", authenticateToken, paymentMethodsController.setDefaultPaymentMethod);
