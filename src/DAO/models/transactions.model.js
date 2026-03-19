import { TransactionsMongoose } from "./mongoose/transactions.mongoose.js";

export const FEE_PERCENT_DEFAULT = 0.2;

export const transactionsModel = {
  async create(data) {
    const doc = await TransactionsMongoose.create(data);
    return doc;
  },

  async findPendingAvailable(now = new Date()) {
    return TransactionsMongoose.find({
      status: "pending",
      availableAt: { $lte: now },
    }).lean();
  },

  async markAsAvailable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return { matchedCount: 0, modifiedCount: 0 };
    return TransactionsMongoose.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "available" } }
    );
  },

  async getByUser(userId, { status, type, limit = 100 } = {}) {
    const filter = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    return TransactionsMongoose.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500))
      .lean();
  },

  async findByPaymentId(paymentId) {
    if (!paymentId) return null;
    return TransactionsMongoose.findOne({ paymentId: String(paymentId) }).lean();
  },

  async findById(id) {
    if (!id) return null;
    return TransactionsMongoose.findById(id).lean();
  },
};

