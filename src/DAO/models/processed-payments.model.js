import { ProcessedPaymentsMongoose } from "./mongoose/processed-payments.mongoose.js";

class ProcessedPaymentsModel {
  async create(paymentData) {
    const paymentCreated = await ProcessedPaymentsMongoose.create(paymentData);
    return paymentCreated;
  }

  async findByPaymentId(paymentId) {
    return ProcessedPaymentsMongoose.findOne({ paymentId });
  }

  async getAll(filters = {}, limit = 100, skip = 0, sort = { processedAt: -1 }) {
    return ProcessedPaymentsMongoose.find(filters).sort(sort).limit(limit).skip(skip).lean();
  }

  async count(filters = {}) {
    return ProcessedPaymentsMongoose.countDocuments(filters);
  }

  async getByUserId(userId, limit = 100) {
    return ProcessedPaymentsMongoose.find({ "user.id": userId })
      .sort({ processedAt: -1 })
      .limit(limit)
      .lean();
  }

  /** Buscar por item tipo course y item.id (courseId) */
  async getByCourseId(courseId, limit = 100) {
    return ProcessedPaymentsMongoose.find({ "item.type": "course", "item.id": courseId })
      .sort({ processedAt: -1 })
      .limit(limit)
      .lean();
  }

  async getPaginated(filters = {}, page = 1, limit = 20, sort = { processedAt: -1 }) {
    const options = { page, limit, sort };
    const result = await ProcessedPaymentsMongoose.paginate(filters, options);
    return result;
  }
}

export const processedPaymentsModel = new ProcessedPaymentsModel();
