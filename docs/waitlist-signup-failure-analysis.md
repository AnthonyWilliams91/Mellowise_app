# Waitlist Signup Failure Analysis - October 8, 2025

## Critical Issue: Second User Signup Failure

### Problem Summary
Second user signup (anthonyrwilliams91@gmail.com) authenticated successfully but **failed to insert into waitlist_users table**, resulting in a 404 error instead of success page.

---

## Investigation Timeline

### Database State
**Current State:**
- ✅ **steroids91fromcali@gmail.com**: Successfully in waitlist_users at position 1, referral code "anthony1"
- ❌ **anthonyrwilliams91@gmail.com**: In auth.users but NOT in waitlist_users (orphaned authentication)

**Evidence from Database:**
```sql
-- auth.users (both users authenticated)
auth_user_id                          | email                         | full_name        | auth_created_at
c241e2d0-2b85-496b-8a0e-695f9761e041 | steroids91fromcali@gmail.com | Anthony Williams | 2025-10-07 04:30:42
233872fd-601b-4a23-9b17-fe21fc8245f5 | anthonyrwilliams91@gmail.com | Anthony Williams | 2025-10-08 03:59:01

-- waitlist_users (only one user inserted)
id                                    | email                         | position | referral_code
ce59dc3b-ce36-46bd-ba4a-bbc52576183a | steroids91fromcali@gmail.com | 1        | anthony1
```

---

## Root Cause Analysis

### The Smoking Gun: UNIQUE Constraint Violation on `referral_code`

**What Happened:**
1. **First signup attempt** (anthonyrwilliams91@gmail.com):
   - OAuth succeeded → Created in auth.users
   - RPC function calculated position 1, referral code "anthony1"
   - **Silent failure** during INSERT due to UNIQUE constraint conflict
   - Server logs showed: `✓ Added user to waitlist: anthonyrwilliams91@gmail.com at position 1` (misleading success message)

2. **Second signup attempt** (steroids91fromcali@gmail.com):
   - OAuth succeeded → Created in auth.users
   - RPC function ALSO calculated position 1, referral code "anthony1"
   - **Successfully inserted** (first one failed, so no conflict this time)
   - Server logs showed full RPC response with proper error handling

### Why Both Got Position 1

**The Race Condition Issue:**

The `insert_waitlist_user` function uses:
```sql
LOCK TABLE waitlist_users IN SHARE ROW EXCLUSIVE MODE;
SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_position FROM waitlist_users;
```

**PROBLEM:** Both users attempted signup when the table was **empty** (position 0):
- First attempt: MAX(position) = 0, so v_next_position = 1
- Table still empty because first INSERT failed
- Second attempt: MAX(position) STILL 0, so v_next_position = 1 again

### Why the UNIQUE Constraint Failed

Both users have the same OAuth profile:
- **full_name**: "Anthony Williams"
- **first_name**: "Anthony" (extracted from full_name)
- **Generated referral_code**: `anthony1` (first_name + position)

**Constraint Definition:**
```sql
UNIQUE (referral_code)  -- This caused the silent failure
UNIQUE (position)       -- This would have also failed
UNIQUE (email)          -- This is fine (different emails)
```

---

## Technical Deep Dive

### The insert_waitlist_user Function

**Current Implementation:**
```sql
-- Generate referral code
IF p_first_name IS NOT NULL AND p_first_name != '' THEN
  v_referral_code := lower(regexp_replace(p_first_name, '[^a-zA-Z]', '', 'g')) || v_next_position::text;
ELSE
  v_referral_code := 'user' || v_next_position::text;
END IF;

-- Insert the user
INSERT INTO waitlist_users (...) VALUES (...);
RETURNING waitlist_users.id INTO v_id;

-- Return the user data
RETURN QUERY SELECT v_id, v_next_position, v_tier, v_price, v_referral_code;
```

**CRITICAL FLAW:** No error handling! If INSERT fails:
- Function returns empty result set
- Client code doesn't catch the failure
- User gets misleading success message

---

## Server Log Analysis

### What We Found in Logs

```
✓ Added user to waitlist: anthonyrwilliams91@gmail.com at position 1
```
**This is the BAD log** - it's from the first attempt where the INSERT silently failed but the function didn't throw an error.

```
📊 RPC Response for steroids91fromcali@gmail.com: {
  "insertResult": [
    {
      "user_id": "ce59dc3b-ce36-46bd-ba4a-bbc52576183a",
      "user_position": 1,
      "tier_current": 1,
      "price_current": 15,
      "referral_code": "anthony1"
    }
  ],
  "insertError": null
}
✓ Successfully added user to waitlist: steroids91fromcali@gmail.com at position 1
```
**This is the GOOD log** - it shows the full RPC response with proper data.

### Why No Error in insertError?

The RPC call succeeded (function returned), but the INSERT inside the function failed silently. PostgreSQL didn't throw an exception - it just returned 0 rows affected.

---

## Context7 Research: Supabase RPC Best Practices

From Supabase documentation research:

