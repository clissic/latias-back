import express from "express";
import { certificatesController } from "../controllers/certificates.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const certificatesRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener certificado por ID (público)
certificatesRouter.get("/id/:id", certificatesController.findById);

// Obtener certificados por barco (público)
certificatesRouter.get("/boat/:boatId", certificatesController.findByBoatId);

// Obtener certificados por estado (público)
certificatesRouter.get("/status/:status", certificatesController.findByStatus);

// Obtener certificados por barco y estado (público)
certificatesRouter.get("/boat/:boatId/status/:status", certificatesController.findByBoatIdAndStatus);

// Obtener certificados vencidos (público)
certificatesRouter.get("/expired", certificatesController.findExpired);

// Obtener certificados próximos a vencer (público)
certificatesRouter.get("/expiring-soon", certificatesController.findExpiringSoon);

// ========== RUTAS PROTEGIDAS PARA ADMINISTRADORES ==========

// Obtener todos los certificados (para administradores)
certificatesRouter.get("/", authenticateToken, authorizeByCategory(['Administrador']), certificatesController.getAll);

// Crear nuevo certificado (autenticado, no solo administradores)
certificatesRouter.post("/create", authenticateToken, certificatesController.create);

// Actualizar certificado (autenticado, no solo administradores)
certificatesRouter.put("/update/:id", authenticateToken, certificatesController.updateOne);

// Eliminar certificado (autenticado, no solo administradores)
certificatesRouter.delete("/delete/:id", authenticateToken, certificatesController.deleteOne);
