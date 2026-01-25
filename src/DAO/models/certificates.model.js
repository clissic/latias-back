import { CertificatesMongoose } from "./mongoose/certificates.mongoose.js";

class CertificatesModel {
  async getAll() {
    const certificates = await CertificatesMongoose.find({})
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort')
      .sort({ createdAt: -1 });
    return certificates;
  }

  async findById(id) {
    const certificate = await CertificatesMongoose.findById(id)
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort');
    return certificate;
  }

  async findByBoatId(boatId) {
    const certificates = await CertificatesMongoose.find({ boatId: boatId })
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort')
      .sort({ expirationDate: -1 });
    return certificates;
  }

  async findByStatus(status) {
    const certificates = await CertificatesMongoose.find({ status: status })
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort')
      .sort({ expirationDate: -1 });
    return certificates;
  }

  async findByBoatIdAndStatus(boatId, status) {
    const certificates = await CertificatesMongoose.find({ boatId: boatId, status: status })
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort')
      .sort({ expirationDate: -1 });
    return certificates;
  }

  async findExpired() {
    const now = new Date();
    const certificates = await CertificatesMongoose.find({ 
      expirationDate: { $lt: now },
      status: { $ne: 'anulado' }
    })
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort')
      .sort({ expirationDate: -1 });
    return certificates;
  }

  async findExpiringSoon(days = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    const certificates = await CertificatesMongoose.find({
      expirationDate: { $gte: now, $lte: futureDate },
      status: { $ne: 'anulado' }
    })
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort')
      .sort({ expirationDate: 1 });
    return certificates;
  }

  async create(certificateData) {
    const certificateCreated = await CertificatesMongoose.create(certificateData);
    const populatedCertificate = await CertificatesMongoose.findById(certificateCreated._id)
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort');
    return populatedCertificate;
  }

  async updateOne({ _id, ...updateData }) {
    const certificateUpdated = await CertificatesMongoose.updateOne(
      { _id: _id },
      { $set: updateData }
    );
    const updatedCertificate = await CertificatesMongoose.findById(_id)
      .populate('boatId', 'name registrationNumber registrationCountry registrationPort');
    return updatedCertificate;
  }

  async deleteOne(_id) {
    const result = await CertificatesMongoose.deleteOne({ _id: _id });
    return result;
  }
}

export const certificatesModel = new CertificatesModel();
