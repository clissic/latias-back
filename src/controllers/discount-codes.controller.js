import { discountCodesService } from "../services/discount-codes.service.js";
import { logger } from "../utils/logger.js";

class DiscountCodesController {
  async getAll(req, res) {
    try {
      const codes = await discountCodesService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "Códigos de descuento obtenidos",
        payload: codes,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const code = await discountCodesService.findById(id);
      if (code) {
        return res.status(200).json({
          status: "success",
          msg: "Código de descuento obtenido",
          payload: code,
        });
      }
      return res.status(404).json({
        status: "error",
        msg: "Código de descuento no encontrado",
        payload: {},
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  async findByCode(req, res) {
    try {
      const { code } = req.params;
      const doc = await discountCodesService.findByCode(code);
      if (doc) {
        return res.status(200).json({
          status: "success",
          msg: "Código de descuento obtenido",
          payload: doc,
        });
      }
      return res.status(404).json({
        status: "error",
        msg: "Código de descuento no encontrado",
        payload: {},
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  async create(req, res) {
    try {
      const data = req.body;
      const created = await discountCodesService.create(data);
      return res.status(201).json({
        status: "success",
        msg: "Código de descuento creado",
        payload: created,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error al crear código de descuento");
      if (e.code === 11000) {
        return res.status(409).json({
          status: "error",
          msg: "Ya existe un código de descuento con ese valor. Elige otro código.",
          payload: {},
        });
      }
      return res.status(400).json({
        status: "error",
        msg: e?.message || "Error al crear código de descuento",
        payload: {},
      });
    }
  }

  async updateOne(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await discountCodesService.updateOne(id, data);
      return res.status(200).json({
        status: "success",
        msg: "Código de descuento actualizado",
        payload: updated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error al actualizar código de descuento");
      if (e.message === "Código de descuento no encontrado") {
        return res.status(404).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }
      if (e.code === 11000) {
        return res.status(409).json({
          status: "error",
          msg: "Ya existe otro código con ese valor. Elige otro código.",
          payload: {},
        });
      }
      return res.status(400).json({
        status: "error",
        msg: e?.message || "Error al actualizar código de descuento",
        payload: {},
      });
    }
  }

  async deleteOne(req, res) {
    try {
      const { id } = req.params;
      await discountCodesService.deleteOne(id);
      return res.status(200).json({
        status: "success",
        msg: "Código de descuento eliminado",
        payload: {},
      });
    } catch (e) {
      logger.error(e?.message || e || "Error al eliminar código de descuento");
      if (e.message === "Código de descuento no encontrado") {
        return res.status(404).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al eliminar código de descuento",
        payload: {},
      });
    }
  }

  async apply(req, res) {
    try {
      const { code } = req.body;
      const userId = req.user?._id ?? req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: "error",
          msg: "Usuario no autenticado",
          payload: {},
        });
      }
      if (!code || String(code).trim() === "") {
        return res.status(400).json({
          status: "error",
          msg: "El código es obligatorio",
          payload: {},
        });
      }
      const result = await discountCodesService.applyCode(String(code).trim(), userId);
      return res.status(200).json({
        status: "success",
        msg: "Código aplicado",
        payload: result,
      });
    } catch (e) {
      if (e.message === "CODE_NOT_FOUND") {
        return res.status(404).json({
          status: "error",
          msg: "Código de descuento no encontrado",
          payload: { code: "CODE_NOT_FOUND" },
        });
      }
      if (e.message === "CODE_INACTIVE" || e.message === "CODE_EXHAUSTED") {
        return res.status(400).json({
          status: "error",
          msg: "Este código ya fue utilizado la cantidad de veces disponible.",
          payload: { code: e.message },
        });
      }
      if (e.message === "ALREADY_USED") {
        return res.status(400).json({
          status: "error",
          msg: "Ya utilizaste este código anteriormente.",
          payload: { code: "ALREADY_USED" },
        });
      }
      logger.error(e?.message || e || "Error al aplicar código");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }
}

export const discountCodesController = new DiscountCodesController();
