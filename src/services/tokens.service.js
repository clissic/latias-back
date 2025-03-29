import { createHash } from "../utils/Bcrypt.js";
import { logger } from "../utils/logger.js";
import { transport } from "../utils/nodemailer.js";
import { generateRandomCode } from "../utils/random-code.js";
import { usersModel } from "../DAO/models/users.model.js";
import { recoverTokensModel } from "../DAO/models/tokens.model.js";

class RecoverTokensService {
  async create({token, email, expire}) {
    try {
      await recoverTokensModel.create({token, email, expire});
    } catch (error) {
      logger.error("Error creating recover token in tokens.service: " + error);
    }
  }

  async findOne({token, email}) {
    try {
      const recoverTokenFound = await recoverTokensModel.findOne({token, email});
      return recoverTokenFound;
    } catch (error) {
      logger.error("Error finding recover token in tokens.service: " + error);
    }
  }

  async recoverPass(email, newPassword) {
    try {
      const password = createHash(newPassword)
      await usersModel.updatePassword({email, password});
    } catch (error) {
      logger.error("Error recovering password in login.service: " + error);
    }
  }

  async sendRecoveryToken(email) {
    const user = await usersModel.findByEmail(email);
    const token = generateRandomCode();
    const expire = Date.now() + 3600000;
    const savedToken = await recoverTokensModel.create({
      token: token,
      email: email,
      expire: expire,
    });
    const API_URL = process.env.API_URL;
    if (user) {
      const result = await transport.sendMail({
        from: process.env.GOOGLE_EMAIL,
        to: email,
        subject: "[LATIAS] Recuperación de contraseña",
        html: `
                <div>
                    <h1>LATIAS ACADEMIA</h1>
                    <p>Tu token de recuperación de contraseña es:</p>
                    <h3>${token}</h3>
                    <p>Ten en cuenta que este token caducará pasada 1 (una) hora desde su generación.</p>
                    <strong>Para continuar con la recuperación de contraseña, por favor haga click <a href="${API_URL}/reset-password?token=${token}&email=${email}">en este link</a>.</strong>
                    <p>Si no solicitaste la recuperación de tu contraseña, no hagas caso a este email.</p>
                </div>
            `,
      });
    } else {
      logger.error(`Email ${email} does not exist in DB`);
    }
  }
}

export const recoverTokensService = new RecoverTokensService();