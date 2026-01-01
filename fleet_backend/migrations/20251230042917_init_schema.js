// 20251230042917_init_schema.js

exports.up = async function (knex) {

  // USERS
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('username', 100).notNullable().unique();
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.enum('role', ['admin', 'user']).defaultTo('user');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // VEHICLES
  await knex.schema.createTable('vehicles', (t) => {
    t.increments('id').primary();
    t.string('plate_no', 20).notNullable().unique();
    t.string('model', 50).notNullable();
    t.enum('status', ['active', 'maintenance', 'offline']).defaultTo('active');
    t.integer('fuel_level');
    t.integer('odometer');
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // COMMANDS
  await knex.schema.createTable('commands', (t) => {
    t.increments('id').primary();
    t.string('requester_name', 100).notNullable();
    t.text('message').notNullable();
    t.text('response'); // admin reply
    t.enum('status', ['queued', 'responded']).defaultTo('queued');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('commands');
  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.dropTableIfExists('users');
};
