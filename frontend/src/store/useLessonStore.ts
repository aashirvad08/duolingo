import { create } from "zustand";

export interface Exercise {
  id: number;
  order_index: number;
  type: "MULTIPLE_CHOICE" | "TRANSLATE" | "MATCH_PAIRS" | "FILL_BLANK" | "TYPE_ANSWER";
  prompt: string;
  audio_url: string | null;
  payload: any;
}

export interface UserStats {
  total_xp: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  current_streak: number;
  longest_streak: number;
  daily_goal_xp: number;
}

interface LessonSession {
  attemptId: number;
  lessonId: number;
  deck: Exercise[];
  currentIndex: number;
  heartsLost: number;
  correctCount: number;
  currentCombo: number;
  maxCombo: number;
  startTime: number;
  isActive: boolean;
}

interface LessonStore {
  // User Stats State
  stats: UserStats | null;
  setStats: (stats: UserStats) => void;
  refillHeartsLocally: () => void;
  
  // Lesson Session State
  session: LessonSession | null;
  startSession: (attemptId: number, lessonId: number, exercises: Exercise[]) => void;
  answerQuestion: (isCorrect: boolean) => void;
  nextQuestion: () => void;
  endSession: () => void;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
  
  refillHeartsLocally: () => {
    const currentStats = get().stats;
    if (currentStats) {
      set({
        stats: {
          ...currentStats,
          hearts: currentStats.max_hearts,
          gems: Math.max(0, currentStats.gems - 350)
        }
      });
    }
  },

  session: null,

  startSession: (attemptId, lessonId, exercises) => {
    // Clone exercises array for mutable deck queue
    const deck = [...exercises];
    set({
      session: {
        attemptId,
        lessonId,
        deck,
        currentIndex: 0,
        heartsLost: 0,
        correctCount: 0,
        currentCombo: 0,
        maxCombo: 0,
        startTime: Date.now(),
        isActive: true,
      },
    });
  },

  answerQuestion: (isCorrect) => {
    const currentSession = get().session;
    const currentStats = get().stats;
    
    if (!currentSession) return;

    const currentExercise = currentSession.deck[currentSession.currentIndex];
    
    let newDeck = [...currentSession.deck];
    let newHeartsLost = currentSession.heartsLost;
    let newCorrectCount = currentSession.correctCount;
    let newCurrentCombo = currentSession.currentCombo;
    let newMaxCombo = currentSession.maxCombo;
    
    if (isCorrect) {
      newCorrectCount += 1;
      newCurrentCombo += 1;
      newMaxCombo = Math.max(newMaxCombo, newCurrentCombo);
    } else {
      newHeartsLost += 1;
      newCurrentCombo = 0;
      // Re-queue the wrong exercise at the end of the deck
      newDeck.push(currentExercise);
      
      // Decrement hearts in user stats locally for optimistic UI
      if (currentStats) {
        set({
          stats: {
            ...currentStats,
            hearts: Math.max(0, currentStats.hearts - 1)
          }
        });
      }
    }

    set({
      session: {
        ...currentSession,
        deck: newDeck,
        heartsLost: newHeartsLost,
        correctCount: newCorrectCount,
        currentCombo: newCurrentCombo,
        maxCombo: newMaxCombo,
      },
    });
  },

  nextQuestion: () => {
    const currentSession = get().session;
    if (!currentSession) return;

    set({
      session: {
        ...currentSession,
        currentIndex: currentSession.currentIndex + 1,
      },
    });
  },

  endSession: () => {
    set({ session: null });
  },
}));
