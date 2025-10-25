import { paymentMethodsService } from "../services/payment-methods.service.js";
import { usersModel } from "../DAO/models/users.model.js";
import { logger } from "../utils/logger.js";

class PaymentMethodsController {
  // Agregar método de pago al usuario
  async addPaymentMethod(req, res) {
    try {
      const { userId } = req.params;
      const cardData = req.body;

      // Validar datos de tarjeta
      const validationErrors = paymentMethodsService.validateCardData(cardData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: "error",
          msg: "Datos de tarjeta inválidos",
          payload: { errors: validationErrors },
        });
      }

      // Verificar que el usuario existe
      const user = await usersModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      // Crear token de tarjeta con MercadoPago
      const tokenResponse = await paymentMethodsService.createCardToken(cardData);
      
      // Obtener información de la tarjeta
      const cardInfo = await paymentMethodsService.getCardInfo(tokenResponse.id);
      
      // Formatear datos para almacenamiento
      const paymentMethod = paymentMethodsService.formatCardForStorage(
        tokenResponse.id,
        cardInfo,
        !user.paymentMethods || user.paymentMethods.length === 0 // Primera tarjeta es por defecto
      );

      // Agregar método de pago al usuario
      const updatedPaymentMethods = [...(user.paymentMethods || []), paymentMethod];
      
      const userUpdated = await usersModel.updateOne({
        _id: userId,
        paymentMethods: updatedPaymentMethods
      });

      return res.status(200).json({
        status: "success",
        msg: "Método de pago agregado exitosamente",
        payload: {
          paymentMethod: {
            id: paymentMethod.token,
            lastFourDigits: paymentMethod.lastFourDigits,
            cardType: paymentMethod.cardType,
            expirationMonth: paymentMethod.expirationMonth,
            expirationYear: paymentMethod.expirationYear,
            cardholderName: paymentMethod.cardholderName,
            isDefault: paymentMethod.isDefault
          }
        },
      });
    } catch (error) {
      logger.error("Error en addPaymentMethod:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Obtener métodos de pago del usuario
  async getUserPaymentMethods(req, res) {
    try {
      const { userId } = req.params;

      const user = await usersModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      const paymentMethods = (user.paymentMethods || []).map(method => ({
        id: method.token,
        lastFourDigits: method.lastFourDigits,
        cardType: method.cardType,
        expirationMonth: method.expirationMonth,
        expirationYear: method.expirationYear,
        cardholderName: method.cardholderName,
        isDefault: method.isDefault,
        createdAt: method.createdAt
      }));

      return res.status(200).json({
        status: "success",
        msg: "Métodos de pago obtenidos exitosamente",
        payload: { paymentMethods },
      });
    } catch (error) {
      logger.error("Error en getUserPaymentMethods:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Eliminar método de pago
  async removePaymentMethod(req, res) {
    try {
      const { userId, tokenId } = req.params;

      const user = await usersModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      const paymentMethods = user.paymentMethods || [];
      const methodIndex = paymentMethods.findIndex(method => method.token === tokenId);
      
      if (methodIndex === -1) {
        return res.status(404).json({
          status: "error",
          msg: "Método de pago no encontrado",
          payload: {},
        });
      }

      // Si es el método por defecto y hay otros métodos, asignar otro como defecto
      const removedMethod = paymentMethods[methodIndex];
      const updatedMethods = paymentMethods.filter(method => method.token !== tokenId);
      
      if (removedMethod.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }

      const userUpdated = await usersModel.updateOne({
        _id: userId,
        paymentMethods: updatedMethods
      });

      return res.status(200).json({
        status: "success",
        msg: "Método de pago eliminado exitosamente",
        payload: {},
      });
    } catch (error) {
      logger.error("Error en removePaymentMethod:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }

  // Establecer método de pago por defecto
  async setDefaultPaymentMethod(req, res) {
    try {
      const { userId, tokenId } = req.params;

      const user = await usersModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          msg: "Usuario no encontrado",
          payload: {},
        });
      }

      const paymentMethods = user.paymentMethods || [];
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.token === tokenId
      }));

      const userUpdated = await usersModel.updateOne({
        _id: userId,
        paymentMethods: updatedMethods
      });

      return res.status(200).json({
        status: "success",
        msg: "Método de pago por defecto actualizado exitosamente",
        payload: {},
      });
    } catch (error) {
      logger.error("Error en setDefaultPaymentMethod:", error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  }
}

export const paymentMethodsController = new PaymentMethodsController();
