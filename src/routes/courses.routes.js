import express from "express";
import { coursesController } from "../controllers/courses.controller.js";
import { authenticateToken, authorizeByCategory, validateUserOwnership } from "../middleware/auth.middleware.js";

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

// Comprar curso (valida que el usuario solo compre para sí mismo, a menos que sea admin)
coursesRouter.post("/purchase/:userId", authenticateToken, validateUserOwnership(), coursesController.purchaseCourse);

// Obtener cursos comprados del usuario (valida que el usuario solo vea sus propios cursos, a menos que sea admin)
coursesRouter.get("/user/:userId/purchased", authenticateToken, validateUserOwnership(), coursesController.getUserPurchasedCourses);

// Actualizar progreso del curso del usuario (valida que el usuario solo actualice su propio progreso, a menos que sea admin)
coursesRouter.put("/user/:userId/course/:courseId/progress", authenticateToken, validateUserOwnership(), coursesController.updateUserCourseProgress);

// Agregar intento de examen al curso del usuario (valida que el usuario solo agregue intentos a sus propios cursos, a menos que sea admin)
coursesRouter.put("/user/:userId/course/:courseId/attempt", authenticateToken, validateUserOwnership(), coursesController.addUserCourseAttempt);

// Actualizar certificado del curso del usuario (valida que el usuario solo actualice sus propios certificados, a menos que sea admin)
coursesRouter.put("/user/:userId/course/:courseId/certificate", authenticateToken, validateUserOwnership(), coursesController.updateUserCourseCertificate);
