/**
 * GlassButton Component
 * Glassmorphism button with multiple variants and states
 */
'use client';

import React from 'react';
import { GlassButtonProps } from '../../../types/glassmorphism-theme';
import '../../../styles/glassmorphism.css';

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  accentColor = 'purple',
  size = 'md',
  className = '',
  children,
  onClick,
  disabled = false,
  loading = false
}) => {
  const baseClasses = {
    primary: 'btn-glass-primary',
    secondary: 'btn-glass-secondary',
    ghost: 'btn-glass'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const accentColors = {
    purple: 'var(--accent-purple)',
    blue: 'var(--accent-blue)',
    teal: 'var(--accent-teal)',
    pink: 'var(--accent-pink)',
    orange: 'var(--accent-orange)'
  };

  const buttonClasses = [
    baseClasses[variant],
    sizeClasses[size],
    className,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'cursor-wait' : ''
  ].filter(Boolean).join(' ');

  const buttonStyle: React.CSSProperties = variant === 'primary' ? {
    background: `linear-gradient(135deg, ${accentColors[accentColor]}, ${accentColors.blue})`,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  } : {};

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={buttonClasses}
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};