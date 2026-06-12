import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smile, Sliders, Calendar, Trash2, ShieldCheck, HeartPulse, ChevronRight, PenTool } from "lucide-react";
import { MoodType, MoodConfig, MoodLog } from "../types";

export const MOOD_CONFIGS: Record<MoodType, MoodConfig> = {
  calm: {
    type: "calm",
    emoji: "😌",
    label: "平静",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50/60 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200/50 dark:border-emerald-900/30",
  },
  joyful: {
    type: "joyful",
    emoji: "☀️",
    label: "喜悦",
    color: "text-amber-500",
    bgColor: "bg-amber-50/60 dark:bg-amber-950/20",
    borderColor: "border-amber-200/50 dark:border-amber-900/30",
  },
  tired: {
    type: "tired",
    emoji: "💤",
    label: "疲惫",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50/60 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200/50 dark:border-indigo-900/30",
  },
  anxious: {
    type: "anxious",
    emoji: "🌪️",
    label: "焦虑",
    color: "text-orange-500",
    bgColor: "bg-orange-50/60 dark:bg-orange-950/20",
    borderColor: "border-orange-200/50 dark:border-orange-900/30",
  },
  melancholy: {
    type: "melancholy",
    emoji: "🌧️",
    label: "低落",
    color: "text-blue-500",
    bgColor: "bg-blue-50/60 dark:bg-blue-950/20",
    borderColor: "border-blue-200/50 dark:border-blue-900/30",
  },
  stressed: {
    type: "stressed",
    emoji: "⚡",
    label: "紧绷",
    color: "text-rose-500",
    bgColor: "bg-rose-50/60 dark:bg-rose-950/20",
    borderColor: "border-rose-200/50 dark:border-rose-900/30",
  },
};

interface MoodCheckInProps {
  onMoodLogged: () => void;
}

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>("calm");
  const [intensity, setIntensity] = useState<number>(5);
  const [note, setNote] = useState<string>("");
  const [history, setHistory] = useState<MoodLog[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("oasis_mood_logs");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse mood logs", e);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MoodLog = {
      id: "mood_" + Date.now(),
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      score: intensity,
      note: note.trim(),
    };

    const updated = [newLog, ...history];
    setHistory(updated);
    localStorage.setItem("oasis_mood_logs", JSON.stringify(updated));
    setNote("");
    onMoodLogged(); // Trigger parent refresh
  };

  const handleDelete = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("oasis_mood_logs", JSON.stringify(updated));
    onMoodLogged();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="mood-section">
      {/* Logger Box */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
            <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">今日心境登记</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              倾听内心的声音，记录这一刻的真实感受
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Mood Icons Grid */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3.5">
              你现在感觉怎么样？
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.values(MOOD_CONFIGS).map((cfg) => {
                const isSelected = selectedMood === cfg.type;
                return (
                  <button
                    key={cfg.type}
                    type="button"
                    onClick={() => setSelectedMood(cfg.type)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      isSelected
                        ? `${cfg.bgColor} ${cfg.borderColor} ring-2 ring-emerald-500/10`
                        : "bg-slate-50/50 border-slate-100 dark:bg-slate-800/20 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-2xl mb-1 filter drop-shadow-sm select-none">{cfg.emoji}</span>
                    <span className={`text-xs font-medium ${isSelected ? "text-slate-800 dark:text-slate-100 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                情绪强烈程度 (1 - 10)
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {intensity}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-2">
              <span>微弱</span>
              <span>中等</span>
              <span>极强烈</span>
            </div>
          </div>

          {/* Diary note */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              写点什么呢？(非必填)
            </label>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="这一刻有发生什么有趣或触动你的事吗？写在这里，只属于你..."
                maxLength={400}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent py-3 px-4 text-sm outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400 resize-none"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {note.length}/400
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl text-sm font-medium transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20 flex justify-center items-center gap-1.5 cursor-pointer leading-none"
          >
            <Smile className="w-4 h-4" />
            登记此刻心境
          </button>
        </form>
      </div>

      {/* History Timeline */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col max-h-[580px]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-slate-400" />
            <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">近期心境轨迹</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md">
            已记录 {history.length} 次
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <p className="text-slate-400 text-sm mb-1">还没有心境历史记录</p>
                <p className="text-slate-300 text-xs text-center max-w-[200px]">
                  在左侧填写第一个状态，慢慢记录生活涟漪吧
                </p>
              </div>
            ) : (
              history.map((log) => {
                const cfg = MOOD_CONFIGS[log.mood] || MOOD_CONFIGS.calm;
                const date = new Date(log.timestamp);
                const formatTime = `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className={`p-4 rounded-2xl border ${cfg.bgColor} ${cfg.borderColor} group relative flex items-start justify-between gap-2`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl filter drop-shadow-sm select-none p-1 bg-white/70 dark:bg-slate-900/40 rounded-xl">
                        {cfg.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            强度: {log.score}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            • {formatTime}
                          </span>
                        </div>
                        {log.note ? (
                          <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 border-l-2 border-slate-300/40 pl-2">
                            {log.note}
                          </div>
                        ) : (
                          <p className="text-[10px] italic text-slate-400 mt-1">未作书面备注</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(log.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                      title="删除记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-50 dark:border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>本地隐私安全：心境数据永久储存在您的浏览器本地，无云端暴露风险。</span>
        </div>
      </div>
    </div>
  );
};
