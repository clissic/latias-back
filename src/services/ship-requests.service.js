import { shipRequestsModel } from "../DAO/models/ship-requests.model.js";
import { boatsModel } from "../DAO/models/boats.model.js";
import { usersModel } from "../DAO/models/users.model.js";

const VALID_STATUSES = ["Pendiente", "En progreso", "Completado", "Rechazado"];
const VALID_TYPES = ["Renovación", "Preparación", "Asesoramiento"];

function normalizeTypes(typeOrTypes) {
  const arr = Array.isArray(typeOrTypes) ? typeOrTypes : (typeOrTypes != null ? [String(typeOrTypes).trim()] : []);
  const filtered = arr.filter(Boolean).filter((t) => VALID_TYPES.includes(t));
  return [...new Set(filtered)];
}

class ShipRequestsService {
  async create(data) {
    const { ship, owner, manager, type, types, notes } = data;
    const typeArray = normalizeTypes(types ?? type);

    if (!ship || !owner || !manager) {
      throw new Error("ship, owner y manager son requeridos");
    }
    if (typeArray.length === 0) {
      throw new Error(`type/types debe incluir al menos uno de: ${VALID_TYPES.join(", ")}`);
    }

    const boat = await boatsModel.findById(ship);
    if (!boat) throw new Error("Buque no encontrado");

    const ownerUser = await usersModel.findById(owner);
    if (!ownerUser) throw new Error("Owner no encontrado");

    const managerUser = await usersModel.findById(manager);
    if (!managerUser) throw new Error("Manager no encontrado");
    const _managerCats = Array.isArray(managerUser.category) ? managerUser.category : (managerUser.category != null ? [managerUser.category] : []);
    if (!_managerCats.includes("Gestor")) {
      throw new Error("El manager debe ser un usuario con categoría Gestor");
    }

    const request = await shipRequestsModel.create({
      ship,
      owner,
      manager,
      type: typeArray,
      status: "Pendiente",
      notes: notes != null ? String(notes).trim() : null,
    });

    return request;
  }

  async getById(id) {
    const request = await shipRequestsModel.findById(id);
    if (!request) throw new Error("Solicitud no encontrada");
    return request;
  }

  async getAll(filters = {}) {
    return shipRequestsModel.getAll(filters);
  }

  async getByOwner(ownerId) {
    return shipRequestsModel.findByOwner(ownerId);
  }

  async getByManager(managerId) {
    return shipRequestsModel.findByManager(managerId);
  }

  async getByShip(shipId) {
    return shipRequestsModel.findByShip(shipId);
  }

  async updateStatus(id, status, completedAt = null, rejectionReason = null) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`status debe ser uno de: ${VALID_STATUSES.join(", ")}`);
    }

    const request = await shipRequestsModel.findById(id);
    if (!request) throw new Error("Solicitud no encontrada");

    return shipRequestsModel.updateStatus(id, status, completedAt, rejectionReason);
  }

  async updateOne(id, updateData) {
    const request = await shipRequestsModel.findById(id);
    if (!request) throw new Error("Solicitud no encontrada");

    const allowed = ["type", "types", "notes", "status"];
    const filtered = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) filtered[key] = updateData[key];
    }
    if (filtered.type !== undefined) {
      const typeArray = normalizeTypes(filtered.type);
      if (typeArray.length === 0) throw new Error(`type debe incluir al menos uno de: ${VALID_TYPES.join(", ")}`);
      filtered.type = typeArray;
    }
    if (filtered.types !== undefined) {
      const typeArray = normalizeTypes(filtered.types);
      if (typeArray.length === 0) throw new Error(`types debe incluir al menos uno de: ${VALID_TYPES.join(", ")}`);
      filtered.type = typeArray;
      delete filtered.types;
    }
    if (filtered.status && !VALID_STATUSES.includes(filtered.status)) {
      throw new Error(`status debe ser uno de: ${VALID_STATUSES.join(", ")}`);
    }
    if ((filtered.status === "Completado" || filtered.status === "Rechazado") && !updateData.completedAt) {
      filtered.completedAt = new Date();
    }

    return shipRequestsModel.updateOne(id, filtered);
  }

  async deleteOne(id) {
    const request = await shipRequestsModel.findById(id);
    if (!request) throw new Error("Solicitud no encontrada");
    return shipRequestsModel.deleteOne(id);
  }
}

export const shipRequestsService = new ShipRequestsService();
