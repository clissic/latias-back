import express, { json, static as serveStatic } from "express";
import { join } from "path";
import { __dirname } from "./config.js";
import { connectMongo } from "./utils/db-connection.js";
import cors from "cors";
import { existsSync, mkdirSync } from 'fs';

// Importar rutas
import { usersRouter } from "./routes/users.routes.js";
import { tokensRouter } from "./routes/tokens.routes.js";
import { coursesRouter } from "./routes/courses.routes.js";
import { mercadoPagoRouter } from "./routes/mercadopago.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { professorsRouter } from "./routes/professors.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
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
const professorsUploadsDir = join(__dirname, "../public/uploads/professors");
if (!existsSync(professorsUploadsDir)) {
  mkdirSync(professorsUploadsDir, { recursive: true });
  console.log(`Directorio de uploads de instructores creado: ${professorsUploadsDir}`);
} else {
  console.log(`Directorio de uploads de instructores ya existe: ${professorsUploadsDir}`);
}

// ENDPOINTS (deben ir antes de los archivos estáticos)
app.use("/api/users", usersRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/mercadopago", mercadoPagoRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/professors", professorsRouter);
app.use("/api/events", eventsRouter);

// Servir archivos estáticos desde public/uploads (para imágenes subidas)
// Esto debe ir después de las rutas de API pero antes del catch-all de React
app.use("/uploads", serveStatic(join(__dirname, "../public/uploads"), {
  setHeaders: (res, path) => {
    // Asegurar que las imágenes se sirvan con el tipo MIME correcto
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
}));

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
