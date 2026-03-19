import mongoose from "mongoose";
import { UserMongoose } from "../DAO/models/mongoose/users.mongoose.js";
import { WithdrawalsMongoose } from "../DAO/models/mongoose/withdrawals.mongoose.js";
import { TransactionsMongoose } from "../DAO/models/mongoose/transactions.mongoose.js";
import { withdrawalAdminTokenService } from "./withdrawal-admin-token.service.js";
import { userService } from "./users.service.js";
import { logger } from "../utils/logger.js";

const DEFAULT_CURRENCY = "USD";
const WITHDRAWAL_EXPIRATION_DAYS = 10;
const ALLOWED_CREATOR_CATEGORIES = ["Instructor", "Gestor"];

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function roundAmount(value) {
  return Math.round(Number(value) * 100) / 100;
}

function normalizeCategories(category) {
  return Array.isArray(category) ? category : category != null ? [String(category)] : [];
}

function hasAllowedWithdrawalCategory(user) {
  const categories = normalizeCategories(user?.category);
  return categories.some((item) => ALLOWED_CREATOR_CATEGORIES.includes(String(item).trim()));
}

function hasValidPayoutDetails(bankAccount = {}) {
  return Boolean(
    bankAccount?.bank &&
      bankAccount?.type &&
      bankAccount?.number !== undefined &&
      bankAccount?.number !== null &&
      String(bankAccount.number).trim() !== ""
  );
}

function buildPayoutSnapshot(user) {
  const bankAccount = user?.bankAccount || {};
  return {
    bank: bankAccount.bank || "",
    number:
      bankAccount.number !== undefined && bankAccount.number !== null
        ? String(bankAccount.number)
        : "",
    type: bankAccount.type || "",
    accountHolder: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
    email: user?.email || "",
  };
}

function getWalletSnapshot(user) {
  const wallet = user?.wallet || {};
  return {
    balance: Number(wallet.balance) || 0,
    pendingBalance: Number(wallet.pendingBalance) || 0,
    lockedBalance: Number(wallet.lockedBalance) || 0,
    totalEarnings: Number(wallet.totalEarnings) || 0,
    totalWithdrawn: Number(wallet.totalWithdrawn) || 0,
    currency: wallet.currency || DEFAULT_CURRENCY,
    lastPayoutDate: wallet.lastPayoutDate || null,
  };
}

function buildAdminProcessLink(token) {
  const baseUrl = (
    process.env.FRONTEND_URL ||
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    "http://localhost:5173"
  )
    .trim()
    .replace(/\/$/, "");

  return `${baseUrl}/admin/withdrawals/process?token=${encodeURIComponent(token)}`;
}

function buildPublicAssetUrl(relativeOrAbsoluteUrl) {
  if (!relativeOrAbsoluteUrl) return "";
  if (/^https?:\/\//i.test(relativeOrAbsoluteUrl)) {
    return relativeOrAbsoluteUrl;
  }

  const backendBase = (
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5000"
  )
    .trim()
    .replace(/\/$/, "");

  return `${backendBase}${relativeOrAbsoluteUrl.startsWith("/") ? "" : "/"}${relativeOrAbsoluteUrl}`;
}

class WithdrawalsService {
  async createWithdrawal({ userId, amount }) {
    const requestedAmount = roundAmount(amount);
    if (!userId) {
      throw createHttpError(400, "userId es requerido");
    }
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      throw createHttpError(400, "El monto del retiro debe ser mayor a 0");
    }

    const session = await mongoose.startSession();
    let createdWithdrawal = null;
    let wallet = null;
    let user = null;

    try {
      await session.withTransaction(async () => {
        user = await UserMongoose.findById(userId).session(session);
        if (!user) {
          throw createHttpError(404, "Usuario no encontrado");
        }
        if (!hasAllowedWithdrawalCategory(user)) {
          throw createHttpError(403, "Solo instructores y gestores pueden solicitar retiros");
        }
        if (!hasValidPayoutDetails(user.bankAccount)) {
          throw createHttpError(400, "Debe registrar una cuenta bancaria o billetera válida antes de solicitar un retiro");
        }

        const currentBalance = Number(user.wallet?.balance) || 0;
        if (currentBalance < requestedAmount) {
          throw createHttpError(400, "Saldo insuficiente para realizar el retiro");
        }

        const walletCurrency = user.wallet?.currency || DEFAULT_CURRENCY;
        const walletUpdateResult = await UserMongoose.updateOne(
          { _id: user._id, "wallet.balance": { $gte: requestedAmount } },
          {
            $inc: {
              "wallet.balance": -requestedAmount,
              "wallet.lockedBalance": requestedAmount,
            },
            $set: {
              "wallet.currency": walletCurrency,
            },
          },
          { session }
        );

        if (!walletUpdateResult.modifiedCount) {
          throw createHttpError(409, "No fue posible bloquear los fondos del retiro");
        }

        const expiresAt = new Date(
          Date.now() + WITHDRAWAL_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
        );
        const currency = walletCurrency || DEFAULT_CURRENCY;

        const docs = await WithdrawalsMongoose.create(
          [
            {
              userId: user._id,
              amount: requestedAmount,
              status: "pending",
              payoutMethod: user.bankAccount.bank,
              payoutDetails: buildPayoutSnapshot(user),
              expiresAt,
              currency,
            },
          ],
          { session }
        );

        createdWithdrawal = docs[0];
        const refreshedUser = await UserMongoose.findById(user._id).select("wallet").session(session);
        wallet = getWalletSnapshot(refreshedUser);
      });
    } finally {
      await session.endSession();
    }

