import express from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "../middleware/upload.middleware.js";

export const uploadRouter = express.Router();

// Subir una imagen de curso
uploadRouter.post(
  "/course-image",
  authenticateToken,
  authorizeByCategory(['Administrador']),
  uploadSingle,
  uploadController.uploadCourseImage
);

// Subir múltiples imágenes de curso
uploadRouter.post(
  "/course-images",
  authenticateToken,
  authorizeByCategory(['Administrador']),
  uploadMultiple,
  uploadController.uploadCourseImages
);
