# Mellowise Waitlist System - Master Implementation Plan

**Start Date:** October 1, 2025
**Target Launch:** October 22, 2025 (3 weeks)
**Developer:** Solo (You)
**Approach:** Full feature set, production-ready

---

## 📚 **Reference Documents**

All specifications created by the BMad specialist agent team:

1. **`docs/front-end-spec-landing-page.md`** - UX/UI specifications (Sally - UX Expert)
2. **`docs/marketing-copy-landing-page.md`** - All marketing copy (Alex - Marketing Specialist)
3. **`docs/architecture-waitlist-system.md`** - Technical architecture (Winston - Architect)
4. **This file** - Implementation roadmap (James - Dev Agent)

---

## 🎯 **Project Summary**

**Goal:** Build a viral waitlist landing page with tiered pricing and referral system to collect 500+ beta signups.

**Key Features:**
- ✅ Tiered pricing ($15-$35/month based on signup position)
- ✅ Referral system (3 friends = 10 spots, social shares = 5 spots each)
- ✅ 1-tier improvement cap (prevent multi-tier jumping)
- ✅ Real-time counter (5-second polling)
- ✅ Email automation (4-email sequence via Resend)
- ✅ Anti-fraud (IP tracking, disposable email blocking)
- ✅ Analytics (PostHog, Vercel Analytics)

**Revenue Projection:**
- 500 signups @ 60% activation = 300 active users
- MRR: $7,500/month ($90K ARR)

---

## 📅 **3-Week Sprint Schedule**

### **Week 1: Foundation (Oct 1-7)** ⚙️
**Focus:** Database + Infrastructure + Landing Page

### **Week 2: Core Features (Oct 8-14)** 🎮
**Focus:** Referral System + Email Automation

### **Week 3: Polish & Launch (Oct 15-22)** 🚀
**Focus:** Testing + Security + Go Live

---

## 🗓️ **Week 1: Foundation (Days 1-7)**

### **Day 1: Database Setup** 🗄️

**Morning (4 hours):**
- [ ] Create Supabase migration files
- [ ] Implement 4 tables: `waitlist_users`, `referrals`, `social_shares`, `email_events`
- [ ] Add all indexes (position, email, referral_code, etc.)
- [ ] Create SQL functions: `get_current_tier()`, `get_tier_by_position()`

**Afternoon (4 hours):**
- [ ] Test database schema with sample data
- [ ] Write SQL queries for common operations (get user, count signups, etc.)
- [ ] Set up Supabase Auth (Google OAuth configuration)
- [ ] Configure environment variables (.env.local)

**Reference:** `docs/architecture-waitlist-system.md` (Section 2: Database Schema)

**Deliverable:** Database schema deployed to Supabase

---

### **Day 2: Landing Page Layout** 🎨

**Morning (4 hours):**
- [ ] Create `/app/landing/page.tsx` (Next.js App Router)
- [ ] Build split-screen layout (60/40 ratio)
- [ ] Implement left panel: Hero + pricing widget + signup form
- [ ] Implement right panel: Product preview (dark background)

**Afternoon (4 hours):**
- [ ] Add shadcn/ui components:
  - [ ] Navbar-01 (top navigation)
  - [ ] Button (CTAs)
  - [ ] Input (email field)
- [ ] Implement mobile responsive design (stack vertically < 768px)
- [ ] Add Tailwind CSS styling (colors, typography from spec)

**Reference:**
- `docs/front-end-spec-landing-page.md` (Section 4: Wireframes & Mockups)
- `docs/marketing-copy-landing-page.md` (Section 1: Landing Page Copy)

**Deliverable:** Static landing page (no functionality yet)

---

### **Day 3: Pricing Tier Widget** 📊

**Morning (4 hours):**
- [ ] Build `<PricingTierWidget>` component
- [ ] Implement tier display logic (all 6 tiers)
- [ ] Add "YOU ARE HERE" highlighting
- [ ] Create polling hook: `useTierCounter()` (fetch every 5s)

**Afternoon (4 hours):**
- [ ] Create `/api/waitlist/counter` API route
- [ ] Implement 5-second edge caching
- [ ] Query Supabase for total signups
- [ ] Return tier info + remaining spots
- [ ] Test with manual database inserts

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 3.1: GET /api/waitlist/counter)
- `docs/front-end-spec-landing-page.md` (Section 1.2: Pricing Tier Widget)

