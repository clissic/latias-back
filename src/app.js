import express, { json, static as serveStatic } from "express";
import { join } from "path";
import { __dirname } from "./config.js";
import { connectMongo } from "./utils/db-connection.js";
import cors from "cors";
import { existsSync, mkdirSync } from 'fs';

// Importar rutas
import { usersRouter } from "./routes/users.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { tokensRouter } from "./routes/tokens.routes.js";
import { coursesRouter } from "./routes/courses.routes.js";
import { mercadoPagoRouter } from "./routes/mercadopago.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { instructorsRouter } from "./routes/instructors.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { contactRouter } from "./routes/contact.routes.js";
import { boatsRouter } from "./routes/boats.routes.js";
import { certificatesRouter } from "./routes/certificates.routes.js";
import { shipRequestsRouter } from "./routes/ship-requests.routes.js";
import { discountCodesRouter } from "./routes/discount-codes.routes.js";
import { startEventsCron } from "./utils/events-cron.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const dbName = "LATIAS_DB";

app.use(cors());
app.use(json());
app.use(express.json());
// No usar express.urlencoded() aquí porque multer maneja multipart/form-data

// Iniciar el servidor
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${__dirname} - server http://localhost:${PORT}`);
});

// Conectar a la base de datos
connectMongo();

// Iniciar cron job para desactivar eventos vencidos
startEventsCron();

// Asegurar que el directorio de uploads existe
// __dirname es latias-back/src, entonces ../public es latias-back/public
const uploadsDir = join(__dirname, "../public/uploads/courses");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log(`Directorio de uploads creado: ${uploadsDir}`);
} else {
  console.log(`Directorio de uploads ya existe: ${uploadsDir}`);
}

// Asegurar que el directorio de uploads de instructores existe
const instructorsUploadsDir = join(__dirname, "../public/uploads/instructors");
if (!existsSync(instructorsUploadsDir)) {
  mkdirSync(instructorsUploadsDir, { recursive: true });
  console.log(`Directorio de uploads de instructores creado: ${instructorsUploadsDir}`);
} else {
  console.log(`Directorio de uploads de instructores ya existe: ${instructorsUploadsDir}`);
}

// Asegurar que el directorio de uploads de barcos existe
const boatsUploadsDir = join(__dirname, "../public/uploads/boats");
if (!existsSync(boatsUploadsDir)) {
  mkdirSync(boatsUploadsDir, { recursive: true });
  console.log(`Directorio de uploads de barcos creado: ${boatsUploadsDir}`);
} else {
  console.log(`Directorio de uploads de barcos ya existe: ${boatsUploadsDir}`);
}

// Asegurar que el directorio de uploads de certificados existe
const certificatesUploadsDir = join(__dirname, "../public/uploads/certificates");
if (!existsSync(certificatesUploadsDir)) {
  mkdirSync(certificatesUploadsDir, { recursive: true });
  console.log(`Directorio de uploads de certificados creado: ${certificatesUploadsDir}`);
} else {
  console.log(`Directorio de uploads de certificados ya existe: ${certificatesUploadsDir}`);
}

// ENDPOINTS (deben ir antes de los archivos estáticos)
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/mercadopago", mercadoPagoRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/instructors", instructorsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/boats", boatsRouter);
app.use("/api/certificates", certificatesRouter);
app.use("/api/ship-requests", shipRequestsRouter);
app.use("/api/discount-codes", discountCodesRouter);

// Opciones para servir uploads con MIME correcto
const uploadsStaticOptions = {
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
};

const uploadsPath = join(__dirname, "../public/uploads");

// Servir uploads en /uploads (p. ej. backend directo)
app.use("/uploads", serveStatic(uploadsPath, uploadsStaticOptions));

// Servir uploads en /api/uploads (frontend en dev usa /api + path y el proxy envía a backend)
app.use("/api/uploads", serveStatic(uploadsPath, uploadsStaticOptions));

// Servir otros archivos estáticos desde public
app.use(serveStatic(join(__dirname, "../public")));

// Servir archivos estáticos desde la carpeta dist
app.use(serveStatic(join(__dirname, "../../latias-front/dist")));

// Para manejar rutas de React (React Router) - solo si no es API ni archivo estático
app.get("*", (req, res, next) => {
  // Si es una ruta de API o de uploads, no manejarla aquí
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(join(__dirname, "../../latias-front/dist/index.html"));
});
