import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Checking Supabase database...\n');
console.log(`URL: ${supabaseUrl}\n`);

const tables = ['waitlist_users', 'referrals', 'social_shares', 'email_events'];

console.log('📋 Checking for waitlist tables:\n');

for (const table of tables) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log(`❌ ${table}: NOT FOUND`);
    } else {
      console.log(`❌ ${table}: ERROR -`, error.message);
    }
  } else {
    console.log(`✅ ${table}: EXISTS (${count} rows)`);
  }
}

console.log('\n🧪 Checking SQL functions:\n');

try {
  const { data, error } = await supabase.rpc('get_current_tier', { total_signups: 0 });

  if (error) {
    console.log('❌ get_current_tier: NOT FOUND');
  } else {
    console.log('✅ get_current_tier: EXISTS');
  }
} catch (err) {
  console.log('❌ get_current_tier: NOT FOUND');
}

try {
  const { data, error } = await supabase.rpc('get_tier_by_position', { pos: 1 });

  if (error) {
    console.log('❌ get_tier_by_position: NOT FOUND');
  } else {
    console.log('✅ get_tier_by_position: EXISTS');
  }
} catch (err) {
  console.log('❌ get_tier_by_position: NOT FOUND');
}

console.log('\n' + '='.repeat(60));
console.log('NEXT STEP: Apply the migration manually');
console.log('='.repeat(60));
console.log('\n1. Go to: https://supabase.com/dashboard/project/kptfedjloznfgvlocthf/sql/new');
console.log('2. Open: supabase/migrations/020_waitlist_system.sql');
console.log('3. Copy ALL contents');
console.log('4. Paste into SQL editor');
console.log('5. Click "Run"\n');
