import { userService } from "../services/users.service.js";
import { createHash } from "../utils/Bcrypt.js";
import { logger } from "../utils/logger.js";
import { jwtService } from "../services/jwt.service.js";
import UserDTO from "./DTO/users.dto.js";

class UsersController {
  async getAll(req, res) {
    try {
      const users = await userService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "All users found",
        payload: users,
      });
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Something went wrong",
        payload: {},
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      console.log(id);
      const user = await userService.findById(id);
      if (user) {
        return res.status(200).json({
          status: "success",
          message: "User by ID found",
          payload: user,
        });
      } else {
        return res
          .status(404)
          .json({ status: "error", message: "User does not exist" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error!!" });
    }
  }

  async findByEmail(req,res) {
    try {
      const email = req.query.email;
      console.log(email)
      const user = await userService.findByEmail(email);
      if (user) {
        return res.status(200).json({
          status: "success",
          message: "User by email found",
          payload: user,
        });
      } else {
        return res
          .status(404)
          .json({
            status: "error",
            message: "User by email not found",
            payload: "",
          })
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error!!" });
    }
  }

    async findByCi(req,res) {
    try {
      const ci = req.query.ci;
      const user = await userService.findByCi(ci);
      if (user) {
        return res.status(200).json({
          status: "success",
          message: "User by CI found",
          payload: user,
        });
      } else {
        return res
          .status(404)
          .json({
            status: "error",
            message: "User by CI not found",
            payload: "",
          })
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error!!" });
    }
  }

  async create(req, res) {
    try {
      const { firstName, lastName, email, ci, birth, password } = req.body;
      if (!firstName || !lastName || !email || !ci || !birth || !password) {
        return res.status(400).json({
          status: "error",
          msg: "All fields are required",
          payload: {},
        });
      }

      const normalizedCi = String(ci).trim();
      if (!normalizedCi) {
        return res.status(400).json({
          status: "error",
          msg: "CI es requerido",
          payload: {},
        });
      }

      // Asegurar que no existan CI duplicados
      const existingByCi = await userService.findByCi(normalizedCi);
      if (existingByCi) {
        return res.status(409).json({
          status: "error",
          msg: "Ya existe un usuario con ese CI",
          payload: {},
        });
      }
  
      const userDTO = new UserDTO(firstName, lastName, email, normalizedCi, birth, createHash(password));

      const userCreated = await userService.create(userDTO);
  
      return res.status(201).json({
        status: "success",
        msg: "User created",
        payload: userCreated,
      });
    } catch (e) {
      // Fallback por si el índice unique dispara error de duplicado
      if (e?.code === 11000 || String(e?.message || "").includes("E11000")) {
        return res.status(409).json({
          status: "error",
          msg: "Usuario duplicado (email o CI ya registrado)",
          payload: {},
        });
      }
      return res.status(500).json({
        status: "error",
        msg: "Something went wrong: " + e.message,
        payload: {},
      });
    }
  }

  async updateOne(req, res) {
    try {
      // Validar que solo administradores puedan modificar usuarios
      // (esto es redundante con el middleware, pero es una capa adicional de seguridad)
      if (req.user.category !== "Administrador") {
        logger.warning(`Usuario ${req.user.userId} con categoría ${req.user.category} intentó modificar un usuario`);
        return res.status(403).json({
          status: "error",
          msg: "Solo los administradores pueden modificar usuarios",
          payload: {},
        });
      }

      // Si viene _id en params, usarlo (para rutas con :id), sino usar el usuario autenticado
      const _id = req.params._id || req.body._id || req.user.userId;
      const { password,
        avatar,
        firstName,
        lastName,
        status,
        email,
        ci,
        phone,
        birth,
        address,
        statistics,
        settings,
        preferences,
        rank,
        category,
        purchasedCourses,
        finishedCourses, } = req.body;
      
      if (!firstName || !lastName || !email || !_id) {
        logger.info(
          "Validation error: please complete firstName, lastName and email."
        );
        return res.status(400).json({
          status: "error",
          msg: "Please complete firstName, lastName and email.",
          payload: {},
        });
      }

      // Validar que el category sea uno de los valores permitidos si se proporciona
      if (category && !["Cadete", "Instructor", "Administrador", "checkin"].includes(category)) {
        return res.status(400).json({
          status: "error",
          msg: "Categoría inválida. Debe ser: Cadete, Instructor o Administrador",
          payload: {},
        });
      }

      try {
        const userUpdated = await userService.updateOne({
            _id,
            password,
            avatar,
            firstName,
            lastName,
            status,
            email,
            ci,
            phone,
            birth,
            address,
            statistics,
            settings,
            preferences,
            rank,
            category,
            purchasedCourses,
            finishedCourses,
        });
        logger.info(`Usuario ${_id} actualizado por administrador ${req.user.userId}`);
        if (userUpdated.matchedCount > 0) {
          return res.status(201).json({
            status: "success",
            msg: "User updated",
            payload: {},
          });
        } else {
          return res.status(404).json({
            status: "error",
            msg: "User not found",
            payload: {},
          });
        }
      } catch (e) {
        logger.error("Error al actualizar usuario:", e);
        return res.status(500).json({
          status: "error",
          msg: "db server error while updating user",
          payload: {},
        });
      }
    } catch (e) {
      logger.error("Error en updateOne:", e);
      return res.status(500).json({
        status: "error",
        msg: "something went wrong",
        payload: {},
      });
    }
  }

  async deleteOne(req, res) {
    try {
      const { id } = req.params;
      console.log('DeleteOne ID:', id);

      const result = await userService.deleteOne({ _id: id });

      if (result?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "User deleted",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "failed",
          msg: "User not found",
          payload: {},
        });
      }
    } catch (e) {
      logger.info(e);
      return res.status(500).json({
        status: "error",
        msg: "Something went wrong",
        payload: {},
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const email = req.user.email;
      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({
          status: "error",
          msg: "New password is required",
          payload: {},
        });
      }

      // Hashear la contraseña antes de guardarla
      const hashedPassword = createHash(newPassword);
      const userUpdated = await userService.updatePassword({ email, newPassword: hashedPassword });
      if (userUpdated) {
        return res.status(200).json({
          status: "success",
          msg: "Password updated",
          payload: {},
        });
      } else {
        return res.status(400).json({
          status: "failed",
          msg: "Password could not be updated",
          payload: {},
        });
      }
    } catch (error) {
      logger.error("Error updating password:", error);
      return res.status(500).json({
        status: "error",
        msg: "Something went wrong " + error,
        payload: {},
      });
    }
  }


  async createAndSendEmail(req, res) {
    try {
      const { firstName, lastName, birth, ci, email, password } = req.body;

      const emailSent = await userService.sendDataToNewUser({
        firstName,
        lastName,
        status,
        email
      });
      const userCreated = await userService.create({
        firstName,
        lastName,
        birth,
        ci,
        email,
        password: createHash(password),
      });
      console.log(emailSent + " " + userCreated);
      if (emailSent && userCreated) {
        logger.info(
          `La cuenta de ${email} fue creada correctamente.`
        );
        return res
          .status(200)
          .render("success", {
            msg: `Cuenta de ${email} fue creada con éxito.`,
          });
      } else {
        logger.info(
          `La cuenta de ${email} no fue creada correctamente.`
        );
        return res
          .status(400)
          .render("errorPage", {
            msg: "La cuenta no pudo ser creada con éxito.",
          });
      }
    } catch (error) {
      logger.error("Error in users.controller createAndSendEmail: " + error);
      return res
        .status(400)
        .render("errorPage", {
          msg: "La cuenta no pudo ser creada con éxito debido a un error del servidor. Por favor, verifica que el email utilizado no se encuentre ya en uso e intentelo nuevamente.",
        });
    }
  }


  async findByIdAndUpdate(req, res) {
    const user = req.user;
    const { id } = req.params;
    const updatedUser = req.query;
    updatedUser._id = id;
    updatedUser.last_modified_by = user.email;
    try {
      const userFound = await userService.updateOne(updatedUser);
      if (userFound) {
        logger.info(
          `Usuario ${updatedUser.rank} ${updatedUser.firstName} ${
            updatedUser.lastName
          } actualizado con éxito por ${user.rank} ${user.firstName} ${
            user.lastName
          }: ${JSON.stringify(updatedUser)}`
        );
        res
          .status(200)
          .render("success", {
            msg: `Usuario ${updatedUser.rank} ${updatedUser.firstName} ${updatedUser.lastName} actualizado con éxito.`,
          });
      } else {
        logger.info(
          `No se encontró el usuario con el ID: ${id} por ${user.rank} ${user.firstName} ${user.lastName}.`
        );
        res
          .status(200)
          .render("errorPage", {
            msg: `El usuario con ID: ${id} no pudo ser actualizada por no encontrarse en la base de datos.`,
          });
      }
    } catch (error) {
      logger.error(
        `Error de servidor al actualizar usuario con ID: ${id} por ${user.rank} ${user.firstName} ${user.lastName}:`,
        error
      );
      res
        .status(200)
        .render("errorPage", {
          msg: `El usuario con el ID: ${id} no pudo ser actualizada por un error del servidor.`,
        });
    }
  }


  async findByIdAndDelete (req, res) {
    const user = req.user
    const { id } = req.params;
    try {
      const userFound = await userService.findById(id);
      if ( userFound ) {
        const userDeleted = await userService.deleteOne({_id: id});
        if (userDeleted) {
          logger.info(`Usuario ${userFound.rank} ${userFound.firstName} ${userFound.lastName} eliminado con éxito por ${user.rank} ${user.firstName} ${user.lastName} (${user.email}).` );
          res.status(200).render("success", { msg: `Usuario ${userFound.rank} ${userFound.firstName} ${userFound.lastName} eliminado con éxito.`})
        } else {
          logger.info(`No se encontró el usuario con ID: ${id} en la base de datos.`);
          res.status(200).render("errorPage", { msg: `El usuario con ID: ${id} no pudo ser eliminado por no encontrarse en la base de datos.`})
        }
      }
    } catch (error) {
      logger.error(`Error de servidor al eliminar el usuario con ID: ${id} en la base de datos:`, error);
      res.status(200).render("errorPage", { msg: `El usuario con ID: ${id} no pudo ser eliminado por un error del servidor.`})
    }
  }

  // Login con JWT
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar datos requeridos
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          msg: "Email y contraseña son requeridos",
          payload: {},
        });
      }

      // Buscar usuario por email
      const user = await userService.findUser(email, password);
      
      if (!user) {
        return res.status(401).json({
          status: "error",
          msg: "Credenciales inválidas",
          payload: {},
        });
      }

      // Generar tokens JWT
      const tokens = jwtService.generateTokens({
        userId: user._id,
        email: user.email,
        category: user.category
      });

      // Actualizar último login
      await userService.updateOne({
        _id: user._id,
        lastLogin: new Date()
      });

      logger.info(`Usuario ${user.email} inició sesión exitosamente`);

      return res.status(200).json({
        status: "success",
        msg: "Login exitoso",
        payload: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            category: user.category,
            rank: user.rank,
            avatar: user.avatar,
            phone: user.phone,
            birth: user.birth,
            ci: user.ci,
            address: user.address,
            statistics: user.statistics,
            settings: user.settings,
            preferences: user.preferences,
            purchasedCourses: user.purchasedCourses,
            finishedCourses: user.finishedCourses,
            approvedCourses: user.approvedCourses || [],
            status: user.status || "Estudiante"
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          }
        },
      });
    } catch (error) {
      logger.error("Error en login:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status: "error",
          msg: "Refresh token requerido",
          payload: {},
        });
      }

      // Verificar refresh token
      const decoded = jwtService.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          status: "error",
          msg: "Token de refresh inválido",
          payload: {},
        });
      }

      // Buscar usuario
      const user = await userService.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      // Generar nuevo access token
      const newTokens = jwtService.generateTokens({
        userId: user._id,
        email: user.email,
        category: user.category
      });

      return res.status(200).json({
        status: "success",
        msg: "Token renovado exitosamente",
        payload: {
          accessToken: newTokens.accessToken,
          expiresIn: newTokens.expiresIn
        },
      });
    } catch (error) {
      logger.error("Error en refresh token:", error);
      return res.status(401).json({
        status: "error",
        msg: "Token de refresh inválido o expirado",
        payload: {},
      });
    }
  }

  // Obtener perfil completo del usuario autenticado
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await userService.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      return res.status(200).json({
        status: "success",
        msg: "Perfil obtenido exitosamente",
        payload: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            category: user.category,
            rank: user.rank,
            avatar: user.avatar,
            phone: user.phone,
            birth: user.birth,
            ci: user.ci,
            address: user.address,
            statistics: user.statistics,
            settings: user.settings,
            preferences: user.preferences,
            purchasedCourses: user.purchasedCourses,
            finishedCourses: user.finishedCourses,
            approvedCourses: user.approvedCourses || [],
            fleet: user.fleet || [],
            status: user.status || "Estudiante"
          }
        },
      });
    } catch (error) {
      logger.error("Error al obtener perfil:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Logout (opcional, ya que JWT es stateless)
  async logout(req, res) {
    try {
      // En un sistema stateless, el logout se maneja en el frontend
      // eliminando el token del almacenamiento local
      
      logger.info(`Usuario ${req.user?.email} cerró sesión`);
      
      return res.status(200).json({
        status: "success",
        msg: "Logout exitoso",
        payload: {},
      });
    } catch (error) {
      logger.error("Error en logout:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Solicitar agregar barco a la flota
  async requestBoatToFleet(req, res) {
    try {
      const userId = req.user.userId;
      const { boatId } = req.body;

      if (!boatId) {
        return res.status(400).json({
          status: "error",
          msg: "El ID del barco es requerido",
          payload: {},
        });
      }

      const result = await userService.requestBoatToFleet(userId, boatId);
      
      if (result.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Solicitud de barco agregada a tu flota",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }
    } catch (error) {
      logger.error("Error al solicitar barco a la flota:", error);
      
      if (error.message?.includes("Ya has solicitado")) {
        return res.status(409).json({
          status: "error",
          msg: error.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: error.message || "Error al solicitar barco a la flota",
        payload: {},
      });
    }
  }

  // Obtener flota del usuario
  async getUserFleet(req, res) {
    try {
      const userId = req.user.userId;
      const fleet = await userService.getUserFleet(userId);
      
      return res.status(200).json({
        status: "success",
        msg: "Flota obtenida",
        payload: fleet,
      });
    } catch (error) {
      logger.error("Error al obtener flota:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error al obtener la flota",
        payload: {},
      });
    }
  }

  // Remover barco de la flota
  async removeBoatFromFleet(req, res) {
    try {
      const userId = req.user.userId;
      const { boatId } = req.params;

      if (!boatId) {
        return res.status(400).json({
          status: "error",
          msg: "El ID del barco es requerido",
          payload: {},
        });
      }

      const result = await userService.removeBoatFromFleet(userId, boatId);
      
      if (result.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Barco removido de tu flota",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Usuario o barco no encontrado",
          payload: {},
        });
      }
    } catch (error) {
      logger.error("Error al remover barco de la flota:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error al remover barco de la flota",
        payload: {},
      });
    }
  }

  // Actualizar estado de solicitud de flota (solo administradores)
  async updateFleetRequestStatus(req, res) {
    try {
      if (req.user.category !== "Administrador") {
        return res.status(403).json({
          status: "error",
          msg: "Solo los administradores pueden actualizar el estado de las solicitudes",
          payload: {},
        });
      }

      const { userId, boatId, status } = req.body;

      if (!userId || !boatId || !status) {
        return res.status(400).json({
          status: "error",
          msg: "userId, boatId y status son requeridos",
          payload: {},
        });
      }

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          status: "error",
          msg: "Estado inválido. Debe ser: pending, approved o rejected",
          payload: {},
        });
      }

      const result = await userService.updateFleetRequestStatus(userId, boatId, status);
      
      if (result.matchedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Estado de solicitud actualizado",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Usuario o barco no encontrado",
          payload: {},
        });
      }
    } catch (error) {
      logger.error("Error al actualizar estado de solicitud:", error);
      return res.status(500).json({
        status: "error",
        msg: error.message || "Error al actualizar estado de solicitud",
        payload: {},
      });
    }
  }
}

export const usersController = new UsersController();