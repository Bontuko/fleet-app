// src/modules/vehicles/controller.js
const { db } = require('../../config/db');
const { getIO } = require('../../sockets');

// List all vehicles
exports.list = async (req, res) => {
  try {
    const rows = await db('vehicles').orderBy('updated_at', 'desc');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

// Create new vehicle
exports.create = async (req, res) => {
  try {
    const { plate_no, model, status, fuel_level, odometer } = req.body;
    const { plate_no, model, status, fuel_level, odometer } = req.body;
    const [inserted] = await db('vehicles').insert({
      plate_no,
      model,
      status,
      fuel_level: fuel_level || 0,
      odometer: odometer || 0,
      updated_at: db.fn.now()
    }).returning('*');

    // Postgres .returning('*') gives us the row directly, no need for secondary fetch if supported.
    // Knex with PG supports returning.
    getIO().emit('vehicle:created', inserted);
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

// Update vehicle
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, fuel_level, odometer } = req.body;
    const { id } = req.params;
    const { status, fuel_level, odometer } = req.body;

    const [updated] = await db('vehicles')
      .where({ id })
      .update({
        status,
        fuel_level,
        odometer,
        updated_at: db.fn.now()
      })
      .returning('*');

    getIO().emit('vehicle:updated', updated);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// Delete vehicle
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { id } = req.params;
    await db('vehicles').where({ id }).del();
    getIO().emit('vehicle:deleted', { id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};
