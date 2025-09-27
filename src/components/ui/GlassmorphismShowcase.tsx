/**
 * Glassmorphism Design System Showcase
 * Demonstrates the glass UI components with dark background and frosted effects
 */
'use client';

import React, { useState } from 'react';
import '../../../src/styles/glassmorphism.css';

interface ShowcaseCardProps {
  title: string;
  description: string;
  progress: number;
  tags: string[];
  accentColor: 'purple' | 'blue' | 'teal' | 'pink' | 'orange';
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  title,
  description,
  progress,
  tags,
  accentColor
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const accentColors = {
    purple: 'var(--accent-purple)',
    blue: 'var(--accent-blue)',
    teal: 'var(--accent-teal)',
    pink: 'var(--accent-pink)',
    orange: 'var(--accent-orange)'
  };

  return (
    <div
      className="glass-card p-6 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? `linear-gradient(135deg, ${accentColors[accentColor]}15, var(--glass-bg-hover))`
          : undefined
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-glass-primary)' }}>
          {title}
        </h3>
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: accentColors[accentColor] }}
        />
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-glass-secondary)' }}>
        {description}
      </p>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-glass-secondary)' }}>
            Progress
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-glass-primary)' }}>
            {progress}%
          </span>
        </div>
        <div className="progress-glass">
          <div
            className="progress-glass-fill"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accentColors[accentColor]}, ${accentColors.blue})`
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="badge-glass">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const GlassmorphismShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inputValue, setInputValue] = useState('');

  const showcaseData = [
    {
      title: 'AI Chat Tutor',
      description: 'Real-time conversation with Claude API for personalized learning guidance and explanations.',
      progress: 95,
      tags: ['AI', 'Chat', 'Complete'],
      accentColor: 'purple' as const
    },
    {
      title: 'Gamification Engine',
      description: 'XP system, achievements, and tournaments to motivate consistent study habits.',
      progress: 88,
      tags: ['XP', 'Achievements', 'Social'],
      accentColor: 'blue' as const
    },
    {
      title: 'Mobile Enhancement',
      description: 'PWA features, offline mode, and responsive design for mobile-first studying.',
      progress: 92,
      tags: ['PWA', 'Mobile', 'Offline'],
      accentColor: 'teal' as const
    },
    {
      title: 'Community Features',
      description: 'Study groups, peer explanations, and collaborative learning experiences.',
      progress: 78,
      tags: ['Social', 'Community', 'Collaboration'],
      accentColor: 'pink' as const
    },
    {
      title: 'Spaced Repetition',
      description: 'SM-2 algorithm with FSRS enhancements for optimal long-term retention.',
      progress: 96,
      tags: ['SM-2', 'Memory', 'Algorithm'],
      accentColor: 'orange' as const
    },
    {
      title: 'Study Planning',
      description: 'AI-powered personalized study plans with goal setting and progress tracking.',
      progress: 84,
      tags: ['Planning', 'AI', 'Goals'],
      accentColor: 'purple' as const
    }
  ];

  return (
    <div className="app-background-glass min-h-screen p-6">
      {/* Navigation Bar */}
      <nav className="nav-glass px-6 py-4 mb-8 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg glass-card-subtle flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: 'var(--accent-purple)' }}>M</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-glass-primary)' }}>
              Mellowise
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {['dashboard', 'practice', 'analytics', 'community'].map((tab) => (
              <button
                key={tab}
                className={`btn-glass-secondary px-4 py-2 text-sm capitalize ${
                  activeTab === tab ? 'btn-glass-primary' : ''
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="btn-glass">
            <span style={{ color: 'var(--text-glass-primary)' }}>Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="glass-card-strong p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-glass-primary)' }}>
            Epic 4: Advanced Learning Features
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--text-glass-secondary)' }}>
            Comprehensive AI-powered learning ecosystem with glassmorphism design
          </p>

          <div className="flex justify-center gap-4">
            <button className="btn-glass-primary px-6 py-3">
              Start Learning
            </button>
            <button className="btn-glass px-6 py-3">
              View Progress
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Cards Completed', value: '8/8', color: 'var(--accent-teal)' },
            { label: 'Lines of Code', value: '15K+', color: 'var(--accent-purple)' },
            { label: 'Features Ready', value: '95%', color: 'var(--accent-blue)' },
            { label: 'Story Points', value: '67', color: 'var(--accent-orange)' }
          ].map((stat, index) => (
            <div key={index} className="glass-card p-6 text-center">
              <div className="text-2xl font-bold mb-2" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-glass-secondary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Elements Demo */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-glass-primary)' }}>
            Interactive Glass Components
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-glass-secondary)' }}>
                Search or ask a question
              </label>
              <input
                type="text"
                className="input-glass w-full"
                placeholder="What would you like to learn about?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-glass-secondary)' }}>
                Study Mode
              </label>
              <select className="input-glass w-full">
                <option>Survival Mode</option>
                <option>Timed Practice</option>
                <option>Review Mode</option>
                <option>AI Tutor Chat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseData.map((feature, index) => (
            <ShowcaseCard key={index} {...feature} />
          ))}
        </div>

        {/* Modal Demo */}
        <div className="mt-8 text-center">
          <button
            className="btn-glass-primary px-8 py-4 text-lg"
            onClick={() => {
              // Demo modal trigger
              const modal = document.createElement('div');
              modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-backdrop-glass';
              modal.innerHTML = `
                <div class="modal-glass p-8 max-w-md mx-4">
                  <h3 style="color: var(--text-glass-primary); font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">
                    Glass Modal Demo
                  </h3>
                  <p style="color: var(--text-glass-secondary); margin-bottom: 1.5rem;">
                    This is a beautiful glassmorphism modal with backdrop blur and subtle transparency effects.
                  </p>
                  <button class="btn-glass-primary w-full" onclick="this.closest('.modal-backdrop-glass').remove()">
                    Close Modal
                  </button>
                </div>
              `;
              document.body.appendChild(modal);
            }}
          >
            Show Glass Modal
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismShowcase;