import { recoverTokensService } from "../services/tokens.service.js";
import { logger } from "../utils/logger.js";

class TokensController {
  async recoverPass(req, res) {
    const { token, email, newPassword, confirmPassword } = req.body;
    try {
      if (!token || !email) {
        return res.status(400).json({ success: false, message: "Token y email son requeridos." });
      }
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "Nueva contraseña y confirmación son requeridas." });
      }
      if (newPassword !== confirmPassword) {
        return res.json({ success: false, message: "Las contraseñas deben coincidir." });
      }
      const foundToken = await recoverTokensService.findOne({ token, email });
      if (!foundToken) {
        return res.status(400).json({ success: false, message: "Token inválido." });
      }
      if (foundToken.expire < Date.now()) {
        return res.status(400).json({ success: false, message: "El token ha expirado." });
      }
      await recoverTokensService.recoverPass(email, newPassword);
      await recoverTokensService.deleteOne({ token, email });
      logger.info(email + " actualizó su contraseña con éxito!");
      res.json({ success: true, message: "Contraseña actualizada correctamente." });
    } catch (error) {
      logger.error("Error recovering password in tokens.controller: " + error);
      res.status(500).json({ success: false, message: "Error actualizando la contraseña." });
    }
  }

  async recoverForm(req, res) {
    const { token, email } = req.query;
    try {
      const foundToken = await recoverTokensService.findOne({ token, email });
      if (foundToken && foundToken.expire > Date.now()) {
        res.json({ success: true, email });
      } else {
        res.status(400).json({ success: false, message: "Tu token ha expirado o es inválido." });
      }
    } catch (error) {
      logger.error("Error finding token in login.controller: " + error);
      res.status(500).json({ success: false, message: "Error encontrando un token en login.controller." });
    }
  }

  async recoverByEmail(req, res) {
    const { email } = req.body;
    try {
      await recoverTokensService.sendRecoveryToken(email);
      res.json({ success: true, message: `Token enviado correctamente a ${email}` });
    } catch (error) {
      logger.error("Error sending email in login.controller: " + error);
      res.status(500).json({ success: false, message: "Error enviando el email en tokens.controller." });
    }
  }
}

export const tokensController = new TokensController();
