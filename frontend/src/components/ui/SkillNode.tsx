import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, Star, Home, Plane, Users, User, MessageCircle, Briefcase, Compass, ShoppingBag, Coffee, Utensils, Egg, ShoppingCart, Headphones, Mic, Gift, Trophy, Check } from "lucide-react";
import { Button } from "./Button";
import { useLessonStore } from "@/store/useLessonStore";

// Icon mapping dictionary
const iconMap: Record<string, React.ComponentType<any>> = {
  home: Home,
  plane: Plane,
  users: Users,
  user: User,
  "message-circle": MessageCircle,
  briefcase: Briefcase,
  compass: Compass,
  "shopping-bag": ShoppingBag,
  coffee: Coffee,
  utensils: Utensils,
  egg: Egg,
  "shopping-cart": ShoppingCart,
  headphones: Headphones,
  microphone: Mic,
  chest: Gift,
  trophy: Trophy
};

interface SkillNodeProps {
  id: number;
  title: string;
  iconName: string;
  crowns: number;
  maxCrowns?: number;
  lessonsCompleted: number;
  lessonsCount: number;
  status: "locked" | "available" | "completed" | "legendary";
  onStartLesson: () => void;
  type?: "skill" | "chest" | "trophy";
  unitId?: number;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  id,
  title,
  iconName,
  crowns,
  maxCrowns = 5,
  lessonsCompleted,
  lessonsCount,
  status,
  onStartLesson,
  type = "skill",
  unitId = 1,
  isOpen,
  onToggle
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPopoverOpen = isOpen !== undefined ? isOpen : localOpen;
  const setIsPopoverOpen = (open: boolean) => {
    if (onToggle) onToggle(open);
    setLocalOpen(open);
  };
  
  // Zustand stats store to claim rewards
  const stats = useLessonStore((state) => state.stats);
  const setStats = useLessonStore((state) => state.setStats);
  const [isChestClaimed, setIsChestClaimed] = useState(false);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Check if chest was claimed
  useEffect(() => {
    if (type === "chest") {
      const claimed = localStorage.getItem(`claimed_chest_unit_${unitId}`);
      if (claimed === "true") {
        setIsChestClaimed(true);
      }
    }
  }, [type, unitId]);

  const handleClaimChest = () => {
    if (stats) {
      setStats({
        ...stats,
        gems: stats.gems + 100
      });
      localStorage.setItem(`claimed_chest_unit_${unitId}`, "true");
      setIsChestClaimed(true);
      setIsPopoverOpen(false);
      // Play correct tone for gratification
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    }
  };

  const IconComponent = type === "chest" ? Gift : (type === "trophy" ? Trophy : (iconMap[iconName] || Star));

  // Determine colors based on status
  let buttonColor = "bg-swan border-hare text-hare shadow-[0_6px_0_var(--hare)]";
  let ringColor = "stroke-swan";
  
  const isLocked = status === "locked";

  if (type === "chest") {
    if (isChestClaimed) {
      buttonColor = "bg-slate-200 border-slate-300 text-slate-400 shadow-[0_6px_0_#cbd5e1] cursor-pointer hover:bg-slate-300";
      ringColor = "stroke-slate-300";
    } else if (!isLocked) {
      buttonColor = "bg-bee border-fox text-white shadow-[0_6px_0_var(--fox)] cursor-pointer hover:opacity-90 animate-pulse";
      ringColor = "stroke-bee";
    }
  } else if (type === "trophy") {
    if (!isLocked) {
      buttonColor = "bg-emerald-500 border-emerald-600 text-white shadow-[0_6px_0_#059669] cursor-pointer hover:bg-emerald-400";
      ringColor = "stroke-emerald-500";
    }
  } else {
    if (status === "available") {
      buttonColor = "bg-feather-green border-tree-frog text-white shadow-[0_6px_0_var(--tree-frog)] cursor-pointer hover:bg-mask-green";
      ringColor = "stroke-feather-green";
    } else if (status === "completed") {
      buttonColor = "bg-bee border-fox text-white shadow-[0_6px_0_var(--fox)] cursor-pointer hover:opacity-90";
      ringColor = "stroke-bee";
    } else if (status === "legendary") {
      buttonColor = "bg-beetle border-[rgba(168,85,247,0.85)] text-white shadow-[0_6px_0_rgba(168,85,247,0.85)] cursor-pointer hover:opacity-90";
      ringColor = "stroke-beetle";
    }
  }

