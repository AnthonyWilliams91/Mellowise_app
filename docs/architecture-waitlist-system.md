# Mellowise Waitlist System - Technical Architecture

**Version:** 1.0
**Last Updated:** September 30, 2025
**Architect:** Winston
**Status:** Final - Ready for Implementation

---

## Executive Summary

This document defines the complete technical architecture for the Mellowise waitlist system, including tiered pricing, referral tracking, email automation, and anti-fraud measures. The system is **integrated into the existing Mellowise Next.js application** and leverages the current tech stack (Next.js 14, Supabase PostgreSQL, FastAPI, Resend).

**Key Architecture Decisions:**
- ✅ **Integrated System** - Waitlist lives within main Mellowise app (not microservice)
- ✅ **Polling-Based Counter** - 5-second polling for live waitlist count (simple, reliable)
- ✅ **Resend for Emails** - Modern email service with React Email templates
- ✅ **Supabase PostgreSQL** - Existing database, no new infrastructure
- ✅ **Next.js API Routes** - Frontend-facing endpoints for signup, counter, referrals
- ✅ **FastAPI Backend** - Complex logic (tier calculation, fraud detection, email triggers)

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [Referral Tracking System](#4-referral-tracking-system)
5. [Email Automation](#5-email-automation)
6. [Anti-Fraud & Security](#6-anti-fraud--security)
7. [Performance Optimization](#7-performance-optimization)
8. [Deployment Strategy](#8-deployment-strategy)
9. [Monitoring & Analytics](#9-monitoring--analytics)
10. [Migration Path to Beta](#10-migration-path-to-beta)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Mellowise Landing Page                     │
│                      (Next.js 14 App)                         │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐      │
│  │   Landing   │  │   Success    │  │  Admin Panel  │      │
│  │    Page     │  │     Page     │  │  (Optional)   │      │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘      │
│         │                 │                   │               │
└─────────┼─────────────────┼───────────────────┼──────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Edge Functions)             │
│  /api/waitlist/signup    /api/waitlist/counter              │
│  /api/waitlist/referral  /api/waitlist/social-share         │
└────────────┬──────────────────────────────┬─────────────────┘
             │                               │
             ▼                               ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│   FastAPI Backend        │    │    Resend Email Service     │
│   (Business Logic)       │    │   (Email Automation)        │
│                          │    │                             │
│  - Tier Calculation      │    │  - Welcome Email            │
│  - Fraud Detection       │    │  - Progress Updates         │
│  - Email Triggers        │    │  - Beta Launch Email        │
│  - Referral Validation   │    │                             │
└────────┬─────────────────┘    └─────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                    │
│                                                              │
│  Tables: waitlist_users, referrals, social_shares,          │
│          email_events                                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack Integration

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | Landing page, success page, forms |
| **API Layer** | Next.js API Routes | Public endpoints for signup, counter, referrals |
| **Business Logic** | FastAPI (Python) | Tier calculation, fraud detection, complex logic |
| **Database** | Supabase PostgreSQL | User data, referrals, analytics |
| **Email Service** | Resend + React Email | Transactional emails with dynamic content |
| **Authentication** | Supabase Auth (Google OAuth) | Google signup, email verification |
| **Caching** | Redis (optional for MVP) | Counter caching, rate limiting |
| **Analytics** | Vercel Analytics + PostHog | User behavior, conversion tracking |

---

## 2. Database Schema

### 2.1 Tables Overview

```sql
-- Core waitlist user table
CREATE TABLE waitlist_users (
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

-- Referral relationships table
CREATE TABLE referrals (
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

-- Social shares tracking table
CREATE TABLE social_shares (
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

-- Email events tracking table
CREATE TABLE email_events (
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

-- Indexes for performance
CREATE INDEX idx_waitlist_users_position ON waitlist_users(position);
CREATE INDEX idx_waitlist_users_email ON waitlist_users(email);
CREATE INDEX idx_waitlist_users_referral_code ON waitlist_users(referral_code);
CREATE INDEX idx_waitlist_users_tier_current ON waitlist_users(tier_current);
CREATE INDEX idx_waitlist_users_activation_status ON waitlist_users(activation_status);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_email ON referrals(referred_email);
CREATE INDEX idx_referrals_verified ON referrals(email_verified);

CREATE INDEX idx_social_shares_user_id ON social_shares(user_id);
CREATE INDEX idx_social_shares_platform ON social_shares(platform);
CREATE INDEX idx_social_shares_verified ON social_shares(verified);

CREATE INDEX idx_email_events_user_id ON email_events(user_id);
CREATE INDEX idx_email_events_type ON email_events(email_type);
CREATE INDEX idx_email_events_status ON email_events(status);
```

### 2.2 Database Functions

```sql
-- Function to calculate current tier based on total signups
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

-- Function to get tier info based on position
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

-- Trigger to update updated_at timestamp
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
```

---

## 3. API Endpoints

### 3.1 Next.js API Routes (Public Endpoints)

#### POST `/api/waitlist/signup`

**Purpose:** Handle waitlist signup (Google OAuth or Email)

**Request Body:**
```typescript
{
  email: string;           // Required
  firstName?: string;      // Optional (captured from OAuth)
  oauthProvider?: 'google' | null;
  oauthProviderId?: string;
  referralCode?: string;   // If user clicked referral link
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    userId: string;
    position: number;
    tier: number;
    price: number;
    referralCode: string;
    message: string;
  };
  error?: string;
}
```

**Flow:**
1. Validate email format
2. Check if email already exists (return existing position if so)
3. Get current total signups count
4. Calculate tier based on count
5. Generate unique referral code
6. Insert into database (position = count + 1)
7. If referralCode provided, create referral relationship
8. Trigger welcome email via FastAPI
9. Return user data

**Implementation:**
```typescript
// app/api/waitlist/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, firstName, oauthProvider, referralCode } = body;

  // Validation
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: 'Invalid email address' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Check if user already exists
  const { data: existing } = await supabase
    .from('waitlist_users')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({
      success: true,
      data: {
        userId: existing.id,
        position: existing.position,
        tier: existing.tier_current,
        price: existing.price_current,
        referralCode: existing.referral_code,
        message: "You're already on the waitlist!"
      }
    });
  }

  // Get current total signups
  const { count } = await supabase
    .from('waitlist_users')
    .select('*', { count: 'exact', head: true });

  const position = (count || 0) + 1;

  // Calculate tier
  const tierInfo = getTierByPosition(position);

  // Generate unique referral code
  const referralCodeGenerated = `${firstName?.toLowerCase() || 'user'}${position}`;

  // Get client IP for fraud detection
  const clientIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  // Insert user
  const { data: newUser, error } = await supabase
    .from('waitlist_users')
    .insert({
      email,
      first_name: firstName,
      position,
      tier_at_signup: tierInfo.tier,
      price_at_signup: tierInfo.price,
      tier_current: tierInfo.tier,
      price_current: tierInfo.price,
      referral_code: referralCodeGenerated,
      oauth_provider: oauthProvider,
      email_verified: oauthProvider === 'google',
      verified_at: oauthProvider === 'google' ? new Date().toISOString() : null,
      signup_ip: clientIp,
      signup_user_agent: request.headers.get('user-agent')
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }

  // If referral code provided, create referral relationship
  if (referralCode) {
    await handleReferral(referralCode, email, clientIp);
  }

  // Trigger welcome email (call FastAPI endpoint)
  await fetch(`${process.env.FASTAPI_URL}/api/emails/send-welcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: newUser.id })
  });

  return NextResponse.json({
    success: true,
    data: {
      userId: newUser.id,
      position: newUser.position,
      tier: newUser.tier_current,
      price: newUser.price_current,
      referralCode: newUser.referral_code,
      message: 'Welcome to the waitlist!'
    }
  });
}
```

---

#### GET `/api/waitlist/counter`

**Purpose:** Return current tier info for live counter (polled every 5 seconds)

**Query Params:** None

**Response:**
```typescript
{
  totalSignups: number;
  currentTier: {
    tier: number;
    price: number;
    remaining: number;
    tierName: string;
  };
  allTiers: [
    { tier: 1, price: 15, filled: 100, total: 100, soldOut: true },
    { tier: 2, price: 20, filled: 47, total: 100, soldOut: false },
    // ...
  ];
}
```

**Caching Strategy:**
- Cache response for 5 seconds (edge function)
- Use Vercel Edge Config or simple in-memory cache
- Only query database if cache expired

**Implementation:**
```typescript
// app/api/waitlist/counter/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Cache for 5 seconds (edge runtime)
export const runtime = 'edge';
export const revalidate = 5;

export async function GET() {
  const supabase = createClient();

  // Get total signups
  const { count: totalSignups } = await supabase
    .from('waitlist_users')
    .select('*', { count: 'exact', head: true });

  const total = totalSignups || 0;

  // Calculate current available tier
  const currentTier = getCurrentTierInfo(total);

  // Build all tiers array
  const allTiers = [
    { tier: 1, price: 15, filled: Math.min(total, 100), total: 100, soldOut: total >= 100 },
    { tier: 2, price: 20, filled: Math.min(Math.max(total - 100, 0), 100), total: 100, soldOut: total >= 200 },
    { tier: 3, price: 25, filled: Math.min(Math.max(total - 200, 0), 100), total: 100, soldOut: total >= 300 },
    { tier: 4, price: 30, filled: Math.min(Math.max(total - 300, 0), 100), total: 100, soldOut: total >= 400 },
    { tier: 5, price: 35, filled: Math.min(Math.max(total - 400, 0), 100), total: 100, soldOut: total >= 500 },
    { tier: 6, price: 49, filled: Math.max(total - 500, 0), total: -1, soldOut: false }
  ];

  return NextResponse.json({
    totalSignups: total,
    currentTier,
    allTiers
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10'
    }
  });
}
```

---

#### POST `/api/waitlist/referral`

**Purpose:** Process referral (when referrer's friend signs up)

**Request Body:**
```typescript
{
  referralCode: string;    // Referrer's code
  referredEmail: string;   // Friend's email
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  spotsAwarded?: number;   // If batch completed (3 referrals)
}
```

**Flow:**
1. Find referrer by referral code
2. Check if referred email already exists (prevent duplicates)
3. Create referral record
4. Check if this completes a batch of 3
5. If batch completed, award 10 spots to referrer
6. Update referrer's tier if they jumped enough spots
7. Send referral progress email

---

#### POST `/api/waitlist/social-share`

**Purpose:** Track social media shares and award spots

**Request Body:**
```typescript
{
  userId: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'linkedin';
  utmSource: string;
  utmCampaign: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  spotsAwarded: number;
  alreadyShared: boolean;
}
```

**Flow:**
1. Check if user already shared on this platform
2. If not, create social_share record
3. Generate trackable UTM link
4. Return link to user
5. When link is clicked (tracked via UTM), mark as verified and award 5 spots

---

### 3.2 FastAPI Backend Endpoints (Internal)

#### POST `/api/emails/send-welcome`

**Purpose:** Trigger welcome email via Resend

**Request Body:**
```python
{
  "userId": "uuid"
}
```

**Flow:**
1. Fetch user data from database
2. Calculate referral progress
3. Render React Email template with dynamic data
4. Send via Resend API
5. Log email event in database

---

#### POST `/api/emails/send-progress`

**Purpose:** Send referral progress update email

**Triggered:** When user makes referral progress (manual or scheduled job)

---

#### POST `/api/emails/send-beta-launch`

**Purpose:** Send beta activation email

**Triggered:** When beta launches (manual trigger by admin)

---

#### POST `/api/fraud/check-user`

**Purpose:** Run fraud detection on user signup

**Checks:**
- Disposable email domains
- Multiple signups from same IP
- Suspicious referral patterns (10+ referrals from same IP)
- Email verification status

---

## 4. Referral Tracking System

### 4.1 Referral Flow Architecture

```
┌──────────────┐
│ User Signs Up│
│ Position #127│
│ Tier 2: $20  │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ Gets Referral Link │
│ mellowise.com/r/   │
│ alex127            │
└────────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ Shares Link with Friends │
│ (Email, Social Media)    │
└────────┬─────────────────┘
       │
       ▼
