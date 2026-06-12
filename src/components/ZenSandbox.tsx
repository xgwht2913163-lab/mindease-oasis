import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Trash2, Info, Compass, HelpCircle } from "lucide-react";

interface SandboxConfig {
  id: "sand" | "water" | "cosmos";
  name: string;
  color: string;
  description: string;
}

const SANDBOX_MODES: SandboxConfig[] = [
  {
    id: "sand",
    name: "观砂 (Sanded Trails)",
    color: "#E2E8F0",
    description: "模拟日式枯山水描摹。划过沙地留下一缕缕质朴的金沙细痕，并慢慢被海风抹平（回归虚无）。",
  },
  {
    id: "water",
    name: "涟漪 (Ink Ripples)",
    color: "#0D9488",
    description: "墨池水波。在寂静清虚的水面点起徐徐扩放的淡墨涟漪，观照内心妄念自生自灭的过程。",
  },
  {
    id: "cosmos",
    name: "星尘 (Cosmic Dust)",
    color: "#F59E0B",
    description: "星云散落。描摹出一串串跃动闪烁的恒星星尘，自指尖流泻并慢慢溶于静谧深邃的宇宙夜空中。",
  },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

export const ZenSandbox: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"sand" | "water" | "cosmos">("sand");
  const [touchDrawEnabled, setTouchDrawEnabled] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchDrawEnabledRef = useRef<boolean>(true);

  // Keep ref synchronized to prevent any React closure stale state inside event listeners
  useEffect(() => {
    touchDrawEnabledRef.current = touchDrawEnabled;
  }, [touchDrawEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fluid resize observer setup
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;

        // Clear and draw background
        ctx.fillStyle = "#0F172A"; // deep slate-900 background
        ctx.fillRect(0, 0, width, height);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Animation Loop
    let animationId: number;
    const tick = () => {
      // Draw backdrop with a slight alpha to create motion trails for the water/sand draw
      ctx.fillStyle = activeMode === "water" 
        ? "rgba(15, 23, 42, 0.08)" // longer trails for water
        : "rgba(15, 23, 42, 0.15)"; // rapid fade for sandbox
      
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (activeMode === "sand") {
          // Draw soft glowing grainy sand texture
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fill();

          // Add surrounding parallel sands
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(226, 232, 240, 0.15)";
          ctx.fillRect(p.x - 3, p.y + 4, 1, 1);
          ctx.fillRect(p.x + 3, p.y - 4, 1, 1);
        } else if (activeMode === "water") {
          // Draw concentric rings expanding
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha) * 4), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(13, 148, 136, ${p.alpha})`; // teal line
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (activeMode === "cosmos") {
          // Sparkly tiny stardust stars
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.restore();
      }

      animationId = requestAnimationFrame(tick);
    };

    tick();

    // Event handlers inside useEffect to catch passive changes and avoid state stales
    const getCoordsNative = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0, clientY = 0;

      if (window.TouchEvent && e instanceof TouchEvent) {
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else {
          return null;
        }
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleDown = (e: MouseEvent | TouchEvent) => {
      const isTouchEvent = window.TouchEvent && e instanceof TouchEvent;
      if (isTouchEvent && !touchDrawEnabledRef.current) {
        return; // Allow page and backdrop to scroll smoothly
      }
      if (e.cancelable) e.preventDefault();
      isDrawingRef.current = true;
      const pos = getCoordsNative(e);
      if (pos) {
        lastPosRef.current = pos;
        addParticlesFromMove(pos.x, pos.y);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const isTouchEvent = window.TouchEvent && e instanceof TouchEvent;
      if (isTouchEvent && !touchDrawEnabledRef.current) {
        return; // Allow page scroll
      }
      if (!isDrawingRef.current) return;
      if (e.cancelable) e.preventDefault();

      const pos = getCoordsNative(e);
      if (pos && lastPosRef.current) {
        const dx = pos.x - lastPosRef.current.x;
        const dy = pos.y - lastPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(dist / 3));

        for (let i = 0; i < steps; i++) {
          const interX = lastPosRef.current.x + (dx / steps) * i;
          const interY = lastPosRef.current.y + (dy / steps) * i;
          addParticlesFromMove(interX, interY);
        }

        lastPosRef.current = pos;
      }
    };

    const handleUp = () => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    };

    // Rigorously bind native listeners avoiding passive issues
    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleUp);
    canvas.addEventListener("mouseleave", handleUp);

    canvas.addEventListener("touchstart", handleDown, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleUp, { passive: false });
    canvas.addEventListener("touchcancel", handleUp, { passive: false });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);

      canvas.removeEventListener("mousedown", handleDown);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseup", handleUp);
      canvas.removeEventListener("mouseleave", handleUp);

      canvas.removeEventListener("touchstart", handleDown);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleUp);
      canvas.removeEventListener("touchcancel", handleUp);
    };
  }, [activeMode]);

  const addParticlesFromMove = (x: number, y: number) => {
    const pCount = activeMode === "cosmos" ? 5 : activeMode === "water" ? 1 : 2;
    const particles = particlesRef.current;

    for (let i = 0; i < pCount; i++) {
      if (activeMode === "sand") {
        particles.push({
          x: x + (Math.random() * 8 - 4),
          y: y + (Math.random() * 8 - 4),
          vx: (Math.random() * 0.4 - 0.2),
          vy: (Math.random() * 0.4 - 0.2),
          color: "rgba(238, 242, 249, 0.7)", // fine sand color
          size: Math.random() * 2.5 + 0.5,
          alpha: 0.95,
          decay: 0.006 + Math.random() * 0.003, // slow linear fade
        });
      } else if (activeMode === "water") {
        particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          color: "#0D9488",
          size: 15,
          alpha: 0.8,
          decay: 0.015,
        });
      } else if (activeMode === "cosmos") {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.2;
        const colors = ["#F59E0B", "#FCA5A5", "#A7F3D0", "#C084FC", "#60A5FA"];
        const randColor = colors[Math.floor(Math.random() * colors.length)];

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: randColor,
          size: Math.random() * 3 + 1,
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.007,
        });
      }
    }
  };

  const handleClear = () => {
    particlesRef.current = [];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8" id="sandbox-section">
      {/* Intro section */}
      <div className="md:w-1/3 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <Compass className="w-5 h-5 text-slate-600 dark:text-slate-350" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">禅意手绘解压沙盘</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                在一笔划一抹沙中，将漂泊散乱的思绪轻柔安置
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              选择绘画意境
            </label>
            {SANDBOX_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveMode(mode.id);
                  particlesRef.current = []; // swap modes clean particles
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition focus:outline-none cursor-pointer ${
                  activeMode === mode.id
                    ? "bg-slate-50 border-slate-200 dark:bg-slate-850 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium"
                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20"
                }`}
              >
                <div className="text-sm font-semibold tracking-wide" style={{ color: activeMode === mode.id ? mode.color : undefined }}>
                  {mode.name}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleClear}
          className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-2xl text-xs font-semibold transition border border-slate-100 dark:border-slate-850/60 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          抹平沙盘回忆
        </button>
      </div>

      {/* Canvas Drawing Sandbox */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="hidden sm:inline">在沙盒夜色中鼠标拖拽/指尖划动即可手绘，缓慢释怀淡出。</span>
            <span className="sm:hidden text-emerald-600 dark:text-emerald-450 font-medium">手机手势提示：可通过右侧按钮切换模式</span>
          </div>

          {/* Quick toggle to lock/unlock scroll */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-700/80 w-full sm:w-auto">
            <button
              onClick={() => setTouchDrawEnabled(true)}
              className={`flex-1 sm:flex-none px-3 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                touchDrawEnabled
                  ? "bg-slate-850 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              ✍️ 手机指尖绘画
            </button>
            <button
              onClick={() => setTouchDrawEnabled(false)}
              className={`flex-1 sm:flex-none px-3 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                !touchDrawEnabled
                  ? "bg-slate-850 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              📜 自由滑动页面
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex-1 h-[360px] md:h-[420px] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-inner relative select-none cursor-crosshair bg-slate-950"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block absolute inset-0 touch-none"
          />
        </div>
      </div>
    </div>
  );
};
