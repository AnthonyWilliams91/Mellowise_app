-- =====================================================
-- Test Data for Waitlist System
-- Inserts sample users to verify schema works
-- =====================================================

-- Insert 5 test users across different tiers
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
  email_verified,
  signup_ip
) VALUES
  -- User 1: Position 1, Tier 1
  ('test1@example.com', 'Alice', 1, 1, 15.00, 1, 15.00, 'alice1', 'google', true, '192.168.1.1'),

  -- User 2: Position 50, Tier 1
  ('test2@example.com', 'Bob', 50, 1, 15.00, 1, 15.00, 'bob50', 'google', true, '192.168.1.2'),

  -- User 3: Position 101, Tier 2
  ('test3@example.com', 'Charlie', 101, 2, 20.00, 2, 20.00, 'charlie101', 'email', true, '192.168.1.3'),

  -- User 4: Position 250, Tier 3
  ('test4@example.com', 'Diana', 250, 3, 25.00, 3, 25.00, 'diana250', 'google', true, '192.168.1.4'),

  -- User 5: Position 450, Tier 5
  ('test5@example.com', 'Eve', 450, 5, 35.00, 5, 35.00, 'eve450', 'email', true, '192.168.1.5')
ON CONFLICT (email) DO NOTHING;

-- Insert some referral relationships
INSERT INTO referrals (
  referrer_id,
  referred_email,
  referred_user_id,
  email_verified,
  verified_at,
  counted_toward_batch
) VALUES
  -- Alice referred Bob
  (
    (SELECT id FROM waitlist_users WHERE email = 'test1@example.com'),
    'test2@example.com',
    (SELECT id FROM waitlist_users WHERE email = 'test2@example.com'),
    true,
    NOW(),
    false
  ),

  -- Alice referred Charlie
  (
    (SELECT id FROM waitlist_users WHERE email = 'test1@example.com'),
    'test3@example.com',
    (SELECT id FROM waitlist_users WHERE email = 'test3@example.com'),
    true,
    NOW(),
    false
  )
ON CONFLICT DO NOTHING;

-- Insert social share records
INSERT INTO social_shares (
  user_id,
  platform,
  shared,
  verified,
  shared_at,
  verified_at,
  clicks,
  spots_awarded,
  utm_source,
  utm_campaign
) VALUES
  -- Alice shared on Twitter
  (
    (SELECT id FROM waitlist_users WHERE email = 'test1@example.com'),
    'twitter',
    true,
    true,
    NOW(),
    NOW(),
    5,
    5,
    'twitter',
    'waitlist_launch'
  ),

  -- Bob shared on Facebook
  (
    (SELECT id FROM waitlist_users WHERE email = 'test2@example.com'),
    'facebook',
    true,
    false,
    NOW(),
    NULL,
    2,
    0,
    'facebook',
    'waitlist_launch'
  )
ON CONFLICT (user_id, platform) DO NOTHING;

-- Insert email events
INSERT INTO email_events (
  user_id,
  email_type,
  resend_email_id,
  sent_at,
  delivered_at,
  opened_at,
  status
) VALUES
  -- Welcome email to Alice
  (
    (SELECT id FROM waitlist_users WHERE email = 'test1@example.com'),
    'welcome',
    'resend_test_123',
    NOW(),
    NOW() + INTERVAL '1 minute',
    NOW() + INTERVAL '5 minutes',
    'delivered'
  ),

  -- Welcome email to Bob
  (
    (SELECT id FROM waitlist_users WHERE email = 'test2@example.com'),
    'welcome',
    'resend_test_456',
    NOW(),
    NOW() + INTERVAL '1 minute',
    NULL,
    'delivered'
  );

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check all test users
SELECT
  email,
  first_name,
  position,
  tier_current,
  price_current,
  referral_code
FROM waitlist_users
ORDER BY position;

-- Check referral relationships
SELECT
  wu1.email as referrer,
  r.referred_email,
  r.email_verified,
  r.counted_toward_batch
FROM referrals r
JOIN waitlist_users wu1 ON r.referrer_id = wu1.id
ORDER BY wu1.email;

-- Check social shares
SELECT
  wu.email,
  ss.platform,
  ss.shared,
  ss.verified,
  ss.clicks,
  ss.spots_awarded
FROM social_shares ss
JOIN waitlist_users wu ON ss.user_id = wu.id
ORDER BY wu.email;

-- Check email events
SELECT
  wu.email,
  ee.email_type,
  ee.status,
  ee.sent_at,
  ee.opened_at IS NOT NULL as opened
FROM email_events ee
JOIN waitlist_users wu ON ee.user_id = wu.id
ORDER BY wu.email;