    const adminToken = withdrawalAdminTokenService.generateToken({
      withdrawalId: createdWithdrawal._id,
    });
    const adminProcessLink = buildAdminProcessLink(adminToken);

    try {
      await userService.sendAdminWithdrawalRequestEmail({
        to: process.env.GOOGLE_EMAIL,
        user,
        withdrawal: createdWithdrawal,
        payoutDetails: buildPayoutSnapshot(user),
        wallet,
        adminProcessLink,
      });
    } catch (error) {
      logger.error("Error al enviar email de solicitud de retiro al admin:", error);
    }

    return {
      withdrawal: createdWithdrawal.toObject(),
      wallet,
      adminProcessLink,
    };
  }

  async getAdminProcessData(withdrawalId) {
    if (!withdrawalId) {
      throw createHttpError(400, "withdrawalId es requerido");
    }

    const withdrawal = await WithdrawalsMongoose.findById(withdrawalId)
      .populate("userId", "firstName lastName email ci phone category bankAccount wallet")
      .lean();

    if (!withdrawal) {
      throw createHttpError(404, "Retiro no encontrado");
    }

    if (
      withdrawal.status === "pending" &&
      withdrawal.expiresAt &&
      new Date(withdrawal.expiresAt) <= new Date()
    ) {
      await this.expireOne(withdrawal._id);
      throw createHttpError(409, "El retiro ya expiró y los fondos fueron devueltos al usuario");
    }

    if (!["pending", "processing"].includes(withdrawal.status)) {
      throw createHttpError(409, `El retiro no puede procesarse en estado ${withdrawal.status}`);
    }

    return withdrawal;
  }

  async processWithdrawal({ withdrawalId, proofUrl }) {
    if (!withdrawalId) {
      throw createHttpError(400, "withdrawalId es requerido");
    }
    if (!proofUrl || !String(proofUrl).trim()) {
      throw createHttpError(400, "proofUrl es requerido para procesar el retiro");
    }

    const proofPath = String(proofUrl).trim();
    const session = await mongoose.startSession();
    let processed = null;
    let user = null;

    try {
      await session.withTransaction(async () => {
        const withdrawal = await WithdrawalsMongoose.findOne({
          _id: withdrawalId,
          status: { $in: ["pending", "processing"] },
        }).session(session);

        if (!withdrawal) {
          throw createHttpError(404, "El retiro no existe o ya fue procesado");
        }

        if (withdrawal.status === "pending" && withdrawal.expiresAt && withdrawal.expiresAt <= new Date()) {
          throw createHttpError(409, "El retiro está expirado y no puede procesarse");
        }

        user = await UserMongoose.findById(withdrawal.userId).session(session);
        if (!user) {
          throw createHttpError(404, "Usuario asociado al retiro no encontrado");
        }

        const amount = roundAmount(withdrawal.amount);
        const currency = user.wallet?.currency || DEFAULT_CURRENCY;

        const walletUpdateResult = await UserMongoose.updateOne(
          { _id: user._id, "wallet.lockedBalance": { $gte: amount } },
          {
            $inc: {
              "wallet.lockedBalance": -amount,
              "wallet.totalWithdrawn": amount,
            },
            $set: {
              "wallet.lastPayoutDate": new Date(),
              "wallet.currency": currency,
            },
          },
          { session }
        );

        if (!walletUpdateResult.modifiedCount) {
          throw createHttpError(409, "Los fondos bloqueados no alcanzan para completar el retiro");
        }

        const processedAt = new Date();
        const withdrawalUpdateResult = await WithdrawalsMongoose.updateOne(
          {
            _id: withdrawal._id,
            status: { $in: ["pending", "processing"] },
          },
          {
            $set: {
              status: "completed",
              proofUrl: proofPath,
              processedAt,
            },
          },
          { session }
        );

        if (!withdrawalUpdateResult.modifiedCount) {
          throw createHttpError(409, "No fue posible marcar el retiro como completado");
        }

        await TransactionsMongoose.create(
          [
            {
              userId: user._id,
              type: "withdrawal",
              sourceType: "service",
              sourceId: withdrawal._id,
              paymentId: `withdrawal:${withdrawal._id}`,
              grossAmount: -amount,
              fee: 0,
              netAmount: -amount,
              status: "paid",
              availableAt: processedAt,
              currency,
            },
          ],
          { session }
        );

        processed = {
          _id: String(withdrawal._id),
          amount,
          currency,
          payoutMethod: withdrawal.payoutMethod,
          payoutDetails: withdrawal.payoutDetails,
          proofUrl: proofPath,
          processedAt,
          status: "completed",
        };
      });
    } finally {
      await session.endSession();
    }

    try {
      await userService.sendWithdrawalCompletedEmail({
        to: user?.email,
        userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
        amount: processed.amount,
        currency: processed.currency,
        payoutMethod: processed.payoutMethod,
        payoutDetails: processed.payoutDetails,
        proofUrl: buildPublicAssetUrl(processed.proofUrl),
      });
    } catch (error) {
      logger.error("Error al enviar email de retiro completado:", error);
    }

    return processed;
  }

  async rejectWithdrawal({ withdrawalId, reason = "" }) {
    if (!withdrawalId) {
      throw createHttpError(400, "withdrawalId es requerido");
    }

    const rejectionReason = String(reason || "").trim();
    const session = await mongoose.startSession();
    let rejected = null;
    let user = null;

    try {
      await session.withTransaction(async () => {
        const withdrawal = await WithdrawalsMongoose.findOne({
          _id: withdrawalId,
          status: { $in: ["pending", "processing"] },
        }).session(session);

        if (!withdrawal) {
          throw createHttpError(404, "El retiro no existe o ya fue resuelto");
        }

        user = await UserMongoose.findById(withdrawal.userId).session(session);
        if (!user) {
          throw createHttpError(404, "Usuario asociado al retiro no encontrado");
        }

        const amount = roundAmount(withdrawal.amount);
        const currency = user.wallet?.currency || DEFAULT_CURRENCY;

        const walletUpdateResult = await UserMongoose.updateOne(
          { _id: user._id, "wallet.lockedBalance": { $gte: amount } },
          {
            $inc: {
              "wallet.lockedBalance": -amount,
              "wallet.balance": amount,
            },
            $set: {
              "wallet.currency": currency,
            },
          },
          { session }
        );

        if (!walletUpdateResult.modifiedCount) {
          throw createHttpError(409, "Los fondos bloqueados no alcanzan para rechazar el retiro");
        }

        const processedAt = new Date();
        const withdrawalUpdateResult = await WithdrawalsMongoose.updateOne(
          {
            _id: withdrawal._id,
            status: { $in: ["pending", "processing"] },
          },
          {
            $set: {
              status: "rejected",
              processedAt,
              rejectionReason,
            },
          },
          { session }
        );

        if (!withdrawalUpdateResult.modifiedCount) {
          throw createHttpError(409, "No fue posible rechazar el retiro");
        }

        rejected = {
          _id: String(withdrawal._id),
          amount,
          currency,
          payoutMethod: withdrawal.payoutMethod,
          payoutDetails: withdrawal.payoutDetails,
          processedAt,
          status: "rejected",
          rejectionReason,
        };
      });
    } finally {
      await session.endSession();
    }

    try {
      await userService.sendWithdrawalRejectedEmail({
        to: user?.email,
        userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
        amount: rejected.amount,
        currency: rejected.currency,
        payoutMethod: rejected.payoutMethod,
        payoutDetails: rejected.payoutDetails,
        reason: rejected.rejectionReason,
      });
    } catch (error) {
      logger.error("Error al enviar email de retiro rechazado:", error);
    }

    return rejected;
  }

  async expireOne(withdrawalId) {
    const session = await mongoose.startSession();
    let expired = null;
    let user = null;

    try {
      await session.withTransaction(async () => {
        const withdrawal = await WithdrawalsMongoose.findOne({
          _id: withdrawalId,
          status: "pending",
          expiresAt: { $lte: new Date() },
        }).session(session);

        if (!withdrawal) {
          return;
        }

        user = await UserMongoose.findById(withdrawal.userId).session(session);
        if (!user) {
          throw createHttpError(404, "Usuario asociado al retiro no encontrado");
        }

        const amount = roundAmount(withdrawal.amount);
        const currency = user.wallet?.currency || DEFAULT_CURRENCY;

        const walletUpdateResult = await UserMongoose.updateOne(
          { _id: user._id, "wallet.lockedBalance": { $gte: amount } },
          {
            $inc: {
              "wallet.lockedBalance": -amount,
              "wallet.balance": amount,
            },
            $set: {
              "wallet.currency": currency,
            },
          },
          { session }
        );

        if (!walletUpdateResult.modifiedCount) {
          throw createHttpError(409, "No fue posible devolver los fondos del retiro expirado");
        }

        const processedAt = new Date();
        const withdrawalUpdateResult = await WithdrawalsMongoose.updateOne(
          {
            _id: withdrawal._id,
            status: "pending",
            expiresAt: { $lte: new Date() },
          },
          {
            $set: {
              status: "expired",
              processedAt,
            },
          },
          { session }
        );

        if (!withdrawalUpdateResult.modifiedCount) {
          throw createHttpError(409, "No fue posible marcar el retiro como expirado");
        }

        expired = {
          _id: String(withdrawal._id),
          amount,
          currency,
          payoutMethod: withdrawal.payoutMethod,
          payoutDetails: withdrawal.payoutDetails,
          processedAt,
          status: "expired",
        };
      });
    } finally {
      await session.endSession();
    }

    if (expired && user?.email) {
      try {
        await userService.sendWithdrawalExpiredEmail({
          to: user.email,
          userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
          amount: expired.amount,
          currency: expired.currency,
          payoutMethod: expired.payoutMethod,
          payoutDetails: expired.payoutDetails,
        });
      } catch (error) {
        logger.error("Error al enviar email de retiro expirado:", error);
      }
    }

    return expired;
  }

  async expirePendingWithdrawals(now = new Date()) {
    const expirableIds = await WithdrawalsMongoose.find({
      status: "pending",
      expiresAt: { $lte: now },
    })
      .select("_id")
      .lean();

    let processed = 0;
    for (const item of expirableIds) {
      try {
        const expired = await this.expireOne(item._id);
        if (expired) {
          processed += 1;
        }
      } catch (error) {
        logger.error(`Error al expirar retiro ${item._id}:`, error);
      }
    }

    return { processed };
  }

  async listAdminWithdrawals({ page = 1, limit = 10, status, userEmail, userId, payoutMethod } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
    const skip = (safePage - 1) * safeLimit;

    const mongoose = await import("mongoose");
    const ObjectId = mongoose.default?.Types?.ObjectId;

    const statusTrim = status ? String(status).trim() : "";
    const emailTrim = userEmail ? String(userEmail).trim() : "";
    const userIdTrim = userId ? String(userId).trim() : "";
    const payoutMethodTrim = payoutMethod ? String(payoutMethod).trim() : "";

    const matchWithdrawal = {};
    if (statusTrim) matchWithdrawal.status = statusTrim;
    if (payoutMethodTrim) matchWithdrawal.payoutMethod = payoutMethodTrim;
    if (userIdTrim) {
      matchWithdrawal.userId =
        ObjectId && ObjectId.isValid(userIdTrim) ? new ObjectId(userIdTrim) : userIdTrim;
    }

    const pipeline = [
      { $match: matchWithdrawal },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    if (emailTrim) {
      pipeline.push({ $match: { "user.email": { $regex: emailTrim, $options: "i" } } });
    }

    pipeline.push({
      $facet: {
        docs: [{ $skip: skip }, { $limit: safeLimit }],
        total: [{ $count: "count" }],
      },
    });

    const result = await WithdrawalsMongoose.aggregate(pipeline);
    const facet = result?.[0] || {};
    const docsRaw = facet.docs || [];
    const totalDocs = facet.total?.[0]?.count || 0;
    const totalPages = safeLimit > 0 ? Math.ceil(totalDocs / safeLimit) : 0;

    const docs = docsRaw.map((d) => {
      const processToken = withdrawalAdminTokenService.generateToken({ withdrawalId: d._id });
      return {
        ...d,
        _id: String(d._id),
        processToken,
        user: d.user
          ? {
              id: String(d.user._id),
              firstName: d.user.firstName,
              lastName: d.user.lastName,
              email: d.user.email,
              ci: d.user.ci,
              phone: d.user.phone,
              category: d.user.category,
            }
          : null,
      };
    });

    return {
      docs,
      totalDocs,
      limit: safeLimit,
      page: safePage,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    };
  }
}

export const withdrawalsService = new WithdrawalsService();
