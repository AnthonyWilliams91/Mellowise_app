import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Helper function to calculate tier info based on max position
function getTierInfo(maxPosition: number) {
  // Tier 1: Positions 1-100
  if (maxPosition <= 100) {
    return { tier: 1, price: 15.00, remaining: 100 - maxPosition };
  }
  // Tier 2: Positions 101-200
  else if (maxPosition <= 200) {
    return { tier: 2, price: 20.00, remaining: 200 - maxPosition };
  }
  // Tier 3: Positions 201-300
  else if (maxPosition <= 300) {
    return { tier: 3, price: 25.00, remaining: 300 - maxPosition };
  }
  // Tier 4: Positions 301-400
  else if (maxPosition <= 400) {
    return { tier: 4, price: 30.00, remaining: 400 - maxPosition };
  }
  // Tier 5: Positions 401-500
  else if (maxPosition <= 500) {
    return { tier: 5, price: 35.00, remaining: 500 - maxPosition };
  }
  // Tier 6: Positions 501+ (unlimited)
  else {
    return { tier: 6, price: 49.00, remaining: -1 };
  }
}

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let maxPosition = 0;
    let useMockData = false;

    // Try to get MAX(position) from database
    try {
      const { data, error: queryError } = await supabase
        .from('waitlist_users')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);

      if (queryError) {
        console.warn('Database query failed, using mock data:', queryError.message);
        useMockData = true;
      } else {
        maxPosition = data?.[0]?.position || 0;
      }
    } catch (dbError) {
      console.warn('Database connection failed, using mock data:', dbError);
      useMockData = true;
    }

    // If database is unavailable, use mock data for demo purposes
    if (useMockData) {
      // Simulate realistic waitlist progress (position 53 = Tier 1 with 47 spots remaining)
      maxPosition = 53;
    }

    // Calculate tier information based on max position
    const tierInfo = getTierInfo(maxPosition);

    return NextResponse.json({
      tier: tierInfo.tier,
      price: tierInfo.price,
      spotsRemaining: tierInfo.remaining,
      totalSignups: maxPosition, // Using maxPosition as the effective signup count
      mockData: useMockData // Flag to indicate if using mock data
    });

  } catch (error) {
    console.error('Unexpected error:', error);

    // Fallback to mock data even on unexpected errors
    const tierInfo = getTierInfo(53); // Default to position 53

    return NextResponse.json({
      tier: tierInfo.tier,
      price: tierInfo.price,
      spotsRemaining: tierInfo.remaining,
      totalSignups: 53,
      mockData: true
    });
  }
}
