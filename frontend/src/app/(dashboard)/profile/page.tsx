"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Award, Zap, Calendar, Heart, Shield, Sparkles, Star, Milestone } from "lucide-react";
import { MascotDuo } from "@/components/ui/Icons";
import { useLessonStore } from "@/store/useLessonStore";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Toast } from "@/components/ui/Toast";

import { getApiUrl } from "@/utils/api";

// API Fetchers
const fetchProfileData = async () => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/profile/1`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

const triggerAdvanceDay = async () => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/debug/advance-day`, {
    method: "POST",
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to advance day");
  return res.json();
};

export default function ProfilePage() {
  const setStats = useLessonStore((state) => state.setStats);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch profile query
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchProfileData,
    staleTime: 10000,
  });

  // Debug mutation to advance day
  const advanceDayMutation = useMutation({
    mutationFn: triggerAdvanceDay,
    onSuccess: (data) => {
      setStats(data);
      refetch();
      setToastMessage("Advanced day successfully! Simulated streak dates.");
      setToastVisible(true);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to advance day");
    }
  });

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      setToastMessage(`Theme switched to ${newTheme} mode!`);
      setToastVisible(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-pulse select-none">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none">
        <h2 className="text-2xl font-black text-cardinal">Failed to load profile</h2>
        <Button variant="green" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { user, stats, achievements, activity_heatmap } = profile;

  // Render Activity Heatmap (Grid of last 180 days, grouped by weeks)
  // Let's create an array of last 180 days
  const today = new Date();
  const dateList: { dateString: string; xp: number; dateObj: Date }[] = [];
  
  for (let i = 180; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Find matching heatmap entry
    const match = activity_heatmap.find((h: any) => h.date === dateStr);
    dateList.push({
      dateString: dateStr,
      xp: match ? match.xp_earned : 0,
      dateObj: d,
    });
  }

  // Group by week days for vertical calendar grid layout
  // Column-based grid: days of week (Mon-Sun) on rows, weeks on columns
  // Tailwind grid-rows-7 grid-flow-col makes it draw like GitHub!
  const getHeatmapColor = (xp: number) => {
    if (xp === 0) return "bg-swan/45 dark:bg-slate-800 hover:bg-swan dark:hover:bg-slate-700";
    if (xp < 20) return "bg-green-200 dark:bg-emerald-800 hover:bg-green-300";
    if (xp < 40) return "bg-green-400 dark:bg-emerald-600 hover:bg-green-500";
    return "bg-green-600 dark:bg-emerald-400 hover:bg-green-700";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 select-none">
      
      {/* 1. Header Profile Box */}
      <div className="border-b-2 border-swan dark:border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 rounded-full bg-feather-green/10 border-4 border-feather-green flex items-center justify-center shadow-inner">
            <MascotDuo mood="happy" size={70} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-eel dark:text-white leading-tight">
              {user.display_name}
            </h1>
            <p className="text-sm font-extrabold text-wolf dark:text-slate-400">
              @{user.username}
            </p>
            <p className="text-xs text-wolf dark:text-slate-400 font-bold mt-1">
              Joined {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* Debug Action Bar */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="py-2.5 px-4 text-xs border-2"
          >
            Toggle Dark Theme
          </Button>
          <Button
            variant="ghost"
            onClick={() => advanceDayMutation.mutate()}
            disabled={advanceDayMutation.isPending}
            className="py-2.5 px-4 text-xs"
          >
            {advanceDayMutation.isPending ? "Simulating..." : "Advance 1 Day (Debug)"}
          </Button>
        </div>
      </div>

      {/* 2. Key Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="border-2 border-swan dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center bg-white dark:bg-slate-800">
          <div className="text-fox shrink-0">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <span className="block font-black text-xl text-eel dark:text-white leading-none">
              {stats.current_streak}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-1">
              Streak
            </span>
          </div>
        </div>

        {/* Total XP */}
        <div className="border-2 border-swan dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center bg-white dark:bg-slate-800">
          <div className="text-bee shrink-0">
            <Sparkles className="w-8 h-8 fill-current" />
          </div>
          <div>
            <span className="block font-black text-xl text-eel dark:text-white leading-none">
              {stats.total_xp}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-1">
              Total XP
            </span>
          </div>
        </div>

        {/* Hearts */}
        <div className="border-2 border-swan dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center bg-white dark:bg-slate-800">
          <div className="text-cardinal shrink-0">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div>
            <span className="block font-black text-xl text-eel dark:text-white leading-none">
              {stats.hearts}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-1">
              Hearts
            </span>
          </div>
        </div>

        {/* Gems */}
        <div className="border-2 border-swan dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center bg-white dark:bg-slate-800">
          <div className="text-macaw shrink-0">
            <Shield className="w-8 h-8 fill-current" />
          </div>
          <div>
            <span className="block font-black text-xl text-eel dark:text-white leading-none">
              {stats.gems}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-1">
              Gems
            </span>
          </div>
        </div>
      </div>

      {/* 3. Activity Calendar Heatmap */}
      <div className="border-2 border-swan dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-800 space-y-4">
        <h3 className="text-lg font-black text-eel dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Milestone className="w-5 h-5 text-macaw" />
          Activity Calendar
        </h3>
        <p className="text-xs font-bold text-wolf leading-none">
          XP activity for the last 6 months. Hover over days to inspect details.
        </p>

        {/* Git style grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
            {dateList.map((item, idx) => (
              <div
                key={item.dateString}
                title={`${item.dateString}: ${item.xp} XP`}
                className={`w-3.5 h-3.5 rounded-xs transition-colors cursor-pointer ${getHeatmapColor(item.xp)}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Achievements Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-eel dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-bee fill-current" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach: any) => {
            const hasProgress = ach.next_tier_goal !== null;
            const progressPct = hasProgress
              ? Math.min(100, Math.round((ach.progress_value / ach.next_tier_goal) * 100))
              : 100;

            return (
              <div
                key={ach.code}
                className="border-2 border-swan dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-center bg-white dark:bg-slate-800 relative overflow-hidden"
              >
                {/* Visual Icon with stars represent unlocked tier */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shadow-md">
                    <Award className="w-7 h-7 fill-current" />
                  </div>
                  {/* Stars for tier progress */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= ach.current_tier
                            ? "text-bee fill-bee"
                            : "text-swan dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div>
                    <h4 className="font-extrabold text-eel dark:text-white leading-tight text-sm md:text-base">
                      {ach.title}
                    </h4>
                    <p className="text-xs text-wolf dark:text-slate-400 font-bold leading-normal">
                      {ach.description}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {hasProgress ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-extrabold text-wolf leading-none">
                        <span>Progress</span>
                        <span>
                          {ach.progress_value}/{ach.next_tier_goal}
                        </span>
                      </div>
                      <ProgressBar value={progressPct} color="bg-bee" />
                    </div>
                  ) : (
                    <div className="text-[10px] uppercase font-extrabold text-tree-frog dark:text-emerald-400 leading-none">
                      Completed Max Tier!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
