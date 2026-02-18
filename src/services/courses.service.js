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
  // courseId puede ser el identificador custom (ej. "course_xxx") o el _id de MongoDB
  async purchaseCourse(userId, courseId) {
    try {
      // Buscar curso por courseId (campo custom); si falla, intentar por _id para compatibilidad
      let course = await coursesModel.findByCourseId(courseId);
      if (!course) {
        course = await coursesModel.findById(courseId);
      }
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

      // Solo guardamos courseId y estructura de módulos/lecciones con IDs + datos de progreso.
      // Los datos del curso (nombre, banner, etc.) se obtienen luego por courseId al listar.
      const now = new Date();
      const courseToAdd = {
        courseId: course.courseId,
        purchasedDate: now,
        enrolledDate: now,
        isFinished: false,
        finishedDate: null,
        progress: 0,
        attempts: [],
        certificate: null,
        modules: (course.modules || []).map((mod) => ({
          moduleId: mod.moduleId,
          lessons: (mod.lessons || []).map((les) => ({
            lessonId: les.lessonId,
            completed: false,
            completedAt: null
          }))
        }))
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

  /**
   * Enriquece un ítem de purchasedCourses (solo IDs + progreso) con datos del curso desde BD.
   * Compatible con formato nuevo (solo courseId + modules[].lessonId + completed) y legacy (objeto completo).
   */
  async _enrichPurchasedCourse(purchasedItem) {
    if (!purchasedItem || !purchasedItem.courseId) return null;
    const course = await coursesModel.findByCourseId(purchasedItem.courseId);
    if (!course) return null;

    // Formato legacy: ya tiene courseName, etc.; puede tener modules con lessons completos
    const isLegacy = !!purchasedItem.courseName;
    const storedModules = purchasedItem.modules || [];
    const courseModules = course.modules || [];

    const modulesCompleted = courseModules.map((mod) => {
      const storedMod = storedModules.find((m) => m.moduleId === mod.moduleId);
      const storedLessons = storedMod?.lessons || [];
      return {
        moduleId: mod.moduleId,
        moduleName: mod.moduleName,
        moduleDescription: mod.moduleDescription,
        lessons: (mod.lessons || []).map((les) => {
          const storedLes = storedLessons.find((l) => l.lessonId === les.lessonId);
          return {
            lessonId: les.lessonId,
            lessonName: les.lessonName,
            lessonDescription: les.lessonDescription,
            completed: storedLes?.completed ?? false,
            completedAt: storedLes?.completedAt ?? null
          };
        })
      };
    });

    return {
      courseId: course.courseId,
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
      modulesCompleted,
      purchasedDate: purchasedItem.purchasedDate,
      enrolledDate: purchasedItem.enrolledDate ?? purchasedItem.purchasedDate,
      dateEnrolled: purchasedItem.enrolledDate ?? purchasedItem.purchasedDate,
      isFinished: purchasedItem.isFinished ?? false,
      finishedDate: purchasedItem.finishedDate ?? null,
      progress: purchasedItem.progress ?? 0,
      attempts: purchasedItem.attempts ?? [],
      certificate: purchasedItem.certificate ?? null
    };
  }

  // Función para obtener los cursos comprados de un usuario (enriquecidos con datos del curso por courseId)
  async getUserPurchasedCourses(userId) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const purchased = user.purchasedCourses || [];
      const enriched = [];
      for (const item of purchased) {
        const course = await this._enrichPurchasedCourse(item);
        if (course) enriched.push(course);
      }
      return enriched;
    } catch (error) {
      throw error;
    }
  }

  // Función para actualizar el progreso de un curso del usuario (porcentaje global)
  async updateUserCourseProgress(userId, courseId, progress) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((c) => c.courseId === courseId);

      if (courseIndex === -1) {
        throw new Error("El usuario no ha comprado este curso");
      }

      purchasedCourses[courseIndex].progress = progress;
      if (progress >= 100) {
        purchasedCourses[courseIndex].isFinished = true;
        purchasedCourses[courseIndex].finishedDate = new Date();
      }

      await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Progreso actualizado exitosamente",
        course: purchasedCourses[courseIndex],
        userUpdated: true
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marca una lección como completada/no completada y recalcula el progreso del curso.
   * Guarda solo IDs + progreso (completed, completedAt) en el usuario.
   */
  async updateUserLessonProgress(userId, courseId, moduleId, lessonId, { completed }) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((c) => c.courseId === courseId);

      if (courseIndex === -1) {
        throw new Error("El usuario no ha comprado este curso");
      }

      const course = purchasedCourses[courseIndex];
      if (!course.modules) {
        course.modules = [];
      }

      let mod = course.modules.find((m) => m.moduleId === moduleId);
      if (!mod) {
        mod = { moduleId, lessons: [] };
        course.modules.push(mod);
      }
      if (!mod.lessons) {
        mod.lessons = [];
      }

      let les = mod.lessons.find((l) => l.lessonId === lessonId);
      if (!les) {
        les = { lessonId, completed: false, completedAt: null };
        mod.lessons.push(les);
      }
      les.completed = !!completed;
      les.completedAt = completed ? new Date() : null;

      // Recalcular progreso global del curso (lecciones completadas / total lecciones)
      const courseDoc = await coursesModel.findByCourseId(courseId);
      const totalLessons = (courseDoc?.modules || []).reduce(
        (acc, m) => acc + (m.lessons || []).length,
        0
      );
      let completedCount = 0;
      for (const m of course.modules || []) {
        for (const l of m.lessons || []) {
          if (l.completed) completedCount++;
        }
      }
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      course.progress = progress;
      if (progress >= 100) {
        course.isFinished = true;
        course.finishedDate = new Date();
      }

      await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Progreso de lección actualizado",
        course: purchasedCourses[courseIndex],
        progress,
        userUpdated: true
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
