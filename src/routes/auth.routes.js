import express from "express";
import { usersController } from "../controllers/users.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

export const authRouter = express.Router();

/** GET /api/auth/me - Usuario actual (requiere token). Fuente de verdad para el estado del usuario en el front. */
authRouter.get("/me", authenticateToken, usersController.getProfile);
