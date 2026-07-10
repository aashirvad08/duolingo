"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Target, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLessonStore } from "@/store/useLessonStore";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";

import { getApiUrl } from "@/utils/api";

// Simple API fetcher
const fetchLeaderboardPreview = async () => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/leaderboard`, {
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
};

export const RightRail: React.FC = () => {
  const stats = useLessonStore((state) => state.stats);
  
  // React Query for leaderboard info
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["leaderboardPreview"],
    queryFn: fetchLeaderboardPreview,
    staleTime: 60000, // 1 min
  });

  const dailyXpProgress = stats
    ? Math.min(100, Math.round((stats.total_xp % stats.daily_goal_xp) / stats.daily_goal_xp * 100))
    : 0;

  return (
    <aside className="w-80 space-y-6 select-none shrink-0 hidden xl:block">
      {/* 1. Super Duolingo / Refill Card */}
      <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-800">
        <div className="flex gap-3 items-start">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-500">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h4 className="font-extrabold text-eel dark:text-white">Practice Mode</h4>
            <p className="text-xs text-wolf dark:text-slate-300 font-bold mt-0.5">
              Keep learning and refill your hearts anytime for free.
            </p>
          </div>
        </div>
        <Link href="/shop" className="block w-full">
          <Button variant="blue" fullWidth className="py-2.5 text-xs">
            Visit Shop
          </Button>
        </Link>
      </div>

      {/* 2. Daily Quests Card */}
      <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 space-y-4 bg-white dark:bg-slate-800">
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-eel dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cardinal" />
            Daily Quests
          </h4>
          <Link href="/profile" className="text-xs font-extrabold text-macaw uppercase tracking-wider hover:opacity-80">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-extrabold text-eel dark:text-white">
              <span>Earn {stats?.daily_goal_xp || 20} XP</span>
              <span className="text-wolf">{stats ? stats.total_xp % stats.daily_goal_xp : 0}/{stats?.daily_goal_xp || 20} XP</span>
            </div>
            <ProgressBar value={dailyXpProgress} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-extrabold text-eel dark:text-white">
              <span>Complete 1 Lesson</span>
              <span className="text-wolf">1/1</span>
            </div>
            <ProgressBar value={100} />
          </div>
        </div>
      </div>

      {/* 3. Leaderboard Card */}
      <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 space-y-4 bg-white dark:bg-slate-800">
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-eel dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-bee fill-current" />
            Ruby League
          </h4>
          <Link href="/leaderboard" className="text-xs font-extrabold text-macaw uppercase tracking-wider hover:opacity-80">
            Leaderboard
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-polar dark:bg-slate-700 rounded-xl" />
            <div className="h-10 bg-polar dark:bg-slate-700 rounded-xl" />
            <div className="h-10 bg-polar dark:bg-slate-700 rounded-xl" />
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboardData?.rankings?.slice(0, 3).map((rank: any) => (
              <div
                key={rank.user.username}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-polar dark:hover:bg-slate-700"
              >
                <span className="font-extrabold text-wolf w-4">{rank.rank}</span>
                <div className="w-8 h-8 rounded-full bg-swan dark:bg-slate-600 flex items-center justify-center font-extrabold text-white text-xs">
                  {rank.user.display_name[0]}
                </div>
                <div className="flex-1 truncate">
                  <span className="block text-xs font-extrabold text-eel dark:text-white truncate">
                    {rank.user.display_name}
                  </span>
                  <span className="block text-[10px] text-wolf font-bold">
                    {rank.weekly_xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
