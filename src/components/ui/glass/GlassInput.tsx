/**
 * GlassInput Component
 * Glassmorphism input field with focus states and validation
 */
'use client';

import React, { useState } from 'react';
import { GlassInputProps } from '../../../types/glassmorphism-theme';
import '../../../styles/glassmorphism.css';

export const GlassInput: React.FC<GlassInputProps> = ({
  placeholder = '',
  value = '',
  onChange,
  type = 'text',
  className = '',
  disabled = false,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputClasses = [
    'input-glass w-full',
    className,
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    error ? 'border-red-400' : ''
  ].filter(Boolean).join(' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !disabled) {
      onChange(e.target.value);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const inputStyle: React.CSSProperties = {
    ...(isFocused ? {
      borderColor: 'var(--accent-purple)',
      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)'
    } : {}),
    ...(error ? {
      borderColor: 'rgba(239, 68, 68, 0.6)',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
    } : {})
  };

  return (
    <div className="w-full">
      <input
        type={type}
        className={inputClasses}
        style={inputStyle}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};