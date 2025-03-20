import express, { json, static as serveStatic } from "express";
import { join } from "path";
import { __dirname } from "./config.js";
import { connectMongo } from "./utils/db-connection.js";
import { iniPassport } from "./config/passport.config.js";
import passport from "passport";
import MongoStore from "connect-mongo";
import cors from "cors";
import session from "express-session";

// Importar rutas
import { usersRouter } from "./routes/users.routes.js";

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

// Configuración de la sesión
app.use(
  session({
    secret: "A98dB973kWpfsdq99Kmo",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://joaquinperezcoria:${MONGODB_PASSWORD}@cluster0.zye6fyd.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    }),
    cookie: {
      maxAge: 86400000,
    },
  })
);

// Configuración de Passport
iniPassport();
app.use(passport.initialize());
app.use(passport.session());

// ENDPOINTS
app.use("/api/users", usersRouter);

// Servir archivos estáticos desde la carpeta dist
app.use(serveStatic(join(__dirname, "../../latias-front/dist")));

// Para manejar rutas de React (React Router)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../../latias-front/dist/index.html"));
});
