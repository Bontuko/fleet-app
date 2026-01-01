const { db } = require('../../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await db('users')
      .where('username', username)
      .orWhere('email', email)
      .first();

    if (exists) return res.status(400).json({ error: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    await db('users').insert({
      username,
      email,
      password_hash: hash,
      role: 'user'
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db('users').where('username', username).first();

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT secret not set' });

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Update user profile (PUT /profile)
exports.updateProfile = async (req, res) => {
  try {
    const { username, password } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    if (Object.keys(updates).length > 0) {
      await db('users').where({ id: req.user.id }).update(updates);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

// List all users (for admin dropdown when sending commands)
exports.listUsers = async (req, res) => {
  try {
    const rows = await db('users')
      .select('id', 'username', 'email', 'role')
      .orderBy('username');
    res.json(rows);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
