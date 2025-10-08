import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: any = {
    url: supabaseUrl,
    tables: {},
    functions: {},
  };

  // Check tables
  const tables = ['waitlist_users', 'referrals', 'social_shares', 'email_events'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      results.tables[table] = {
        exists: false,
        error: error.message
      };
    } else {
      results.tables[table] = {
        exists: true,
        count: count
      };
    }
  }

  // Check functions
  try {
    const { data: tierData, error: tierError } = await supabase
      .rpc('get_current_tier', { total_signups: 0 });

    results.functions.get_current_tier = tierError
      ? { exists: false, error: tierError.message }
      : { exists: true, result: tierData };
  } catch (err: any) {
    results.functions.get_current_tier = { exists: false, error: err.message };
  }

  try {
    const { data: posData, error: posError } = await supabase
      .rpc('get_tier_by_position', { pos: 1 });

    results.functions.get_tier_by_position = posError
      ? { exists: false, error: posError.message }
      : { exists: true, result: posData };
  } catch (err: any) {
    results.functions.get_tier_by_position = { exists: false, error: err.message };
  }

  return NextResponse.json(results, { status: 200 });
}
