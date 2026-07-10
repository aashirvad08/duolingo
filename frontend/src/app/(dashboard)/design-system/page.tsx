"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  HeartIcon,
  StreakFlame,
  GemIcon,
  CrownIcon,
  MascotDuo,
} from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { SkillNode } from "@/components/ui/SkillNode";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <div className="min-h-screen bg-polar dark:bg-slate-900 p-8 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-swan dark:border-slate-700">
        
        {/* Header section */}
        <div className="border-b-2 border-swan pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-eel dark:text-white tracking-tight">
              Duolingo Design System
            </h1>
            <p className="text-wolf dark:text-slate-300 font-bold mt-1">
              Visual primitives and responsive component library (2024-25 style)
            </p>
          </div>
          <MascotDuo mood="happy" size={70} />
        </div>

        {/* 1. Mascot Moods */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-eel dark:text-white uppercase tracking-wider">
            1. Mascot Mascot Moods
          </h2>
          <div className="grid grid-cols-3 gap-4 border border-swan rounded-2xl p-6 bg-polar dark:bg-slate-900 items-center justify-items-center">
            <div className="text-center">
              <MascotDuo mood="happy" size={90} />
              <div className="text-xs font-bold text-wolf mt-2">Happy</div>
            </div>
            <div className="text-center">
              <MascotDuo mood="sad" size={90} />
              <div className="text-xs font-bold text-wolf mt-2">Sad</div>
            </div>
            <div className="text-center">
              <MascotDuo mood="shocked" size={90} />
              <div className="text-xs font-bold text-wolf mt-2">Shocked</div>
            </div>
          </div>
        </section>

        {/* 2. 3D Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-eel dark:text-white uppercase tracking-wider">
            2. The 3D Button Primitives
          </h2>
          <div className="flex flex-wrap gap-4 border border-swan rounded-2xl p-6 bg-polar dark:bg-slate-900">
            <Button variant="green" onClick={() => showToast("Success button clicked!", "success")}>
              Green Primary
            </Button>
            <Button variant="blue" onClick={() => showToast("Blue secondary clicked!", "info")}>
              Blue Secondary
            </Button>
            <Button variant="red" onClick={() => showToast("Error button clicked!", "error")}>
              Red Danger
            </Button>
            <Button variant="gold" onClick={() => showToast("Gold XP clicked!", "success")}>
              Gold Rewards
            </Button>
            <Button variant="purple" onClick={() => showToast("Purple legendary clicked!", "info")}>
              Purple Legendary
            </Button>
            <Button variant="ghost" onClick={() => showToast("Ghost button clicked!", "info")}>
              Ghost Mode
            </Button>
            <Button variant="locked">
              Locked Skill
            </Button>
          </div>
        </section>

        {/* 3. Progress Bars */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-eel dark:text-white uppercase tracking-wider">
            3. Lesson Progress Indicator
          </h2>
          <div className="space-y-6 border border-swan rounded-2xl p-6 bg-polar dark:bg-slate-900">
            <div className="space-y-2">
              <div className="text-xs font-bold text-wolf">Progress: 25% (Intro level)</div>
              <ProgressBar value={25} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-wolf">Progress: 60% (Medium level)</div>
              <ProgressBar value={60} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-wolf">Progress: 100% (Completed level)</div>
              <ProgressBar value={100} />
            </div>
          </div>
        </section>

        {/* 4. SVGs & Gamification Indicators */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-eel dark:text-white uppercase tracking-wider">
            4. Stat & Status Indicators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 border border-swan rounded-2xl p-6 bg-polar dark:bg-slate-900 items-center justify-items-center">
            <div className="flex flex-col items-center gap-1">
              <HeartIcon size={36} />
              <span className="text-xs font-bold text-wolf">Heart (Normal)</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <HeartIcon size={36} cracked />
              <span className="text-xs font-bold text-wolf">Heart (Cracked)</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StreakFlame size={36} />
              <span className="text-xs font-bold text-wolf">Streak (Active)</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <GemIcon size={36} />
              <span className="text-xs font-bold text-wolf">Gem Jewel</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CrownIcon size={36} />
              <span className="text-xs font-bold text-wolf">Crown Medal</span>
            </div>
          </div>
        </section>

        {/* 5. Serpentine Skill Path Nodes */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-eel dark:text-white uppercase tracking-wider">
            5. Serpentine Lesson Nodes
          </h2>
          <div className="flex flex-col md:flex-row justify-around gap-8 border border-swan rounded-2xl p-8 bg-polar dark:bg-slate-900 items-center">
            <SkillNode
              id={1}
              title="Intro"
              iconName="home"
              crowns={0}
              lessonsCompleted={0}
              lessonsCount={3}
              status="locked"
              onStartLesson={() => {}}
            />
            <SkillNode
              id={2}
              title="Travel"
              iconName="plane"
              crowns={1}
              lessonsCompleted={1}
              lessonsCount={3}
              status="available"
              onStartLesson={() => showToast("Starting Travel lesson!", "success")}
            />
            <SkillNode
              id={3}
              title="Family"
              iconName="users"
              crowns={5}
              lessonsCompleted={0}
              lessonsCount={3}
              status="completed"
              onStartLesson={() => showToast("Starting Family practice!", "info")}
            />
            <SkillNode
              id={4}
              title="Legendary"
              iconName="coffee"
              crowns={5}
              lessonsCompleted={0}
              lessonsCount={3}
              status="legendary"
              onStartLesson={() => showToast("Starting Legendary challenge!", "info")}
            />
          </div>
        </section>

        {/* 6. Overlays & Modals */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-eel dark:text-white uppercase tracking-wider">
            6. Interactive Dialogs & Popups
          </h2>
          <div className="flex gap-4 border border-swan rounded-2xl p-6 bg-polar dark:bg-slate-900">
            <Button variant="blue" onClick={() => setIsModalOpen(true)}>
              Launch 3D Modal
            </Button>
            <Button variant="red" onClick={() => showToast("Something went wrong!", "error")}>
              Launch Toast Notification
            </Button>
          </div>
        </section>

      </div>

      {/* Modal Dialog container */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Duo Mascot Alert!"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <MascotDuo mood="shocked" size={100} />
          <p className="text-base font-bold text-eel dark:text-white">
            You are about to start a practice lesson! Do you have what it takes?
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>
              Back out
            </Button>
            <Button variant="green" fullWidth onClick={() => {
              setIsModalOpen(false);
              showToast("Starting practice!", "success");
            }}>
              Let&apos;s go!
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Alert System */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        type={toastType}
        onClose={() => setToastVisible(false)}
      />

    </div>
  );
}
