import React, { useEffect } from "react";
import { speakSpanish } from "@/utils/tts";

interface Option {
  id: string;
  text: string;
  image_url?: string | null;
}

interface MultipleChoiceProps {
  options: Option[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  const handleSelect = (id: string, text: string) => {
    if (disabled) return;
    speakSpanish(text);
    onSelect(id);
  };

  // Add keyboard listener for shortcuts (1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= options.length) {
        const opt = options[num - 1];
        handleSelect(opt.id, opt.text);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, disabled]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto w-full py-4 select-none">
      {options.map((option, idx) => {
        const isSelected = selectedId === option.id;
        const numberBadge = idx + 1;

        return (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id, option.text)}
            className={`border-2 rounded-2xl p-4 flex items-center gap-4 cursor-pointer relative transition-all duration-100 active:translate-y-1 ${
              isSelected
                ? "border-macaw bg-polar dark:bg-slate-700/50 text-macaw"
                : "border-swan dark:border-slate-700 hover:bg-polar dark:hover:bg-slate-700 text-eel dark:text-white"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {/* Number badge on bottom-left / left side */}
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs border-2 ${
                isSelected
                  ? "border-macaw text-macaw"
                  : "border-swan text-wolf"
              }`}
            >
              {numberBadge}
            </div>

            {/* Visual representation */}
            <div className="flex-1">
              <span className="text-base font-extrabold tracking-wide uppercase">
                {option.text}
              </span>
            </div>
            
            {/* Optional seeded illustration block */}
            {option.image_url && (
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-extrabold text-wolf text-lg border border-swan select-none uppercase">
                {option.text[0]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
