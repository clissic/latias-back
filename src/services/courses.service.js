import { coursesModel } from "../DAO/models/courses.model.js";
import { usersModel } from "../DAO/models/users.model.js";

class CoursesService {
  async getAll() {
    const courses = await coursesModel.getAll();
    return courses;
  }

  async findById(id) {
    const course = await coursesModel.findById(id);
    return course;
  }

  async findByCourseId(courseId) {
    const course = await coursesModel.findByCourseId(courseId);
    return course;
  }

  async findBySku(sku) {
    const course = await coursesModel.findBySku(sku);
    return course;
  }

  async findByCategory(category) {
    const courses = await coursesModel.findByCategory(category);
    return courses;
  }

  async findByDifficulty(difficulty) {
    const courses = await coursesModel.findByDifficulty(difficulty);
    return courses;
  }

  async create(courseData) {
    const courseCreated = await coursesModel.create(courseData);
    return courseCreated;
  }

  async updateOne(courseData) {
    const courseUpdated = await coursesModel.updateOne(courseData);
    return courseUpdated;
  }

  async deleteOne(_id) {
    const result = await coursesModel.deleteOne(_id);
    return result;
  }


  async updateCertificate({ _id, certificate }) {
    const courseUpdated = await coursesModel.updateCertificate({ _id, certificate });
    return courseUpdated;
  }

  // Función para que un usuario compre un curso
  async purchaseCourse(userId, courseId) {
    try {
      // Verificar que el curso existe
      const course = await coursesModel.findById(courseId);
      if (!course) {
        throw new Error("Curso no encontrado");
      }

      // Verificar que el usuario existe
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Verificar que el usuario no haya comprado ya este curso
      const purchasedCourses = user.purchasedCourses || [];
      const alreadyPurchased = purchasedCourses.some(purchasedCourse => 
        purchasedCourse.courseId === course.courseId
      );

      if (alreadyPurchased) {
        throw new Error("El usuario ya ha comprado este curso");
      }

      // Agregar el curso a los cursos comprados del usuario
      const courseToAdd = {
        courseId: course.courseId,
        sku: course.sku,
        courseName: course.courseName,
        bannerUrl: course.bannerUrl,
        image: course.image,
        shortImage: course.shortImage,
        currency: course.currency,
        shortDescription: course.shortDescription,
        longDescription: course.longDescription,
        duration: course.duration,
        price: course.price,
        difficulty: course.difficulty,
        category: course.category,
        professor: course.professor,
        modules: course.modules,
        purchasedDate: new Date(),
        enrolledDate: new Date(),
        isFinished: false,
        finishedDate: null,
        progress: 0,
        attempts: [],
        certificate: null
      };

      const updatedPurchasedCourses = [...purchasedCourses, courseToAdd];
      
      const userUpdated = await usersModel.updateOne({
        _id: userId,
        purchasedCourses: updatedPurchasedCourses
      });

      return {
        success: true,
        message: "Curso comprado exitosamente",
        course: courseToAdd,
        userUpdated
      };
    } catch (error) {
      throw error;
    }
  }

  // Función para obtener los cursos comprados de un usuario
  async getUserPurchasedCourses(userId) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return user.purchasedCourses || [];
    } catch (error) {
      throw error;
    }
  }

  // Función para actualizar el progreso de un curso del usuario
  async updateUserCourseProgress(userId, courseId, progress) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex(course => 
        course.courseId === courseId
      );

      if (courseIndex === -1) {
        throw new Error("El usuario no ha comprado este curso");
      }

      // Actualizar el progreso
      purchasedCourses[courseIndex].progress = progress;

      // Si el progreso es 100%, marcar como terminado
      if (progress >= 100) {
        purchasedCourses[courseIndex].isFinished = true;
        purchasedCourses[courseIndex].finishedDate = new Date();
      }

      const userUpdated = await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Progreso actualizado exitosamente",
        course: purchasedCourses[courseIndex],
        userUpdated
      };
    } catch (error) {
      throw error;
    }
  }

  // Función para agregar un intento de examen al curso del usuario
  async addUserCourseAttempt(userId, courseId, attempt) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex(course => 
        course.courseId === courseId
      );

      if (courseIndex === -1) {
        throw new Error("El usuario no ha comprado este curso");
      }

      // Agregar el intento
      if (!purchasedCourses[courseIndex].attempts) {
        purchasedCourses[courseIndex].attempts = [];
      }
      purchasedCourses[courseIndex].attempts.push(attempt);

      const userUpdated = await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Intento agregado exitosamente",
        course: purchasedCourses[courseIndex],
        userUpdated
      };
    } catch (error) {
      throw error;
    }
  }

  // Función para actualizar el certificado del curso del usuario
  async updateUserCourseCertificate(userId, courseId, certificate) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex(course => 
        course.courseId === courseId
      );

      if (courseIndex === -1) {
        throw new Error("El usuario no ha comprado este curso");
      }

      // Actualizar el certificado
      purchasedCourses[courseIndex].certificate = certificate;

      const userUpdated = await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Certificado actualizado exitosamente",
        course: purchasedCourses[courseIndex],
        userUpdated
      };
    } catch (error) {
      throw error;
    }
  }
}

export const coursesService = new CoursesService();
