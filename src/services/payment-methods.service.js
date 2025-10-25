import { MercadoPagoConfig, CardToken } from 'mercadopago';
import { logger } from '../utils/logger.js';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

class PaymentMethodsService {
  // Crear token de tarjeta
  async createCardToken(cardData) {
    try {
      const cardToken = new CardToken(client);
      
      const tokenData = {
        card_number: cardData.cardNumber,
        security_code: cardData.securityCode,
        expiration_month: cardData.expirationMonth,
        expiration_year: cardData.expirationYear,
        cardholder: {
          name: cardData.cardholderName,
          identification: {
            type: cardData.identificationType || 'DNI',
            number: cardData.identificationNumber
          }
        }
      };

      const response = await cardToken.create({ body: tokenData });
      
      logger.info(`Token de tarjeta creado: ${response.id}`);
      return response;
    } catch (error) {
      logger.error('Error al crear token de tarjeta:', error);
      throw error;
    }
  }

  // Obtener información de tarjeta desde token
  async getCardInfo(tokenId) {
    try {
      const cardToken = new CardToken(client);
      const response = await cardToken.get({ id: tokenId });
      
      return {
        lastFourDigits: response.last_four_digits,
        cardType: response.card_type,
        expirationMonth: response.expiration_month,
        expirationYear: response.expiration_year,
        cardholderName: response.cardholder.name
      };
    } catch (error) {
      logger.error('Error al obtener información de tarjeta:', error);
      throw error;
    }
  }

  // Validar datos de tarjeta antes de tokenizar
  validateCardData(cardData) {
    const errors = [];

    if (!cardData.cardNumber || !/^\d{13,19}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
      errors.push('Número de tarjeta inválido');
    }

    if (!cardData.securityCode || !/^\d{3,4}$/.test(cardData.securityCode)) {
      errors.push('Código de seguridad inválido');
    }

    if (!cardData.expirationMonth || !/^(0[1-9]|1[0-2])$/.test(cardData.expirationMonth)) {
      errors.push('Mes de vencimiento inválido');
    }

    if (!cardData.expirationYear || !/^\d{4}$/.test(cardData.expirationYear)) {
      errors.push('Año de vencimiento inválido');
    }

    if (!cardData.cardholderName || cardData.cardholderName.trim().length < 2) {
      errors.push('Nombre del titular inválido');
    }

    return errors;
  }

  // Formatear datos de tarjeta para almacenamiento seguro
  formatCardForStorage(tokenId, cardInfo, isDefault = false) {
    return {
      token: tokenId,
      lastFourDigits: cardInfo.lastFourDigits,
      cardType: cardInfo.cardType,
      expirationMonth: cardInfo.expirationMonth,
      expirationYear: cardInfo.expirationYear,
      cardholderName: cardInfo.cardholderName,
      isDefault: isDefault,
      createdAt: new Date()
    };
  }
}

export const paymentMethodsService = new PaymentMethodsService();
