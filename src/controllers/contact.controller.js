import { transport } from "../utils/nodemailer.js";
import { logger } from "../utils/logger.js";

class ContactController {
  async sendContactEmail(req, res) {
    try {
      const { name, email, body } = req.body;

      // Validar campos requeridos
      if (!name || !email || !body) {
        return res.status(400).json({
          status: "error",
          msg: "Todos los campos son requeridos",
          payload: {},
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "error",
          msg: "El formato del email no es válido",
          payload: {},
        });
      }

      // Función para escapar HTML y prevenir XSS
      const escapeHtml = (text) => {
        const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };

      // Escapar los datos del usuario
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeBody = escapeHtml(body);

      // Crear el HTML del email
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; color: #ffa500;">Nuevo Mensaje de Contacto - Gestoría</h2>
          </div>
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
              <strong style="color: #082b55;">Nombre:</strong> ${safeName}
            </p>
            <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
              <strong style="color: #082b55;">Email:</strong> ${safeEmail}
            </p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffa500; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Mensaje:</p>
              <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${safeBody}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">Este mensaje fue enviado desde el formulario de contacto de la página de Gestoría de LATIAS Academia.</p>
            </div>
          </div>
        </div>
      `;

      // Enviar email
      await transport.sendMail({
        from: process.env.GOOGLE_EMAIL,
        to: "latiasacademia@gmail.com",
        replyTo: email, // Permitir responder directamente al usuario
        subject: `[LATIAS Gestoría] Nuevo mensaje de contacto de ${name}`,
        html: emailHTML,
      });

      logger.info(`Email de contacto enviado desde ${email} (${name})`);

      return res.status(200).json({
        status: "success",
        msg: "Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.",
        payload: {},
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: "Error al enviar el mensaje. Por favor, intenta nuevamente más tarde.",
        payload: {},
      });
    }
  }
}

export const contactController = new ContactController();
