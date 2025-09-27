/**
 * GlassCard Component
 * Reusable glassmorphism card with variants and accent colors
 */
'use client';

import React, { useState } from 'react';
import { GlassCardProps } from '../../../types/glassmorphism-theme';
import '../../../styles/glassmorphism.css';

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  accentColor,
  blur = 'md',
  className = '',
  children,
  onClick,
  onHover = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = {
    default: 'glass-card',
    subtle: 'glass-card-subtle',
    strong: 'glass-card-strong'
  };

  const accentColors = {
    purple: 'var(--accent-purple)',
    blue: 'var(--accent-blue)',
    teal: 'var(--accent-teal)',
    pink: 'var(--accent-pink)',
    orange: 'var(--accent-orange)'
  };

  const cardClasses = [
    baseClasses[variant],
    className,
    onClick ? 'cursor-pointer' : '',
    isHovered && onHover ? 'glass-glow' : ''
  ].filter(Boolean).join(' ');

  const handleMouseEnter = () => {
    if (onHover) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (onHover) setIsHovered(false);
  };

  const cardStyle: React.CSSProperties = {
    backdropFilter: `blur(${blur === 'sm' ? '8px' : blur === 'md' ? '12px' : blur === 'lg' ? '16px' : '20px'})`,
    WebkitBackdropFilter: `blur(${blur === 'sm' ? '8px' : blur === 'md' ? '12px' : blur === 'lg' ? '16px' : '20px'})`,
    ...(accentColor && isHovered ? {
      background: `linear-gradient(135deg, ${accentColors[accentColor]}15, var(--glass-bg-hover))`,
      borderColor: accentColors[accentColor]
    } : {})
  };

  return (
    <div
      className={cardClasses}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};