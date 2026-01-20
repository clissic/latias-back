import multer from 'multer';
import { join } from 'path';
import { __dirname } from '../config.js';
import { existsSync, mkdirSync, access, constants } from 'fs';
import { logger } from '../utils/logger.js';

// Crear directorio de uploads si no existe
// __dirname es latias-back/src, entonces ../public es latias-back/public
const uploadsDir = join(__dirname, '../public/uploads/courses');
logger.info(`[Upload Middleware] Ruta del directorio: ${uploadsDir}`);

if (!existsSync(uploadsDir)) {
  try {
    mkdirSync(uploadsDir, { recursive: true });
    logger.info(`[Upload Middleware] Directorio de uploads creado: ${uploadsDir}`);
  } catch (error) {
    logger.error(`[Upload Middleware] Error al crear directorio: ${error.message}`);
    throw error;
  }
} else {
  logger.info(`[Upload Middleware] Directorio de uploads existe: ${uploadsDir}`);
}

// Verificar permisos de escritura
access(uploadsDir, constants.W_OK, (err) => {
  if (err) {
    logger.error(`[Upload Middleware] No hay permisos de escritura en: ${uploadsDir}`);
  } else {
    logger.info(`[Upload Middleware] Permisos de escritura OK en: ${uploadsDir}`);
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info(`[Multer] destination llamado para archivo: ${file.originalname}`);
    logger.info(`[Multer] Guardando en: ${uploadsDir}`);
    
    // Asegurar que el directorio existe antes de guardar
    if (!existsSync(uploadsDir)) {
      try {
        mkdirSync(uploadsDir, { recursive: true });
        logger.info(`[Multer] Directorio creado en destination: ${uploadsDir}`);
      } catch (error) {
        logger.error(`[Multer] Error al crear directorio en destination: ${error.message}`);
        return cb(error);
      }
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `course-${uniqueSuffix}.${ext}`;
    logger.info(`[Multer] Generando nombre de archivo: ${filename}`);
    cb(null, filename);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para subir una imagen
export const uploadSingle = upload.single('image');

// Middleware para subir múltiples imágenes
export const uploadMultiple = upload.fields([
  { name: 'bannerUrl', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'shortImage', maxCount: 1 }
]);

// Configuración para imágenes de instructores
const professorsUploadsDir = join(__dirname, '../public/uploads/professors');
  logger.info(`[Upload Middleware] Ruta del directorio de instructores: ${professorsUploadsDir}`);

if (!existsSync(professorsUploadsDir)) {
  try {
    mkdirSync(professorsUploadsDir, { recursive: true });
    logger.info(`[Upload Middleware] Directorio de uploads de instructores creado: ${professorsUploadsDir}`);
  } catch (error) {
    logger.error(`[Upload Middleware] Error al crear directorio de instructores: ${error.message}`);
    throw error;
  }
} else {
  logger.info(`[Upload Middleware] Directorio de uploads de instructores existe: ${professorsUploadsDir}`);
}

const professorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info(`[Multer Instructor] destination llamado para archivo: ${file.originalname}`);
    logger.info(`[Multer Instructor] Guardando en: ${professorsUploadsDir}`);
    
    if (!existsSync(professorsUploadsDir)) {
      try {
        mkdirSync(professorsUploadsDir, { recursive: true });
        logger.info(`[Multer Professor] Directorio creado en destination: ${professorsUploadsDir}`);
      } catch (error) {
        logger.error(`[Multer Instructor] Error al crear directorio en destination: ${error.message}`);
        return cb(error);
      }
    }
    
    cb(null, professorsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `instructor-${uniqueSuffix}.${ext}`;
    logger.info(`[Multer Professor] Generando nombre de archivo: ${filename}`);
    cb(null, filename);
  }
});

export const uploadProfessor = multer({
  storage: professorStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para subir imagen de instructor
export const uploadProfessorImage = uploadProfessor.single('profileImage');