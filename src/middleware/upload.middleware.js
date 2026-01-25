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

// Configuración para imágenes de eventos
const eventsUploadsDir = join(__dirname, '../public/uploads/events');
logger.info(`[Upload Middleware] Ruta del directorio de eventos: ${eventsUploadsDir}`);

if (!existsSync(eventsUploadsDir)) {
  try {
    mkdirSync(eventsUploadsDir, { recursive: true });
    logger.info(`[Upload Middleware] Directorio de uploads de eventos creado: ${eventsUploadsDir}`);
  } catch (error) {
    logger.error(`[Upload Middleware] Error al crear directorio de eventos: ${error.message}`);
    throw error;
  }
} else {
  logger.info(`[Upload Middleware] Directorio de uploads de eventos existe: ${eventsUploadsDir}`);
}

const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info(`[Multer Event] destination llamado para archivo: ${file.originalname}`);
    logger.info(`[Multer Event] Guardando en: ${eventsUploadsDir}`);
    
    if (!existsSync(eventsUploadsDir)) {
      try {
        mkdirSync(eventsUploadsDir, { recursive: true });
        logger.info(`[Multer Event] Directorio creado en destination: ${eventsUploadsDir}`);
      } catch (error) {
        logger.error(`[Multer Event] Error al crear directorio en destination: ${error.message}`);
        return cb(error);
      }
    }
    
    cb(null, eventsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `event-${uniqueSuffix}.${ext}`;
    logger.info(`[Multer Event] Generando nombre de archivo: ${filename}`);
    cb(null, filename);
  }
});

export const uploadEvent = multer({
  storage: eventStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para subir imagen de evento
export const uploadEventImage = uploadEvent.single('image');

// Configuración para imágenes de barcos
const boatsUploadsDir = join(__dirname, '../public/uploads/boats');
logger.info(`[Upload Middleware] Ruta del directorio de barcos: ${boatsUploadsDir}`);

if (!existsSync(boatsUploadsDir)) {
  try {
    mkdirSync(boatsUploadsDir, { recursive: true });
    logger.info(`[Upload Middleware] Directorio de uploads de barcos creado: ${boatsUploadsDir}`);
  } catch (error) {
    logger.error(`[Upload Middleware] Error al crear directorio de barcos: ${error.message}`);
    throw error;
  }
} else {
  logger.info(`[Upload Middleware] Directorio de uploads de barcos existe: ${boatsUploadsDir}`);
}

const boatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info(`[Multer Boat] destination llamado para archivo: ${file.originalname}`);
    logger.info(`[Multer Boat] Guardando en: ${boatsUploadsDir}`);
    
    if (!existsSync(boatsUploadsDir)) {
      try {
        mkdirSync(boatsUploadsDir, { recursive: true });
        logger.info(`[Multer Boat] Directorio creado en destination: ${boatsUploadsDir}`);
      } catch (error) {
        logger.error(`[Multer Boat] Error al crear directorio en destination: ${error.message}`);
        return cb(error);
      }
    }
    
    cb(null, boatsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `boat-${uniqueSuffix}.${ext}`;
    logger.info(`[Multer Boat] Generando nombre de archivo: ${filename}`);
    cb(null, filename);
  }
});

export const uploadBoat = multer({
  storage: boatStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para subir imagen de barco
export const uploadBoatImage = uploadBoat.single('image');

// Configuración para PDFs de certificados
const certificatesUploadsDir = join(__dirname, '../public/uploads/certificates');
logger.info(`[Upload Middleware] Ruta del directorio de certificados: ${certificatesUploadsDir}`);

if (!existsSync(certificatesUploadsDir)) {
  try {
    mkdirSync(certificatesUploadsDir, { recursive: true });
    logger.info(`[Upload Middleware] Directorio de uploads de certificados creado: ${certificatesUploadsDir}`);
  } catch (error) {
    logger.error(`[Upload Middleware] Error al crear directorio de certificados: ${error.message}`);
    throw error;
  }
} else {
  logger.info(`[Upload Middleware] Directorio de uploads de certificados existe: ${certificatesUploadsDir}`);
}

const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info(`[Multer Certificate] destination llamado para archivo: ${file.originalname}`);
    logger.info(`[Multer Certificate] Guardando en: ${certificatesUploadsDir}`);
    
    if (!existsSync(certificatesUploadsDir)) {
      try {
        mkdirSync(certificatesUploadsDir, { recursive: true });
        logger.info(`[Multer Certificate] Directorio creado en destination: ${certificatesUploadsDir}`);
      } catch (error) {
        logger.error(`[Multer Certificate] Error al crear directorio en destination: ${error.message}`);
        return cb(error);
      }
    }
    
    cb(null, certificatesUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const filename = `certificate-${uniqueSuffix}.${ext}`;
    logger.info(`[Multer Certificate] Generando nombre de archivo: ${filename}`);
    cb(null, filename);
  }
});

// Filtro para aceptar solo PDFs
const pdfFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

export const uploadCertificate = multer({
  storage: certificateStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo para PDFs
  },
  fileFilter: pdfFileFilter
});

// Middleware para subir PDF de certificado
export const uploadCertificatePDF = uploadCertificate.single('pdfFile');