┌───────────────────────┐
│ Friend 1 Clicks Link  │
│ Signs Up              │
└────────┬──────────────┘
       │
       ▼
┌─────────────────────────┐
│ Referral Record Created │
│ referrer_id: alex127    │
│ referred: friend1@      │
└────────┬────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Friend Verifies Email    │
│ (if email signup)        │
└────────┬─────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Check: Is this 3rd friend? │
└────────┬───────────────────┘
       │
       ├─ No → Wait for more
       │
       ├─ Yes → Award 10 Spots
       │
       ▼
┌─────────────────────────────┐
│ Update User Position        │
│ #127 → #117                 │
│ spots_jumped += 10          │
└────────┬────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Recalculate Tier             │
│ Check: pos - spots_jumped   │
│ #127 - 10 = #117 (Tier 2)  │
└────────┬─────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│ Check Tier Improvement Cap    │
│ Initial: Tier 2               │
│ Can reach: Tier 1 only        │
└────────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ If enough spots to cross     │
│ into Tier 1, update pricing  │
│ tier_current = 1             │
│ price_current = 15           │
└────────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ Send Progress Update Email │
│ "You unlocked Tier 1!"     │
└────────────────────────────┘
```

### 4.2 Tier Jump Calculation Logic

**Python (FastAPI):**
```python
def calculate_tier_improvement(user):
    """
    Calculate if user can improve tier based on spots jumped.
    Enforces 1-tier improvement cap from initial signup tier.
    """
    initial_tier = user.tier_at_signup
    current_position = user.position
    spots_jumped = user.spots_jumped

    # Effective position for pricing (not activation queue)
    effective_position = current_position - spots_jumped

    # Get tier based on effective position
    new_tier_info = get_tier_by_position(effective_position)
    new_tier = new_tier_info['tier']

    # Enforce 1-tier cap: Can only go down 1 tier from initial
    target_tier = max(1, initial_tier - 1)

    # User can only improve to target_tier (not beyond)
    if new_tier < target_tier:
        # They jumped too far, cap at target tier
        final_tier = target_tier
        max_tier_reached = True
    else:
        final_tier = new_tier
        max_tier_reached = (new_tier == target_tier)

    # Get pricing for final tier
    tier_pricing = {
        1: 15.00,
        2: 20.00,
        3: 25.00,
        4: 30.00,
        5: 35.00,
        6: 49.00
    }

    final_price = tier_pricing[final_tier]

    return {
        'tier_current': final_tier,
        'price_current': final_price,
        'max_tier_reached': max_tier_reached,
        'effective_position': effective_position
    }
