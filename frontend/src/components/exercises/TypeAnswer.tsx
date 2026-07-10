import React, { useRef, useEffect } from "react";

interface TypeAnswerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const TypeAnswer: React.FC<TypeAnswerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto w-full py-4 space-y-4 select-none">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type the English translation..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full text-lg md:text-xl font-bold bg-white dark:bg-slate-800 text-eel dark:text-white px-5 py-4 border-2 border-swan dark:border-slate-700 rounded-2xl focus:border-macaw dark:focus:border-macaw outline-none transition-all border-b-4 focus:border-b-4 focus:border-b-blue-jay dark:focus:border-b-blue-jay shadow-inner"
        />
      </div>
      <p className="text-xs text-wolf dark:text-slate-400 font-bold ml-1">
        Type carefully. Punctuation is ignored, but spelling counts!
      </p>
    </div>
  );
};
