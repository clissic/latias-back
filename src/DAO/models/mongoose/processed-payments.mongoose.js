import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = new Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  user: {
    id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
  },

  item: {
    type: {
      type: String,
      required: true,
      enum: ["course", "subscription", "procedure", "service", "other"],
      index: true,
    },
    id: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
  },

  amount: {
    value: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },

  paymentStatus: {
    type: String,
    required: true,
    enum: ["approved", "pending", "rejected", "cancelled", "refunded"],
    default: "pending",
    index: true,
  },

  paymentStatusDetail: {
    type: String,
  },

  externalReference: {
    type: String,
    required: true,
    index: true,
  },

  provider: {
    type: String,
    default: "mercadopago",
  },

  processedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  metadata: {
    type: Schema.Types.Mixed,
  },

  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

schema.index({ paymentId: 1, processedAt: -1 });
schema.index({ "user.id": 1, processedAt: -1 });
schema.index({ "item.type": 1, processedAt: -1 });
schema.index({ "item.id": 1, processedAt: -1 });
schema.index({ processedAt: -1 });
schema.index({ paymentStatus: 1, processedAt: -1 });

schema.plugin(mongoosePaginate);

export const ProcessedPaymentsMongoose = model("processed-payments", schema);
