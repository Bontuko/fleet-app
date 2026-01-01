const { Router } = require('express');
const ctrl = require('./controller');
const { authMiddleware } = require('./middleware');

const router = Router();

// Public routes
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// Authenticated routes
router.put('/profile', authMiddleware(), ctrl.updateProfile);

// Admin only
router.get('/users', authMiddleware('admin'), ctrl.listUsers);

module.exports = router;
