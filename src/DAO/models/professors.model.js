import { ProfessorsMongoose } from "./mongoose/professors.mongoose.js";

class ProfessorsModel {
  async getAll() {
    const professors = await ProfessorsMongoose.find(
      {},
      {
        _id: true,
        firstName: true,
        lastName: true,
        ci: true,
        profileImage: true,
        profession: true,
        experience: true,
        bio: true,
        certifications: true,
        achievements: true,
        courses: true,
        contact: true,
        socialMedia: true,
        createdAt: true,
        updatedAt: true,
      }
    );
    return professors;
  }

  async findById(id) {
    const professorFound = await ProfessorsMongoose.findById(id);
    return professorFound;
  }

  async findByCi(ci) {
    const professor = await ProfessorsMongoose.findOne(
      { ci: ci },
      {
        _id: true,
        firstName: true,
        lastName: true,
        ci: true,
        profileImage: true,
        profession: true,
        experience: true,
        bio: true,
        certifications: true,
        achievements: true,
        courses: true,
        contact: true,
        socialMedia: true,
        createdAt: true,
        updatedAt: true,
      }
    );
    return professor;
  }

  async create({
    firstName,
    lastName,
    ci,
    profileImage,
    profession,
    experience,
    bio,
    certifications,
    achievements,
    courses,
    contact,
    socialMedia,
  }) {
    const professorCreated = await ProfessorsMongoose.create({
      firstName,
      lastName,
      ci,
      profileImage,
      profession,
      experience,
      bio,
      certifications,
      achievements,
      courses,
      contact,
      socialMedia,
    });
    return professorCreated;
  }

  async updateOne({
    _id,
    firstName,
    lastName,
    ci,
    profileImage,
    profession,
    experience,
    bio,
    certifications,
    achievements,
    courses,
    contact,
    socialMedia,
  }) {
    const professorUpdated = await ProfessorsMongoose.updateOne(
      {
        _id: _id,
      },
      {
        firstName,
        lastName,
        ci,
        profileImage,
        profession,
        experience,
        bio,
        certifications,
        achievements,
        courses,
        contact,
        socialMedia,
      }
    );
    return professorUpdated;
  }

  async deleteOne(_id) {
    const result = await ProfessorsMongoose.deleteOne({ _id: _id });
    return result;
  }

  async findByCourseId(courseId) {
    // courseId es el courseId del curso (string)
    const professors = await ProfessorsMongoose.find(
      { courses: String(courseId) },
      {
        _id: true,
        firstName: true,
        lastName: true,
        ci: true,
        profileImage: true,
        profession: true,
        experience: true,
        bio: true,
        certifications: true,
        achievements: true,
        courses: true,
        contact: true,
        socialMedia: true,
        createdAt: true,
        updatedAt: true,
      }
    );
    return professors;
  }
}

export const professorsModel = new ProfessorsModel();
