import { logger } from '../utils/logger.js';
import { join } from 'path';
import { __dirname } from '../config.js';
import { existsSync } from 'fs';

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
      logger.info('Iniciando subida de imágenes. req.files:', JSON.stringify(req.files));
      logger.info('req.body:', JSON.stringify(req.body));
      
      const images = {};
      // __dirname es latias-back/src, entonces ../public es latias-back/public
      const uploadsDir = join(__dirname, '../public/uploads/courses');
      logger.info(`[Upload Controller] Verificando archivos en: ${uploadsDir}`);
      
      if (req.files) {
        logger.info('Archivos recibidos:', Object.keys(req.files));
        
        if (req.files.bannerUrl && req.files.bannerUrl.length > 0) {
          const file = req.files.bannerUrl[0];
          const filePath = join(uploadsDir, file.filename);
          const fileExists = existsSync(filePath);
          logger.info(`Banner subido: ${file.filename}, ruta: ${filePath}, existe: ${fileExists}`);
          if (!fileExists) {
            logger.error(`[ERROR] El archivo banner NO existe en el disco: ${filePath}`);
          }
          images.bannerUrl = `/uploads/courses/${file.filename}`;
        }
        if (req.files.image && req.files.image.length > 0) {
          const file = req.files.image[0];
          const filePath = join(uploadsDir, file.filename);
          const fileExists = existsSync(filePath);
          logger.info(`Imagen subida: ${file.filename}, ruta: ${filePath}, existe: ${fileExists}`);
          if (!fileExists) {
            logger.error(`[ERROR] El archivo image NO existe en el disco: ${filePath}`);
          }
          images.image = `/uploads/courses/${file.filename}`;
        }
        if (req.files.shortImage && req.files.shortImage.length > 0) {
          const file = req.files.shortImage[0];
          const filePath = join(uploadsDir, file.filename);
          const fileExists = existsSync(filePath);
          logger.info(`Imagen corta subida: ${file.filename}, ruta: ${filePath}, existe: ${fileExists}`);
          if (!fileExists) {
            logger.error(`[ERROR] El archivo shortImage NO existe en el disco: ${filePath}`);
          }
          images.shortImage = `/uploads/courses/${file.filename}`;
        }
      } else {
        logger.warning('No se recibieron archivos en req.files');
      }

      if (Object.keys(images).length === 0) {
        logger.warning('No se procesaron imágenes. req.files:', req.files);
        return res.status(400).json({
          status: "error",
          msg: "No se proporcionaron archivos o no se pudieron procesar",
          payload: { receivedFiles: req.files ? Object.keys(req.files) : 'none' },
        });
      }

      logger.info(`Imágenes subidas exitosamente: ${JSON.stringify(images)}`);

      return res.status(200).json({
        status: "success",
        msg: "Imágenes subidas exitosamente",
        payload: images,
      });
    } catch (error) {
      logger.error("Error al subir imágenes:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error al subir las imágenes: " + error.message,
        payload: {},
      });
    }
  }

  // Subir imagen de perfil de instructor
  async uploadProfessorImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          msg: "No se proporcionó ningún archivo",
          payload: {},
        });
      }

      // La ruta relativa desde public
      const imagePath = `/uploads/professors/${req.file.filename}`;

      logger.info(`Imagen de instructor subida: ${imagePath}`);

      return res.status(200).json({
        status: "success",
        msg: "Imagen subida exitosamente",
        payload: {
          profileImage: imagePath,
          filename: req.file.filename
        },
      });
    } catch (error) {
      logger.error("Error al subir imagen de instructor:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error al subir la imagen",
        payload: {},
      });
    }
  }
}

export const uploadController = new UploadController();
