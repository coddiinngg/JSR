import { useState, useEffect } from "react";
import { ChevronLeft, MoreVertical, Flame, Camera, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";

const GOALS: Record<string, {
  color: string;
  colorRgb: string;
  title: string;
  sub: string;
  streak: number;
  rate: number;
  total: number;
  completionRate: number;
}> = {
  "1": {
    color: "#FF3355", colorRgb: "255,51,85",
    title: "30분 유산소", sub: "매일 아침 7시",
    streak: 8, rate: 60, total: 24, completionRate: 0.8,
  },
  "2": {
    color: "#38BDF8", colorRgb: "56,189,248",
    title: "물 2L 마시기", sub: "하루 8잔",
    streak: 5, rate: 45, total: 18, completionRate: 0.5,
  },
  "3": {
    color: "#FB923C", colorRgb: "251,146,60",
    title: "독서 30페이지", sub: "매일 저녁 9시",
    streak: 0, rate: 0, total: 0, completionRate: 0,
  },
};

function useCountUp(target: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

function isDone(day: number, id: string): boolean {
  if (id === "3") return false;
  const threshold = id === "1" ? 8 : 5;
  return ((day * 17) + parseInt(id) * 3) % 10 < threshold;
}

function buildCalendar(goalId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { day: number | null; status: "empty" | "done" | "missed" | "today" | "future" }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, status: "empty" });
  for (let d = 1; d <= daysInMonth; d++) {
    if (d > today) cells.push({ day: d, status: "future" });
    else if (d === today) cells.push({ day: d, status: "today" });
    else cells.push({ day: d, status: isDone(d, goalId) ? "done" : "missed" });
  }
  return cells;
}

function buildWeek(streak: number) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const daysAgo = 6 - i;
    const isToday = daysAgo === 0;
    return {
      label: dayNames[d.getDay()],
      isToday,
      done: !isToday && daysAgo <= streak,
      missed: !isToday && daysAgo > streak,
    };
  });
}

