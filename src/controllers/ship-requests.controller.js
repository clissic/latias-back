import { shipRequestsService } from "../services/ship-requests.service.js";
import { userService } from "../services/users.service.js";
import { usersModel } from "../DAO/models/users.model.js";
import { boatsModel } from "../DAO/models/boats.model.js";
import { logger } from "../utils/logger.js";

class ShipRequestsController {
  async create(req, res) {
    try {
      const { ship, owner, manager, type, types, notes } = req.body;
      const userId = req.user?.userId;
      const ownerId = owner || userId;
      const typeArray = Array.isArray(types) ? types : (Array.isArray(type) ? type : type != null ? [type] : []);

      const request = await shipRequestsService.create({
        ship,
        owner: ownerId,
        manager,
        type: types ?? type,
        notes: notes || null,
      });

      const isSpecialRequest = typeArray.some((t) => String(t).trim() === "Solicitud especial");
      const managerEmail = request?.manager?.email;
      if (isSpecialRequest && managerEmail) {
        const ownerUser = await usersModel.findById(ownerId);
        const boat = await boatsModel.findById(request.ship?._id || ship);
        if (ownerUser && boat) {
          await userService.sendGestorCertificateRequestEmail({
            to: managerEmail,
            requester: {
              firstName: ownerUser.firstName,
              lastName: ownerUser.lastName,
              email: ownerUser.email,
              phone: ownerUser.phone,
            },
            boat: {
              name: boat.name,
              registrationNumber: boat.registrationNumber,
              boatType: boat.boatType,
              displacement: boat.displacement,
              registrationCountry: boat.registrationCountry,
              currentPort: boat.currentPort,
            },
            certificate: null,
            types: typeArray,
            notes: request.notes || "",
          });
        }
      }

      return res.status(201).json({
        status: "success",
        msg: "Solicitud de trabajo creada",
        payload: request,
      });
    } catch (e) {
      logger.error("ship-requests create:", e?.message || e);
      return res.status(400).json({
        status: "error",
        msg: e?.message || "Error al crear la solicitud",
        payload: {},
      });
    }
  }

  /**
   * Crea una solicitud desde certificado (flota) y envía email al gestor.
   * Body: { shipId, certificate: {...}, types: [...], notes?: string }
   */
  async createFromCertificate(req, res) {
    try {
      const userId = req.user?.userId;
      const { shipId, certificate, types, notes: userNotes } = req.body;

      if (!shipId || !certificate || !Array.isArray(types) || types.length === 0) {
        return res.status(400).json({
          status: "error",
          msg: "shipId, certificate y types (array no vacío) son requeridos",
          payload: {},
        });
      }

      const owner = await usersModel.findById(userId);
      if (!owner) {
        return res.status(404).json({ status: "error", msg: "Usuario no encontrado", payload: {} });
      }
      const managerId = owner.manager?.managerId;
      if (!managerId) {
        return res.status(400).json({
          status: "error",
          msg: "No tienes un gestor asignado. Asigna un gestor desde General en Mi Latias.",
          payload: {},
        });
      }

      const certRef = `Certificado: ${certificate.certificateType || ""} Nº ${certificate.number || ""}`;
      const notes = (userNotes && String(userNotes).trim())
        ? `${String(userNotes).trim()} | ${certRef}`
        : certRef;

      const request = await shipRequestsService.create({
        ship: shipId,
        owner: userId,
        manager: managerId,
        type: types,
        notes,
      });

      const boat = await boatsModel.findById(shipId);
      const managerUser = await userService.findById(managerId);
      if (managerUser?.email) {
        await userService.sendGestorCertificateRequestEmail({
          to: managerUser.email,
          requester: {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.email,
            phone: owner.phone,
          },
          boat: boat
            ? {
                name: boat.name,
                registrationNumber: boat.registrationNumber,
                boatType: boat.boatType,
                displacement: boat.displacement,
                registrationCountry: boat.registrationCountry,
                currentPort: boat.currentPort,
              }
            : { name: "—", registrationNumber: "—", boatType: "—", displacement: "—", registrationCountry: "—", currentPort: "—" },
          certificate: {
            certificateType: certificate.certificateType,
            number: certificate.number,
            issueDate: certificate.issueDate,
            expirationDate: certificate.expirationDate,
          },
          types,
        });
      }

      return res.status(201).json({
        status: "success",
        msg: "Solicitud enviada. El gestor recibirá un correo con los datos.",
        payload: request,
      });
    } catch (e) {
      logger.error("ship-requests createFromCertificate:", e?.message || e);
      return res.status(400).json({
        status: "error",
        msg: e?.message || "Error al crear la solicitud",
        payload: {},
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const request = await shipRequestsService.getById(id);
      return res.status(200).json({
        status: "success",
        msg: "Solicitud obtenida",
        payload: request,
      });
    } catch (e) {
      logger.error("ship-requests getById:", e?.message || e);
      const status = e?.message === "Solicitud no encontrada" ? 404 : 500;
      return res.status(status).json({
        status: "error",
        msg: e?.message || "Error al obtener la solicitud",
        payload: {},
      });
    }
  }

  async getAll(req, res) {
    try {
      const { status, owner, manager, ship } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (owner) filters.owner = owner;
      if (manager) filters.manager = manager;
      if (ship) filters.ship = ship;

      const list = await shipRequestsService.getAll(filters);
      return res.status(200).json({
        status: "success",
        msg: "Solicitudes obtenidas",
        payload: list,
      });
    } catch (e) {
      logger.error("ship-requests getAll:", e?.message || e);
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al listar solicitudes",
        payload: {},
      });
    }
  }

