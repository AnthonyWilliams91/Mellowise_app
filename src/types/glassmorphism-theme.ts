/**
 * Glassmorphism Theme Type Definitions
 * Type safety for the glassmorphism design system
 */

export interface GlassmorphismTheme {
  // Glass Background Effects
  glass: {
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
      hover: string;
      active: string;
    };
    border: {
      default: string;
      subtle: string;
      strong: string;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    blur: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };

  // Dark Background Gradients
  background: {
    dark: {
      primary: string;
      secondary: string;
      card: string;
    };
  };

  // Vibrant Accent Colors
  accent: {
    purple: string;
    blue: string;
    teal: string;
    pink: string;
    orange: string;
  };

  // Text Colors for Dark Theme
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
}

export type AccentColor = 'purple' | 'blue' | 'teal' | 'pink' | 'orange';

export type GlassVariant = 'default' | 'subtle' | 'strong';

export type BlurLevel = 'sm' | 'md' | 'lg' | 'xl';

export interface GlassCardProps {
  variant?: GlassVariant;
  accentColor?: AccentColor;
  blur?: BlurLevel;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  onHover?: boolean;
}

export interface GlassButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  accentColor?: AccentColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface GlassInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'search';
  className?: string;
  disabled?: boolean;
  error?: string;
}

export interface GlassProgressProps {
  value: number;
  max?: number;
  accentColor?: AccentColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export interface GlassBadgeProps {
  text: string;
  variant?: 'default' | 'accent';
  accentColor?: AccentColor;
  size?: 'sm' | 'md';
  className?: string;
}

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

// CSS Custom Properties Interface
export interface GlassCSSProperties extends React.CSSProperties {
  '--glass-bg-primary'?: string;
  '--glass-bg-secondary'?: string;
  '--glass-bg-tertiary'?: string;
  '--glass-bg-hover'?: string;
  '--glass-bg-active'?: string;
  '--glass-border'?: string;
  '--glass-border-subtle'?: string;
  '--glass-border-strong'?: string;
  '--accent-purple'?: string;
  '--accent-blue'?: string;
  '--accent-teal'?: string;
  '--accent-pink'?: string;
  '--accent-orange'?: string;
  '--text-glass-primary'?: string;
  '--text-glass-secondary'?: string;
  '--text-glass-muted'?: string;
  '--blur-sm'?: string;
  '--blur-md'?: string;
  '--blur-lg'?: string;
  '--blur-xl'?: string;
}

// Default Theme Configuration
export const DEFAULT_GLASSMORPHISM_THEME: GlassmorphismTheme = {
  glass: {
    bg: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      tertiary: 'rgba(255, 255, 255, 0.03)',
      hover: 'rgba(255, 255, 255, 0.12)',
      active: 'rgba(255, 255, 255, 0.15)'
    },
    border: {
      default: '1px solid rgba(255, 255, 255, 0.18)',
      subtle: '1px solid rgba(255, 255, 255, 0.1)',
      strong: '1px solid rgba(255, 255, 255, 0.25)'
    },
    shadow: {
      sm: '0 4px 16px rgba(0, 0, 0, 0.15)',
      md: '0 8px 32px rgba(0, 0, 0, 0.2)',
      lg: '0 16px 64px rgba(0, 0, 0, 0.25)',
      xl: '0 24px 96px rgba(0, 0, 0, 0.3)'
    },
    blur: {
      sm: 'blur(8px)',
      md: 'blur(12px)',
      lg: 'blur(16px)',
      xl: 'blur(20px)'
    }
  },
  background: {
    dark: {
      primary: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      secondary: 'linear-gradient(135deg, #0f0f23 0%, #16213e 100%)',
      card: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, rgba(26, 26, 46, 0.8) 100%)'
    }
  },
  accent: {
    purple: 'rgba(139, 92, 246, 0.6)',
    blue: 'rgba(59, 130, 246, 0.6)',
    teal: 'rgba(45, 212, 191, 0.6)',
    pink: 'rgba(236, 72, 153, 0.6)',
    orange: 'rgba(251, 146, 60, 0.6)'
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.75)',
    muted: 'rgba(255, 255, 255, 0.55)'
  }
};

// Utility function to create CSS custom properties
export const createGlassCSSVars = (theme: GlassmorphismTheme): GlassCSSProperties => ({
  '--glass-bg-primary': theme.glass.bg.primary,
  '--glass-bg-secondary': theme.glass.bg.secondary,
  '--glass-bg-tertiary': theme.glass.bg.tertiary,
  '--glass-bg-hover': theme.glass.bg.hover,
  '--glass-bg-active': theme.glass.bg.active,
  '--glass-border': theme.glass.border.default,
  '--glass-border-subtle': theme.glass.border.subtle,
  '--glass-border-strong': theme.glass.border.strong,
  '--accent-purple': theme.accent.purple,
  '--accent-blue': theme.accent.blue,
  '--accent-teal': theme.accent.teal,
  '--accent-pink': theme.accent.pink,
  '--accent-orange': theme.accent.orange,
  '--text-glass-primary': theme.text.primary,
  '--text-glass-secondary': theme.text.secondary,
  '--text-glass-muted': theme.text.muted,
  '--blur-sm': theme.glass.blur.sm,
  '--blur-md': theme.glass.blur.md,
  '--blur-lg': theme.glass.blur.lg,
  '--blur-xl': theme.glass.blur.xl
});