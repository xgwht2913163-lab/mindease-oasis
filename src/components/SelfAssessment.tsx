import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, ChevronRight, ChevronLeft, RotateCcw, Award, CheckCircle2, History, AlertCircle } from "lucide-react";
import { Questionnaire, Question, TestResult } from "../types";

const PHQ9_SCALE: Questionnaire = {
  id: "phq9",
  title: "PHQ-9 抑郁筛查自评量表",
  subtitle: "Patient Health Questionnaire 9",
  description: "过去两周内，您有多少天感到以下不适？请根据您真实的、最常出现的状态评定。此表可用于抑郁状态评估与自我调理参考。",
  questions: [
    {
      id: 1,
      text: "做事提不起劲或没有兴趣",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 2,
      text: "感到心情低落、沮丧或无望",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 3,
      text: "入睡困难、易醒，或睡得太多",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 4,
      text: "觉得疲倦或没有活力",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 5,
      text: "胃口不好或吃得太多",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 6,
      text: "觉得自己很糟、很失败，或让自己及家人失望",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 7,
      text: "对事物专注有困难，例如读报纸或看电视",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 8,
      text: "行动或说话迟缓，甚至别人都已察觉；或者相反，烦躁不安、动来动去，甚至比平常严重",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 9,
      text: "觉得活着没意思，或有伤害自己的念头",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
  ],
  scoreRanges: [
    {
      min: 0,
      max: 4,
      label: "健康/无抑郁倾向",
      color: "emerald",
      advice: "极好的状态！您目前身心非常开朗，具备优秀的心理弹性。请维持良好的作息规律和开放的生活心态。",
    },
    {
      min: 5,
      max: 9,
      label: "轻度抑郁情绪",
      color: "amber",
      advice: "有点微风吹起烦恼的涟漪。这通常与最近某些短期压力事件、疲惫积压有关。建议进行适当的深呼吸放松、瑜伽或倾诉，不要独自承受情绪重担。",
    },
    {
      min: 10,
      max: 14,
      label: "中度抑郁状态",
      color: "orange",
      advice: "近期的压力可能偏大，负面情绪堆积较多。建议腾出固定时间调整作息，在接下来的日子里多接触大自然。不妨找心理咨询师倾诉排解，协助您打开心结。",
    },
    {
      min: 15,
      max: 27,
      label: "中重度至重度抑郁状态",
      color: "rose",
      advice: "警报拉响。这可能在显著干扰您的学习或起居。请知悉，这并不是您的过错，而是心灵发炎了。强烈推荐您前往综合医院的心理科、精神科寻求专业的心理诊断评估以获取妥当的科学引导与诊疗。",
    },
  ],
};

const GAD7_SCALE: Questionnaire = {
  id: "gad7",
  title: "GAD-7 焦虑筛查自评量表",
  subtitle: "Generalized Anxiety Disorder 7",
  description: "过去两周内，您有多少天受到以下不适的影响？请按您的实际情况为每项评分。用于帮助您辨识日常生活中是否过于处于紧绷、焦虑、担忧中。",
  questions: [
    {
      id: 1,
      text: "感到紧张、焦虑或急躁不安",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 2,
      text: "无法停止或控制担忧",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 3,
      text: "对各种不同的事情担忧过多",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 4,
      text: "难以放松下来",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 5,
      text: "坐立不安，以致无法静坐",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 6,
      text: "容易烦躁或易怒",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
    {
      id: 7,
      text: "害怕会有可怕的事情发生",
      options: [
        { text: "完全没有", score: 0 },
        { text: "有几天", score: 1 },
        { text: "一半以上时间", score: 2 },
        { text: "几乎天天", score: 3 },
      ],
    },
  ],
  scoreRanges: [
    {
      min: 0,
      max: 4,
      label: "平静/无显著焦虑",
      color: "emerald",
      advice: "非常好！您目前的心理耐受力平衡、安宁，能得心应手地掌控工作和日常挑战。继续保持平稳的深呼吸习惯。",
    },
    {
      min: 5,
      max: 9,
      label: "轻度焦虑状态",
      color: "amber",
      advice: "偶尔会有一些紧绷感或神经衰退迹象。建议练习箱式呼吸、放缓生活节奏，避免被过载的信息流裹挟。今晚建议尝试热牛奶、沐浴并聆听白噪音混合声。",
    },
    {
      min: 10,
      max: 14,
      label: "中度焦虑状态",
      color: "orange",
      advice: "神经有些敏感开火。近期焦虑已逐步侵蚀您的注意力分配和生活品质，肌肉持续处于不自然紧张状态。推荐定时进行静坐，或者通过AI心理树洞进行对话、找好朋友痛快谈谈心。",
    },
    {
      min: 15,
      max: 21,
      label: "重度焦虑状态",
      color: "rose",
      advice: "您目前心理承受力严重透支，像快要绷断的琴弦一样异常敏感。强烈不建议自我克制，您需要专业疗法支持。不妨咨询心理辅导师，或在医学专业指导下配合服药，科学缓解植物神经混乱问题。",
    },
  ],
};

interface SelfAssessmentProps {
  onTestCompleted: () => void;
}

export const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onTestCompleted }) => {
  const [activeScale, setActiveScale] = useState<Questionnaire | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [viewingResult, setViewingResult] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem("oasis_test_results");
    if (saved) {
      try {
        setTestHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse test history", e);
      }
    }
  };

  const startTest = (scale: Questionnaire) => {
    setActiveScale(scale);
    setCurrentIdx(0);
    setAnswers({});
    setViewingResult(null);
  };

  const handleSelectAnswer = (questionId: number, score: number) => {
    const updated = { ...answers, [questionId]: score };
    setAnswers(updated);

    // Automatically transition to next question after 250ms for smooth fluid typing
    if (activeScale && currentIdx < activeScale.questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeScale && currentIdx < activeScale.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    if (!activeScale) return;

    // Check if everything is answered
    const unanswered = activeScale.questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert("请确保回答了每一道题哦。");
      return;
    }

    // Sum scores
    const totalScore = (Object.values(answers) as number[]).reduce((acc, val) => acc + val, 0);

    // Map range advice
    const range = activeScale.scoreRanges.find(
      (r) => totalScore >= r.min && totalScore <= r.max
    ) || activeScale.scoreRanges[0];

    // Create result
    const newResult: TestResult = {
      id: "test_" + Date.now(),
      questionnaireId: activeScale.id,
      questionnaireTitle: activeScale.title,
      timestamp: new Date().toISOString(),
      score: totalScore,
      level: range.label,
      color: range.color,
      answers,
    };

    // Save
    const updatedHistory = [newResult, ...testHistory];
    setTestHistory(updatedHistory);
    localStorage.setItem("oasis_test_results", JSON.stringify(updatedHistory));

    setViewingResult(newResult);
    setActiveScale(null);
    onTestCompleted(); // tell parent to refresh any score updates
  };

  const getProgressPercent = () => {
    if (!activeScale) return 0;
    return Math.round((Object.keys(answers).length / activeScale.questions.length) * 100);
  };

  const handleClearHistory = () => {
    if (confirm("确定要清空所有测评历史记录吗？此操作无法恢复。")) {
      localStorage.removeItem("oasis_test_results");
      setTestHistory([]);
      onTestCompleted();
    }
  };

  const getRangeDetails = (result: TestResult) => {
    const scale = result.questionnaireId === "phq9" ? PHQ9_SCALE : GAD7_SCALE;
    return (
      scale.scoreRanges.find((r) => result.score >= r.min && result.score <= r.max) ||
      scale.scoreRanges[0]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm" id="assessment-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl">
            <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">心理健康状态自评</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              采用符合医学标准的自我情绪状态量表，让理解变得精确透彻
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {testHistory.length > 0 && (
            <button
              onClick={() => {
                setShowHistoryModal(true);
                loadHistory();
              }}
              className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 transition flex items-center gap-1.5 cursor-pointer leading-none"
            >
              <History className="w-3.5 h-3.5" />
              查看历史报表 ({testHistory.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="min-h-[300px]">
        {!activeScale && !viewingResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* PHQ9 CARD */}
            <div className="p-6 rounded-2xl border border-emerald-100 hover:border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-950/35 dark:hover:border-emerald-900/50 dark:bg-emerald-950/5 flex flex-col justify-between transition gap-5">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-wider font-semibold font-mono text-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                    抑郁及活力评估
                  </span>
                  <span className="text-xs text-slate-400 font-mono">9 题</span>
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{PHQ9_SCALE.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {PHQ9_SCALE.description}
                </p>
              </div>
              <button
                onClick={() => startTest(PHQ9_SCALE)}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1 cursor-pointer leading-none"
              >
                开始测验
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* GAD7 CARD */}
            <div className="p-6 rounded-2xl border border-indigo-100 hover:border-indigo-200/80 bg-indigo-50/20 dark:border-indigo-950/35 dark:hover:border-indigo-900/50 dark:bg-indigo-950/5 flex flex-col justify-between transition gap-5">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-wider font-semibold font-mono text-indigo-500 bg-indigo-100/50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                    焦虑及紧绷评估
                  </span>
                  <span className="text-xs text-slate-400 font-mono">7 题</span>
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{GAD7_SCALE.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {GAD7_SCALE.description}
                </p>
              </div>
              <button
                onClick={() => startTest(GAD7_SCALE)}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1 cursor-pointer leading-none"
              >
                开始测验
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE TEST FLOW */}
        <AnimatePresence mode="wait">
          {activeScale && (
            <motion.div
              key={activeScale.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto py-4"
            >
              {/* Top info and score progress */}
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="font-semibold text-slate-500 dark:text-slate-400">{activeScale.title}</span>
                <span className="font-mono text-slate-400 font-bold">
                  {currentIdx + 1} / {activeScale.questions.length}
                </span>
              </div>
              
              {/* Linear Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / activeScale.questions.length) * 100}%` }}
                />
              </div>

              {/* Single Question Display */}
              <div className="min-h-[200px]" key={currentIdx}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                    {activeScale.questions[currentIdx].text}
                  </h3>

                  <div className="space-y-3">
                    {activeScale.questions[currentIdx].options.map((opt, oIdx) => {
                      const isSelected = answers[activeScale.questions[currentIdx].id] === opt.score;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(activeScale.questions[currentIdx].id, opt.score)}
                          className={`w-full text-left py-4 px-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer focus:ring-1 focus:ring-indigo-500/20 ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                              : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/50 dark:bg-slate-800/20 dark:border-slate-800/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className="text-sm">{opt.text}</span>
                          <span className="text-[10px] uppercase font-semibold font-mono tracking-wider opacity-60">
                            +{opt.score} 分
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Controls Footer */}
              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/60 flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIdx === 0}
                  className={`px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 transition flex items-center gap-1 cursor-pointer leading-none disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                  上一步
                </button>

                {currentIdx < activeScale.questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={answers[activeScale.questions[currentIdx].id] === undefined}
                    className={`px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer leading-none disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    下一步
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={answers[activeScale.questions[currentIdx].id] === undefined}
                    className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-xs tracking-wide transition flex items-center gap-1.5 cursor-pointer leading-none disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    递交量表评估
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS PAGE */}
        <AnimatePresence mode="wait">
          {viewingResult && (() => {
            const range = getRangeDetails(viewingResult);
            return (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto py-4 text-center space-y-6"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-full mb-3">
                    <Award className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">测评完成</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{viewingResult.questionnaireTitle}</p>
                </div>

                <div className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Arc/Score bubble */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 shadow-inner">
                      <div className="text-center">
                        <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block font-mono">
                          {viewingResult.score}
                        </span>
                        <span className="text-[10px] text-slate-400 tracking-wider">分</span>
                      </div>
                    </div>
                  </div>

                  {/* Level text and warnings */}
                  <div className="text-left flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">评评估结论:</span>
                      <span className={`text-sm font-bold bg-${range.color}-500/10 text-${range.color}-600 dark:text-${range.color}-400 px-2.5 py-1 rounded-lg border border-${range.color}-500/20`}>
                        {viewingResult.level}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed py-1.5">
                      {range.advice}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-300" />
                      <span>
                        声明：自评量表结果不能代替正规医院医生医学诊断。若您遭受显着且持续的主观痛苦，请遵循专业诊疗意见。
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setViewingResult(null)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-1.5 cursor-pointer leading-none"
                  >
                    返回测量选择
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* HISTORY MODAL / VIEW TIMELINE */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800/60 z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">测评历史归档</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 px-2.5 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer"
                >
                  关闭
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {testHistory.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8">暂无历史测评存档</p>
                ) : (
                  testHistory.map((result) => {
                    const range = getRangeDetails(result);
                    const formattedTime = new Date(result.timestamp).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={result.id}
                        className="p-4 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 relative flex justify-between items-start gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                              {result.questionnaireId === "phq9" ? "抑郁测试 (PHQ-9)" : "焦虑测试 (GAD-7)"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{formattedTime}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                              {result.score}{" "}
                              <span className="text-[10px] font-normal text-slate-400">分</span>
                            </span>
                            <span className={`text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md`}>
                              评估: {result.level}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed bg-white/40 dark:bg-slate-900/30 p-2 rounded-lg">
                            {range.advice.slice(0, 75)}...
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {testHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/60 flex justify-between">
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 duration-150 rounded-lg cursor-pointer"
                  >
                    清空测评存档
                  </button>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    确定
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
