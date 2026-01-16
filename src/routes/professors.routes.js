import express from "express";
import { professorsController } from "../controllers/professors.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const professorsRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener todos los profesores (público)
professorsRouter.get("/", professorsController.getAll);

// Obtener profesor por ID (público)
professorsRouter.get("/id/:id", professorsController.findById);

// Obtener profesor por CI (público)
professorsRouter.get("/ci/:ci", professorsController.findByCi);

// Obtener profesores por ID de curso (público)
professorsRouter.get("/course/:courseId", professorsController.findByCourseId);

// ========== RUTAS PROTEGIDAS PARA ADMINISTRADORES ==========

// Crear nuevo profesor
professorsRouter.post("/create", authenticateToken, authorizeByCategory(['Administrador']), professorsController.create);

// Actualizar profesor
professorsRouter.put("/update/:id", authenticateToken, authorizeByCategory(['Administrador']), professorsController.updateOne);

// Eliminar profesor
professorsRouter.delete("/delete/:id", authenticateToken, authorizeByCategory(['Administrador']), professorsController.deleteOne);
