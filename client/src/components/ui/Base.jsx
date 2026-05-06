import React from 'react';

export const Button = React.forwardRef(({ 
  className = "", 
  variant = "primary", 
  size = "md", 
  isLoading = false,
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#065f46] text-white hover:bg-[#064e3b] border border-[#065f46] shadow-sm focus:ring-[#065f46]",
    secondary: "bg-white text-[#0a0a0a] border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-200",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-50 border border-transparent focus:ring-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-red-600 focus:ring-red-600",
  };

  const sizes = {
    sm: "min-h-[36px] px-3 text-sm",
    md: "min-h-[42px] px-4 text-base",
    lg: "min-h-[48px] px-6 text-lg",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
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
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const Input = React.forwardRef(({ className = "", error, ...props }, ref) => (
  <div className="w-full space-y-1.5">
    <input
      ref={ref}
      className={`w-full min-h-[44px] px-3 bg-white border rounded-md outline-none transition-all duration-200 
        ${error ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#065f46] focus:ring-4 focus:ring-[#065f46]/10'} 
        ${className}`}
      {...props}
    />
    {error && <p className="text-sm font-medium text-red-600">{error}</p>}
  </div>
));

export const Label = ({ className = "", children, ...props }) => (
  <label className={`block text-sm font-bold text-gray-700 mb-1.5 ${className}`} {...props}>
    {children}
  </label>
);

export const Badge = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger: "bg-red-50 text-red-700 border border-red-100",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
