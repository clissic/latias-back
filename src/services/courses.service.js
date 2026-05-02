import { coursesModel } from "../DAO/models/courses.model.js";
import { usersModel } from "../DAO/models/users.model.js";
import { instructorsModel } from "../DAO/models/instructors.model.js";
import { CourseCertificateMongoose } from "../DAO/models/mongoose/course-certificates.mongoose.js";
import { RatingsMongoose } from "../DAO/models/mongoose/ratings.mongoose.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const PARTIAL_AVG_MIN = 60;
const FINAL_TEST_MIN = 70;

/** Máximo de intentos por prueba parcial y por prueba final (coincide con la UI). */
const MAX_MODULE_TEST_ATTEMPTS = 2;
const MAX_FINAL_TEST_ATTEMPTS = 2;
const MAX_FINAL_EXAM_QUESTIONS = 25;

/** Lee rating/ratingCount del documento curso (campos en inglés); compatibilidad con docs legacy valoracion/*. */
function courseRatingFieldsFromDoc(courseDoc) {
  const p =
    courseDoc && typeof courseDoc.toObject === "function"
      ? courseDoc.toObject({ flattenMaps: true })
      : courseDoc || {};
  return {
    rating: Number(p.rating ?? p.valoracion ?? 0),
    ratingCount: Number(p.ratingCount ?? p.valoracionCantidad ?? 0),
  };
}

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
      lastAccessedAt: purchasedItem.lastAccessedAt ?? null,
      courseRating:
        typeof purchasedItem.courseRating === "number"
          ? purchasedItem.courseRating
          : typeof purchasedItem.courseValoracion === "number"
            ? purchasedItem.courseValoracion
            : null,
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

  /**
   * Métricas agregadas del curso para el instructor titular o administrador.
   * `approved` = cadetes con certificado emitido en ese curso.
   * Valoración: promedio y cantidad desde el documento del curso (colección `ratings` alimenta esos campos).
   */
  async getInstructorCourseMetrics(userEmail, userCategories, courseId) {
    const allowed = await this.userCanLoadFullCourseForEditing(
      userEmail,
      userCategories,
      courseId
    );
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      err.code = "FORBIDDEN";
      throw err;
    }
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    const counts = await usersModel.countCoursePurchaseMetrics(courseId);
    const { rating, ratingCount } = courseRatingFieldsFromDoc(course);
    return {
      courseId: String(courseId),
      courseName: course.courseName || courseId,
      ...counts,
      rating: {
        average: rating,
        count: ratingCount,
        implemented: true,
      },
    };
  }

  /**
   * Valoraciones guardadas en `ratings` para el curso (mismo alcance que métricas del instructor).
   */
  async getInstructorCourseRatings(userEmail, userCategories, courseId) {
    const allowed = await this.userCanLoadFullCourseForEditing(
      userEmail,
      userCategories,
      courseId
    );
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      err.code = "FORBIDDEN";
      throw err;
    }
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    const cid = String(course.courseId);
    const docs = await RatingsMongoose.find({ courseId: cid }).sort({ updatedAt: -1 }).lean();

    const ratings = docs.map((d) => ({
      userId: String(d.userId),
      firstName: d.firstName ?? "",
      lastName: d.lastName ?? "",
      rating: typeof d.stars === "number" ? d.stars : Number(d.stars) || 0,
      comment: typeof d.comment === "string" ? d.comment : "",
      featured: !!d.featured,
    }));

    return {
      courseId: cid,
      courseName: course.courseName || cid,
      ratings,
    };
  }

  /**
   * Marca o desmarca una valoración como destacada (solo instructor titular o administrador).
   * @param {{ userId?: unknown, email?: string, firstName?: string, lastName?: string }} [actor] Quien ejecuta la acción (req.user).
   */
  async setInstructorCourseRatingFeatured(userEmail, userCategories, courseId, ratedUserId, featured, actor) {
    const allowed = await this.userCanLoadFullCourseForEditing(
      userEmail,
      userCategories,
      courseId
    );
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      err.code = "FORBIDDEN";
      throw err;
    }
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    if (!mongoose.Types.ObjectId.isValid(ratedUserId)) {
      throw new Error("ID de usuario inválido");
    }
    const cid = String(course.courseId);
    const uid = new mongoose.Types.ObjectId(ratedUserId);

    const updated = await RatingsMongoose.findOneAndUpdate(
      { courseId: cid, userId: uid },
      { $set: { featured: !!featured } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      const err = new Error("Valoración no encontrada");
      err.code = "RATING_NOT_FOUND";
      throw err;
    }

    const ratingId = String(updated._id);
    const cadeteId = String(updated.userId);
    const actorName = [actor?.firstName, actor?.lastName].filter(Boolean).join(" ").trim() || "—";
    const actorEmail = (actor?.email ?? "").trim() || "—";
    const actorId = actor?.userId != null ? String(actor.userId) : "—";

    if (featured) {
      logger.info(
        `[Valoraciones] Destacada — ratingId=${ratingId} courseId=${cid} cadeteUserId=${cadeteId} — por ${actorName} (${actorEmail}) actorUserId=${actorId}`
      );
    } else {
      logger.info(
        `[Valoraciones] Quitada de destacados — ratingId=${ratingId} courseId=${cid} cadeteUserId=${cadeteId} — por ${actorName} (${actorEmail}) actorUserId=${actorId}`
      );
    }

    return {
      ratingId,
      userId: cadeteId,
      featured: !!updated.featured,
    };
  }

  /**
   * Lista unificada de cadetes para métricas de instructor (compras / finalizados / aprobados).
   */
  async _instructorCourseCadetList(userEmail, userCategories, courseId, findRows) {
    const allowed = await this.userCanLoadFullCourseForEditing(
      userEmail,
      userCategories,
      courseId
    );
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      err.code = "FORBIDDEN";
      throw err;
    }
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    const rows = await findRows(courseId);
    const purchasers = rows.map((u) => ({
      userId: String(u._id),
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      ci: u.ci != null ? String(u.ci) : "",
    }));
    return {
      courseId: String(courseId),
      courseName: course.courseName || courseId,
      purchasers,
    };
  }

  async getInstructorCoursePurchasers(userEmail, userCategories, courseId) {
    return this._instructorCourseCadetList(userEmail, userCategories, courseId, (cid) =>
      usersModel.findUsersWhoPurchasedCourse(cid)
    );
  }

  /**
   * Promedio de pruebas parciales del usuario en el curso (solo módulos del curso en BD con puntaje guardado).
   */
  _avgPartialFromPurchase(purchasedSlice, courseDoc) {
    if (!purchasedSlice || !courseDoc?.modules?.length) return null;
    const stored = purchasedSlice.modules || [];
    const scores = [];
    for (const mod of courseDoc.modules) {
      const sm = stored.find((m) => String(m.moduleId) === String(mod.moduleId));
      if (sm?.lastTestScore != null && typeof sm.lastTestScore === "number") {
        scores.push(sm.lastTestScore);
      }
    }
    if (scores.length === 0) return null;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avg * 10) / 10;
  }

  /** Nota global del curso: 60% prueba final + 40% promedio parciales (misma lógica que CursoVista). */
  _weightedCourseGrade(avgPartial, finalScore) {
    if (avgPartial != null && finalScore != null) {
      return Math.round((finalScore * 0.6 + avgPartial * 0.4) * 10) / 10;
    }
    if (finalScore != null) return Math.round(finalScore * 10) / 10;
    if (avgPartial != null) return Math.round(avgPartial * 10) / 10;
    return null;
  }

  async getInstructorCourseFinished(userEmail, userCategories, courseId) {
    const allowed = await this.userCanLoadFullCourseForEditing(
      userEmail,
      userCategories,
      courseId
    );
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      err.code = "FORBIDDEN";
      throw err;
    }
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    const rows = await usersModel.findUsersWhoFinishedCourse(courseId);
    const cid = String(courseId);
    const purchasers = rows.map((u) => {
      const pc = (u.purchasedCourses || []).find((c) => String(c?.courseId) === cid);
      const avgPartial = pc ? this._avgPartialFromPurchase(pc, course) : null;
      const finalScore =
        pc?.finalTestLastScore != null && typeof pc.finalTestLastScore === "number"
          ? pc.finalTestLastScore
          : null;
      const attempts = pc?.finalTestAttempts ?? 0;
      const nota = this._weightedCourseGrade(avgPartial, finalScore);
      const hasCert = pc?.certificate != null && pc?.certificate !== "";
      const passedRule =
        avgPartial != null &&
        finalScore != null &&
        avgPartial >= PARTIAL_AVG_MIN &&
        finalScore >= FINAL_TEST_MIN;
      const approved = hasCert || passedRule;
      return {
        userId: String(u._id),
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        ci: u.ci != null ? String(u.ci) : "",
        approved,
        nota,
        finalTestAttempts: attempts,
      };
    });
    return {
      courseId: cid,
      courseName: course.courseName || courseId,
      purchasers,
    };
  }

  async getInstructorCourseApproved(userEmail, userCategories, courseId) {
    return this._instructorCourseCadetList(userEmail, userCategories, courseId, (cid) =>
      usersModel.findUsersWhoApprovedCourse(cid)
    );
  }

  /**
   * Progreso por lección/módulo de un cadete en un curso (instructor titular o administrador).
   * Reutiliza la misma mezcla curso + purchasedCourses que ve el alumno en su perfil.
   */
  async getInstructorPurchaserProgress(userEmail, userCategories, courseId, cadetUserId) {
    const allowed = await this.userCanLoadFullCourseForEditing(
      userEmail,
      userCategories,
      courseId
    );
    if (!allowed) {
      const err = new Error("FORBIDDEN");
      err.code = "FORBIDDEN";
      throw err;
    }
    const course = await coursesModel.findByCourseId(courseId);
    if (!course) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }

    const cadet = await usersModel.findById(cadetUserId);
    if (!cadet) {
      const err = new Error("USER_NOT_FOUND");
      err.code = "USER_NOT_FOUND";
      throw err;
    }

    const purchasedCourses = cadet.purchasedCourses || [];
    const purchasedItem = purchasedCourses.find((c) => String(c?.courseId) === String(courseId));
    if (!purchasedItem) {
      const err = new Error("NOT_ENROLLED");
      err.code = "NOT_ENROLLED";
      throw err;
    }

    const enriched = await this._enrichPurchasedCourse(purchasedItem);
    if (!enriched) {
      const err = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }

    return {
      courseId: enriched.courseId,
      courseName: enriched.courseName,
      cadet: {
        userId: String(cadet._id),
        firstName: cadet.firstName ?? "",
        lastName: cadet.lastName ?? "",
      },
      progress: enriched.progress ?? 0,
      isFinished: !!enriched.isFinished,
      modulesCompleted: enriched.modulesCompleted || [],
      finalTestAttempts: enriched.finalTestAttempts ?? 0,
      finalTestLastScore: enriched.finalTestLastScore ?? null,
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

  /** Valoración del usuario para un curso (si existe), desde la colección `ratings`. */
  async getMyCourseRating(userId, courseId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Usuario inválido");
    }
    const courseDoc = await coursesModel.findByCourseId(courseId);
    if (!courseDoc) throw new Error("Curso no encontrado");

    const cid = String(courseDoc.courseId);
    const uid = new mongoose.Types.ObjectId(userId);
    const doc = await RatingsMongoose.findOne({ courseId: cid, userId: uid }).lean();
    if (!doc) return null;
    return {
      stars: doc.stars,
      comment: typeof doc.comment === "string" ? doc.comment : "",
    };
  }

  /**
   * Valoración 1–5 + comentario obligatorio. Persiste en colección `ratings`.
   * Requiere certificado. Actualiza el promedio del curso según todos los documentos en `ratings`.
   */
  async rateCourse(userId, courseId, { stars, comment }) {
    const starsInt = Math.round(Number(stars));
    if (!Number.isFinite(starsInt) || starsInt < 1 || starsInt > 5) {
      throw new Error("La valoración debe ser un número entre 1 y 5");
    }

    const commentTrimmed = typeof comment === "string" ? comment.trim() : "";
    if (commentTrimmed.length < 2) {
      throw new Error("Debés dejar un comentario sobre el curso (mínimo 2 caracteres)");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Usuario inválido");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await usersModel.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const purchasedCourses = [...(user.purchasedCourses || [])];
    const idx = purchasedCourses.findIndex((c) => String(c.courseId) === String(courseId));
    if (idx === -1) throw new Error("No compraste este curso");

    const pc = { ...purchasedCourses[idx] };
    if (!pc.certificate) {
      throw new Error("Solo podés valorar el curso después de aprobarlo y obtener el certificado");
    }

    const courseDoc = await coursesModel.findByCourseId(courseId);
    if (!courseDoc) throw new Error("Curso no encontrado");

    const cid = String(courseDoc.courseId);

    const firstName = (user.firstName ?? "").trim();
    const lastName = (user.lastName ?? "").trim();

    const existingRating = await RatingsMongoose.findOne({
      courseId: cid,
      userId: userObjectId,
    }).lean();

    await RatingsMongoose.findOneAndUpdate(
      { courseId: cid, userId: userObjectId },
      {
        $set: {
          stars: starsInt,
          comment: commentTrimmed,
          firstName,
          lastName,
          featured: false,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    if (existingRating) {
      const clip = (str, max = 150) => {
        const s = String(str ?? "");
        return s.length <= max ? s : `${s.slice(0, max)}…`;
      };
      logger.info(
        `[Valoraciones] Calificación modificada — courseId=${cid} userId=${String(userId)} estrellas ${existingRating.stars}→${starsInt} destacadoAntes=${!!existingRating.featured} comentarioAntes=${JSON.stringify(clip(existingRating.comment))} comentarioNuevo=${JSON.stringify(clip(commentTrimmed))}`
      );
    }

    const [agg] = await RatingsMongoose.aggregate([
      { $match: { courseId: cid } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$stars" },
          count: { $sum: 1 },
        },
      },
    ]);

    const newCant = agg?.count ?? 0;
    const rawAvg = agg?.avg ?? 0;
    const newAvg =
      newCant > 0 ? Math.min(5, Math.max(0, Math.round(Number(rawAvg) * 10) / 10)) : 0;

    pc.courseRating = starsInt;
    if ("courseValoracion" in pc) delete pc.courseValoracion;
    purchasedCourses[idx] = pc;

    await usersModel.updateOne({ _id: userId, purchasedCourses });

    await coursesModel.updateRatingMetrics(courseDoc._id, newAvg, newCant);

    return {
      success: true,
      message: "Valoración registrada",
      rating: newAvg,
      ratingCount: newCant,
      courseRating: starsInt,
    };
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
