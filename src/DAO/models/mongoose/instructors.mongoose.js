import { Schema, model } from "mongoose";

const instructorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    ci: { type: Number, required: true, unique: true },
    profileImage: { type: String, default: "" },
    profession: { type: String, required: true },
    experience: { type: String, default: "" },
    bio: { type: String, default: "" },
    certifications: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    courses: { type: [String], default: [] },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    socialMedia: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
  },
  { timestamps: true, collection: "instructors" }
);

export const InstructorsMongoose = model("Instructor", instructorSchema);
