'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AIButton = forwardRef<HTMLButtonElement, AIButtonProps>(
  ({ children, isLoading = false, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl',
          'transition-all duration-300 ease-out',
          'text-white overflow-hidden',
          'shadow-lg hover:shadow-2xl',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'group',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#947eff] via-[#ff69da] to-[#947eff] bg-[length:200%_100%] animate-gradient" />
        
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#947eff] via-[#ff69da] to-[#947eff] rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500 -z-10" />

        {/* Content */}
        <span className="relative flex items-center gap-2.5 z-10">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          )}
          {children}
        </span>

        {/* Particles effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
        </div>
      </button>
    );
  }
);

AIButton.displayName = 'AIButton';
