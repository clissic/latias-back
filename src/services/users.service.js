import { usersModel } from "../DAO/models/users.model.js";
import { transport } from "../utils/nodemailer.js";
import { logger } from "../utils/logger.js";

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
  
    async updateOne({ _id, password, avatar, firstName, lastName, status, email, ci, phone, birth, address, statistics, settings, preferences, purchasedCourses, finishedCourses })
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