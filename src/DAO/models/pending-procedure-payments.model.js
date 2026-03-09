import { PendingProcedurePaymentsMongoose } from "./mongoose/pending-procedure-payments.mongoose.js";

class PendingProcedurePaymentsModel {
  async create(data) {
    return PendingProcedurePaymentsMongoose.create(data);
  }

  async findById(id) {
    return PendingProcedurePaymentsMongoose.findById(id).lean();
  }

  async deleteOne(id) {
    const result = await PendingProcedurePaymentsMongoose.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export const pendingProcedurePaymentsModel = new PendingProcedurePaymentsModel();
