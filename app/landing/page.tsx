'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface TierData {
  tier: number;
  price: number;
  spotsRemaining: number;
  totalSignups: number;
}

export default function LandingPage() {
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
        <div key={tierInfo.tier} className="text-[#28fe14]/60 pl-3 line-through opacity-50">
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
        <div key={tierInfo.tier} className="border-2 border-[#28fe14] bg-[#28fe14]/10 p-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#28fe14]">
              {tierLabel}
            </div>
            <div className="bg-[#28fe14] text-black px-2 py-1 text-xs font-bold animate-pulse">
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
        <div key={tierInfo.tier} className="text-[#28fe14]/60 pl-3">
          {tierLabel}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black font-mono text-[#28fe14]">
      {/* Modern Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
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
              <span className="font-mono text-white text-lg lg:text-xl font-bold tracking-wider">
                MELLOWISE™
              </span>
            </div>

            {/* Center Navigation (Desktop Only) */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                Features
              </a>
              <button
                onClick={scrollToPricing}
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                Pricing
              </button>
              <a
                href="#how-it-works"
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                How It Works
              </a>
              <a
                href="#for-students"
                className="text-gray-100 hover:text-teal-400 transition-colors duration-300 font-medium"
              >
                For Students
              </a>
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
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
              >
                Features
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
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
              >
                How It Works
              </a>
              <a
                href="#for-students"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-100 hover:text-teal-400 hover:bg-gray-800 transition-colors duration-300 font-medium px-4 py-2 rounded-lg"
              >
                For Students
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

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">

      {/* Left Panel - Hero + Pricing + Signup (60% on desktop) */}
      <div className="w-full lg:w-3/5 bg-black flex items-center justify-center px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-2xl w-full space-y-8">

          {/* Terminal Header */}
          <div className="border border-[#28fe14] p-1">
            <div className="bg-black p-4 space-y-2">
              <div className="text-[#28fe14]">$ ./mellowise --init</div>
              <div className="text-[#28fe14] animate-pulse">Loading system...</div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-4 border border-[#28fe14] p-6">
            <div className="text-sm text-[#28fe14]">
              ┌─────────────────────────────────────────┐
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-[#28fe14] leading-tight">
              &gt; WELCOME TO MELLOWISE
            </h1>
            <p className="text-lg lg:text-xl text-[#28fe14]/90">
              {`// AI-powered LSAT prep that adapts to you`}
            </p>
            <div className="text-sm text-[#28fe14]">
              └─────────────────────────────────────────┘
            </div>
          </div>

          {/* Pricing Tier Widget */}
          <div id="pricing-widget" className="border-2 border-[#28fe14] bg-black shadow-[0_0_10px_rgba(40,254,20,0.3)]">
            <div className="bg-[#28fe14] text-black px-4 py-2 font-bold">
              [!] EARLY ACCESS PRICING - LOCK YOUR RATE NOW
              {loading && <span className="ml-2 text-xs animate-pulse">[LOADING...]</span>}
            </div>
            <div className="p-6 space-y-3">
              {/* Render all tiers dynamically */}
              {tiers.map(tierInfo => renderTier(tierInfo))}

              <div className="mt-4 pt-4 border-t border-[#28fe14]/30 text-center">
                <span className="text-[#28fe14]/60 line-through">Regular: $99/month</span>
                {' '}
                <span className="text-[#28fe14] font-bold">SAVE UP TO $84/MONTH</span>
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
              className="w-full border-2 border-[#28fe14] bg-transparent text-[#28fe14] py-3 px-6 font-bold rounded-md hover:bg-[#28fe14] hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(40,254,20,0.4)] hover:shadow-[0_0_20px_rgba(40,254,20,0.7)] uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full border-2 border-[#28fe14] bg-transparent text-[#28fe14] py-3 px-6 font-bold rounded-md hover:bg-[#28fe14] hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(40,254,20,0.4)] hover:shadow-[0_0_20px_rgba(40,254,20,0.7)] uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Sign up with Email
            </button>
          </div>

          {/* Terminal Footer */}
          <div className="text-sm text-[#28fe14]/70 pl-3">
            <div>$ cat /var/log/waitlist.log</div>
            <div className="animate-pulse">&gt; Awaiting user input...</div>
          </div>

        </div>
      </div>

      {/* Right Panel - Product Preview (40% on desktop) */}
      <div className="w-full lg:w-2/5 bg-black border-l-2 border-[#28fe14]/30 flex items-center justify-center px-6 py-16 lg:px-12 lg:py-20 min-h-[400px] lg:min-h-screen">
        <div className="max-w-md w-full space-y-6">

          {/* Owl Logo */}
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/Mellowise_FullBodyOwl_Square.png"
              alt="Mellowise Owl Mascot"
              width={256}
              height={256}
              className="w-48 lg:w-64 h-auto transition-all duration-300 shadow-[0_0_20px_rgba(40,254,20,0.4)] hover:shadow-[0_0_30px_rgba(40,254,20,0.6)]"
              style={{
                filter: 'brightness(0.8) sepia(1) hue-rotate(60deg) saturate(8)'
              }}
              priority
            />
            <div className="text-[#28fe14] text-lg font-bold tracking-widest">
              MELLOWISE™
            </div>
          </div>

          {/* Terminal-style Stats */}
          <div className="border border-[#28fe14] p-4 space-y-3">
            <div className="text-[#28fe14] text-lg font-bold border-b border-[#28fe14]/30 pb-2">
              SYSTEM STATUS:
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#28fe14]/70">PASS_RATE:</span>
                <span className="text-[#28fe14] font-bold">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#28fe14]/70">QUESTIONS:</span>
                <span className="text-[#28fe14] font-bold">10,000+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#28fe14]/70">AI_TUTOR:</span>
                <span className="text-[#28fe14] font-bold">24/7 ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#28fe14]/70">USERS_QUEUED:</span>
                <span className="text-[#28fe14] font-bold animate-pulse">500+</span>
              </div>
            </div>
          </div>

          {/* Terminal Message */}
          <div className="border border-[#28fe14]/50 p-4 text-sm">
            <div className="text-[#28fe14] mb-2">
              &gt; system.message:
            </div>
            <div className="text-[#28fe14]/90 pl-4">
              &quot;Join 500+ students already in the queue. Your LSAT success starts here.&quot;
            </div>
          </div>

          {/* Blinking Cursor */}
          <div className="text-[#28fe14] flex items-center gap-2">
            <span>$</span>
            <span className="animate-pulse">_</span>
          </div>

        </div>
      </div>

      </div> {/* End Main Content */}
    </div>
  );
}
