"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Heart, Shield, Award, Calendar, Percent, Clock, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

import { useLessonStore } from "@/store/useLessonStore";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { playCorrectSound, playWrongSound } from "@/utils/sounds";
import { MascotDuo } from "@/components/ui/Icons";
import { speakSpanish } from "@/utils/tts";

import { MultipleChoice } from "@/components/exercises/MultipleChoice";
import { Translate } from "@/components/exercises/Translate";
import { MatchPairs } from "@/components/exercises/MatchPairs";
import { FillBlank } from "@/components/exercises/FillBlank";
import { TypeAnswer } from "@/components/exercises/TypeAnswer";

import { getApiUrl } from "@/utils/api";

// Helper API functions
const startLessonAttempt = async (lessonId: number) => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/lessons/${lessonId}/start`, {
    method: "POST",
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Out of hearts");
  }
  return res.json();
};

const fetchLessonDetails = async (lessonId: number) => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/lessons/${lessonId}`, {
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to fetch lesson details");
  return res.json();
};

const submitAnswerAPI = async (attemptId: number, exerciseId: number, answer: any) => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/attempts/${attemptId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": "1"
    },
    body: JSON.stringify({ exercise_id: exerciseId, answer })
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
};

const completeAttemptAPI = async (attemptId: number) => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/attempts/${attemptId}/complete`, {
    method: "POST",
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to complete attempt");
  return res.json();
};

const refillHeartsAPI = async () => {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/hearts/refill`, {
    method: "POST",
    headers: { "X-User-Id": "1" }
  });
  if (!res.ok) throw new Error("Failed to refill hearts");
  return res.json();
};

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);

  // Zustand states
  const storeStats = useLessonStore((state) => state.stats);
  const setStats = useLessonStore((state) => state.setStats);
  const refillHeartsLocally = useLessonStore((state) => state.refillHeartsLocally);
  const session = useLessonStore((state) => state.session);
  const startSession = useLessonStore((state) => state.startSession);
  const answerQuestion = useLessonStore((state) => state.answerQuestion);
  const nextQuestion = useLessonStore((state) => state.nextQuestion);
  const endSession = useLessonStore((state) => state.endSession);

  // Local Page States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [outOfHeartsOpen, setOutOfHeartsOpen] = useState(false);
  const [originalDeckLength, setOriginalDeckLength] = useState(7);
  
  // Exercise Input Answers
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  
  // Checking & Feedback Bar states
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctSolution, setCorrectSolution] = useState<any>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lesson Completion Summary
  const [isFinished, setIsFinished] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  // Load lesson session
  useEffect(() => {
    const initLesson = async () => {
      try {
        setLoading(true);
        // Start lesson attempt
        const attempt = await startLessonAttempt(lessonId);
        
        // Fetch questions
        const lessonData = await fetchLessonDetails(lessonId);
        
        // Load into Zustand store
        startSession(attempt.attempt_id, lessonId, lessonData.exercises);
        setOriginalDeckLength(lessonData.exercises.length);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Failed to start lesson");
        setLoading(false);
        if (err.message.includes("hearts") || err.message.includes("Hearts")) {
          setOutOfHeartsOpen(true);
        }
      }
    };

    initLesson();
    return () => {
      endSession();
    };
  }, [lessonId, startSession, endSession]);

  // Keyboard shortcut listener (Enter for Check/Continue)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (isAnswered) {
          handleContinue();
        } else if (currentAnswer !== null && currentAnswer !== "" && !isSubmitting) {
          handleCheck();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, currentAnswer, isSubmitting]);

  // Auto-speak Spanish prompt on load/advance
  useEffect(() => {
    if (session) {
      const activeExercise = session.deck[session.currentIndex];
      const isComplete = session.currentIndex >= session.deck.length;
      if (activeExercise && !isComplete) {
        speakSpanish(activeExercise.prompt);
      }
    }
  }, [session?.currentIndex, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col justify-between p-6">
        <header className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center items-center gap-6">
          <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </main>
        <footer className="h-24 border-t border-swan dark:border-slate-800 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (errorMsg && !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-6 text-center select-none">
        <MascotDuo mood="sad" size={120} />
        <h2 className="text-2xl font-black text-cardinal mt-4">Lesson Error</h2>
        <p className="text-wolf font-bold mt-1">{errorMsg}</p>
        <Button variant="green" className="mt-6" onClick={() => router.push("/learn")}>
          Return to Path
        </Button>

        <Modal isOpen={outOfHeartsOpen} onClose={() => {}} title="You ran out of hearts!">
          <div className="flex flex-col items-center gap-4 py-4">
            <Heart className="w-16 h-16 text-cardinal fill-cardinal animate-bounce" />
            <p className="text-sm font-bold text-wolf">
              Refill for 350 gems to keep learning this skill, or end the session.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <Button variant="green" fullWidth onClick={handleGemsRefill}>
                Refill for 350 Gems
              </Button>
              <Button variant="ghost" fullWidth onClick={() => router.push("/learn")}>
                End Session
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (!session) return null;

  // Active items mapping
  const { deck, currentIndex, heartsLost, correctCount } = session;
  const isLessonComplete = currentIndex >= deck.length;

  const currentExercise = deck[currentIndex];

  const handleCheck = async () => {
    if (isSubmitting || currentAnswer === null || currentAnswer === "") return;
    setIsSubmitting(true);

    try {
      // Post answer validation to backend
      const res = await submitAnswerAPI(session.attemptId, currentExercise.id, currentAnswer);
      
      setIsCorrect(res.is_correct);
      setCorrectSolution(res.correct_answer);
      
      // Update local stats and active session queues
      answerQuestion(res.is_correct);
      
      // Sync stats with database response
      if (storeStats) {
        setStats({
          ...storeStats,
          hearts: res.hearts_remaining
        });
      }

      // Play synthesized sounds
      if (res.is_correct) {
        playCorrectSound();
      } else {
        playWrongSound();
      }

      setIsAnswered(true);
      setIsSubmitting(false);

      // Trigger out-of-hearts if depletion occurred
      if (res.hearts_remaining <= 0 && !res.is_correct) {
        setTimeout(() => {
          setOutOfHeartsOpen(true);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    // Check if we reached the end of the lesson deck
    const nextIndex = currentIndex + 1;
    if (nextIndex >= deck.length) {
      // Completed lesson attempt
      try {
        setLoading(true);
        const res = await completeAttemptAPI(session.attemptId);
        setSummaryData(res);
        
        // Sync stats with database rewards
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const meRes = await fetch(`${apiUrl}/api/v1/me`, {
          headers: { "X-User-Id": "1" }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setStats(meData.stats);
        }

        setIsFinished(true);
        setLoading(false);
        
        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    } else {
      // Move to next exercise
      nextQuestion();
      setCurrentAnswer(null);
      setIsAnswered(false);
    }
  };

  async function handleGemsRefill() {
    try {
      const res = await refillHeartsAPI();
      if (res.success) {
        refillHeartsLocally();
        setOutOfHeartsOpen(false);
        setErrorMsg("");
        // If we ran out of hearts and had to refill inside the lesson player,
        // we can allow the user to continue after clearing depletion states
        if (session && session.heartsLost >= 5) {
          // Restart lesson since it was aborted
          router.push("/learn");
        }
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Rendering screen for completed lesson takeover
  if (isFinished && summaryData) {
    const accuracyRounded = Math.round(summaryData.accuracy);
    const speedMin = Math.floor(summaryData.time_sec / 60);
    const speedSec = summaryData.time_sec % 60;
    
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col justify-between p-6 md:p-12 select-none items-center text-center">
        <div className="max-w-2xl w-full flex-1 flex flex-col justify-center items-center space-y-8 py-6">
          <Award className="w-20 h-20 text-bee animate-bounce" />
          
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-eel dark:text-white">
              Lesson Complete!
            </h1>
            <p className="text-wolf dark:text-slate-300 font-extrabold text-sm md:text-base mt-2">
              You earned XP and upgraded your Spanish skills!
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* 1. Total XP */}
            <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 flex flex-col items-center">
              <div className="text-gold flex gap-1 items-center font-black">
                <Sparkles className="w-5 h-5 text-bee" />
                <span>+{summaryData.xp_earned}</span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-2">
                Total XP
              </span>
            </div>

            {/* 2. Streak */}
            <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 flex flex-col items-center">
              <div className="text-fox flex gap-1 items-center font-black">
                <Calendar className="w-5 h-5" />
                <span>{summaryData.streak} days</span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-2">
                Streak
              </span>
            </div>

            {/* 3. Accuracy */}
            <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 flex flex-col items-center">
              <div className="text-rose-500 flex gap-1 items-center font-black">
                <Percent className="w-5 h-5" />
                <span>{accuracyRounded}%</span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-2">
                Accuracy
              </span>
            </div>

            {/* 4. Time */}
            <div className="border-2 border-swan dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 flex flex-col items-center">
              <div className="text-macaw flex gap-1 items-center font-black">
                <Clock className="w-5 h-5" />
                <span>
                  {speedMin}:{speedSec < 10 ? `0${speedSec}` : speedSec}
                </span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-wolf mt-2">
                Speed
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl w-full">
          <Button variant="green" fullWidth onClick={() => router.push("/learn")}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Calculate percentage of correctly completed items
  const progressRatio = Math.round((correctCount / originalDeckLength) * 100);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col justify-between select-none">
      
      {/* 1. Header Bar */}
      <header className="h-16 px-6 max-w-4xl mx-auto w-full flex items-center gap-6 border-b border-transparent dark:border-transparent">
        {/* Exit Button */}
        <button
          onClick={() => setExitModalOpen(true)}
          className="text-wolf hover:text-eel dark:hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <ProgressBar value={progressRatio} />
        </div>

        {/* Heart indicators */}
        <div className="flex items-center gap-1.5 text-cardinal font-extrabold">
          <Heart className="w-5 h-5 fill-current" />
          <span>{storeStats?.hearts}</span>
        </div>
      </header>

      {/* 2. Main Question Canvas */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 flex flex-col justify-center items-center py-6">
        <div className="w-full space-y-6">
          
          {/* Prompt */}
          <h2 className="text-xl md:text-2xl font-black text-eel dark:text-white text-center">
            {currentExercise.prompt}
          </h2>

          {/* Nested Exercise View */}
          <div className="py-2">
            {currentExercise.type === "MULTIPLE_CHOICE" && (
              <MultipleChoice
                options={currentExercise.payload.options || []}
                selectedId={currentAnswer}
                onSelect={setCurrentAnswer}
                disabled={isAnswered}
              />
            )}

            {currentExercise.type === "TRANSLATE" && (
              <Translate
                wordBank={currentExercise.payload.word_bank || []}
                selectedWords={currentAnswer || []}
                onChange={setCurrentAnswer}
                disabled={isAnswered}
              />
            )}

            {currentExercise.type === "MATCH_PAIRS" && (
              <MatchPairs
                pairs={currentExercise.payload.pairs || []}
                onChange={setCurrentAnswer}
                disabled={isAnswered}
              />
            )}

            {currentExercise.type === "FILL_BLANK" && (
              <FillBlank
                sentence={currentExercise.payload.sentence || ""}
                options={currentExercise.payload.options || []}
                selectedOption={currentAnswer}
                onSelect={setCurrentAnswer}
                disabled={isAnswered}
              />
            )}

            {currentExercise.type === "TYPE_ANSWER" && (
              <TypeAnswer
                value={currentAnswer || ""}
                onChange={setCurrentAnswer}
                disabled={isAnswered}
              />
            )}
          </div>

        </div>
      </main>

      {/* 3. Footer Control Check Bar */}
      <footer className="relative z-10">
        
        {/* Dynamic sliding feedback drawer */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 select-none z-10 ${
                isCorrect
                  ? "bg-[#D7FFB8] dark:bg-emerald-950/90 border-[#84D870] dark:border-emerald-800 text-tree-frog dark:text-emerald-400"
                  : "bg-[#FFDFE0] dark:bg-rose-950/90 border-[#FFA8A8] dark:border-rose-800 text-fire-ant dark:text-rose-400"
              }`}
            >
              <div className="flex gap-4 items-start max-w-3xl mx-auto w-full">
                {isCorrect ? (
                  <CheckCircle2 className="w-10 h-10 shrink-0 fill-current text-[#D7FFB8] stroke-tree-frog dark:stroke-emerald-400" />
                ) : (
                  <XCircle className="w-10 h-10 shrink-0 fill-current text-[#FFDFE0] stroke-fire-ant dark:stroke-rose-400" />
                )}
                <div>
                  <h3 className="text-lg font-black leading-none">
                    {isCorrect ? "Amazing!" : "Correct solution:"}
                  </h3>
                  <p className="text-sm font-extrabold mt-1 text-eel dark:text-white leading-relaxed">
                    {isCorrect
                      ? "Keep it up!"
                      : Array.isArray(correctSolution)
                      ? correctSolution.join(" ")
                      : typeof correctSolution === "object"
                      ? "Checked matching grid"
                      : correctSolution}
                  </p>
                </div>
              </div>
              <div className="max-w-xs w-full md:w-auto shrink-0 md:mr-10">
                <Button
                  variant={isCorrect ? "green" : "red"}
                  fullWidth
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default White Check Bar (replaced when isAnswered) */}
        {!isAnswered && (
          <div className="bg-white dark:bg-slate-900 border-t-2 border-swan dark:border-slate-800 p-6 flex justify-center items-center">
            <div className="max-w-3xl w-full flex justify-between items-center gap-4">
              <div className="hidden md:block" />
              
              <Button
                variant={
                  currentAnswer === null || currentAnswer === "" || (Array.isArray(currentAnswer) && currentAnswer.length === 0)
                    ? "locked"
                    : "green"
                }
                disabled={
                  currentAnswer === null || currentAnswer === "" || (Array.isArray(currentAnswer) && currentAnswer.length === 0) || isSubmitting
                }
                onClick={handleCheck}
                className="w-full md:w-auto md:px-12 py-3"
              >
                Check
              </Button>
            </div>
          </div>
        )}
      </footer>

      {/* Exit Modal confirmation */}
      <Modal isOpen={exitModalOpen} onClose={() => setExitModalOpen(false)} title="Quit lesson?">
        <div className="flex flex-col items-center gap-4 py-4">
          <MascotDuo mood="sad" size={90} />
          <p className="text-sm font-bold text-wolf">
            You will lose your progress and XP rewards for this lesson attempt.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="ghost" fullWidth onClick={() => setExitModalOpen(false)}>
              Keep Learning
            </Button>
            <Button variant="red" fullWidth onClick={() => {
              setExitModalOpen(false);
              router.push("/learn");
            }}>
              Quit Lesson
            </Button>
          </div>
        </div>
      </Modal>

      {/* Out of Hearts Modal overlay */}
      <Modal isOpen={outOfHeartsOpen} onClose={() => {}} title="You ran out of hearts!">
        <div className="flex flex-col items-center gap-4 py-4">
          <Heart className="w-16 h-16 text-cardinal fill-cardinal animate-bounce" />
          <p className="text-sm font-bold text-wolf">
            Refill for 350 gems to keep learning this skill, or end the session.
          </p>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Button variant="green" fullWidth onClick={handleGemsRefill}>
              Refill for 350 Gems
            </Button>
            <Button variant="ghost" fullWidth onClick={() => {
              setOutOfHeartsOpen(false);
              router.push("/learn");
            }}>
              End Session
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
