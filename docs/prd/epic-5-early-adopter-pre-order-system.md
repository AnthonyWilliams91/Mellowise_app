# Epic 5: Early Adopter Pre-Order System

**Updated**: October 21, 2025 at 4:30 PM EST

## Epic Goal
Establish a viral pre-order landing page with dynamic tiered pricing that converts visitors into paying early adopters by creating urgency through scarcity mechanics, while delivering beta access exclusively to pre-order customers and managing their lifecycle from pre-order through launch and subscription activation.

## Key Dates
- **Beta Launch**: December 1, 2025 (exclusive to pre-order customers)
- **Official Launch**: January 1, 2026
- **First Billing**: April 1, 2026 (3 months after launch)

## Story 5.1: Early Adopter Database Schema & Tier Management

**As a system,**
**I want to track early adopter signups with tier-locked pricing and beta access entitlements,**
**so that I can manage pre-orders, enforce pricing tiers, and provision beta access correctly.**

### Acceptance Criteria
1. **`early_adopter_tiers` table created** with fields: tier_id, tier_name, monthly_price, upfront_price (3 months), capacity, current_count, is_active
2. **6 pricing tiers seeded** into database:
   - Tier 1: $15/month, $45 upfront, 100 capacity
   - Tier 2: $20/month, $60 upfront, 100 capacity
   - Tier 3: $25/month, $75 upfront, 100 capacity
   - Tier 4: $30/month, $90 upfront, 100 capacity
   - Tier 5: $35/month, $105 upfront, 100 capacity
   - Tier 6: $49/month, $147 upfront, unlimited capacity
3. **`early_adopter_signups` table created** with fields: user_id, email, tier_locked, monthly_rate, upfront_payment_amount, stripe_customer_id, stripe_subscription_id, payment_status, beta_access_date (default: 2025-12-01), billing_start_date (default: 2026-04-01), reservation_token, reservation_expires_at
4. **`tier_transitions_log` table created** for audit trail of tier progressions
5. **Database indexes** created on: user_id, email, tier_locked, payment_status, beta_access_date
6. **Automatic tier advancement trigger** implemented: when current_count reaches capacity, next tier activates
7. **Supabase migration file** created and tested locally with sample data
8. **RPC function** `increment_tier_count` created for atomic tier count updates

## Story 5.2: Current Tier API with Real-Time Updates

**As a visitor,**
**I want to see the current pricing tier and available spots in real-time,**
**so that I understand the urgency and can make an informed decision.**

### Acceptance Criteria
1. **`GET /api/early-adopter/current-tier` endpoint** returns: current_tier, monthly_price, upfront_price, spots_remaining, capacity, next_tier_price, spots_until_next_tier
2. **Edge caching** implemented with 5-second TTL to reduce database load
3. **Tier calculation logic** finds first tier with available capacity, falls back to Tier 6 if all full
4. **Next.js API route** at `src/app/api/early-adopter/current-tier/route.ts` implemented
5. **FastAPI backend route** at `backend/api/early_adopter/routes.py` implemented
6. **Error handling** for database connection failures with fallback response
7. **Response time** under 100ms (excluding edge cache cold start)
8. **Integration test** verifies tier progression when capacity reached

## Story 5.3: Spot Reservation System

**As a prospective early adopter,**
**I want my spot reserved while I complete checkout,**
**so that the tier doesn't change while I'm entering payment information.**

