import express from "express";
import { shipRequestsController } from "../controllers/ship-requests.controller.js";
import { shipRequestsService } from "../services/ship-requests.service.js";
import { authenticateToken, authorizeByCategory, validateUserOwnership } from "../middleware/auth.middleware.js";

export const shipRequestsRouter = express.Router();

// Middleware: permite eliminar solo si es Administrador o si es el owner de la solicitud
const allowDeleteOwnerOrAdmin = async (req, res, next) => {
  try {
    const categories = Array.isArray(req.user?.category) ? req.user.category : (req.user?.category != null ? [req.user.category] : []);
    if (categories.includes("Administrador")) return next();

    const request = await shipRequestsService.getById(req.params.id);
    if (!request) {
      return res.status(404).json({ status: "error", msg: "Solicitud no encontrada", payload: {} });
    }
    const ownerId = String(request.owner?._id ?? request.owner);
    const userId = String(req.user?.userId);
    if (ownerId === userId) return next();

    return res.status(403).json({
      status: "error",
      msg: "No tienes permisos para eliminar esta solicitud",
      payload: {},
    });
  } catch (e) {
    return res.status(500).json({ status: "error", msg: e?.message || "Error al verificar permisos", payload: {} });
  }
};

// Todas las rutas requieren autenticación
shipRequestsRouter.use(authenticateToken);

// Crear solicitud (owner o admin)
shipRequestsRouter.post("/", shipRequestsController.create);

// Crear solicitud desde certificado (flota) y enviar email al gestor
shipRequestsRouter.post("/certificate", shipRequestsController.createFromCertificate);

// Listar todas (solo Administrador o Gestor) - debe ir antes de /:id
shipRequestsRouter.get("/", authorizeByCategory(["Administrador", "Gestor"]), shipRequestsController.getAll);

// Rutas específicas antes de /:id para no capturar "owner", "manager", "ship" como id
shipRequestsRouter.get("/owner/:ownerId", validateUserOwnership({ userIdParam: "ownerId" }), shipRequestsController.getByOwner);
shipRequestsRouter.get("/manager/:managerId", validateUserOwnership({ userIdParam: "managerId" }), shipRequestsController.getByManager);
shipRequestsRouter.get("/ship/:shipId", shipRequestsController.getByShip);

// Obtener una solicitud por ID
shipRequestsRouter.get("/:id", shipRequestsController.getById);

// Actualizar estado (Administrador o el Gestor asignado)
shipRequestsRouter.patch("/:id/status", shipRequestsController.updateStatus);

// Actualizar solicitud (Administrador o Gestor asignado)
shipRequestsRouter.put("/:id", shipRequestsController.updateOne);

// Eliminar (Administrador o el owner de la solicitud)
shipRequestsRouter.delete("/:id", allowDeleteOwnerOrAdmin, shipRequestsController.deleteOne);
