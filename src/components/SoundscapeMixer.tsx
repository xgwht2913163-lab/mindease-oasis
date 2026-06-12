import React, { useState, useEffect, useRef } from "react";
import { Sliders, Volume2, Music, Anchor, Disc, Wind, Heart, Play, Square, Timer, Waves } from "lucide-react";
import { audioSynth } from "../utils/audioSynth";

interface SoundTrack {
  id: "solfeggio" | "binaural" | "noise" | "bell";
  name: string;
  subtitle: string;
  icon: any;
  color: string;
  description: string;
}

const SOUNDS_REGISTRY: SoundTrack[] = [
  {
    id: "solfeggio",
    name: "528Hz 舒缓古磬 (Solfeggio Resonance)",
    subtitle: "修愈音频 • 宁神静气",
    icon: Anchor,
    color: "from-emerald-500 to-teal-500",
    description: "古老修复音律。和谐的正弦正波 drone 辅以平滑频率偏移，有助于消除疲惫，轻拂紧迫局促的心神。",
  },
  {
    id: "binaural",
    name: "双耳专注脑波 (8Hz Alpha Wave)",
    subtitle: "双耳节拍 • 沉浸入定",
    icon: Waves,
    color: "from-sky-500 to-indigo-500",
    description: "通过左右声道分别输入 140Hz 与 148Hz 纯音，在脑海中心理合成 8Hz 低频阿尔法节拍，引导进入冥想频率。（推荐使用耳机）",
  },
  {
    id: "noise",
    name: "深海微风呼吸 (Modulated Brown Noise)",
    subtitle: "褐燥白音 • 助眠放松",
    icon: Wind,
    color: "from-teal-600 to-blue-500",
    description: "定制改良褐噪音。叠加超低频 LFO 调制滤波，创造起伏徐降的深海波涛与微风潮汐律动，完美遮蔽现实环境杂音。",
  },
  {
    id: "bell",
    name: "藏地悠扬金属钵 (Periodic Tibetan Bowl)",
    subtitle: "古老磬响 • 定时疗愈",
    icon: Disc,
    color: "from-amber-500 to-orange-500",
    description: "定频击磬，清越之声在空气中久久回响（每隔 15 秒触发一次）。用于练习中维持对当下的正念觉知，惊破游丝幻想。",
  },
];

export const SoundscapeMixer: React.FC = () => {
  const [channels, setChannels] = useState<Record<string, number>>({
    solfeggio: 0,
    binaural: 0,
    noise: 0,
    bell: 0,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const countdownIntervalRef = useRef<any>(null);

  // Read current levels on mount
  useEffect(() => {
    const fresh: Record<string, number> = {};
    SOUNDS_REGISTRY.forEach((s) => {
      fresh[s.id] = audioSynth.getVolume(s.id);
    });
    setChannels(fresh);
    setIsPlaying(Object.values(fresh).some((vol) => vol > 0));
  }, []);

  // Sleep timer interval
  useEffect(() => {
    if (secondsRemaining !== null && isPlaying) {
      if (secondsRemaining <= 0) {
        handleStopAll();
        setSleepTimerMinutes(null);
        setSecondsRemaining(null);
      } else {
        countdownIntervalRef.current = setTimeout(() => {
          setSecondsRemaining(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      }
    } else {
      clearTimeout(countdownIntervalRef.current);
    }

    return () => clearTimeout(countdownIntervalRef.current);
  }, [secondsRemaining, isPlaying]);

  const handleVolumeChange = (id: "solfeggio" | "binaural" | "noise" | "bell", val: number) => {
    audioSynth.setVolume(id, val);
    
    const updated = { ...channels, [id]: val };
    setChannels(updated);

    const active = Object.values(updated).some((v: any) => (v as number) > 0);
    setIsPlaying(active);
  };

  const handleStopAll = () => {
    audioSynth.stopAll();
    setChannels({ solfeggio: 0, binaural: 0, noise: 0, bell: 0 });
    setIsPlaying(false);
    setSleepTimerMinutes(null);
    setSecondsRemaining(null);
  };

  const handleSetTimer = (min: number | null) => {
    setSleepTimerMinutes(min);
    if (min === null) {
      setSecondsRemaining(null);
    } else {
      setSecondsRemaining(min * 60);
      // If nothing is playing, play some default relaxation drones
      if (!isPlaying) {
        // default play some solfeggio and deep waves
        handleVolumeChange("solfeggio", 0.4);
        handleVolumeChange("noise", 0.35);
      }
    }
  };

  const formatTimerString = () => {
    if (secondsRemaining === null) return "";
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col xl:flex-row gap-8" id="soundscape-section">
      {/* Introduction Side */}
      <div className="xl:w-1/3 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-2xl">
              <Music className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">白噪音混合合成器</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                专为压力舒缓、睡眠障碍与深度疗愈而设计的声音配方
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl">
            此模块采用浏览器内置的 <b>Web Audio API</b>。这些疗愈之音并非录音重放，而是由代码模拟物理波动数学公式实时合成。
            您可以随心所欲增减各自的比重，调试出适合您个人的专属疗愈心流音场。
          </p>
        </div>

        {/* Master power / sleep timer options */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          {/* Quick countdown selections */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                自动定时关闭器
              </span>
              {secondsRemaining !== null && (
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                  {formatTimerString()}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 20, 30, 45, 60].map((t) => {
                const isActive = sleepTimerMinutes === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleSetTimer(isActive ? null : t)}
                    className={`py-1.5 rounded-lg text-[10px] font-medium font-mono border transition focus:outline-none cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-slate-50/50 hover:bg-slate-100 border-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-slate-850 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {t}分
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Kill Switch */}
          {isPlaying && (
            <button
              onClick={handleStopAll}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-100/50 dark:border-rose-950/40"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              一键关闭所有声音
            </button>
          )}
        </div>
      </div>

      {/* Control Mixer Rails */}
      <div className="flex-1 space-y-4">
        {SOUNDS_REGISTRY.map((track) => {
          const vol = channels[track.id] || 0;
          const isActive = vol > 0;
          const IconComponent = track.icon;

          return (
            <div
              key={track.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                isActive
                  ? "bg-slate-50/50 dark:bg-slate-850/25 border-slate-150 dark:border-slate-800"
                  : "bg-white dark:bg-transparent border-slate-100 dark:border-slate-850"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${track.color} text-white shadow-sm flex-shrink-0`}>
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {track.name}
                      {isActive && (
                        <span className="flex items-center gap-0.5" title="正在合成播放">
                          <span className="w-1 h-3.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                          <span className="w-1 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{track.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-[10px] text-slate-400 font-mono font-bold select-none min-w-[32px] text-right">
                    {Math.round(vol * 100)} %
                  </span>
                </div>
              </div>

              {/* Slider rail */}
              <div className="flex items-center gap-3">
                <Volume2 className={`w-4 h-4 ${isActive ? "text-slate-600 dark:text-slate-350" : "text-slate-300"}`} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vol * 100}
                  onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value) / 100)}
                  className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-100 dark:bg-slate-800 accent-emerald-500`}
                />
              </div>

              <p className="text-[10px] text-slate-400/80 dark:text-slate-500/85 mt-2 leading-relaxed">
                {track.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