**Deliverable:** Live counter showing current tier

---

### **Day 4: Signup Flow (Part 1)** 🔐

**Morning (4 hours):**
- [ ] Set up Google OAuth with Supabase Auth
- [ ] Create Google Cloud project + OAuth credentials
- [ ] Configure redirect URLs
- [ ] Test OAuth flow manually

**Afternoon (4 hours):**
- [ ] Build signup form component
- [ ] Add email validation
- [ ] Implement "Continue with Google" button
- [ ] Implement "Continue with Email" flow
- [ ] Add loading states + error handling

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 3.1: POST /api/waitlist/signup)
- `docs/front-end-spec-landing-page.md` (Section 3.1: Waitlist Signup Flow)

**Deliverable:** Functional signup form (UI only, API next day)

---

### **Day 5: Signup Flow (Part 2)** ✅

**Morning (4 hours):**
- [ ] Create `/api/waitlist/signup` API route
- [ ] Implement signup logic:
  - [ ] Check if email exists
  - [ ] Get current total signups
  - [ ] Calculate tier
  - [ ] Generate referral code
  - [ ] Insert user into database
- [ ] Handle OAuth provider data
- [ ] Capture IP address + user agent (fraud detection)

**Afternoon (4 hours):**
- [ ] Create success page `/app/waitlist/success/page.tsx`
- [ ] Display user position, tier, price
- [ ] Show "What's Next" steps
- [ ] Test full signup flow end-to-end
- [ ] Fix any bugs

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 3.1: POST /api/waitlist/signup)
- `docs/marketing-copy-landing-page.md` (Section 2: Success Page Copy)

**Deliverable:** Working signup flow (Google OAuth + Email)

---

### **Day 6: Email Setup** 📧

**Morning (4 hours):**
- [ ] Sign up for Resend account
- [ ] Verify domain (mellowise.com)
- [ ] Install `resend` + `@react-email/components` packages
- [ ] Create `emails/` directory
- [ ] Build `WaitlistWelcome.tsx` React Email template

**Afternoon (4 hours):**
- [ ] Create FastAPI email service (or Next.js API route for simplicity)
- [ ] Implement `send_welcome_email()` function
- [ ] Integrate Resend API
- [ ] Test email sending manually
- [ ] Trigger welcome email on signup

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 5: Email Automation)
- `docs/marketing-copy-landing-page.md` (Section 3.1: Email #1 - Welcome)

**Deliverable:** Welcome email sent on signup

---

### **Day 7: Code Review & Refactoring** 🧹

**Morning (4 hours):**
- [ ] Review all code written in Week 1
- [ ] Refactor for clarity and maintainability
- [ ] Add TypeScript types where missing
- [ ] Write basic unit tests for tier calculation
- [ ] Add error boundaries to React components

**Afternoon (4 hours):**
- [ ] Update documentation (inline comments)
- [ ] Test all flows manually (signup, counter, email)
- [ ] Fix any bugs discovered
- [ ] Commit to git with clear commit messages
- [ ] Prepare for Week 2

**Deliverable:** Clean, working codebase ready for Week 2

---

## 🗓️ **Week 2: Core Features (Days 8-14)**

### **Day 8: Referral System (Part 1)** 🤝

**Morning (4 hours):**
- [ ] Build referral link display on success page
- [ ] Generate unique referral codes (format: `firstname123`)
- [ ] Create `/app/r/[code]/page.tsx` landing page (referral link destination)
- [ ] Store referral code in session when user arrives via referral link

**Afternoon (4 hours):**
- [ ] Create `/api/waitlist/referral` API route
- [ ] Implement referral relationship creation
- [ ] Handle referred user signup (create referral record)
- [ ] Test referral flow: User A shares → User B signs up → Relationship created

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 4: Referral Tracking System)
- `docs/marketing-copy-landing-page.md` (Section 2.4: Referral Link Display)

**Deliverable:** Basic referral tracking working

---

### **Day 9: Referral System (Part 2)** 📈

**Morning (4 hours):**
- [ ] Implement batch completion logic (3 friends = 10 spots)
- [ ] Create tier jump calculation function
- [ ] Enforce 1-tier improvement cap
- [ ] Update user's `spots_jumped`, `tier_current`, `price_current`