```

### 4.3 Social Share Verification

**UTM Link Generation:**
```python
def generate_social_share_link(user_id, platform):
    """
    Generate trackable social share link with UTM parameters.
    """
    base_url = "https://mellowise.com"
    referral_code = get_user_referral_code(user_id)

    utm_params = {
        'utm_source': platform,
        'utm_medium': 'social',
        'utm_campaign': 'waitlist_referral',
        'utm_content': referral_code
    }

    link = f"{base_url}/r/{referral_code}?" + urlencode(utm_params)

    # Store social_share record
    db.social_shares.insert({
        'user_id': user_id,
        'platform': platform,
        'shared': True,
        'verified': False,  # Verified when link is clicked
        'utm_source': platform,
        'utm_campaign': 'waitlist_referral'
    })

    return link
```

**Click Verification:**
```python
def verify_social_share(referral_code, utm_source):
    """
    Verify social share when someone clicks the UTM link.
    Award 5 spots if first click from this platform.
    """
    user = get_user_by_referral_code(referral_code)

    # Find social_share record
    share = db.social_shares.find_one({
        'user_id': user.id,
        'platform': utm_source
    })

    if not share:
        return {'error': 'Share not found'}

    # Increment click count
    share.clicks += 1

    # If first verification, award spots
    if not share.verified:
        share.verified = True
        share.verified_at = datetime.now()
        share.spots_awarded = 5

        # Update user
        user.spots_jumped += 5
        user.total_spots_from_social += 5

        # Recalculate tier
        tier_update = calculate_tier_improvement(user)
        user.tier_current = tier_update['tier_current']
        user.price_current = tier_update['price_current']
        user.max_tier_reached = tier_update['max_tier_reached']

        db.commit()

        # Send progress email
        send_progress_email(user.id)

        return {
            'success': True,
            'spots_awarded': 5,
            'new_tier': user.tier_current,
            'new_price': user.price_current
        }

    return {'success': True, 'already_verified': True}
