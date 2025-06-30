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
        status: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        purchasedCourses: true,
        finishedCourses: true,
        lastLogin: true,
      }
    );
    return users;
  }

  async findById(id) {
    const userFound = await UserMongoose.findById(id);
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
        status: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        purchasedCourses: true,
        finishedCourses: true,
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
        status: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        purchasedCourses: true,
        finishedCourses: true,
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
        status: true,
        email: true,
        ci: true,
        phone: true,
        birth: true,
        address: true,
        statistics: true,
        settings: true,
        preferences: true,
        rank: true,
        purchasedCourses: true,
        finishedCourses: true,
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
    status,
    email,
    ci,
    phone,
    birth,
    address,
    statistics,
    settings,
    preferences,
    rank,
    purchasedCourses,
    finishedCourses,
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
        status,
        email,
        ci,
        phone,
        birth,
        address,
        statistics,
        settings,
        preferences,
        rank,
        purchasedCourses,
        finishedCourses,
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
}

export const usersModel = new UsersModel();