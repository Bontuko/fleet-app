const { Router } = require('express');
const ctrl = require('./controller');
const { authMiddleware } = require('../auth/middleware');

const r = Router();

r.get('/', authMiddleware(), ctrl.list);
r.post('/', authMiddleware(), ctrl.create);

// admin reply
r.put('/:id/reply', authMiddleware('admin'), ctrl.reply);

module.exports = r;
