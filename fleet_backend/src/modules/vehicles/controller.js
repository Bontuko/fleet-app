// src/modules/vehicles/controller.js
const { pool } = require('../../config/db');
const { getIO } = require('../../sockets');

// List all vehicles
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY updated_at DESC');
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
    const [result] = await pool.query(
      'INSERT INTO vehicles (plate_no, model, status, fuel_level, odometer, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [plate_no, model, status, fuel_level || 0, odometer || 0]
    );
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);
    getIO().emit('vehicle:created', rows[0]);
    res.status(201).json(rows[0]);
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
    await pool.query(
      'UPDATE vehicles SET status = ?, fuel_level = ?, odometer = ?, updated_at = NOW() WHERE id = ?',
      [status, fuel_level, odometer, id]
    );
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    getIO().emit('vehicle:updated', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// Delete vehicle
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
    getIO().emit('vehicle:deleted', { id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};
