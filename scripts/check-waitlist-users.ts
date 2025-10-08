import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.local file
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'set' : 'missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWaitlistUsers() {
  console.log('Checking waitlist_users table...\n');

  // Get all users
  const { data: users, error } = await supabase
    .from('waitlist_users')
    .select('id, email, position, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Total users in waitlist: ${users?.length || 0}\n`);

  if (users && users.length > 0) {
    console.log('Recent users:');
    users.forEach((user) => {
      console.log(`  - ${user.email} (position ${user.position}, created: ${user.created_at})`);
    });
  }

  // Check auth.users for both emails
  console.log('\n\nChecking auth.users table...');

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  console.log(`\nTotal auth users: ${authData?.users?.length || 0}\n`);

  if (authData?.users && authData.users.length > 0) {
    authData.users.forEach((user) => {
      console.log(`  - ${user.email} (id: ${user.id}, created: ${user.created_at})`);
    });
  }
}

checkWaitlistUsers().catch(console.error);
