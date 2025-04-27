const { User } = require('../models');

/**
 * Obtener todos los usuarios
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Obtener todos los usuarios excepto el usuario actual
    const users = await User.findAll({
      where: {
        id: { $ne: req.user?.id }
      },
      attributes: ['id', 'name', 'email', 'role', 'photoURL', 'isOnline', 'lastSeen'],
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

/**
 * Obtener un usuario por ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar usuario
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'photoURL', 'isOnline', 'lastSeen']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

/**
 * Obtener el perfil del usuario actual
 */
exports.getUserProfile = async (req, res) => {
  try {
    // El usuario ya está adjunto al request por el middleware de autenticación
    const user = req.user;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message
    });
  }
};

/**
 * Actualizar el perfil del usuario actual
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const user = req.user;

    // Actualizar campos
    user.name = name || user.name;
    user.email = email || user.email;
    user.photoURL = photoURL || user.photoURL;

    // Si se proporciona una nueva contraseña, hash antes de guardar
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Guardar cambios
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user
    });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil de usuario',
      error: error.message
    });
  }
};
