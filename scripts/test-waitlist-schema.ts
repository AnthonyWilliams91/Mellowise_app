import { createClient } from '@supabase/supabase-js';

async function testSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Checking if waitlist_users table exists...');

  // Try to count rows in waitlist_users table
  const { count, error } = await supabase
    .from('waitlist_users')
    .select('*', { count: 'exact', head: true });

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Table does not exist yet. Please apply migration manually.');
      console.log('\n📝 To apply the migration:');
      console.log('1. Go to: https://supabase.com/dashboard/project/kptfedjloznfgvlocthf/sql/new');
      console.log('2. Copy the contents of: supabase/migrations/020_waitlist_system.sql');
      console.log('3. Paste into the SQL editor and click "Run"');
      process.exit(1);
    } else {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  console.log(`✅ waitlist_users table exists! Current count: ${count}`);

  // Test the SQL functions
  console.log('\n📊 Testing SQL functions...');

  try {
    const { data: tierData, error: tierError } = await supabase
      .rpc('get_current_tier', { total_signups: 0 });

    if (tierError) throw tierError;
    console.log('✅ get_current_tier(0):', tierData);

    const { data: posTierData, error: posTierError } = await supabase
      .rpc('get_tier_by_position', { pos: 1 });

    if (posTierError) throw posTierError;
    console.log('✅ get_tier_by_position(1):', posTierData);

  } catch (err: any) {
    console.error('❌ Function test failed:', err.message);
  }
}

testSchema();
