const { Router } = require('express');
const { getStats } = require('./controller');
const { authMiddleware } = require('../auth/middleware');

const r = Router();

// Dashboard stats
r.get('/stats', authMiddleware(), getStats);

module.exports = r;
