import { withdrawalsService } from "../services/withdrawals.service.js";
import { logger } from "../utils/logger.js";

function handleControllerError(res, error, fallbackMsg) {
  logger.error(fallbackMsg, error);
  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({
    status: "error",
    msg: error?.message || fallbackMsg,
    payload: {},
  });
}

class WithdrawalsController {
  async create(req, res) {
    try {
      const result = await withdrawalsService.createWithdrawal({
        userId: req.user?.userId,
        amount: req.body?.amount,
      });

      return res.status(201).json({
        status: "success",
        msg: "Retiro solicitado correctamente",
        payload: result,
      });
    } catch (error) {
      return handleControllerError(res, error, "Error al crear retiro");
    }
  }

  async getAdminProcessData(req, res) {
    try {
      const withdrawal = await withdrawalsService.getAdminProcessData(req.withdrawalId);
      return res.status(200).json({
        status: "success",
        msg: "Retiro listo para procesamiento",
        payload: withdrawal,
      });
    } catch (error) {
      return handleControllerError(res, error, "Error al obtener retiro para procesamiento");
    }
  }

  async process(req, res) {
    try {
      if (String(req.withdrawalId || "") !== String(req.params.id || "")) {
        return res.status(403).json({
          status: "error",
          msg: "El token no corresponde al retiro indicado",
          payload: {},
        });
      }

      const processed = await withdrawalsService.processWithdrawal({
        withdrawalId: req.params.id,
        proofUrl: req.body?.proofUrl,
      });

      return res.status(200).json({
        status: "success",
        msg: "Retiro procesado correctamente",
        payload: processed,
      });
    } catch (error) {
      return handleControllerError(res, error, "Error al procesar retiro");
    }
  }

  async reject(req, res) {
    try {
      if (String(req.withdrawalId || "") !== String(req.params.id || "")) {
        return res.status(403).json({
          status: "error",
          msg: "El token no corresponde al retiro indicado",
          payload: {},
        });
      }

      const rejected = await withdrawalsService.rejectWithdrawal({
        withdrawalId: req.params.id,
        reason: req.body?.reason,
      });

      return res.status(200).json({
        status: "success",
        msg: "Retiro rechazado correctamente",
        payload: rejected,
      });
    } catch (error) {
      return handleControllerError(res, error, "Error al rechazar retiro");
    }
  }

  async listAdminWithdrawals(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const status = (req.query.status || "").trim() || undefined;
      const userEmail = (req.query.userEmail || "").trim() || undefined;
      const userId = (req.query.userId || "").trim() || undefined;
      const payoutMethod = (req.query.payoutMethod || "").trim() || undefined;

      const result = await withdrawalsService.listAdminWithdrawals({
        page,
        limit,
        status,
        userEmail,
        userId,
        payoutMethod,
      });

      return res.status(200).json({
        status: "success",
        msg: "Withdrawals obtenidos",
        payload: result,
      });
    } catch (error) {
      return handleControllerError(res, error, "Error al listar withdrawals");
    }
  }
}

export const withdrawalsController = new WithdrawalsController();
