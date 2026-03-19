import express from "express";
import { usersController } from "../controllers/users.controller.js";
import { authenticateToken, authorizeByCategory, validateUserOwnership } from "../middleware/auth.middleware.js";

export const usersRouter = express.Router();

// Rutas públicas
usersRouter.post("/login", usersController.login);
usersRouter.post("/refresh-token", usersController.refreshToken);
usersRouter.post("/create", usersController.create);

// Rutas protegidas para usuarios autenticados
usersRouter.get("/profile", authenticateToken, usersController.getProfile);
usersRouter.get("/gestors", authenticateToken, usersController.getGestors);
usersRouter.get("/gestor/clients", authenticateToken, authorizeByCategory(["Gestor"]), usersController.getMyClients);
usersRouter.post("/gestor/unlink-client", authenticateToken, authorizeByCategory(["Gestor"]), usersController.unlinkClientAsGestor);
usersRouter.patch("/profile/manager", authenticateToken, usersController.updateMyManager);
usersRouter.post("/logout", authenticateToken, usersController.logout);
usersRouter.put("/update-password", authenticateToken, usersController.updatePassword);
usersRouter.post("/statistics/time-connected", authenticateToken, usersController.addConnectedTime);

// Actualizar datos propios (cualquier usuario autenticado solo puede actualizar su propio perfil; Admin puede actualizar cualquiera)
usersRouter.put("/update", authenticateToken, validateUserOwnership({ userIdParam: "_id" }), usersController.updateOne);

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
// Wallet y transacciones: el usuario solo puede ver los suyos; Administrador puede ver cualquiera
usersRouter.get("/:id/wallet", authenticateToken, validateUserOwnership({ userIdParam: "id" }), usersController.getWallet);
usersRouter.get("/:id/transactions", authenticateToken, validateUserOwnership({ userIdParam: "id" }), usersController.getTransactions);
usersRouter.get("/:id", authenticateToken, authorizeByCategory(['Administrador']), usersController.findById);
usersRouter.delete("/:id", authenticateToken, authorizeByCategory(['Administrador']), usersController.deleteOne);