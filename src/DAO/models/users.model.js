import { isValidPassword } from "../../utils/Bcrypt.js";
import { UserMongoose } from "./mongoose/users.mongoose.js";

class UsersModel {
  async getAll() {
    const users = await UserMongoose.find(
      {},
      {
        _id: true,
        avatar: true,
        firstName: true,
        lastName: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        lastLogin: true,
      }
    );
    return users;
  }

  async findById(id) {
    const userFound = await UserMongoose.findById(
      id,
      {
        _id: true,
        avatar: true,
        firstName: true,
        lastName: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        lastLogin: true,
      }
    );
    return userFound;
  }

  async findUser(email, password) {
    const user = await UserMongoose.findOne(
      { email: email },
      {
        _id: true,
        password: true,
        avatar: true,
        firstName: true,
        lastName: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        lastLogin: true,
      }
    );
    if (user && isValidPassword(password, user.password)) {
      return user;
    } else {
      return false;
    }
  }

  async findByEmail(email) {
    const user = await UserMongoose.findOne(
      { email: email },
      {
        _id: true,
        password: true,
        avatar: true,
        firstName: true,
        lastName: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        lastLogin: true,
      }
    );
    return user;
  }

    async findByCi(ci) {
    const user = await UserMongoose.findOne(
      { ci: ci },
      {
        _id: true,
        password: true,
        avatar: true,
        firstName: true,
        lastName: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        lastLogin: true,
      }
    );
    return user;
  }

  async create({ firstName, lastName, birth, ci, email, password }) {
    const userCreated = await UserMongoose.create({
      firstName,
      lastName,
      birth,
      ci,
      email,
      password,
    });
    return userCreated;
  }

  async updateOne({
    _id,
    password,
    avatar,
    firstName,
    lastName,
    email,
    ci,
    phone,
    birth,
    address,
    statistics,
    settings,
    preferences,
    rank,
    category,
    purchasedCourses,
    finishedCourses,
    paymentMethods,
  }) {
    const userUpdated = await UserMongoose.updateOne(
      {
        _id: _id,
      },
      {
        password,
        avatar,
        firstName,
        lastName,
        email,
        ci,
        phone,
        birth,
        address,
        statistics,
        settings,
        preferences,
        rank,
        category,
        purchasedCourses,
        finishedCourses,
        paymentMethods,
      }
    );
    return userUpdated;
  }

  async deleteOne(_id) {
    const result = await UserMongoose.deleteOne({ _id: _id });
    return result;
  }

  async updatePassword({email, password}) {
    const userUpdated = await UserMongoose.updateOne(
      { email: email },
      {
        password: password,
      }
    );
    return userUpdated
  }

  async updateAddress({_id, address}){
    const userUpdated = await UserMongoose.updateOne(
      {
        _id: _id,
      },
      {
        address: address,
      }
    );
    return userUpdated;
  }

  async addEventAttendedByCi(ci, eventId) {
    const ciRaw = String(ci ?? "").trim();
    const eventIdRaw = String(eventId ?? "").trim();
    if (!ciRaw || !eventIdRaw) {
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    }

    // Crear objeto con eventId y fecha de asistencia
    const eventAttendance = {
      eventId: eventIdRaw,
      attendedAt: new Date()
    };

    // Usar $addToSet para evitar duplicados si el mismo evento se procesa múltiples veces
    // Comparar solo por eventId para evitar duplicados
    const result = await UserMongoose.updateOne(
      { 
        ci: ciRaw,
        "statistics.eventsAttended.eventId": { $ne: eventIdRaw } // Solo agregar si no existe
      },
      { $push: { "statistics.eventsAttended": eventAttendance } }
    );
    return result;
  }

  async requestBoatToFleet(userId, boatId) {
    // Verificar que el barco no esté ya en la flota
    const user = await UserMongoose.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const existingRequest = user.fleet?.find(
      (fleetItem) => String(fleetItem.boatId) === String(boatId)
    );

    if (existingRequest) {
      throw new Error("Ya has solicitado este barco para tu flota");
    }

    const fleetRequest = {
      boatId: boatId,
      requestedAt: new Date(),
      status: 'pending'
    };

    const result = await UserMongoose.updateOne(
      { _id: userId },
      { $push: { fleet: fleetRequest } }
    );
    return result;
  }

  async getUserFleet(userId) {
    const user = await UserMongoose.findById(userId)
      .populate('fleet.boatId', 'name registrationNumber registrationCountry registrationPort boatType lengthOverall beam isActive');
    return user?.fleet || [];
  }

  async updateFleetRequestStatus(userId, boatId, status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error("Estado inválido");
    }

    const result = await UserMongoose.updateOne(
      { 
        _id: userId,
        "fleet.boatId": boatId
      },
      { 
        $set: { "fleet.$.status": status }
      }
    );
    return result;
  }

  async removeBoatFromFleet(userId, boatId) {
    const result = await UserMongoose.updateOne(
      { _id: userId },
      { 
        $pull: { fleet: { boatId: boatId } }
      }
    );
    return result;
  }
}

export const usersModel = new UsersModel();