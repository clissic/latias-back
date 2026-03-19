import express from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";
import { uploadSingle, uploadMultiple, uploadInstructorImage, uploadEventImage, uploadBoatImage, uploadCertificatePDF, uploadWithdrawalProofFile } from "../middleware/upload.middleware.js";
import { logger } from "../utils/logger.js";

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
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        logger.error('Error en middleware de upload:', err);
        return res.status(400).json({
          status: "error",
          msg: err.message || "Error al subir las imágenes",
          payload: {},
        });
      }
      next();
    });
  },
  uploadController.uploadCourseImages
);

// Subir imagen de perfil de instructor
uploadRouter.post(
  "/instructor-image",
  authenticateToken,
  authorizeByCategory(['Administrador']),
  (req, res, next) => {
    uploadInstructorImage(req, res, (err) => {
      if (err) {
        logger.error('Error en middleware de upload de instructor:', err);
        return res.status(400).json({
          status: "error",
          msg: err.message || "Error al subir la imagen",
          payload: {},
        });
      }
      next();
    });
  },
  uploadController.uploadInstructorImage
);

// Subir imagen de evento
uploadRouter.post(
  "/event-image",
  authenticateToken,
  authorizeByCategory(['Administrador']),
  (req, res, next) => {
    uploadEventImage(req, res, (err) => {
      if (err) {
        logger.error('Error en middleware de upload de evento:', err);
        return res.status(400).json({
          status: "error",
          msg: err.message || "Error al subir la imagen",
          payload: {},
        });
      }
      next();
    });
  },
  uploadController.uploadEventImage
);

// Subir imagen de barco (autenticado, no solo administradores)
uploadRouter.post(
  "/boat-image",
  authenticateToken,
  (req, res, next) => {
    uploadBoatImage(req, res, (err) => {
      if (err) {
        logger.error('Error en middleware de upload de barco:', err);
        return res.status(400).json({
          status: "error",
          msg: err.message || "Error al subir la imagen",
          payload: {},
        });
      }
      next();
    });
  },
  uploadController.uploadBoatImage
);

// Subir PDF de certificado (autenticado, no solo administradores)
uploadRouter.post(
  "/certificate-pdf",
  authenticateToken,
  (req, res, next) => {
    uploadCertificatePDF(req, res, (err) => {
      if (err) {
        logger.error('Error en middleware de upload de certificado:', err);
        return res.status(400).json({
          status: "error",
          msg: err.message || "Error al subir el PDF",
          payload: {},
        });
      }
      next();
    });
  },
  uploadController.uploadCertificatePDF
);

uploadRouter.post(
  "/withdrawal-proof",
  authenticateToken,
  authorizeByCategory(['Administrador']),
  (req, res, next) => {
    uploadWithdrawalProofFile(req, res, (err) => {
      if (err) {
        logger.error('Error en middleware de upload de comprobante de retiro:', err);
        return res.status(400).json({
          status: "error",
          msg: err.message || "Error al subir el comprobante",
          payload: {},
        });
      }
      next();
    });
  },
  uploadController.uploadWithdrawalProof
);