```

---

## 5. Email Automation

### 5.1 Resend Integration

**Setup:**
```typescript
// lib/resend.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### 5.2 React Email Templates

**Welcome Email Template:**
```tsx
// emails/WaitlistWelcome.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Button,
  Hr
} from '@react-email/components';

interface WaitlistWelcomeProps {
  firstName: string;
  position: number;
  tier: number;
  price: number;
  savings: number;
  referralLink: string;
  spotsNeeded: number;
  targetTier: number;
  targetPrice: number;
}

export default function WaitlistWelcome({
  firstName,
  position,
  tier,
  price,
  savings,
  referralLink,
  spotsNeeded,
  targetTier,
  targetPrice
}: WaitlistWelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>You're #{position} on the waitlist! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Mellowise!</Heading>

          <Text style={text}>Hi {firstName},</Text>

          <Text style={text}>
            You've successfully joined the beta waitlist.
          </Text>

          <Hr style={hr} />

          <Section style={infoBox}>
            <Text style={infoLabel}>Your Waitlist Details:</Text>
            <Text style={infoItem}>Position: <strong>#{position}</strong></Text>
            <Text style={infoItem}>Pricing: <strong>${price}/month</strong> (locked in forever)</Text>
            <Text style={infoItem}>You Saved: <strong>${savings}/month</strong> off regular $99 pricing</Text>
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>What's Next?</Heading>

          <Text style={text}>
            1. We're launching beta access in 2-4 weeks<br />
            2. You'll get an email when your spot is ready<br />
            3. Activate your account within 30 days to lock in ${price}/month
          </Text>

          <Hr style={hr} />

          {spotsNeeded > 0 && (
            <>
              <Heading as="h2" style={h2}>🎁 Want ${targetPrice}/month Instead?</Heading>

              <Text style={text}>
                You're currently in Tier {tier} (${price}/month).<br />
                You can unlock Tier {targetTier} (${targetPrice}/month) by jumping {spotsNeeded}+ spots:
              </Text>

              <Section style={infoBox}>
                <Text style={infoLabel}>How to Jump Spots:</Text>
                <Text style={text}>• Refer 3 friends = 10 spots</Text>
                <Text style={text}>• Share on social media = 5 spots per platform</Text>
              </Section>

              <Button style={button} href={referralLink}>
                Get Your Referral Link
              </Button>
            </>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Reply to this email - we read every message.
          </Text>

          <Text style={footer}>
            Excited to help you crush the LSAT!<br />
            The Mellowise Team
          </Text>

          <Text style={footer}>
            P.S. Your pricing is locked in - it will never increase, even after we launch.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  margin: '30px 0 15px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const infoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  marginBottom: '8px',
};

const infoItem = {
  fontSize: '16px',
  color: '#1f2937',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  marginTop: '20px',
};
```

