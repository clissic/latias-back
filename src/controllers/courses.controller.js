import { coursesService } from "../services/courses.service.js";
import { logger } from "../utils/logger.js";

class CoursesController {
  // ========== FUNCIONES PARA ADMINISTRADORES ==========

  // Obtener todos los cursos (para administradores)
  async getAll(req, res) {
    try {
      const courses = await coursesService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "Todos los cursos obtenidos",
        payload: courses,
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

  // Obtener curso por ID (para administradores)
  async findById(req, res) {
    try {
      const { id } = req.params;
      const course = await coursesService.findById(id);
      if (course) {
        return res.status(200).json({
          status: "success",
          message: "Curso encontrado por ID",
          payload: course,
        });
      } else {
        return res.status(404).json({
          status: "error",
          message: "Curso no encontrado",
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

  // Obtener curso por courseId (para administradores)
  async findByCourseId(req, res) {
    try {
      const { courseId } = req.params;
      const course = await coursesService.findByCourseId(courseId);
      if (course) {
        return res.status(200).json({
          status: "success",
          message: "Curso encontrado por courseId",
          payload: course,
        });
      } else {
        return res.status(404).json({
          status: "error",
          message: "Curso no encontrado",
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

  // Obtener curso por SKU (para administradores)
  async findBySku(req, res) {
    try {
      const { sku } = req.params;
      const course = await coursesService.findBySku(sku);
      if (course) {
        return res.status(200).json({
          status: "success",
          message: "Curso encontrado por SKU",
          payload: course,
        });
      } else {
        return res.status(404).json({
          status: "error",
          message: "Curso no encontrado",
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

  // Crear nuevo curso (solo administradores)
  async create(req, res) {
    try {
      const {
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
      } = req.body;

      // Validar campos requeridos
      if (!courseId || !sku || !courseName || !price || !category) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos courseId, sku, courseName, price y category son requeridos",
          payload: {},
        });
      }

      const courseCreated = await coursesService.create({
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

      return res.status(201).json({
        status: "success",
        msg: "Curso creado exitosamente",
        payload: courseCreated,
      });
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Algo salió mal: " + e.message,
        payload: {},
      });
    }
  }

  // Actualizar curso (solo administradores)
  async updateOne(req, res) {
    try {
      const { _id } = req.params;
      const courseData = req.body;
      courseData._id = _id;

      const courseUpdated = await coursesService.updateOne(courseData);

      if (courseUpdated.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Curso actualizado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
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

  // Eliminar curso (solo administradores)
  async deleteOne(req, res) {
    try {
      const { _id } = req.params;

      const result = await coursesService.deleteOne(_id);

      if (result?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Curso eliminado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
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

  // ========== FUNCIONES PARA USUARIOS ESTÁNDAR ==========

  // Obtener cursos por categoría (para usuarios)
  async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const courses = await coursesService.findByCategory(category);
      return res.status(200).json({
        status: "success",
        msg: "Cursos encontrados por categoría",
        payload: courses,
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

  // Obtener cursos por dificultad (para usuarios)
  async getByDifficulty(req, res) {
    try {
      const { difficulty } = req.params;
      const courses = await coursesService.findByDifficulty(difficulty);
      return res.status(200).json({
        status: "success",
        msg: "Cursos encontrados por dificultad",
        payload: courses,
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

  // Comprar curso (para usuarios)
  async purchaseCourse(req, res) {
    try {
      const { userId } = req.params;
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({
          status: "error",
          msg: "El courseId es requerido",
          payload: {},
        });
      }

      const result = await coursesService.purchaseCourse(userId, courseId);

      return res.status(200).json({
        status: "success",
        msg: result.message,
        payload: result.course,
      });
    } catch (error) {
      logger.info(error);
      return res.status(400).json({
        status: "error",
        msg: error.message,
        payload: {},
      });
    }
  }

  // Obtener cursos comprados del usuario
  async getUserPurchasedCourses(req, res) {
    try {
      const { userId } = req.params;
      const courses = await coursesService.getUserPurchasedCourses(userId);

      return res.status(200).json({
        status: "success",
        msg: "Cursos comprados obtenidos",
        payload: courses,
      });
    } catch (error) {
      logger.info(error);
      return res.status(400).json({
        status: "error",
        msg: error.message,
        payload: {},
      });
    }
  }

  // Actualizar progreso del curso del usuario
  async updateUserCourseProgress(req, res) {
    try {
      const { userId, courseId } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({
          status: "error",
          msg: "El progreso debe ser un número entre 0 y 100",
          payload: {},
        });
      }

      const result = await coursesService.updateUserCourseProgress(userId, courseId, progress);

      return res.status(200).json({
        status: "success",
        msg: result.message,
        payload: result.course,
      });
    } catch (error) {
      logger.info(error);
      return res.status(400).json({
        status: "error",
        msg: error.message,
        payload: {},
      });
    }
  }

  // Agregar intento de examen al curso del usuario
  async addUserCourseAttempt(req, res) {
    try {
      const { userId, courseId } = req.params;
      const { attempt } = req.body;

      if (!attempt) {
        return res.status(400).json({
          status: "error",
          msg: "El intento es requerido",
          payload: {},
        });
      }

      const result = await coursesService.addUserCourseAttempt(userId, courseId, attempt);

      return res.status(200).json({
        status: "success",
        msg: result.message,
        payload: result.course,
      });
    } catch (error) {
      logger.info(error);
      return res.status(400).json({
        status: "error",
        msg: error.message,
        payload: {},
      });
    }
  }

  // Actualizar certificado del curso del usuario
  async updateUserCourseCertificate(req, res) {
    try {
      const { userId, courseId } = req.params;
      const { certificate } = req.body;

      if (!certificate) {
        return res.status(400).json({
          status: "error",
          msg: "El certificado es requerido",
          payload: {},
        });
      }

      const result = await coursesService.updateUserCourseCertificate(userId, courseId, certificate);

      return res.status(200).json({
        status: "success",
        msg: result.message,
        payload: result.course,
      });
    } catch (error) {
      logger.info(error);
      return res.status(400).json({
        status: "error",
        msg: error.message,
        payload: {},
      });
    }
  }

  // ========== FUNCIONES ESPECÍFICAS DE CURSOS ==========

  // Actualizar progreso de un curso (para administradores)
  async updateProgress(req, res) {
    try {
      const { _id } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({
          status: "error",
          msg: "El progreso debe ser un número entre 0 y 100",
          payload: {},
        });
      }

      const courseUpdated = await coursesService.updateProgress({ _id, progress });

      if (courseUpdated.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Progreso del curso actualizado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
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

  // Actualizar estado de finalización del curso (para administradores)
  async updateFinishedStatus(req, res) {
    try {
      const { _id } = req.params;
      const { isFinished, finishedDate } = req.body;

      const courseUpdated = await coursesService.updateFinishedStatus({
        _id,
        isFinished,
        finishedDate,
      });

      if (courseUpdated.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Estado de finalización del curso actualizado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
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

  // Agregar intento de examen al curso (para administradores)
  async addAttempt(req, res) {
    try {
      const { _id } = req.params;
      const { attempt } = req.body;

      if (!attempt) {
        return res.status(400).json({
          status: "error",
          msg: "El intento es requerido",
          payload: {},
        });
      }

      const courseUpdated = await coursesService.addAttempt({ _id, attempt });

      if (courseUpdated.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Intento agregado al curso exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
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

  // Actualizar certificado del curso (para administradores)
  async updateCertificate(req, res) {
    try {
      const { _id } = req.params;
      const { certificate } = req.body;

      if (!certificate) {
        return res.status(400).json({
          status: "error",
          msg: "El certificado es requerido",
          payload: {},
        });
      }

      const courseUpdated = await coursesService.updateCertificate({ _id, certificate });

      if (courseUpdated.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Certificado del curso actualizado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
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

export const coursesController = new CoursesController();