### Key Finding 1: PL/pgSQL Error Handling
**Best Practice:** Use `RAISE EXCEPTION` to force transaction rollback on failures:

```sql
-- Bad (current implementation)
INSERT INTO waitlist_users (...) VALUES (...);
RETURNING waitlist_users.id INTO v_id;

-- Good (recommended)
INSERT INTO waitlist_users (...) VALUES (...)
RETURNING waitlist_users.id INTO v_id;

IF v_id IS NULL THEN
  RAISE EXCEPTION 'Failed to insert user: %', p_email;
END IF;
```

### Key Finding 2: Table Locking vs Advisory Locks
**Current:** `LOCK TABLE waitlist_users IN SHARE ROW EXCLUSIVE MODE`
**Issue:** This locks the ENTIRE table, blocking all concurrent operations

**Better Alternative:** Use advisory locks for specific operations:
```sql
-- Advisory lock on a specific resource
PERFORM pg_advisory_xact_lock(hashtext('waitlist_position_sequence'));
```

### Key Finding 3: Constraint Violation Handling
**Issue:** UNIQUE constraints can cause silent failures in PL/pgSQL
**Solution:** Use exception handling blocks:

```sql
BEGIN
  INSERT INTO waitlist_users (...) VALUES (...);
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Duplicate detected: % (detail: %)', SQLERRM, SQLSTATE;
END;
```

---

## Recommended Fixes

### Fix 1: Enhance Referral Code Generation (IMMEDIATE PRIORITY)

**Problem:** Two users with same first name get same referral code

**Solution:** Make referral codes globally unique using UUID or timestamp:

```sql
-- Option A: Add UUID suffix
v_referral_code := lower(regexp_replace(p_first_name, '[^a-zA-Z]', '', 'g')) ||
                   substring(gen_random_uuid()::text, 1, 6);

-- Option B: Add timestamp suffix
v_referral_code := lower(regexp_replace(p_first_name, '[^a-zA-Z]', '', 'g')) ||
                   to_char(NOW(), 'YYYYMMDDHH24MISS')::text;

-- Option C (RECOMMENDED): Combine position + email hash for uniqueness
v_referral_code := lower(regexp_replace(p_first_name, '[^a-zA-Z]', '', 'g')) ||
                   v_next_position::text ||
                   substring(md5(p_email), 1, 4);
-- Example: anthony1a3f2 (anthony + position 1 + email hash a3f2)
```

### Fix 2: Add Robust Error Handling (CRITICAL)

**Replace the current function with:**

```sql
CREATE OR REPLACE FUNCTION insert_waitlist_user(
  p_email VARCHAR,
  p_first_name VARCHAR,
  p_oauth_provider VARCHAR,
  p_oauth_provider_id VARCHAR,
  p_email_verified BOOLEAN,
  p_verified_at TIMESTAMP WITH TIME ZONE,
  p_signup_ip VARCHAR,
  p_signup_user_agent TEXT
)
RETURNS TABLE(
  user_id UUID,
  user_position INTEGER,
  tier_current INTEGER,
  price_current DECIMAL,
  referral_code VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_position INTEGER;
  v_tier INTEGER;
  v_price DECIMAL;
  v_referral_code VARCHAR;
  v_id UUID;
BEGIN
  -- Use advisory lock instead of table lock for better concurrency
  PERFORM pg_advisory_xact_lock(hashtext('waitlist_position_sequence'));

  -- Get next position atomically
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_next_position FROM waitlist_users;

  -- Calculate tier and price
  IF v_next_position <= 100 THEN
    v_tier := 1;
    v_price := 15.00;
  ELSIF v_next_position <= 200 THEN
    v_tier := 2;
    v_price := 20.00;
  ELSIF v_next_position <= 300 THEN
    v_tier := 3;
    v_price := 25.00;
  ELSIF v_next_position <= 400 THEN
    v_tier := 4;
    v_price := 30.00;
  ELSIF v_next_position <= 500 THEN
    v_tier := 5;
    v_price := 35.00;
  ELSE
    v_tier := 6;
    v_price := 49.00;
  END IF;

  -- Generate unique referral code (FIXED: includes email hash for uniqueness)
  IF p_first_name IS NOT NULL AND p_first_name != '' THEN
    v_referral_code := lower(regexp_replace(p_first_name, '[^a-zA-Z]', '', 'g')) ||
                       v_next_position::text ||
                       substring(md5(p_email), 1, 4);
  ELSE
    v_referral_code := 'user' || v_next_position::text ||
                       substring(md5(p_email), 1, 4);
  END IF;

  -- Insert with error handling
  BEGIN
    INSERT INTO waitlist_users (
      email,
      first_name,
      position,
      tier_at_signup,
      price_at_signup,
      tier_current,
      price_current,
      referral_code,
      oauth_provider,
      oauth_provider_id,
      email_verified,
      verified_at,
      signup_ip,
      signup_user_agent,
      activation_status
    ) VALUES (
      p_email,
      p_first_name,
      v_next_position,
      v_tier,
      v_price,
      v_tier,
      v_price,
      v_referral_code,
      p_oauth_provider,
      p_oauth_provider_id,
      p_email_verified,
      p_verified_at,
      p_signup_ip,
      p_signup_user_agent,
      'pending'
    )
    RETURNING waitlist_users.id INTO v_id;

  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Duplicate entry detected for email %. Position % or referral code % may already exist.',
                      p_email, v_next_position, v_referral_code
        USING HINT = 'This user may have already signed up. Check waitlist_users table.';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to insert waitlist user %: % (SQLSTATE: %)',
                      p_email, SQLERRM, SQLSTATE;
  END;

  -- Verify insertion succeeded
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Insert returned NULL id for user %', p_email;
  END IF;

  -- Log successful insertion
  RAISE LOG 'Successfully inserted waitlist user % at position % with referral code %',
            p_email, v_next_position, v_referral_code;

  -- Return the user data
  RETURN QUERY SELECT v_id, v_next_position, v_tier, v_price, v_referral_code;
END;
$$;
```

