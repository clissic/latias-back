import { Schema, model } from "mongoose";

const schema = new Schema({
  firstName: { type: String, required: true, max: 100 },
  lastName: { type: String, required: true, max: 100 },
  ci: { 
    type: Number, 
    required: true, 
    unique: true
  },
  profileImage: { type: String, default: "" },
  profession: { type: String, required: true, max: 200 },
  experience: { type: String, max: 500 },
  bio: { type: String, max: 1000 },
  certifications: [{ type: String }],
  achievements: [{ type: String }],
  courses: [{ type: String }], // Array de courseId de cursos (string)
  contact: {
    email: { type: String, required: true, max: 100 },
    phone: { type: String, max: 20, default: "" }
  },
  socialMedia: {
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" }
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

export const ProfessorsMongoose = model("professors", schema);
