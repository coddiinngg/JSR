import { useState, useEffect, useRef } from "react";
import { Plus, Flame, Trophy, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useApp, CATEGORY_META } from "../contexts/AppContext";

const FREQ_LABEL: Record<string, string> = {
  daily: "매일",
  weekly: "주 3회",
  custom: "직접 설정",
};

const COMPLETED_GOALS = [
  { id: "c1", color: "#10B981", title: "아침 스트레칭",  completedDate: "2026.02.28", totalDays: 30, successRate: 93 },
  { id: "c2", color: "#6366F1", title: "영어 단어 30개", completedDate: "2026.01.31", totalDays: 31, successRate: 87 },
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
  const navigate = useNavigate();
  const { goals } = useApp();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [mounted, setMounted] = useState(false);
  const tabRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)];

  const activeGoals = goals.filter(g => !g.completedToday);
  const totalCount = activeGoals.length;
  const avgProgress = totalCount > 0 ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / totalCount) : 0;
  const countedProgress = useCountUp(mounted ? avgProgress : 0, 900, 300);
  const countedTotal = useCountUp(mounted ? totalCount : 0, 600, 150);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#FAFAFA]">
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
        @keyframes breathe   { 0%,100%{box-shadow:0 4px 14px rgba(255,51,85,0.35);}50%{box-shadow:0 6px 22px rgba(255,51,85,0.55);} }
        @keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 px-5 pt-12 pb-4 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-black/[0.04]"
        style={{ animation: "slideDown 0.4s ease forwards" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">내 목표</h1>
          <Link
            to="/goal-setting/category"
            className="flex items-center gap-1.5 bg-[#FF3355] text-white font-bold text-[13px] px-3.5 py-2 rounded-full active:scale-95 transition-all duration-150"
            style={{ animation: "breathe 2.8s ease-in-out infinite 0.6s" }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            추가
          </Link>
        </div>

        {/* 요약 통계 */}
        <div className="flex gap-3 mb-5" style={{ animation: "slideUp 0.4s ease forwards 0.1s", opacity: 0 }}>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 border border-black/[0.04]">
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">진행 중</p>
            <p className="text-[22px] font-black text-slate-900 tabular-nums">
              {countedTotal}<span className="text-[13px] font-semibold text-slate-400 ml-0.5">개</span>
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-3 border border-black/[0.04]">
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">평균 달성률</p>
            <p className="text-[22px] font-black text-[#FF3355] tabular-nums">
              {countedProgress}<span className="text-[13px] font-semibold ml-0.5">%</span>
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1.5" style={{ animation: "fadeIn 0.3s ease forwards 0.2s", opacity: 0 }}>
          {([["active", `진행중 ${activeGoals.length}`], ["completed", `완료됨 ${COMPLETED_GOALS.length}`]] as const).map(([key, label], i) => (
            <button
              key={key}
              ref={tabRefs[i]}
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-250 relative",
                activeTab === key ? "bg-[#FF3355] text-white shadow-[0_4px_12px_rgba(255,51,85,0.28)]" : "text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {activeTab === "active" ? (
          activeGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center" style={{ animation: "slideUp 0.4s ease forwards" }}>
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-3xl">🎯</div>
              <p className="text-slate-700 font-bold text-[16px] mb-1">아직 목표가 없어요</p>
              <p className="text-slate-400 text-[13px] mb-5">첫 목표를 추가하고 도전을 시작해봐요</p>
              <button
                onClick={() => navigate("/goal-setting/category")}
                className="px-6 py-3 bg-[#FF3355] text-white text-[14px] font-bold rounded-full"
                style={{ boxShadow: "0 6px 20px -4px rgba(255,51,85,0.45)" }}
              >
                첫 목표 만들기
              </button>
            </div>
          ) : (
            activeGoals.map((g, i) => {
              const catMeta = CATEGORY_META[g.category] ?? CATEGORY_META.etc;
              return (
                <Link
                  key={g.id}
                  to={`/goals/${g.id}`}
                  className="flex flex-col rounded-2xl border border-black/[0.05] active:scale-[0.98] transition-all duration-150 overflow-hidden bg-white"
                  style={{
                    boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
                    animation: "slideUp 0.45s ease forwards",
                    animationDelay: `${i * 70}ms`,
                    opacity: 0,
                  }}
                >
                  {/* 상단 컬러 스트립 */}
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${g.color}, ${g.color}88)` }} />
                  <div className="p-4 pt-3.5">
                    <div className="flex justify-between items-start mb-3.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-3">
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: g.color, boxShadow: `0 0 6px ${g.color}80` }} />
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{g.title}</h3>
                          <p className="text-[12px] text-slate-400 mt-0.5">{FREQ_LABEL[g.frequency] ?? g.frequency} · {g.notifyTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        {g.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#FB923C", background: "rgba(251,146,60,0.1)" }}>
                            <Flame className="w-3 h-3" />{g.streak}
                          </span>
                        )}
                        {g.completedToday ? (
                          <span className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
                            <CheckCircle2 className="w-3 h-3" />완료
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: g.color, background: `${g.color}18` }}>
                            {g.progress > 0 ? "진행중" : "시작 전"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 pl-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "999px",
                            width: mounted ? `${Math.max(g.progress, g.progress > 0 ? 3 : 0)}%` : "0%",
                            background: g.progress > 0 ? `linear-gradient(90deg, ${g.color}, ${g.color}BB)` : "transparent",
                            transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 100 + 300}ms`,
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-black shrink-0 tabular-nums w-8 text-right" style={{ color: g.progress > 0 ? g.color : "#CBD5E1" }}>
                        {g.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )
        ) : (
          <div style={{ animation: "slideUp 0.4s ease forwards" }}>
            <div
              className="rounded-2xl p-4 mb-3 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)", opacity: 0, animation: "slideUp 0.4s ease forwards 0.05s" }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-[16px]">총 {COMPLETED_GOALS.length}개 목표 완료!</p>
                <p className="text-white/70 text-[12px]">열심히 달려온 기록들이에요 🎉</p>
              </div>
            </div>

            {COMPLETED_GOALS.map(({ id, color, title, completedDate, totalDays, successRate }, i) => (
              <div
                key={id}
                className="bg-white rounded-2xl border border-black/[0.04] p-4 mb-2.5 overflow-hidden relative"
                style={{ opacity: 0, animation: "slideUp 0.45s ease forwards", animationDelay: `${i * 70 + 100}ms`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: color }} />
                <div className="pl-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
                    <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] font-bold text-emerald-600">완료</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>📅 {completedDate} 완료</span>
                    <span>📊 {totalDays}일 중 {successRate}% 달성</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
