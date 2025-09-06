import express from "express";
import { coursesController } from "../controllers/courses.controller.js";

export const coursesRouter = express.Router();

// ========== RUTAS PARA ADMINISTRADORES ==========

// Obtener todos los cursos
coursesRouter.get("/", coursesController.getAll);

// Obtener curso por ID
coursesRouter.get("/id/:id", coursesController.findById);

// Obtener curso por courseId
coursesRouter.get("/courseId/:courseId", coursesController.findByCourseId);

// Obtener curso por SKU
coursesRouter.get("/sku/:sku", coursesController.findBySku);

// Crear nuevo curso
coursesRouter.post("/create", coursesController.create);

// Actualizar curso
coursesRouter.put("/update/:id", coursesController.updateOne);

// Eliminar curso
coursesRouter.delete("/delete/:id", coursesController.deleteOne);

// Actualizar progreso de curso
coursesRouter.put("/progress/:id", coursesController.updateProgress);

// Actualizar estado de finalización
coursesRouter.put("/finished/:id", coursesController.updateFinishedStatus);

// Agregar intento de examen
coursesRouter.put("/attempt/:id", coursesController.addAttempt);

// Actualizar certificado
coursesRouter.put("/certificate/:id", coursesController.updateCertificate);

// ========== RUTAS PARA USUARIOS ESTÁNDAR ==========

// Obtener cursos por categoría
coursesRouter.get("/category/:category", coursesController.getByCategory);

// Obtener cursos por dificultad
coursesRouter.get("/difficulty/:difficulty", coursesController.getByDifficulty);

// Comprar curso
coursesRouter.post("/purchase/:userId", coursesController.purchaseCourse);

// Obtener cursos comprados del usuario
coursesRouter.get("/user/:userId/purchased", coursesController.getUserPurchasedCourses);

// Actualizar progreso del curso del usuario
coursesRouter.put("/user/:userId/course/:courseId/progress", coursesController.updateUserCourseProgress);

// Agregar intento de examen al curso del usuario
coursesRouter.put("/user/:userId/course/:courseId/attempt", coursesController.addUserCourseAttempt);

// Actualizar certificado del curso del usuario
coursesRouter.put("/user/:userId/course/:courseId/certificate", coursesController.updateUserCourseCertificate);
