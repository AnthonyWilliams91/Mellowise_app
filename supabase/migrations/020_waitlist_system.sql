-- =====================================================
-- Mellowise Waitlist System - Database Schema
-- Created: September 30, 2025
-- Version: 1.0
-- =====================================================

-- =====================================================
-- TABLE 1: waitlist_users
-- Core waitlist user table with tier tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS waitlist_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),

  -- Position tracking
  position INTEGER NOT NULL UNIQUE,
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Tier tracking
  tier_at_signup INTEGER NOT NULL,
  price_at_signup DECIMAL(10,2) NOT NULL,
  tier_current INTEGER NOT NULL,
  price_current DECIMAL(10,2) NOT NULL,
  spots_jumped INTEGER DEFAULT 0,

  -- Referral tracking
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  friends_referred INTEGER DEFAULT 0,
  friends_verified INTEGER DEFAULT 0,
  batches_completed INTEGER DEFAULT 0,
  total_spots_from_referrals INTEGER DEFAULT 0,
  total_spots_from_social INTEGER DEFAULT 0,
  max_tier_reached BOOLEAN DEFAULT FALSE,

  -- Activation tracking
  activation_status VARCHAR(50) DEFAULT 'pending',
  activation_deadline TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,

  -- OAuth tracking
  oauth_provider VARCHAR(50),
  oauth_provider_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Fraud prevention
  signup_ip VARCHAR(50),
  signup_user_agent TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE 2: referrals
-- Tracks referral relationships and batch rewards
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE,
  referred_email VARCHAR(255) NOT NULL,
  referred_user_id UUID REFERENCES waitlist_users(id) ON DELETE SET NULL,

  -- Verification tracking
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Batch tracking
  counted_toward_batch BOOLEAN DEFAULT FALSE,
  batch_number INTEGER,
  spots_awarded INTEGER DEFAULT 0,
  awarded_at TIMESTAMP WITH TIME ZONE,

  -- Fraud detection
  signup_ip VARCHAR(50),
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,

  -- Timestamps
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE 3: social_shares
-- Tracks social media sharing and verification
-- =====================================================
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,

  -- Verification tracking
  shared BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Click tracking
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Reward tracking
  spots_awarded INTEGER DEFAULT 0,
  awarded_at TIMESTAMP WITH TIME ZONE,

  -- Tracking data
  utm_source VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, platform)
);

-- =====================================================
-- TABLE 4: email_events
-- Tracks all email events via Resend webhooks
-- =====================================================
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,

  -- Resend tracking
  resend_email_id VARCHAR(255),

  -- Event tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES: Performance optimization
-- =====================================================

-- waitlist_users indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_users_position ON waitlist_users(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_email ON waitlist_users(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_referral_code ON waitlist_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_tier_current ON waitlist_users(tier_current);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_activation_status ON waitlist_users(activation_status);

-- referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_verified ON referrals(email_verified);

-- social_shares indexes
CREATE INDEX IF NOT EXISTS idx_social_shares_user_id ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_verified ON social_shares(verified);

-- email_events indexes
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);

-- =====================================================
-- FUNCTION 1: get_current_tier
-- Returns tier info based on total signups
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_tier(total_signups INTEGER)
RETURNS TABLE(tier INTEGER, price DECIMAL, remaining INTEGER) AS $$
BEGIN
  IF total_signups < 100 THEN
    RETURN QUERY SELECT 1, 15.00::DECIMAL, 100 - total_signups;
  ELSIF total_signups < 200 THEN
    RETURN QUERY SELECT 2, 20.00::DECIMAL, 200 - total_signups;
  ELSIF total_signups < 300 THEN
    RETURN QUERY SELECT 3, 25.00::DECIMAL, 300 - total_signups;
  ELSIF total_signups < 400 THEN
    RETURN QUERY SELECT 4, 30.00::DECIMAL, 400 - total_signups;
  ELSIF total_signups < 500 THEN
    RETURN QUERY SELECT 5, 35.00::DECIMAL, 500 - total_signups;
  ELSE
    RETURN QUERY SELECT 6, 49.00::DECIMAL, -1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION 2: get_tier_by_position
-- Returns tier info based on signup position
-- =====================================================
CREATE OR REPLACE FUNCTION get_tier_by_position(pos INTEGER)
RETURNS TABLE(tier INTEGER, price DECIMAL, tier_name VARCHAR) AS $$
BEGIN
  IF pos <= 100 THEN
    RETURN QUERY SELECT 1, 15.00::DECIMAL, 'Tier 1'::VARCHAR;
  ELSIF pos <= 200 THEN
    RETURN QUERY SELECT 2, 20.00::DECIMAL, 'Tier 2'::VARCHAR;
  ELSIF pos <= 300 THEN
    RETURN QUERY SELECT 3, 25.00::DECIMAL, 'Tier 3'::VARCHAR;
  ELSIF pos <= 400 THEN
    RETURN QUERY SELECT 4, 30.00::DECIMAL, 'Tier 4'::VARCHAR;
  ELSIF pos <= 500 THEN
    RETURN QUERY SELECT 5, 35.00::DECIMAL, 'Tier 5'::VARCHAR;
  ELSE
    RETURN QUERY SELECT 6, 49.00::DECIMAL, '501+'::VARCHAR;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_waitlist_users_updated_at
  BEFORE UPDATE ON waitlist_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE waitlist_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- waitlist_users policies
CREATE POLICY "Allow public read access to waitlist_users"
  ON waitlist_users FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to waitlist_users"
  ON waitlist_users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- referrals policies
CREATE POLICY "Allow service role full access to referrals"
  ON referrals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- social_shares policies
CREATE POLICY "Allow service role full access to social_shares"
  ON social_shares FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- email_events policies
CREATE POLICY "Allow service role full access to email_events"
  ON email_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- COMMENTS: Table documentation
-- =====================================================
COMMENT ON TABLE waitlist_users IS 'Core waitlist users with tier tracking and referral metrics';
COMMENT ON TABLE referrals IS 'Tracks referral relationships and batch completion rewards';
COMMENT ON TABLE social_shares IS 'Tracks social media sharing activity and verification';
COMMENT ON TABLE email_events IS 'Tracks all email events from Resend webhooks';

COMMENT ON FUNCTION get_current_tier(INTEGER) IS 'Returns current tier based on total signup count';
COMMENT ON FUNCTION get_tier_by_position(INTEGER) IS 'Returns tier info for a specific position number';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
