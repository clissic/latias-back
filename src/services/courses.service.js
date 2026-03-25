import { coursesModel } from "../DAO/models/courses.model.js";
import { usersModel } from "../DAO/models/users.model.js";
import { instructorsModel } from "../DAO/models/instructors.model.js";
import { CourseCertificateMongoose } from "../DAO/models/mongoose/course-certificates.mongoose.js";

const PARTIAL_AVG_MIN = 60;
const FINAL_TEST_MIN = 70;

/** Máximo de intentos por prueba parcial y por prueba final (coincide con la UI). */
const MAX_MODULE_TEST_ATTEMPTS = 2;
const MAX_FINAL_TEST_ATTEMPTS = 2;
const MAX_FINAL_EXAM_QUESTIONS = 25;

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

  async setInstructor(courseIdOrMongoId, instructorId) {
    return coursesModel.setInstructor(courseIdOrMongoId, instructorId);
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

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((pc) => pc.courseId === course.courseId);
      const alreadyPurchased = courseIndex !== -1;

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
        pendingFinalExam: null,
        lastAccessedAt: null,
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

      let updatedPurchasedCourses;
      let message;
      if (alreadyPurchased) {
        updatedPurchasedCourses = [...purchasedCourses];
        updatedPurchasedCourses[courseIndex] = courseToAdd;
        message = "Curso habilitado nuevamente. Progreso reiniciado.";
      } else {
        updatedPurchasedCourses = [...purchasedCourses, courseToAdd];
        message = "Curso comprado exitosamente";
      }

      await usersModel.updateOne({
        _id: userId,
        purchasedCourses: updatedPurchasedCourses
      });

      return {
        success: true,
        message,
        course: courseToAdd,
        userUpdated: true
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
      instructor: course.instructor,
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
      finalTestLastScore: purchasedItem.finalTestLastScore ?? null,
      lastAccessedAt: purchasedItem.lastAccessedAt ?? null
    };
  }

  /**
   * Registra que el usuario accedió al curso (para "Continúa donde quedaste").
   * Actualiza lastAccessedAt del ítem en user.purchasedCourses.
   */
  async recordCourseAccess(userId, courseId) {
    const user = await usersModel.findById(userId);
    if (!user) return;
    const purchasedCourses = user.purchasedCourses || [];
    const index = purchasedCourses.findIndex((c) => c.courseId === courseId);
    if (index === -1) return;
    purchasedCourses[index].lastAccessedAt = new Date();
    await usersModel.updateOne({ _id: userId }, { purchasedCourses });
  }

  /**
   * Quita identificadores de video de las lecciones (respuestas públicas de catálogo).
   */
  stripPublicVideoFieldsFromCourse(course) {
    if (!course) return course;
    const plain =
      typeof course.toObject === "function"
        ? course.toObject({ flattenMaps: true })
        : JSON.parse(JSON.stringify(course));
    if (!Array.isArray(plain.modules)) return plain;
    plain.modules = plain.modules.map((m) => ({
      ...m,
      lessons: (m.lessons || []).map((l) => {
        const { gumletAssetId, ...rest } = l;
        return rest;
      }),
    }));
    return plain;
  }

  /**
   * Oculta respuestas correctas en el banco de preguntas (catálogo / APIs públicas).
   */
  stripQuestionBankSolutionsFromCourse(course) {
    if (!course) return course;
    const plain =
      typeof course.toObject === "function"
        ? course.toObject({ flattenMaps: true })
        : JSON.parse(JSON.stringify(course));
    if (!Array.isArray(plain.modules)) return plain;
    plain.modules = plain.modules.map((m) => ({
      ...m,
      questionBank: (m.questionBank || []).map((q) => ({
        ...q,
        options: (q.options || []).map((opt) => {
          const { isCorrect, ...rest } = opt;
          return rest;
        }),
      })),
    }));
    return plain;
  }

  /** Video + banco sin soluciones (listados y ficha pública de curso). */
  sanitizeCourseForPublicCatalog(course) {
    const step1 = this.stripPublicVideoFieldsFromCourse(course);
    return this.stripQuestionBankSolutionsFromCourse(step1);
  }

  _toPlainCourseDoc(course) {
    if (!course) return null;
    return typeof course.toObject === "function"
      ? course.toObject({ flattenMaps: true })
      : JSON.parse(JSON.stringify(course));
  }

  computeModuleTestScoreFromDoc(courseDoc, moduleId, answers) {
    const plain = this._toPlainCourseDoc(courseDoc);
    const mod = (plain?.modules || []).find((m) => String(m.moduleId) === String(moduleId));
    const bank = mod?.questionBank || [];
    if (bank.length === 0) return 0;
    const answersObj = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
    let correct = 0;
    for (const q of bank) {
      const selected = answersObj[q.questionId];
      const correctOpt = (q.options || []).find((o) => o.isCorrect);
      if (correctOpt && selected === correctOpt.optionId) correct += 1;
    }
    return Math.round((correct / bank.length) * 100);
  }

  computeFinalTestScoreFromDoc(courseDoc, questionIds, answers) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) return 0;
    const plain = this._toPlainCourseDoc(courseDoc);
    const answersObj = answers && typeof answers === "object" && !Array.isArray(answers) ? answers : {};
    let correct = 0;
    for (const compositeKey of questionIds) {
      let found = null;
      for (const mod of plain.modules || []) {
        for (const q of mod.questionBank || []) {
          if (`${mod.moduleId}-${q.questionId}` === compositeKey) {
            found = q;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        throw new Error("El conjunto de preguntas del intento no coincide con el curso");
      }
      const selected = answersObj[compositeKey];
      const correctOpt = (found.options || []).find((o) => o.isCorrect);
      if (correctOpt && selected === correctOpt.optionId) correct += 1;
    }
    return Math.round((correct / questionIds.length) * 100);
  }

  /**
   * Información de reproducción para cadetes con curso comprado (embed Gumlet).
   */
  async getLessonPlaybackInfo(userId, courseId, moduleId, lessonId) {
    const user = await usersModel.findById(userId);
    if (!user) return null;
    const purchasedCourses = user.purchasedCourses || [];
    const hasCourse = purchasedCourses.some((c) => String(c?.courseId) === String(courseId));
    if (!hasCourse) return null;
    const course = await coursesModel.findByCourseId(courseId);
    if (!course?.modules) return null;
    const mod = course.modules.find((m) => String(m.moduleId) === String(moduleId));
    if (!mod?.lessons) return null;
    const lesson = mod.lessons.find((l) => String(l.lessonId) === String(lessonId));
    if (!lesson) return null;

    const gumlet = (lesson.gumletAssetId || "").trim();
    if (!gumlet) return null;
    return {
      kind: "gumlet",
      embedUrl: `https://play.gumlet.io/embed/${encodeURIComponent(gumlet)}`,
    };
  }

  async userCanLoadFullCourseForEditing(userEmail, userCategories, courseId) {
    const cats = Array.isArray(userCategories)
      ? userCategories
      : userCategories != null
        ? [userCategories]
        : [];
    if (cats.includes("Administrador")) return true;
    if (!cats.includes("Instructor")) return false;
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) return false;
    const inst = await instructorsModel.findByContactEmail(userEmail);
    if (!inst) return false;
    const raw = course.instructor;
    const cidStr =
      raw && typeof raw === "object" && raw._id ? String(raw._id) : String(raw || "");
    return cidStr === String(inst._id);
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

      // Recalcular progreso global del curso (lecciones + prueba final)
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
      const finalTestDone = course.finalTestLastScore != null;
      const totalItems = totalLessons + 1;
      const completedItems = completedCount + (finalTestDone ? 1 : 0);
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
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
      if ((mod.testAttempts || 0) >= MAX_MODULE_TEST_ATTEMPTS) {
        throw new Error("Límite de intentos de prueba del módulo alcanzado");
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
   * Guarda el puntaje de la prueba parcial (corregido en servidor a partir de respuestas).
   */
  async updateModuleTestResult(userId, courseId, moduleId, { answers }) {
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

      const courseDoc = await coursesModel.findByCourseId(courseId);
      if (!courseDoc) {
        throw new Error("Curso no encontrado");
      }

      const score = this.computeModuleTestScoreFromDoc(courseDoc, moduleId, answers);

      const course = purchasedCourses[courseIndex];
      if (!course.modules) {
        course.modules = [];
      }

      let mod = course.modules.find((m) => m.moduleId === moduleId);
      if (!mod) {
        mod = { moduleId, lessons: [], testAttempts: 0, lastTestScore: null };
        course.modules.push(mod);
      }
      const current = mod.lastTestScore ?? null;
      if (current === null || score > current) {
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
        userUpdated: true,
        score
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicia un intento de la prueba final: elige preguntas en servidor y fija pendingFinalExam.
   * Si ya hay un intento pendiente (mismo curso), devuelve las mismas preguntas sin consumir otro intento.
   */
  async startFinalTestAttempt(userId, courseId) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) throw new Error("Usuario no encontrado");

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((c) => c.courseId === courseId);
      if (courseIndex === -1) throw new Error("El usuario no ha comprado este curso");

      const course = purchasedCourses[courseIndex];
      const pending = course.pendingFinalExam;

      const courseDoc = await coursesModel.findByCourseId(courseId);
      if (!courseDoc) throw new Error("Curso no encontrado");

      const pool = [];
      for (const mod of courseDoc.modules || []) {
        for (const q of mod.questionBank || []) {
          pool.push(`${mod.moduleId}-${q.questionId}`);
        }
      }
      if (pool.length === 0) {
        throw new Error("No hay preguntas configuradas para la prueba final");
      }

      if (pending?.questionIds?.length > 0) {
        return {
          success: true,
          message: "Continuás la prueba final pendiente",
          questionIds: pending.questionIds,
          course: purchasedCourses[courseIndex],
          userUpdated: false,
          resumed: true,
        };
      }

      if ((course.finalTestAttempts || 0) >= MAX_FINAL_TEST_ATTEMPTS) {
        throw new Error("Límite de intentos de la prueba final alcanzado");
      }

      course.finalTestAttempts = (course.finalTestAttempts || 0) + 1;

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const take = Math.min(MAX_FINAL_EXAM_QUESTIONS, pool.length);
      const questionIds = pool.slice(0, take);
      course.pendingFinalExam = { questionIds, startedAt: new Date() };

      await usersModel.updateOne({ _id: userId, purchasedCourses: purchasedCourses });
      return {
        success: true,
        message: "Intento de prueba final iniciado",
        questionIds,
        course: purchasedCourses[courseIndex],
        userUpdated: true,
        resumed: false,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Guarda el puntaje de la prueba final (corregido en servidor). Limpia pendingFinalExam.
   * Si se cumplen condiciones de aprobación (promedio parciales >= 60% y prueba final >= 70%),
   * emite un certificado (award) y guarda su _id en user.purchasedCourses[].certificate.
   */
  async updateFinalTestResult(userId, courseId, { answers }) {
    try {
      const user = await usersModel.findById(userId);
      if (!user) throw new Error("Usuario no encontrado");

      const purchasedCourses = user.purchasedCourses || [];
      const courseIndex = purchasedCourses.findIndex((c) => c.courseId === courseId);
      if (courseIndex === -1) throw new Error("El usuario no ha comprado este curso");

      const course = purchasedCourses[courseIndex];
      const pending = course.pendingFinalExam;
      if (!pending?.questionIds?.length) {
        throw new Error("No hay una prueba final iniciada. Iniciá la prueba antes de enviar las respuestas.");
      }

      const courseDoc = await coursesModel.findByCourseId(courseId);
      if (!courseDoc) throw new Error("Curso no encontrado");

      const score = this.computeFinalTestScoreFromDoc(courseDoc, pending.questionIds, answers);
      course.pendingFinalExam = null;

      const current = course.finalTestLastScore ?? null;
      if (current === null || score > current) {
        course.finalTestLastScore = score;
      }

      const scoreToUse = course.finalTestLastScore ?? null;
      const alreadyHasCertificate = course.certificate != null && course.certificate !== "";

      // Recalcular progreso del curso incluyendo la prueba final
      const totalLessons = (course.modules || []).reduce(
        (acc, m) => acc + (m.lessons || []).length,
        0
      );
      let completedLessons = 0;
      for (const m of course.modules || []) {
        for (const l of m.lessons || []) {
          if (l.completed) completedLessons++;
        }
      }
      const totalItems = totalLessons + 1;
      const completedItems = completedLessons + (scoreToUse != null ? 1 : 0);
      course.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      if (course.progress >= 100) {
        course.isFinished = true;
        course.finishedDate = new Date();
      }

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
            let prof = {};
            if (courseDoc.instructor) {
              const instructorDoc = await instructorsModel.findById(courseDoc.instructor);
              if (instructorDoc) prof = { firstName: instructorDoc.firstName, lastName: instructorDoc.lastName, profession: instructorDoc.profession };
            }
            const instructor = [prof.firstName, prof.lastName].filter(Boolean).join(" ").trim() || "Instructor";
            const userName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Usuario";

            const newCertificate = await CourseCertificateMongoose.create({
              course: courseDoc.courseName || courseId,
              instructor,
              profession: prof.profession || "",
              duration: courseDoc.duration ?? null,
              userName,
              userCi: (user.ci ?? "").toString().trim(),
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
            await usersModel.incrementCertificatesQuantity(userId);
            return {
              success: true,
              message: "Resultado de prueba final actualizado. Certificado emitido.",
              course: course,
              userUpdated: true,
              certificateId: newCertificate._id,
              score,
            };
          }
        }
      }

      await usersModel.updateOne({ _id: userId, purchasedCourses: purchasedCourses });
      return { success: true, message: "Resultado de prueba final actualizado", course: course, userUpdated: true, score };
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
  /** Lista todos los certificados de curso (solo administrador). */
  async getAllCourseCertificates() {
    const list = await CourseCertificateMongoose.find().sort({ issuedAt: -1 }).lean();
    return list;
  }

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
