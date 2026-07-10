import React from "react";
import { motion } from "framer-motion";

interface TranslateProps {
  wordBank: string[];
  selectedWords: string[];
  onChange: (words: string[]) => void;
  disabled?: boolean;
}

export const Translate: React.FC<TranslateProps> = ({
  wordBank,
  selectedWords,
  onChange,
  disabled = false,
}) => {
  const handleWordTap = (word: string) => {
    if (disabled) return;
    // Add word to selected
    const updated = [...selectedWords, word];
    onChange(updated);
  };

  const handleRemoveTap = (index: number) => {
    if (disabled) return;
    // Remove word by index to support duplicate words correctly
    const updated = selectedWords.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  // Find remaining counts per word to gray out used word blocks in bank
  // Since duplicate words are allowed, we track used occurrences.
  const wordOccurrences = (arr: string[]) =>
    arr.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const selectedCounts = wordOccurrences(selectedWords);

  return (
    <div className="max-w-xl mx-auto w-full py-4 space-y-8 select-none">
      
      {/* Target Drop Zone */}
      <div className="min-h-[72px] border-b-2 border-swan dark:border-slate-700 flex flex-wrap gap-2.5 pb-2 items-center justify-center relative">
        {selectedWords.length === 0 ? (
          /* Empty dashes visual indicator */
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-30 select-none">
            <span className="w-10 h-0.5 bg-wolf border-b border-dashed" />
            <span className="w-10 h-0.5 bg-wolf border-b border-dashed" />
            <span className="w-10 h-0.5 bg-wolf border-b border-dashed" />
          </div>
        ) : (
          selectedWords.map((word, idx) => (
            <motion.div
              key={`${word}-${idx}`}
              layoutId={`word-tile-${word}-${idx}`}
              onClick={() => handleRemoveTap(idx)}
              className="bg-white dark:bg-slate-800 border-2 border-swan dark:border-slate-700 rounded-xl px-4 py-2.5 font-extrabold text-sm md:text-base text-eel dark:text-white cursor-pointer shadow-sm active:translate-y-0.5 hover:bg-polar dark:hover:bg-slate-700 border-b-4 border-b-swan"
            >
              {word}
            </motion.div>
          ))
        )}
      </div>

      {/* Word Bank Drawer */}
      <div className="flex flex-wrap justify-center gap-3 py-4">
        {wordBank.map((word, idx) => {
          // Count occurrences to determine if grayed out
          const countInSelected = selectedCounts[word] || 0;
          const countInBank = wordBank.filter((w) => w === word).length;
          
          // If we have selected more or equal occurrences than exist in bank, gray it out
          // Actually, let's keep it simple: index mapping determines if we disable it
          // We can map unique indices if we want, but tracking occurrences matches duplicates perfectly
          const isUsed = countInSelected >= countInBank;

          return (
            <div key={`${word}-${idx}`} className="relative">
              {/* Stand-in gray placeholder block beneath */}
              {isUsed && (
                <div className="bg-swan dark:bg-slate-700 w-full h-full rounded-xl px-4 py-2.5 font-extrabold text-sm md:text-base text-transparent border-2 border-transparent select-none">
                  {word}
                </div>
              )}
              
              {/* Actual draggable / clickable tile block */}
              {!isUsed && (
                <motion.div
                  layoutId={`word-tile-${word}-${idx}`}
                  onClick={() => !isUsed && handleWordTap(word)}
                  className={`bg-white dark:bg-slate-800 border-2 border-swan dark:border-slate-700 rounded-xl px-4 py-2.5 font-extrabold text-sm md:text-base text-eel dark:text-white cursor-pointer shadow-sm hover:bg-polar dark:hover:bg-slate-700 active:translate-y-0.5 border-b-4 border-b-swan ${
                    disabled ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {word}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
