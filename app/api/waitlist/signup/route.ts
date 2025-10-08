import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to calculate tier based on position
function getTierByPosition(position: number): { tier: number; price: number } {
  if (position <= 100) return { tier: 1, price: 15 };
  if (position <= 200) return { tier: 2, price: 20 };
  if (position <= 300) return { tier: 3, price: 25 };
  if (position <= 400) return { tier: 4, price: 30 };
  if (position <= 500) return { tier: 5, price: 35 };
  return { tier: 6, price: 49 };
}

// Helper function to generate referral code
function generateReferralCode(firstName: string | null, position: number): string {
  // Format: firstname123 (lowercase, alphanumeric only)
  const cleanName = firstName
    ? firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 10)
    : 'user';
  return `${cleanName}${position}`;
}

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = user.email!;
    const firstName = user.user_metadata?.full_name?.split(' ')[0] || null;
    const oauthProvider = user.app_metadata?.provider || null;
    const oauthProviderId = user.id;

    // Get IP and user agent for fraud detection
    const signupIp = getClientIp(request);
    const signupUserAgent = request.headers.get('user-agent') || 'unknown';

    // 2. Check if user already exists in waitlist
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // User already signed up, return their existing data
      return NextResponse.json({
        success: true,
        data: {
          userId: existingUser.id,
          position: existingUser.position,
          tier: existingUser.tier_current,
          price: existingUser.price_current,
          referralCode: existingUser.referral_code,
          message: 'You are already on the waitlist!'
        }
      });
    }

    // 3. Get current total signups to determine next position
    const { count, error: countError } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting signups:', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to get waitlist count' },
        { status: 500 }
      );
    }

    const nextPosition = (count || 0) + 1;

    // 4. Calculate tier and price for this position
    const { tier, price } = getTierByPosition(nextPosition);

    // 5. Generate unique referral code
    const referralCode = generateReferralCode(firstName, nextPosition);

    // 6. Insert new user into waitlist_users table
    const { data: newUser, error: insertError } = await supabase
      .from('waitlist_users')
      .insert({
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
        email_verified: user.email_verified || false,
        verified_at: user.email_verified ? new Date().toISOString() : null,
        signup_ip: signupIp,
        signup_user_agent: signupUserAgent,
        activation_status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to add you to waitlist' },
        { status: 500 }
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: {
        userId: newUser.id,
        position: newUser.position,
        tier: newUser.tier_current,
        price: newUser.price_current,
        referralCode: newUser.referral_code,
        message: 'Successfully added to waitlist!'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