### Acceptance Criteria
1. **`POST /api/early-adopter/reserve-spot` endpoint** accepts email and returns reservation_token
2. **10-minute reservation window** enforced via reservation_expires_at timestamp
3. **Cryptographically secure token** generated using `secrets.token_urlsafe(32)`
4. **Reservation record** created with payment_status='reserved' (doesn't count toward tier capacity)
5. **Duplicate email check** prevents multiple active reservations for same email
6. **Expired reservations** automatically cleaned up via cron job (runs hourly)
7. **Reservation response** includes: token, tier, monthly_price, upfront_price, expires_at
8. **Rate limiting** enforced: 5 reservations per IP per minute

## Story 5.4: Stripe Pre-Order Payment Integration

**As a prospective early adopter,**
**I want to securely pay for my 3-month pre-order,**
**so that I can lock in my tier pricing and receive beta access on December 1st.**

### Acceptance Criteria
1. **Stripe product IDs created** for all 6 tiers (test mode and production mode)
2. **`POST /api/early-adopter/complete-signup` endpoint** accepts reservation_token and stripe_payment_intent_id
3. **Payment verification** via Stripe API confirms PaymentIntent status is 'succeeded'
4. **Stripe subscription created** with:
   - `billing_cycle_anchor` set to April 1, 2026 (3 months after launch)
   - `metadata`: { early_adopter: true, tier: X, locked_rate: $Y, billing_start_date: 2026-04-01 }
   - Price ID corresponding to locked monthly rate
5. **Reservation upgraded** to payment_status='completed' after successful payment
6. **Tier count incremented** atomically using `increment_tier_count` RPC
7. **Welcome email sent** via Resend with:
   - Confirmation of tier locked
   - Beta access date (December 1, 2025)
   - Billing start date (April 1, 2026)
   - Subscription details
8. **Webhook endpoint** `/api/webhooks/stripe/early-adopter` handles payment failures and refunds
9. **Idempotency** ensures duplicate payments don't create multiple subscriptions
10. **Error handling** for expired reservations returns 'RESERVATION_EXPIRED' error code

## Story 5.5: Dynamic Pricing Widget Component

**As a visitor,**
**I want to see a compelling pricing widget that updates in real-time,**
**so that I'm motivated to act quickly before the tier fills.**

### Acceptance Criteria
1. **React component** `DynamicPricingWidget.tsx` created with 5-second polling
2. **Visual elements displayed:**
   - Current tier badge with fire emoji
   - Monthly price (large, prominent)
   - "Lock in your lifetime rate" subtext
   - Progress bar showing spots remaining
   - Urgency message: "Price increases to $X/month in Y spots"
   - Primary CTA button: "PRE-ORDER NOW - $[UPFRONT] TODAY"
3. **4 checkmarks displayed:**
   - ✅ Pre-Order 3 Months & Get Beta Free
   - ✅ Beta Access December 1, 2025
   - ✅ Official Launch January 1, 2026
   - ✅ Billing Starts April 2026 (3 Months Covered)
4. **Loading state** shown during initial fetch and polling updates
5. **Error state** with retry button if API fails
6. **Mobile responsive** with adjusted font sizes and spacing
7. **Accessibility** with ARIA labels for screen readers
8. **CTA click** redirects to `/early-adopter/checkout?tier=[X]`

## Story 5.6: Early Adopter Landing Page

**As a prospective customer,**
**I want a comprehensive landing page that explains the value proposition and pricing,**
**so that I can make an informed decision about pre-ordering.**

### Acceptance Criteria
1. **Hero section** with split-screen layout (60% copy, 40% pricing widget on desktop):
   - Headline: "Stop Overpaying for Test Prep That Wasn't Built for You"
   - Subheadline: "Master the LSAT, GRE, MCAT, GMAT, Bar Exam, and more with AI that adapts to your learning style"
   - DynamicPricingWidget component embedded
   - Note: "Beta access ONLY for pre-order customers"
2. **Problem section** with 4 pain points (❌ icons):
   - Same lessons for everyone
   - Don't track your struggles
   - Slog through mastered content
   - Separate purchases for different exams
3. **Solution section** with 5 feature cards (icons + descriptions):
   - 🧠 Personalized Learning Paths
   - 🎮 Gamified Progress Tracking
   - 📈 Real-Time Analytics
   - 🎯 Adaptive Practice
   - 📚 One Platform, Every Exam
4. **Pricing table component** showing all 6 tiers with:
   - Tier name, monthly rate, upfront cost, capacity, status (dynamic)
   - "What You Get" checklist (emphasizing exclusive beta access)
   - "How It Works" explanation with 4-step timeline
5. **Savings calculator component** with interactive slider
6. **FAQ accordion** with 10 critical questions answered (including beta access restriction clarification)
7. **Final CTA section** with:
   - Live counter (current tier, spots left, next price)
   - "Here's what happens next" 4-step process
   - Primary CTA button
   - Secondary "Join Waitlist" link (no beta access, $99/month at launch)
8. **Mobile-optimized** with stacked layouts and sticky pricing widget footer
9. **Page load performance** < 2 seconds (Lighthouse score 95+)
10. **SEO metadata** configured for social sharing

## Story 5.7: Checkout Flow with Stripe Elements

**As a prospective early adopter,**
**I want a secure and simple checkout process,**
**so that I can complete my pre-order quickly and confidently.**

### Acceptance Criteria
1. **Checkout page** at `/early-adopter/checkout` route created
2. **On page load:**
   - Prompt user for email (or auto-fill if logged in)
   - Call `POST /api/early-adopter/reserve-spot`
   - Store reservation_token in component state
3. **Reservation confirmation card** displays:
   - "You're Reserving Tier [X]"
   - Monthly rate locked forever
   - Upfront payment amount
   - What they're getting (4 checkmarks)
   - Timeline: Pay today → Dec 1 beta → Jan 1 launch → April 1 billing starts
4. **Stripe Elements integration:**
   - PaymentElement for card input
   - Elements provider with Stripe publishable key
   - Custom styling matching site theme
5. **"Pay $[UPFRONT]" button** with loading state during processing
6. **On submit:**
   - Call `stripe.confirmPayment()` with Elements
   - If successful, call `POST /api/early-adopter/complete-signup`
   - Redirect to `/early-adopter/success`
7. **Error handling:**
   - Display Stripe errors (card declined, insufficient funds, etc.)
   - Handle expired reservation (show message + option to reserve new spot)
   - Network error retry logic
8. **10-minute countdown timer** shows reservation expiry
9. **Mobile responsive** with optimized form layout
10. **Security**: All payment processing via Stripe (no card data touches servers)

## Story 5.8: Success Page with Referral Integration

**As a new early adopter,**
**I want confirmation of my purchase and next steps,**
**so that I know what to expect and can share with friends.**

### Acceptance Criteria
1. **Success page** at `/early-adopter/success` route created
2. **Celebration header** with emoji and "You're In!" headline
3. **"What Happens Next?" timeline card:**
   - ✅ TODAY: Paid $[UPFRONT] and locked in $[MONTHLY]/month forever
   - ✅ December 1, 2025: Email with beta access
   - ✅ December 1-31: Free beta usage
   - ✅ January 1, 2026: Official launch (3-month pre-order period begins)
   - ✅ April 1, 2026: Monthly subscription billing starts at locked rate
4. **Subscription details card:**
   - Tier locked
   - Monthly rate
   - Next billing date (April 1, 2026)
   - Link to manage subscription in Stripe portal
5. **Referral incentive card** (placeholder for future):
   - Headline: "Want to unlock even better pricing?"
   - Description of referral system (when implemented)
   - "Get Your Referral Link" button (disabled with "Coming Soon" badge)
6. **Email confirmation notice:** "Check your inbox for receipt and welcome email"
7. **Social sharing buttons** for:
   - Twitter: Pre-written tweet about joining early
   - LinkedIn: Professional announcement
   - Facebook: Share with friends
8. **"Go to Dashboard" CTA** (disabled until beta launch with countdown)
9. **Support link** for questions or issues
10. **Tracking pixel** for conversion analytics (PostHog event: 'early_adopter_purchased')

## Story 5.9: Beta Access Gate & Launch Date Control

**As a system,**
**I want to prevent platform access before beta launch and restrict it to paying early adopters,**
**so that only authorized users can access the beta.**

### Acceptance Criteria
1. **Middleware** at `src/middleware.ts` checks all `/app/*` routes
2. **Beta launch date check:** If today < December 1, 2025, redirect to `/early-adopter/coming-soon`
3. **Early adopter check:**
   - Query `early_adopter_signups` for current user
   - Verify `payment_status = 'completed'`
   - If not found or not completed, redirect to `/early-adopter`
4. **Coming soon page** displays:
   - Countdown timer to December 1, 2025
   - "Your beta access is reserved" message (for pre-order customers)
   - "Pre-order now for beta access" CTA (for non-customers)
5. **Beta launch notification email** sent on December 1 to all completed early adopters
6. **Access logging** for audit trail (who accessed when)
7. **Environment variable** `EARLY_ADOPTER_BETA_LAUNCH_DATE=2025-12-01` controls gate
8. **Admin override** allows specified emails to bypass gate for testing
9. **Edge cases handled:**
   - User without early adopter record sees paywall
   - User with 'reserved' status sees "complete your payment" message
   - Expired reservations are cleared and cannot access beta

## Story 5.10: Stripe Subscription Management & Billing

**As an early adopter,**
**I want my subscription to bill correctly after my 3-month pre-order period,**
**so that I'm not charged prematurely and my locked rate is honored.**

### Acceptance Criteria
1. **Stripe subscription created** with correct `billing_cycle_anchor`:
   - For all pre-orders: billing starts April 1, 2026
   - `proration_behavior` set to 'none' (no proration for early adopters)
2. **Subscription metadata** includes:
   - `early_adopter: true`
   - `tier: [1-6]`
   - `locked_rate: [15-49]`
   - `pre_order_date: [ISO date]`
   - `beta_access_date: 2025-12-01`
   - `billing_start_date: 2026-04-01`
   - `pre_order_coverage: 2026-01-01 to 2026-03-31`
3. **Stripe Customer Portal** configured for early adopters:
   - Can view subscription details
   - Can update payment method
   - Can view invoices
   - **Cannot** change plan or cancel via portal (must contact support for locked rate protection)
4. **Webhook handling** for subscription events:
   - `customer.subscription.updated`: Log changes
   - `invoice.payment_failed`: Send dunning email, pause access after 3 failures
   - `customer.subscription.deleted`: Mark user as churned, send exit survey
5. **Daily cron job** validates subscription states:
   - Check all early adopter subscriptions have correct billing date (April 1, 2026)
   - Alert if any subscription scheduled to bill before April 1, 2026
   - Generate report of upcoming billing (for monitoring)
6. **Billing email sequence:**
   - 7 days before first bill: "Your subscription starts soon" reminder
   - On first bill: Receipt and "Thanks for being an early adopter"
   - Monthly: Standard receipts with "Early Adopter - $[RATE]/month locked forever" label
7. **Grace period**: 7 days after failed payment before access revoked
8. **Cancellation handling:** User can cancel anytime, but loses locked rate if they rejoin later

## Story 5.11: Admin Dashboard for Early Adopter Monitoring

**As an admin,**
**I want to monitor early adopter signups, tier progressions, and revenue,**
**so that I can make informed decisions and respond to issues.**

### Acceptance Criteria
1. **Admin route** at `/admin/early-adopters` protected by admin role check
2. **Dashboard displays:**
   - Total signups by tier (visual breakdown)
   - Current tier and spots remaining
   - Total revenue (sum of all upfront payments)
   - Projected MRR from early adopters
   - Signups over time chart (daily breakdown)
   - Conversion rate (visitors → signups)
3. **Tier progression timeline** visualization showing when each tier filled
4. **Recent signups table** with columns: email, tier, payment_status, upfront_paid, signup_date
5. **Filters** for: date range, tier, payment status
6. **Export functionality** to CSV for financial reporting
7. **Manual tier advancement** button (with confirmation) to override automatic progression
8. **Refund management** interface:
   - Search by email
   - View payment history
   - Issue refund (calls Stripe API + updates database)
   - Revoke beta access on refund
9. **Email blast tool** for sending announcements to early adopters
10. **Real-time updates** via polling (every 10 seconds) when dashboard is open

## Story 5.12: Comprehensive Testing & QA

**As a QA engineer,**
**I want comprehensive tests covering the entire early adopter flow,**
**so that we can launch confidently without critical bugs.**

### Acceptance Criteria
1. **Playwright E2E tests** for:
   - Full signup flow (landing page → checkout → success)
   - Dynamic pricing widget updates in real-time
   - Reservation expiry handling
   - Tier progression when capacity reached
   - Mobile responsive layouts
2. **Unit tests** for:
   - Tier calculation logic (boundary cases: 99, 100, 101 signups)
   - Reservation token generation and validation
   - Billing date calculation (April 1, 2026)
   - Stripe metadata formatting
3. **Integration tests** for:
   - Stripe PaymentIntent creation and confirmation
   - Stripe Subscription creation with correct billing anchor
   - Webhook signature verification
   - Database triggers for tier advancement
4. **Load testing** with k6:
   - 100 concurrent users browsing landing page
   - 50 simultaneous signups (test race conditions)
   - API response times under load
5. **Security tests** for:
   - SQL injection attempts on email inputs
   - Reservation token brute force attempts
   - Admin route authorization bypass attempts
   - Stripe webhook signature validation
6. **Accessibility audit** with axe DevTools:
   - Zero critical violations on landing page
   - Keyboard navigation works for entire flow
   - Screen reader compatibility (VoiceOver tested)
7. **Performance audit** with Lighthouse:
   - Landing page: 95+ score
   - Checkout page: 90+ score
   - First Contentful Paint < 1.5s
8. **Cross-browser testing** on: Chrome, Firefox, Safari, Edge
9. **Mobile device testing** on: iOS Safari, Android Chrome
10. **Staging environment** smoke test before production deploy

## Story 5.13: Deployment, Monitoring & Launch

**As a DevOps engineer,**
**I want the early adopter system deployed with proper monitoring,**
**so that we can detect and resolve issues quickly during launch.**

### Acceptance Criteria
1. **Supabase production migration** deployed and validated
2. **Stripe production price IDs** created for all 6 tiers
3. **Environment variables** configured in Vercel production:
   - `STRIPE_SECRET_KEY` (production)
   - `STRIPE_WEBHOOK_SECRET` (production endpoint)
   - `EARLY_ADOPTER_BETA_LAUNCH_DATE=2025-12-01`
   - `EARLY_ADOPTER_BILLING_START_DATE=2026-04-01`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (production)
4. **Vercel deployment** with preview URL for staging review
5. **Sentry error tracking** configured with:
   - Source maps uploaded for production debugging
   - Alerts for: payment failures, API errors, 500 responses
   - Performance monitoring enabled
6. **PostHog analytics** events tracking:
   - `early_adopter_page_viewed`
   - `pricing_widget_cta_clicked`
   - `reservation_created`
   - `payment_initiated`
   - `payment_completed`
   - `tier_advanced`
7. **Custom dashboard** in PostHog showing:
   - Conversion funnel (page view → reservation → payment)
   - Drop-off points in checkout flow
   - Tier distribution
8. **Stripe dashboard monitoring** configured with:
   - Revenue reports
   - Failed payment alerts
   - Subscription creation tracking
9. **Cron jobs** scheduled on Vercel:
   - Hourly: Clean up expired reservations
   - Daily: Validate subscription billing dates (April 1, 2026)
   - Daily: Generate early adopter metrics report
10. **Launch checklist** completed:
    - [ ] All tests passing (E2E, unit, integration)
    - [ ] Lighthouse score 95+
    - [ ] Accessibility audit passed
    - [ ] Staging smoke test completed
    - [ ] Stakeholder approval received
    - [ ] Monitoring dashboards configured
    - [ ] Support team briefed on early adopter system
    - [ ] Launch announcement social posts scheduled

---

## Implementation Notes

### Critical Billing Logic
- **Upfront Payment**: $[TIER_PRICE × 3] charged today
- **Beta Access**: December 1, 2025 (free, 1 month)
- **Official Launch**: January 1, 2026 (3-month pre-order period starts)
- **First Billing**: April 1, 2026 (monthly subscription billing begins)
- **Total Value**: 4 months of access for price of 3 months

### Beta Access Restriction
**CRITICAL**: Beta access is ONLY available to users who complete pre-order payment. Non-paying users cannot access beta and must wait until January 1, 2026 launch at $99/month.

### Stripe Integration Requirements
1. Create 6 price IDs (recurring monthly)
2. Set `billing_cycle_anchor` to April 1, 2026 for all subscriptions
3. Include comprehensive metadata for tracking
4. Configure Customer Portal with restricted permissions

### Key Metrics
- **Target**: 500 signups across tiers 1-5 (100 each)
- **Conversion Rate Goal**: 25%+ (visitors → pre-orders)
- **Projected MRR**: $7,500 (assuming 500 signups, 60% activation)
- **Projected ARR**: $90,000

---

## Files to Create

### Database
- `supabase/migrations/20251021_early_adopter_system.sql`

### Backend API
- `backend/api/early_adopter/__init__.py`
- `backend/api/early_adopter/routes.py`

### Frontend Pages
- `src/app/early-adopter/page.tsx`
- `src/app/early-adopter/checkout/page.tsx`
- `src/app/early-adopter/success/page.tsx`
- `src/app/early-adopter/coming-soon/page.tsx`

### Components
- `src/components/early-adopter/DynamicPricingWidget.tsx`
- `src/components/early-adopter/PricingTable.tsx`
- `src/components/early-adopter/SavingsCalculator.tsx`
- `src/components/early-adopter/FAQ.tsx`
- `src/components/early-adopter/FeatureCard.tsx`

### API Routes
- `src/app/api/early-adopter/current-tier/route.ts`
- `src/app/api/early-adopter/reserve-spot/route.ts`
- `src/app/api/early-adopter/complete-signup/route.ts`
- `src/app/api/webhooks/stripe/early-adopter/route.ts`
- `src/app/api/cron/validate-early-adopter-subscriptions/route.ts`

### Middleware
- `src/middleware.ts` (update for beta access gate)

### Email Templates
- `emails/early-adopter-welcome.tsx`
- `emails/beta-access-notification.tsx`

### Tests
- `tests/e2e/early-adopter.spec.ts`
- `tests/unit/tier-logic.test.ts`

### Admin
- `src/app/admin/early-adopters/page.tsx`

---

## Estimated Effort

- **Database & Backend**: 25 hours
- **Frontend Components**: 30 hours
- **Checkout Integration**: 20 hours
- **Testing**: 25 hours
- **Deployment & Monitoring**: 15 hours
- **Buffer for bugs**: 15 hours

**Total**: ~130 hours (4 weeks solo developer @ 30-35 hrs/week)

---

## Success Criteria

✅ Landing page converts 25%+ of visitors to pre-orders
✅ All 500 tier 1-5 spots filled before launch
✅ Zero payment failures or billing errors
✅ Beta access gate blocks non-paying users
✅ April 1, 2026 billing works correctly for all early adopters
✅ Admin dashboard provides actionable insights
✅ Lighthouse score 95+ on landing page
✅ Zero critical security vulnerabilities

---

**Epic Status**: Ready for Implementation
**Target Launch Date**: December 1, 2025
**Implementation Start**: October 21, 2025
