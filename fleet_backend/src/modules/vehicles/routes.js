const { Router } = require('express');
const ctrl = require('./controller');
const { authMiddleware } = require('../auth/middleware');

const r = Router();

// Anyone logged in can list vehicles
r.get('/', authMiddleware(), ctrl.list);

// Only admins can create/update/delete
r.post('/', authMiddleware('admin'), ctrl.create);
r.put('/:id', authMiddleware('admin'), ctrl.update);
r.delete('/:id', authMiddleware('admin'), ctrl.remove);

module.exports = r;
