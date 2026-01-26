import { usersModel } from "../DAO/models/users.model.js";
import { boatsService } from "../services/boats.service.js";
import { transport } from "../utils/nodemailer.js";
import { logger } from "../utils/logger.js";
import { isValidPassword } from "../utils/Bcrypt.js";

class UserService {
    async getAll() {
      try {
        return await usersModel.getAll();
      } catch (error) {
        throw new Error("Failed to find users: " + error);
      }
    }
  
    async findById(id) {
      try {
        return await usersModel.findById(id);
      } catch (error) {
        throw new Error("Failed to find user by ID: " + error);
      }
    }
  
    async create({ firstName, lastName, birth, ci, email, password }) {
      try {
        return await usersModel.create({
            firstName,
            lastName,
            birth,
            ci,
            email,
            password,
        });
      } catch (error) {
        throw new Error("Failed to create a user: " + error);
      }
    }
  
    async updateOne({ _id, password, avatar, firstName, lastName, status, email, ci, phone, birth, address, statistics, settings, preferences, purchasedCourses, finishedCourses, manager })
    {
      try {
        return await usersModel.updateOne({
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
            purchasedCourses,
            finishedCourses,
            manager,
        });
      } catch (error) {
        throw new Error("Failed to update user by ID");
      }
    }
  
    async deleteOne({ _id }) {
      try {
        return await usersModel.deleteOne({ _id });
      } catch (error) {
        throw new Error("Failed to delete user by ID: " + error);
      }
    }
  
  async findByEmail(email) {
    try {
      return await usersModel.findByEmail(email);
    } catch (error) {
      throw new Error("Failed to find user by email: " + error);
    }
  }

  async findUser(email, password) {
    try {
      const user = await usersModel.findByEmail(email);
      if (!user) {
        return null;
      }
      
      // Verificar contraseña usando bcrypt
      if (!isValidPassword(password, user.password)) {
        return null;
      }
      
      return user;
    } catch (error) {
      throw new Error("Failed to authenticate user: " + error);
    }
  }
  
    async findByCi(ci) {
      try {
        return await usersModel.findByCi(ci);
      } catch (error) {
        throw new Error("Failed to find user by email: " + error);
      }
    }

    async addEventAttendedByCi(ci, eventId) {
      try {
        return await usersModel.addEventAttendedByCi(ci, eventId);
      } catch (error) {
        throw new Error("Failed to add event to eventsAttended by CI: " + error);
      }
    }

    async requestBoatToFleet(userId, boatId) {
      try {
        return await usersModel.requestBoatToFleet(userId, boatId);
      } catch (error) {
        throw new Error("Failed to request boat to fleet: " + error);
      }
    }

    async getUserFleet(userId) {
      try {
        // Buscar barcos por owner_id en lugar del array fleet del usuario
        const boats = await boatsService.findByOwner(userId);
        
        // Transformar los barcos al formato esperado por el frontend
        // El frontend espera un array con objetos que tengan boatId y status
        return boats.map(boat => ({
          _id: boat._id,
          boatId: boat,
          status: boat.isActive ? 'approved' : 'pending',
          requestedAt: boat.createdAt || new Date()
        }));
      } catch (error) {
        throw new Error("Failed to get user fleet: " + error);
      }
    }

    async updateFleetRequestStatus(userId, boatId, status) {
      try {
        return await usersModel.updateFleetRequestStatus(userId, boatId, status);
      } catch (error) {
        throw new Error("Failed to update fleet request status: " + error);
      }
    }

    async removeBoatFromFleet(userId, boatId) {
      try {
        // Verificar que el barco pertenezca al usuario antes de eliminarlo
        const boat = await boatsService.findById(boatId);
        if (!boat) {
          throw new Error("Barco no encontrado");
        }
        
        // Verificar que el barco pertenezca al usuario
        // El owner puede estar poblado (objeto) o ser solo un ObjectId
        const ownerId = boat.owner._id ? String(boat.owner._id) : String(boat.owner);
        if (ownerId !== String(userId)) {
          throw new Error("No tienes permiso para eliminar este barco");
        }
        
        // Eliminar el barco de la base de datos
        const result = await boatsService.deleteOne(boatId);
        return { matchedCount: result.deletedCount, deletedCount: result.deletedCount };
      } catch (error) {
        throw new Error("Failed to remove boat from fleet: " + error);
      }
    }
  
    async updatePassword({ email, newPassword }) {
      try {
        const userUpdated = await usersModel.updatePassword({ email, password: newPassword });
        return userUpdated;
      } catch (error) {
        throw new Error("Failed to update password: " + error);
      }
    }
  
    async updateAddress({ _id, address }) {
      try {
        return await usersModel.updateFines({ _id, address });
      } catch (error) {
        throw new Error("Failed to update fines: " + error);
      }
    }
  
    async sendDataToNewUser({ firstName, lastName, status, email }) {
      const API_URL = env.apiUrl;
      try {
        await transport.sendMail({
          from: env.googleEmail,
          to: email,
          subject: "[SIGMU] Bienvenido a SIGMU",
          html: `
                  <div>
                      <h1>LATIAS ACADEMIA</h1>
                      <p>Estimado/a:</p>
                      <h3>${status} ${firstName} ${lastName}</h3>
                      <h4>Bienvenido a la plataforma de Latias Academia</h4>
                      <h6>Esperamos que tus próximas navegaciones en nuestra academia sean con buen clima y siempre con un pie de agua debajo de la quilla...</h6>
                      <p>¡No reveles tus datos personales a nadie!</p>
                      <p>Tu credencial para el uso de la plataforma es:</p>
                      <ul>
                        <li>Email: <strong>${email}</strong></li>
                      </ul>
                      <p>La constraseña que ha elegido se encuentra encriptada y nadie puede tener acceso a ella excepto usted.</p>
                      <br>
                      <p>Se ruega no responder a este correo ya que se trata de un servicio automático de Latias Academia.</p>
                  </div>
              `,
        });
        return true;
      } catch (error) {
        logger.error("Email could not be sent successfully: " + error);
      }
    }
  }
  
  export const userService = new UserService();