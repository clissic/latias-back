import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

class JWTService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  // Generar token de acceso
  generateAccessToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        category: payload.category,
        type: 'access'
      };

      const token = jwt.sign(tokenPayload, this.secretKey, {
        expiresIn: this.expiresIn,
        issuer: 'latias-backend',
        audience: 'latias-frontend'
      });

      logger.info(`Token de acceso generado para usuario: ${payload.userId}`);
      return token;
    } catch (error) {
      logger.error('Error al generar token de acceso:', error);
      throw error;
    }
  }

  // Generar token de refresh
  generateRefreshToken(payload) {
    try {
      const tokenPayload = {
        userId: payload.userId,
        type: 'refresh'
      };

      const token = jwt.sign(tokenPayload, this.secretKey, {
        expiresIn: this.refreshExpiresIn,
        issuer: 'latias-backend',
        audience: 'latias-frontend'
      });

      logger.info(`Token de refresh generado para usuario: ${payload.userId}`);
      return token;
    } catch (error) {
      logger.error('Error al generar token de refresh:', error);
      throw error;
    }
  }

  // Generar ambos tokens
  generateTokens(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.expiresIn
    };
  }

  // Verificar token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secretKey, {
        issuer: 'latias-backend',
        audience: 'latias-frontend'
      });

      logger.info(`Token verificado para usuario: ${decoded.userId}`);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('Token expirado');
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        logger.warn('Token inválido');
        throw new Error('Token inválido');
      } else {
        logger.error('Error al verificar token:', error);
        throw new Error('Error al verificar token');
      }
    }
  }

  // Decodificar token sin verificar (para obtener información)
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error al decodificar token:', error);
      return null;
    }
  }

  // Verificar si el token está próximo a expirar
  isTokenExpiringSoon(token, minutesThreshold = 30) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return false;

      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      const thresholdTime = minutesThreshold * 60 * 1000;

      return (expirationTime - currentTime) < thresholdTime;
    } catch (error) {
      logger.error('Error al verificar expiración de token:', error);
      return false;
    }
  }

  // Extraer token del header Authorization
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('Header de autorización no encontrado');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Formato de autorización inválido');
    }

    return parts[1];
  }
}

export const jwtService = new JWTService();
