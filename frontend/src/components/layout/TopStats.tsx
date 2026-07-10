"use client";

import React from "react";
import Link from "next/link";
import { StreakFlame, GemIcon, HeartIcon } from "../ui/Icons";
import { useLessonStore } from "@/store/useLessonStore";

interface TopStatsProps {
  isPracticeMode?: boolean;
}

export const TopStats: React.FC<TopStatsProps> = ({ isPracticeMode = false }) => {
  const stats = useLessonStore((state) => state.stats);

  if (!stats) {
    return (
      <div className="flex gap-6 h-8 items-center bg-transparent animate-pulse">
        <div className="w-12 h-6 bg-swan dark:bg-slate-700 rounded-full" />
        <div className="w-12 h-6 bg-swan dark:bg-slate-700 rounded-full" />
        <div className="w-12 h-6 bg-swan dark:bg-slate-700 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-center justify-end font-extrabold text-sm md:text-base select-none">
      {/* Streak */}
      <Link href="/profile" className="flex items-center gap-1.5 text-fox hover:opacity-80 transition-opacity">
        <StreakFlame size={24} active={stats.current_streak > 0} />
        <span>{stats.current_streak}</span>
      </Link>

      {/* Gems */}
      <Link href="/shop" className="flex items-center gap-1.5 text-macaw hover:opacity-80 transition-opacity">
        <GemIcon size={24} />
        <span>{stats.gems}</span>
      </Link>

      {/* Hearts */}
      <Link href="/shop" className="flex items-center gap-1.5 text-cardinal hover:opacity-80 transition-opacity">
        <HeartIcon size={24} />
        <span>{isPracticeMode ? "∞" : stats.hearts}</span>
      </Link>
    </div>
  );
};
