import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const HeartIcon: React.FC<IconProps & { cracked?: boolean }> = ({
  size = 28,
  cracked = false,
  className = "",
  ...props
}) => {
  if (cracked) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-cardinal drop-shadow-[0_2px_0_rgba(234,43,43,0.3)] ${className}`}
        {...props}
      >
        {/* Left Half */}
        <path
          fill="var(--cardinal)"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09"
        />
        {/* Right Half */}
        <path
          fill="var(--cardinal)"
          d="M12 5.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35"
        />
        {/* Crack Path */}
        <path
          d="M12 3v4l-2 2 4 3-2 3 2 4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="var(--cardinal)"
      className={`text-cardinal drop-shadow-[0_2px_0_rgba(234,43,43,0.3)] transition-transform duration-200 hover:scale-110 ${className}`}
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
};

export const StreakFlame: React.FC<IconProps & { active?: boolean }> = ({
  size = 28,
  active = true,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={active ? "var(--fox)" : "var(--swan)"}
      className={`transition-all duration-300 drop-shadow-[0_2px_0_rgba(234,150,0,0.3)] ${
        active ? "animate-pulse" : ""
      } ${className}`}
      {...props}
    >
      <path d="M17.557 11.026c-.366-2.836-2.428-5.328-5.076-6.666a.5.5 0 0 0-.74.606c.307.962.298 2.073-.028 2.923C10.6 11.096 8.28 11.96 7.42 14.394c-.886 2.507.039 5.376 2.217 6.786a7.6 7.6 0 0 0 8.01-.194c2.518-1.742 3.018-5.26 1.48-7.79a8.9 8.9 0 0 0-1.57-2.17zM12 18.5c-1.38 0-2.5-1.12-2.5-2.5 0-.82.4-1.54 1-2 .16-.12.35-.2.55-.2.64 0 1 .5 1.25 1 .3.6.85 1.2 1.7 1.2.78 0 1.25-.47 1.25-1.07 0-.58-.33-1.11-.87-1.4l-.3-.15c-.48-.24-.8-.73-.8-1.27v-.61c.42.4.92.74 1.47.96 1.05.42 1.75 1.45 1.75 2.58 0 1.93-1.57 3.5-3.5 3.5z" />
    </svg>
  );
};

export const GemIcon: React.FC<IconProps> = ({
  size = 28,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="var(--macaw)"
      className={`text-macaw drop-shadow-[0_2px_0_rgba(24,153,214,0.3)] transition-transform duration-200 hover:scale-110 ${className}`}
      {...props}
    >
      <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.25L18.75 9 12 17.75 5.25 9 12 5.25z" />
    </svg>
  );
};

export const CrownIcon: React.FC<IconProps> = ({
  size = 28,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="var(--bee)"
      className={`text-bee drop-shadow-[0_2px_0_rgba(255,150,0,0.3)] transition-transform duration-200 hover:scale-110 ${className}`}
      {...props}
    >
      <path d="M2 22h20v-2H2v2zm2-4h16V9l-4 4-4-6-4 6-4-4v9z" />
    </svg>
  );
};

export const MascotDuo: React.FC<IconProps & { mood?: "happy" | "sad" | "shocked" }> = ({
  size = 120,
  mood = "happy",
  className = "",
  ...props
}) => {
  // Duo Owl SVG details: green body, large eyes, orange beak and feet
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className}`}
      {...props}
    >
      {/* Body */}
      <rect x="20" y="25" width="60" height="60" rx="30" fill="var(--feather-green)" />
      
      {/* White Belly */}
      <path d="M30 65 Q50 45 70 65" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
      
      {/* Face details depending on mood */}
      {/* Big Eyes Backing */}
      <circle cx="38" cy="45" r="16" fill="white" />
      <circle cx="62" cy="45" r="16" fill="white" />
      
      {/* Eye Pupils */}
      {mood === "happy" && (
        <>
          <circle cx="38" cy="45" r="8" fill="#4B4B4B" />
          <circle cx="62" cy="45" r="8" fill="#4B4B4B" />
          <circle cx="36" cy="43" r="3" fill="white" />
          <circle cx="60" cy="43" r="3" fill="white" />
        </>
      )}
      
      {mood === "sad" && (
        <>
          {/* Half-closed sad pupils */}
          <path d="M30 48 Q38 40 46 48" stroke="#4B4B4B" strokeWidth="4" fill="none" />
          <path d="M54 48 Q62 40 70 48" stroke="#4B4B4B" strokeWidth="4" fill="none" />
        </>
      )}

      {mood === "shocked" && (
        <>
          {/* Wide pupils */}
          <circle cx="38" cy="45" r="5" fill="#4B4B4B" />
          <circle cx="62" cy="45" r="5" fill="#4B4B4B" />
        </>
      )}
      
      {/* Beak */}
      {mood === "happy" && (
        <polygon points="45,48 55,48 50,58" fill="var(--fox)" />
      )}
      {mood === "sad" && (
        <polygon points="45,53 55,53 50,47" fill="var(--fox)" />
      )}
      {mood === "shocked" && (
        <circle cx="50" cy="53" r="5" fill="var(--fox)" />
      )}
      
      {/* Cheeks */}
      {mood === "happy" && (
        <>
          <ellipse cx="28" cy="54" rx="4" ry="2" fill="var(--mask-green)" opacity="0.6" />
          <ellipse cx="72" cy="54" rx="4" ry="2" fill="var(--mask-green)" opacity="0.6" />
        </>
      )}
      
      {/* Feet */}
      <ellipse cx="35" cy="86" rx="8" ry="4" fill="var(--fox)" />
      <ellipse cx="65" cy="86" rx="8" ry="4" fill="var(--fox)" />
    </svg>
  );
};
