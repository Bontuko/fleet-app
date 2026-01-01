// 01_admin_user.js
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  const adminEmail = 'admin@example.com';

  // Check if admin already exists
  const existing = await knex('users').where({ email: adminEmail }).first();
  if (existing) {
    console.log('Admin user already exists.');
    return;
  }

  const hash = await bcrypt.hash('admin123', 10);

  await knex('users').insert({
    username: 'adminuser',
    email: adminEmail,
    password_hash: hash,
    role: 'admin',
    created_at: new Date(), // ✅ include created_at
  });

  console.log('Admin user created successfully.');
};
