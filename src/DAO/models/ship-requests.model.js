import { ShipRequestsMongoose } from "./mongoose/ship-requests.mongoose.js";

class ShipRequestsModel {
  async create(data) {
    const doc = await ShipRequestsMongoose.create(data);
    return this.findById(doc._id);
  }

  async findById(id) {
    return ShipRequestsMongoose.findById(id)
      .populate("ship", "name registrationNumber boatType")
      .populate("owner", "firstName lastName email")
      .populate("manager", "firstName lastName email");
  }

  async getAll(options = {}) {
    const { status, owner, manager, ship } = options;
    const filter = {};
    if (status) filter.status = status;
    if (owner) filter.owner = owner;
    if (manager) filter.manager = manager;
    if (ship) filter.ship = ship;

    return ShipRequestsMongoose.find(filter)
      .populate("ship", "name registrationNumber boatType")
      .populate("owner", "firstName lastName email")
      .populate("manager", "firstName lastName email")
      .sort({ requestedAt: -1 })
      .lean();
  }

  async findByOwner(ownerId) {
    return ShipRequestsMongoose.find({ owner: ownerId })
      .populate("ship", "name registrationNumber boatType")
      .populate("owner", "firstName lastName email")
      .populate("manager", "firstName lastName email")
      .sort({ requestedAt: -1 })
      .lean();
  }

  async findByManager(managerId) {
    return ShipRequestsMongoose.find({ manager: managerId })
      .populate("ship", "name registrationNumber boatType")
      .populate("owner", "firstName lastName email")
      .populate("manager", "firstName lastName email")
      .sort({ requestedAt: -1 })
      .lean();
  }

  async findByShip(shipId) {
    return ShipRequestsMongoose.find({ ship: shipId })
      .populate("ship", "name registrationNumber boatType")
      .populate("owner", "firstName lastName email")
      .populate("manager", "firstName lastName email")
      .sort({ requestedAt: -1 })
      .lean();
  }

  async updateOne(id, updateData) {
    const result = await ShipRequestsMongoose.updateOne(
      { _id: id },
      { $set: updateData }
    );
    if (result.matchedCount === 0) return null;
    return this.findById(id);
  }

  async updateStatus(id, status, completedAt = null, rejectionReason = null) {
    const update = { status };
    if (completedAt !== undefined) update.completedAt = completedAt;
    if (status === "Completado" || status === "Rechazado") {
      update.completedAt = completedAt || new Date();
    }
    if (status === "Rechazado" && rejectionReason != null) {
      update.rejectionReason = String(rejectionReason).trim() || null;
    }
    return this.updateOne(id, update);
  }

  async deleteOne(id) {
    return ShipRequestsMongoose.deleteOne({ _id: id });
  }
}

export const shipRequestsModel = new ShipRequestsModel();
