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
  enrolledDate: { type: Date, default: Date.now },
  isFinished: { type: Boolean, default: false},
  finishedDate: { type: Date, default: null },
  progress: { type: Number, default: 0},
  attempts: [
    {
      date: { type: Date, default: null },
      score: { type: Number, default: null }
    }
  ],
  certificate: {
    certificateId: { type: String, default: null },
    certificateUrl: { type: String, default: null },
    credentialNumber: { type: String, default: null }
  },
  professor: [
    {
      firstName: { type: String },
      lastName: { type: String },
      profession: { type: String }
    }
  ],
  modules: [
    {
      moduleId: { type: String, required: true },
      moduleName: { type: String, required: true },
      moduleDescription: { type: String },
      locked: { type: Boolean, default: false },
      isFinished: { type: Boolean, default: false },
      finishedDate: { type: Date, default: null },
      progress: { type: Number, default: 0 },
      attempts: [
        {
          date: { type: Date, default: null },
          score: { type: Number, default: null }
        }
      ],
      testCompleted: { type: Boolean, default: false },
      score: { type: Number, default: null },
      lessons: [
        {
          lessonId: { type: String, required: true },
          lessonName: { type: String, required: true },
          lessonDescription: { type: String },
          videoUrl: { type: String },
          completed: { type: Boolean, default: false }
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
  ],
  finalExam: {
    questionCount: { type: Number, default: 40},
    testCompleted: { type: Boolean, default: false},
    score: { type: Number, default: null}
  }
});

export const CoursesMongoose = model("courses", schema);