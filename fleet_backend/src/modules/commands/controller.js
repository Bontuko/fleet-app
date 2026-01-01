const { pool } = require('../../config/db');
const { getIO } = require('../../sockets');

/**
 * LIST COMMANDS
 * - Admin: sees all
 * - User: sees only own
 */
exports.list = async (req, res) => {
  try {
    let rows;

    if (req.user.role === 'admin') {
      [rows] = await pool.query(
        'SELECT * FROM commands ORDER BY created_at DESC'
      );
    } else {
      [rows] = await pool.query(
        'SELECT * FROM commands WHERE requester_name = ? ORDER BY created_at DESC',
        [req.user.username]
      );
    }

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

    const [result] = await pool.query(
      `INSERT INTO commands (requester_name, message, status, created_at)
       VALUES (?, ?, 'queued', NOW())`,
      [req.user.username, message]
    );

    const [[command]] = await pool.query(
      'SELECT * FROM commands WHERE id = ?',
      [result.insertId]
    );

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

    // update command
    await pool.query(
      `UPDATE commands
       SET response = ?, status = 'responded'
       WHERE id = ?`,
      [response, id]
    );

    const [[updated]] = await pool.query(
      'SELECT * FROM commands WHERE id = ?',
      [id]
    );

    // realtime update to admin + user
    getIO().emit('command:updated', updated);

    res.json(updated);
  } catch (err) {
    console.error('Reply failed:', err);
    res.status(500).json({ error: 'Failed to reply to command' });
  }
};
