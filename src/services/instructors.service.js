import { instructorsModel } from "../DAO/models/instructors.model.js";

export const instructorsService = {
  async getAll() {
    return instructorsModel.getAll();
  },

  async findById(id) {
    return instructorsModel.findById(id);
  },

  async findByCi(ci) {
    return instructorsModel.findByCi(ci);
  },

  async findByCourseId(courseId) {
    return instructorsModel.findByCourseId(courseId);
  },

  async create(data) {
    return instructorsModel.create(data);
  },

  async updateOne(data) {
    return instructorsModel.updateOne(data);
  },

  async deleteOne(id) {
    return instructorsModel.deleteOne(id);
  },
};
