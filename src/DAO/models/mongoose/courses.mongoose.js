import { Schema, model } from "mongoose";

const schema = new Schema({
  courseId: { type: String, required: true },
  sku: { type: String, required: true },
  courseName: { type: String, required: true },
  bannerUrl: { type: String },
  image: { type: String },
  shortImage: { type: String },
  currency: { type: String, default: "UYU" },
  shortDescription: { type: String },
  longDescription: { type: String },
  duration: { type: Number, min: 0 },
  price: { type: Number, required: true, min: 0 },
  difficulty: { type: String },
  category: { type: String, required: true },
  certificate: {
    certificateId: { type: String, default: null },
    certificateUrl: { type: String, default: null },
    credentialNumber: { type: String, default: null }
  },
  instructor: { type: Schema.Types.ObjectId, ref: "Instructor", default: null },
  modules: [
    {
      moduleId: { type: String, required: true },
      moduleName: { type: String, required: true },
      moduleDescription: { type: String },
      lessons: [
        {
          lessonId: { type: String, required: true },
          lessonName: { type: String, required: true },
          lessonDescription: { type: String },
          /** ID del asset en Gumlet (reproductor embebido). */
          gumletAssetId: { type: String },
          // Material de apoyo en PDF para la lección
          supportPdfUrl: { type: String },
          supportPdfName: { type: String },
          // Lista de archivos asociados a la lección (por ahora se usará para PDFs)
          lessonFiles: [
            {
              url: { type: String, required: true },
              name: { type: String },
            },
          ],
        }
      ],
      questionBank: [
        {
          questionId: { type: String, required: true },
          questionText: { type: String, required: true },
          options: [
            { 
              optionId: { type: String, required: true }, 
              optionText: { type: String, required: true }, 
              isCorrect: { type: Boolean, default: false } 
            }
          ]
        }
      ]
    }
  ]
});

export const CoursesMongoose = model("courses", schema);