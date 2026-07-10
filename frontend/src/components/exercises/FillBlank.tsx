import React from "react";

interface FillBlankProps {
  sentence: string; // e.g. "Yo ___ pan"
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string | null) => void;
  disabled?: boolean;
}

export const FillBlank: React.FC<FillBlankProps> = ({
  sentence,
  options,
  selectedOption,
  onSelect,
  disabled = false,
}) => {
  // Split sentence at the '___' placeholder
  const parts = sentence.split("___");
  const prefix = parts[0] || "";
  const suffix = parts[1] || "";

  return (
    <div className="max-w-xl mx-auto w-full py-6 space-y-8 select-none text-center">
      
      {/* Target sentence display */}
      <div className="flex justify-center items-center gap-3 text-lg md:text-xl font-extrabold text-eel dark:text-white py-4">
        <span>{prefix}</span>
        
        {/* Fill target box */}
        <div
          onClick={() => !disabled && selectedOption && onSelect(null)}
          className={`min-w-[80px] h-10 px-4 flex items-center justify-center border-b-2 rounded-xl transition-all font-extrabold text-sm md:text-base ${
            selectedOption
              ? "bg-white dark:bg-slate-800 border-2 border-macaw text-macaw cursor-pointer border-b-4 border-b-blue-jay active:translate-y-0.5"
              : "border-2 border-dashed border-swan dark:border-slate-700 text-transparent min-w-[100px]"
          }`}
        >
          {selectedOption || "___"}
        </div>
        
        <span>{suffix}</span>
      </div>

      {/* Options box */}
      <div className="flex justify-center gap-3 py-4 flex-wrap">
        {options.map((option) => {
          const isUsed = selectedOption === option;

          return (
            <div key={option} className="relative">
              {/* Stand-in placeholder */}
              {isUsed && (
                <div className="bg-swan dark:bg-slate-700 w-full h-full rounded-xl px-4 py-2.5 font-extrabold text-sm md:text-base text-transparent border-2 border-transparent select-none">
                  {option}
                </div>
              )}

              {/* Tappable chip */}
              {!isUsed && (
                <button
                  disabled={disabled}
                  onClick={() => onSelect(option)}
                  className={`bg-white dark:bg-slate-800 border-2 border-swan dark:border-slate-700 rounded-xl px-4 py-2.5 font-extrabold text-sm md:text-base text-eel dark:text-white cursor-pointer shadow-sm hover:bg-polar dark:hover:bg-slate-700 active:translate-y-0.5 border-b-4 border-b-swan ${
                    disabled ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {option}
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
