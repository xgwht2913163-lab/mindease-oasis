import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle, 
  HeartHandshake, 
  ShieldCheck,
  Heart,
  Compass,
  Smile,
  FileText,
  Layers,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from "lucide-react";
import { TestResult, MoodLog } from "../types";

export const AISupport: React.FC = () => {
  const [ventText, setVentText] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [latestTest, setLatestTest] = useState<TestResult | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "letter">("card");
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    loadLatestData();
  }, []);

  const loadLatestData = () => {
    const testsSaved = localStorage.getItem("oasis_test_results");
    if (testsSaved) {
      try {
        const parsed: TestResult[] = JSON.parse(testsSaved);
        if (parsed.length > 0) {
          // Get the latest completed scale
          setLatestTest(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load test reports", e);
      }
    }
  };

  // Safe split parser to render basic markdown bold and bullet lists elegantly
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Bullet points
      const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ");
      if (isBullet) {
        trimmed = trimmed.replace(/^[-*•]\s+/, "");
      }

      // Format bold characters (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(trimmed.slice(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-800 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < trimmed.length) {
        parts.push(trimmed.slice(lastIndex));
      }

      const content = parts.length > 0 ? parts : trimmed;

      if (isBullet) {
        return (
          <li key={idx} className="ml-6 list-disc text-base md:text-[17px] text-slate-700 dark:text-slate-205 leading-relaxed mb-2.5">
            {content}
          </li>
        );
      }

      return (
        <p key={idx} className="text-base md:text-[17px] text-slate-705 dark:text-slate-200 leading-relaxed md:leading-loose mb-4 font-normal text-justify">
          {content}
        </p>
      );
    });
  };

  // Handle Treehole Vent Request
  const handleVentingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventText.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    setReport("");

    try {
      // Gather mood context from local storage if available to feed Gemini richer context
      let moodNotes = "";
      const savedMoods = localStorage.getItem("oasis_mood_logs");
      if (savedMoods) {
        const moods: MoodLog[] = JSON.parse(savedMoods);
        if (moods.length > 0) {
          moodNotes = `近期登记的心境常常是：${moods.slice(0, 3).map(m => m.mood).join(", ")}`;
        }
      }

      const sysPrompt = "你是一位极度温柔、高情商、富有同理心的线上专业心理治疗辅导员。你善于倾听、共情、轻抚焦虑。倾听用户的倾诉并给出回应：\n" +
        "1. 使用高度包容、温暖且不评判的语言共情用户。\n" +
        "2. 给予心灵按摩，分配合理压力，切绝对不要采用干燥死板、老气横秋的说教。\n" +
        "3. 在回复末尾贴心地为他们提供1-2个适宜的日常减压行动小练习。(例如：深吸清泉、喝一杯温水，写一页小本子)\n" +
        "4. 排版清晰，层次分明，逻辑温婉，多空行使阅读舒缓。";

      const userMessage = `用户对你倾诉说：“${ventText}”。${moodNotes ? `\n辅助背景心境：${moodNotes}` : ""}`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: sysPrompt, userMessage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "请求 AI 接口时失败");
      }

      setReport(data.text);
      setVentText("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "无法连接至 AI 心境绿洲，请检查网络或在 Secrets 中配置 API Key。");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle score report generation
  const handleGenerateReport = async () => {
    if (!latestTest) return;

    setIsLoading(true);
    setErrorMessage("");
    setReport("");

    try {
      const isPhq = latestTest.questionnaireId === "phq9";
      
      const sysPrompt = "你是一位专业的临床心理学家和温暖的身心调律顾问。请为用户提供一份极其优雅、鼓励性强、细致周全的心理自评报告解读与痊愈方案。\n" +
        "你的语气应该是：温柔开朗、给予笃定信心、具有实操指导意义。\n" +
        "报告框架请分段撰写（用 **标题** 加粗）：\n" +
        "1. **【暖心共情】**：对用户的当前自评得分，隔空递上一个心理拥抱，消解羞耻感，让他们明白感到累或烦并非过错。\n" +
        "2. **【身心评估建议】**：分析得分背后代表的身心疲惫、大脑紧绷程度。\n" +
        "3. **【专属调律练习】**：专门针对当前情况规划一套日常运动或呼吸运动：\n" +
        "   - 若是抑郁值（PHQ-9）高，推荐活化机能，比如日光足浴、5步微步行；\n" +
        "   - 若是焦虑值（GAD-7）高，推荐定息镇静，比如箱式呼吸、白噪音热沐浴。\n" +
        "4. **【治愈寄语】**：简短极美的诗意拥抱。";

      const userMessage = `用户刚刚完成了一门学术心理自评：\n` +
        `量表名称：${latestTest.questionnaireTitle}\n` +
        `所得总分：${latestTest.score} 分\n` +
        `属于程度：${latestTest.level}\n` +
        `请为他撰写专属解读汇报与痊愈方案。`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: sysPrompt, userMessage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "请求 AI 接口时失败");
      }

      setReport(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "请求 AI 解读时出错。");
    } finally {
      setIsLoading(false);
    }
  };

  // Smartly parses a full feedback report/letter into three humanized progressive steps:
  // Step 0: Warm Resonance (💖 Sympathy / Core warm resonance)
  // Step 1: Mind Analysis (🌿 Deep wisdom & advice)
  // Step 2: Daily Remedy Action (✨ Micro exercises/solutions)
  const getHealingBlocks = (text: string) => {
    if (!text) return { intro: "", insight: "", exercises: "" };
    
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    
    const introLines: string[] = [];
    const insightLines: string[] = [];
    const exerciseLines: string[] = [];
    
    let currentSec: "intro" | "insight" | "exercise" = "intro";
    
    for (const line of lines) {
      const isExerciseHeader = 
        line.includes("日常减压") || 
        line.includes("练习") || 
        line.includes("行动") || 
        line.includes("自养") || 
        line.includes("建议") || 
        line.includes("习惯") || 
        line.includes("你可以试着") ||
        line.startsWith("3.") ||
        line.startsWith("4.") ||
        line.includes("专属调律") ||
        line.includes("小贴士") ||
        line.includes("治愈寄语") ||
        line.includes("【专属") ||
        line.includes("【治愈") ||
        line.includes("★");
        
      const isInsightHeader = 
        line.includes("身心评估") || 
        line.includes("评测建议") || 
        line.includes("分析得分") || 
        line.includes("思考情绪") || 
        line.startsWith("2.") ||
        line.includes("【身心") ||
        line.includes("压力等级");

      if (isExerciseHeader) {
        currentSec = "exercise";
      } else if (isInsightHeader) {
        currentSec = "insight";
      }
      
      if (currentSec === "intro") {
        introLines.push(line);
      } else if (currentSec === "insight") {
        insightLines.push(line);
      } else {
        exerciseLines.push(line);
      }
    }
    
    // Fallback if not nicely segmented
    if (insightLines.length === 0 && exerciseLines.length === 0) {
      const third = Math.ceil(lines.length / 3);
      return {
        intro: lines.slice(0, third).join("\n"),
        insight: lines.slice(third, third * 2).join("\n"),
        exercises: lines.slice(third * 2).join("\n"),
      };
    }
    
    return {
      intro: introLines.join("\n"),
      insight: insightLines.length > 0 ? insightLines.join("\n") : "静下心来，接纳身体中流淌的焦虑与疲惫，感受这一刻的平息...",
      exercises: exerciseLines.length > 0 ? exerciseLines.join("\n") : "• 找一个舒适的位置进行深呼吸。\n• 闭上眼，喝一杯温水，放松紧绷的神经。"
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="ai-section">
      {/* Vent Treehole Area */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">AI 心理暖心树洞</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                这里是一片无人的、绝对包容的安全林。您可以安全倾斜所有的忧愁与不安
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            不论是工作遇到了挫折、感情陷入了晦暗，还是找不到生活的方向，只管大方写下。
            AI 树洞辅导师将静静倾听，为您编织抚慰、鼓舞心灵的文字涟漪。
          </p>

          {/* Quick preset venting prompts */}
          <div className="space-y-2.5">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
              💡 快速导入心声模板
            </span>
            <div className="flex flex-wrap gap-2.5">
              {[
                "最近压力太大太闷了，脑子一刻也静不下来...",
                "总觉得有些迷茫焦虑，什么事都提不起兴致...",
                "沟通有些压抑局促，不知可以和谁吐露心声...",
                "晚上躺在床上总会胡思乱想，陷入内耗失眠..."
              ].map((txt) => (
                <button
                  key={txt}
                  type="button"
                  onClick={() => setVentText(txt)}
                  className="px-3.5 py-2 text-xs md:text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-350 dark:hover:text-amber-350 bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-xl transition cursor-pointer text-left focus:outline-none leading-relaxed"
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleVentingSubmit} className="space-y-4 pt-2">
            <div className="relative">
              <textarea
                value={ventText}
                onChange={(e) => setVentText(e.target.value)}
                placeholder="在此处写下倾倾心声或正在折磨您的烦恼... （例如：'最近项目压力很大，睡眠开始变得不规律了，总觉得特别无助...'）"
                rows={6}
                maxLength={1000}
                className="w-full rounded-2xl border border-slate-250 dark:border-slate-800 bg-transparent py-4 px-5 text-sm sm:text-base outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400/80 resize-none leading-relaxed"
              />
              <span className="absolute bottom-3 right-4 text-xs text-slate-400 font-mono">
                {ventText.length} / 1000 字
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !ventText.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-bold tracking-wider transition shadow-md shadow-indigo-600/10 flex justify-center items-center gap-1.5 cursor-pointer leading-none disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              吐露心声 • 获取温润科学陪伴回复
            </button>
          </form>
        </div>

        {/* Dynamic Analysis for scores */}
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-500 dark:text-slate-400">最新测试报告智能解读</span>
            </div>
            <button
              onClick={loadLatestData}
              className="p-1 px-1.5 text-[10px] flex items-center gap-1 border border-slate-100 hover:bg-slate-50 rounded text-slate-400 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              刷新
            </button>
          </div>

          {latestTest ? (
            <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-slate-850/40 border border-indigo-100/40 dark:border-slate-800 flex justify-between items-center gap-3">
              <div>
                <p className="text-[10px] text-slate-400">
                  检测到您 {new Date(latestTest.timestamp).toLocaleDateString()} 完成的评估：
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                  {latestTest.questionnaireTitle} • 得分 {latestTest.score}（{latestTest.level}）
                </p>
              </div>
              
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="px-4 py-2 flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 text-white active:bg-indigo-700 font-semibold rounded-xl text-[10px] duration-150 flex items-center gap-1 cursor-pointer leading-none disabled:cursor-not-allowed"
              >
                生成智能分析报表
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 text-center text-[10px] leading-relaxed text-slate-400">
              完成一次上面的“专业心理自评”后，即可在此处通过 AI 深度解读，获取专属身心全方位自理恢复方案喔。
            </div>
          )}
        </div>
      </div>

      {/* Response Display Box */}
      <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
        <div className="flex-1 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4.5 h-4.5 text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI 暖意指点中心</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {isLoading ? "编制回复中..." : report ? "已生成方案" : "静待倾听"}
            </span>
          </div>

          <div className="flex-1 py-4 overflow-y-auto max-h-[400px] scrollbar-thin">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="relative flex justify-center items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <Sparkles className="w-5 h-5 text-amber-400 absolute animate-pulse" />
                </div>
                <div className="space-y-1.5 pt-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 animate-pulse">
                    AI 咨询辅导师正在听取心声并梳理调养报告...
                  </p>
                  <p className="text-[10px] text-slate-400">
                    这通常需要 10 - 20 秒，请趁此时机深深地呼一口气，静静等候。
                  </p>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 dark:border-rose-950/30 dark:bg-rose-950/5 p-4 flex gap-3 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1.5 text-rose-700 dark:text-rose-350">接口连接温馨提示：</p>
                  <p className="text-[11px] whitespace-pre-line text-slate-650 dark:text-slate-300 leading-relaxed mb-2">{errorMessage}</p>
                  <p className="text-[10px] text-slate-400 hover:text-slate-500 transition">
                    如需申请免费的官方 Google AI/Gemini 密钥，可前往官方 Google AI Studio (aistudio.google.com) 免费申请。
                  </p>
                </div>
              </div>
            ) : report ? (
              (() => {
                const blocks = getHealingBlocks(report);
                return (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    {/* Mode selector switch */}
                    <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-900 border border-slate-250/30 dark:border-slate-800 rounded-xl">
                      <button
                        onClick={() => setViewMode("card")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                          viewMode === "card"
                            ? "bg-white dark:bg-slate-800 shadow-xs text-indigo-750 dark:text-indigo-400"
                            : "text-slate-400 hover:text-slate-650 dark:text-slate-500"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        分步卡片疗愈 (温暖渐长)
                      </button>
                      <button
                        onClick={() => setViewMode("letter")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                          viewMode === "letter"
                            ? "bg-white dark:bg-slate-800 shadow-xs text-indigo-750 dark:text-indigo-400"
                            : "text-slate-400 hover:text-slate-650 dark:text-slate-500"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        一键展开整信纸
                      </button>
                    </div>

                    {viewMode === "card" ? (
                      <div className="space-y-4">
                        {/* Interactive Timeline Tabs */}
                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl">
                          <button
                            onClick={() => setActiveStep(0)}
                            className={`py-2 px-1 text-center rounded-lg text-[10px] md:text-xs font-semibold leading-none flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              activeStep === 0
                                ? "bg-rose-500/10 text-rose-750 border border-rose-200/10 dark:text-rose-405 dark:bg-rose-950/20 font-bold"
                                : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${activeStep === 0 ? "scale-110 fill-rose-500 text-rose-550" : ""}`} />
                            <span>01. 暖心拥抱</span>
                          </button>
                          <button
                            onClick={() => setActiveStep(1)}
                            className={`py-2 px-1 text-center rounded-lg text-[10px] md:text-xs font-semibold leading-none flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              activeStep === 1
                                ? "bg-blue-500/10 text-blue-750 border border-blue-200/10 dark:text-blue-400 dark:bg-blue-950/20 font-bold"
                                : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                            }`}
                          >
                            <Compass className={`w-3.5 h-3.5 ${activeStep === 1 ? "scale-110" : ""}`} />
                            <span>02. 身心调律</span>
                          </button>
                          <button
                            onClick={() => setActiveStep(2)}
                            className={`py-2 px-1 text-center rounded-lg text-[10px] md:text-xs font-semibold leading-none flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              activeStep === 2
                                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200/10 dark:text-emerald-405 dark:bg-emerald-950/20 font-bold"
                                : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                            }`}
                          >
                            <Smile className={`w-3.5 h-3.5 ${activeStep === 2 ? "scale-110 fill-emerald-500 text-emerald-550px" : ""}`} />
                            <span>03. 能量日常</span>
                          </button>
                        </div>

                        {/* Card Component Stage */}
                        <div className="transition-all duration-300">
                          {activeStep === 0 && (
                            <div className="bg-gradient-to-b from-rose-50/20 via-white to-rose-20/10 dark:from-rose-950/5 dark:via-slate-900/60 dark:to-rose-950/3 border border-rose-100/50 dark:border-rose-950/20 p-5 md:p-6 rounded-2xl shadow-xs space-y-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 border-b border-rose-100/20 pb-2">
                                <Heart className="w-4 h-4 fill-rose-500 animate-pulse text-rose-550" />
                                <span>【暖心共鸣】 隔空递上一个心理拥抱</span>
                              </div>
                              <div className="max-h-[285px] overflow-y-auto pr-1 text-justify scrollbar-thin">
                                {renderFormattedText(blocks.intro)}
                              </div>
                            </div>
                          )}

                          {activeStep === 1 && (
                            <div className="bg-gradient-to-b from-blue-50/20 via-white to-blue-20/10 dark:from-blue-950/5 dark:via-slate-900/60 dark:to-blue-950/3 border border-blue-100/50 dark:border-blue-950/20 p-5 md:p-6 rounded-2xl shadow-xs space-y-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 border-b border-blue-100/20 pb-2">
                                <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
                                <span>【智能评估建议】 专属深度身心舒缓调频</span>
                              </div>
                              <div className="max-h-[285px] overflow-y-auto pr-1 text-justify scrollbar-thin">
                                {renderFormattedText(blocks.insight)}
                              </div>
                            </div>
                          )}

                          {activeStep === 2 && (
                            <div className="bg-gradient-to-b from-emerald-50/20 via-white to-emerald-20/10 dark:from-emerald-950/5 dark:via-slate-900/60 dark:to-emerald-950/3 border border-emerald-100/50 dark:border-emerald-950/20 p-5 md:p-6 rounded-2xl shadow-xs space-y-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 border-b border-emerald-100/20 pb-2">
                                <Smile className="w-4 h-4 text-emerald-500 font-bold" />
                                <span>【专属减压行动】 精选自养生活小练习</span>
                              </div>
                              <div className="max-h-[285px] overflow-y-auto pr-1 text-justify scrollbar-thin">
                                {renderFormattedText(blocks.exercises)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Navigation controls within block */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                            disabled={activeStep === 0}
                            className="px-3 py-1.5 text-[11px] font-bold tracking-wide rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer flex items-center gap-1 select-none"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            前一步
                          </button>

                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeStep === 0 ? "bg-rose-500 scale-125" : "bg-slate-300"}`} />
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeStep === 1 ? "bg-blue-500 scale-125" : "bg-slate-300"}`} />
                            <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeStep === 2 ? "bg-emerald-500 scale-125" : "bg-slate-300"}`} />
                          </div>

                          {activeStep < 2 ? (
                            <button
                              onClick={() => setActiveStep(prev => Math.min(2, prev + 1))}
                              className="px-4 py-2 text-[11px] font-bold text-indigo-750 bg-indigo-50/80 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 rounded-xl transition duration-155 cursor-pointer flex items-center gap-1 select-none"
                            >
                              {activeStep === 0 ? "读完拥抱了，看身心建议" : "了解啦，带我去看看日常练习"}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setViewMode("letter");
                              }}
                              className="px-4 py-2 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition duration-150 cursor-pointer flex items-center gap-1 select-none shadow-md shadow-indigo-500/10 animate-pulse"
                            >
                              查看整篇信笺寄语
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Elegant stationary paper letter mode */
                      <div className="bg-amber-50/10 dark:bg-slate-900/30 border border-amber-200/20 dark:border-slate-850 p-6 md:p-8 rounded-2xl shadow-xs relative overflow-hidden flex flex-col space-y-4">
                        <div className="absolute inset-0 pointer-events-none bg-grid-slate-100/[0.03] dark:bg-grid-slate-950/[0.03]" />
                        
                        <div className="flex items-center justify-between border-b border-indigo-150/10 dark:border-slate-800 pb-3 z-10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            ✉️ 绿洲辅导室 · 专属暖心手札
                          </span>
                          <button 
                            onClick={() => setViewMode("card")}
                            className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            返回进度卡片模式
                          </button>
                        </div>

                        <div className="overflow-y-auto max-h-[345px] pr-2 scrollbar-thin text-justify leading-relaxed z-10">
                          {renderFormattedText(report)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4 shadow-xs">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-400 text-xs mb-1 font-semibold">静候心声</p>
                <p className="text-[10px] text-slate-400 text-center max-w-[250px]">
                  左侧输入您的心声，或者选择点击下方自评测试解读。温暖和科学的自养攻略，从这里开启。
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>保密声明：您的树洞倾诉及测试得分为临时传输分析，不存储任何云端，时刻守护心理隐私安全。</span>
        </div>
      </div>
    </div>
  );
};
