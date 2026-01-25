import { certificatesModel } from "../DAO/models/certificates.model.js";
import { boatsModel } from "../DAO/models/boats.model.js";

class CertificatesService {
  async getAll() {
    const certificates = await certificatesModel.getAll();
    return certificates;
  }

  async findById(id) {
    const certificate = await certificatesModel.findById(id);
    return certificate;
  }

  async findByBoatId(boatId) {
    const certificates = await certificatesModel.findByBoatId(boatId);
    return certificates;
  }

  async findByStatus(status) {
    // Validar que el status sea válido
    const validStatuses = ['vigente', 'vencido', 'anulado'];
    if (!validStatuses.includes(status)) {
      throw new Error("Estado de certificado inválido");
    }
    const certificates = await certificatesModel.findByStatus(status);
    return certificates;
  }

  async findByBoatIdAndStatus(boatId, status) {
    // Validar que el status sea válido
    const validStatuses = ['vigente', 'vencido', 'anulado'];
    if (!validStatuses.includes(status)) {
      throw new Error("Estado de certificado inválido");
    }
    const certificates = await certificatesModel.findByBoatIdAndStatus(boatId, status);
    return certificates;
  }

  async findExpired() {
    const certificates = await certificatesModel.findExpired();
    return certificates;
  }

  async findExpiringSoon(days = 30) {
    if (days < 0) {
      throw new Error("El número de días debe ser positivo");
    }
    const certificates = await certificatesModel.findExpiringSoon(days);
    return certificates;
  }

  async create(certificateData) {
    // Validar que el barco existe
    if (!certificateData.boatId) {
      throw new Error("El ID del barco es requerido");
    }

    const boat = await boatsModel.findById(certificateData.boatId);
    if (!boat) {
      throw new Error("El barco especificado no existe");
    }

    // Validar campos requeridos
    if (!certificateData.certificateType || !certificateData.number || 
        !certificateData.issueDate || !certificateData.expirationDate) {
      throw new Error("Todos los campos requeridos deben estar presentes");
    }

    // Validar fechas
    const issueDate = new Date(certificateData.issueDate);
    const expirationDate = new Date(certificateData.expirationDate);

    if (isNaN(issueDate.getTime())) {
      throw new Error("La fecha de emisión no es válida");
    }

    if (isNaN(expirationDate.getTime())) {
      throw new Error("La fecha de vencimiento no es válida");
    }

    if (expirationDate < issueDate) {
      throw new Error("La fecha de vencimiento no puede ser anterior a la fecha de emisión");
    }

    // Calcular el status automáticamente basado en la fecha de vencimiento
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    expirationDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    
    if (expirationDate < now) {
      certificateData.status = 'vencido';
    } else {
      certificateData.status = 'vigente';
    }

    const certificateCreated = await certificatesModel.create(certificateData);
    return certificateCreated;
  }

  async updateOne(certificateData) {
    const { _id, ...updateData } = certificateData;

    if (!_id) {
      throw new Error("ID del certificado es requerido");
    }

    // Validar que el certificado existe
    const existingCertificate = await certificatesModel.findById(_id);
    if (!existingCertificate) {
      throw new Error("Certificado no encontrado");
    }

    // Si se está actualizando el boatId, validar que el barco existe
    if (updateData.boatId) {
      const boat = await boatsModel.findById(updateData.boatId);
      if (!boat) {
        throw new Error("El barco especificado no existe");
      }
    }

    // Validar que el status sea válido si se está actualizando
    if (updateData.status) {
      const validStatuses = ['vigente', 'vencido', 'anulado'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error("Estado de certificado inválido");
      }
    }

    // Validar fechas si se están actualizando
    let issueDate = updateData.issueDate ? new Date(updateData.issueDate) : new Date(existingCertificate.issueDate);
    let expirationDate = updateData.expirationDate ? new Date(updateData.expirationDate) : new Date(existingCertificate.expirationDate);

    if (updateData.issueDate && isNaN(issueDate.getTime())) {
      throw new Error("La fecha de emisión no es válida");
    }

    if (updateData.expirationDate && isNaN(expirationDate.getTime())) {
      throw new Error("La fecha de vencimiento no es válida");
    }

    if (expirationDate < issueDate) {
      throw new Error("La fecha de vencimiento no puede ser anterior a la fecha de emisión");
    }

    // Actualizar el status automáticamente si no se proporciona explícitamente y las fechas cambiaron
    if (!updateData.status && (updateData.issueDate || updateData.expirationDate)) {
      const now = new Date();
      if (expirationDate < now && existingCertificate.status !== 'anulado') {
        updateData.status = 'vencido';
      } else if (expirationDate >= now && existingCertificate.status === 'vencido') {
        updateData.status = 'vigente';
      }
    }

    const certificateUpdated = await certificatesModel.updateOne({ _id, ...updateData });
    return certificateUpdated;
  }

  async deleteOne(_id) {
    const result = await certificatesModel.deleteOne(_id);
    return result;
  }
}

export const certificatesService = new CertificatesService();
