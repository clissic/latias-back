import { jwtService } from '../services/jwt.service.js';
import { usersModel } from '../DAO/models/users.model.js';
import { logger } from '../utils/logger.js';

// Middleware de autenticación
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        msg: "Token de acceso requerido",
        payload: {},
      });
    }

    // Extraer token del header
    const token = jwtService.extractTokenFromHeader(authHeader);
    
    // Verificar token
    const decoded = jwtService.verifyToken(token);
    
    // Verificar que el usuario existe
    const user = await usersModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: "error",
        msg: "Usuario no encontrado",
        payload: {},
      });
    }

    // Agregar información del usuario al request
    req.user = {
      userId: user._id,
      email: user.email,
      category: user.category,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    
    if (error.message === 'Token expirado') {
      return res.status(401).json({
        status: "error",
        msg: "Token expirado",
        payload: {},
      });
    } else if (error.message === 'Token inválido') {
      return res.status(401).json({
        status: "error",
        msg: "Token inválido",
        payload: {},
      });
    } else {
      return res.status(401).json({
        status: "error",
        msg: "Error de autenticación",
        payload: {},
      });
    }
  }
};

// Middleware de autorización por categoría
export const authorizeByCategory = (allowedCategories) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          msg: "Usuario no autenticado",
          payload: {},
        });
      }

      const userCategory = req.user.category;
      
      if (!allowedCategories.includes(userCategory)) {
        logger.warning(`Usuario ${req.user.userId} con categoría ${userCategory} intentó acceder a recurso restringido`);
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para acceder a este recurso",
          payload: {},
        });
      }

      next();
    } catch (error) {
      logger.error('Error en middleware de autorización:', error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  };
};

// Middleware para rutas opcionales (token no requerido)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = jwtService.extractTokenFromHeader(authHeader);
    const decoded = jwtService.verifyToken(token);
    
    const user = await usersModel.findById(decoded.userId);
    if (user) {
      req.user = {
        userId: user._id,
        email: user.email,
        category: user.category,
        firstName: user.firstName,
        lastName: user.lastName
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin usuario autenticado
    req.user = null;
    next();
  }
};

