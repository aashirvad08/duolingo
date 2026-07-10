import React from "react";

interface CharacterProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Zari - The cheerful girl in a pink hijab and blue top
 */
export const MascotZari: React.FC<CharacterProps> = ({ size = 120, className = "", ...props }) => {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className={`${className}`} {...props}>
      {/* Blue Top */}
      <path d="M 30,95 Q 50,75 70,95 L 75,120 L 25,120 Z" fill="var(--macaw)" />
      
      {/* Pink Hijab / Hood Backing */}
      <circle cx="50" cy="55" r="30" fill="#FFCAFF" />
      
      {/* Face (Brown skin) */}
      <circle cx="50" cy="58" r="20" fill="#A75E3B" />
      
      {/* Hair (Black bangs peeking out) */}
      <path d="M 35,46 Q 50,38 65,46 C 60,40 40,40 35,46 Z" fill="#2E2E2E" />

      {/* Eyes */}
      <circle cx="43" cy="55" r="5" fill="white" />
      <circle cx="57" cy="55" r="5" fill="white" />
      <circle cx="43" cy="55" r="3" fill="#2E2E2E" />
      <circle cx="57" cy="55" r="3" fill="#2E2E2E" />
      <circle cx="42" cy="54" r="1" fill="white" />
      <circle cx="56" cy="54" r="1" fill="white" />

      {/* Cheerful open mouth */}
      <path d="M 45,66 Q 50,72 55,66 Z" fill="#8B2222" />
      <path d="M 46,67 Q 50,70 54,67" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Lily - The bored girl with purple hair and black hoodie
 */
export const MascotLily: React.FC<CharacterProps> = ({ size = 120, className = "", ...props }) => {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className={`${className}`} {...props}>
      {/* Black Hoodie Body */}
      <path d="M 30,95 Q 50,80 70,95 L 75,120 L 25,120 Z" fill="var(--eel)" />
      
      {/* Hair backing */}
      <path d="M 28,55 C 28,30 72,30 72,55 C 72,65 72,85 72,85 L 28,85 Z" fill="var(--beetle)" />
      
      {/* Face (Pale skin) */}
      <circle cx="50" cy="55" r="20" fill="#FDF3E7" />
      
      {/* Purple bangs */}
      <path d="M 30,50 Q 50,35 70,50 Q 60,42 40,42 Z" fill="var(--beetle)" />

      {/* Bored / Drooping Eyes */}
      <circle cx="43" cy="55" r="5" fill="white" />
      <circle cx="57" cy="55" r="5" fill="white" />
      {/* Drooping eyelids */}
      <path d="M 37,51 L 49,51" stroke="var(--beetle)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 51,51 L 63,51" stroke="var(--beetle)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="43" cy="56" r="2.5" fill="var(--eel)" />
      <circle cx="57" cy="56" r="2.5" fill="var(--eel)" />

      {/* Sarcastic line mouth */}
      <path d="M 46,67 L 54,66" stroke="var(--eel)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Junior - The little boy with orange hair and green overall
 */
export const MascotJunior: React.FC<CharacterProps> = ({ size = 120, className = "", ...props }) => {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className={`${className}`} {...props}>
      {/* Green Overall */}
      <path d="M 32,95 Q 50,85 68,95 L 72,120 L 28,120 Z" fill="var(--feather-green)" />
      {/* Orange Hair Backing */}
      <circle cx="50" cy="50" r="26" fill="var(--fox)" />
      
      {/* Face */}
      <circle cx="50" cy="56" r="18" fill="#FCE1C6" />
      
      {/* Orange bangs */}
      <path d="M 33,48 Q 50,34 67,48 Q 50,42 33,48 Z" fill="var(--fox)" />

      {/* Wide happy eyes */}
      <circle cx="44" cy="54" r="4.5" fill="white" />
      <circle cx="56" cy="54" r="4.5" fill="white" />
      <circle cx="44" cy="54" r="2.5" fill="var(--eel)" />
      <circle cx="56" cy="54" r="2.5" fill="var(--eel)" />

      {/* Smug little smile */}
      <path d="M 45,65 Q 52,69 55,64" fill="none" stroke="var(--eel)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Vikram - The bearded man in a blue turban and red sweater
 */
export const MascotVikram: React.FC<CharacterProps> = ({ size = 120, className = "", ...props }) => {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className={`${className}`} {...props}>
      {/* Red Sweater */}
      <path d="M 30,95 Q 50,82 70,95 L 75,120 L 25,120 Z" fill="var(--cardinal)" />
      
      {/* Beard Outline */}
      <ellipse cx="50" cy="65" rx="19" ry="15" fill="var(--eel)" />
      
      {/* Face */}
      <circle cx="50" cy="52" r="18" fill="#D39778" />
      
      {/* Blue Turban */}
      <path d="M 30,42 C 30,22 70,22 70,42 Z" fill="var(--humpback)" />
      <path d="M 32,42 Q 50,32 68,42" fill="none" stroke="var(--macaw)" strokeWidth="4" strokeLinecap="round" />

      {/* Friendly Eyes */}
      <circle cx="44" cy="52" r="4.5" fill="white" />
      <circle cx="56" cy="52" r="4.5" fill="white" />
      <circle cx="44" cy="52" r="2.5" fill="var(--eel)" />
      <circle cx="56" cy="52" r="2.5" fill="var(--eel)" />

      {/* Mustache */}
      <path d="M 40,60 Q 50,65 60,60" fill="none" stroke="var(--eel)" strokeWidth="4" strokeLinecap="round" />
      
      {/* Happy Smile peeking */}
      <path d="M 47,66 Q 50,70 53,66" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Deterministically retrieves a mascot based on the exercise ID
 */
export const getExerciseMascot = (exerciseId: number, size = 130) => {
  const index = exerciseId % 4;
  switch (index) {
    case 0:
      return <MascotZari size={size} />;
    case 1:
      return <MascotLily size={size} />;
    case 2:
      return <MascotJunior size={size} />;
    case 3:
    default:
      return <MascotVikram size={size} />;
  }
};
