import express from "express";
import { boatsController } from "../controllers/boats.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const boatsRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener todos los barcos activos (público)
boatsRouter.get("/active", boatsController.getActive);

// Obtener barco por ID (público)
boatsRouter.get("/id/:id", boatsController.findById);

// Obtener barco por número de registro (público)
boatsRouter.get("/registration/:registrationNumber", boatsController.findByRegistrationNumber);

// ========== RUTAS AUTENTICADAS ==========

// Obtener barcos por propietario (autenticado)
boatsRouter.get("/owner/:ownerId", authenticateToken, boatsController.findByOwner);

// Solicitar registro de barco (autenticado)
boatsRouter.post("/request-registration", authenticateToken, boatsController.requestRegistration);

// ========== RUTAS PROTEGIDAS PARA ADMINISTRADORES ==========

// Obtener todos los barcos (para administradores)
boatsRouter.get("/", authenticateToken, authorizeByCategory(['Administrador']), boatsController.getAll);

// Crear nuevo barco
boatsRouter.post("/create", authenticateToken, authorizeByCategory(['Administrador']), boatsController.create);

// Actualizar barco
boatsRouter.put("/update/:id", authenticateToken, authorizeByCategory(['Administrador']), boatsController.updateOne);

// Eliminar barco
boatsRouter.delete("/delete/:id", authenticateToken, authorizeByCategory(['Administrador']), boatsController.deleteOne);

// Activar/Desactivar barco
boatsRouter.patch("/toggle-active/:id", authenticateToken, authorizeByCategory(['Administrador']), boatsController.toggleActive);

// ========== RUTAS PÚBLICAS PARA CONFIRMACIÓN ==========

// Aprobar registro de barco (público con token)
boatsRouter.get("/registration/approve/:id", boatsController.approveRegistration);

// Rechazar registro de barco (público con token)
boatsRouter.get("/registration/reject/:id", boatsController.rejectRegistration);
