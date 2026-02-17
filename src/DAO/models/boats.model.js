import { BoatsMongoose } from "./mongoose/boats.mongoose.js";

class BoatsModel {
  async getAll() {
    const boats = await BoatsMongoose.find({})
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente
    return boats;
  }

  async getActive() {
    const boats = await BoatsMongoose.find({ isActive: true })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });
    return boats;
  }

  async findById(id) {
    const boat = await BoatsMongoose.findById(id)
      .populate('owner', 'firstName lastName email ci');
    return boat;
  }

  async findByRegistrationNumber(registrationNumber) {
    const boat = await BoatsMongoose.findOne({ registrationNumber: registrationNumber })
      .populate('owner', 'firstName lastName email');
    return boat;
  }

  async findByOwner(ownerId) {
    const boats = await BoatsMongoose.find({ owner: ownerId })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });
    return boats;
  }

  async countByOwner(ownerId) {
    return BoatsMongoose.countDocuments({ owner: ownerId });
  }

  async countActiveByOwner(ownerId) {
    return BoatsMongoose.countDocuments({ owner: ownerId, isActive: { $ne: false } });
  }

  async create(boatData) {
    const boatCreated = await BoatsMongoose.create(boatData);
    const populatedBoat = await BoatsMongoose.findById(boatCreated._id)
      .populate('owner', 'firstName lastName email');
    return populatedBoat;
  }

  async updateOne({ _id, ...updateData }) {
    const boatUpdated = await BoatsMongoose.updateOne(
      { _id: _id },
      { $set: updateData }
    );
    // Retornar el barco actualizado
    const updatedBoat = await BoatsMongoose.findById(_id)
      .populate('owner', 'firstName lastName email');
    return updatedBoat;
  }

  async deleteOne(_id) {
    const result = await BoatsMongoose.deleteOne({ _id: _id });
    return result;
  }

  async toggleActive(_id) {
    const boat = await BoatsMongoose.findById(_id);
    if (!boat) {
      throw new Error("Barco no encontrado");
    }

    const updatedBoat = await BoatsMongoose.updateOne(
      { _id: _id },
      { $set: { isActive: !boat.isActive } }
    );
    const toggledBoat = await BoatsMongoose.findById(_id)
      .populate('owner', 'firstName lastName email');
    return toggledBoat;
  }

  /** Devuelve los valores permitidos de tipo de barco (enum del esquema). */
  getBoatTypes() {
    const path = BoatsMongoose.schema.path("boatType");
    return path?.enumValues ? [...path.enumValues] : [];
  }
}

export const boatsModel = new BoatsModel();
