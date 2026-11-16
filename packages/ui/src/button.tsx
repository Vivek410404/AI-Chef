import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#1B4332] text-white hover:bg-[#133124]",
    secondary: "bg-[#F5F0E6] text-[#1B4332] hover:bg-[#EFE5D3]",
    accent: "bg-[#E76F51] text-white hover:bg-[#D35436]",
    outline: "border border-[#E5E0D8] text-stone-700 hover:bg-stone-50"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
