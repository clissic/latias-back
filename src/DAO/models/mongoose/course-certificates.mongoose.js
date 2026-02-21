import { Schema, model } from "mongoose";

/**
 * Certificado (award) emitido cuando el usuario aprueba un curso.
 * Se crea al finalizar la prueba final con condiciones de aprobación cumplidas.
 */
const schema = new Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    profession: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: Number,
      min: 0,
      default: null,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    resultsModules: {
      type: [
        {
          moduleName: { type: String, required: true },
          result: { type: Number, required: true },
        },
      ],
      default: [],
    },
    resultFinalTest: {
      type: Number,
      required: true,
    },
    finalResult: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

schema.index({ userName: 1 });
schema.index({ issuedAt: -1 });

export const CourseCertificateMongoose = model("course_certificates", schema);
