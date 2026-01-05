import express, { json, static as serveStatic } from "express";
import { join } from "path";
import { __dirname } from "./config.js";
import { connectMongo } from "./utils/db-connection.js";
import cors from "cors";

// Importar rutas
import { usersRouter } from "./routes/users.routes.js";
import { tokensRouter } from "./routes/tokens.routes.js";
import { coursesRouter } from "./routes/courses.routes.js";
import { mercadoPagoRouter } from "./routes/mercadopago.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const dbName = "LATIAS_DB";

app.use(cors());
app.use(json());
app.use(express.json());

// Iniciar el servidor
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${__dirname} - server http://localhost:${PORT}`);
});

// Conectar a la base de datos
connectMongo();

// Servir archivos estáticos desde public (para imágenes subidas)
app.use(serveStatic(join(__dirname, "../public")));

// ENDPOINTS
app.use("/api/users", usersRouter);
app.use("/api/tokens", tokensRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/mercadopago", mercadoPagoRouter);
app.use("/api/upload", uploadRouter);

// Servir archivos estáticos desde la carpeta dist
app.use(serveStatic(join(__dirname, "../../latias-front/dist")));

// Para manejar rutas de React (React Router)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../../latias-front/dist/index.html"));
});