  // Calculate progress ring circle properties
  const radius = 38;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = type === "chest" ? (isChestClaimed ? 1 : 0) : (type === "trophy" ? (!isLocked ? 1 : 0) : crowns / maxCrowns);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div ref={containerRef} className={`relative flex flex-col items-center select-none ${isPopoverOpen ? "z-40" : "z-0"}`}>
      {/* Start Bouncing Tooltip above available skills */}
      {status === "available" && type === "skill" && !isPopoverOpen && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 z-20 bg-feather-green text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border-b-2 border-tree-frog shadow-md uppercase tracking-wide pointer-events-none"
        >
          Start
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-feather-green rotate-45 border-r border-b border-tree-frog" />
        </motion.div>
      )}

      {/* Floating Crown Badge */}
      {type === "skill" && !isLocked && crowns > 0 && (
        <div className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-bee border-2 border-white flex items-center justify-center shadow-md">
          <Crown className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      )}

      {/* Circular Skill Node with Ring */}
      <div
        onClick={() => !isLocked && setIsPopoverOpen(!isPopoverOpen)}
        className="relative flex items-center justify-center w-[90px] h-[90px] cursor-pointer"
      >
        {/* SVG Progress Ring */}
        {!isLocked && (
          <svg className="absolute -rotate-90 w-full h-full p-1" viewBox="0 0 100 100">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              className="stroke-swan dark:stroke-slate-800"
              strokeWidth={strokeWidth}
            />
            {/* Active Progress Ring */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              className={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Inner 3D Button */}
        <motion.div
          whileHover={!isLocked ? { scale: 1.05 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`flex items-center justify-center w-[70px] h-[70px] rounded-full border-b-[6px] transition-all duration-100 ${buttonColor}`}
        >
          {isLocked ? (
            <Lock className="w-6 h-6 text-hare fill-none" />
          ) : (
            <IconComponent className="w-7 h-7 fill-current" />
          )}
        </motion.div>
      </div>

      {/* Title */}
      <span className="mt-2 text-sm font-extrabold text-eel dark:text-white uppercase tracking-wider">
        {title}
      </span>

      {/* Popovers */}
      <AnimatePresence>
        {isPopoverOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute top-[96px] z-30 w-[260px] bg-white dark:bg-slate-800 border-2 border-swan dark:border-slate-700 rounded-2xl p-4 shadow-xl text-center"
          >
            {/* Popover Arrow */}
            <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 border-t-2 border-l-2 border-swan dark:border-slate-700" />

            {type === "chest" ? (
              <>
                <h4 className="text-lg font-extrabold text-eel dark:text-white mb-1">
                  {isChestClaimed ? "Chest Claimed" : "Treasure Chest!"}
                </h4>
                <p className="text-xs text-wolf dark:text-slate-300 font-bold mb-3">
                  {isChestClaimed ? "You have already collected this reward." : "Open this chest to claim your unit completion reward!"}
                </p>
                <Button
                  variant="gold"
                  fullWidth
                  disabled={isChestClaimed}
                  onClick={handleClaimChest}
                >
                  {isChestClaimed ? "Already Claimed" : "Open (+100 Gems)"}
                </Button>
              </>
            ) : type === "trophy" ? (
              <>
                <h4 className="text-lg font-extrabold text-eel dark:text-white mb-1">
                  Unit Complete!
                </h4>
                <p className="text-xs text-wolf dark:text-slate-300 font-bold mb-3">
                  You conquered this unit! Tap below to view your certificate of accomplishment.
                </p>
                <Button
                  variant="green"
                  fullWidth
                  onClick={() => setIsPopoverOpen(false)}
                >
                  <Check className="w-4 h-4 mr-2" /> Complete
                </Button>
              </>
            ) : (
              <>
                <h4 className="text-lg font-extrabold text-eel dark:text-white mb-1">
                  {title}
                </h4>
                <p className="text-xs text-wolf dark:text-slate-300 font-bold mb-3">
                  Crown {crowns} of {maxCrowns} • Lesson {lessonsCompleted} of {lessonsCount}
                </p>
                <Button
                  variant={status === "legendary" ? "purple" : "green"}
                  fullWidth
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onStartLesson();
                  }}
                >
                  Start +10 XP
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
