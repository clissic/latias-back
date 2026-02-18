import { ProcessedPaymentsMongoose } from "./mongoose/processed-payments.mongoose.js";

class ProcessedPaymentsModel {
  async create(paymentData) {
    const paymentCreated = await ProcessedPaymentsMongoose.create(paymentData);
    return paymentCreated;
  }

  async findByPaymentId(paymentId) {
    const payment = await ProcessedPaymentsMongoose.findOne({ paymentId });
    return payment;
  }

  async getAll(filters = {}, limit = 100, skip = 0, sort = { processedAt: -1 }) {
    const payments = await ProcessedPaymentsMongoose.find(filters)
      .populate('userId', 'firstName lastName email ci')
      .sort(sort)
      .limit(limit)
      .skip(skip);
    return payments;
  }

  async count(filters = {}) {
    return ProcessedPaymentsMongoose.countDocuments(filters);
  }

  async getByUserId(userId, limit = 100) {
    const payments = await ProcessedPaymentsMongoose.find({ userId })
      .populate('userId', 'firstName lastName email ci')
      .sort({ processedAt: -1 })
      .limit(limit);
    return payments;
  }

  async getByCourseId(courseId, limit = 100) {
    const payments = await ProcessedPaymentsMongoose.find({ courseId })
      .populate('userId', 'firstName lastName email ci')
      .sort({ processedAt: -1 })
      .limit(limit);
    return payments;
  }

  async getPaginated(filters = {}, page = 1, limit = 20, sort = { processedAt: -1 }) {
    const options = {
      page: page,
      limit: limit,
      sort: sort,
      populate: {
        path: 'userId',
        select: 'firstName lastName email ci'
      }
    };
    
    const result = await ProcessedPaymentsMongoose.paginate(filters, options);
    return result;
  }
}

export const processedPaymentsModel = new ProcessedPaymentsModel();
