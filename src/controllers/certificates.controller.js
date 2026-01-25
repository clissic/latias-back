import { certificatesService } from "../services/certificates.service.js";
import { logger } from "../utils/logger.js";

class CertificatesController {
  // ========== FUNCIONES PÚBLICAS ==========

  // Obtener certificado por ID (público)
  async findById(req, res) {
    try {
      const { id } = req.params;
      const certificate = await certificatesService.findById(id);
      if (certificate) {
        return res.status(200).json({
          status: "success",
          msg: "Certificado obtenido",
          payload: certificate,
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Certificado no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener certificados por barco (público)
  async findByBoatId(req, res) {
    try {
      const { boatId } = req.params;
      const certificates = await certificatesService.findByBoatId(boatId);
      return res.status(200).json({
        status: "success",
        msg: "Certificados del barco obtenidos",
        payload: certificates,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener certificados por estado (público)
  async findByStatus(req, res) {
    try {
      const { status } = req.params;
      const certificates = await certificatesService.findByStatus(status);
      return res.status(200).json({
        status: "success",
        msg: "Certificados obtenidos",
        payload: certificates,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      if (e.message?.includes("inválido")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener certificados por barco y estado (público)
  async findByBoatIdAndStatus(req, res) {
    try {
      const { boatId, status } = req.params;
      const certificates = await certificatesService.findByBoatIdAndStatus(boatId, status);
      return res.status(200).json({
        status: "success",
        msg: "Certificados obtenidos",
        payload: certificates,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      if (e.message?.includes("inválido")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener certificados vencidos (público)
  async findExpired(req, res) {
    try {
      const certificates = await certificatesService.findExpired();
      return res.status(200).json({
        status: "success",
        msg: "Certificados vencidos obtenidos",
        payload: certificates,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Obtener certificados próximos a vencer (público)
  async findExpiringSoon(req, res) {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const certificates = await certificatesService.findExpiringSoon(days);
      return res.status(200).json({
        status: "success",
        msg: "Certificados próximos a vencer obtenidos",
        payload: certificates,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      if (e.message?.includes("positivo")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // ========== FUNCIONES PARA ADMINISTRADORES ==========

  // Obtener todos los certificados (para administradores)
  async getAll(req, res) {
    try {
      const certificates = await certificatesService.getAll();
      return res.status(200).json({
        status: "success",
        msg: "Todos los certificados obtenidos",
        payload: certificates,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Algo salió mal",
        payload: {},
      });
    }
  }

  // Crear nuevo certificado
  async create(req, res) {
    try {
      const certificateData = req.body;

      // Validar campos requeridos
      if (!certificateData.boatId || !certificateData.certificateType || 
          !certificateData.number || !certificateData.issueDate || 
          !certificateData.expirationDate) {
        return res.status(400).json({
          status: "error",
          msg: "Todos los campos requeridos deben estar presentes",
          payload: {},
        });
      }

      const certificateCreated = await certificatesService.create(certificateData);
      return res.status(201).json({
        status: "success",
        msg: "Certificado creado exitosamente",
        payload: certificateCreated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      // Manejar errores específicos
      if (e.message?.includes("no existe") || e.message?.includes("no encontrado")) {
        return res.status(404).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      if (e.message?.includes("requerido") || e.message?.includes("inválido") || 
          e.message?.includes("anterior") || e.message?.includes("válida")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al crear el certificado",
        payload: {},
      });
    }
  }

  // Actualizar certificado
  async updateOne(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          status: "error",
          msg: "ID del certificado es requerido",
          payload: {},
        });
      }

      const certificateUpdated = await certificatesService.updateOne({ _id: id, ...updateData });
      
      if (!certificateUpdated) {
        return res.status(404).json({
          status: "error",
          msg: "Certificado no encontrado",
          payload: {},
        });
      }

      return res.status(200).json({
        status: "success",
        msg: "Certificado actualizado exitosamente",
        payload: certificateUpdated,
      });
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      
      // Manejar errores específicos
      if (e.message?.includes("no existe") || e.message?.includes("no encontrado")) {
        return res.status(404).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      if (e.message?.includes("requerido") || e.message?.includes("inválido") || 
          e.message?.includes("anterior") || e.message?.includes("válida")) {
        return res.status(400).json({
          status: "error",
          msg: e.message,
          payload: {},
        });
      }

      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al actualizar el certificado",
        payload: {},
      });
    }
  }

  // Eliminar certificado
  async deleteOne(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: "error",
          msg: "ID del certificado es requerido",
          payload: {},
        });
      }

      const result = await certificatesService.deleteOne(id);

      if (result?.deletedCount > 0) {
        return res.status(200).json({
          status: "success",
          msg: "Certificado eliminado exitosamente",
          payload: {},
        });
      } else {
        return res.status(404).json({
          status: "error",
          msg: "Certificado no encontrado",
          payload: {},
        });
      }
    } catch (e) {
      logger.error(e?.message || e || "Error desconocido");
      return res.status(500).json({
        status: "error",
        msg: e?.message || "Error al eliminar el certificado",
        payload: {},
      });
    }
  }
}

export const certificatesController = new CertificatesController();
