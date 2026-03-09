import { Schema, model } from "mongoose";

const schema = new Schema({
  code: { type: String, required: true, unique: true, trim: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  usedBy: { type: [Schema.Types.ObjectId], default: [] },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

schema.index({ code: 1 });

export const DiscountCodesMongoose = model("discount-codes", schema);
