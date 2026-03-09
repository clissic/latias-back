import express from "express";
import { discountCodesController } from "../controllers/discount-codes.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const discountCodesRouter = express.Router();

// Todas las rutas son solo para Administrador
discountCodesRouter.get(
  "/",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  discountCodesController.getAll
);

discountCodesRouter.get(
  "/id/:id",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  discountCodesController.findById
);

discountCodesRouter.get(
  "/code/:code",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  discountCodesController.findByCode
);

discountCodesRouter.post(
  "/create",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  discountCodesController.create
);

discountCodesRouter.put(
  "/update/:id",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  discountCodesController.updateOne
);

discountCodesRouter.delete(
  "/delete/:id",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  discountCodesController.deleteOne
);

// Aplicar código (cualquier usuario autenticado)
discountCodesRouter.post(
  "/apply",
  authenticateToken,
  discountCodesController.apply
);
