import multer from 'multer';
import { join } from 'path';
import { __dirname } from '../config.js';
import { existsSync, mkdirSync } from 'fs';

// Crear directorio de uploads si no existe
const uploadsDir = join(__dirname, '../../public/uploads/courses');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `course-${uniqueSuffix}.${ext}`);
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
