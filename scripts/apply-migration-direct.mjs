import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Reading migration file...\n');

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '020_waitlist_system.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Split the SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments and empty statements
    if (statement.startsWith('--') || statement.trim() === ';') {
      continue;
    }

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        // Check if it's a "already exists" error (which is OK)
        if (error.message.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Already exists (skipping)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`✅ [${i + 1}/${statements.length}] Success`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${statements.length}] Exception:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} succeeded, ${errorCount} failed\n`);

  // Test the tables
  console.log('🔍 Verifying tables exist...\n');

  const tables = ['waitlist_users', 'referrals', 'social_shares', 'email_events'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: NOT FOUND`);
    } else {
      console.log(`✅ ${table}: exists (${count} rows)`);
    }
  }

  console.log('\n🧪 Testing SQL functions...\n');

  try {
    const { data: tierData, error: tierError } = await supabase
      .rpc('get_current_tier', { total_signups: 0 });

    if (tierError) {
      console.log('❌ get_current_tier: FAILED -', tierError.message);
    } else {
      console.log('✅ get_current_tier(0):', tierData);
    }
  } catch (err) {
    console.log('❌ get_current_tier: FAILED -', err.message);
  }

  try {
    const { data: posData, error: posError } = await supabase
      .rpc('get_tier_by_position', { pos: 1 });

    if (posError) {
      console.log('❌ get_tier_by_position: FAILED -', posError.message);
    } else {
      console.log('✅ get_tier_by_position(1):', posData);
    }
  } catch (err) {
    console.log('❌ get_tier_by_position: FAILED -', err.message);
  }
}

applyMigration().catch(console.error);
