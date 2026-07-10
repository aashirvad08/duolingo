"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Sparkles, Volume2, Info } from "lucide-react";
import { useLessonStore } from "@/store/useLessonStore";
import { TopStats } from "@/components/layout/TopStats";
import { RightRail } from "@/components/layout/RightRail";
import { SkillNode } from "@/components/ui/SkillNode";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

import { getApiUrl } from "@/utils/api";

// Path offsets for the serpentine zigzag
const offsets = [0, 45, 70, 45, 0, -45, -70, -45];

const fetchCoursePath = async () => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/courses/1/path`, {
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to fetch path");
  return res.json();
};

export default function LearnPage() {
  const router = useRouter();
  const [guidebookUnit, setGuidebookUnit] = useState<{ title: string; desc: string } | null>(null);

  // Fetch course details
  const { data: pathData, isLoading, error } = useQuery({
    queryKey: ["coursePath"],
    queryFn: fetchCoursePath,
    staleTime: 30000,
  });

  const handleStartLesson = async (skillId: number, lessonsCompleted: number) => {
    // Standard mathematical mapping from seeded database
    const lessonId = (skillId - 1) * 3 + lessonsCompleted + 1;
    router.push(`/lesson/${lessonId}`);
  };

  // Loading Skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex">
        <div className="flex-1 p-6 md:p-8 space-y-12 max-w-2xl mx-auto">
          {/* Top skeleton */}
          <div className="flex justify-between items-center h-12 border-b border-swan dark:border-slate-800 pb-4">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          </div>
          {/* Banner skeleton */}
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          {/* Path skeleton */}
          <div className="flex flex-col items-center gap-10 py-6">
            {[0, 1, 2, 3, 4].map((i) => {
              const x = offsets[i % 8];
              return (
                <div
                  key={i}
                  className="w-[90px] h-[90px] rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"
                  style={{ transform: `translateX(${x}px)` }}
                />
              );
            })}
          </div>
        </div>
        <div className="hidden xl:block p-8 border-l border-swan dark:border-slate-800">
          <div className="w-80 h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !pathData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-6 text-center">
        <h2 className="text-2xl font-black text-cardinal">Unable to load path</h2>
        <p className="text-wolf font-bold mt-2">Make sure your backend API server is running.</p>
        <Button variant="green" className="mt-6" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Flattened list of skills with matching unit details
  let skillGlobalIndex = 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex transition-colors duration-300">
      
      {/* Scrollable Main Path Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-2xl mx-auto space-y-8 select-none">
        
        {/* Sticky Stats Header */}
        <header className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs py-3 border-b-2 border-swan dark:border-slate-800 z-10 flex justify-between items-center transition-colors">
          <h2 className="text-xl font-black text-eel dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>{pathData.title}</span>
            <span className="text-xs bg-polar dark:bg-slate-800 text-wolf px-2.5 py-1 rounded-full border border-swan dark:border-slate-700">
              ES
            </span>
          </h2>
          <TopStats />
        </header>

        {/* Units & Serpentine Map */}
        <div className="space-y-12 pb-16">
          {pathData.units.map((unit: any) => (
            <section key={unit.id} className="space-y-8">
              
              {/* Unit Colored Header Banner */}
              <div
                className="rounded-2xl p-5 text-white flex justify-between items-center shadow-md relative overflow-hidden"
                style={{ backgroundColor: unit.color_hex }}
              >
                <div className="space-y-1 max-w-[70%] z-10">
                  <h3 className="text-lg font-black uppercase tracking-wider">
                    Unit {unit.order_index}
                  </h3>
                  <p className="text-sm font-extrabold opacity-95 leading-snug">
                    {unit.title}: {unit.description}
                  </p>
                </div>
                <button
                  onClick={() => setGuidebookUnit({ title: unit.title, desc: unit.description })}
                  className="z-10 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl border border-white/20 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  Guidebook
                </button>
                {/* Visual decoration overlay */}
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <Sparkles className="w-32 h-32" />
                </div>
              </div>

              {/* Skills path */}
              <div className="flex flex-col items-center gap-8 py-2">
                {unit.skills.map((skill: any) => {
                  const x = offsets[skillGlobalIndex % 8];
                  skillGlobalIndex++;

                  return (
                    <div
                      key={skill.id}
                      style={{ transform: `translateX(${x}px)` }}
                      className="transition-transform duration-300"
                    >
                      <SkillNode
                        id={skill.id}
                        title={skill.title}
                        iconName={skill.icon_name}
                        crowns={skill.crowns}
                        maxCrowns={skill.max_crowns}
                        lessonsCompleted={skill.lessons_completed}
                        lessonsCount={skill.lessons_count}
                        status={skill.status}
                        onStartLesson={() => handleStartLesson(skill.id, skill.lessons_completed)}
                      />
                    </div>
                  );
                })}
              </div>

            </section>
          ))}
        </div>

      </div>

      {/* Desktop Right Rail */}
      <div className="hidden xl:block p-8 border-l-2 border-swan dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
        <RightRail />
      </div>

      {/* Guidebook Modal */}
      <Modal
        isOpen={guidebookUnit !== null}
        onClose={() => setGuidebookUnit(null)}
        title="Unit Guidebook"
      >
        {guidebookUnit && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-polar dark:bg-slate-900 text-left border border-swan dark:border-slate-700">
              <h4 className="font-extrabold text-eel dark:text-white text-lg">
                {guidebookUnit.title}
              </h4>
              <p className="text-sm font-bold text-wolf mt-2 leading-relaxed">
                {guidebookUnit.desc}
              </p>
            </div>
            <div className="space-y-3 text-left">
              <h5 className="font-extrabold text-sm uppercase tracking-wider text-eel dark:text-white">
                Key Vocabulary
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-wolf">
                <div className="p-2.5 rounded-xl border border-swan dark:border-slate-700 flex justify-between">
                  <span className="text-eel dark:text-white">hola</span>
                  <span>hello</span>
                </div>
                <div className="p-2.5 rounded-xl border border-swan dark:border-slate-700 flex justify-between">
                  <span className="text-eel dark:text-white">gracias</span>
                  <span>thanks</span>
                </div>
                <div className="p-2.5 rounded-xl border border-swan dark:border-slate-700 flex justify-between">
                  <span className="text-eel dark:text-white">pan</span>
                  <span>bread</span>
                </div>
                <div className="p-2.5 rounded-xl border border-swan dark:border-slate-700 flex justify-between">
                  <span className="text-eel dark:text-white">agua</span>
                  <span>water</span>
                </div>
              </div>
            </div>
            <Button variant="green" fullWidth className="mt-4" onClick={() => setGuidebookUnit(null)}>
              Got It
            </Button>
          </div>
        )}
      </Modal>

    </div>
  );
}
