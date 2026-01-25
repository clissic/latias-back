import { boatsService } from "../services/boats.service.js";
import { userService } from "../services/users.service.js";
import { transport } from "../utils/nodemailer.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";

class BoatsController {
  // ========== FUNCIONES PÚBLICAS ==========

  // Obtener todos los barcos activos (público)
  async getActive(req, res) {
    try {
      const boats = await boatsService.getActive();
      return res.status(200).json({
        status: "success",
        msg: "Barcos activos obtenidos",
        payload: boats,
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

  // Obtener barco por ID (público)
  async findById(req, res) {
    try {
      const { id } = req.params;
      const boat = await boatsService.findById(id);
      if (boat) {
        return res.status(200).json({
          status: "success",
          msg: "Barco obtenido",
          payload: boat,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
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

  // Obtener barco por número de registro (público)
  async findByRegistrationNumber(req, res) {
    try {
      const { registrationNumber } = req.params;
      const boat = await boatsService.findByRegistrationNumber(registrationNumber);
      if (boat) {
        return res.status(200).json({
          status: "success",
          msg: "Barco obtenido",
          payload: boat,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
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

  // Obtener barcos por propietario (autenticado)
  async findByOwner(req, res) {
    try {
      const { ownerId } = req.params;
      const boats = await boatsService.findByOwner(ownerId);
      return res.status(200).json({
        status: "success",
        msg: "Barcos del propietario obtenidos",
        payload: boats,
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

  // ========== FUNCIONES PARA ADMINISTRADORES ==========

  // Obtener todos los barcos (para administradores)
  async getAll(req, res) {
    try {
      const boats = await boatsService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "Todos los barcos obtenidos",
        payload: boats,
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

  // Crear nuevo barco
  async create(req, res) {
    try {
      const boatData = req.body;

      // Validar campos requeridos
      if (!boatData.owner || !boatData.name || !boatData.registrationNumber || 
          !boatData.registrationCountry || !boatData.registrationPort || 
          !boatData.boatType || !boatData.lengthOverall || !boatData.beam) {
        return res.status(400).json({
          status: "error",
          msg: "Todos los campos requeridos deben estar presentes",
          payload: {},
        });
      }

      const boatCreated = await boatsService.create(boatData);
      return res.status(201).json({
        status: "success",
        msg: "Barco creado exitosamente",
        payload: boatCreated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      // Manejar errores específicos
      if (e.message?.includes("Ya existe un barco")) {
        return res.status(409).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      if (e.message?.includes("requerido") || e.message?.includes("inválido") || 
          e.message?.includes("negativa") || e.message?.includes("negativo")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al crear el barco",
        payload: {},
      });
    }
  }

  // Actualizar barco
  async updateOne(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          status: "error",
          msg: "ID del barco es requerido",
          payload: {},
        });
      }

      const boatUpdated = await boatsService.updateOne({ _id: id, ...updateData });
      
      if (!boatUpdated) {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }

      return res.status(200).json({
        status: "success",
        msg: "Barco actualizado exitosamente",
        payload: boatUpdated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      // Manejar errores específicos
      if (e.message?.includes("Ya existe otro barco")) {
        return res.status(409).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      if (e.message?.includes("requerido") || e.message?.includes("inválido") || 
          e.message?.includes("negativa") || e.message?.includes("negativo")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al actualizar el barco",
        payload: {},
      });
    }
  }

  // Eliminar barco
  async deleteOne(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: "error",
          msg: "ID del barco es requerido",
          payload: {},
        });
      }

      const result = await boatsService.deleteOne(id);

      if (result?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Barco eliminado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al eliminar el barco",
        payload: {},
      });
    }
  }

  // Activar/Desactivar barco
  async toggleActive(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: "error",
          msg: "ID del barco es requerido",
          payload: {},
        });
      }

      const boat = await boatsService.toggleActive(id);

      if (!boat) {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }

      return res.status(200).json({
        status: "success",
        msg: `Barco ${boat.isActive ? 'activado' : 'desactivado'} exitosamente`,
        payload: boat,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al cambiar el estado del barco",
        payload: {},
      });
    }
  }

  // Solicitar registro de barco (público para usuarios autenticados)
  async requestRegistration(req, res) {
    try {
      const boatData = req.body;
      const userId = req.user.userId;

      // Validar campos requeridos
      if (!boatData.name || !boatData.registrationNumber || !boatData.registrationCountry || 
          !boatData.registrationPort || !boatData.boatType || !boatData.lengthOverall || !boatData.beam) {
        return res.status(400).json({
          status: "error",
          msg: "Todos los campos requeridos deben estar presentes",
          payload: {},
        });
      }

      // Agregar el owner al boatData
      boatData.owner = userId;

      // Crear barco con isActive: false
      const boatCreated = await boatsService.requestRegistration(boatData);

      // Obtener información del usuario solicitante
      const user = await userService.findById(userId);
      
      // Obtener todos los administradores
      const admins = await userService.getAll();
      const adminEmails = admins
        .filter(admin => admin.category === "Administrador")
        .map(admin => admin.email);

      if (adminEmails.length > 0) {
        // Generar token único para aprobar/rechazar
        const approvalToken = crypto.randomBytes(32).toString('hex');
        const rejectionToken = crypto.randomBytes(32).toString('hex');

        // Guardar tokens en el barco (necesitamos agregar estos campos al modelo)
        // Por ahora, usaremos el _id del barco para generar URLs únicas
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const approvalUrl = `${frontendUrl}/boat-registration/approve/${boatCreated._id}?token=${approvalToken}`;
        const rejectionUrl = `${frontendUrl}/boat-registration/reject/${boatCreated._id}?token=${rejectionToken}`;

        // Crear HTML del email
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
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                background-color: #082b55;
                color: #ffa500;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
                margin-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .info-section {
                margin: 20px 0;
              }
              .info-section h2 {
                color: #082b55;
                margin-bottom: 15px;
              }
              .info-section p {
                margin: 10px 0;
                font-size: 16px;
              }
              .info-section strong {
                color: #082b55;
              }
              .buttons {
                text-align: center;
                margin: 30px 0;
              }
              .btn {
                display: inline-block;
                padding: 12px 30px;
                margin: 10px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
              }
              .btn-approve {
                background-color: #28a745;
                color: #ffffff;
              }
              .btn-reject {
                background-color: #dc3545;
                color: #ffffff;
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
            <div class="container">
              <div class="header">
                <h1>🚢 Solicitud de Registro de Barco</h1>
              </div>
              
              <div class="info-section">
                <h2>Información del Solicitante</h2>
                <p><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>CI:</strong> ${user.ci}</p>
              </div>

              <div class="info-section">
                <h2>Información del Barco</h2>
                <p><strong>Nombre:</strong> ${boatCreated.name}</p>
                <p><strong>Número de Registro:</strong> ${boatCreated.registrationNumber}</p>
                <p><strong>País de Registro:</strong> ${boatCreated.registrationCountry}</p>
                <p><strong>Puerto de Registro:</strong> ${boatCreated.registrationPort}</p>
                <p><strong>Tipo:</strong> ${boatCreated.boatType}</p>
                <p><strong>Eslora:</strong> ${boatCreated.lengthOverall}m</p>
                <p><strong>Manga:</strong> ${boatCreated.beam}m</p>
                ${boatCreated.depth ? `<p><strong>Calado:</strong> ${boatCreated.depth}m</p>` : ''}
                ${boatCreated.displacement ? `                <p><strong>Desplazamiento:</strong> ${boatCreated.displacement}t</p>` : ''}
                ${boatCreated.currentPort ? `<p><strong>Puerto Actual:</strong> ${boatCreated.currentPort}</p>` : ''}
              </div>

              <div class="buttons">
                <a href="${approvalUrl}" class="btn btn-approve">✅ Aprobar Registro</a>
                <a href="${rejectionUrl}" class="btn btn-reject">❌ Rechazar Registro</a>
              </div>

              <div class="footer">
                <p>Este es un email automático. Por favor, no responda a este mensaje.</p>
                <p>Latias Academia - Sistema de Gestión de Barcos</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Enviar email a todos los administradores
        for (const adminEmail of adminEmails) {
          try {
            await transport.sendMail({
              from: process.env.GOOGLE_EMAIL,
              to: adminEmail,
              subject: `Solicitud de Registro de Barco - ${boatCreated.name}`,
              html: emailHTML
            });
            logger.info(`Email de solicitud de barco enviado a ${adminEmail}`);
          } catch (emailError) {
            logger.error(`Error al enviar email a ${adminEmail}: ${emailError.message}`);
          }
        }
      }

      return res.status(201).json({
        status: "success",
        msg: "Solicitud de registro enviada. Un administrador la revisará.",
        payload: boatCreated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      if (e.message?.includes("Ya existe un barco")) {
        return res.status(409).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      if (e.message?.includes("requerido") || e.message?.includes("inválido") || 
          e.message?.includes("negativa") || e.message?.includes("negativo")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al solicitar el registro",
        payload: {},
      });
    }
  }

  // Aprobar registro de barco (público con token)
  async approveRegistration(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          status: "error",
          msg: "Token de confirmación requerido",
          payload: {},
        });
      }

      // Buscar el barco
      const boat = await boatsService.findById(id);
      if (!boat) {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }

      if (boat.isActive) {
        return res.status(400).json({
          status: "error",
          msg: "Este barco ya ha sido aprobado",
          payload: {},
        });
      }

      // Actualizar isActive a true
      const boatUpdated = await boatsService.updateOne({ _id: id, isActive: true });

      if (!boatUpdated) {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }

      // Obtener información del propietario para notificar
      const owner = await userService.findById(boat.owner);
      if (owner && owner.email) {
        try {
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
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 10px;
                  padding: 30px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                  background-color: #28a745;
                  color: #ffffff;
                  padding: 20px;
                  border-radius: 5px;
                  text-align: center;
                  margin-bottom: 20px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .info-section {
                  margin: 20px 0;
                }
                .info-section p {
                  margin: 10px 0;
                  font-size: 16px;
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
              <div class="container">
                <div class="header">
                  <h1>✅ Registro de Barco Aprobado</h1>
                </div>
                
                <div class="info-section">
                  <p>Estimado/a <strong>${owner.firstName} ${owner.lastName}</strong>,</p>
                  <p>Nos complace informarle que su solicitud de registro del barco <strong>${boat.name}</strong> ha sido <strong>APROBADA</strong>.</p>
                  <p>Su barco ya está registrado en el sistema y puede gestionarlo desde su panel de Flota.</p>
                </div>

                <div class="footer">
                  <p>Este es un email automático. Por favor, no responda a este mensaje.</p>
                  <p>Latias Academia - Sistema de Gestión de Barcos</p>
                </div>
              </div>
            </body>
            </html>
          `;

          await transport.sendMail({
            from: process.env.GOOGLE_EMAIL,
            to: owner.email,
            subject: `Registro de Barco Aprobado - ${boat.name}`,
            html: emailHTML
          });
        } catch (emailError) {
          logger.error(`Error al enviar email de aprobación: ${emailError.message}`);
        }
      }

      return res.status(200).json({
        status: "success",
        msg: "Registro de barco aprobado exitosamente",
        payload: boatUpdated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al aprobar el registro",
        payload: {},
      });
    }
  }

  // Rechazar registro de barco (público con token)
  async rejectRegistration(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          status: "error",
          msg: "Token de confirmación requerido",
          payload: {},
        });
      }

      // Buscar el barco
      const boat = await boatsService.findById(id);
      if (!boat) {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }

      // Obtener información del propietario antes de borrar
      const owner = await userService.findById(boat.owner);

      // Eliminar el barco
      const result = await boatsService.deleteOne(id);

      if (result?.deletedCount > 0) {
        // Enviar email de notificación al propietario
        if (owner && owner.email) {
          try {
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
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  }
                  .header {
                    background-color: #dc3545;
                    color: #ffffff;
                    padding: 20px;
                    border-radius: 5px;
                    text-align: center;
                    margin-bottom: 20px;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 24px;
                  }
                  .info-section {
                    margin: 20px 0;
                  }
                  .info-section p {
                    margin: 10px 0;
                    font-size: 16px;
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
                <div class="container">
                  <div class="header">
                    <h1>❌ Registro de Barco Rechazado</h1>
                  </div>
                  
                  <div class="info-section">
                    <p>Estimado/a <strong>${owner.firstName} ${owner.lastName}</strong>,</p>
                    <p>Lamentamos informarle que su solicitud de registro del barco <strong>${boat.name}</strong> ha sido <strong>RECHAZADA</strong>.</p>
                    <p>Si tiene alguna consulta, por favor contacte con la administración.</p>
                  </div>

                  <div class="footer">
                    <p>Este es un email automático. Por favor, no responda a este mensaje.</p>
                    <p>Latias Academia - Sistema de Gestión de Barcos</p>
                  </div>
                </div>
              </body>
              </html>
            `;

            await transport.sendMail({
              from: process.env.GOOGLE_EMAIL,
              to: owner.email,
              subject: `Registro de Barco Rechazado - ${boat.name}`,
              html: emailHTML
            });
          } catch (emailError) {
            logger.error(`Error al enviar email de rechazo: ${emailError.message}`);
          }
        }

        return res.status(200).json({
          status: "success",
          msg: "Registro de barco rechazado y eliminado",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Barco no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al rechazar el registro",
        payload: {},
      });
    }
  }
}

export const boatsController = new BoatsController();
