import { coursesModel } from "../DAO/models/courses.model.js";
import { usersModel } from "../DAO/models/users.model.js";
import { CourseCertificateMongoose } from "../DAO/models/mongoose/course-certificates.mongoose.js";

const PARTIAL_AVG_MIN = 60;
const FINAL_TEST_MIN = 70;

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
        finalTestAttempts: 0,
        finalTestLastScore: null,
        modules: (course.modules || []).map((mod) => ({
          moduleId: mod.moduleId,
          testAttempts: 0,
          lastTestScore: null,
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
        testAttempts: storedMod?.testAttempts ?? 0,
        lastTestScore: storedMod?.lastTestScore ?? null,
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

    let certificateIssuedAt = null;
    if (purchasedItem.certificate) {
      try {
        const cert = await CourseCertificateMongoose.findById(purchasedItem.certificate).lean();
        if (cert?.issuedAt) certificateIssuedAt = cert.issuedAt;
      } catch (_) {}
    }

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
      certificate: purchasedItem.certificate ?? null,
      certificateIssuedAt,
      finalTestAttempts: purchasedItem.finalTestAttempts ?? 0,
      finalTestLastScore: purchasedItem.finalTestLastScore ?? null
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

  /**
   * Registra el inicio de un intento de prueba parcial (descuenta el intento). Se llama al abrir la prueba.
   */
  async startModuleTestAttempt(userId, courseId, moduleId) {
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
        mod = { moduleId, lessons: [], testAttempts: 0, lastTestScore: null };
        course.modules.push(mod);
      }
      mod.testAttempts = (mod.testAttempts || 0) + 1;

      await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Intento de prueba iniciado",
        course: purchasedCourses[courseIndex],
        userUpdated: true
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Guarda el puntaje de la prueba parcial (el intento ya fue descontado al abrir la prueba).
   */
  async updateModuleTestResult(userId, courseId, moduleId, { score }) {
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
        mod = { moduleId, lessons: [], testAttempts: 0, lastTestScore: null };
        course.modules.push(mod);
      }
      // Solo se actualiza el puntaje si es mayor que el anterior (en el segundo intento se mantiene el mejor resultado)
      const current = mod.lastTestScore ?? null;
      if (score != null && (current === null || score > current)) {
        mod.lastTestScore = score;
      }

      await usersModel.updateOne({
        _id: userId,
        purchasedCourses: purchasedCourses
      });

      return {
        success: true,
        message: "Resultado de prueba parcial actualizado",
        course: purchasedCourses[courseIndex],
        userUpdated: true
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicia un intento de la prueba final del curso (descuenta el intento al abrir).
   */
  async startFinalTestAttempt(userId, courseId) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) throw new Error("Usuario no encontrado");

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((c) => c.courseId === courseId);
      if (courseIndex === -1) throw new Error("El usuario no ha comprado este curso");

      const course = purchasedCourses[courseIndex];
      course.finalTestAttempts = (course.finalTestAttempts || 0) + 1;

      await usersModel.updateOne({ _id: userId, purchasedCourses: purchasedCourses });
      return { success: true, message: "Intento de prueba final iniciado", course: course, userUpdated: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Guarda el puntaje de la prueba final (solo si es mayor al anterior).
   * Si se cumplen condiciones de aprobación (promedio parciales >= 60% y prueba final >= 70%),
   * emite un certificado (award) y guarda su _id en user.purchasedCourses[].certificate.
   */
  async updateFinalTestResult(userId, courseId, { score }) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) throw new Error("Usuario no encontrado");

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((c) => c.courseId === courseId);
      if (courseIndex === -1) throw new Error("El usuario no ha comprado este curso");

      const course = purchasedCourses[courseIndex];
      const current = course.finalTestLastScore ?? null;
      if (score != null && (current === null || score > current)) {
        course.finalTestLastScore = score;
      }

      const scoreToUse = course.finalTestLastScore ?? null;
      const alreadyHasCertificate = course.certificate != null && course.certificate !== "";

      if (
        scoreToUse != null &&
        !alreadyHasCertificate &&
        (course.modules || []).length > 0
      ) {
        const courseDoc = await coursesModel.findByCourseId(courseId);
        if (courseDoc) {
          const resultsModules = (courseDoc.modules || []).map((mod) => {
            const stored = (course.modules || []).find((m) => m.moduleId === mod.moduleId);
            const result = stored?.lastTestScore ?? 0;
            return { moduleName: mod.moduleName || mod.moduleId, result };
          });
          const scoresOnly = resultsModules.map((r) => r.result).filter((s) => s != null && typeof s === "number");
          const avgPartial =
            scoresOnly.length > 0
              ? Math.round((scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length) * 10) / 10
              : 0;

          if (avgPartial >= PARTIAL_AVG_MIN && scoreToUse >= FINAL_TEST_MIN) {
            const finalResult = Math.round((scoreToUse * 0.6 + avgPartial * 0.4) * 10) / 10;
            const prof = courseDoc.professor && courseDoc.professor[0] ? courseDoc.professor[0] : {};
            const instructor = [prof.firstName, prof.lastName].filter(Boolean).join(" ").trim() || "Instructor";
            const userName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Usuario";

            const newCertificate = await CourseCertificateMongoose.create({
              course: courseDoc.courseName || courseId,
              instructor,
              profession: prof.profession || "",
              duration: courseDoc.duration ?? null,
              userName,
              resultsModules,
              resultFinalTest: scoreToUse,
              finalResult,
              issuedAt: new Date(),
            });

            course.certificate = newCertificate._id;
            await usersModel.updateOne({
              _id: userId,
              purchasedCourses: purchasedCourses,
            });
            return {
              success: true,
              message: "Resultado de prueba final actualizado. Certificado emitido.",
              course: course,
              userUpdated: true,
              certificateId: newCertificate._id,
            };
          }
        }
      }

      await usersModel.updateOne({ _id: userId, purchasedCourses: purchasedCourses });
      return { success: true, message: "Resultado de prueba final actualizado", course: course, userUpdated: true };
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

  /**
   * Obtiene el certificado (award) de curso del usuario para un curso dado.
   * Solo devuelve el certificado si el usuario tiene course.certificate guardado para ese curso.
   */
  async getCourseCertificate(userId, courseId) {
    const user = await usersModel.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    const purchasedCourses = user.purchasedCourses || [];
    const course = purchasedCourses.find((c) => c.courseId === courseId);
    if (!course || !course.certificate) return null;
    const cert = await CourseCertificateMongoose.findById(course.certificate).lean();
    return cert || null;
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
