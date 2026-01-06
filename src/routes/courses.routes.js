import express from "express";
import { coursesController } from "../controllers/courses.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const coursesRouter = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener todos los cursos (público para catálogo)
coursesRouter.get("/", coursesController.getAll);

// Obtener curso por ID (público para detalles)
coursesRouter.get("/id/:id", coursesController.findById);

// Obtener curso por courseId (público)
coursesRouter.get("/courseId/:courseId", coursesController.findByCourseId);

// Obtener curso por SKU (público)
coursesRouter.get("/sku/:sku", coursesController.findBySku);

// Obtener cursos por categoría (público)
coursesRouter.get("/category/:category", coursesController.getByCategory);

// Obtener cursos por dificultad (público)
coursesRouter.get("/difficulty/:difficulty", coursesController.getByDifficulty);

// ========== RUTAS PROTEGIDAS PARA ADMINISTRADORES ==========

// Crear nuevo curso
coursesRouter.post("/create", authenticateToken, authorizeByCategory(['Administrador']), coursesController.create);

// Actualizar curso
coursesRouter.put("/update/:courseId", authenticateToken, authorizeByCategory(['Administrador']), coursesController.updateOne);

// Eliminar curso
coursesRouter.delete("/delete/:courseId", authenticateToken, authorizeByCategory(['Administrador']), coursesController.deleteOne);

// Actualizar progreso de curso
coursesRouter.put("/progress/:courseId", authenticateToken, authorizeByCategory(['Administrador']), coursesController.updateProgress);

// Actualizar estado de finalización
coursesRouter.put("/finished/:courseId", authenticateToken, authorizeByCategory(['Administrador']), coursesController.updateFinishedStatus);

// Agregar intento de examen
coursesRouter.put("/attempt/:courseId", authenticateToken, authorizeByCategory(['Administrador']), coursesController.addAttempt);

// Actualizar certificado
coursesRouter.put("/certificate/:courseId", authenticateToken, authorizeByCategory(['Administrador']), coursesController.updateCertificate);

// ========== RUTAS PROTEGIDAS PARA USUARIOS ==========

// Comprar curso
coursesRouter.post("/purchase/:userId", authenticateToken, coursesController.purchaseCourse);

// Obtener cursos comprados del usuario
coursesRouter.get("/user/:userId/purchased", authenticateToken, coursesController.getUserPurchasedCourses);

// Actualizar progreso del curso del usuario
coursesRouter.put("/user/:userId/course/:courseId/progress", authenticateToken, coursesController.updateUserCourseProgress);

// Agregar intento de examen al curso del usuario
coursesRouter.put("/user/:userId/course/:courseId/attempt", authenticateToken, coursesController.addUserCourseAttempt);

// Actualizar certificado del curso del usuario
coursesRouter.put("/user/:userId/course/:courseId/certificate", authenticateToken, coursesController.updateUserCourseCertificate);
