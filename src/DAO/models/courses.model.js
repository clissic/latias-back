import { CoursesMongoose } from "./mongoose/courses.mongoose.js";

class CoursesModel {
  async getAll() {
    const courses = await CoursesMongoose.find(
      {},
      {
        _id: true,
        courseId: true,
        sku: true,
        courseName: true,
        bannerUrl: true,
        image: true,
        shortImage: true,
        currency: true,
        shortDescription: true,
        longDescription: true,
        duration: true,
        price: true,
        difficulty: true,
        category: true,
        certificate: true,
        professor: true,
        modules: true,
      }
    );
    return courses;
  }

  async findById(id) {
    const courseFound = await CoursesMongoose.findById(id);
    return courseFound;
  }

  async findByCourseId(courseId) {
    const course = await CoursesMongoose.findOne(
      { courseId: courseId },
      {
        _id: true,
        courseId: true,
        sku: true,
        courseName: true,
        bannerUrl: true,
        image: true,
        shortImage: true,
        currency: true,
        shortDescription: true,
        longDescription: true,
        duration: true,
        price: true,
        difficulty: true,
        category: true,
        certificate: true,
        professor: true,
        modules: true,
      }
    );
    return course;
  }

  async findBySku(sku) {
    const course = await CoursesMongoose.findOne(
      { sku: sku },
      {
        _id: true,
        courseId: true,
        sku: true,
        courseName: true,
        bannerUrl: true,
        image: true,
        shortImage: true,
        currency: true,
        shortDescription: true,
        longDescription: true,
        duration: true,
        price: true,
        difficulty: true,
        category: true,
        certificate: true,
        professor: true,
        modules: true,
      }
    );
    return course;
  }

  async create({
    courseId,
    sku,
    courseName,
    bannerUrl,
    image,
    shortImage,
    currency,
    shortDescription,
    longDescription,
    duration,
    price,
    difficulty,
    category,
    professor,
    modules,
  }) {
    const courseCreated = await CoursesMongoose.create({
      courseId,
      sku,
      courseName,
      bannerUrl,
      image,
      shortImage,
      currency,
      shortDescription,
      longDescription,
      duration,
      price,
      difficulty,
      category,
      professor,
      modules,
    });
    return courseCreated;
  }

  async updateOne({
    _id,
    courseId,
    sku,
    courseName,
    bannerUrl,
    image,
    shortImage,
    currency,
    shortDescription,
    longDescription,
    duration,
    price,
    difficulty,
    category,
    certificate,
    professor,
    modules,
  }) {
    const courseUpdated = await CoursesMongoose.updateOne(
      {
        _id: _id,
      },
      {
        courseId,
        sku,
        courseName,
        bannerUrl,
        image,
        shortImage,
        currency,
        shortDescription,
        longDescription,
        duration,
        price,
        difficulty,
        category,
        certificate,
        professor,
        modules,
      }
    );
    return courseUpdated;
  }

  async deleteOne(_id) {
    const result = await CoursesMongoose.deleteOne({ _id: _id });
    return result;
  }


  async updateCertificate({ _id, certificate }) {
    const courseUpdated = await CoursesMongoose.updateOne(
      {
        _id: _id,
      },
      {
        certificate: certificate,
      }
    );
    return courseUpdated;
  }

  async findByCategory(category) {
    const courses = await CoursesMongoose.find(
      { category: category },
      {
        _id: true,
        courseId: true,
        sku: true,
        courseName: true,
        bannerUrl: true,
        image: true,
        shortImage: true,
        currency: true,
        shortDescription: true,
        longDescription: true,
        duration: true,
        price: true,
        difficulty: true,
        category: true,
        certificate: true,
        professor: true,
        modules: true,
      }
    );
    return courses;
  }

  async findByDifficulty(difficulty) {
    const courses = await CoursesMongoose.find(
      { difficulty: difficulty },
      {
        _id: true,
        courseId: true,
        sku: true,
        courseName: true,
        bannerUrl: true,
        image: true,
        shortImage: true,
        currency: true,
        shortDescription: true,
        longDescription: true,
        duration: true,
        price: true,
        difficulty: true,
        category: true,
        certificate: true,
        professor: true,
        modules: true,
      }
    );
    return courses;
  }
}

export const coursesModel = new CoursesModel();
