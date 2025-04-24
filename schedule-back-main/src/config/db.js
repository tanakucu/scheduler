const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'scheduledb',
  password: '99819691',
  port: 5432,
});

module.exports = pool;