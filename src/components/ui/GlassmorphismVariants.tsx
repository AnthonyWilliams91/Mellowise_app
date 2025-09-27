/**
 * Glassmorphism Variants Showcase
 * 5 different glassmorphism styles for comparison
 */
'use client';

import React, { useState } from 'react';
import '../../../src/styles/glassmorphism-variants.css';

interface VariantData {
  id: string;
  name: string;
  description: string;
  theme: string;
  features: string[];
  progress: number;
}

const variants: VariantData[] = [
  {
    id: 'v5',
    name: 'Cosmic Space',
    description: 'Sci-fi inspired with purple/pink accents and animated star fields. Futuristic and dynamic.',
    theme: 'Futuristic and dynamic',
    features: ['Animated star field', 'Purple/pink accents', 'Cosmic border effects', 'Space gradients'],
    progress: 94
  },
  {
    id: 'v6',
    name: 'Murky Crystal',
    description: 'Bright crystalline design with organic background animations that shimmer through frosted glass effects. Clean and mystical.',
    theme: 'Crystalline and organic',
    features: ['Floating crystal particles', 'Organic flow animations', 'Bright glass effects', 'Shimmer gradients'],
    progress: 96
  }
];

const VariantShowcase: React.FC<{ variant: VariantData; isActive: boolean }> = ({ variant, isActive }) => {
  if (!isActive) return null;

  return (
    <div className={`variant-container glass-${variant.id}`}>
      {/* Header Card */}
      <div className="glass-card">
        <h2>{variant.name} Glassmorphism</h2>
        <p>{variant.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {variant.features.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm rounded-full"
              style={{
                background: 'var(--glass-bg-primary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)'
              }}
            >
              {feature}
            </span>
          ))}
        </div>
        <button className="variant-btn">
          Apply This Style
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
            15K+
          </h3>
          <p className="text-sm">Lines of Code</p>
        </div>
        <div className="glass-card text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-secondary)' }}>
            8/8
          </h3>
          <p className="text-sm">Cards Complete</p>
        </div>
        <div className="glass-card text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
            {variant.progress}%
          </h3>
          <p className="text-sm">Implementation</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            AI Chat Tutor
          </h3>
          <p className="text-sm mb-4">
            Real-time conversation with Claude API for personalized learning guidance.
          </p>
          <div className="variant-progress">
            <div
              className="variant-progress-fill"
              style={{ width: '95%' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            95% Complete
          </p>
        </div>

        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Gamification Engine
          </h3>
          <p className="text-sm mb-4">
            XP system, achievements, and tournaments to motivate learning.
          </p>
          <div className="variant-progress">
            <div
              className="variant-progress-fill"
              style={{ width: '88%' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            88% Complete
          </p>
        </div>

        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Mobile Enhancement
          </h3>
          <p className="text-sm mb-4">
            PWA features, offline mode, and responsive design optimization.
          </p>
          <div className="variant-progress">
            <div
              className="variant-progress-fill"
              style={{ width: '92%' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            92% Complete
          </p>
        </div>

        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Study Planning
          </h3>
          <p className="text-sm mb-4">
            AI-powered personalized study plans with goal setting.
          </p>
          <div className="variant-progress">
            <div
              className="variant-progress-fill"
              style={{ width: '84%' }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            84% Complete
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="glass-card">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Interactive Demo - {variant.theme}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Try typing here..."
            className="p-3 rounded-lg border-0 outline-0"
            style={{
              background: 'var(--glass-bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)'
            }}
          />
          <button className="variant-btn">
            Test Button
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-sm rounded-full" style={{
            background: 'var(--accent-primary)',
            color: 'white'
          }}>
            Tag 1
          </span>
          <span className="px-3 py-1 text-sm rounded-full" style={{
            background: 'var(--accent-secondary)',
            color: 'white'
          }}>
            Tag 2
          </span>
        </div>
      </div>
    </div>
  );
};

const GlassmorphismVariants: React.FC = () => {
  const [activeVariant, setActiveVariant] = useState('v5');

  return (
    <div className="min-h-screen">
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4" style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4 text-center">
            Glassmorphism Variants Comparison
          </h1>
          <div className="variant-nav justify-center">
            {variants.map((variant) => (
              <button
                key={variant.id}
                className={`variant-tab ${activeVariant === variant.id ? 'active' : ''}`}
                onClick={() => setActiveVariant(variant.id)}
                style={{
                  background: activeVariant === variant.id
                    ? 'rgba(99, 102, 241, 0.8)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: activeVariant === variant.id ? 'white' : 'rgba(255, 255, 255, 0.8)'
                }}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Variant Content */}
      <div className="pt-32">
        {variants.map((variant) => (
          <VariantShowcase
            key={variant.id}
            variant={variant}
            isActive={activeVariant === variant.id}
          />
        ))}
      </div>

      {/* Comparison Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white text-sm">
            <span className="font-semibold">Currently Viewing:</span> {variants.find(v => v.id === activeVariant)?.name} - {variants.find(v => v.id === activeVariant)?.theme}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismVariants;