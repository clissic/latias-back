import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = new Schema({
  firstName: { type: String, required: true, max: 100 },
  lastName: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100, unique: true },
  ci: { type: String, required: true, max: 20 },
  password: { type: String, required: true, max: 100 },
  phone: { type: String, max: 20, default: "" },
  birth: { type: Date, required: true },
  status: { type: String, default: "Estudiante" },
  rank: {
    title: { type: String, default: "Grumete" },
    description: { type: String, default: "Recién embarcado en la travesía del aprendizaje, aprendiendo lo básico." },
  },
  address: {
    street: { type: String, max: 100, default: "No definido" },
    city: { type: String, max: 100, default: "No definido" },
    state: { type: String, max: 100, default: "No definido" },
    country: { type: String, max: 100, default: "No definido"},
    number: { type: Number, max: 10, default: null},
    zipCode: { type: Number, max: 10, default: null },
  },
  preferences: {
    language: { type: String, default: "es" },
    notifications: { type: Boolean, default: true },
    newsLetter: { type: Boolean, default: false },
  },
  statistics: {
    eventsAttended: { type: Number, default: 0 },
    timeConnected: { type: Number, default: 0 },
    certificatesQuantity: { type: Number, default: 0},
  },
  settings: {
      theme: { type: String, default: "light" },
      twoStepVerification: { type: Boolean, default: false },
  },
  purchasedCourses: { type: Array, default: [] },
  finishedCourses: { type: Array, default: [] },
  lastLogin: { type: Date }
});

schema.plugin(mongoosePaginate);

export const UserMongoose = model("users", schema);