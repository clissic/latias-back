import express from "express";
import { usersController } from "../controllers/users.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

export const usersRouter = express.Router();

// Rutas públicas
usersRouter.post("/login", usersController.login);
usersRouter.post("/refresh-token", usersController.refreshToken);
usersRouter.post("/create", usersController.create);

// Rutas protegidas
usersRouter.get("/", authenticateToken, usersController.getAll);
usersRouter.get("/profile", authenticateToken, usersController.getProfile);
usersRouter.get("/findByEmail", authenticateToken, usersController.findByEmail);
usersRouter.get("/findByCi", authenticateToken, usersController.findByCi);
usersRouter.post("/logout", authenticateToken, usersController.logout);
usersRouter.delete("/:id", authenticateToken, usersController.deleteOne);