import { instructorsService } from "../services/instructors.service.js";
import { coursesService } from "../services/courses.service.js";
import { logger } from "../utils/logger.js";

async function syncCoursesInstructor(courseIds, instructorId) {
  if (!Array.isArray(courseIds)) return;
  for (const id of courseIds) {
    const idStr = String(id).trim();
    if (idStr) await coursesService.setInstructor(idStr, instructorId);
  }
}

function success(res, data, status = 200) {
  return res.status(status).json({ status: "success", msg: "OK", payload: data });
}

function error(res, msg, status = 500) {
  return res.status(status).json({ status: "error", msg: msg || "Algo salió mal", payload: status === 404 ? {} : [] });
}

export const instructorsController = {
  async getAll(req, res) {
    try {
      const list = await instructorsService.getAll();
      return success(res, Array.isArray(list) ? list : []);
    } catch (e) {
      logger.info(e);
      return error(res, "Algo salió mal", 500);
    }
  },

  async findById(req, res) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string" || !id.trim()) return error(res, "ID de instructor no válido", 400);
      const instructor = await instructorsService.findById(id.trim());
      if (!instructor) return error(res, "Instructor no encontrado", 404);
      return success(res, instructor);
    } catch (e) {
      logger.info(e);
      if (e.name === "CastError") return error(res, "ID de instructor no válido", 400);
      return error(res, "Error interno del servidor", 500);
    }
  },

  async findByCi(req, res) {
    try {
      const { ci } = req.params;
      const instructor = await instructorsService.findByCi(ci);
      if (!instructor) return error(res, "Instructor no encontrado", 404);
      return success(res, instructor);
    } catch (e) {
      logger.info(e);
      return error(res, "Error interno del servidor", 500);
    }
  },

  async findByCourseId(req, res) {
    try {
      const { courseId } = req.params;
      const list = await instructorsService.findByCourseId(courseId);
      return success(res, Array.isArray(list) ? list : []);
    } catch (e) {
      logger.info(e);
      return error(res, "Algo salió mal", 500);
    }
  },

  async create(req, res) {
    try {
      const body = req.body || {};
      const firstName = body.firstName != null ? String(body.firstName).trim() : "";
      const lastName = body.lastName != null ? String(body.lastName).trim() : "";
      const ci = body.ci != null ? Number(body.ci) : NaN;
      const profession = body.profession != null ? String(body.profession).trim() : "";
      const contact = body.contact && typeof body.contact === "object" && !Array.isArray(body.contact)
        ? { email: String(body.contact.email ?? "").trim(), phone: String(body.contact.phone ?? "").trim() }
        : { email: "", phone: "" };

      if (!firstName || !lastName || !profession || !contact.email) {
        return error(res, "Faltan campos requeridos: firstName, lastName, profession, contact.email", 400);
      }
      if (!Number.isInteger(ci) || ci <= 0) {
        return error(res, "CI debe ser un número entero positivo", 400);
      }

      const socialMedia = body.socialMedia && typeof body.socialMedia === "object" && !Array.isArray(body.socialMedia)
        ? {
            linkedin: String(body.socialMedia.linkedin ?? "").trim(),
            twitter: String(body.socialMedia.twitter ?? "").trim(),
            instagram: String(body.socialMedia.instagram ?? "").trim(),
            youtube: String(body.socialMedia.youtube ?? "").trim(),
          }
        : { linkedin: "", twitter: "", instagram: "", youtube: "" };

      const data = {
        firstName,
        lastName,
        ci,
        profileImage: String(body.profileImage ?? "").trim(),
        profession,
        experience: String(body.experience ?? "").trim(),
        bio: String(body.bio ?? "").trim(),
        certifications: Array.isArray(body.certifications) ? body.certifications.map((c) => String(c).trim()).filter(Boolean) : [],
        achievements: Array.isArray(body.achievements) ? body.achievements.map((a) => String(a).trim()).filter(Boolean) : [],
        courses: Array.isArray(body.courses) ? body.courses.map((c) => String(c).trim()).filter(Boolean) : [],
        contact,
        socialMedia,
      };

      const created = await instructorsService.create(data);
      const instructorId = created?._id ?? created?.id;
      if (instructorId && data.courses?.length) {
        await syncCoursesInstructor(data.courses, instructorId);
      }
      return success(res, created, 201);
    } catch (e) {
      logger.info(e);
      if (e.code === 11000) return error(res, "Ya existe un instructor con ese CI", 400);
      return error(res, e.message || "Algo salió mal", 500);
    }
  },

  async updateOne(req, res) {
    try {
      const { id } = req.params;
      const body = req.body || {};
      if (!id || typeof id !== "string" || !id.trim()) return error(res, "ID no válido", 400);

      const existing = await instructorsService.findById(id.trim());
      if (!existing) return error(res, "Instructor no encontrado", 404);

      const contact = body.contact != null && typeof body.contact === "object" && !Array.isArray(body.contact)
        ? { email: String(body.contact.email ?? "").trim(), phone: String(body.contact.phone ?? "").trim() }
        : undefined;
      const socialMedia = body.socialMedia != null && typeof body.socialMedia === "object" && !Array.isArray(body.socialMedia)
        ? {
            linkedin: String(body.socialMedia.linkedin ?? "").trim(),
            twitter: String(body.socialMedia.twitter ?? "").trim(),
            instagram: String(body.socialMedia.instagram ?? "").trim(),
            youtube: String(body.socialMedia.youtube ?? "").trim(),
          }
        : undefined;

      const data = {
        _id: existing._id,
        firstName: body.firstName != null ? String(body.firstName).trim() : existing.firstName,
        lastName: body.lastName != null ? String(body.lastName).trim() : existing.lastName,
        ci: body.ci != null ? Number(body.ci) : existing.ci,
        profileImage: body.profileImage != null ? String(body.profileImage).trim() : existing.profileImage,
        profession: body.profession != null ? String(body.profession).trim() : existing.profession,
        experience: body.experience != null ? String(body.experience).trim() : existing.experience,
        bio: body.bio != null ? String(body.bio).trim() : existing.bio,
        certifications: Array.isArray(body.certifications) ? body.certifications.map((c) => String(c).trim()) : existing.certifications,
        achievements: Array.isArray(body.achievements) ? body.achievements.map((a) => String(a).trim()) : existing.achievements,
        courses: Array.isArray(body.courses) ? body.courses.map((c) => String(c).trim()) : existing.courses,
        contact: contact ?? existing.contact,
        socialMedia: socialMedia ?? existing.socialMedia,
      };

      const result = await instructorsService.updateOne(data);
      if (result.matchedCount > 0) {
        const instructorId = existing._id;
        const newCourseIds = data.courses || [];
        const oldCourseIds = Array.isArray(existing.courses) ? existing.courses.map(String) : [];
        for (const id of newCourseIds) {
          const idStr = String(id).trim();
          if (idStr) await coursesService.setInstructor(idStr, instructorId);
        }
        const removedIds = oldCourseIds.filter((id) => !newCourseIds.includes(id));
        for (const id of removedIds) {
          const idStr = String(id).trim();
          if (idStr) await coursesService.setInstructor(idStr, null);
        }
        return success(res, {});
      }
      return error(res, "Instructor no encontrado", 404);
    } catch (e) {
      logger.info(e);
      if (e.code === 11000) return error(res, "Ya existe un instructor con ese CI", 400);
      return error(res, e.message || "Algo salió mal", 500);
    }
  },

  async deleteOne(req, res) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string" || !id.trim()) return error(res, "ID no válido", 400);
      const result = await instructorsService.deleteOne(id.trim());
      if (result?.deletedCount > 0) return success(res, {});
      return error(res, "Instructor no encontrado", 404);
    } catch (e) {
      logger.info(e);
      return error(res, "Algo salió mal", 500);
    }
  },
};
