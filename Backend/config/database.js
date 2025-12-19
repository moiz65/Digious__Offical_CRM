const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'digious_crm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log(`\n🗄️  PostgreSQL Connection Pool Configuration:`);
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Port: ${process.env.DB_PORT || 5432}`);
console.log(`   Database: ${process.env.DB_NAME || 'digious_crm'}`);
console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
console.log(`   Max Connections: 20`);

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected to pool');
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err.message);
  } else {
    console.log(`✅ Database is ready - Current Time: ${res.rows[0].now}`);
  }
});

module.exports = pool;