### 5.3 Email Send Function

**FastAPI Email Service:**
```python
# app/services/email_service.py
from resend import Resend
from jinja2 import Template

resend_client = Resend(api_key=os.getenv('RESEND_API_KEY'))

async def send_welcome_email(user_id: str):
    """
    Send welcome email to new waitlist member.
    """
    # Fetch user data
    user = await db.waitlist_users.find_one({'id': user_id})

    # Calculate referral progress
    spots_needed = calculate_spots_needed_for_next_tier(user)
    target_tier_info = get_target_tier_info(user)

    # Render React Email template
    email_html = render_react_email('WaitlistWelcome', {
        'firstName': user.first_name or 'there',
        'position': user.position,
        'tier': user.tier_current,
        'price': user.price_current,
        'savings': 99 - user.price_current,
        'referralLink': f"https://mellowise.com/r/{user.referral_code}",
        'spotsNeeded': spots_needed,
        'targetTier': target_tier_info['tier'],
        'targetPrice': target_tier_info['price']
    })

    # Send via Resend
    response = resend_client.emails.send({
        'from': 'Mellowise Team <hello@mellowise.com>',
        'to': user.email,
        'subject': f"You're #{user.position} on the waitlist! 🎉",
        'html': email_html
    })

    # Log email event
    await db.email_events.insert_one({
        'user_id': user.id,
        'email_type': 'welcome',
        'resend_email_id': response['id'],
        'status': 'sent',
        'sent_at': datetime.now()
    })

    return response
```

### 5.4 Email Event Webhooks

**Resend Webhook Handler:**
```typescript
// app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { type, data } = payload;

  const supabase = createClient();

  // Update email event based on Resend webhook
  switch (type) {
    case 'email.delivered':
      await supabase
        .from('email_events')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
        .eq('resend_email_id', data.email_id);
      break;

    case 'email.opened':
      await supabase
        .from('email_events')
        .update({ opened_at: new Date().toISOString() })
        .eq('resend_email_id', data.email_id);
      break;

    case 'email.clicked':
      await supabase
        .from('email_events')
        .update({ clicked_at: new Date().toISOString() })
        .eq('resend_email_id', data.email_id);
      break;

    case 'email.bounced':
      await supabase
        .from('email_events')
        .update({
          status: 'bounced',
          bounced_at: new Date().toISOString(),
          error_message: data.reason
        })
        .eq('resend_email_id', data.email_id);
      break;
  }

  return NextResponse.json({ success: true });
}
```

