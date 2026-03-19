import { discountCodesModel } from "../DAO/models/discount-codes.model.js";

class DiscountCodesService {
  async getAll() {
    return await discountCodesModel.getAll();
  }

  async findById(id) {
    return await discountCodesModel.findById(id);
  }

  async findByCode(code) {
    return await discountCodesModel.findByCode(code);
  }

  async create(data) {
    if (!data.code || String(data.code).trim() === "") {
      throw new Error("El código es obligatorio");
    }
    if (data.percentage == null || isNaN(Number(data.percentage))) {
      throw new Error("El porcentaje es obligatorio y debe ser un número");
    }
    const percentage = Number(data.percentage);
    if (percentage < 0 || percentage > 100) {
      throw new Error("El porcentaje debe estar entre 0 y 100");
    }
    if (!data.description || String(data.description).trim() === "") {
      throw new Error("La descripción es obligatoria");
    }
    const quantity = Number(data.quantity);
    if (data.quantity == null || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      throw new Error("La cantidad de usos es obligatoria y debe ser un número entero mayor o igual a 0");
    }
    return await discountCodesModel.create({
      code: data.code,
      percentage,
      description: data.description.trim(),
      quantity,
    });
  }

  async updateOne(id, data) {
    const existing = await discountCodesModel.findById(id);
    if (!existing) {
      throw new Error("Código de descuento no encontrado");
    }
    const updateData = { _id: id };
    if (data.code != null) updateData.code = data.code;
    if (data.percentage != null) {
      const percentage = Number(data.percentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        throw new Error("El porcentaje debe estar entre 0 y 100");
      }
      updateData.percentage = percentage;
    }
    if (data.description != null) updateData.description = data.description.trim();
    if (data.quantity != null) {
      const quantity = Number(data.quantity);
      if (isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
        throw new Error("La cantidad de usos debe ser un número entero mayor o igual a 0");
      }
      const usedCount = (existing.usedBy && existing.usedBy.length) || 0;
      if (quantity < usedCount) {
        throw new Error(`La cantidad no puede ser menor a los usos ya realizados (${usedCount})`);
      }
      updateData.quantity = quantity;
    }
    if (data.isActive != null) updateData.isActive = Boolean(data.isActive);
    return await discountCodesModel.updateOne(updateData);
  }

  async deleteOne(id) {
    const existing = await discountCodesModel.findById(id);
    if (!existing) {
      throw new Error("Código de descuento no encontrado");
    }
    return await discountCodesModel.deleteOne(id);
  }

  /**
   * Valida un código de descuento para un usuario sin marcarlo como utilizado.
   * Lanza errores si:
   * - No existe
   * - Está inactivo
   * - Se agotaron los usos
   * - El usuario ya lo utilizó
   */
  async validateCodeForUser(codeValue, userId) {
    const doc = await discountCodesModel.findByCode(codeValue);
    if (!doc) {
      throw new Error("CODE_NOT_FOUND");
    }
    if (!doc.isActive) {
      throw new Error("CODE_INACTIVE");
    }
    const usedCount = (doc.usedBy && doc.usedBy.length) || 0;
    if (usedCount >= doc.quantity) {
      throw new Error("CODE_EXHAUSTED");
    }
    const uid = String(userId);
    if (doc.usedBy && doc.usedBy.some((id) => String(id) === uid)) {
      throw new Error("ALREADY_USED");
    }
    return { percentage: doc.percentage, code: doc.code, _id: doc._id };
  }

  /**
   * Marca el código como utilizado por el usuario (se debe llamar solo tras un pago exitoso).
   * Revalida el estado del código antes de aplicarlo.
   */
  async applyCode(codeValue, userId) {
    // Reutilizar validaciones básicas (existencia, activo, cantidad, ya usado)
    const validated = await this.validateCodeForUser(codeValue, userId);
    const updated = await discountCodesModel.addUse(validated._id, userId);
    if (!updated) {
      throw new Error("CODE_EXHAUSTED");
    }
    return { percentage: updated.percentage, code: updated.code, _id: updated._id };
  }
}

export const discountCodesService = new DiscountCodesService();