**Afternoon (4 hours):**
- [ ] Build referral progress dashboard (success page)
- [ ] Show spots jumped, friends referred, target tier
- [ ] Display dynamic "spots needed" calculation
- [ ] Add copy button for referral link
- [ ] Test complete referral flow with tier jumping

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 4.2: Tier Jump Calculation Logic)
- `docs/marketing-copy-landing-page.md` (Section 2.3: Referral Section)

**Deliverable:** Full referral system with tier jumping

---

### **Day 10: Social Sharing** 📱

**Morning (4 hours):**
- [ ] Create `/api/waitlist/social-share` API route
- [ ] Implement UTM link generation (5 platforms)
- [ ] Create `social_shares` table records on button click
- [ ] Build social share buttons (Twitter, Facebook, Instagram, TikTok, LinkedIn)

**Afternoon (4 hours):**
- [ ] Implement click verification (track UTM clicks)
- [ ] Award 5 spots when share is verified
- [ ] Update user tier if threshold crossed
- [ ] Add social share tracking to success page
- [ ] Test each platform's share functionality

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 4.3: Social Share Verification)
- `docs/marketing-copy-landing-page.md` (Section 2.5: Social Sharing Copy)

**Deliverable:** Social sharing with spot rewards

---

### **Day 11: Email Automation (Part 1)** ✉️

**Morning (4 hours):**
- [ ] Create `emails/ProgressUpdate.tsx` template
- [ ] Create `emails/BetaLaunch.tsx` template
- [ ] Implement dynamic content (spots jumped, tier changes)
- [ ] Test email rendering locally

**Afternoon (4 hours):**
- [ ] Create email trigger system (manual or scheduled)
- [ ] Build `/api/emails/send-progress` endpoint
- [ ] Send progress email when user jumps tiers
- [ ] Test email sequence manually
- [ ] Track email events in `email_events` table

**Reference:**
- `docs/marketing-copy-landing-page.md` (Section 3.2-3.4: Email Sequence)
- `docs/architecture-waitlist-system.md` (Section 5.3: Email Send Function)

**Deliverable:** Progress update emails working

---

### **Day 12: Email Automation (Part 2)** 📬

**Morning (4 hours):**
- [ ] Set up Resend webhooks (`/api/webhooks/resend`)
- [ ] Track email opens, clicks, bounces
- [ ] Update `email_events` table with webhook data
- [ ] Build simple email analytics dashboard (optional)

**Afternoon (4 hours):**
- [ ] Create scheduled job for progress emails (Day 3, Day 7 after signup)
- [ ] Implement beta launch email system (manual trigger)
- [ ] Test full email sequence (4 emails)
- [ ] Verify all dynamic variables populate correctly

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 5.4: Email Event Webhooks)

**Deliverable:** Complete 4-email automation sequence

---

### **Day 13: Anti-Fraud & Security** 🔒

**Morning (4 hours):**
- [ ] Implement disposable email detection
- [ ] Create blocklist of disposable domains
- [ ] Add IP-based fraud detection (multiple signups from same IP)
- [ ] Flag suspicious users for manual review

**Afternoon (4 hours):**
- [ ] Implement rate limiting (Upstash Redis or simple in-memory)
- [ ] Add email verification for email signups (send verification link)
- [ ] Build referral batch validation (check for same IP patterns)
- [ ] Create admin review queue (simple table view)

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 6: Anti-Fraud & Security)

**Deliverable:** Fraud detection system active

---

### **Day 14: Code Review & Testing** 🧪

**Morning (4 hours):**
- [ ] Review all Week 2 code
- [ ] Write unit tests for tier calculation logic
- [ ] Write integration tests for referral flow
- [ ] Add error handling for edge cases

**Afternoon (4 hours):**
- [ ] Manual QA of all features
- [ ] Test edge cases (exactly 100 signups, tier boundaries, max tier reached)
- [ ] Fix any bugs discovered
- [ ] Commit to git, prepare for Week 3

**Deliverable:** Stable, tested codebase

---

## 🗓️ **Week 3: Polish & Launch (Days 15-21)**

### **Day 15: Playwright Testing** 🎭

**Morning (4 hours):**
- [ ] Set up Playwright test environment
- [ ] Write test: User can sign up via Google OAuth
- [ ] Write test: User can sign up via email
- [ ] Write test: Invalid email shows error

