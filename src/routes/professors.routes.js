import express from "express";
import { professorsController } from "../controllers/professors.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const professorsRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener todos los instructores (público)
professorsRouter.get("/", professorsController.getAll);

// Obtener instructor por ID (público)
professorsRouter.get("/id/:id", professorsController.findById);

// Obtener instructor por CI (público)
professorsRouter.get("/ci/:ci", professorsController.findByCi);

// Obtener instructores por ID de curso (público)
professorsRouter.get("/course/:courseId", professorsController.findByCourseId);

// ========== RUTAS PROTEGIDAS PARA ADMINISTRADORES ==========

// Crear nuevo instructor
professorsRouter.post("/create", authenticateToken, authorizeByCategory(['Administrador']), professorsController.create);

// Actualizar instructor
professorsRouter.put("/update/:id", authenticateToken, authorizeByCategory(['Administrador']), professorsController.updateOne);

// Eliminar instructor
professorsRouter.delete("/delete/:id", authenticateToken, authorizeByCategory(['Administrador']), professorsController.deleteOne);
