import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wind, Play, Pause, RotateCcw, Volume2, HelpCircle } from "lucide-react";
import { BreathingPattern, BreathingPhase } from "../types";
import { audioSynth } from "../utils/audioSynth";

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "box",
    name: "箱式呼吸 (Box Breathing)",
    description: "经典 4-4-4-4 节奏。由美国海豹突击队等专业人员广泛用于战胜压力、夺回专注及平息急躁神经。",
    phases: [
      { name: "inhale", duration: 4, instruction: "慢慢吸气，感觉胸腔扩张...", scale: 1.8 },
      { name: "hold1", duration: 4, instruction: "屏住呼吸，安之若素...", scale: 1.8 },
      { name: "exhale", duration: 4, instruction: "徐徐呼气，吹走心中尘埃...", scale: 1.0 },
      { name: "hold2", duration: 4, instruction: "保持空的静止，倾听安宁...", scale: 1.0 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 深度助眠呼吸法",
    description: "由魏尔医学博士独创。通过限制碳氧置换比，如同给大脑神经递质注射一记极强的天然镇静剂，舒缓深度紧绷。",
    phases: [
      { name: "inhale", duration: 4, instruction: "深吸一口气...", scale: 1.8 },
      { name: "hold1", duration: 7, instruction: "屏心静气，让精气交融...", scale: 1.8 },
      { name: "exhale", duration: 8, instruction: "用口徐徐呵气，卸空重负...", scale: 1.0 },
    ],
  },
  {
    id: "equal",
    name: "5-5 等比调律呼吸 (Coherent)",
    description: "简单的 5-5 等比循环，调节心脏自主律动，增加迷走神经张力，令身体机能重拾和谐平滑状态。",
    phases: [
      { name: "inhale", duration: 5, instruction: "静静吸气...", scale: 1.7 },
      { name: "exhale", duration: 5, instruction: "柔和呼气...", scale: 1.0 },
    ],
  },
];

