
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, optionalToken } = require('../middleware/auth');

// Rutas que requieren autenticación
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateUserProfile);
router.get('/all', verifyToken, userController.getAllUsers);

// Rutas públicas
router.get('/:userId', optionalToken, userController.getUserById);

module.exports = router;