**Afternoon (4 hours):**
- [ ] Write test: Referral flow (user A refers user B)
- [ ] Write test: Tier jumping works correctly
- [ ] Write test: Mobile navigation works
- [ ] Write test: Performance (page loads < 2s)

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 12.2: Playwright Testing Strategy)
- `docs/front-end-spec-landing-page.md` (Section 12.3: Context7 Integration)

**Deliverable:** Automated test suite passing

---

### **Day 16: Performance Optimization** ⚡

**Morning (4 hours):**
- [ ] Add WebP image optimization for product preview
- [ ] Implement lazy loading for images
- [ ] Add font subsetting (Inter font, Latin characters only)
- [ ] Enable edge caching for static assets

**Afternoon (4 hours):**
- [ ] Optimize database queries (use prepared statements)
- [ ] Add Redis caching for frequently accessed data
- [ ] Test page load speed (target: < 2 seconds LCP)
- [ ] Run Lighthouse audit (target: 95+ performance score)

**Reference:**
- `docs/front-end-spec-landing-page.md` (Section 10: Performance Considerations)
- `docs/architecture-waitlist-system.md` (Section 7: Performance Optimization)

**Deliverable:** Sub-2-second page load

---

### **Day 17: Analytics & Monitoring** 📊

**Morning (4 hours):**
- [ ] Set up PostHog account
- [ ] Add PostHog tracking to landing page
- [ ] Track key events: signup, referral_shared, tier_upgraded
- [ ] Set up Vercel Analytics

**Afternoon (4 hours):**
- [ ] Set up Sentry for error monitoring
- [ ] Add error boundaries to all components
- [ ] Test error tracking (trigger intentional error)
- [ ] Create simple admin dashboard (total signups, tier breakdown)

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 9: Monitoring & Analytics)
- `docs/marketing-copy-landing-page.md` (Section 5.2: Analytics & Tracking)

**Deliverable:** Full analytics + monitoring stack

---

### **Day 18: Accessibility & Polish** ♿

**Morning (4 hours):**
- [ ] Run axe DevTools accessibility audit
- [ ] Fix all WCAG 2.1 AA violations
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test screen reader (VoiceOver on Mac, NVDA on Windows)

**Afternoon (4 hours):**
- [ ] Add focus indicators to all interactive elements
- [ ] Ensure color contrast ratios meet WCAG standards
- [ ] Add ARIA labels where needed
- [ ] Test with color blindness simulation

**Reference:**
- `docs/front-end-spec-landing-page.md` (Section 7: Accessibility Requirements)

**Deliverable:** WCAG 2.1 AA compliant

---

### **Day 19: Security Audit & Final Testing** 🔐

**Morning (4 hours):**
- [ ] Review all API endpoints for security issues
- [ ] Ensure proper input validation (SQL injection prevention)
- [ ] Test CORS settings
- [ ] Verify environment variables are not exposed

**Afternoon (4 hours):**
- [ ] Run full regression test suite
- [ ] Test all user flows end-to-end
- [ ] Load test with 1000 concurrent users (optional, use loader.io)
- [ ] Fix any critical bugs discovered

**Reference:**
- `docs/architecture-waitlist-system.md` (Section 11: Technical Risks & Mitigation)

**Deliverable:** Security-hardened, production-ready code

---

### **Day 20: Staging Deployment & Stakeholder Review** 🎬

**Morning (4 hours):**
- [ ] Deploy to Vercel staging environment
- [ ] Test on staging with real data
- [ ] Invite stakeholders to review (share staging URL)
- [ ] Create demo video of key flows

**Afternoon (4 hours):**
- [ ] Gather stakeholder feedback
- [ ] Make final tweaks based on feedback
- [ ] Update documentation (README, API docs)
- [ ] Prepare launch checklist

**Deliverable:** Stakeholder-approved staging build

---

### **Day 21: Production Launch** 🚀

**Morning (4 hours):**
- [ ] Final code review
- [ ] Merge to main branch
- [ ] Deploy to production (Vercel)
- [ ] Verify all environment variables are set
- [ ] Test production deployment

**Afternoon (4 hours):**
- [ ] Monitor error logs (Sentry)
- [ ] Watch analytics dashboard (PostHog)
- [ ] Send launch announcement (social media, email)
- [ ] Celebrate! 🎉

