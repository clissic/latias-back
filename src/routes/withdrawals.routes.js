import express from "express";
import { withdrawalsController } from "../controllers/withdrawals.controller.js";
import {
  authenticateToken,
  authorizeByCategory,
  verifyAdminWithdrawalToken,
} from "../middleware/auth.middleware.js";

export const withdrawalsRouter = express.Router();

withdrawalsRouter.post("/", authenticateToken, withdrawalsController.create);

withdrawalsRouter.get(
  "/admin/process",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  verifyAdminWithdrawalToken,
  withdrawalsController.getAdminProcessData
);

withdrawalsRouter.patch(
  "/:id/process",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  verifyAdminWithdrawalToken,
  withdrawalsController.process
);

withdrawalsRouter.patch(
  "/:id/reject",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  verifyAdminWithdrawalToken,
  withdrawalsController.reject
);

withdrawalsRouter.get(
  "/admin/list",
  authenticateToken,
  authorizeByCategory(["Administrador"]),
  withdrawalsController.listAdminWithdrawals
);
