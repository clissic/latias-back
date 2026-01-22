import { eventsService } from "../services/events.service.js";
import { userService } from "../services/users.service.js";
import { ticketLogsService } from "../services/ticket-logs.service.js";
import { logger } from "../utils/logger.js";
import { transport } from "../utils/nodemailer.js";
import QRCode from "qrcode";

class EventsController {
  // ========== FUNCIONES PÚBLICAS ==========

  // Obtener todos los eventos activos (público)
  async getActive(req, res) {
    try {
      const events = await eventsService.getActive();
      return res.status(200).json({
        status: "success",
        msg: "Eventos activos obtenidos",
        payload: events,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener evento por ID (público)
  async findById(req, res) {
    try {
      const { id } = req.params;
      const event = await eventsService.findById(id);
      if (event) {
        return res.status(200).json({
          status: "success",
          msg: "Evento obtenido",
          payload: event,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Evento no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener evento por eventId (público)
  async findByEventId(req, res) {
    try {
      const { eventId } = req.params;
      const event = await eventsService.findByEventId(eventId);
      if (event) {
        return res.status(200).json({
          status: "success",
          msg: "Evento obtenido",
          payload: event,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Evento no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // ========== FUNCIONES PARA ADMINISTRADORES ==========

  // Obtener todos los eventos (para administradores)
  async getAll(req, res) {
    try {
      const events = await eventsService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "Todos los eventos obtenidos",
        payload: events,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Crear nuevo evento (para administradores)
  async create(req, res) {
    try {
      const eventData = req.body;

      // Validaciones básicas
      if (!eventData.title || !eventData.date || !eventData.hour) {
        return res.status(400).json({
          status: "error",
          msg: "Los campos title, date y hour son requeridos",
          payload: {},
        });
      }

      // eventId se genera automáticamente, no es requerido

      if (eventData.tickets && !eventData.tickets.availableTickets) {
        return res.status(400).json({
          status: "error",
          msg: "El campo tickets.availableTickets es requerido",
          payload: {},
        });
      }

      const eventCreated = await eventsService.create(eventData);
      return res.status(201).json({
        status: "success",
        msg: "Evento creado exitosamente",
        payload: eventCreated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido al crear evento");
      if (e.code === 11000) {
        // Error de duplicado (eventId único)
        return res.status(400).json({
          status: "error",
          msg: "Ya existe un evento con ese eventId. Por favor, intenta nuevamente.",
          payload: {},
        });
      }
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal al crear el evento",
        payload: {},
      });
    }
  }

  // Actualizar evento (para administradores)
  async updateOne(req, res) {
    try {
      const { eventId } = req.params;
      const updateData = req.body;

      const event = await eventsService.findByEventId(eventId);
      if (!event) {
        return res.status(404).json({
          status: "error",
          msg: "Evento no encontrado",
          payload: {},
        });
      }

      // Si se actualizan los tickets, recalcular remainingTickets
      if (updateData.tickets) {
        if (updateData.tickets.availableTickets !== undefined) {
          // Si se cambia availableTickets, recalcular remainingTickets
          const currentSold = updateData.tickets.soldTickets !== undefined 
            ? updateData.tickets.soldTickets 
            : event.tickets.soldTickets;
          updateData.tickets.remainingTickets = updateData.tickets.availableTickets - currentSold;
        } else if (updateData.tickets.soldTickets !== undefined) {
          // Si se cambia soldTickets, recalcular remainingTickets
          const currentAvailable = event.tickets.availableTickets;
          updateData.tickets.remainingTickets = currentAvailable - updateData.tickets.soldTickets;
        }
      }

      const eventUpdated = await eventsService.updateOne({
        _id: event._id,
        ...updateData,
      });

      if (eventUpdated.matchedCount > 0) {
        const updatedEvent = await eventsService.findById(event._id);
        return res.status(200).json({
          status: "success",
          msg: "Evento actualizado exitosamente",
          payload: updatedEvent,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Evento no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Eliminar evento (para administradores)
  async deleteOne(req, res) {
    try {
      const { eventId } = req.params;

      const event = await eventsService.findByEventId(eventId);
      if (!event) {
        return res.status(404).json({
          status: "error",
          msg: "Evento no encontrado",
          payload: {},
        });
      }

      const result = await eventsService.deleteOne(event._id);

      if (result.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Evento eliminado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Evento no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Comprar ticket de evento (público o autenticado)
  async purchaseTicket(req, res) {
    try {
      const { eventId } = req.params;
      const { quantity = 1 } = req.body;

      if (quantity <= 0) {
        return res.status(400).json({
          status: "error",
          msg: "La cantidad debe ser mayor a 0",
          payload: {},
        });
      }

      // Obtener datos del usuario (requiere autenticación)
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          msg: "Debes estar autenticado para comprar un ticket",
          payload: {},
        });
      }

      // Obtener datos completos del usuario
      const user = await userService.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      // Validar que el usuario tenga CI
      if (!user.ci) {
        return res.status(400).json({
          status: "error",
          msg: "Tu perfil no tiene CI registrado. Por favor, completa tu perfil antes de comprar un ticket.",
          payload: {},
        });
      }

      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        ci: user.ci,
        email: user.email
      };

      const result = await eventsService.purchaseTicket(eventId, quantity, userData);

      if (result.matchedCount > 0) {
        // Si no hay ticketId, significa que no se registró la persona (no debería pasar con autenticación)
        if (!result.ticketId) {
          return res.status(500).json({
            status: "error",
            msg: "Error al generar el ticket",
            payload: {},
          });
        }
        // Obtener el evento actualizado
        const updatedEvent = await eventsService.findByEventId(eventId);
        
        // Si hay userData, enviar email con el ticket
        if (userData && userData.email) {
          try {
            // Generar URL de verificación del ticket
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            const verificationUrl = `${frontendUrl}/verify-ticket/${result.ticketId}`;
            
            // Generar código QR como buffer para adjuntarlo al email
            let qrCodeBuffer;
            let qrCodeCid = `qr-ticket-${result.ticketId}`;
            try {
              qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
                width: 300,
                margin: 2,
                color: {
                  dark: '#082b55',
                  light: '#ffffff'
                },
                errorCorrectionLevel: 'M',
                type: 'image/png'
              });
              
              // Validar que se generó correctamente
              if (!qrCodeBuffer || !Buffer.isBuffer(qrCodeBuffer)) {
                logger.error(`Error: QR code no se generó correctamente. Tipo: ${typeof qrCodeBuffer}`);
                qrCodeBuffer = null;
              } else {
                logger.info(`QR code generado exitosamente para ticket ${result.ticketId}. Tamaño: ${qrCodeBuffer.length} bytes`);
              }
            } catch (qrError) {
              logger.error(`Error al generar QR code: ${qrError.message}`, qrError);
              // Continuar sin QR code si falla la generación
              qrCodeBuffer = null;
            }

            // Formatear fecha del evento
            const formatDate = (dateString) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            };

            // Generar HTML del email con el ticket
            const emailHTML = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                  }
                  .ticket-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  }
                  .ticket-header {
                    background-color: #082b55;
                    color: #ffa500;
                    padding: 20px;
                    border-radius: 5px;
                    text-align: center;
                    margin-bottom: 20px;
                  }
                  .ticket-header h1 {
                    margin: 0;
                    font-size: 24px;
                  }
                  .ticket-info {
                    margin: 20px 0;
                  }
                  .ticket-info p {
                    margin: 10px 0;
                    font-size: 16px;
                  }
                  .ticket-info strong {
                    color: #082b55;
                  }
                  .ticket-id {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                    margin: 20px 0;
                    border: 2px solid #082b55;
                  }
                  .ticket-id h2 {
                    margin: 0;
                    color: #082b55;
                    font-size: 20px;
                  }
                  .ticket-id code {
                    font-size: 18px;
                    color: #ffa500;
                    font-weight: bold;
                  }
                  .qr-code {
                    text-align: center;
                    margin: 30px 0;
                  }
                  .qr-code img {
                    border: 3px solid #082b55;
                    border-radius: 10px;
                    padding: 10px;
                    background-color: #ffffff;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 14px;
                  }
                </style>
              </head>
              <body>
                <div class="ticket-container">
                  <div class="ticket-header">
                    <h1>🎫 Ticket de Evento - Latias Academia</h1>
                  </div>
                  
                  <div class="ticket-info">
                    <h2 style="color: #082b55; margin-bottom: 15px;">${updatedEvent.title}</h2>
                    <p><strong>Fecha:</strong> ${formatDate(updatedEvent.date)}</p>
                    <p><strong>Hora:</strong> ${updatedEvent.hour || "No especificada"}</p>
                    ${updatedEvent.location ? `<p><strong>Ubicación:</strong> ${typeof updatedEvent.location === 'string' ? updatedEvent.location : (updatedEvent.location.city && updatedEvent.location.country ? `${updatedEvent.location.city}, ${updatedEvent.location.country}` : updatedEvent.location.address || 'N/A')}</p>` : ''}
                    ${updatedEvent.price > 0 ? `<p><strong>Precio:</strong> ${updatedEvent.currency || 'USD'} ${updatedEvent.price}</p>` : '<p><strong>Precio:</strong> Gratis</p>'}
                  </div>

                  <div class="ticket-info">
                    <h3 style="color: #082b55; margin-bottom: 10px;">Datos del Asistente</h3>
                    <p><strong>Nombre:</strong> ${userData.firstName} ${userData.lastName}</p>
                    <p><strong>CI:</strong> ${userData.ci}</p>
                  </div>

                  <div class="ticket-id">
                    <h2>ID del Ticket</h2>
                    <code>${result.ticketId}</code>
                  </div>

                  <div class="qr-code">
                    <p style="color: #082b55; font-weight: bold; margin-bottom: 10px;">Escanea este código QR para verificar tu ticket:</p>
                    ${qrCodeBuffer ? `<img src="cid:${qrCodeCid}" alt="Código QR del ticket" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />` : '<p style="color: #666; font-style: italic;">QR code no disponible</p>'}
                    <p style="margin-top: 15px; font-size: 14px; color: #666;">
                      O visita: <a href="${verificationUrl}" style="color: #082b55;">${verificationUrl}</a>
                    </p>
                  </div>

                  <div class="footer">
                    <p>Este es tu ticket oficial para el evento. Por favor, preséntalo al ingresar.</p>
                    <p>Latias Academia - Sistema de Gestión de Eventos</p>
                  </div>
                </div>
              </body>
              </html>
            `;

            // Preparar adjuntos para el email
            const mailOptions = {
              from: process.env.GOOGLE_EMAIL,
              to: userData.email,
              subject: `Ticket de Evento - ${updatedEvent.title}`,
              html: emailHTML
            };

            // Agregar adjunto del QR code si se generó correctamente
            if (qrCodeBuffer) {
              mailOptions.attachments = [{
                filename: `qr-ticket-${result.ticketId}.png`,
                content: qrCodeBuffer,
                cid: qrCodeCid,
                contentType: 'image/png',
                contentDisposition: 'inline'
              }];
              logger.info(`Adjunto QR code agregado al email con CID: ${qrCodeCid}`);
            } else {
              logger.warning(`No se pudo generar QR code para el ticket ${result.ticketId}`);
            }

            // Enviar email
            await transport.sendMail(mailOptions);

            logger.info(`Ticket enviado por email a ${userData.email} para el evento ${eventId}`);
          } catch (emailError) {
            // No fallar la compra si falla el envío del email
            logger.error(`Error al enviar email del ticket: ${emailError.message}`);
          }
        }

        return res.status(200).json({
          status: "success",
          msg: "Ticket comprado exitosamente",
          payload: {
            ticketId: result.ticketId,
            event: updatedEvent
          },
        });
      } else if (result.matchedCount > 0) {
        // Ticket comprado sin registro de persona
        const updatedEvent = await eventsService.findByEventId(eventId);
        return res.status(200).json({
          status: "success",
          msg: "Ticket comprado exitosamente",
          payload: updatedEvent,
        });
      } else {
        return res.status(400).json({
          status: "error",
          msg: "No se pudo comprar el ticket",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(400).json({
        status: "error",
        msg: e.message || "Error al comprar el ticket",
        payload: {},
      });
    }
  }

  // Desactivar eventos vencidos (para administradores o cron job)
  async deactivateExpiredEvents(req, res) {
    try {
      const result = await eventsService.deactivateExpiredEvents();
      return res.status(200).json({
        status: "success",
        msg: `${result.modifiedCount} eventos desactivados`,
        payload: { modifiedCount: result.modifiedCount },
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Verificar autenticidad de un ticket (público)
  async verifyTicket(req, res) {
    try {
      const { ticketId } = req.params;

      if (!ticketId) {
        return res.status(400).json({
          status: "error",
          msg: "Ticket ID es requerido",
          payload: {},
        });
      }

      const verification = await eventsService.verifyTicket(ticketId);

      if (!verification) {
        return res.status(404).json({
          status: "error",
          msg: "Ticket no encontrado o inválido",
          payload: {},
        });
      }

      return res.status(200).json({
        status: "success",
        msg: "Ticket válido",
        payload: verification,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: "Error al verificar el ticket",
        payload: {},
      });
    }
  }

  // Verificar ticket para usuarios checkin (protegido)
  async verifyTicketCheckin(req, res) {
    try {
      const { ticketId } = req.params;

      if (!ticketId) {
        return res.status(400).json({
          status: "error",
          msg: "Ticket ID es requerido",
          payload: {},
        });
      }

      // Verificar que el usuario es checkin
      if (req.user.category !== "checkin") {
        return res.status(403).json({
          status: "error",
          msg: "Solo usuarios checkin pueden usar este endpoint",
          payload: {},
        });
      }

      // Preparar datos del usuario checkin
      const checkinUser = {
        userId: String(req.user.userId),
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
      };

      const verification = await eventsService.verifyTicketCheckin(ticketId, checkinUser);

      if (!verification) {
        return res.status(500).json({
          status: "error",
          msg: "Error al procesar la verificación",
          payload: {},
        });
      }

      // Crear log del movimiento (siempre, incluso para tickets inválidos)
      try {
        if (verification.logData) {
          await ticketLogsService.createLog(verification.logData);
        }
      } catch (logError) {
        logger.error(`Error al crear log de ticket: ${logError?.message || logError}`);
        // No fallar la verificación si falla el log
      }

      // Si el ticket es inválido, retornar error pero con el log creado
      if (!verification.isValid) {
        return res.status(404).json({
          status: "error",
          msg: "Ticket no encontrado o inválido",
          payload: {
            isValid: false,
            processed: false
          },
        });
      }

      // Preparar respuesta
      const response = {
        event: verification.event,
        person: verification.person,
        isValid: verification.isValid,
        processed: verification.processed
      };

      let message = "Ticket válido";
      if (verification.processed) {
        message = "Ticket válido y procesado correctamente";
      } else if (verification.person?.available === false) {
        message = "Ticket ya fue utilizado anteriormente";
      }

      return res.status(200).json({
        status: "success",
        msg: message,
        payload: response,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: "Error al verificar el ticket",
        payload: {},
      });
    }
  }

  // Obtener logs de tickets (para usuarios checkin y administradores)
  async getTicketLogs(req, res) {
    try {
      // Verificar que el usuario es checkin o administrador
      if (req.user.category !== "checkin" && req.user.category !== "Administrador") {
        return res.status(403).json({
          status: "error",
          msg: "Solo usuarios checkin y administradores pueden acceder a los logs",
          payload: {},
        });
      }

      const limit = parseInt(req.query.limit) || 100;
      const logs = await ticketLogsService.getAllLogs(limit);

      return res.status(200).json({
        status: "success",
        msg: "Logs obtenidos",
        payload: logs,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: "Error al obtener los logs",
        payload: {},
      });
    }
  }
}

export const eventsController = new EventsController();
