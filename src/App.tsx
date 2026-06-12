import React, { useState, useEffect } from "react";
import { 
  Heart, 
  BrainCircuit, 
  Wind, 
  Music, 
  Compass, 
  MessageSquare,
  Sparkles,
  CalendarDays,
  ShieldAlert,
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { MoodCheckIn } from "./components/MoodCheckIn";
import { SelfAssessment } from "./components/SelfAssessment";
import { BreathingMeditation } from "./components/BreathingMeditation";
import { SoundscapeMixer } from "./components/SoundscapeMixer";
import { ZenSandbox } from "./components/ZenSandbox";
import { AISupport } from "./components/AISupport";
import { TestResult, MoodLog } from "./types";

const HEALING_QUOTES = [
  "“允许一切发生，日子缓缓，流水潺潺。” — 顺应心灵的涟漪",
  "“你不必时时刻刻都有力量，软弱和哭泣也是身心排毒的一环。” — 拥抱当下的脆弱",
  "“深呼吸。把这一刻的局促还给世界，把安宁留给自己。” — 呼吸当下",
  "“正如晴空总会有些许阴雨，心灵的小伤口也会在微风中慢慢痊愈。” — 心灵自愈",
  "“慢下来，去走一段路，看一朵花。生活并不总是需要答案。” — 寻觅安宁",
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("mood");
  const [selectedQuote, setSelectedQuote] = useState<string>("");
  const [moodLogCount, setMoodLogCount] = useState<number>(0);
  const [latestAssessment, setLatestAssessment] = useState<TestResult | null>(null);

  // Load numbers and quotes on mount
  useEffect(() => {
    // Select random healing quote
    const randIdx = Math.floor(Math.random() * HEALING_QUOTES.length);
    setSelectedQuote(HEALING_QUOTES[randIdx]);

    refreshAnalyticsData();
  }, [activeTab]);

  const refreshAnalyticsData = () => {
    const savedMoods = localStorage.getItem("oasis_mood_logs");
    if (savedMoods) {
      try {
        const parsed: MoodLog[] = JSON.parse(savedMoods);
        setMoodLogCount(parsed.length);
      } catch (e) {}
    }

    const savedTests = localStorage.getItem("oasis_test_results");
    if (savedTests) {
      try {
        const parsed: TestResult[] = JSON.parse(savedTests);
        if (parsed.length > 0) {
          setLatestAssessment(parsed[0]);
        }
      } catch (e) {}
    }
  };

  const getDayGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 9) return "清晨好，愿您在这片绿洲开启平稳的一天";
    if (hours < 12) return "上午好，若工作感到些许局促，不妨稍微放空";
    if (hours < 18) return "下午好，阳光刚好，伸个懒腰，深呼吸一下吧";
    return "晚安夜明，卸下尘嚣重担，让呼吸和白音轻揉心灵的折痕";
  };

  return (
    <div id="root-container" className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition-colors duration-300">
      
      {/* Top Ribbon Notice */}
      <div className="bg-emerald-600 text-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 py-1.5 px-4 text-[11px] text-center font-medium border-b border-emerald-500/10 flex items-center justify-center gap-1.5 select-none">
        <Heart className="w-3.5 h-3.5 animate-pulse fill-current" />
        <span>涛哥工作室出品 | 心境绿洲 • 心理自我关怀放松工坊 | 所有生理与心理数据均仅保存在您本地，保障隐私安全。</span>
      </div>

      {/* Main Structural Body */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-8">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="p-1 px-2.5 text-[10px] uppercase tracking-wider font-extrabold font-mono bg-emerald-500/10 rounded-full border border-emerald-500/10">
                Oasis of Mind
              </span>
              <span className="p-1 px-2 text-[10px] font-bold bg-amber-500/10 text-amber-600 rounded-md border border-amber-500/10 dark:text-amber-400">
                涛哥工作室
              </span>
              <span className="text-xs text-slate-400 font-mono italic">
                {new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              心境绿洲
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              {getDayGreeting()}
            </p>
          </div>

          {/* Healing Quotes widget */}
          <div className="bg-slate-50 border border-slate-100/80 dark:bg-slate-900/40 dark:border-slate-800/80 p-3.5 px-4 rounded-2xl max-w-md shadow-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
              {selectedQuote}
            </p>
          </div>
        </header>

        {/* Dashboard Statistics summary widget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">心境今日登记数</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-mono block mt-0.5">
              {moodLogCount} <span className="text-xs font-normal text-slate-400">次</span>
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">上次测试日期</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-350 block mt-2 cursor-pointer" onClick={() => setActiveTab("assessment")}>
              {latestAssessment ? new Date(latestAssessment.timestamp).toLocaleDateString() : "无自评记录"}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">上次自评倾向</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-350 block mt-2">
              {latestAssessment ? `${latestAssessment.level} (${latestAssessment.score}分)` : "暂未测试"}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">本地系统安全阻断</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              100% 本地沙盒保护
            </span>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex overflow-x-auto pb-1.5 border-b border-slate-100 dark:border-slate-850 gap-2 scrollbar-none select-none">
          <button
            onClick={() => setActiveTab("mood")}
            className={`px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "mood"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            本日心境记录
          </button>

          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "assessment"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            心理健康筛查
          </button>

          <button
            onClick={() => setActiveTab("breathing")}
            className={`px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "breathing"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
            }`}
          >
            <Wind className="w-4 h-4" />
            心灵呼吸舱
          </button>

          <button
            onClick={() => setActiveTab("sounds")}
            className={`px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "sounds"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
            }`}
          >
            <Music className="w-4 h-4" />
            白噪音合成器
          </button>

          <button
            onClick={() => setActiveTab("zen")}
            className={`px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "zen"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
            }`}
          >
            <Compass className="w-4 h-4" />
            手绘解压沙画
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`px-5 py-3.5 rounded-2xl text-xs font-semibold tracking-wide transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "ai"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white border border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            AI 心理树洞解读
          </button>
        </div>

        {/* Dynamic Display Panels inside the single screen */}
        <main className="transition-all duration-300">
          {activeTab === "mood" && <MoodCheckIn onMoodLogged={refreshAnalyticsData} />}
          {activeTab === "assessment" && <SelfAssessment onTestCompleted={refreshAnalyticsData} />}
          {activeTab === "breathing" && <BreathingMeditation />}
          {activeTab === "sounds" && <SoundscapeMixer />}
          {activeTab === "zen" && <ZenSandbox />}
          {activeTab === "ai" && <AISupport />}
        </main>

        {/* Footer info/notices */}
        <footer className="pt-8 border-t border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
          <p>© 2026 心境绿洲 • 由 涛哥工作室 倾心呈现 • 基于科学测量量表及 procedural Web Audio 声音合成技术</p>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>自评与 AI 建议不可作为医学替代，如严重不舒服请立即找医生获取指导！</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
