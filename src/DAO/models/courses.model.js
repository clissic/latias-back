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
        rating: true,
        ratingCount: true,
        certificate: true,
        instructor: true,
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
        rating: true,
        ratingCount: true,
        certificate: true,
        instructor: true,
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
        rating: true,
        ratingCount: true,
        certificate: true,
        instructor: true,
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
    instructor,
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
      instructor: instructor || undefined,
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
    instructor,
    modules,
  }) {
    const updateFields = {
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
      modules,
    };
    if (instructor !== undefined) updateFields.instructor = instructor || null;
    const courseUpdated = await CoursesMongoose.updateOne({ _id }, { $set: updateFields });
    return courseUpdated;
  }

  async deleteOne(_id) {
    const result = await CoursesMongoose.deleteOne({ _id: _id });
    return result;
  }

  /**
   * Asigna o quita el instructor de un curso. courseIdOrMongoId puede ser el _id del curso o su courseId.
   */
  async setInstructor(courseIdOrMongoId, instructorId) {
    if (!courseIdOrMongoId || typeof courseIdOrMongoId !== "string") return { matchedCount: 0 };
    const idStr = String(courseIdOrMongoId).trim();
    const isMongoId = /^[a-fA-F0-9]{24}$/.test(idStr);
    const course = isMongoId
      ? await CoursesMongoose.findById(idStr).select("_id").lean()
      : await CoursesMongoose.findOne({ courseId: idStr }).select("_id").lean();
    if (!course) return { matchedCount: 0 };
    return CoursesMongoose.updateOne(
      { _id: course._id },
      { $set: { instructor: instructorId ?? null } }
    );
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

  /** Actualiza promedio y cantidad de valoraciones del curso. */
  async updateRatingMetrics(courseMongoId, rating, ratingCount) {
    return CoursesMongoose.updateOne(
      { _id: courseMongoId },
      { $set: { rating, ratingCount } }
    );
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
        rating: true,
        ratingCount: true,
        certificate: true,
        instructor: true,
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
        rating: true,
        ratingCount: true,
        certificate: true,
        instructor: true,
        modules: true,
      }
    );
    return courses;
  }
}

export const coursesModel = new CoursesModel();
