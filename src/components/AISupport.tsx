import React, { useState, useEffect } from "react";
import { MessageSquare, Sparkles, Send, RefreshCw, AlertCircle, HelpCircle, HeartHandshake, ShieldCheck } from "lucide-react";
import { TestResult, MoodLog } from "../types";

export const AISupport: React.FC = () => {
  const [ventText, setVentText] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [latestTest, setLatestTest] = useState<TestResult | null>(null);

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
          <li key={idx} className="ml-5 list-disc text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-1">
            {content}
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
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

          <form onSubmit={handleVentingSubmit} className="space-y-4 pt-2">
            <div className="relative">
              <textarea
                value={ventText}
                onChange={(e) => setVentText(e.target.value)}
                placeholder="在此处写下倾诉或正在折磨您的事情... （例如：'最近项目压力大得合不上眼，总是很焦虑...'）"
                rows={6}
                maxLength={1000}
                className="w-full rounded-2xl border border-slate-250 dark:border-slate-800 bg-transparent py-4 px-5 text-sm outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400/80 resize-none leading-relaxed"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono">
                {ventText.length} / 1000 字
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !ventText.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl text-xs font-semibold tracking-wider transition shadow-md shadow-indigo-600/10 flex justify-center items-center gap-1.5 cursor-pointer leading-none disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              倾诉并获取陪伴回复
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
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 dark:border-rose-950/25 dark:bg-rose-950/5 p-4 flex gap-3 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">接口响应出错：</p>
                  <p className="text-[11px] mb-2">{errorMessage}</p>
                  <p className="text-[10px] text-slate-400">
                    请在右上角 Settings &gt; Secrets 面板中检查是否定义了有效的 <b>GEMINI_API_KEY</b>。
                  </p>
                </div>
              </div>
            ) : report ? (
              <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs h-full overflow-y-auto">
                {renderFormattedText(report)}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4 shadow-xs">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-400 text-xs mb-1 font-semibold">静候心声</p>
                <p className="text-[10px] text-slate-400 text-center max-w-[250px]">
                  左侧输入您的心声，或者选择点击下方测试解读。温暖和科学的自养攻略，从这里开启。
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
