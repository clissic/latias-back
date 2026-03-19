import { usersModel } from "../DAO/models/users.model.js";
import { transactionsModel, FEE_PERCENT_DEFAULT } from "../DAO/models/transactions.model.js";
import { coursesService } from "../services/courses.service.js";
import { logger } from "../utils/logger.js";

const DEFAULT_CURRENCY = "USD";
const HOLD_DAYS_DEFAULT = 14;

function computeAmounts(grossAmount, feePercent = FEE_PERCENT_DEFAULT) {
  const g = Number(grossAmount) || 0;
  const fee = Math.round(g * feePercent * 100) / 100;
  const net = Math.round((g - fee) * 100) / 100;
  return { grossAmount: g, fee, netAmount: net };
}

export const walletService = {
  /**
   * Registra una transacción de ingreso (curso, servicio, etc.) y actualiza la wallet
   * del usuario receptor en modo "ledger": se incrementan solo campos derivados.
   *
   * NO debe llamarse para pagos simulados / dev.
   *
   * @param {Object} params
   * @param {string} params.userId - receptor del dinero
   * @param {"course_sale"|"service_payment"|"refund"|"withdrawal"|"adjustment"} params.type
   * @param {"course"|"service"} params.sourceType
   * @param {string|import("mongoose").Types.ObjectId} params.sourceId
   * @param {number} params.grossAmount
   * @param {string} [params.currency]
   * @param {string} [params.paymentId]
   * @param {number} [params.holdDays]
   */
  async registerIncome({
    userId,
    type,
    sourceType,
    sourceId,
    grossAmount,
    currency = DEFAULT_CURRENCY,
    paymentId,
    holdDays = HOLD_DAYS_DEFAULT,
  }) {
    if (!userId || !type || !sourceType || !sourceId) {
      throw new Error("Parámetros requeridos faltantes para registerIncome");
    }

    const { grossAmount: g, fee, netAmount } = computeAmounts(grossAmount);
    const availableAt = new Date(Date.now() + holdDays * 24 * 60 * 60 * 1000);

    const tx = await transactionsModel.create({
      userId,
      type,
      sourceType,
      sourceId,
      paymentId: paymentId ? String(paymentId) : undefined,
      grossAmount: g,
      fee,
      netAmount,
      status: "pending",
      availableAt,
      currency,
    });

    // Actualizar wallet: pendingBalance y totalEarnings
    await usersModel.incrementWalletPending(userId, netAmount, currency);

    return tx;
  },

  /**
   * Recorre transacciones pendientes cuyo availableAt ya pasó y las marca como "available",
   * actualizando la wallet del usuario (pendingBalance -> balance).
   */
  async releasePendingFunds(now = new Date()) {
    const pending = await transactionsModel.findPendingAvailable(now);
    if (!pending || pending.length === 0) return { processed: 0 };

    const byUser = new Map();
    for (const tx of pending) {
      if (!tx.userId || !Number.isFinite(tx.netAmount)) continue;
      const key = String(tx.userId);
      if (!byUser.has(key)) {
        byUser.set(key, { totalNet: 0, currency: tx.currency || DEFAULT_CURRENCY });
      }
      const agg = byUser.get(key);
      agg.totalNet += Number(tx.netAmount) || 0;
    }

    for (const [userId, { totalNet, currency }] of byUser.entries()) {
      if (!totalNet) continue;
      try {
        await usersModel.moveWalletPendingToAvailable(userId, totalNet, currency);
      } catch (err) {
        logger.error(`walletService.releasePendingFunds: error actualizando wallet para userId ${userId}:`, err);
      }
    }

    const ids = pending.map((tx) => tx._id);
    await transactionsModel.markAsAvailable(ids);

    return { processed: pending.length };
  },

  /**
   * Helper específico para una venta de curso.
   * Calcula el instructor a partir del curso y registra el ingreso a su wallet.
   */
  async registerCourseSaleForInstructor({ courseId, payment, paymentId }) {
    if (!courseId || !payment) return null;
    const course = await coursesService.findByCourseId(courseId);
    if (!course || !course.instructor) return null;

    const instructorId = course.instructor._id || course.instructor;
    if (!instructorId) return null;

    const amount = payment.transaction_amount ?? payment.amount ?? 0;
    const currency = payment.currency_id || payment.currency || DEFAULT_CURRENCY;

    return this.registerIncome({
      userId: instructorId,
      type: "course_sale",
      sourceType: "course",
      sourceId: course._id || courseId,
      grossAmount: amount,
      currency,
      paymentId: paymentId != null ? String(paymentId) : undefined,
    });
  },

  /**
   * Registra ingreso por trámite de gestoría: el gestor (manager del ship-request) recibe el net del pago.
   * Solo llamar cuando payment.live_mode === true.
   */
  async registerServicePaymentForGestor({ requestId, request, payment, paymentId }) {
    const manager = request?.manager;
    const gestorId = manager?._id ?? manager;
    if (!gestorId || !requestId) return null;

    const amount = payment.transaction_amount ?? payment.amount ?? 0;
    const currency = payment.currency_id || payment.currency || DEFAULT_CURRENCY;

    return this.registerIncome({
      userId: gestorId,
      type: "service_payment",
      sourceType: "service",
      sourceId: request._id ?? requestId,
      grossAmount: amount,
      currency,
      paymentId: paymentId != null ? String(paymentId) : undefined,
    });
  },

  /**
   * Registra un reembolso: crea transacción type "refund" (netAmount negativo) y resta del balance del usuario.
   * Usado cuando se reembolsa un pago (ej. curso) al instructor.
   */
  async registerRefund({ userId, amount, currency = DEFAULT_CURRENCY, paymentId, sourceType, sourceId }) {
    if (!userId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Parámetros requeridos o inválidos para registerRefund");
    }
    const amt = Number(amount);
    const mongoose = await import("mongoose");
    const sid =
      sourceId && mongoose.default?.Types?.ObjectId?.isValid(sourceId)
        ? new mongoose.default.Types.ObjectId(sourceId)
        : new mongoose.default.Types.ObjectId();
    const tx = await transactionsModel.create({
      userId,
      type: "refund",
      sourceType: sourceType || "course",
      sourceId: sid,
      paymentId: paymentId ? String(paymentId) : undefined,
      grossAmount: -amt,
      fee: 0,
      netAmount: -amt,
      status: "paid",
      availableAt: new Date(),
      currency,
    });
    await usersModel.decrementWalletBalance(userId, amt, currency);
    return tx;
  },

  /**
   * Registra un retiro: crea transacción type "withdrawal" (netAmount negativo), resta balance e incrementa totalWithdrawn.
   */
  async registerWithdrawal({ userId, amount, currency = DEFAULT_CURRENCY, paymentId }) {
    if (!userId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Parámetros requeridos o inválidos para registerWithdrawal");
    }
    const amt = Number(amount);
    const mongoose = await import("mongoose");
    const tx = await transactionsModel.create({
      userId,
      type: "withdrawal",
      sourceType: "service",
      sourceId: new mongoose.default.Types.ObjectId(userId),
      paymentId: paymentId ? String(paymentId) : undefined,
      grossAmount: -amt,
      fee: 0,
      netAmount: -amt,
      status: "paid",
      availableAt: new Date(),
      currency,
    });
    await usersModel.withdrawFromWallet(userId, amt, currency);
    return tx;
  },
};

