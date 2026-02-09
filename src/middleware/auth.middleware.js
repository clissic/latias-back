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

      const userCategories = Array.isArray(req.user.category) ? req.user.category : (req.user.category != null ? [String(req.user.category).trim()] : []);
      const normalizedAllowedCategories = allowedCategories.map(cat => cat?.trim());
      const hasAllowedCategory = userCategories.some(c => normalizedAllowedCategories.includes(String(c).trim()));
      
      if (!hasAllowedCategory) {
        logger.warning(`Usuario ${req.user.userId} con categoría(s) "${userCategories.join(", ")}" intentó acceder a recurso restringido. Categorías permitidas: ${allowedCategories.join(", ")}`);
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

// Middleware para validar que el usuario solo acceda a sus propios datos
// Permite acceso si:
// 1. El usuario es Administrador (puede acceder a cualquier dato)
// 2. El userId en params/body coincide con el usuario autenticado
export const validateUserOwnership = (options = {}) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          msg: "Usuario no autenticado",
          payload: {},
        });
      }

      // Los administradores pueden acceder a cualquier dato
      const categories = Array.isArray(req.user.category) ? req.user.category : (req.user.category != null ? [req.user.category] : []);
      if (categories.includes("Administrador")) {
        return next();
      }

      // Obtener userId de params o body según las opciones
      const userIdParam = options.userIdParam || "userId";
      const userIdFromParams = req.params[userIdParam];
      const userIdFromBody = req.body[userIdParam];
      const requestedUserId = userIdFromParams || userIdFromBody;

      // Convertir a string para comparación
      const authenticatedUserId = String(req.user.userId);
      const requestedUserIdStr = requestedUserId ? String(requestedUserId) : null;

      if (!requestedUserIdStr) {
        logger.warning(`Usuario ${authenticatedUserId} intentó acceder sin especificar userId`);
        return res.status(400).json({
          status: "error",
          msg: "userId es requerido",
          payload: {},
        });
      }

      // Validar que el userId solicitado coincida con el usuario autenticado
      if (authenticatedUserId !== requestedUserIdStr) {
        logger.warning(`Usuario ${authenticatedUserId} intentó acceder a datos del usuario ${requestedUserIdStr}`);
        return res.status(403).json({
          status: "error",
          msg: "No tienes permisos para acceder a estos datos",
          payload: {},
        });
      }

      next();
    } catch (error) {
      logger.error('Error en middleware de validación de propiedad:', error);
      return res.status(500).json({
        status: "error",
        msg: "Error interno del servidor",
        payload: {},
      });
    }
  };
};
