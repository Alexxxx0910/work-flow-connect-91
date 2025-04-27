
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para verificar token JWT
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Obtener token de los headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Añadir usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    
    // Verificar si es un error de token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        expired: true
      });
    }
    
    // Otros errores de token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // Error del servidor
    res.status(500).json({
      success: false,
      message: 'Error en verificación de autenticación'
    });
  }
};

/**
 * Middleware para token opcional (no requiere autenticación pero usa el token si está presente)
 */
exports.optionalToken = async (req, res, next) => {
  try {
    // Obtener token de los headers
    const authHeader = req.headers.authorization;
    
    // Si no hay token, continuar sin autenticar
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findByPk(decoded.id);
    
    if (user) {
      // Añadir usuario al request
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Si hay error en el token, simplemente continuar sin autenticar
    next();
  }
};
