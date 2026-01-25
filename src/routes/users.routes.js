import express from "express";
import { usersController } from "../controllers/users.controller.js";
import { authenticateToken, authorizeByCategory } from "../middleware/auth.middleware.js";

export const usersRouter = express.Router();

// Rutas públicas
usersRouter.post("/login", usersController.login);
usersRouter.post("/refresh-token", usersController.refreshToken);
usersRouter.post("/create", usersController.create);

// Rutas protegidas para usuarios autenticados
usersRouter.get("/profile", authenticateToken, usersController.getProfile);
usersRouter.post("/logout", authenticateToken, usersController.logout);
usersRouter.put("/update-password", authenticateToken, usersController.updatePassword);

// Rutas de flota para usuarios autenticados
usersRouter.post("/fleet/request", authenticateToken, usersController.requestBoatToFleet);
usersRouter.get("/fleet", authenticateToken, usersController.getUserFleet);
usersRouter.delete("/fleet/:boatId", authenticateToken, usersController.removeBoatFromFleet);

// Rutas de flota para administradores
usersRouter.put("/fleet/update-status", authenticateToken, authorizeByCategory(['Administrador']), usersController.updateFleetRequestStatus);

// Rutas protegidas solo para Administradores (gestión de usuarios)
usersRouter.get("/", authenticateToken, authorizeByCategory(['Administrador']), usersController.getAll);
usersRouter.get("/findByEmail", authenticateToken, authorizeByCategory(['Administrador']), usersController.findByEmail);
usersRouter.get("/findByCi", authenticateToken, authorizeByCategory(['Administrador']), usersController.findByCi);
usersRouter.get("/:id", authenticateToken, authorizeByCategory(['Administrador']), usersController.findById);
usersRouter.put("/update", authenticateToken, authorizeByCategory(['Administrador']), usersController.updateOne);
usersRouter.delete("/:id", authenticateToken, authorizeByCategory(['Administrador']), usersController.deleteOne);