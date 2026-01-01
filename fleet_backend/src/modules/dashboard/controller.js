const { pool } = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    const [[vehicles]] = await pool.query('SELECT COUNT(*) AS total FROM vehicles');
    const [[active]] = await pool.query("SELECT COUNT(*) AS active FROM vehicles WHERE status = 'active'");
    const [[maintenance]] = await pool.query("SELECT COUNT(*) AS maintenance FROM vehicles WHERE status = 'maintenance'");

    let commandsQuery;
    if (req.user.role === 'admin') {
      [commandsQuery] = await pool.query("SELECT COUNT(*) AS queued FROM commands WHERE status = 'queued'");
    } else {
      [commandsQuery] = await pool.query(
        "SELECT COUNT(*) AS queued FROM commands WHERE status = 'queued' AND requester_name = ?",
        [req.user.username]
      );
    }
    const commands = commandsQuery[0];

    res.json({
      totalVehicles: vehicles.total,
      activeVehicles: active.active,
      maintenance: maintenance.maintenance,
      queuedCommands: commands.queued,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
