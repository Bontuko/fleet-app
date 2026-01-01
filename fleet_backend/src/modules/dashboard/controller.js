const { db } = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    // Knex counts return an array of objects like [{ count: '5' }]
    const [vehicles] = await db('vehicles').count('* as total');
    const [active] = await db('vehicles').where('status', 'active').count('* as active');
    const [maintenance] = await db('vehicles').where('status', 'maintenance').count('* as maintenance');

    let commandsQuery;
    if (req.user.role === 'admin') {
      [commandsQuery] = await db('commands').where('status', 'queued').count('* as queued');
    } else {
      [commandsQuery] = await db('commands')
        .where('status', 'queued')
        .andWhere('requester_name', req.user.username)
        .count('* as queued');
    }

    res.json({
      totalVehicles: parseInt(vehicles.total || 0),
      activeVehicles: parseInt(active.active || 0),
      maintenance: parseInt(maintenance.maintenance || 0),
      queuedCommands: parseInt(commandsQuery.queued || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
