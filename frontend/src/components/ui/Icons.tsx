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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      className={`${className}`}
      {...props}
    >
      {/* Left and Right Wings */}
      <path
        d="M 32,55 C 12,50 8,32 22,37 C 32,40 37,47 37,55 Z"
        fill="var(--feather-green)"
      />
      <path
        d="M 88,55 C 108,50 112,32 98,37 C 88,40 83,47 83,55 Z"
        fill="var(--feather-green)"
      />

      {/* Main Body (Ears Tuft + Body Shell) */}
      <path
        d="M 35,22 
           C 40,16 50,16 60,25 
           C 70,16 80,16 85,22 
           C 95,28 97,76 82,86 
           C 72,92 48,92 38,86 
           C 23,76 25,28 35,22 Z"
        fill="var(--feather-green)"
      />

      {/* Face Mask Patch */}
      <path
        d="M 40,32
           C 48,24 56,36 60,36
           C 64,36 72,24 80,32
           C 88,40 88,60 80,65
           C 72,70 48,70 40,65
           C 32,60 32,40 40,32 Z"
        fill="var(--mask-green)"
      />

      {/* Eye Backings (White) */}
      <circle cx="48" cy="45" r="11" fill="white" />
      <circle cx="72" cy="45" r="11" fill="white" />

      {/* Pupils & Reflections */}
      {mood === "happy" && (
        <>
          <circle cx="48" cy="45" r="6.5" fill="var(--eel)" />
          <circle cx="72" cy="45" r="6.5" fill="var(--eel)" />
          <circle cx="46.5" cy="43" r="2.2" fill="white" />
          <circle cx="70.5" cy="43" r="2.2" fill="white" />
        </>
      )}

      {mood === "sad" && (
        <>
          {/* Semicircle downward eyes */}
          <path d="M 41,47 Q 48,39 55,47" fill="none" stroke="var(--eel)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 65,47 Q 72,39 79,47" fill="none" stroke="var(--eel)" strokeWidth="4.5" strokeLinecap="round" />
        </>
      )}

      {mood === "shocked" && (
        <>
          <circle cx="48" cy="45" r="4" fill="var(--eel)" />
          <circle cx="72" cy="45" r="4" fill="var(--eel)" />
        </>
      )}

      {/* Beak & Mouth */}
      {mood === "happy" && (
        <>
          {/* Open mouth under beak */}
          <path
            d="M 55,51 C 55,51 55,61 60,61 C 65,61 65,51 65,51 Z"
            fill="var(--fox)"
          />
          {/* Upper Beak */}
          <path
            d="M 53,50 C 53,50 56,44 60,44 C 64,44 67,50 67,50 C 67,50 60,54 60,54 C 60,54 53,50 53,50 Z"
            fill="var(--bee)"
          />
        </>
      )}

      {mood === "sad" && (
        <>
          {/* Sad downturned beak */}
          <path
            d="M 54,54 C 54,54 57,48 60,48 C 63,48 66,54 66,54 Z"
            fill="var(--bee)"
          />
        </>
      )}

      {mood === "shocked" && (
        <>
          {/* Shocked open mouth circle */}
          <circle cx="60" cy="54" r="5" fill="var(--fox)" />
          <path
            d="M 54,49 C 54,49 57,45 60,45 C 63,45 66,49 66,49 Z"
            fill="var(--bee)"
          />
        </>
      )}

      {/* Chest Feathers (Chevrons) */}
      <path
        d="M 54,72 Q 60,76 66,72"
        fill="none"
        stroke="var(--mask-green)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 49,78 Q 60,83 71,78"
        fill="none"
        stroke="var(--mask-green)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Feet */}
      <rect x="41" y="88" width="10" height="5" rx="2.5" fill="var(--fox)" transform="rotate(-15 46 90)" />
      <rect x="69" y="88" width="10" height="5" rx="2.5" fill="var(--fox)" transform="rotate(15 74 90)" />
    </svg>
  );
};
