import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    /** Puntuación 1–5. */
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 4000 },
    /** Destacada en vitrina (solo administración / instructores). */
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "ratings" }
);

schema.index({ courseId: 1, userId: 1 }, { unique: true });

export const RatingsMongoose = model("Rating", schema);