---

## 6. Anti-Fraud & Security

### 6.1 Email Verification

**Disposable Email Detection:**
```python
# Use external API or maintain blocklist
DISPOSABLE_DOMAINS = [
    'mailinator.com',
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.com',
    # ... (load from database or API)
]

def is_disposable_email(email: str) -> bool:
    domain = email.split('@')[1]
    return domain in DISPOSABLE_DOMAINS
```

**Email Verification Flow:**
```
1. User signs up with email (not OAuth)
2. System sends verification email with link
3. User clicks link → /api/verify-email?token=xxx
4. System marks email_verified = True
5. Only verified emails count toward referral batches
```

### 6.2 IP-Based Fraud Detection

**Multiple Signups from Same IP:**
```python
async def check_ip_fraud(ip_address: str) -> dict:
    """
    Check if IP address has too many signups.
    Flag for manual review if suspicious.
    """
    # Count signups from this IP in last 24 hours
    recent_signups = await db.waitlist_users.count_documents({
        'signup_ip': ip_address,
        'created_at': {'$gte': datetime.now() - timedelta(hours=24)}
    })

    if recent_signups > 3:
        return {
            'flagged': True,
            'reason': f'{recent_signups} signups from same IP in 24h',
            'requires_manual_review': True
        }

    return {'flagged': False}
```

### 6.3 Referral Fraud Prevention

**Batch Validation:**
```python
async def validate_referral_batch(referrer_id: str):
    """
    Check if referral batch is legitimate.
    Flag suspicious patterns (same IP, fake emails).
    """
    # Get all referrals for this user
    referrals = await db.referrals.find({
        'referrer_id': referrer_id,
        'counted_toward_batch': True
    }).to_list()

    # Check for same IP pattern
    ips = [r.signup_ip for r in referrals]
    if len(set(ips)) == 1 and len(ips) >= 3:
        # All 3 friends signed up from same IP = suspicious
        await flag_user_for_review(
            referrer_id,
            'All referrals from same IP address'
        )
        return False

    # Check for disposable emails
    disposable_count = sum(
        1 for r in referrals
        if is_disposable_email(r.referred_email)
    )

    if disposable_count >= 2:
        await flag_user_for_review(
            referrer_id,
            f'{disposable_count} disposable email referrals'
        )
        return False

    return True
```

### 6.4 Rate Limiting

**API Rate Limits:**
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/waitlist/:path*',
};
```

---

## 7. Performance Optimization

### 7.1 Database Indexing

Already covered in Section 2.1 (indexes on position, email, referral_code, etc.)

### 7.2 Caching Strategy

**Landing Page Counter:**
- Cache `/api/waitlist/counter` response for 5 seconds
- Use Vercel Edge Config or simple in-memory cache
- Reduces database queries from 200/second to 0.2/second (1000x reduction)

**User Lookup:**
```typescript
// Cache user data by referral code for 5 minutes
const cachedUser = await redis.get(`user:${referralCode}`);
if (cachedUser) return JSON.parse(cachedUser);

const user = await db.query('SELECT * FROM waitlist_users WHERE referral_code = $1', [referralCode]);
await redis.setex(`user:${referralCode}`, 300, JSON.stringify(user));
```

### 7.3 Database Query Optimization

**Avoid N+1 Queries:**
```sql
-- Bad: N+1 query
SELECT * FROM waitlist_users;
for each user:
  SELECT COUNT(*) FROM referrals WHERE referrer_id = user.id;

-- Good: Single JOIN query
SELECT
  u.*,
  COUNT(r.id) as referral_count
FROM waitlist_users u
LEFT JOIN referrals r ON r.referrer_id = u.id
GROUP BY u.id;
```

---

## 8. Deployment Strategy

### 8.1 Infrastructure Overview

```
┌────────────────────────────────────────────┐
│         Vercel (Next.js Frontend)          │
│  - Landing page                            │
│  - API routes (signup, counter, referral)  │
│  - Edge functions (caching)                │
└─────────────────┬──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│         Railway (FastAPI Backend)          │
│  - Email automation                        │
│  - Fraud detection                         │
│  - Complex business logic                  │
└─────────────────┬──────────────────────────┘
                  │
