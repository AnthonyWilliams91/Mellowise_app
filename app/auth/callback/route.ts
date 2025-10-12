import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  return 'unknown';
}

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestUrl = new URL(request.url);

  // 🔴 CRITICAL: Log EVERY callback attempt
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🔵 [${timestamp}] CALLBACK ROUTE INVOKED`);
  console.log(`📍 Full URL: ${request.url}`);
  console.log(`🔑 Search Params:`, Object.fromEntries(requestUrl.searchParams));
  console.log(`🌐 Headers:`, {
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    ip: getClientIp(request)
  });
  console.log('═══════════════════════════════════════════════════════');

  const code = requestUrl.searchParams.get('code');

  if (!code) {
    console.error('❌ No auth code provided in callback');
    return NextResponse.redirect(`${requestUrl.origin}/home?error=no_code`);
  }

  console.log(`✓ Auth code present: ${code.substring(0, 10)}...`);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log(`🔄 Exchange result: ${error ? `ERROR: ${error.message}` : 'SUCCESS'}`);

    if (error) {
      console.error('❌ Error exchanging code for session:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return NextResponse.redirect(`${requestUrl.origin}/home?error=auth_failed&details=${encodeURIComponent(error.message)}`);
    }

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const email = user.email!;
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || null;
      const oauthProvider = user.app_metadata?.provider || null;
      const oauthProviderId = user.id;
      const signupIp = getClientIp(request);
      const signupUserAgent = request.headers.get('user-agent') || 'unknown';

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('waitlist_users')
        .select('*')
        .eq('email', email)
        .single();

      if (!existingUser) {
        console.log(`🔵 Attempting to add user to waitlist: ${email}`);

        // Use atomic database function to insert user and assign position
        const { data: insertResult, error: insertError } = await supabase.rpc('insert_waitlist_user', {
          p_email: email,
          p_first_name: firstName,
          p_oauth_provider: oauthProvider,
          p_oauth_provider_id: oauthProviderId,
          p_email_verified: user.email_verified || false,
          p_verified_at: user.email_verified ? new Date().toISOString() : null,
          p_signup_ip: signupIp,
          p_signup_user_agent: signupUserAgent
        });

        console.log(`📊 RPC Response for ${email}:`, JSON.stringify({ insertResult, insertError }, null, 2));

        if (insertError) {
          console.error(`❌ Failed to add user to waitlist: ${email}`, JSON.stringify(insertError, null, 2));
          return NextResponse.redirect(`${requestUrl.origin}/home?error=signup_failed`);
        }

        if (insertResult && insertResult.length > 0) {
          const userData = insertResult[0];
          console.log(`✓ Successfully added user to waitlist: ${email} at position ${userData.user_position}`);
        } else {
          console.error(`⚠️ RPC succeeded but returned empty result for ${email}`);
          return NextResponse.redirect(`${requestUrl.origin}/home?error=signup_failed`);
        }
      } else {
        console.log(`ℹ️ User already exists: ${email} at position ${existingUser.position}`);
      }
    }
  }

  // Redirect to success page
  return NextResponse.redirect(`${requestUrl.origin}/waitlist/success`);
}