**Deliverable:** Live waitlist at mellowise.com/landing

---

## ✅ **Daily Checklist Template**

Use this for each day:

```markdown
## Day X: [Feature Name]

**Morning Standup:**
- [ ] Review yesterday's work
- [ ] Check for any production issues
- [ ] Plan today's tasks

**Work Session:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**End of Day:**
- [ ] Commit code to git
- [ ] Update this checklist
- [ ] Note any blockers
- [ ] Plan tomorrow

**Blockers:** None / [List blockers]
**Notes:** [Any important notes]
```

---

## 🎯 **Success Metrics**

Track these weekly:

**Week 1:**
- [ ] Landing page loads in < 2s
- [ ] Signup flow works (both OAuth + email)
- [ ] Welcome email sends successfully

**Week 2:**
- [ ] Referral system awards spots correctly
- [ ] Tier jumping works with 1-tier cap enforced
- [ ] All 4 emails send at correct times

**Week 3:**
- [ ] Lighthouse score: 95+ (performance)
- [ ] axe DevTools: 0 violations
- [ ] Playwright tests: 100% passing
- [ ] Production deploy successful

---

## 🚨 **Common Pitfalls to Avoid**

1. **Tier Calculation Bugs**
   - Test boundary conditions (position 100, 101, 200, 201, etc.)
   - Verify 1-tier cap is enforced (user in Tier 5 can't jump to Tier 1)

2. **Referral Fraud**
   - Always check IP addresses for suspicious patterns
   - Validate email addresses are real (not disposable)

3. **Email Deliverability**
   - Verify domain in Resend before launch
   - Test SPF/DKIM records

4. **Performance**
   - Don't forget to cache the counter endpoint (5s cache)
   - Lazy load images on landing page

5. **Security**
   - Never expose Supabase service role key in frontend
   - Always validate user input on backend

---

## 📚 **Reference Materials**

**Key Code Snippets:**
- Tier calculation: `docs/architecture-waitlist-system.md` (Section 4.2)
- Email templates: `docs/architecture-waitlist-system.md` (Section 5.2)
- Database queries: `docs/architecture-waitlist-system.md` (Appendix A)

**External Resources:**
- Resend Docs: https://resend.com/docs
- React Email: https://react.email/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- shadcn/ui: Use Context7 MCP for latest docs
- Playwright: https://playwright.dev/docs/intro

---

## 🎉 **Launch Day Checklist**

Before going live:

- [ ] All Playwright tests passing
- [ ] Lighthouse score 95+
- [ ] Sentry integrated and tested
- [ ] PostHog tracking verified
- [ ] Resend domain verified
- [ ] Environment variables set in Vercel
- [ ] Database backups configured
- [ ] Monitoring dashboard created
- [ ] Stakeholder approval received
- [ ] Social media posts scheduled
- [ ] Landing page URL live: mellowise.com/landing

---

## 🔄 **Post-Launch Plan**

**Week 4 (After Launch):**
- Monitor signups daily
- Track conversion rate (target: 25%+)
- Watch for fraud patterns
- Respond to user feedback
- A/B test headlines (if conversion < 20%)

**Month 2:**
- Add admin dashboard for detailed analytics
- Implement A/B testing for CTA copy
- Optimize referral incentives based on data
- Plan beta launch strategy

---

## 📞 **Support & Resources**

**If You Get Stuck:**
1. Review the relevant spec document (UX, Marketing, or Architecture)
2. Check the architecture doc for code examples
3. Use Context7 to look up shadcn/ui or Resend documentation
4. Test in isolation (create minimal reproduction)

**Documentation Index:**
- **UX Questions:** `docs/front-end-spec-landing-page.md`
- **Copy Questions:** `docs/marketing-copy-landing-page.md`
- **Technical Questions:** `docs/architecture-waitlist-system.md`
- **This Plan:** `docs/IMPLEMENTATION-PLAN-WAITLIST.md`

---

**Ready to start Day 1? Let's build this! 🚀**

**First Task:** Set up Supabase database schema (Day 1 Morning)

**Command to get started:**
```bash
# Create new migration
npx supabase migration new waitlist_system

# Open the migration file and paste schema from architecture doc
code supabase/migrations/[timestamp]_waitlist_system.sql
```

Good luck! You've got this. 💪
