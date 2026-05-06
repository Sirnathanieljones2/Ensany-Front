import React from 'react';

/**
 * Ensany Base UI Components
 * Optimized for the "Private Desk" & "Chain of Custody" aesthetic.
 * Uses a combination of Tailwind and Canonical Design tokens.
 */

export const Button = React.forwardRef(({ 
  className = "", 
  variant = "primary", 
  size = "md", 
  isLoading = false,
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--accent)] text-white hover:opacity-90 border border-[var(--accent)]",
    secondary: "bg-white text-[var(--ink-main)] border border-[var(--border-subtle)] hover:bg-gray-50",
    ghost: "bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink-main)] hover:bg-[var(--bg-paper)]",
    danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
  };

  const sizes = {
    sm: "min-h-[36px] px-3 text-sm",
    md: "min-h-[44px] px-6 text-base",
    lg: "min-h-[52px] px-8 text-lg",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-[var(--radius)] ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
});

export const Card = ({ className = "", children, ...props }) => (
  <div 
    className={`bg-white border border-[var(--border-subtle)] rounded-[var(--radius)] ${className}`} 
    {...props}
  >
    {children}
  </div>
);

export const Input = React.forwardRef(({ className = "", error, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    <input
      ref={ref}
      className={`w-full min-h-[44px] px-3 bg-white border border-[var(--border-subtle)] rounded-[var(--radius)] outline-none font-sans transition-all duration-200 
        ${error ? 'border-red-500 focus:ring-red-500/10' : 'focus:border-[var(--ink-main)] focus:ring-4 focus:ring-black/5'} 
        ${className}`}
      {...props}
    />
    {error && <p className="text-xs font-medium text-red-600 font-sans">{error}</p>}
  </div>
));

export const Label = ({ className = "", children, ...props }) => (
  <label 
    className={`block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5 font-sans ${className}`} 
    {...props}
  >
    {children}
  </label>
);

export const Badge = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger: "bg-red-50 text-red-700 border border-red-100",
    review: "bg-amber-100 text-amber-900 border border-amber-200",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius)] text-[10px] font-bold uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
