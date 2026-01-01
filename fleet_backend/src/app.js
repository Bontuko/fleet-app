const express = require('express');
const cors = require('cors');
const vehiclesRoutes = require('./modules/vehicles/routes');
const commandsRoutes = require('./modules/commands/routes');
const authRoutes = require('./modules/auth/routes');
const dashboardRoutes = require('./modules/dashboard/routes'); // ✅ new

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/commands', commandsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes); // ✅ new

module.exports = app;
