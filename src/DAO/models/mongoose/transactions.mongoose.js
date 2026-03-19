import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true }, // receptor del dinero
    type: {
      type: String,
      enum: ["course_sale", "service_payment", "refund", "withdrawal", "adjustment"],
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["course", "service"],
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    paymentId: { type: String }, // id externo (ej: Mercado Pago) o ref a processed-payments
    grossAmount: { type: Number, required: true },
    fee: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "available", "paid"],
      default: "pending",
    },
    availableAt: { type: Date }, // obligatorio para ingresos pending; opcional para refund/withdrawal
    currency: { type: String, default: "USD" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "transactions",
  }
);

export const TransactionsMongoose = model("transactions", transactionSchema);

