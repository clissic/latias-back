import express, { json, static as serveStatic } from "express";
import { join } from "path";
import cors from "cors";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const app = express();
app.use(cors());
app.use(json());

// Servir archivos estáticos desde la carpeta dist
app.use(serveStatic(join(__dirname, "../../latias-front/dist")));

// Para manejar rutas de React (React Router)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../../latias-front/dist/index.html"));
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT} - http://localhost:${PORT}`);
});