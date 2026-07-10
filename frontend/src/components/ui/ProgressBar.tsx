import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string; // Tailwind class like bg-feather-green
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "bg-feather-green"
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className="relative w-full h-5 bg-swan rounded-full overflow-hidden">
      {/* Filled Area */}
      <div
        className={`relative h-full ${color} rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${clampedValue}%` }}
      >
        {/* Highlight Stripe on Top 40% */}
        {clampedValue > 0 && (
          <div className="absolute top-1 left-1.5 right-1.5 h-[30%] bg-white/25 rounded-full" />
        )}
      </div>
    </div>
  );
};
