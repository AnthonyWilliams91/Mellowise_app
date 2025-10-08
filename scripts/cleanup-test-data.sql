-- =====================================================
-- Cleanup Test Data (Optional)
-- Run this to remove test data before going to production
-- =====================================================

-- Delete test email events
DELETE FROM email_events
WHERE user_id IN (
  SELECT id FROM waitlist_users
  WHERE email LIKE 'test%@example.com'
);

-- Delete test social shares
DELETE FROM social_shares
WHERE user_id IN (
  SELECT id FROM waitlist_users
  WHERE email LIKE 'test%@example.com'
);

-- Delete test referrals
DELETE FROM referrals
WHERE referrer_id IN (
  SELECT id FROM waitlist_users
  WHERE email LIKE 'test%@example.com'
);

-- Delete test users
DELETE FROM waitlist_users
WHERE email LIKE 'test%@example.com';

-- Verify cleanup
SELECT COUNT(*) as remaining_test_users
FROM waitlist_users
WHERE email LIKE 'test%@example.com';
-- Expected: 0

-- Show actual user count (should be real users only)
SELECT COUNT(*) as total_users FROM waitlist_users;
