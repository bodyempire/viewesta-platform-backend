import dotenv from 'dotenv';
import { testConnection } from '../src/config/database.js';

dotenv.config();

(async () => {
  console.log('🔍 Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || 5432}`);
  console.log(`  Database: ${process.env.DB_NAME || 'viewesta_db'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}\n`);

  try {
    await testConnection();
    console.log('\n✅ Database connection test PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test FAILED!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check if PostgreSQL is running');
    console.error('  2. Verify database credentials in .env file');
    console.error('  3. Ensure database exists: CREATE DATABASE viewesta_db;');
    process.exit(1);
  }
})();

