import { professorsModel } from "../DAO/models/professors.model.js";

class ProfessorsService {
  async getAll() {
    const professors = await professorsModel.getAll();
    return professors;
  }

  async findById(id) {
    const professor = await professorsModel.findById(id);
    return professor;
  }

  async findByCi(ci) {
    const professor = await professorsModel.findByCi(ci);
    return professor;
  }

  async create(professorData) {
    const professorCreated = await professorsModel.create(professorData);
    return professorCreated;
  }

  async updateOne(professorData) {
    const professorUpdated = await professorsModel.updateOne(professorData);
    return professorUpdated;
  }

  async deleteOne(_id) {
    const result = await professorsModel.deleteOne(_id);
    return result;
  }

  async findByCourseId(courseId) {
    const professors = await professorsModel.findByCourseId(courseId);
    return professors;
  }
}

export const professorsService = new ProfessorsService();
