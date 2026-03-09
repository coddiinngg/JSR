import { useState, useEffect, useRef } from "react";
import { Plus, ClipboardList, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const activeGoals = [
  {
    id: 1,
    color: "#FF3355",
    bg: "rgba(255,51,85,0.08)",
    title: "30분 유산소",
    desc: "매일 아침 7시",
    progress: 60,
    status: "진행중",
    streak: 5,
    href: "/goals/1",
  },
  {
    id: 2,
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.08)",
    title: "물 2L 마시기",
    desc: "하루 8잔",
    progress: 45,
    status: "진행중",
    streak: 3,
    href: "/goals/2",
  },
  {
    id: 3,
    color: "#FB923C",
    bg: "rgba(251,146,60,0.08)",
    title: "독서 30페이지",
    desc: "매일 저녁 9시",
    progress: 0,
    status: "시작 전",
    streak: 0,
    href: "/goals/3",
  },
];

function useCountUp(target: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const timeout = setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(ease * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

export function GoalsList() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [mounted, setMounted] = useState(false);
  const [tabIndicator, setTabIndicator] = useState(0);
  const tabRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)];

  const totalCount = activeGoals.length;
  const avgProgress = Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / totalCount);
  const countedProgress = useCountUp(mounted ? avgProgress : 0, 900, 300);
  const countedTotal = useCountUp(mounted ? totalCount : 0, 600, 150);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const idx = activeTab === "active" ? 0 : 1;
    const el = tabRefs[idx].current;
    if (el) setTabIndicator(el.offsetLeft);
  }, [activeTab]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 4px 14px rgba(255,51,85,0.35); }
          50%       { box-shadow: 0 6px 22px rgba(255,51,85,0.55); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 px-5 pt-12 pb-4 bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04]"
        style={{ animation: 'slideDown 0.4s ease forwards' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">내 목표</h1>
          <Link
            to="/goal-setting/name"
            className="flex items-center gap-1.5 bg-[#FF3355] text-white font-bold text-[13px] px-3.5 py-2 rounded-full hover:bg-[#E0203F] active:scale-95 transition-all duration-150"
            style={{ animation: 'breathe 2.8s ease-in-out infinite 0.6s' }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            추가
          </Link>
        </div>

        {/* 요약 통계 */}
        <div
          className="flex gap-3 mb-5"
          style={{ animation: 'slideUp 0.4s ease forwards 0.1s', opacity: 0 }}
        >
          <div className="flex-1 bg-white dark:bg-[#1C1C1E] rounded-2xl px-4 py-3 border border-black/[0.04] dark:border-white/[0.05]">
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">진행 중</p>
            <p className="text-[22px] font-black text-slate-900 dark:text-white tabular-nums">
              {countedTotal}
              <span className="text-[13px] font-semibold text-slate-400 ml-0.5">개</span>
            </p>
          </div>
          <div className="flex-1 bg-white dark:bg-[#1C1C1E] rounded-2xl px-4 py-3 border border-black/[0.04] dark:border-white/[0.05]">
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">평균 달성률</p>
            <p className="text-[22px] font-black text-[#FF3355] tabular-nums">
              {countedProgress}
              <span className="text-[13px] font-semibold ml-0.5">%</span>
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div
          className="relative flex gap-1.5"
          style={{ animation: 'fadeIn 0.3s ease forwards 0.2s', opacity: 0 }}
        >
          {([["active", "진행중"], ["completed", "완료됨"]] as const).map(([key, label], i) => (
            <button
              key={key}
              ref={tabRefs[i]}
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-250 relative z-10",
                activeTab === key ? "text-white" : "text-slate-400"
              )}
            >
              {label}
              {activeTab === key && (
                <span
                  className="absolute inset-0 bg-[#FF3355] rounded-full -z-10 shadow-[0_4px_12px_rgba(255,51,85,0.28)]"
                  style={{ animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {activeTab === "active" ? (
          activeGoals.map(({ id, color, bg, title, desc, progress, status, streak, href }, i) => (
            <Link
              key={id}
              to={href}
              className="group flex flex-col rounded-2xl border border-black/[0.05] dark:border-white/[0.06] active:scale-[0.98] transition-all duration-150 overflow-hidden"
              style={{
                background: "white",
                boxShadow: `0 2px 14px rgba(0,0,0,0.05), inset 0 0 0 0 transparent`,
                animation: `slideUp 0.45s ease forwards`,
                animationDelay: `${i * 70}ms`,
                opacity: 0,
              }}
            >
              {/* 컬러 상단 스트립 */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

              <div className="p-4 pt-3.5">
                {/* 상단: 컬러 닷 + 타이틀 + 배지 */}
                <div className="flex justify-between items-start mb-3.5">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-3">
                    {/* 컬러 닷 */}
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{title}</h3>
                      <p className="text-[12px] text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    {streak > 0 && (
                      <span
                        className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: "#FB923C", background: "rgba(251,146,60,0.1)" }}
                      >
                        <Flame className="w-3 h-3" />{streak}
                      </span>
                    )}
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={
                        status === "진행중"
                          ? { color, background: bg }
                          : { color: "#94A3B8", background: "#F1F5F9" }
                      }
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {/* 진행바 영역 */}
                <div className="flex items-center gap-2.5 pl-4">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "999px",
                        width: mounted ? `${Math.max(progress, progress > 0 ? 3 : 0)}%` : "0%",
                        background: progress > 0 ? `linear-gradient(90deg, ${color}, ${color}BB)` : "transparent",
                        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        transitionDelay: `${i * 100 + 300}ms`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[12px] font-black shrink-0 tabular-nums w-8 text-right"
                    style={{ color: progress > 0 ? color : "#CBD5E1" }}
                  >
                    {progress}%
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
            style={{ animation: 'slideUp 0.4s ease forwards' }}
          >
            <div
              className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"
              style={{ animation: 'slideUp 0.4s ease forwards 0.05s', opacity: 0 }}
            >
              <ClipboardList className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <h3
              className="text-[15px] font-bold text-slate-600 dark:text-slate-400 mb-1.5"
              style={{ animation: 'slideUp 0.4s ease forwards 0.2s', opacity: 0 }}
            >
              완료된 목표가 없어요
            </h3>
            <p
              className="text-[13px] text-slate-400 leading-relaxed"
              style={{ animation: 'slideUp 0.4s ease forwards 0.3s', opacity: 0 }}
            >
              목표를 달성하면 여기에 기록됩니다
            </p>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
