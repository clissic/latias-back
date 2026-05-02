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
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        manager: true,
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
        bankAccount: true,
        statistics: true,
        settings: true,
        preferences: true,
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        manager: true,
        wallet: true,
        premium: true,
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
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        manager: true,
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
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        manager: true,
        lastLogin: true,
      }
    );
    return user;
  }

    async findByCategory(category) {
    const users = await UserMongoose.find(
      { category },
      {
        _id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
      }
    );
    return users;
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
        category: true,
        purchasedCourses: true,
        finishedCourses: true,
        paymentMethods: true,
        manager: true,
        lastLogin: true,
      }
    );
    return user;
  }

  async create({ firstName, lastName, birth, ci, email, password, category }) {
    const doc = {
      firstName,
      lastName,
      birth,
      ci,
      email,
      password,
    };
    if (category != null && Array.isArray(category) && category.length > 0) {
      doc.category = category;
    }
    const userCreated = await UserMongoose.create(doc);
    return userCreated;
  }

  async updateOne(payload) {
    const { _id, ...rest } = payload;
    const updateFields = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined)
    );
    const userUpdated = await UserMongoose.updateOne(
      { _id },
      updateFields
    );
    return userUpdated;
  }

  async deleteOne(_id) {
    const result = await UserMongoose.deleteOne({ _id: _id });
    return result;
  }

  /**
   * Activa plan premium de gestoría.
   * basico: subscription "Básico", procedures +2, maximumShips +2, expires +366d.
   * navegante: subscription "Navegante", procedures +5, maximumShips +5, freeCourses +1, expires +366d.
   * capitan: subscription "Capitán", procedures +10, maximumShips +8, freeCourses +2, expires +366d.
   */
  async activatePremiumPlan(userId, planId) {
    const user = await UserMongoose.findById(userId).select("premium").lean();
    if (!user) throw new Error("Usuario no encontrado");
    const currentProcedures = user.premium?.procedures ?? 0;
    const currentMaximumShips = user.premium?.maximumShips ?? 0;
    const currentFreeCourses = user.premium?.freeCourses ?? 0;
    const expires = new Date(Date.now() + 366 * 24 * 60 * 60 * 1000);

    if (planId === "basico") {
      await UserMongoose.updateOne(
        { _id: userId },
        {
          $set: {
            "premium.isActive": true,
            "premium.subscription": "Básico",
            "premium.expires": expires,
            "premium.procedures": currentProcedures + 2,
            "premium.maximumShips": currentMaximumShips + 2,
          },
        }
      );
      return { ok: true };
    }
    if (planId === "navegante") {
      await UserMongoose.updateOne(
        { _id: userId },
        {
          $set: {
            "premium.isActive": true,
            "premium.subscription": "Navegante",
            "premium.expires": expires,
            "premium.procedures": currentProcedures + 5,
            "premium.maximumShips": currentMaximumShips + 5,
            "premium.freeCourses": currentFreeCourses + 1,
          },
        }
      );
      return { ok: true };
    }
    if (planId === "capitan") {
      await UserMongoose.updateOne(
        { _id: userId },
        {
          $set: {
            "premium.isActive": true,
            "premium.subscription": "Capitán",
            "premium.expires": expires,
            "premium.procedures": currentProcedures + 10,
            "premium.maximumShips": currentMaximumShips + 8,
            "premium.freeCourses": currentFreeCourses + 2,
          },
        }
      );
      return { ok: true };
    }
    throw new Error(`Plan no implementado: ${planId}`);
  }

  /**
   * Si la suscripción premium está vencida (expires < hoy), da de baja: isActive false, maximumShips 0.
   * procedures y freeCourses se mantienen. Se llama al login y al obtener perfil.
   */
  async deactivateExpiredPremium(userId) {
    const user = await UserMongoose.findById(userId).select("premium").lean();
    if (!user?.premium?.isActive) return;
    const expires = user.premium.expires ? new Date(user.premium.expires) : null;
    if (!expires || Number.isNaN(expires.getTime()) || expires >= new Date()) return;
    await UserMongoose.updateOne(
      { _id: userId },
      { $set: { "premium.isActive": false, "premium.maximumShips": 0 } }
    );
  }

  /**
   * Resta 1 a premium.freeCourses. Solo tiene efecto si freeCourses >= 1.
   * Usado al canjear un curso gratuito por plan de gestoría.
   * @returns {Promise<{ ok: boolean, updated: boolean }>} updated true si se restó.
   */
  async decrementFreeCourse(userId) {
    const user = await UserMongoose.findById(userId).select("premium.freeCourses").lean();
    const current = user?.premium?.freeCourses ?? 0;
    if (current < 1) return { ok: true, updated: false };
    await UserMongoose.updateOne(
      { _id: userId },
      { $inc: { "premium.freeCourses": -1 } }
    );
    return { ok: true, updated: true };
  }

  /**
   * Resta 1 a premium.procedures. Solo tiene efecto si procedures >= 1.
   * Usado al solicitar un trámite de flota con trámites disponibles.
   * @returns {Promise<{ ok: boolean, updated: boolean }>} updated true si se restó.
   */
  async decrementProcedures(userId) {
    const user = await UserMongoose.findById(userId).select("premium.procedures").lean();
    const current = user?.premium?.procedures ?? 0;
    if (current < 1) return { ok: true, updated: false };
    await UserMongoose.updateOne(
      { _id: userId },
      { $inc: { "premium.procedures": -1 } }
    );
    return { ok: true, updated: true };
  }

  /**
   * Incrementa wallet.pendingBalance y totalEarnings en netAmount.
   * No almacena transacciones dentro del usuario; solo campos agregados.
   */
  async incrementWalletPending(userId, netAmount, currency) {
    const inc = Number(netAmount);
    if (!Number.isFinite(inc) || inc === 0) return null;
    const update = {
      $inc: {
        "wallet.pendingBalance": inc,
        "wallet.totalEarnings": inc,
      },
    };
    if (currency) {
      update.$set = { "wallet.currency": String(currency) };
    }
    return UserMongoose.updateOne({ _id: userId }, update);
  }

  /**
   * Mueve fondos desde pendingBalance a balance cuando las transacciones pasan a "available".
   */
  async moveWalletPendingToAvailable(userId, netAmount, currency) {
    const inc = Number(netAmount);
    if (!Number.isFinite(inc) || inc === 0) return null;
    const update = {
      $inc: {
        "wallet.pendingBalance": -inc,
        "wallet.balance": inc,
      },
    };
    if (currency) {
      update.$set = { "wallet.currency": String(currency) };
    }
    return UserMongoose.updateOne({ _id: userId }, update);
  }

  /**
   * Obtiene solo el objeto wallet del usuario (para endpoint GET wallet).
   */
  async getWallet(userId) {
    const user = await UserMongoose.findById(userId).select("wallet").lean();
    return user?.wallet ?? null;
  }

  /**
   * Resta amount del balance (para reembolsos). No modifica totalEarnings.
   */
  async decrementWalletBalance(userId, amount, currency) {
    const dec = Number(amount);
    if (!Number.isFinite(dec) || dec <= 0) return null;
    const update = { $inc: { "wallet.balance": -dec } };
    if (currency) update.$set = { "wallet.currency": String(currency) };
    return UserMongoose.updateOne({ _id: userId }, update);
  }

  /**
   * Retiro: resta amount del balance e incrementa totalWithdrawn. Actualiza lastPayoutDate.
   */
  async withdrawFromWallet(userId, amount, currency) {
    const dec = Number(amount);
    if (!Number.isFinite(dec) || dec <= 0) return null;
    const now = new Date();
    const update = {
      $inc: { "wallet.balance": -dec, "wallet.totalWithdrawn": dec },
      $set: { "wallet.lastPayoutDate": now },
    };
    if (currency) update.$set["wallet.currency"] = String(currency);
    return UserMongoose.updateOne({ _id: userId }, update);
  }

  /** Incrementa statistics.certificatesQuantity en 1 (al emitir un certificado de curso). */
  async incrementCertificatesQuantity(userId) {
    const result = await UserMongoose.updateOne(
      { _id: userId },
      { $inc: { "statistics.certificatesQuantity": 1 } }
    );
    return result;
  }

  /** Incrementa statistics.timeConnected en la cantidad de minutos indicada. */
  async incrementTimeConnected(userId, minutes) {
    const incMinutes = Number(minutes);
    if (!Number.isFinite(incMinutes) || incMinutes <= 0) {
      return null;
    }
    const result = await UserMongoose.updateOne(
      { _id: userId },
      { $inc: { "statistics.timeConnected": incMinutes } }
    );
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

  /** Usuarios que tienen a este gestor asignado (manager.managerId === managerId). */
  async findClientsByManagerId(managerId) {
    const idStr = String(managerId);
    return UserMongoose.find(
      { "manager.managerId": idStr },
      { _id: true, firstName: true, lastName: true, email: true, phone: true, address: true }
    )
      .lean();
  }

  /**
   * Conteos para métricas de instructor: compras, finalizados y aprobados (certificado emitido).
   * `approved` coincide con quienes recibieron certificado (misma regla que en updateFinalTestResult).
   */
  async countCoursePurchaseMetrics(courseId) {
    const cid = String(courseId);
    const [purchased, finished, approved] = await Promise.all([
      UserMongoose.countDocuments({
        purchasedCourses: { $elemMatch: { courseId: cid } },
      }),
      UserMongoose.countDocuments({
        purchasedCourses: { $elemMatch: { courseId: cid, isFinished: true } },
      }),
      UserMongoose.countDocuments({
        purchasedCourses: {
          $elemMatch: {
            courseId: cid,
            certificate: { $exists: true, $nin: [null, ""] },
          },
        },
      }),
    ]);
    return { purchased, finished, approved };
  }

  /**
   * Usuarios que tienen el curso en purchasedCourses (solo datos listados para instructor/admin).
   */
  async findUsersWhoPurchasedCourse(courseId) {
    const cid = String(courseId);
    return UserMongoose.find(
      { purchasedCourses: { $elemMatch: { courseId: cid } } },
      { _id: true, firstName: true, lastName: true, ci: true }
    )
      .sort({ lastName: 1, firstName: 1 })
      .lean();
  }

  /** Cadetes con el curso marcado como finalizado (isFinished en purchasedCourses). Incluye purchasedCourses para métricas en instructor. */
  async findUsersWhoFinishedCourse(courseId) {
    const cid = String(courseId);
    return UserMongoose.find(
      { purchasedCourses: { $elemMatch: { courseId: cid, isFinished: true } } },
      { _id: true, firstName: true, lastName: true, ci: true, purchasedCourses: true }
    )
      .sort({ lastName: 1, firstName: 1 })
      .lean();
  }

  /** Cadetes con certificado emitido para ese curso (misma regla que métrica approved). */
  async findUsersWhoApprovedCourse(courseId) {
    const cid = String(courseId);
    return UserMongoose.find(
      {
        purchasedCourses: {
          $elemMatch: {
            courseId: cid,
            certificate: { $exists: true, $nin: [null, ""] },
          },
        },
      },
      { _id: true, firstName: true, lastName: true, ci: true }
    )
      .sort({ lastName: 1, firstName: 1 })
      .lean();
  }
}

export const usersModel = new UsersModel();