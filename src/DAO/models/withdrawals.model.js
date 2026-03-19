import { WithdrawalsMongoose } from "./mongoose/withdrawals.mongoose.js";

class WithdrawalsModel {
  async create(data, options = {}) {
    const docs = await WithdrawalsMongoose.create([data], options);
    return docs[0];
  }

  async findById(id) {
    return WithdrawalsMongoose.findById(id);
  }

  async findByIdLean(id) {
    return WithdrawalsMongoose.findById(id).lean();
  }

  async findByIdWithUser(id) {
    return WithdrawalsMongoose.findById(id).populate("userId");
  }

  async findExpirable(now = new Date()) {
    return WithdrawalsMongoose.find({
      status: "pending",
      expiresAt: { $lte: now },
    });
  }
}

export const withdrawalsModel = new WithdrawalsModel();
