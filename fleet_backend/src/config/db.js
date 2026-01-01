const knex = require('knex');
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

module.exports = { db }; // Export as 'db' but keep likely usage in mind, though controller expects { pool } structure?
// Actually controller does const { pool } = require...
// So I should probably keep the name 'pool' but mapping to knex, OR update controller.
// Knex doesn't have a 'query' method on the instance exactly like mysql2 pool.
// Better to export { db } and update controller.