┌─────────────────▼──────────────────────────┐
│      Supabase (PostgreSQL + Auth)          │
│  - Database tables                         │
│  - Google OAuth                            │
│  - Email verification                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│          Resend (Email Service)            │
│  - Transactional emails                    │
│  - React Email templates                   │
└────────────────────────────────────────────┘
```

### 8.2 Environment Variables

**Next.js (.env.local):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# FastAPI Backend
FASTAPI_URL=https://api.mellowise.com

# Resend
RESEND_API_KEY=re_xxx

# Redis (optional for caching)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxx
```

**FastAPI (.env):**
```bash
# Database
DATABASE_URL=postgresql://user:pass@db.xxx.supabase.co:5432/postgres

# Resend
RESEND_API_KEY=re_xxx

# App URLs
FRONTEND_URL=https://mellowise.com
```

### 8.3 Deployment Steps

1. **Deploy Database Migrations**
   ```bash
   npx supabase db push
   ```

2. **Deploy FastAPI Backend to Railway**
   ```bash
   railway up
   ```

3. **Deploy Next.js to Vercel**
   ```bash
   vercel --prod
   ```

4. **Configure Resend Webhook**
   - Point to `https://mellowise.com/api/webhooks/resend`

---

## 9. Monitoring & Analytics

### 9.1 Key Metrics Dashboard

**Realtime Metrics:**
- Total waitlist signups
- Current tier fill rate
- Signups per hour / day
- Referral participation rate (%)
- Email open / click rates

**Fraud Metrics:**
- Flagged users (manual review queue)
- Disposable email attempts
- Same-IP signup attempts

### 9.2 Analytics Integration

**Vercel Analytics:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**PostHog Event Tracking:**
```typescript
// Track key events
posthog.capture('waitlist_signup', {
  position: user.position,
  tier: user.tier,
  price: user.price,
  oauth_provider: user.oauth_provider
});

posthog.capture('referral_shared', {
  platform: platform,
  user_tier: user.tier
});

posthog.capture('tier_upgraded', {
  from_tier: oldTier,
  to_tier: newTier,
  spots_jumped: spotsJumped
});
```

### 9.3 Error Monitoring

**Sentry Integration:**
```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

---

## 10. Migration Path to Beta

### 10.1 Beta Activation Flow

**When Beta Launches:**

1. **Admin triggers beta launch** (manual action or scheduled job)
2. **System sends activation emails** to users in batches (positions 1-100 first, then 101-200, etc.)
3. **Activation deadline set** (30 days from email sent)
4. **User clicks activation link** → Creates account in main Mellowise app
5. **Pricing locked in** from waitlist record
6. **Waitlist record updated**: `activation_status = 'activated'`, `activated_at = NOW()`

### 10.2 Account Creation Migration

**Link Waitlist to Main App:**
```sql
-- Add waitlist_user_id column to main users table
ALTER TABLE users ADD COLUMN waitlist_user_id UUID REFERENCES waitlist_users(id);

