import { coursesService } from "../services/courses.service.js";
import { professorsService } from "../services/professors.service.js";
import { logger } from "../utils/logger.js";
import { transport } from "../utils/nodemailer.js";

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
        selectedInstructorId,
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

      // Si se proporcionó un instructor, agregar el courseId del curso a su array courses
      if (selectedInstructorId && courseCreated && courseCreated.courseId) {
        try {
          const instructor = await professorsService.findById(selectedInstructorId);
          if (instructor) {
            const courses = instructor.courses || [];
            const courseIdToAdd = String(courseCreated.courseId);
            // Solo agregar si no está ya en el array
            if (!courses.includes(courseIdToAdd)) {
              courses.push(courseIdToAdd);
              await professorsService.updateOne({
                _id: selectedInstructorId,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                ci: instructor.ci,
                profileImage: instructor.profileImage,
                profession: instructor.profession,
                experience: instructor.experience,
                bio: instructor.bio,
                certifications: instructor.certifications,
                achievements: instructor.achievements,
                courses: courses,
                contact: instructor.contact,
                socialMedia: instructor.socialMedia,
              });
            }
          }
        } catch (error) {
          logger.info(`Error al actualizar instructor con curso: ${error.message}`);
          // No fallar la creación del curso si falla la actualización del instructor
        }
      }

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
      const { courseId } = req.params;
      const courseData = req.body;

      // Buscar el curso por courseId para obtener su _id
      const course = await coursesService.findByCourseId(courseId);
      if (!course) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      const { selectedInstructorId, ...courseDataToUpdate } = courseData;
      courseDataToUpdate._id = course._id;
      const courseIdToUse = String(course.courseId);
      
      // Guardar datos del curso antes de actualizar para comparación
      // Convertir a objeto plano (JSON) para asegurar que todos los campos estén disponibles
      const coursePlain = course.toObject ? course.toObject() : JSON.parse(JSON.stringify(course));
      const courseBeforeUpdate = {
        sku: coursePlain.sku || "",
        courseName: coursePlain.courseName || "",
        category: coursePlain.category || "",
        difficulty: coursePlain.difficulty || "",
        duration: coursePlain.duration !== undefined ? coursePlain.duration : 0,
        price: coursePlain.price !== undefined ? coursePlain.price : 0,
        currency: coursePlain.currency || "USD",
        shortDescription: coursePlain.shortDescription || "",
        longDescription: coursePlain.longDescription || "",
        bannerUrl: coursePlain.bannerUrl || "",
        image: coursePlain.image || "",
        shortImage: coursePlain.shortImage || "",
        modules: coursePlain.modules || [],
      };
      
      // Buscar el instructor anterior que tenía este curso asignado
      const previousInstructors = await professorsService.findByCourseId(courseIdToUse);
      
      const courseUpdated = await coursesService.updateOne(courseDataToUpdate);
      
      // Obtener el curso actualizado para comparación
      const updatedCourse = await coursesService.findByCourseId(courseId);
      
      // Convertir a objeto plano si es un documento de Mongoose
      const updatedCoursePlain = updatedCourse?.toObject ? updatedCourse.toObject() : (updatedCourse ? JSON.parse(JSON.stringify(updatedCourse)) : {});
      
      // Asegurar que updatedCourse tenga todos los campos necesarios
      const updatedCourseData = {
        sku: updatedCoursePlain.sku || "",
        courseName: updatedCoursePlain.courseName || "",
        category: updatedCoursePlain.category || "",
        difficulty: updatedCoursePlain.difficulty || "",
        duration: updatedCoursePlain.duration !== undefined ? updatedCoursePlain.duration : 0,
        price: updatedCoursePlain.price !== undefined ? updatedCoursePlain.price : 0,
        currency: updatedCoursePlain.currency || "USD",
        shortDescription: updatedCoursePlain.shortDescription || "",
        longDescription: updatedCoursePlain.longDescription || "",
        bannerUrl: updatedCoursePlain.bannerUrl || "",
        image: updatedCoursePlain.image || "",
        shortImage: updatedCoursePlain.shortImage || "",
        modules: updatedCoursePlain.modules || [],
      };

      // Si se proporcionó un instructor, actualizar su array courses
      if (selectedInstructorId && course.courseId) {
        try {
          const newInstructor = await professorsService.findById(selectedInstructorId);
          if (newInstructor) {
            const courses = newInstructor.courses || [];
            // Solo agregar si no está ya en el array
            if (!courses.includes(courseIdToUse)) {
              courses.push(courseIdToUse);
              await professorsService.updateOne({
                _id: selectedInstructorId,
                firstName: newInstructor.firstName,
                lastName: newInstructor.lastName,
                ci: newInstructor.ci,
                profileImage: newInstructor.profileImage,
                profession: newInstructor.profession,
                experience: newInstructor.experience,
                bio: newInstructor.bio,
                certifications: newInstructor.certifications,
                achievements: newInstructor.achievements,
                courses: courses,
                contact: newInstructor.contact,
                socialMedia: newInstructor.socialMedia,
              });
            }
          }
        } catch (error) {
          logger.info(`Error al actualizar instructor con curso: ${error.message}`);
          // No fallar la actualización del curso si falla la actualización del instructor
        }
      }

      // Remover el curso de los instructores anteriores si el instructor cambió
      if (previousInstructors && previousInstructors.length > 0) {
        for (const prevInstructor of previousInstructors) {
          // Si el instructor anterior es diferente al nuevo, remover el curso
          if (String(prevInstructor._id) !== String(selectedInstructorId)) {
            try {
              const updatedCourses = (prevInstructor.courses || []).filter(id => String(id) !== courseIdToUse);
              await professorsService.updateOne({
                _id: prevInstructor._id,
                firstName: prevInstructor.firstName,
                lastName: prevInstructor.lastName,
                ci: prevInstructor.ci,
                profileImage: prevInstructor.profileImage,
                profession: prevInstructor.profession,
                experience: prevInstructor.experience,
                bio: prevInstructor.bio,
                certifications: prevInstructor.certifications,
                achievements: prevInstructor.achievements,
                courses: updatedCourses,
                contact: prevInstructor.contact,
                socialMedia: prevInstructor.socialMedia,
              });
            } catch (error) {
              logger.info(`Error al remover curso de instructor anterior: ${error.message}`);
            }
          }
        }
      }

      if (courseUpdated.matchedCount > 0) {
        // Enviar email al instructor sobre los cambios realizados
        try {
          // Determinar qué instructor notificar
          let instructorToNotify = null;
          
          // Prioridad 1: Si se proporcionó un instructor nuevo en la actualización, notificar al nuevo
          if (selectedInstructorId) {
            instructorToNotify = await professorsService.findById(selectedInstructorId);
          } 
          // Prioridad 2: Si no se cambió el instructor, notificar al instructor que ya tenía el curso asignado
          else if (previousInstructors && previousInstructors.length > 0) {
            instructorToNotify = previousInstructors[0];
          }
          // Prioridad 3: Buscar instructores que tengan este curso asignado después de la actualización
          else {
            const instructorsWithCourse = await professorsService.findByCourseId(courseIdToUse);
            if (instructorsWithCourse && instructorsWithCourse.length > 0) {
              instructorToNotify = instructorsWithCourse[0];
            }
          }
          
          // Si hay un instructor asignado, enviar email
          if (instructorToNotify && instructorToNotify.contact && instructorToNotify.contact.email) {
            // Función para comparar valores y generar HTML
            const compareAndGenerateHTML = (fieldName, oldValue, newValue) => {
              const oldStr = oldValue !== null && oldValue !== undefined ? String(oldValue) : "N/A";
              const newStr = newValue !== null && newValue !== undefined ? String(newValue) : "N/A";
              
              if (oldStr === newStr) {
                return `<tr><td><strong>${fieldName}</strong></td><td>${oldStr}</td><td>${newStr}</td></tr>`;
              } else {
                return `<tr style="background-color: #fff3cd;"><td><strong>${fieldName}</strong></td><td>${oldStr}</td><td>${newStr} <span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 5px;">MODIFICADO</span></td></tr>`;
              }
            };

            // Construir tabla de comparación
            let comparisonTable = `
              <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #082b55; color: #ffa500;">
                    <th>Campo</th>
                    <th>Valor Anterior</th>
                    <th>Valor Actual</th>
                  </tr>
                </thead>
                <tbody>
            `;

            // Función para comparar arrays/objetos complejos (JSON completo)
            const compareComplexField = (fieldName, oldValue, newValue) => {
              const oldStr = oldValue ? JSON.stringify(oldValue, null, 2) : "N/A";
              const newStr = newValue ? JSON.stringify(newValue, null, 2) : "N/A";
              
              // Escapar HTML para evitar problemas de renderizado
              const escapeHtml = (text) => {
                const map = {
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  '"': '&quot;',
                  "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
              };
              
              const oldStrEscaped = escapeHtml(oldStr);
              const newStrEscaped = escapeHtml(newStr);
              
              if (oldStr === newStr) {
                return `<tr><td style="vertical-align: top;"><strong>${fieldName}</strong></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${oldStrEscaped}</pre></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${newStrEscaped}</pre></td></tr>`;
              } else {
                return `<tr style="background-color: #fff3cd;"><td style="vertical-align: top;"><strong>${fieldName}</strong></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${oldStrEscaped}</pre></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${newStrEscaped}</pre> <span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 5px;">MODIFICADO</span></td></tr>`;
              }
            };

            // Comparar campos básicos
            comparisonTable += compareAndGenerateHTML("SKU", courseBeforeUpdate.sku, updatedCourseData.sku);
            comparisonTable += compareAndGenerateHTML("Nombre del Curso", courseBeforeUpdate.courseName, updatedCourseData.courseName);
            comparisonTable += compareAndGenerateHTML("Categoría", courseBeforeUpdate.category, updatedCourseData.category);
            comparisonTable += compareAndGenerateHTML("Dificultad", courseBeforeUpdate.difficulty, updatedCourseData.difficulty);
            comparisonTable += compareAndGenerateHTML("Duración", courseBeforeUpdate.duration, updatedCourseData.duration);
            comparisonTable += compareAndGenerateHTML("Precio", courseBeforeUpdate.price, updatedCourseData.price);
            comparisonTable += compareAndGenerateHTML("Moneda", courseBeforeUpdate.currency, updatedCourseData.currency);
            comparisonTable += compareAndGenerateHTML("Descripción Corta", courseBeforeUpdate.shortDescription, updatedCourseData.shortDescription);
            comparisonTable += compareAndGenerateHTML("Descripción Larga", courseBeforeUpdate.longDescription, updatedCourseData.longDescription);
            
            // Comparar imágenes
            const currentBannerUrl = updatedCoursePlain.bannerUrl || "";
            const currentImage = updatedCoursePlain.image || "";
            const currentShortImage = updatedCoursePlain.shortImage || "";
            comparisonTable += compareAndGenerateHTML("Banner URL", courseBeforeUpdate.bannerUrl || "N/A", currentBannerUrl || "N/A");
            comparisonTable += compareAndGenerateHTML("Imagen", courseBeforeUpdate.image || "N/A", currentImage || "N/A");
            comparisonTable += compareAndGenerateHTML("Imagen Corta", courseBeforeUpdate.shortImage || "N/A", currentShortImage || "N/A");
            
            // Comparar módulos
            comparisonTable += compareComplexField("Módulos", courseBeforeUpdate.modules, updatedCoursePlain.modules);

            comparisonTable += `</tbody></table>`;

            // Generar HTML del email
            const emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: #082b55; color: #ffa500; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0;">LATIAS ACADEMIA</h1>
                  <h2 style="margin: 10px 0 0 0; color: white;">Notificación de Modificación de Curso</h2>
                </div>
                
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #082b55; font-size: 1.1em;">Estimado/a <strong>${instructorToNotify.firstName} ${instructorToNotify.lastName}</strong>,</p>
                  
                  <p>Le informamos que el curso asignado a su cuenta ha sido modificado por un administrador.</p>

                  <h3 style="color: #082b55; margin-top: 30px;">Curso Modificado:</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin: 10px 0;"><strong>Course ID:</strong> ${courseId}</li>
                    <li style="margin: 10px 0;"><strong>Nombre:</strong> ${updatedCourseData.courseName}</li>
                  </ul>

                  <h3 style="color: #082b55; margin-top: 30px;">Cambios Realizados:</h3>
                  ${comparisonTable}

                  <p style="color: #666; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                    Este es un correo automático. Por favor, no responda a este mensaje.
                  </p>
                </div>
              </div>
            `;

            // Enviar email al instructor
            await transport.sendMail({
              from: process.env.GOOGLE_EMAIL,
              to: instructorToNotify.contact.email,
              subject: `[LATIAS] Curso Modificado - ${updatedCourseData.courseName}`,
              html: emailHTML,
            });

            logger.info(`Email de notificación enviado al instructor ${instructorToNotify.contact.email} sobre cambios en el curso ${courseId}`);
          }
        } catch (emailError) {
          // No fallar la actualización si falla el envío del email
          logger.info(`Error al enviar email de notificación al instructor: ${emailError.message}`);
        }

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
      const { courseId } = req.params;

      // Buscar el curso por courseId para obtener su _id
      const course = await coursesService.findByCourseId(courseId);
      if (!course) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      const result = await coursesService.deleteOne(course._id);

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

  // Actualizar progreso del curso del usuario (porcentaje 0-100)
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

  // Actualizar progreso de una lección (marcar completada); recalcula el progreso del curso
  async updateUserLessonProgress(req, res) {
    try {
      const { userId, courseId, moduleId, lessonId } = req.params;
      const { completed } = req.body;

      if (moduleId == null || lessonId == null) {
        return res.status(400).json({
          status: "error",
          msg: "moduleId y lessonId son requeridos",
          payload: {},
        });
      }

      const result = await coursesService.updateUserLessonProgress(userId, courseId, moduleId, lessonId, {
        completed: completed !== false && completed !== "false"
      });

      return res.status(200).json({
        status: "success",
        msg: result.message,
        payload: { course: result.course, progress: result.progress },
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


  // Actualizar certificado del curso (para administradores)
  async updateCertificate(req, res) {
    try {
      const { courseId } = req.params;
      const { certificate } = req.body;

      if (!certificate) {
        return res.status(400).json({
          status: "error",
          msg: "El certificado es requerido",
          payload: {},
        });
      }

      // Buscar el curso por courseId para obtener su _id
      const course = await coursesService.findByCourseId(courseId);
      if (!course) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      const courseUpdated = await coursesService.updateCertificate({ _id: course._id, certificate });

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

  // Solicitar modificación de curso (para instructores)
  async requestCourseModification(req, res) {
    try {
      const { courseId } = req.params;
      const { instructorData, courseData } = req.body;

      // Obtener el curso actual
      const currentCourse = await coursesService.findByCourseId(courseId);
      if (!currentCourse) {
        return res.status(404).json({
          status: "error",
          msg: "Curso no encontrado",
          payload: {},
        });
      }

      // Convertir curso actual a objeto plano
      const currentCoursePlain = currentCourse.toObject ? currentCourse.toObject() : JSON.parse(JSON.stringify(currentCourse));

      // Función para comparar valores y generar HTML
      const compareAndGenerateHTML = (fieldName, currentValue, newValue) => {
        const currentStr = currentValue !== null && currentValue !== undefined ? String(currentValue) : "N/A";
        const newStr = newValue !== null && newValue !== undefined ? String(newValue) : "N/A";
        
        if (currentStr === newStr) {
          return `<tr><td><strong>${fieldName}</strong></td><td>${currentStr}</td><td>${newStr}</td></tr>`;
        } else {
          return `<tr style="background-color: #fff3cd;"><td><strong>${fieldName}</strong></td><td>${currentStr}</td><td>${newStr} <span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 5px;">NEW</span></td></tr>`;
        }
      };

      // Función para comparar arrays/objetos complejos (JSON completo)
      const compareComplexField = (fieldName, currentValue, newValue) => {
        const currentStr = currentValue ? JSON.stringify(currentValue, null, 2) : "N/A";
        const newStr = newValue ? JSON.stringify(newValue, null, 2) : "N/A";
        
        // Escapar HTML para evitar problemas de renderizado
        const escapeHtml = (text) => {
          const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
          };
          return text.replace(/[&<>"']/g, m => map[m]);
        };
        
        const currentStrEscaped = escapeHtml(currentStr);
        const newStrEscaped = escapeHtml(newStr);
        
        if (currentStr === newStr) {
          return `<tr><td style="vertical-align: top;"><strong>${fieldName}</strong></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${currentStrEscaped}</pre></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${newStrEscaped}</pre></td></tr>`;
        } else {
          return `<tr style="background-color: #fff3cd;"><td style="vertical-align: top;"><strong>${fieldName}</strong></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${currentStrEscaped}</pre></td><td style="vertical-align: top;"><pre style="white-space: pre-wrap; max-width: 100%; font-size: 0.8em; background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; max-height: 500px; overflow-y: auto;">${newStrEscaped}</pre> <span style="background-color: #dc3545; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 5px;">NEW</span></td></tr>`;
        }
      };

      // Construir tabla de comparación
      let comparisonTable = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #082b55; color: #ffa500;">
              <th>Campo</th>
              <th>Valor Actual</th>
              <th>Valor Propuesto</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Comparar campos básicos
      comparisonTable += compareAndGenerateHTML("SKU", currentCoursePlain.sku, courseData.sku);
      comparisonTable += compareAndGenerateHTML("Nombre del Curso", currentCoursePlain.courseName, courseData.courseName);
      comparisonTable += compareAndGenerateHTML("Categoría", currentCoursePlain.category, courseData.category);
      comparisonTable += compareAndGenerateHTML("Dificultad", currentCoursePlain.difficulty, courseData.difficulty);
      comparisonTable += compareAndGenerateHTML("Duración", currentCoursePlain.duration, courseData.duration);
      comparisonTable += compareAndGenerateHTML("Precio", currentCoursePlain.price, courseData.price);
      comparisonTable += compareAndGenerateHTML("Moneda", currentCoursePlain.currency, courseData.currency);
      comparisonTable += compareAndGenerateHTML("Descripción Corta", currentCoursePlain.shortDescription, courseData.shortDescription);
      comparisonTable += compareAndGenerateHTML("Descripción Larga", currentCoursePlain.longDescription, courseData.longDescription);
      comparisonTable += compareAndGenerateHTML("Banner URL", currentCoursePlain.bannerUrl || "N/A", courseData.bannerUrl || "N/A");
      comparisonTable += compareAndGenerateHTML("Imagen", currentCoursePlain.image || "N/A", courseData.image || "N/A");
      comparisonTable += compareAndGenerateHTML("Imagen Corta", currentCoursePlain.shortImage || "N/A", courseData.shortImage || "N/A");
      
      // Comparar módulos
      comparisonTable += compareComplexField("Módulos", currentCoursePlain.modules, courseData.modules);

      comparisonTable += `</tbody></table>`;

      // URL del frontend para modificar el curso
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const modifyUrl = `${frontendUrl}/dashboard/gestion`;

      // Generar HTML del email
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #082b55; color: #ffa500; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">LATIAS ACADEMIA</h1>
            <h2 style="margin: 10px 0 0 0; color: white;">Solicitud de Modificación de Curso</h2>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h3 style="color: #082b55;">Datos del Instructor que Solicita:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Nombre:</strong> ${instructorData.firstName} ${instructorData.lastName}</li>
              <li style="margin: 10px 0;"><strong>CI:</strong> ${instructorData.ci}</li>
              <li style="margin: 10px 0;"><strong>Email:</strong> ${instructorData.email}</li>
              <li style="margin: 10px 0;"><strong>Profesión:</strong> ${instructorData.profession || "N/A"}</li>
            </ul>

            <h3 style="color: #082b55; margin-top: 30px;">Curso a Modificar:</h3>
            <p><strong>Course ID:</strong> ${courseId}</p>
            <p><strong>Nombre Actual:</strong> ${currentCoursePlain.courseName}</p>

            <h3 style="color: #082b55; margin-top: 30px;">Comparación de Datos:</h3>
            ${comparisonTable}

            <div style="text-align: center; margin: 40px 0;">
              <a href="${modifyUrl}" 
                 style="background-color: #ffa500; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Modificar Curso
              </a>
            </div>

            <p style="color: #666; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              Este es un correo automático. Por favor, no responda a este mensaje.
            </p>
          </div>
        </div>
      `;

      // Enviar email
      await transport.sendMail({
        from: process.env.GOOGLE_EMAIL,
        to: "latiasacademia@gmail.com",
        subject: `[LATIAS] Solicitud de Modificación de Curso - ${courseId}`,
        html: emailHTML,
      });

      return res.status(200).json({
        status: "success",
        msg: "Solicitud de modificación enviada exitosamente",
        payload: {},
      });
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Error al enviar la solicitud de modificación",
        payload: {},
      });
    }
  }
}

export const coursesController = new CoursesController();
