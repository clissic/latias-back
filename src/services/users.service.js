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
  
    async create({ firstName, lastName, birth, ci, email, password, category }) {
      try {
        const categoryArr = Array.isArray(category) ? category : (category != null ? [category] : undefined);
        return await usersModel.create({
            firstName,
            lastName,
            birth,
            ci,
            email,
            password,
            ...(categoryArr && { category: categoryArr }),
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

  async getByCategory(category) {
    try {
      return await usersModel.findByCategory(category);
    } catch (error) {
      throw new Error("Failed to find users by category: " + error);
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

    /** Clientes que tienen a este usuario como gestor. Solo para categoría Gestor. Incluye fleetCount (barcos del cliente). */
    async getClientsByManagerId(managerId) {
      try {
        const list = await usersModel.findClientsByManagerId(managerId);
        const withCount = await Promise.all(
          list.map(async (client) => {
            const fleetCount = await boatsService.countActiveByOwner(client._id);
            return { ...client, fleetCount };
          })
        );
        return withCount;
      } catch (error) {
        throw new Error("Failed to get clients by manager: " + error);
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

    /**
     * Envía email de confirmación de compra de curso al usuario.
     * @param {Object} options
     * @param {string} options.to - Email del usuario
     * @param {string} options.userName - Nombre del usuario (ej. "Juan Pérez")
     * @param {string} options.courseName - Nombre del curso comprado
     * @param {string} options.paymentId - ID del pago (Mercado Pago o DEV-...)
     * @param {number} options.amount - Monto pagado
     * @param {string} options.currency - Moneda (USD, UYU, etc.)
     * @param {string} options.courseId - ID del curso para el enlace "Ir al curso"
     */
    async sendPurchaseConfirmationEmail({ to, userName, courseName, paymentId, amount, currency, courseId }) {
      if (!to) return false;
      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/$/, "");
      const courseLink = `${frontendUrl}/course/${courseId || ""}`;
      const amountStr = amount != null ? Number(amount).toFixed(2) : "—";
      const currencyStr = currency || "USD";
      try {
        await transport.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to,
          subject: "[LATIAS] Confirmación de compra - " + (courseName || "Curso"),
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: #ffa500;">Confirmación de compra</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">LATIAS Academia</p>
              </div>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Estimado/a ${userName || "usuario"},</p>
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Tu compra ha sido procesada correctamente. Ya tienes acceso al curso.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Detalles de la compra</p>
                  <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 15px;">
                    <li style="margin: 6px 0;"><strong>Curso:</strong> ${courseName || "—"}</li>
                    <li style="margin: 6px 0;"><strong>ID de pago:</strong> ${paymentId || "—"}</li>
                    <li style="margin: 6px 0;"><strong>Monto:</strong> ${amountStr} ${currencyStr}</li>
                  </ul>
                </div>
                <p style="margin: 20px 0 0 0; color: #333; font-size: 16px;">Puedes acceder al curso desde tu panel o haciendo clic en el siguiente enlace:</p>
                <p style="margin: 15px 0 0 0;"><a href="${courseLink}" style="display: inline-block; background-color: #ffa500; color: #082b55; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ir al curso</a></p>
                <p style="margin: 25px 0 0 0; color: #666; font-size: 14px;">Si no realizaste esta compra, contacta con nosotros.</p>
              </div>
            </div>
          `,
        });
        logger.info(`Email de confirmación de compra enviado a ${to} (curso: ${courseName})`);
        return true;
      } catch (err) {
        logger.error("Error al enviar email de confirmación de compra:", err?.message);
        return false;
      }
    }

    /**
     * Envía email al gestor informando que fue seleccionado por un usuario.
     * @param {Object} options
     * @param {string} options.to - Email del gestor
     * @param {Object} options.clientUser - Datos del usuario que lo seleccionó (firstName, lastName, email, phone). No se incluye dirección por privacidad.
     * @param {string} options.jurisdictionName - Nombre de la jurisdicción por la que fue elegido (ej. "Uruguay")
     */
    async sendGestorAssignedEmail({ to, clientUser, jurisdictionName }) {
      if (!to) return false;
      const firstName = clientUser?.firstName ?? "—";
      const lastName = clientUser?.lastName ?? "—";
      const email = clientUser?.email ?? "—";
      const phone = clientUser?.phone ?? "No indicado";
      try {
        await transport.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to,
          subject: "[LATIAS] Has sido seleccionado/a como gestor",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: #ffa500;">Has sido seleccionado/a como gestor</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">LATIAS Academia</p>
              </div>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Estimado/a gestor/a,</p>
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Un usuario de la plataforma te ha seleccionado como su gestor.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Jurisdicción</p>
                  <p style="margin: 0; color: #333; font-size: 15px;">Por la que fuiste elegido/a: <strong>${jurisdictionName || "No indicada"}</strong></p>
                  <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">En el futuro un mismo gestor puede estar en varias jurisdicciones; esta asignación corresponde a la jurisdicción indicada.</p>
                </div>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #082b55; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Datos del usuario que te seleccionó</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Nombre:</strong> ${firstName} ${lastName}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Email:</strong> ${email}</p>
                  <p style="margin: 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Teléfono:</strong> ${phone}</p>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                  <p style="margin: 0;">Este es un correo automático. Por favor, no respondas a este mensaje.</p>
                  <p style="margin: 8px 0 0 0;">LATIAS Academia</p>
                </div>
              </div>
            </div>
          `,
        });
        logger.info(`Email de asignación como gestor enviado a ${to}`);
        return true;
      } catch (error) {
        logger.error("Error al enviar email al gestor asignado: " + error?.message);
        return false;
      }
    }

    /**
     * Envía email al gestor con solicitud de trámite por certificado (renovación/preparación/asesoramiento) o solicitud especial.
     * @param {Object} options
     * @param {string} options.to - Email del gestor
     * @param {Object} options.requester - Usuario que solicita (firstName, lastName, email, phone)
     * @param {Object} options.boat - Barco (name, registrationNumber, boatType, displacement, registrationCountry, currentPort)
     * @param {Object} [options.certificate] - Certificado (certificateType, number, issueDate, expirationDate); omitir para solicitud especial
     * @param {string[]} options.types - Tipos de trámite: Renovación, Preparación, Asesoramiento, Solicitud especial
     * @param {string} [options.notes] - Cuerpo/detalle de la solicitud (usado en solicitud especial; reemplaza el bloque de certificado)
     */
    async sendGestorCertificateRequestEmail({ to, requester, boat, certificate, types, notes }) {
      if (!to) return false;
      const reqName = [requester?.firstName, requester?.lastName].filter(Boolean).join(" ") || "—";
      const reqEmail = requester?.email ?? "—";
      const reqPhone = requester?.phone ?? "No indicado";
      const boatName = boat?.name ?? "—";
      const boatReg = boat?.registrationNumber ?? "—";
      const boatType = boat?.boatType ?? "—";
      const boatDisplacement = boat?.displacement != null && boat?.displacement !== "" ? String(boat.displacement) : "—";
      const boatFlag = boat?.registrationCountry ?? "—";
      const boatLocation = boat?.currentPort ?? "—";
      const certType = certificate?.certificateType ?? "—";
      const certNumber = certificate?.number ?? "—";
      const certIssue = certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
      const certExp = certificate?.expirationDate ? new Date(certificate.expirationDate).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
      const typesStr = Array.isArray(types) && types.length > 0 ? types.join(", ") : "—";
      const isSpecialRequest = notes != null && String(notes).trim() !== "";
      const escapeHtml = (s) => String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/\n/g, "<br />");
      const notesHtml = isSpecialRequest ? escapeHtml(notes).trim() : "";

      const introText = isSpecialRequest
        ? "Un usuario de la plataforma ha realizado una solicitud especial relacionada con el siguiente barco."
        : "Un usuario de la plataforma ha solicitado que gestiones un trámite relacionado con el certificado del siguiente barco.";

      const certificateBlock = `
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #082b55; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Información del certificado:</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Tipo:</strong> ${certType}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Número:</strong> ${certNumber}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Emisión:</strong> ${certIssue}</p>
                  <p style="margin: 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Vencimiento:</strong> ${certExp}</p>
                </div>`;
      const notesBlock = isSpecialRequest ? `
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #082b55; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Detalle de la solicitud:</p>
                  <p style="margin: 0; color: #333; font-size: 15px; white-space: pre-wrap;">${notesHtml}</p>
                </div>` : "";

      try {
        await transport.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to,
          subject: "[LATIAS] Solicitud de trámite de certificado",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: #ffa500;">Solicitud de trámite de certificado</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">LATIAS Academia</p>
              </div>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Estimado/a gestor/a,</p>
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">${introText}</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Tipos de trámites solicitados:</p>
                  <p style="margin: 0; color: #333; font-size: 15px;">${typesStr}</p>
                </div>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #082b55; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Datos del solicitante:</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Nombre:</strong> ${reqName}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Email:</strong> ${reqEmail}</p>
                  <p style="margin: 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Teléfono:</strong> ${reqPhone}</p>
                </div>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 10px 0; color: #082b55; font-weight: bold; font-size: 16px;">Datos del barco:</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Nombre:</strong> ${boatName}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Nº de registro:</strong> ${boatReg}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Tipo:</strong> ${boatType}</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Desplazamiento:</strong> ${boatDisplacement} toneladas</p>
                  <p style="margin: 0 0 8px 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Bandera:</strong> ${boatFlag}</p>
                  <p style="margin: 0; color: #333; font-size: 15px;"><strong style="color: #082b55;">Ubicación:</strong> ${boatLocation}</p>
                </div>
                ${isSpecialRequest ? notesBlock : certificateBlock}
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                  <p style="margin: 0;">Este es un correo automático. Por favor, no respondas a este mensaje.</p>
                  <p style="margin: 8px 0 0 0;">LATIAS Academia</p>
                </div>
              </div>
            </div>
          `,
        });
        logger.info(`Email de solicitud de certificado enviado al gestor ${to}`);
        return true;
      } catch (error) {
        logger.error("Error al enviar email de solicitud de certificado al gestor: " + error?.message);
        return false;
      }
    }

    /**
     * Envía email al cliente (owner) informando el cambio de estado de su solicitud al gestor.
     * @param {Object} options
     * @param {string} options.to - Email del cliente
     * @param {string} options.ownerName - Nombre del cliente
     * @param {string} options.boatName - Nombre del barco
     * @param {string} options.newStatus - Nuevo estado: "En progreso", "Completado", "Rechazado"
     * @param {string} [options.rejectionReason] - Motivo del rechazo (solo si newStatus === "Rechazado")
     */
    async sendShipRequestStatusChangeEmail({ to, ownerName, boatName, newStatus, rejectionReason }) {
      if (!to) return false;
      const name = ownerName || "Cliente";
      const boat = boatName || "su barco";
      const statusLabel = { "En progreso": "en progreso", "Completado": "completado", "Rechazado": "rechazado" }[newStatus] || newStatus;
      const isRechazado = newStatus === "Rechazado";
      const motivoBlock = isRechazado && rejectionReason
        ? `<div style="margin: 20px 0; padding: 15px; background-color: #fff3f3; border-left: 4px solid #dc3545; border-radius: 4px;">
             <p style="margin: 0 0 8px 0; color: #082b55; font-weight: bold; font-size: 16px;">Motivo del rechazo</p>
             <p style="margin: 0; color: #333; font-size: 15px;">${String(rejectionReason).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
           </div>`
        : "";
      try {
        await transport.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to,
          subject: `[LATIAS] Su solicitud ha sido ${statusLabel}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: #ffa500;">Actualización de su solicitud</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">LATIAS Academia</p>
              </div>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Estimado/a ${name},</p>
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Su gestor ha actualizado el estado de la solicitud relacionada con el barco <strong>${boat}</strong>.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0; color: #082b55; font-weight: bold; font-size: 16px;">Nuevo estado</p>
                  <p style="margin: 0; color: #333; font-size: 15px;">La solicitud ha sido marcada como <strong>${statusLabel}</strong>.</p>
                </div>
                ${motivoBlock}
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                  <p style="margin: 0;">Este es un correo automático. Por favor, no respondas a este mensaje.</p>
                  <p style="margin: 8px 0 0 0;">LATIAS Academia</p>
                </div>
              </div>
            </div>
          `,
        });
        logger.info(`Email de cambio de estado de solicitud enviado al cliente ${to}`);
        return true;
      } catch (error) {
        logger.error("Error al enviar email de cambio de estado al cliente: " + error?.message);
        return false;
      }
    }

    /**
     * Envía email al cliente informando que su gestor lo ha desvinculado y los motivos.
     * @param {Object} options
     * @param {string} options.to - Email del cliente
     * @param {string} options.clientName - Nombre del cliente
     * @param {string} options.gestorName - Nombre del gestor
     * @param {string} options.reason - Motivos de desvinculación
     */
    async sendClientUnlinkedByGestorEmail({ to, clientName, gestorName, reason }) {
      if (!to) return false;
      const name = clientName || "Cliente";
      const gestor = gestorName || "Su gestor";
      const reasonSafe = reason ? String(reason).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
      try {
        await transport.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to,
          subject: "[LATIAS] Desvinculación con tu gestor",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: #ffa500;">Desvinculación con tu gestor</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">LATIAS Academia</p>
              </div>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Estimado/a ${name},</p>
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">${gestor} ha decidido desvincularse como tu gestor en la plataforma LATIAS.</p>
                ${reasonSafe ? `
                <div style="margin: 20px 0; padding: 15px; background-color: #fff9f0; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0; color: #082b55; font-weight: bold; font-size: 16px;">Motivos indicados</p>
                  <p style="margin: 0; color: #333; font-size: 15px;">${reasonSafe}</p>
                </div>
                ` : ""}
                <p style="margin: 15px 0 0 0; color: #333; font-size: 16px;">Puedes asignar un nuevo gestor desde <strong>Mi Latias → General</strong> cuando lo desees.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                  <p style="margin: 0;">Este es un correo automático. Por favor, no respondas a este mensaje.</p>
                  <p style="margin: 8px 0 0 0;">LATIAS Academia</p>
                </div>
              </div>
            </div>
          `,
        });
        logger.info(`Email de desvinculación enviado al cliente ${to}`);
        return true;
      } catch (error) {
        logger.error("Error al enviar email de desvinculación al cliente: " + error?.message);
        return false;
      }
    }

    /**
     * Envía email al gestor informando que un cliente lo ha desvinculado y los motivos.
     * @param {Object} options
     * @param {string} options.to - Email del gestor
     * @param {string} options.gestorName - Nombre del gestor
     * @param {string} options.clientName - Nombre del cliente
     * @param {string} options.reason - Motivos de desvinculación
     */
    async sendGestorUnlinkedByClientEmail({ to, gestorName, clientName, reason }) {
      if (!to) return false;
      const name = gestorName || "Gestor";
      const client = clientName || "Un cliente";
      const reasonSafe = reason ? String(reason).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
      try {
        await transport.sendMail({
          from: process.env.GOOGLE_EMAIL,
          to,
          subject: "[LATIAS] Un cliente te ha desvinculado",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: #082b55; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: #ffa500;">Desvinculación de cliente</h2>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">LATIAS Academia</p>
              </div>
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Estimado/a ${name},</p>
                <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">El/La cliente <strong>${client}</strong> ha decidido desvincularse de ti como gestor en la plataforma LATIAS.</p>
                ${reasonSafe ? `
                <div style="margin: 20px 0; padding: 15px; background-color: #fff9f0; border-left: 4px solid #ffa500; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0; color: #082b55; font-weight: bold; font-size: 16px;">Motivos indicados</p>
                  <p style="margin: 0; color: #333; font-size: 15px;">${reasonSafe}</p>
                </div>
                ` : ""}
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                  <p style="margin: 0;">Este es un correo automático. Por favor, no respondas a este mensaje.</p>
                  <p style="margin: 8px 0 0 0;">LATIAS Academia</p>
                </div>
              </div>
            </div>
          `,
        });
        logger.info(`Email de desvinculación enviado al gestor ${to}`);
        return true;
      } catch (error) {
        logger.error("Error al enviar email de desvinculación al gestor: " + error?.message);
        return false;
      }
    }
  }
  
  export const userService = new UserService();