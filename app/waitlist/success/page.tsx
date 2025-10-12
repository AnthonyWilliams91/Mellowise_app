'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface WaitlistData {
  position: number;
  tier: number;
  price: number;
  referralCode: string;
  firstName: string | null;
  email: string;
}

export default function SuccessPage() {
  const [waitlistData, setWaitlistData] = useState<WaitlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchWaitlistData() {
      try {
        const supabase = createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        // Fetch user's waitlist data
        const { data, error: fetchError } = await supabase
          .from('waitlist_users')
          .select('position, tier_current, price_current, referral_code, first_name, email')
          .eq('email', user.email)
          .single();

        if (fetchError) {
          console.error('Error fetching waitlist data:', fetchError);
          setError('Could not load your waitlist data');
          setLoading(false);
          return;
        }

        setWaitlistData({
          position: data.position,
          tier: data.tier_current,
          price: data.price_current,
          referralCode: data.referral_code,
          firstName: data.first_name,
          email: data.email
        });
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }

    fetchWaitlistData();
  }, []);

  const copyReferralLink = () => {
    const referralUrl = `${window.location.origin}/r/${waitlistData?.referralCode}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#28fe14] text-xl animate-pulse">Loading your waitlist data...</div>
      </div>
    );
  }

  if (error || !waitlistData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-2xl w-full border-2 border-red-500 p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-red-500/80 mb-4">{error || 'Failed to load waitlist data'}</p>
          <a href="/home" className="text-[#28fe14] underline">← Back to Home</a>
        </div>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/r/${waitlistData.referralCode}`;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full space-y-8">

        {/* Terminal Header */}
        <div className="border border-[#28fe14] p-1">
          <div className="bg-black p-4 space-y-2">
            <div className="text-[#28fe14]">$ ./mellowise --confirm-signup</div>
            <div className="text-[#28fe14]">✓ Waitlist registration complete</div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="border-2 border-[#28fe14] p-6 space-y-4 shadow-[0_0_20px_rgba(40,254,20,0.3)]">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#28fe14]">
            &gt; WELCOME{waitlistData.firstName ? `, ${waitlistData.firstName.toUpperCase()}` : ''}!
          </h1>
          <p className="text-lg text-[#28fe14]/90">
            // You're officially on the Mellowise waitlist
          </p>
        </div>

        {/* Position & Tier Info */}
        <div className="border-2 border-[#28fe14] bg-black p-6 space-y-4">
          <div className="text-[#28fe14] font-bold text-lg mb-4">
            [!] YOUR WAITLIST STATUS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[#28fe14]/30 p-4">
              <div className="text-[#28fe14]/60 text-sm mb-1">POSITION</div>
              <div className="text-3xl font-bold text-[#28fe14]">#{waitlistData.position}</div>
            </div>

            <div className="border border-[#28fe14]/30 p-4">
              <div className="text-[#28fe14]/60 text-sm mb-1">TIER</div>
              <div className="text-3xl font-bold text-[#28fe14]">Tier {waitlistData.tier}</div>
            </div>

            <div className="border border-[#28fe14]/30 p-4">
              <div className="text-[#28fe14]/60 text-sm mb-1">YOUR PRICE</div>
              <div className="text-3xl font-bold text-[#28fe14]">${waitlistData.price}/mo</div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#28fe14]/30">
            <p className="text-[#28fe14]/80 text-sm">
              <span className="text-[#28fe14] line-through">Regular Price: $99/month</span>
              {' '}→ You save ${99 - waitlistData.price}/month!
            </p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="border-2 border-[#28fe14] bg-black p-6 space-y-4">
          <div className="text-[#28fe14] font-bold text-lg mb-2">
            [⚡] MOVE UP THE WAITLIST
          </div>

          <p className="text-[#28fe14]/90">
            Refer 3 friends = Jump 10 spots and save even more!
          </p>

          <div className="space-y-3">
            <div className="text-[#28fe14]/60 text-sm">YOUR REFERRAL LINK:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 bg-black border border-[#28fe14] text-[#28fe14] px-4 py-2 rounded font-mono text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="border-2 border-[#28fe14] bg-transparent text-[#28fe14] px-6 py-2 font-bold rounded hover:bg-[#28fe14] hover:text-black transition-all duration-300"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="border-2 border-[#28fe14] bg-black p-6 space-y-4">
          <div className="text-[#28fe14] font-bold text-lg mb-2">
            [📋] WHAT'S NEXT?
          </div>

          <div className="space-y-3 text-[#28fe14]/90">
            <div className="flex gap-3">
              <span className="text-[#28fe14]">1.</span>
              <span>Share your referral link to move up the waitlist</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#28fe14]">2.</span>
              <span>Watch your email for updates on your position</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#28fe14]">3.</span>
              <span>Get ready for beta launch – we'll notify you when it's time!</span>
            </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="text-sm text-[#28fe14]/70 pl-3">
          <div>$ echo "Welcome to Mellowise"</div>
          <div className="animate-pulse">&gt; See you soon...</div>
        </div>

      </div>
    </div>
  );
}
