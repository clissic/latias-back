import express from "express";
import { eventsController } from "../controllers/events.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const eventsRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener todos los eventos activos (público)
eventsRouter.get("/active", eventsController.getActive);

// Obtener evento por ID (público)
eventsRouter.get("/id/:id", eventsController.findById);

// Obtener evento por eventId (público)
eventsRouter.get("/eventId/:eventId", eventsController.findByEventId);

// Comprar ticket de evento (público o autenticado)
eventsRouter.post("/purchase/:eventId", authenticateToken, eventsController.purchaseTicket);

// Verificar autenticidad de un ticket (público)
eventsRouter.get("/verify/:ticketId", eventsController.verifyTicket);

// ========== RUTAS PROTEGIDAS PARA ADMINISTRADORES ==========

// Obtener todos los eventos (para administradores)
eventsRouter.get("/", authenticateToken, authorizeByCategory(['Administrador']), eventsController.getAll);

// Crear nuevo evento
eventsRouter.post("/create", authenticateToken, authorizeByCategory(['Administrador']), eventsController.create);

// Actualizar evento
eventsRouter.put("/update/:eventId", authenticateToken, authorizeByCategory(['Administrador']), eventsController.updateOne);

// Eliminar evento
eventsRouter.delete("/delete/:eventId", authenticateToken, authorizeByCategory(['Administrador']), eventsController.deleteOne);

// Desactivar eventos vencidos
eventsRouter.post("/deactivate-expired", authenticateToken, authorizeByCategory(['Administrador']), eventsController.deactivateExpiredEvents);