-- When user activates:
INSERT INTO users (email, first_name, pricing_tier, waitlist_user_id)
SELECT email, first_name, tier_current, id
FROM waitlist_users
WHERE id = $1;
```

### 10.3 Pricing Enforcement

**Subscription Creation:**
```python
# When user activates, create Stripe subscription with locked-in price
stripe.Subscription.create(
    customer=customer_id,
    items=[{
        'price_data': {
            'currency': 'usd',
            'product': LSAT_PREP_PRODUCT_ID,
            'recurring': {'interval': 'month'},
            'unit_amount': int(user.price_current * 100)  # Convert to cents
        }
    }],
    metadata={
        'waitlist_position': user.position,
        'waitlist_tier': user.tier_current,
        'pricing_locked': True
    }
)
```

---

## 11. Technical Risks & Mitigation

### 11.1 Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Viral growth exceeds infrastructure** | High | Medium | Implement queue system, scale database, add rate limiting |
| **Referral fraud at scale** | High | Medium | Manual review queue, IP tracking, email verification |
| **Email deliverability issues** | Medium | Low | Use Resend (high deliverability), monitor bounce rates |
| **Database performance degradation** | High | Low | Proper indexing, caching, read replicas if needed |
| **Tier jumping calculation bugs** | High | Low | Comprehensive unit tests, manual QA before launch |

### 11.2 Contingency Plans

**If Signups Exceed Projections (10,000+ in week 1):**
- Scale Supabase to larger instance
- Add database read replicas
- Implement Redis caching layer
- Move counter to Edge Config for better performance

**If Fraud Rate > 10%:**
- Pause automatic referral rewards
- Require email verification for all signups
- Add CAPTCHA to signup form
- Manual review for all tier upgrades

---

## 12. Development Checklist

### 12.1 Phase 1: Core Waitlist (Week 1-2)

- [ ] Create database schema in Supabase
- [ ] Build landing page UI (based on front-end spec)
- [ ] Implement signup flow (Google OAuth + email)
- [ ] Build live counter with polling
- [ ] Create success page with referral tools
- [ ] Set up Resend email service
- [ ] Send welcome email on signup
- [ ] Deploy to staging environment

### 12.2 Phase 2: Referral System (Week 2-3)

- [ ] Build referral tracking logic
- [ ] Implement social share functionality
- [ ] Create tier jump calculation engine
- [ ] Add email verification for email signups
- [ ] Build progress update emails
- [ ] Test referral flow end-to-end
- [ ] Deploy referral system to production

### 12.3 Phase 3: Anti-Fraud & Polish (Week 3-4)

- [ ] Implement IP-based fraud detection
- [ ] Add disposable email blocklist
- [ ] Create admin dashboard for manual review
- [ ] Set up rate limiting
- [ ] Add analytics tracking (PostHog, Vercel)
- [ ] Performance testing (load test with 1000 concurrent users)
- [ ] Security audit (penetration testing)

### 12.4 Phase 4: Beta Preparation (Week 4+)

- [ ] Build beta activation email system
- [ ] Create account migration flow (waitlist → main app)
- [ ] Test pricing lock-in with Stripe
- [ ] Launch monitoring dashboard
- [ ] Document runbooks for operations team
- [ ] Final QA and stakeholder approval

---

## 13. API Documentation Summary

### 13.1 Public API Endpoints

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/api/waitlist/signup` | POST | User signup | 5 req/min per IP |
| `/api/waitlist/counter` | GET | Live waitlist count | 60 req/min per IP |
| `/api/waitlist/referral` | POST | Track referral | 10 req/min per user |
| `/api/waitlist/social-share` | POST | Generate social link | 5 req/min per user |
| `/api/verify-email` | GET | Email verification | 3 req/min per token |
| `/api/webhooks/resend` | POST | Resend webhook | Unlimited (verified) |

### 13.2 Internal API Endpoints (FastAPI)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/emails/send-welcome` | POST | Trigger welcome email |
| `/api/emails/send-progress` | POST | Send referral update |
| `/api/emails/send-beta-launch` | POST | Beta activation email |
| `/api/fraud/check-user` | POST | Run fraud detection |
| `/api/tier/calculate` | POST | Calculate tier improvement |

---

## Appendix A: Sample Database Queries

**Get User Referral Progress:**
```sql
SELECT
  u.id,
  u.email,
  u.position,
  u.tier_at_signup,
  u.tier_current,
  u.price_current,
  u.spots_jumped,
  u.max_tier_reached,
  COUNT(r.id) FILTER (WHERE r.email_verified = true) as verified_referrals,
  COUNT(DISTINCT s.platform) FILTER (WHERE s.verified = true) as social_shares_count
FROM waitlist_users u
LEFT JOIN referrals r ON r.referrer_id = u.id
LEFT JOIN social_shares s ON s.user_id = u.id
WHERE u.id = $1
GROUP BY u.id;
```

**Get Top Referrers:**
```sql
SELECT
  u.email,
  u.position,
  COUNT(r.id) as total_referrals,
  u.spots_jumped,
  u.tier_current,
  u.price_current
FROM waitlist_users u
LEFT JOIN referrals r ON r.referrer_id = u.id AND r.email_verified = true
GROUP BY u.id
ORDER BY total_referrals DESC
LIMIT 10;
```

**Get Tier Distribution:**
```sql
SELECT
  tier_current as tier,
  COUNT(*) as user_count,
  price_current as price
FROM waitlist_users
GROUP BY tier_current, price_current
ORDER BY tier_current;
```

---

**Architecture Document Complete! 🎉**

**Total Sections:** 13 major sections + appendix
**Total Components:** Database schema, API endpoints, referral system, email automation, fraud prevention, deployment strategy
**Ready For:** Dev Agent implementation planning

**Next Agent:** Transform into Dev Agent for implementation plan + timeline estimation.
