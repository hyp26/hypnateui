import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light'; // Added theme prop
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  variant = 'full',
  size = 'md',
  theme = 'dark' // 'dark' means colored text on light bg, 'light' means white text on dark bg
}) => {
  // Size mapping for the container
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24',
  };

  const textColorPrimary = theme === 'light' ? '#FFFFFF' : '#3EB4C0';
  const textColorSecondary = theme === 'light' ? '#FFD8B4' : '#FF6B00'; // Lighter orange for dark bg

  return (
    <div className={cn("flex items-center gap-3 select-none", sizes[size], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto aspect-square"
        aria-label="Hypnate Logo"
      >
        {/* Wheels */}
        <ellipse cx="45" cy="85" rx="6" ry="8" fill="#3EB4C0" transform="rotate(-10 45 85)" />
        <ellipse cx="70" cy="80" rx="6" ry="8" fill="#3EB4C0" transform="rotate(-10 70 80)" />
        <ellipse cx="55" cy="92" rx="25" ry="3" fill="#94A3B8" fillOpacity="0.5" />

        {/* Back Phone (Right) - Orange Top */}
        <path
          d="M55 25 C55 20 60 15 65 15 H85 C90 15 95 20 95 25 V55 H55 V25 Z"
          fill="#FF6B00"
        />
        {/* Back Phone (Right) - Teal Bottom */}
        <path
          d="M55 55 H95 V75 C95 80 90 85 85 85 H65 C60 85 55 80 55 75 V55 Z"
          fill="#3EB4C0"
        />
        
        {/* Handle */}
        <path
          d="M85 35 L95 25 L105 15"
          stroke="#FF6B00"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Front Phone (Left) - Orange Top */}
        <path
          d="M25 35 C25 30 30 25 35 25 H55 C60 25 65 30 65 35 V55 H25 V35 Z"
          fill="#FF6B00"
        />
        {/* Front Phone (Left) - Teal Bottom */}
        <path
          d="M25 55 H65 V85 C65 90 60 95 55 95 H35 C30 95 25 90 25 85 V55 Z"
          fill="#3EB4C0"
        />

        {/* Screen Details (Subtle) */}
        <rect x="42" y="28" width="6" height="2" rx="1" fill="#FFCCBC" />
        <rect x="72" y="18" width="6" height="2" rx="1" fill="#FFCCBC" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col justify-center h-full">
          <h1 className="font-serif leading-none tracking-wide transition-colors" 
              style={{ 
                fontSize: size === 'xl' ? '3.5rem' : size === 'lg' ? '2.5rem' : '1.5rem',
                color: textColorPrimary 
              }}>
            Hypnate
          </h1>
          <span className="font-sans uppercase tracking-widest leading-none mt-1 transition-colors"
                style={{ 
                  fontSize: size === 'xl' ? '0.875rem' : size === 'lg' ? '0.65rem' : '0.4rem',
                  color: textColorSecondary
                }}>
            Discover your next obsession
          </span>
        </div>
      )}
    </div>
  );
};
