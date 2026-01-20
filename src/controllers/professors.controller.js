import { professorsService } from "../services/professors.service.js";
import { logger } from "../utils/logger.js";

class ProfessorsController {
  // Obtener todos los instructores
  async getAll(req, res) {
    try {
      const professors = await professorsService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "Todos los instructores obtenidos",
        payload: professors,
      });
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener instructor por ID
  async findById(req, res) {
    try {
      const { id } = req.params;
      const professor = await professorsService.findById(id);
      if (professor) {
        return res.status(200).json({
          status: "success",
          message: "Instructor encontrado por ID",
          payload: professor,
        });
      } else {
        return res.status(404).json({
          status: "error",
          message: "Instructor no encontrado",
          payload: {},
        });
      }
    } catch (error) {
      logger.info(error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener instructor por CI
  async findByCi(req, res) {
    try {
      const { ci } = req.params;
      const professor = await professorsService.findByCi(parseInt(ci));
      if (professor) {
        return res.status(200).json({
          status: "success",
          message: "Instructor encontrado por CI",
          payload: professor,
        });
      } else {
        return res.status(404).json({
          status: "error",
          message: "Instructor no encontrado",
          payload: {},
        });
      }
    } catch (error) {
      logger.info(error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener instructores por ID de curso
  async findByCourseId(req, res) {
    try {
      const { courseId } = req.params;
      const professors = await professorsService.findByCourseId(courseId);
      return res.status(200).json({
        status: "success",
        msg: "Instructores encontrados por curso",
        payload: professors,
      });
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Algo salió mal",
        payload: {},
      });
    }
  }

  // Crear nuevo instructor
  async create(req, res) {
    try {
      const {
        firstName,
        lastName,
        ci,
        profileImage,
        profession,
        experience,
        bio,
        certifications,
        achievements,
        courses,
        contact,
        socialMedia,
      } = req.body;

      // Validar campos requeridos
      if (!firstName || !lastName || !ci || !profession || !contact?.email) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos firstName, lastName, ci, profession y contact.email son requeridos",
          payload: {},
        });
      }

      const professorCreated = await professorsService.create({
        firstName,
        lastName,
        ci: parseInt(ci),
        profileImage: profileImage || "",
        profession,
        experience: experience || "",
        bio: bio || "",
        certifications: certifications || [],
        achievements: achievements || [],
        courses: courses || [],
        contact: {
          email: contact.email,
          phone: contact.phone || "",
        },
        socialMedia: {
          linkedin: socialMedia?.linkedin || "",
          twitter: socialMedia?.twitter || "",
          instagram: socialMedia?.instagram || "",
          youtube: socialMedia?.youtube || "",
        },
      });

      return res.status(201).json({
        status: "success",
        msg: "Instructor creado exitosamente",
        payload: professorCreated,
      });
    } catch (e) {
      logger.info(e);
      // Si es un error de duplicado (CI único)
      if (e.code === 11000) {
        return res.status(400).json({
          status: "error",
          msg: "Ya existe un instructor con este CI",
          payload: {},
        });
      }
      return res.status(500).json({
        status: "error",
        msg: "Algo salió mal: " + e.message,
        payload: {},
      });
    }
  }

  // Actualizar instructor
  async updateOne(req, res) {
    try {
      const { id } = req.params;
      const professorData = req.body;

      // Buscar el instructor por ID
      const professor = await professorsService.findById(id);
      if (!professor) {
        return res.status(404).json({
          status: "error",
          msg: "Instructor no encontrado",
          payload: {},
        });
      }

      professorData._id = professor._id;
      const professorUpdated = await professorsService.updateOne(professorData);

      if (professorUpdated.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Instructor actualizado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Instructor no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.info(e);
      // Si es un error de duplicado (CI único)
      if (e.code === 11000) {
        return res.status(400).json({
          status: "error",
          msg: "Ya existe un instructor con este CI",
          payload: {},
        });
      }
      return res.status(500).json({
        status: "error",
        msg: "Algo salió mal",
        payload: {},
      });
    }
  }

  // Eliminar instructor
  async deleteOne(req, res) {
    try {
      const { id } = req.params;

      const result = await professorsService.deleteOne(id);

      if (result?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Instructor eliminado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Instructor no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Algo salió mal",
        payload: {},
      });
    }
  }
}

export const professorsController = new ProfessorsController();
