import { Schema, model } from "mongoose";

const schema = new Schema({
  courseId: { type: String },
  sku: { type: String },
  courseName: { type: String },
  bannerUrl: { type: String },
  image: { type: String },
  shortImage: { type: String },
  currency: { type: String },
  shortDescription: { type: String },
  longDescription: { type: String },
  duration: { type: String },
  price: { type: Number , default: 0},
  difficulty: { type: String},
  category: { type: String},
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
      moduleId: { type: String },
      moduleName: { type: String },
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
          lessonId: { type: String},
          lessonName: { type: String},
          lessonDescription: { type: String},
          videoUrl: { type: String},
          completed: { type: Boolean, default: false }
        }
      ],
      questionBank: [
        {
          questionId: { type: String, default: null },
          questionText: { type: String, default: null },
          options: [
            { optionId: { type: String, default: null }, optionText: { type: String, default: null }, isCorrect: { type: Boolean, default: false} }
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