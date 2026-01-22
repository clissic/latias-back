import express from "express";
import { contactController } from "../controllers/contact.controller.js";

export const contactRouter = express.Router();

// Ruta pública para enviar emails de contacto
contactRouter.post("/send", contactController.sendContactEmail);
