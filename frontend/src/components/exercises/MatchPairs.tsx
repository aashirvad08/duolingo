import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Pair {
  left: string;
  right: string;
}

interface MatchPairsProps {
  pairs: Pair[];
  onChange: (matched: Pair[]) => void;
  disabled?: boolean;
}

export const MatchPairs: React.FC<MatchPairsProps> = ({
  pairs,
  onChange,
  disabled = false,
}) => {
  const [shuffledLeft, setShuffledLeft] = useState<string[]>([]);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  
  const [matchedPairs, setMatchedPairs] = useState<Pair[]>([]);
  
  const [wrongLeft, setWrongLeft] = useState<string | null>(null);
  const [wrongRight, setWrongRight] = useState<string | null>(null);

  // Shuffle columns on mount
  useEffect(() => {
    const lefts = pairs.map((p) => p.left);
    const rights = pairs.map((p) => p.right);
    
    setShuffledLeft([...lefts].sort(() => Math.random() - 0.5));
    setShuffledRight([...rights].sort(() => Math.random() - 0.5));
  }, [pairs]);

  // Check matching on state change
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      // Look up correct match in the pairs registry
      const isMatch = pairs.some(
        (p) => p.left === selectedLeft && p.right === selectedRight
      );

      if (isMatch) {
        // Success match
        const newMatches = [...matchedPairs, { left: selectedLeft, right: selectedRight }];
        setMatchedPairs(newMatches);
        onChange(newMatches);
        
        // Reset selections
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // Wrong match
        setWrongLeft(selectedLeft);
        setWrongRight(selectedRight);
        
        // Retain selections temporarily for red flash and shake, then clear
        const l = selectedLeft;
        const r = selectedRight;
        setSelectedLeft(null);
        setSelectedRight(null);
        
        setTimeout(() => {
          setWrongLeft((prev) => (prev === l ? null : prev));
          setWrongRight((prev) => (prev === r ? null : prev));
        }, 500);
      }
    }
  }, [selectedLeft, selectedRight, pairs, matchedPairs, onChange]);

  const isLeftMatched = (val: string) => matchedPairs.some((p) => p.left === val);
  const isRightMatched = (val: string) => matchedPairs.some((p) => p.right === val);

  return (
    <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto w-full py-4 select-none">
      {/* Left Column (Spanish) */}
      <div className="space-y-3">
        {shuffledLeft.map((item) => {
          const matched = isLeftMatched(item);
          const selected = selectedLeft === item;
          const wrong = wrongLeft === item;
          
          return (
            <motion.div
              key={`left-${item}`}
              onClick={() => !matched && !disabled && setSelectedLeft(item)}
              animate={wrong ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`border-2 rounded-2xl p-4 text-center font-extrabold text-sm md:text-base cursor-pointer select-none transition-all duration-100 ${
                matched
                  ? "bg-emerald-50 border-emerald-300 text-emerald-500 opacity-50 cursor-not-allowed border-b-2"
                  : wrong
                  ? "bg-rose-50 border-rose-300 text-rose-500 border-b-4 border-b-rose-400"
                  : selected
                  ? "bg-blue-50 border-macaw text-macaw border-b-4 border-b-blue-jay"
                  : "bg-white dark:bg-slate-800 border-swan dark:border-slate-700 text-eel dark:text-white hover:bg-polar dark:hover:bg-slate-700 border-b-4 border-b-swan"
              }`}
            >
              {item}
            </motion.div>
          );
        })}
      </div>

      {/* Right Column (English) */}
      <div className="space-y-3">
        {shuffledRight.map((item) => {
          const matched = isRightMatched(item);
          const selected = selectedRight === item;
          const wrong = wrongRight === item;
          
          return (
            <motion.div
              key={`right-${item}`}
              onClick={() => !matched && !disabled && setSelectedRight(item)}
              animate={wrong ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`border-2 rounded-2xl p-4 text-center font-extrabold text-sm md:text-base cursor-pointer select-none transition-all duration-100 ${
                matched
                  ? "bg-emerald-50 border-emerald-300 text-emerald-500 opacity-50 cursor-not-allowed border-b-2"
                  : wrong
                  ? "bg-rose-50 border-rose-300 text-rose-500 border-b-4 border-b-rose-400"
                  : selected
                  ? "bg-blue-50 border-macaw text-macaw border-b-4 border-b-blue-jay"
                  : "bg-white dark:bg-slate-800 border-swan dark:border-slate-700 text-eel dark:text-white hover:bg-polar dark:hover:bg-slate-700 border-b-4 border-b-swan"
              }`}
            >
              {item}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
