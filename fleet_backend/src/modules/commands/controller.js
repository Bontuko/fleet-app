const { db } = require('../../config/db');
const { getIO } = require('../../sockets');

/**
 * LIST COMMANDS
 * - Admin: sees all
 * - User: sees only own
 */
exports.list = async (req, res) => {
  try {
    let query = db('commands').orderBy('created_at', 'desc');

    if (req.user.role !== 'admin') {
      query = query.where('requester_name', req.user.username);
    }

    const rows = await query;
    res.json(rows);
  } catch (err) {
    console.error('Fetch commands failed:', err);
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
};

/**
 * CREATE COMMAND (USER)
 */
exports.create = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const [command] = await db('commands').insert({
      requester_name: req.user.username,
      message,
      status: 'queued',
      created_at: db.fn.now()
    }).returning('*');

    // realtime update
    getIO().emit('command:received', command);
    res.status(201).json(command);
  } catch (err) {
    console.error('Create command failed:', err);
    res.status(500).json({ error: 'Failed to create command' });
  }
};

/**
 * ADMIN REPLY TO COMMAND
 */
exports.reply = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response?.trim()) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const [updated] = await db('commands')
      .where({ id })
      .update({
        response,
        status: 'responded'
      })
      .returning('*');

    if (updated) {
      // realtime update to admin + user
      getIO().emit('command:updated', updated);
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Command not found' });
    }
  } catch (err) {
    console.error('Reply failed:', err);
    res.status(500).json({ error: 'Failed to reply to command' });
  }
};