  async getByOwner(req, res) {
    try {
      const { ownerId } = req.params;
      const list = await shipRequestsService.getByOwner(ownerId);
      return res.status(200).json({
        status: "success",
        msg: "Solicitudes del owner obtenidas",
        payload: list,
      });
    } catch (e) {
      logger.error("ship-requests getByOwner:", e?.message || e);
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al listar solicitudes",
        payload: {},
      });
    }
  }

  async getByManager(req, res) {
    try {
      const { managerId } = req.params;
      const list = await shipRequestsService.getByManager(managerId);
      return res.status(200).json({
        status: "success",
        msg: "Solicitudes del manager obtenidas",
        payload: list,
      });
    } catch (e) {
      logger.error("ship-requests getByManager:", e?.message || e);
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al listar solicitudes",
        payload: {},
      });
    }
  }

  async getByShip(req, res) {
    try {
      const { shipId } = req.params;
      const list = await shipRequestsService.getByShip(shipId);
      return res.status(200).json({
        status: "success",
        msg: "Solicitudes del buque obtenidas",
        payload: list,
      });
    } catch (e) {
      logger.error("ship-requests getByShip:", e?.message || e);
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al listar solicitudes",
        payload: {},
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, completedAt, rejectionReason } = req.body;
      if (!status) {
        return res.status(400).json({
          status: "error",
          msg: "status es requerido",
          payload: {},
        });
      }
      if (status === "Rechazado" && (!rejectionReason || String(rejectionReason).trim() === "")) {
        return res.status(400).json({
          status: "error",
          msg: "El motivo del rechazo es obligatorio",
          payload: {},
        });
      }
      const request = await shipRequestsService.updateStatus(id, status, completedAt, rejectionReason);
      if (request?.owner?.email) {
        const ownerName = [request.owner.firstName, request.owner.lastName].filter(Boolean).join(" ") || "Cliente";
        await userService.sendShipRequestStatusChangeEmail({
          to: request.owner.email,
          ownerName,
          boatName: request.ship?.name ?? "su barco",
          newStatus: status,
          rejectionReason: status === "Rechazado" ? rejectionReason : undefined,
        });
      }
      return res.status(200).json({
        status: "success",
        msg: "Estado actualizado",
        payload: request,
      });
    } catch (e) {
      logger.error("ship-requests updateStatus:", e?.message || e);
      const statusCode = e?.message === "Solicitud no encontrada" ? 404 : 400;
      return res.status(statusCode).json({
        status: "error",
        msg: e?.message || "Error al actualizar estado",
        payload: {},
      });
    }
  }

  async updateOne(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;
      const request = await shipRequestsService.updateOne(id, body);
      return res.status(200).json({
        status: "success",
        msg: "Solicitud actualizada",
        payload: request,
      });
    } catch (e) {
      logger.error("ship-requests updateOne:", e?.message || e);
      const statusCode = e?.message === "Solicitud no encontrada" ? 404 : 400;
      return res.status(statusCode).json({
        status: "error",
        msg: e?.message || "Error al actualizar",
        payload: {},
      });
    }
  }

  async deleteOne(req, res) {
    try {
      const { id } = req.params;
      await shipRequestsService.deleteOne(id);
      return res.status(200).json({
        status: "success",
        msg: "Solicitud eliminada",
        payload: {},
      });
    } catch (e) {
      logger.error("ship-requests deleteOne:", e?.message || e);
      const statusCode = e?.message === "Solicitud no encontrada" ? 404 : 500;
      return res.status(statusCode).json({
        status: "error",
        msg: e?.message || "Error al eliminar",
        payload: {},
      });
    }
  }
}

export const shipRequestsController = new ShipRequestsController();