export const BreathingMeditation: React.FC = () => {
  const [selectedPatternId, setSelectedPatternId] = useState<string>("box");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(4); // seconds left in current phase
  const [breathCount, setBreathCount] = useState<number>(0);
  const [audioChimeEnabled, setAudioChimeEnabled] = useState<boolean>(true);

  const timerRef = useRef<any>(null);

  const pattern = BREATHING_PATTERNS.find(p => p.id === selectedPatternId) || BREATHING_PATTERNS[0];
  const currentPhase: BreathingPhase = pattern.phases[currentPhaseIdx];

  // Map phase keys to friendly localized phrases
  const getPhaseNameInChinese = (phaseName: string) => {
    switch (phaseName) {
      case "inhale": return "吸气 (Inhale)";
      case "hold1": return "屏息 (Hold)";
      case "exhale": return "呼气 (Exhale)";
      case "hold2": return "屏息 (Hold)";
      default: return "放松";
    }
  };

  const getPhaseColor = (phaseName: string) => {
    switch (phaseName) {
      case "inhale": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "hold1": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "exhale": return "text-sky-500 bg-sky-500/10 border-sky-500/20";
      case "hold2": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  // Sound cue on transition
  const playTransitionSound = () => {
    if (audioChimeEnabled) {
      // Trigger a light chime
      audioSynth.setVolume("bell", 0.4);
      audioSynth.playBowlChime();
    }
  };

  useEffect(() => {
    if (isActive) {
      // Set initial duration for current phase
      setTimeLeft(currentPhase.duration);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Transition to next phase
            setCurrentPhaseIdx((prevIdx) => {
              const nextIdx = (prevIdx + 1) % pattern.phases.length;
              
              // Increment circular count after completion of full loop
              if (nextIdx === 0) {
                setBreathCount(prevCount => prevCount + 1);
              }
              
              // Trigger gentle transition chime
              playTransitionSound();
              return nextIdx;
            });
            return 1; // dummy placeholder resets in next lifecycle
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, currentPhaseIdx, selectedPatternId]);

  // Sync time when switching phases while running
  useEffect(() => {
    if (isActive) {
      setTimeLeft(currentPhase.duration);
    }
  }, [currentPhaseIdx]);

  // Reset function
  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIdx(0);
    setTimeLeft(pattern.phases[0].duration);
    setBreathCount(0);
  };

  const handleToggle = () => {
    if (!isActive) {
      // Resume or start
      setIsActive(true);
      playTransitionSound();
    } else {
      setIsActive(false);
    }
  };

  const handlePatternChange = (id: string) => {
    setSelectedPatternId(id);
    setIsActive(false);
    setCurrentPhaseIdx(0);
    const selected = BREATHING_PATTERNS.find(p => p.id === id) || BREATHING_PATTERNS[0];
    setTimeLeft(selected.phases[0].duration);
    setBreathCount(0);
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col lg:flex-row gap-8" id="breathing-section">
      {/* Pattern Selector / Description */}
      <div className="lg:w-1/3 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
              <Wind className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">心灵呼吸冥想舱</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                调节气血，镇定自主神经，用几轮呼吸驱走紧张
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              选择呼吸节奏
            </label>
            <div className="flex flex-col gap-2">
              {BREATHING_PATTERNS.map((p) => {
                const isSelected = p.id === selectedPatternId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePatternChange(p.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition focus:outline-none cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium"
                        : "bg-slate-50/50 border-slate-100 hover:bg-slate-100 dark:bg-slate-800/10 dark:border-slate-800/60"
                    }`}
                  >
                    <div className="text-sm font-medium tracking-wide flex items-center justify-between">
                      <span>{p.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">训练小贴士：</p>
            {pattern.description}
          </div>
        </div>

        {/* Chime toggle & metadata */}
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioChimeEnabled(prev => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                audioChimeEnabled
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100/50 dark:bg-slate-800 border-slate-100 dark:border-slate-850 text-slate-400"
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-slate-400 font-medium">钟磬辅助提示音</span>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            今日已完成: <span className="font-bold text-emerald-600 dark:text-emerald-400">{breathCount}</span> 轮
          </div>
        </div>
      </div>

      {/* Animation Stage */}
      <div className="flex-1 bg-slate-50/60 dark:bg-slate-950/15 rounded-3xl border border-slate-100/50 dark:border-slate-850/60 p-6 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
        
        {/* Backdrop visual ambient glow rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <AnimatePresence>
            {isActive && currentPhase.name === "inhale" && (
              <motion.div
                initial={{ width: 100, height: 100, opacity: 0.6 }}
                animate={{ width: 450, height: 450, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: currentPhase.duration, ease: "easeOut" }}
                className="absolute rounded-full border-2 border-emerald-500/10 bg-emerald-500/[0.01]"
              />
            )}
            {isActive && currentPhase.name === "hold1" && (
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[350px] h-[350px] rounded-full border border-amber-500/10 bg-amber-500/[0.01]"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Breathing Circle Container */}
        <div className="relative z-10 w-64 h-64 flex items-center justify-center">
          {/* Outer Breathing Circle */}
          <motion.div
            animate={{
              scale: isActive ? currentPhase.scale : 1.0,
            }}
            transition={{
              duration: isActive ? currentPhase.duration : 1.5,
              ease: "easeInOut",
            }}
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-lg pointer-events-none relative ${
              isActive
                ? currentPhase.name === "inhale"
                  ? "bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 border border-emerald-300/40 ring-8 ring-emerald-500/5"
                  : currentPhase.name === "hold1" || currentPhase.name === "hold2"
                  ? "bg-gradient-to-tr from-amber-500/15 to-orange-500/15 border border-amber-300/40 ring-8 ring-amber-500/5"
                  : "bg-gradient-to-tr from-sky-500/15 to-blue-500/15 border border-sky-300/40 ring-8 ring-sky-500/5"
                : "bg-slate-100 border border-slate-200 ring-8 ring-slate-100/30 dark:bg-slate-800 dark:border-slate-700 dark:ring-slate-800/20"
            }`}
          >
            {/* Center State content */}
            <div className="text-center space-y-1 select-none">
              <span className={`text-[10px] sm:text-xs uppercase font-semibold font-mono tracking-wider ${
                isActive ? getPhaseColor(currentPhase.name).split(" ")[0] : "text-slate-400"
              }`}>
                {isActive ? getPhaseNameInChinese(currentPhase.name) : "准备就绪"}
              </span>

              <div className="text-3xl font-black font-mono text-slate-800 dark:text-slate-100 h-10 flex items-center justify-center">
                {isActive ? timeLeft : "0"}
              </div>

              <span className="text-[10px] text-slate-400 font-medium">
                {isActive ? "秒" : "点击开始"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Subtitle instructions */}
        <div className="h-10 text-center max-w-sm mt-6 z-10">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 italic transition-all">
            {isActive ? currentPhase.instruction : "静坐，挺胸，全身放松，准备好了随时点击下方按钮"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex items-center justify-center gap-3 z-10">
          <button
            onClick={handleReset}
            className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition cursor-pointer"
            title="重算阶段"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggle}
            className={`px-8 py-3.5 font-semibold text-xs tracking-wider uppercase rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer leading-none ${
              isActive
                ? "bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-850"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                暂停冥想
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                开始静心
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
