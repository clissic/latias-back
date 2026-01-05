import { logger } from '../utils/logger.js';
import { join } from 'path';
import { __dirname } from '../config.js';

class UploadController {
  // Subir una imagen de curso
  async uploadCourseImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          msg: "No se proporcionó ningún archivo",
          payload: {},
        });
      }

      // La ruta relativa desde public
      const imagePath = `/uploads/courses/${req.file.filename}`;

      logger.info(`Imagen subida: ${imagePath}`);

      return res.status(200).json({
        status: "success",
        msg: "Imagen subida exitosamente",
        payload: {
          imagePath: imagePath,
          filename: req.file.filename
        },
      });
    } catch (error) {
      logger.error("Error al subir imagen:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error al subir la imagen",
        payload: {},
      });
    }
  }

  // Subir múltiples imágenes de curso (banner, image, shortImage)
  async uploadCourseImages(req, res) {
    try {
      const images = {};
      
      if (req.files) {
        if (req.files.bannerUrl) {
          images.bannerUrl = `/uploads/courses/${req.files.bannerUrl[0].filename}`;
        }
        if (req.files.image) {
          images.image = `/uploads/courses/${req.files.image[0].filename}`;
        }
        if (req.files.shortImage) {
          images.shortImage = `/uploads/courses/${req.files.shortImage[0].filename}`;
        }
      }

      if (Object.keys(images).length === 0) {
        return res.status(400).json({
          status: "error",
          msg: "No se proporcionaron archivos",
          payload: {},
        });
      }

      logger.info(`Imágenes subidas: ${JSON.stringify(images)}`);

      return res.status(200).json({
        status: "success",
        msg: "Imágenes subidas exitosamente",
        payload: images,
      });
    } catch (error) {
      logger.error("Error al subir imágenes:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error al subir las imágenes",
        payload: {},
      });
    }
  }
}

export const uploadController = new UploadController();
