import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/config/database.js';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initSchema = async () => {
  try {
    console.log('📋 Initializing database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await query(schemaSQL);
    console.log('✅ Database schema initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing schema:', error.message);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');
    const seedsPath = path.join(__dirname, 'seeds.sql');
    const seedsSQL = fs.readFileSync(seedsPath, 'utf8');
    await query(seedsSQL);
    console.log('✅ Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

export const dropAllTables = async () => {
  try {
    console.log('⚠️  Dropping all tables...');
    const result = await query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);
    const tables = result.rows.map((row) => row.tablename);
    if (tables.length === 0) {
      console.log('ℹ️  No tables to drop');
      return;
    }
    for (const table of tables.reverse()) {
      await query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`   Dropped table: ${table}`);
    }
    console.log('✅ All tables dropped');
  } catch (error) {
    console.error('❌ Error dropping tables:', error.message);
    throw error;
  }
};

export const initDatabase = async () => {
  try {
    await initSchema();
    await seedDatabase();
    console.log('🎉 Database initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/') || '');

if (isMainModule || process.argv[1]?.includes('init.js')) {
  const command = process.argv[2];

  const run = async (fn, successMessage) => {
    try {
      await fn();
      console.log(successMessage);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    } finally {
      await pool.end();
    }
  };

  if (command === 'init') {
    run(initDatabase, '✅ Database initialization complete!');
  } else if (command === 'schema') {
    run(initSchema, '✅ Schema initialization complete!');
  } else if (command === 'seed') {
    run(seedDatabase, '✅ Database seeding complete!');
  } else if (command === 'drop') {
    run(dropAllTables, '✅ Tables dropped!');
  } else {
    console.log('Usage: node database/init.js [init|schema|seed|drop]');
    process.exit(1);
  }
}

