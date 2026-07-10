"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Fetch leaderboard data
const fetchLeaderboard = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/v1/leaderboard`, {
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
};

export default function LeaderboardPage() {
  const { data: board, isLoading, error, refetch } = useQuery({
    queryKey: ["fullLeaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 20000,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6 animate-pulse select-none">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none">
        <h2 className="text-2xl font-black text-cardinal">Failed to load rankings</h2>
        <Button variant="green" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400";
    if (rank === 2) return "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
    if (rank === 3) return "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400";
    return "text-wolf";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-6 select-none">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b-2 border-swan dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-eel dark:text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-bee fill-current" />
            Ruby League
          </h1>
          <p className="text-sm font-extrabold text-wolf dark:text-slate-400 mt-1">
            Compete against weekly learners to claim first place.
          </p>
        </div>
        <Sparkles className="w-8 h-8 text-bee animate-pulse" />
      </div>

      {/* Promo info box */}
      <div className="border-2 border-swan dark:border-slate-800 rounded-2xl p-4 flex gap-4 bg-white dark:bg-slate-800 items-start">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-700 text-macaw">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-eel dark:text-white leading-tight">
            Promotion Zone
          </h4>
          <p className="text-xs text-wolf dark:text-slate-300 font-bold leading-normal">
            Top 3 learners at the end of the week advance to the Emerald League! Keep completing lessons to stay ahead.
          </p>
        </div>
      </div>

      {/* Rankings List */}
      <div className="border-2 border-swan dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 divide-y divide-swan dark:divide-slate-800 shadow-sm">
        {board.rankings.map((rank: any) => {
          const isCurrentUser = rank.user.username === "learner";

          return (
            <div
              key={rank.user.username}
              className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                isCurrentUser ? "bg-blue-50/50 dark:bg-slate-700/30" : "hover:bg-polar dark:hover:bg-slate-700/50"
              }`}
            >
              {/* Rank indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${getRankBadgeColor(
                  rank.rank
                )}`}
              >
                {rank.rank}
              </div>

              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-swan dark:bg-slate-600 flex items-center justify-center font-extrabold text-white text-sm select-none shrink-0 border-2 border-white">
                {rank.user.display_name[0]}
              </div>

              {/* Name info */}
              <div className="flex-1 truncate">
                <span className="block font-black text-eel dark:text-white text-sm truncate leading-snug">
                  {rank.user.display_name} {isCurrentUser && <span className="text-[10px] bg-macaw text-white px-2 py-0.5 rounded-full ml-1 font-bold">YOU</span>}
                </span>
                <span className="text-xs text-wolf dark:text-slate-400 font-bold block leading-none mt-0.5">
                  @{rank.user.username}
                </span>
              </div>

              {/* Streak */}
              {rank.current_streak > 0 && (
                <div className="flex items-center gap-1 text-xs font-extrabold text-fox shrink-0">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>{rank.current_streak}</span>
                </div>
              )}

              {/* Weekly XP */}
              <div className="text-right shrink-0">
                <span className="block font-black text-eel dark:text-white text-sm">
                  {rank.weekly_xp} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
