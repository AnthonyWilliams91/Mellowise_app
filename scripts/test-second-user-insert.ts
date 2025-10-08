import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.local file
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  // Simulate what the auth callback would do for the second user
  const email = 'steroids91fromcali@gmail.com';
  const firstName = null; // This is likely the issue - no name from Google
  const oauthProvider = 'google';
  const oauthProviderId = '72ab649b-0f0f-4f7f-b288-18ec27abab5c';

  // Get current total signups (would be 1)
  const { count } = await supabase
    .from('waitlist_users')
    .select('*', { count: 'exact', head: true });

  console.log('Current count:', count);

  const nextPosition = (count || 0) + 1;
  console.log('Next position would be:', nextPosition);

  // Calculate tier
  function getTierByPosition(position: number): { tier: number; price: number } {
    if (position <= 100) return { tier: 1, price: 15 };
    if (position <= 200) return { tier: 2, price: 20 };
    if (position <= 300) return { tier: 3, price: 25 };
    if (position <= 400) return { tier: 4, price: 30 };
    if (position <= 500) return { tier: 5, price: 35 };
    return { tier: 6, price: 49 };
  }

  function generateReferralCode(firstName: string | null, position: number): string {
    const cleanName = firstName
      ? firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 10)
      : 'user';
    return `${cleanName}${position}`;
  }

  const { tier, price } = getTierByPosition(nextPosition);
  const referralCode = generateReferralCode(firstName, nextPosition);

  console.log('\nAttempting insert with:');
  console.log('  email:', email);
  console.log('  first_name:', firstName);
  console.log('  position:', nextPosition);
  console.log('  referral_code:', referralCode);
  console.log('  tier:', tier);
  console.log('  price:', price);

  // THIS IS THE EXACT INSERT THAT FAILED
  const { data, error } = await supabase.from('waitlist_users').insert({
    email,
    first_name: firstName,
    position: nextPosition,
    tier_at_signup: tier,
    price_at_signup: price,
    tier_current: tier,
    price_current: price,
    referral_code: referralCode,
    oauth_provider: oauthProvider,
    oauth_provider_id: oauthProviderId,
    email_verified: true,
    verified_at: new Date().toISOString(),
    signup_ip: 'unknown',
    signup_user_agent: 'unknown',
    activation_status: 'pending'
  });

  if (error) {
    console.error('\n❌ INSERT FAILED:');
    console.error(error);
  } else {
    console.log('\n✅ Insert successful:', data);
  }
}

testInsert().catch(console.error);
