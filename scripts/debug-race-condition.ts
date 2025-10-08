import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateRaceCondition() {
  console.log('Simulating what happens when 2 signups happen nearly simultaneously...\n');

  // Simulate two signups happening at the same time
  const email1 = 'race-test-1@example.com';
  const email2 = 'race-test-2@example.com';

  // Both requests get the count at the same time
  const { count: count1 } = await supabase
    .from('waitlist_users')
    .select('*', { count: 'exact', head: true });

  const { count: count2 } = await supabase
    .from('waitlist_users')
    .select('*', { count: 'exact', head: true });

  console.log('User 1 sees count:', count1);
  console.log('User 2 sees count:', count2);

  const nextPosition1 = (count1 || 0) + 1;
  const nextPosition2 = (count2 || 0) + 1;

  console.log('\nUser 1 calculated position:', nextPosition1);
  console.log('User 2 calculated position:', nextPosition2);
  console.log('❌ BOTH USERS WILL TRY TO INSERT AT THE SAME POSITION!\n');

  // Both try to insert with the same position
  console.log('Attempting insert for User 1...');
  const { error: error1 } = await supabase.from('waitlist_users').insert({
    email: email1,
    position: nextPosition1,
    tier_at_signup: 1,
    price_at_signup: 15,
    tier_current: 1,
    price_current: 15,
    referral_code: `race1${nextPosition1}`,
    activation_status: 'pending'
  });

  if (error1) {
    console.log('User 1 insert failed:', error1.message);
  } else {
    console.log('User 1 insert succeeded at position', nextPosition1);
  }

  console.log('\nAttempting insert for User 2...');
  const { error: error2 } = await supabase.from('waitlist_users').insert({
    email: email2,
    position: nextPosition2,
    tier_at_signup: 1,
    price_at_signup: 15,
    tier_current: 1,
    price_current: 15,
    referral_code: `race2${nextPosition2}`,
    activation_status: 'pending'
  });

  if (error2) {
    console.log('❌ User 2 insert FAILED:', error2.message);
    console.log('Error code:', error2.code);
    console.log('\n🐛 THIS IS THE BUG! The auth callback does not check for insert errors!');
  } else {
    console.log('User 2 insert succeeded at position', nextPosition2);
  }

  // Cleanup
  console.log('\nCleaning up test data...');
  await supabase.from('waitlist_users').delete().eq('email', email1);
  await supabase.from('waitlist_users').delete().eq('email', email2);
  console.log('✓ Cleanup complete');
}

simulateRaceCondition().catch(console.error);
