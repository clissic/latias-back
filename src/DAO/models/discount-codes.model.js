import mongoose from "mongoose";
import { DiscountCodesMongoose } from "./mongoose/discount-codes.mongoose.js";

class DiscountCodesModel {
  async getAll() {
    const codes = await DiscountCodesMongoose.find({}).sort({ createdAt: -1 });
    return codes;
  }

  async findById(id) {
    const code = await DiscountCodesMongoose.findById(id);
    return code;
  }

  async findByCode(code) {
    const doc = await DiscountCodesMongoose.findOne({
      code: code.trim().toUpperCase(),
    });
    return doc;
  }

  async create(data) {
    const normalized = { ...data, code: (data.code || "").trim().toUpperCase() };
    const created = await DiscountCodesMongoose.create(normalized);
    return created;
  }

  async updateOne({ _id, ...updateData }) {
    if (updateData.code != null) {
      updateData.code = String(updateData.code).trim().toUpperCase();
    }
    await DiscountCodesMongoose.updateOne({ _id }, { $set: updateData });
    const updated = await DiscountCodesMongoose.findById(_id);
    return updated;
  }

  async deleteOne(_id) {
    const result = await DiscountCodesMongoose.deleteOne({ _id });
    return result;
  }

  async addUse(_id, userId) {
    const uid = mongoose.Types.ObjectId.isValid(userId) ? (typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId) : userId;
    const doc = await DiscountCodesMongoose.findOneAndUpdate(
      {
        _id,
        isActive: true,
        $expr: { $lt: [{ $size: "$usedBy" }, "$quantity"] },
        usedBy: { $nin: [uid] },
      },
      { $push: { usedBy: uid } },
      { new: true }
    );
    if (!doc) return null;
    if (doc.usedBy.length === doc.quantity) {
      await DiscountCodesMongoose.updateOne({ _id }, { $set: { isActive: false } });
    }
    return doc;
  }
}

export const discountCodesModel = new DiscountCodesModel();
