"use client";

import React, { useState } from "react";
import { Shield, Sparkles, Heart, Zap, Gem } from "lucide-react";
import { useLessonStore } from "@/store/useLessonStore";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

import { getApiUrl } from "@/utils/api";

const refillHeartsAPI = async () => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/hearts/refill`, {
    method: "POST",
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to refill hearts");
  return res.json();
};

export default function ShopPage() {
  const stats = useLessonStore((state) => state.stats);
  const setStats = useLessonStore((state) => state.setStats);
  const refillHeartsLocally = useLessonStore((state) => state.refillHeartsLocally);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isBuying, setIsBuying] = useState(false);

  const handleRefill = async () => {
    if (!stats) return;
    if (stats.hearts >= stats.max_hearts) {
      setToastMessage("Hearts are already full!");
      setToastType("error");
      setToastVisible(true);
      return;
    }
    if (stats.gems < 350) {
      setToastMessage("Not enough gems! Refill costs 350 gems.");
      setToastType("error");
      setToastVisible(true);
      return;
    }

    setIsBuying(true);
    try {
      const res = await refillHeartsAPI();
      if (res.success) {
        // Update store state
        refillHeartsLocally();
        
        // Sync stats with database response
        setStats({
          ...stats,
          hearts: res.hearts,
          gems: res.gems
        });

        setToastMessage("Hearts successfully refilled!");
        setToastType("success");
        setToastVisible(true);
      } else {
        setToastMessage(res.message);
        setToastType("error");
        setToastVisible(true);
      }
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to purchase heart refill.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8 select-none">
      
      {/* Shop Header */}
      <div className="flex items-center justify-between border-b-2 border-swan dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-eel dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-bee fill-current animate-pulse" />
            Shop
          </h1>
          <p className="text-sm font-extrabold text-wolf dark:text-slate-400 mt-1">
            Spend gems to buy hearts, items, and power-ups!
          </p>
        </div>
        
        {/* Gems count status display */}
        {stats && (
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-slate-800 border-2 border-swan dark:border-slate-700 px-4 py-2 rounded-2xl font-black text-macaw">
            <Gem className="w-5 h-5 fill-current" />
            <span>{stats.gems}</span>
          </div>
        )}
      </div>

      {/* Powerups List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-eel dark:text-white uppercase tracking-wider">
          Hearts & Gems
        </h3>
        
        <div className="border-2 border-swan dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-800 divide-y divide-swan dark:divide-slate-800 shadow-sm">
          {/* Heart refill item */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
            <div className="flex gap-4 items-start text-left">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-slate-700 text-cardinal shrink-0">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-eel dark:text-white leading-tight">
                  Refill Hearts
                </h4>
                <p className="text-xs text-wolf dark:text-slate-300 font-bold leading-normal">
                  Restore your hearts back to full (5 hearts) immediately so you can jump back into learning skills.
                </p>
              </div>
            </div>
            
            <Button
              variant={stats && stats.hearts >= 5 ? "locked" : "blue"}
              onClick={handleRefill}
              disabled={isBuying || !!(stats && stats.hearts >= 5)}
              className="w-full md:w-auto text-xs shrink-0 py-2.5 px-6"
            >
              Buy for 350 Gems
            </Button>
          </div>

          {/* Streak freeze item */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
            <div className="flex gap-4 items-start text-left">
              <div className="p-3 rounded-2xl bg-orange-50 dark:bg-slate-700 text-fox shrink-0">
                <Zap className="w-8 h-8 fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-eel dark:text-white leading-tight">
                  Streak Freeze
                </h4>
                <p className="text-xs text-wolf dark:text-slate-300 font-bold leading-normal">
                  Allows your streak to remain in place if you miss a day of practice. Equips automatically.
                </p>
              </div>
            </div>
            
            <Button variant="locked" className="w-full md:w-auto text-xs shrink-0 py-2.5 px-6">
              Equipped (0/2)
            </Button>
          </div>
        </div>
      </div>

      {/* Super Duolingo Promotion box */}
      <div className="border-2 border-swan dark:border-slate-800 rounded-3xl p-6 bg-radial from-violet-600 to-indigo-800 text-white relative overflow-hidden shadow-xl text-center space-y-4">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6">
          <Sparkles className="w-48 h-48" />
        </div>
        
        <div className="space-y-1.5 z-10 relative">
          <h3 className="text-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 fill-current text-bee" />
            Super Duolingo
          </h3>
          <p className="text-sm font-extrabold opacity-90 max-w-md mx-auto">
            Get unlimited hearts, customized practice, and zero interruptions.
          </p>
        </div>

        <div className="max-w-xs mx-auto z-10 relative">
          <Button variant="locked" className="w-full bg-white text-indigo-900 border-b-4 border-slate-300 font-extrabold">
            Super Coming Soon
          </Button>
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        type={toastType === "success" ? "success" : "error"}
        onClose={() => setToastVisible(false)}
      />

    </div>
  );
}