const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export function GoalDetail() {
  const navigate = useNavigate();
  const { id = "1" } = useParams<{ id: string }>();
  const goal = GOALS[id] ?? GOALS["1"];
  const { color, colorRgb, title, sub, streak, rate, total, completionRate } = goal;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const animatedRate = useCountUp(mounted ? rate : 0, 1000, 400);
  const animatedStreak = useCountUp(mounted ? streak : 0, 700, 500);
  const animatedTotal = useCountUp(mounted ? total : 0, 800, 600);
  const animatedCompletion = useCountUp(mounted ? Math.round(completionRate * 100) : 0, 900, 700);

  const calendar = buildCalendar(id);
  const week = buildWeek(streak);
  const now = new Date();

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes gd-fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes gd-pop { 0%{opacity:0;transform:scale(0.8);} 70%{transform:scale(1.06);} 100%{opacity:1;transform:scale(1);} }
        @keyframes gd-shimmer { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
      `}</style>

      {/* 히어로 헤더 */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${color} 0%, ${color}CC 60%, ${color}88 100%)`,
          paddingTop: 52,
          paddingBottom: 28,
          animation: "gd-fadeDown 0.45s ease both",
        }}
      >
        {/* 장식 원 */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48 rounded-full"
          style={{ background: "rgba(0,0,0,0.06)" }}
        />

        {/* 네비 */}
        <div className="relative z-10 flex items-center justify-between px-4 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 active:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button className="flex size-10 items-center justify-center rounded-full bg-white/20 active:bg-white/30 transition-colors">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 타이틀 */}
        <div className="relative z-10 px-5">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{sub}</p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[28px] font-black text-white leading-tight">{title}</h1>
            {streak > 0 && (
              <div
                className="inline-flex items-center gap-1 bg-white/20 border border-white/30 rounded-full px-2.5 py-1"
                style={{ animation: "gd-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}
              >
                <Flame className="w-3.5 h-3.5 text-white fill-white/80" />
                <span className="text-[12px] font-bold text-white">{streak}일</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-28">

        {/* 오늘 달성률 카드 */}
        <div
          className="bg-white rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/[0.04]"
          style={slide(100)}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">오늘 달성률</p>
              <p className="text-[38px] font-black leading-none" style={{ color }}>
                {animatedRate}
                <span className="text-[18px] font-bold text-slate-300 ml-0.5">%</span>
              </p>
            </div>
            <Link
              to="/verify/camera"
              className="flex items-center gap-2 text-white text-[13px] font-bold px-4 py-2.5 rounded-full active:scale-95 transition-all"
              style={{
                background: color,
                boxShadow: `0 8px 20px -4px rgba(${colorRgb},0.45)`,
              }}
            >
              <Camera className="w-4 h-4" />
              인증하기
            </Link>
          </div>

          {/* 진행 바 */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                width: mounted ? `${Math.max(rate, rate > 0 ? 2 : 0)}%` : "0%",
                background: `linear-gradient(90deg, ${color}, ${color}99)`,
                transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s",
                boxShadow: rate > 0 ? `0 0 10px rgba(${colorRgb},0.4)` : "none",
              }}
            />
          </div>
        </div>

        {/* 이번 주 */}
        <div
          className="bg-white rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/[0.04]"
          style={slide(180)}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">최근 7일</p>
          <div className="flex justify-between gap-1">
            {week.map(({ label, isToday, done }, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 flex-1"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(8px)",
                  transition: `opacity 0.4s ease ${i * 50 + 300}ms, transform 0.4s ease ${i * 50 + 300}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={
                    isToday
                      ? { background: `rgba(${colorRgb},0.12)`, border: `2px solid ${color}` }
                      : done
                      ? { background: color, boxShadow: `0 4px 10px rgba(${colorRgb},0.3)` }
                      : { background: "#F1F5F9" }
                  }
                >
                  {done && !isToday && (
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} style={{ width: 18, height: 18 }} />
                  )}
                </div>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isToday ? color : "#94A3B8" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 통계 3칸 */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "연속", value: animatedStreak, suffix: "일", delay: 260 },
            { label: "총 달성", value: animatedTotal, suffix: "회", delay: 320 },
            { label: "성공률", value: animatedCompletion, suffix: "%", delay: 380 },
          ].map(({ label, value, suffix, delay }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/[0.04]"
              style={slide(delay)}
            >
              <p
                className="text-[22px] font-black leading-none tabular-nums"
                style={{ color }}
              >
                {value}
                <span className="text-[12px] font-semibold text-slate-300 ml-0.5">{suffix}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 달력 */}
        <div
          className="bg-white rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/[0.04]"
          style={slide(440)}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">
            {MONTH_NAMES[now.getMonth()]} 달성 기록
          </p>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["일","월","화","수","목","금","토"].map((d) => (
              <div key={d} className="text-center text-[9px] font-bold text-slate-300">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((cell, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center text-[10px] font-semibold"
                style={
                  cell.status === "done"
                    ? { background: `rgba(${colorRgb},0.15)`, color }
                    : cell.status === "today"
                    ? { background: color, color: "white", boxShadow: `0 4px 10px rgba(${colorRgb},0.35)` }
                    : cell.status === "missed"
                    ? { background: "#F1F5F9", color: "#CBD5E1" }
                    : cell.status === "future"
                    ? { background: "#FAFAFA", color: "#E2E8F0" }
                    : {}
                }
              >
                {cell.day}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-end">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md" style={{ background: `rgba(${colorRgb},0.2)` }} />
              <span className="text-[10px] text-slate-400">달성</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-slate-100" />
              <span className="text-[10px] text-slate-400">미완료</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md" style={{ background: color }} />
              <span className="text-[10px] text-slate-400">오늘</span>
            </div>
          </div>
        </div>

        {/* 최근 인증 */}
        {total > 0 && (
          <div
            className="bg-white rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/[0.04]"
            style={slide(520)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">최근 인증</p>
            <div className="grid grid-cols-3 gap-2">
              {["D-1", "D-2", "D-3"].map((label, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5"
                  style={{
                    background: `linear-gradient(135deg, rgba(${colorRgb},0.15) 0%, rgba(${colorRgb},0.06) 100%)`,
                    border: `1px solid rgba(${colorRgb},0.15)`,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "scale(1)" : "scale(0.85)",
                    transition: `opacity 0.4s ease ${i * 80 + 600}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 80 + 600}ms`,
                  }}
                >
                  <CheckCircle2 className="w-6 h-6" style={{ color }} strokeWidth={2} />
                  <span className="text-[10px] font-bold" style={{ color: `rgba(${colorRgb},0.6)` }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{
          background: "linear-gradient(to top, #F8F8FA 70%, transparent)",
          animation: "gd-fadeDown 0.5s ease 0.4s both",
        }}
      >
        <Link
          to="/verify/camera"
          className="flex w-full h-14 items-center justify-center gap-2 text-white text-[17px] font-black rounded-2xl active:scale-[0.98] transition-all"
          style={{
            background: `linear-gradient(110deg, ${color}, ${color}CC)`,
            boxShadow: `0 12px 28px -8px rgba(${colorRgb},0.5)`,
          }}
        >
          <Camera className="w-5 h-5" />
          오늘 인증하기
        </Link>
      </div>
    </div>
  );
}
