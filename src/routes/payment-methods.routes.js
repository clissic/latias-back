import express from "express";
import { paymentMethodsController } from "../controllers/payment-methods.controller.js";
import { authenticateToken, validateUserOwnership } from "../middleware/auth.middleware.js";

export const paymentMethodsRouter = express.Router();

// Todas las rutas de métodos de pago requieren autenticación y validación de propiedad
// (valida que el usuario solo acceda a sus propios métodos de pago, a menos que sea admin)
paymentMethodsRouter.post("/users/:userId/payment-methods", authenticateToken, validateUserOwnership(), paymentMethodsController.addPaymentMethod);
paymentMethodsRouter.get("/users/:userId/payment-methods", authenticateToken, validateUserOwnership(), paymentMethodsController.getUserPaymentMethods);
paymentMethodsRouter.delete("/users/:userId/payment-methods/:tokenId", authenticateToken, validateUserOwnership(), paymentMethodsController.removePaymentMethod);
paymentMethodsRouter.put("/users/:userId/payment-methods/:tokenId/default", authenticateToken, validateUserOwnership(), paymentMethodsController.setDefaultPaymentMethod);
