import { InstructorsMongoose } from "./mongoose/instructors.mongoose.js";

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) obj._id = String(obj._id);
  return obj;
}

function normalizeContact(c) {
  if (!c || Array.isArray(c)) return { email: "", phone: "" };
  return {
    email: String(c.email ?? ""),
    phone: String(c.phone ?? ""),
  };
}

function normalizeSocial(s) {
  if (!s || Array.isArray(s)) return { linkedin: "", twitter: "", instagram: "", youtube: "" };
  return {
    linkedin: String(s.linkedin ?? ""),
    twitter: String(s.twitter ?? ""),
    instagram: String(s.instagram ?? ""),
    youtube: String(s.youtube ?? ""),
  };
}

export const instructorsModel = {
  async getAll() {
    const list = await InstructorsMongoose.find({}).lean();
    return (list || []).map((d) => ({ ...d, _id: String(d._id) }));
  },

  async findById(id) {
    if (!id || typeof id !== "string") return null;
    const doc = await InstructorsMongoose.findById(id.trim()).lean();
    return doc ? toPlain(doc) : null;
  },

  async findByCi(ci) {
    const doc = await InstructorsMongoose.findOne({ ci: Number(ci) }).lean();
    return doc ? toPlain(doc) : null;
  },

  async findByCourseId(courseId) {
    const list = await InstructorsMongoose.find({ courses: String(courseId) }).lean();
    return (list || []).map((d) => ({ ...d, _id: String(d._id) }));
  },

  async create(data) {
    const doc = await InstructorsMongoose.create({
      firstName: String(data.firstName ?? ""),
      lastName: String(data.lastName ?? ""),
      ci: Number(data.ci),
      profileImage: String(data.profileImage ?? ""),
      profession: String(data.profession ?? ""),
      experience: String(data.experience ?? ""),
      bio: String(data.bio ?? ""),
      certifications: Array.isArray(data.certifications) ? data.certifications.map(String) : [],
      achievements: Array.isArray(data.achievements) ? data.achievements.map(String) : [],
      courses: Array.isArray(data.courses) ? data.courses.map(String) : [],
      contact: normalizeContact(data.contact),
      socialMedia: normalizeSocial(data.socialMedia),
    });
    return toPlain(doc);
  },

  async updateOne(data) {
    const _id = data._id;
    if (!_id) return { matchedCount: 0 };
    const update = {
      firstName: data.firstName != null ? String(data.firstName) : undefined,
      lastName: data.lastName != null ? String(data.lastName) : undefined,
      ci: data.ci != null ? Number(data.ci) : undefined,
      profileImage: data.profileImage != null ? String(data.profileImage) : undefined,
      profession: data.profession != null ? String(data.profession) : undefined,
      experience: data.experience != null ? String(data.experience) : undefined,
      bio: data.bio != null ? String(data.bio) : undefined,
      certifications: Array.isArray(data.certifications) ? data.certifications.map(String) : undefined,
      achievements: Array.isArray(data.achievements) ? data.achievements.map(String) : undefined,
      courses: Array.isArray(data.courses) ? data.courses.map(String) : undefined,
      contact: data.contact != null ? normalizeContact(data.contact) : undefined,
      socialMedia: data.socialMedia != null ? normalizeSocial(data.socialMedia) : undefined,
    };
    const clean = Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined));
    const result = await InstructorsMongoose.updateOne({ _id }, { $set: clean });
    return result;
  },

  async deleteOne(_id) {
    return InstructorsMongoose.deleteOne({ _id });
  },
};
