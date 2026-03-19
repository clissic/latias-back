import { Schema, model } from "mongoose";

const withdrawalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected", "expired"],
      default: "pending",
      index: true,
    },
    payoutMethod: { type: String, default: "" },
    payoutDetails: { type: Schema.Types.Mixed, default: {} },
    proofUrl: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    expiresAt: { type: Date, required: true, index: true },
    processedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "withdrawals",
  }
);

export const WithdrawalsMongoose = model("withdrawals", withdrawalSchema);
