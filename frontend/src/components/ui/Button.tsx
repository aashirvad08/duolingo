import React from "react";

type ButtonVariant = "green" | "blue" | "red" | "gold" | "purple" | "ghost" | "locked";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "green",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const isLocked = variant === "locked" || disabled;
  
  const baseStyles = "relative inline-flex items-center justify-center rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base transition-all duration-100 active:translate-y-[4px] active:border-b-0 outline-none select-none px-6 py-3 cursor-pointer";
  
  const widthStyles = fullWidth ? "w-full" : "";
  
  const variantStyles: Record<ButtonVariant, string> = {
    green: "bg-feather-green hover:bg-mask-green text-white border-b-4 border-tree-frog active:border-b-0",
    blue: "bg-macaw hover:bg-[rgba(28,176,246,0.85)] text-white border-b-4 border-blue-jay active:border-b-0",
    red: "bg-cardinal hover:bg-[rgba(255,75,75,0.85)] text-white border-b-4 border-fire-ant active:border-b-0",
    gold: "bg-bee hover:bg-[rgba(255,200,0,0.85)] text-white border-b-4 border-fox active:border-b-0",
    purple: "bg-beetle hover:bg-[rgba(206,130,255,0.85)] text-white border-b-4 border-[rgba(168,85,247,0.85)] active:border-b-0",
    ghost: "bg-transparent hover:bg-polar text-wolf border-2 border-swan active:border-b-2",
    locked: "bg-swan text-hare border-b-4 border-hare cursor-not-allowed active:translate-y-0 active:border-b-4",
  };
  
  const activeVariant = isLocked ? "locked" : variant;
  
  return (
    <button
      disabled={isLocked}
      className={`${baseStyles} ${widthStyles} ${variantStyles[activeVariant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
