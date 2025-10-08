const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');

async function applyMigration() {
  // Connection string from Supabase project settings
  const connectionString = `postgresql://postgres.kptfedjloznfgvlocthf:${process.env.SUPABASE_DB_PASSWORD || 'your-db-password'}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📦 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '020_waitlist_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Executing migration...');
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Test the functions
    console.log('\n📊 Testing SQL functions...');

    const tierResult = await pool.query('SELECT * FROM get_current_tier(0)');
    console.log('✅ get_current_tier(0):', tierResult.rows[0]);

    const posTierResult = await pool.query('SELECT * FROM get_tier_by_position(1)');
    console.log('✅ get_tier_by_position(1):', posTierResult.rows[0]);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