### Fix 3: Improve Client-Side Error Handling

**Update app/auth/callback/route.ts:**

```typescript
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

// ENHANCED ERROR CHECKING
if (insertError) {
  console.error(`❌ Failed to add user to waitlist: ${email}`, JSON.stringify(insertError, null, 2));

  // Check if it's a duplicate entry error
  if (insertError.message?.includes('Duplicate entry detected')) {
    console.log(`ℹ️ User ${email} may have already signed up. Redirecting to success page.`);
    // Optional: Query existing user data to show their position
    const { data: existingUser } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log(`✓ Found existing user at position ${existingUser.position}`);
      return NextResponse.redirect(`${requestUrl.origin}/waitlist/success`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/landing?error=signup_failed`);
}

// ENHANCED RESULT VALIDATION
if (!insertResult || insertResult.length === 0) {
  console.error(`⚠️ RPC succeeded but returned empty result for ${email}`);
  console.error('This indicates a silent failure in the database function!');
  return NextResponse.redirect(`${requestUrl.origin}/landing?error=signup_failed`);
}

const userData = insertResult[0];
console.log(`✓ Successfully added user to waitlist: ${email} at position ${userData.user_position}`);
```

---

## Migration Strategy

### Step 1: Fix the Database Function (IMMEDIATE)

```bash
# Create migration file
npx supabase migration new fix_waitlist_insert_function

# Add the new function definition from Fix 2
```

### Step 2: Fix Orphaned Auth User (DATA CLEANUP)

```sql
-- Delete the orphaned auth user for anthonyrwilliams91@gmail.com
-- This allows them to sign up again with the fixed function
DELETE FROM auth.users
WHERE email = 'anthonyrwilliams91@gmail.com'
  AND id NOT IN (SELECT DISTINCT oauth_provider_id FROM waitlist_users WHERE oauth_provider_id IS NOT NULL);
```

### Step 3: Update Client Code (IMMEDIATE)

Apply the enhanced error handling from Fix 3.

### Step 4: Testing Plan

1. **Test duplicate name handling:**
   - Sign up two users with same first name
   - Verify both get unique referral codes
   - Example: anthony1a3f2 and anthony2b7d9

2. **Test error scenarios:**
   - Attempt duplicate email signup
   - Verify proper error message returned
   - Verify user gets helpful error page

3. **Test concurrent signups:**
   - Simulate 5+ users signing up simultaneously
   - Verify all get sequential positions
   - Verify no duplicate positions or referral codes

---

## Impact Assessment

### Current State
- ❌ **Data Integrity:** 1 orphaned auth user (anthonyrwilliams91@gmail.com)
- ❌ **User Experience:** User got 404 error instead of success page
- ❌ **Reliability:** Silent failures are not acceptable for production

### Post-Fix State
- ✅ **Unique referral codes** even for duplicate names
- ✅ **Explicit error handling** with helpful messages
- ✅ **Better concurrency** with advisory locks
- ✅ **Comprehensive logging** for debugging
- ✅ **Graceful degradation** for duplicate signups

---

## Conclusion

**Root Cause:** UNIQUE constraint violation on `referral_code` due to duplicate first names generating identical codes (anthony1), combined with lack of error handling in the RPC function.

**Why It Was Silent:** The PostgreSQL function didn't raise an exception on INSERT failure, causing the RPC to return an empty result set without an explicit error.

**Why Position Showed 1 for Both:** The table was empty when both attempts calculated next position, so both got position 1. First attempt failed on INSERT, second succeeded.

**Critical Fix Required:** Implement unique referral code generation + comprehensive error handling in the database function.

---

## Files to Modify

1. **Database Function:** Create new migration with fixed `insert_waitlist_user` function
2. **Client Code:** `/Users/awill314/Development/Mellowise_app/app/auth/callback/route.ts`
3. **Data Cleanup:** SQL script to remove orphaned auth user

**Estimated Implementation Time:** 30 minutes
**Priority:** CRITICAL - Blocks all waitlist signups with duplicate names
