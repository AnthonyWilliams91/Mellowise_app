'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Particles } from '@/components/ui/particles';
import { GradientText } from '@/components/ui/gradient-text';
import { Accordion } from '@/components/ui/accordion';

interface TierData {
  tier: number;
  price: number;
  spotsRemaining: number;
  totalSignups: number;
}

export default function HomePage() {
  const [tierData, setTierData] = useState<TierData>({
    tier: 1,
    spotsRemaining: 100,
    price: 15,
    totalSignups: 0
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // FAQ Data
  const faqItems = [
    {
      title: "When does the beta launch?",
      content: "Beta access begins December 1, 2025 – exclusively for pre-order customers. You'll receive an email with login credentials on launch day."
    },
    {
      title: "What if I don't get in at Tier 1?",
      content: "Each tier has 100 spots. When Tier 1 fills, pricing moves to Tier 2 ($20/month), and so on. Lock in the lowest tier you can – you can't go back in time."
    },
    {
      title: "Do I really get ALL future exams at my locked rate?",
      content: "Yes. Your early adopter rate covers the LSAT platform now and every exam we add in the future (GRE, MCAT, GMAT, CPA, Bar, USMLE, etc.). No upsells. No surprises."
    },
    {
      title: "When does my subscription start?",
      content: "You pay 3 months upfront today. Get 1 month free beta access (December 2025). Official launch is January 1, 2026. Your monthly billing starts April 1, 2026 – after your 3-month pre-order period."
    },
    {
      title: "Can I cancel anytime?",
      content: "Yes, cancel anytime after April 2026. Your early adopter rate is locked in for life—even if you cancel. As long as you don't delete your account, you can reactivate at your original tier pricing anytime. Delete your account and you lose that rate forever."
    },
    {
      title: "What if I fail my exam?",
      content: "Keep studying at your locked rate. Use the platform for multiple attempts, switch to a different exam, or use it for future career exams. There's no time limit."
    },
    {
      title: "Is this just LSAT right now?",
      content: "We're launching with LSAT first to nail the experience. Other exams roll out in 2026-2027. You're betting on our vision—and we're rewarding that trust with lifetime pricing."
    },
    {
      title: "What's included in beta access?",
      content: "Full LSAT prep platform with adaptive learning, 1,000+ practice questions, analytics dashboard, and direct feedback channel to our team. You'll help shape the product."
    },
    {
      title: "Why should I trust a new platform?",
      content: "Fair question. We're offering 1 month free beta precisely so you can try before you commit long-term. If it's not working for you during beta, request a refund. No hard feelings."
    },
    {
      title: "Can I upgrade to a better tier if I join late?",
      content: "Yes! You can move up one tier (to lower pricing) in three ways: (1) Share via your affiliate link—every 3 signups move you 10 seats closer to the next tier. (2) Share on social media—5 seats per platform. (3) Purchase 6 months upfront at your current tier price—after 6 months from official launch (July 2026), your billing drops to the next lower tier price permanently."
    }
  ];

  const scrollToSignup = () => {
    document.getElementById('signup-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    setMobileMenuOpen(false);
  };

  const scrollToPricing = () => {
    document.getElementById('pricing-widget')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
    setMobileMenuOpen(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setSignInError(null);

      // Create fresh Supabase client for each OAuth attempt to prevent session caching
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent' // Force Google to always show consent screen
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        setSignInError(error.message);
        setSigningIn(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setSignInError('An unexpected error occurred');
      setSigningIn(false);
    }
  };

  const handleEmailSignIn = async () => {
    // Placeholder for Day 5 - Email/password flow
    alert('Email signup coming in Day 5!');
  };

  useEffect(() => {
    async function fetchCounter() {
      try {
        const response = await fetch('/api/waitlist/counter');
        if (!response.ok) {
          throw new Error('Failed to fetch counter data');
        }
        const data = await response.json();
        setTierData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching counter:', err);
        setLoading(false);
      }
    }

    fetchCounter();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchCounter, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentTier = tierData.tier;
  const spotsRemaining = tierData.spotsRemaining;

  // Calculate the "display tier" - the tier that should be highlighted as current
  // If current tier is full (0 spots remaining), the next tier is the display tier
  // Cap at tier 6 since that's the max tier
  const displayTier = spotsRemaining === 0
    ? Math.min(currentTier + 1, 6)
    : currentTier;

  // Define all tiers with their pricing
  const tiers = [
    { tier: 1, price: 15, capacity: 100 },
    { tier: 2, price: 20, capacity: 100 },
    { tier: 3, price: 25, capacity: 100 },
    { tier: 4, price: 30, capacity: 100 },
    { tier: 5, price: 35, capacity: 100 },
    { tier: 6, price: 49, capacity: null } // null = infinity
  ];

  // Function to render a single tier
  const renderTier = (tierInfo: { tier: number; price: number; capacity: number | null }) => {
    const isPastTier = tierInfo.tier < displayTier;
    const isCurrentTier = tierInfo.tier === displayTier;
    const isFutureTier = tierInfo.tier > displayTier;

    // Past tier styling and content
    if (isPastTier) {
      return (
        <div key={tierInfo.tier} className="text-teal-400/60 pl-3 line-through opacity-50">
          Tier {tierInfo.tier}: 0/{tierInfo.capacity} available at ${tierInfo.price}/month
        </div>
      );
    }

    // Current tier styling and content
    if (isCurrentTier) {
      // Calculate spots to display based on whether we're at a boundary
      // If we're showing the next tier (displayTier > currentTier), show full capacity
      // Otherwise, show actual spots remaining
      const actualSpotsRemaining = displayTier > currentTier
        ? tierInfo.capacity // Show full capacity for the next tier
        : spotsRemaining; // Show actual remaining for current tier

      // Special handling for Tier 6 (infinity)
      const displaySpots = tierInfo.capacity === null
        ? '∞'
        : `${loading ? '...' : actualSpotsRemaining}/${tierInfo.capacity}`;

      const tierLabel = tierInfo.capacity === null
        ? `> Tier ${tierInfo.tier}: ${displaySpots} available at $${tierInfo.price}/month (for a limited time only)`
        : `> Tier ${tierInfo.tier}: ${displaySpots} spots at $${tierInfo.price}/month`;

      return (
        <div key={tierInfo.tier} className="border-2 border-teal-500 bg-teal-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-teal-400">
              {tierLabel}
            </div>
            <div className="bg-teal-500 text-black px-2 py-1 text-xs font-bold animate-pulse">
              &lt;YOU ARE HERE&gt;
            </div>
          </div>
        </div>
      );
    }

    // Future tier styling and content
    if (isFutureTier) {
      const displayCapacity = tierInfo.capacity === null ? '∞' : `${tierInfo.capacity}/${tierInfo.capacity}`;
      const tierLabel = tierInfo.capacity === null
        ? `Tier ${tierInfo.tier}: ${displayCapacity} available at $${tierInfo.price}/month (for a limited time only)`
        : `Tier ${tierInfo.tier}: ${displayCapacity} available at $${tierInfo.price}/month`;

      return (
        <div key={tierInfo.tier} className="text-teal-400/60 pl-3">
          {tierLabel}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative min-h-screen bg-black font-mono text-teal-400">
      {/* Black Backdrop Layer */}
      <div className="fixed inset-0 bg-black z-0" />

      {/* Content Wrapper */}
      <div className="relative z-10 ">
        {/* Modern Navbar - Glassmorphism */}

      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-50 shadow-lg w-full">

        <div className="mx-auto px-[30px] py-4 max-w-full">

          <div className="flex items-center justify-between">

            {/* Left Side: Logo + Brand */}
            <div className="flex items-center gap-3">
              <Image
                src="/Mellowise_FullBodyOwl_Square.png"
                alt="Mellowise Owl Logo"
                width={70}
                height={70}
                className="w-14 h-14 lg:w-16 lg:h-16 transition-transform hover:scale-110 duration-300"
                priority
              />
              <GradientText
                text="MELLOWISE™"
                className="font-mono text-xl lg:text-4xl font-bold tracking-wider"
                gradient="linear-gradient(135deg, #14b8a6 0%, #005a7eff 30%, #00b6feff 50%,  #005a7eff 70%, #14b8a6 100%)"
              />
            </div>

            {/* Center Navigation (Desktop Only) */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/home"
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                Home
              </a>
              <button
                onClick={scrollToPricing}
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                Pricing
              </button>
              <a
                href="/blog"
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                Blog
              </a>
            </div>

            {/* Right Side: Login + Sign Up (Desktop Only) */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="/login"
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium px-4 py-2"
              >
                Login
              </a>
              <button
                onClick={scrollToSignup}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
              >
                Sign Up
              </button>
            </div>

            {/* Hamburger Menu Button (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                // X icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-800 space-y-3 pb-4">
              <a
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
              >
                Home
              </a>
              <button
                onClick={scrollToPricing}
                className="w-full text-left text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
              >
                Pricing
              </button>
              <a
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
              >
                Blog
              </a>
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
                >
                  Login
                </a>
                <button
                  onClick={scrollToSignup}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>


      {/* Particles Background Effect */}
      <Particles
        className="fixed inset-0"
        quantity={200}
        ease={80}
        color="#14b8a6"
        staticity={100}
        size={1.2}
      />

      {/* Terminal Init + Hero Section - CENTERED */}
      <section className="w-full bg-black px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Terminal Header */}
          <div className="text-sm text-teal-400/70">
            <div className="p-4 space-y-2">
              <div className="text-teal-400">$ ./mellowise --init</div>
              <div className="text-teal-400 animate-pulse">Loading system...</div>
            </div>
          </div>

          {/* Hero Section with Gradient */}
          <div className="space-y-4 border border-teal-500/50 p-8 bg-white/5 backdrop-blur-sm">
            <div className="text-sm text-teal-400">
              ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-center">
              <span className="text-teal-400"> 
                <GradientText  
                  text="&gt;WELCOME TO MELLOWISE™"
                  gradient='linear-gradient(135deg, #14b8a6 0%, #005a7eff 30%, #00b6feff 50%,  #005a7eff 70%, #14b8a6 100%)'
                />
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-teal-300 text-center">
              {`// AI-powered test prep that adapts to you`}
            </p>
            <p className="text-base lg:text-lg text-teal-300/80 text-center max-w-2xl mx-auto">
              Master the LSAT with personalized AI guidance, gamified learning, and real-time analytics.
              Join 500+ students already on the waitlist for early access pricing starting at just $15/month.
            </p>
            <div className="text-sm text-teal-400">
              └─────────────────────────────────────────────────────────────────────────────────────────────────┘
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="w-full bg-black px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-teal-400 mb-4">
              THE PROBLEM
            </h2>
            <p className="text-teal-300 text-lg">
              Test prep companies charge $2,000+ for courses that:
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-red-500/30 bg-red-500/5 backdrop-blur-xs p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">❌</div>
                <div>
                  <p className="text-teal-300">
                    <strong>Use the same lessons for everyone</strong> - One-size-fits-all doesn&apos;t work for learning
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-red-500/30 bg-red-500/5 backdrop-blur-xs p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">❌</div>
                <div>
                  <p className="text-teal-300">
                    <strong>Don&apos;t track what YOU actually struggle with</strong> - They can&apos;t adapt to your specific weaknesses
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-red-500/30 bg-red-500/5 backdrop-blur-xs p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">❌</div>
                <div>
                  <p className="text-teal-300">
                    <strong>Make you slog through content you&apos;ve already mastered</strong> - Wasting your precious study time
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-red-500/30 bg-red-500/5 backdrop-blur-xs p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">❌</div>
                <div>
                  <p className="text-teal-300">
                    <strong>Require separate purchases for different exams</strong> - Paying over and over again
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-12 border-2 border-teal-500/30 bg-white/5 backdrop-blur-xs p-8 text-center">
            <p className="text-2xl text-teal-400 font-bold mb-2">
              The average LSAT student spends $1,500-$3,500 on prep.
            </p>
            <p className="text-xl text-teal-300">
              What if there was a better way?
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - NEW 60/40 SPLIT */}
      <section className="w-full bg-black px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left 60% - Features List */}
            <div className="w-full lg:w-3/5 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-teal-400 mb-8 text-center">
                THE SOLUTION
              </h2>
              <p className="text-xl text-teal-300 mb-6 text-center">
                AI That Actually Knows You
              </p>

              {/* Feature Cards */}
              <div className="space-y-4">
                {/* Personalized Learning Paths */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🧠</div>
                    <div>
                      <h3 className="text-xl font-bold text-teal-400 mb-2">
                        Personalized Learning Paths
                      </h3>
                      <p className="text-teal-300">
                        Our AI analyzes your performance in real-time and adapts your study plan. Struggling with logic games? We&apos;ll give you more practice. Crushing reading comp? We&apos;ll move you ahead.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gamified Progress Tracking */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎮</div>
                    <div>
                      <h3 className="text-xl font-bold text-teal-400 mb-2">
                        Gamified Progress Tracking
                      </h3>
                      <p className="text-teal-300">
                        Turn studying into a game. Earn points, unlock achievements, and see your score predictions improve with every session. Because motivation matters as much as material.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real-Time Analytics */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📈</div>
                    <div>
                      <h3 className="text-xl font-bold text-teal-400 mb-2">
                        Real-Time Analytics
                      </h3>
                      <p className="text-teal-300">
                        Know exactly where you stand. See which question types need work, track your pacing, and predict your score with data-driven accuracy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adaptive Practice */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h3 className="text-xl font-bold text-teal-400 mb-2">
                        Adaptive Practice
                      </h3>
                      <p className="text-teal-300">
                        No more wasting time on concepts you&apos;ve mastered. Our system focuses your energy where it matters most—your weak spots.
                      </p>
                    </div>
                  </div>
                </div>

                {/* One Platform, Every Exam */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📚</div>
                    <div>
                      <h3 className="text-xl font-bold text-teal-400 mb-2">
                        One Platform, Every Exam
                      </h3>
                      <p className="text-teal-300">
                        Starting with the LSAT. Expanding to the GRE, MCAT, GMAT, CPA, Bar Exam, USMLE, and more. One subscription. Your entire academic and professional journey.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 40% - Owl Mascot + Stats */}
            <div className="w-full lg:w-2/5 flex items-center justify-center">
              <div className="max-w-md w-full space-y-6">
                {/* Owl Logo */}
                <div className="flex flex-col items-center space-y-4">
                  <Image
                    src="/Mellowise_FullBodyOwl_Square.png"
                    alt="Mellowise Owl Mascot"
                    width={256}
                    height={256}
                    className="w-48 lg:w-64 h-auto transition-all duration-300"
                    priority
                  />
                </div>

                {/* Stats Panel */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-4 space-y-3 rounded-lg shadow-[0_8px_32px_rgba(20,184,166,0.2)]">
                  <div className="text-teal-400 text-lg font-bold border-b border-teal-500/30 pb-2">
                    SYSTEM STATUS:
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-teal-400/70">PASS_RATE:</span>
                      <span className="text-teal-400 font-bold">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-400/70">QUESTIONS:</span>
                      <span className="text-teal-400 font-bold">10,000+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-400/70">AI_TUTOR:</span>
                      <span className="text-teal-400 font-bold">24/7 ACTIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-400/70">USERS_QUEUED:</span>
                      <span className="text-teal-400 font-bold animate-pulse">500+</span>
                    </div>
                  </div>
                </div>

                {/* Terminal Message */}
                <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-4 text-sm rounded-lg">
                  <div className="text-teal-400 mb-2">
                    &gt; system.message:
                  </div>
                  <div className="text-teal-300 pl-4">
                    &quot;Join 500+ students already in the queue. Your LSAT success starts here.&quot;
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-black px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-teal-400 mb-4">
              HOW IT WORKS
            </h2>
          </div>

          {/* Steps Timeline - Desktop: Horizontal, Mobile: Vertical */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              {/* Step Number Circle */}
              <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-black text-3xl font-bold mb-6">
                1
              </div>

              {/* Step Content */}
              <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6 text-center w-full">
                <h3 className="text-xl font-bold text-teal-400 mb-2">
                  Sign Up As Early Adopter
                  {/* <span className="text-sm text-teal-300 block">
                    (30 seconds)
                  </span> */}
                </h3>
                <p className="text-teal-300 text-sm">
                  Join the early adopter program with Google or email. Lock in your lifetime pricing based on when you join when you pre-order 3 months. + get 1 month free beta access guaranteed.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-black text-3xl font-bold mb-6">
                2
              </div>
              <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6 text-center w-full">
                <h3 className="text-xl font-bold text-teal-400 mb-2">
                  Join the Waitlist
                </h3>
                <p className="text-teal-300 text-sm">
                  You&apos;ll have a chance to join the early adopters in beta testing one month before our official launch. We&apos;ll send important updates to your email as our platform continues development.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-black text-3xl font-bold mb-6">
                3
              </div>
              <div className="border border-teal-500/30 bg-white/5 backdrop-blur-xs p-6 text-center w-full">
                <h3 className="text-xl font-bold text-teal-400 mb-2">
                  Get Beta Access
                </h3>
                <p className="text-teal-300 text-sm">
                  We&apos;ll email you when your spot is ready about 1 week prior to the launch of our beta program. Start studying with 30 days free to try it out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-black px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-teal-400 mb-4">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          {/* FAQ Accordion */}
          <Accordion items={faqItems} />
        </div>
      </section>

      {/* Pricing Widget + Signup Section */}
      <section className="w-full bg-black px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Pricing Tier Widget - Glassmorphism Card */}
          <div id="pricing-widget" className="border-2 border-teal-500/30 bg-white/5 backdrop-blur-xs shadow-[0_8px_32px_rgba(20,184,166,0.3)] rounded-lg overflow-hidden">
            <div className="bg-teal-500 text-black px-4 py-2 font-bold">
              [!] EARLY ACCESS PRICING - LOCK IN YOUR LIFETIME RATE NOW
              {loading && <span className="ml-2 text-xs animate-pulse">[LOADING...]</span>}
            </div>
            <div className="p-6 space-y-3">
              {/* Render all tiers dynamically */}
              {tiers.map(tierInfo => renderTier(tierInfo))}

              <div className="mt-4 pt-4 border-t border-teal-500/30 text-center">
                <span className="text-teal-400/60 line-through">Regular: $99/month</span>
                {' '}
                <span className="text-teal-400 font-bold">SAVE UP TO $84/MONTH</span>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div id="signup-section" className="space-y-3">
            {signInError && (
              <div className="border border-red-500 bg-red-500/10 text-red-500 px-4 py-2 rounded">
                {signInError}
              </div>
            )}
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full border-2 border-teal-500/50 bg-white/5 backdrop-blur-sm text-teal-400 py-3 px-6 font-bold rounded-lg hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.4)] hover:shadow-[0_0_20px_rgba(20,184,166,0.7)] uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingIn ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>
            <button
              onClick={handleEmailSignIn}
              disabled={signingIn}
              className="w-full border-2 border-teal-500/50 bg-white/5 backdrop-blur-sm text-teal-400 py-3 px-6 font-bold rounded-lg hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.4)] hover:shadow-[0_0_20px_rgba(20,184,166,0.7)] uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Sign up with Email
            </button>
          </div>

          {/* Terminal Footer */}
          <div className="text-sm text-teal-400/70 pl-3">
            <div>$ cat /var/log/waitlist.log</div>
            <div className="animate-pulse">&gt; Awaiting user input...</div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full border-t border-teal-500/20 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-16 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

            {/* Logo Column */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/Mellowise_FullBodyOwl_Square.png"
                  alt="Mellowise Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                {/* <GradientText className="font-mono text-lg font-bold tracking-wider">
                  MELLOWISE™
                </GradientText> */}
                <GradientText
                text="MELLOWISE™"
                className="font-mono text-xl lg:text-xl font-bold tracking-wider"
                gradient="linear-gradient(135deg, #14b8a6 0%, #005a7eff 30%, #00b6feff 50%,  #005a7eff 70%, #14b8a6 100%)"
              />
              </div>
              <p className="text-teal-300/60 text-sm ">
                <GradientText
                  text="AI-powered test prep that adapts to you."
                  gradient="linear-gradient(135deg, #14b8a6 0%, #005a7eff 30%, #00b6feff 50%,  #005a7eff 70%, #14b8a6 100%)"
                />
                
              </p>
            </div>

            {/* Features Column */}
            <div>
              <h3 className="text-teal-400 font-bold mb-4 text-sm uppercase tracking-wider">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/features" className="text-teal-300/60 hover:text-teal-400 transition-colors">Plan</a></li>
                <li><a href="/features" className="text-teal-300/60 hover:text-teal-400 transition-colors">Build</a></li>
                <li><a href="/features" className="text-teal-300/60 hover:text-teal-400 transition-colors">Insights</a></li>
                <li><a href="/features" className="text-teal-300/60 hover:text-teal-400 transition-colors">AI Tutor</a></li>
              </ul>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-teal-400 font-bold mb-4 text-sm uppercase tracking-wider">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/pricing" className="text-teal-300/60 hover:text-teal-400 transition-colors">Pricing</a></li>
                <li><a href="/features" className="text-teal-300/60 hover:text-teal-400 transition-colors">Method</a></li>
                <li><a href="/changelog" className="text-teal-300/60 hover:text-teal-400 transition-colors">Changelog</a></li>
                <li><a href="/docs" className="text-teal-300/60 hover:text-teal-400 transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-teal-400 font-bold mb-4 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-teal-300/60 hover:text-teal-400 transition-colors">About</a></li>
                <li><a href="/customers" className="text-teal-300/60 hover:text-teal-400 transition-colors">Customers</a></li>
                <li><a href="/careers" className="text-teal-300/60 hover:text-teal-400 transition-colors">Careers</a></li>
                <li><a href="/brand" className="text-teal-300/60 hover:text-teal-400 transition-colors">Brand</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-teal-400 font-bold mb-4 text-sm uppercase tracking-wider">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/blog" className="text-teal-300/60 hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="/status" className="text-teal-300/60 hover:text-teal-400 transition-colors">Status</a></li>
                <li><a href="/privacy" className="text-teal-300/60 hover:text-teal-400 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-teal-300/60 hover:text-teal-400 transition-colors">Terms</a></li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-teal-400 font-bold mb-4 text-sm uppercase tracking-wider">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://x.com/mellowise" target="_blank" rel="noopener noreferrer" className="text-teal-300/60 hover:text-teal-400 transition-colors">X (Twitter)</a></li>
                <li><a href="https://github.com/mellowise" target="_blank" rel="noopener noreferrer" className="text-teal-300/60 hover:text-teal-400 transition-colors">GitHub</a></li>
                <li><a href="https://instagram.com/mellowise" target="_blank" rel="noopener noreferrer" className="text-teal-300/60 hover:text-teal-400 transition-colors">Instagram</a></li>
                <li><a href="https://youtube.com/@mellowise" target="_blank" rel="noopener noreferrer" className="text-teal-300/60 hover:text-teal-400 transition-colors">YouTube</a></li>
              </ul>
            </div>

          </div>

          {/* Footer Bottom */}
          <div className="mt-12 pt-8 border-t border-teal-500/20 text-center text-sm text-teal-300/60">
            <p>
              <GradientText
                text="&copy; 2025 Mellowise. All rights reserved."
                gradient="linear-gradient(135deg, #14b8a6 0%, #005a7eff 30%, #00b6feff 50%,  #005a7eff 70%, #14b8a6 100%)"
              />
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
