import { useState, useEffect } from "react";
import { TrendingUp, Flame, Calendar, Trophy, Clock, CheckCircle2, ChevronRight, ImageIcon, ChevronLeft, Target } from "lucide-react";
import { Link } from "react-router-dom";

// 목표별 통계
const goalStats = [
  { id: "1", title: "30분 유산소",   color: "#FF3355", colorRgb: "255,51,85",  rate: 80, streak: 8,  total: 24, days: 30 },
  { id: "2", title: "물 2L 마시기",  color: "#38BDF8", colorRgb: "56,189,248", rate: 65, streak: 5,  total: 18, days: 30 },
  { id: "3", title: "독서 30페이지", color: "#FB923C", colorRgb: "251,146,60", rate: 15, streak: 0,  total: 3,  days: 20 },
];

function useCountUp(target: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

const bars = [
  { day: "월", v: 50 },
  { day: "화", v: 85, hi: true },
  { day: "수", v: 70 },
  { day: "목", v: 40 },
  { day: "금", v: 15 },
  { day: "토", v: 30 },
  { day: "일", v: 60 },
];

// 최근 인증 미리보기
const recentThumbs = [
  { id: 1, grad: ["#FF3355","#FF6680"] },
  { id: 2, grad: ["#38BDF8","#0EA5E9"] },
  { id: 3, grad: ["#FB923C","#F59E0B"] },
  { id: 4, grad: ["#FF3355","#FF6680"] },
  { id: 5, grad: ["#38BDF8","#0EA5E9"] },
];

// 3월 달력 히트맵 데이터 (0=없음, 1=낮음, 2=중간, 3=높음)
const CAL_YEAR = 2026;
const CAL_MONTH = 2; // 0-indexed (2 = March)
const calData: Record<number, number> = {
  1: 3, 2: 2, 3: 3, 4: 1, 5: 0,
  6: 0, 7: 3, 8: 3, 9: 2, 10: 3, 11: 3, 12: 1,
  13: 0, 14: 2, 15: 3, 16: 3, 17: 3,
};

const HEAT_COLORS = [
  "bg-slate-100",
  "bg-[#FFD6DC]",
  "bg-[#FF9DB2]",
  "bg-[#FF3355]",
];

interface GoalStat {
  id: string; title: string; color: string; colorRgb: string;
  rate: number; streak: number; total: number; days: number;
}

function GoalRow({ goal, idx, mounted }: { goal: GoalStat; idx: number; mounted: boolean }) {
  const { id, title, color, colorRgb, rate, streak, total } = goal;
  const countedRate = useCountUp(mounted ? rate : 0, 1000, idx * 150 + 600);
  return (
    <Link to={`/goals/${id}`} className="block active:opacity-70 transition-opacity">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px rgba(${colorRgb},0.5)` }} />
          <span className="text-[14px] font-bold text-slate-800">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {streak > 0 && (
            <div className="flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
              <span className="text-[11px] text-slate-400">{streak}일</span>
            </div>
          )}
          <span className="text-[14px] font-black tabular-nums" style={{ color }}>{countedRate}%</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: mounted ? `${rate}%` : "0%",
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${idx * 150 + 600}ms`,
            boxShadow: rate > 20 ? `0 0 8px rgba(${colorRgb},0.35)` : "none",
          }}
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">총 {total}회 달성</p>
    </Link>
  );
}

function Ring({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setDash(circ * (1 - pct)), 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3355" />
          <stop offset="100%" stopColor="#FF6680" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F1F1" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={7}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
        style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
}

function CalendarHeatmap({ mounted }: { mounted: boolean }) {
  const today = 17; // 오늘 날짜
  // 2026년 3월 1일은 일요일(0)
  const firstDow = new Date(CAL_YEAR, CAL_MONTH, 1).getDay();
  const daysInMonth = new Date(CAL_YEAR, CAL_MONTH + 1, 0).getDate();
  const dow = ["일", "월", "화", "수", "목", "금", "토"];

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {dow.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const level = calData[day] ?? 0;
          const isFuture = day > today;
          const isToday = day === today;
          return (
            <div
              key={day}
              className={[
                "aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-300",
                isFuture ? "bg-slate-50 text-slate-300" : HEAT_COLORS[level],
                isToday ? "ring-2 ring-[#FF3355] ring-offset-1" : "",
                level >= 2 ? "text-white" : level === 1 ? "text-[#FF3355]" : "text-slate-400",
              ].join(" ")}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.6)",
                transition: `opacity 0.3s ease ${i * 15}ms, transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${i * 15}ms`,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
      {/* 범례 */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">적음</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} className={`w-4 h-4 rounded ${c}`} />
        ))}
        <span className="text-[10px] text-slate-400">많음</span>
      </div>
    </div>
  );
}

export function Stats() {
  const [mounted, setMounted] = useState(false);
  const [calMonth, setCalMonth] = useState("2026년 3월");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#F8F8FA]">
      <style>{`
        @keyframes st-fade { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes st-pop  { 0%{opacity:0;transform:scale(0.85);}60%{transform:scale(1.04);}100%{opacity:1;transform:scale(1);} }
      `}</style>

      {/* 헤더 */}
      <header
        className="shrink-0 flex items-center justify-between px-5 pt-4 pb-4 bg-white border-b border-black/[0.05]"
        style={{ animation: "st-fade 0.4s ease both" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF3355] mb-0.5">2026년 3월</p>
          <h1 className="text-2xl font-black text-slate-900">통계</h1>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFE8EC] active:scale-90 transition-all">
          <Calendar className="w-4 h-4 text-[#FF3355]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* 주간 차트 */}
        <div className="rounded-3xl p-5 relative overflow-hidden bg-white border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          style={{ animation: "st-fade 0.45s ease 60ms both" }}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">이번 주 달성</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[40px] font-black text-slate-900 leading-none">24</span>
                  <span className="text-[14px] text-slate-400">회</span>
                  <span className="flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50">
                    <TrendingUp className="w-3 h-3" /> +12%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 100 }}>
              {bars.map(({ day, v, hi }, idx) => (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full relative rounded-lg overflow-hidden bg-slate-100" style={{ height: 80 }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-t"
                      style={{
                        height: mounted ? `${v}%` : "0%",
                        transition: "height 0.7s cubic-bezier(0.4,0,0.2,1)",
                        transitionDelay: `${idx * 60 + 100}ms`,
                        background: hi ? "linear-gradient(180deg, #FF6680 0%, #FF3355 100%)" : "rgba(255,51,85,0.15)",
                        boxShadow: hi ? "0 0 16px rgba(255,51,85,0.35)" : "none",
                      }} />
                  </div>
                  <span className={`text-[10px] font-bold ${hi ? "text-[#FF3355]" : "text-slate-400"}`}>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 성공률 + 연속 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl p-4 flex flex-col items-center justify-center bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            style={{ minHeight: 150, animation: "st-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 200ms both" }}>
            <div className="relative">
              <Ring pct={0.8} size={90} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[20px] font-black text-slate-900">80%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-semibold">성공률</p>
          </div>
          <div className="rounded-3xl p-5 relative overflow-hidden bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            style={{ minHeight: 150, animation: "st-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 280ms both" }}>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <Flame className="w-7 h-7" style={{ color: "#fb923c", fill: "#fb923c" }} />
              <div>
                <p className="text-[42px] font-black text-slate-900 leading-none">8</p>
                <p className="text-[12px] text-slate-400 mt-1">일 연속</p>
              </div>
            </div>
          </div>
        </div>

        {/* 인사이트 */}
        <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3 bg-[#FFF5F7] border border-[#FFD6DC]"
          style={{ animation: "st-fade 0.45s ease 320ms both" }}>
          <div className="w-8 h-8 rounded-xl bg-[#FFE8EC] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-[#FF3355]" />
          </div>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            <span className="text-[#FF3355] font-bold">화요일</span>이 가장 활발해요.{" "}
            이 패턴 유지 시 성공률 <span className="text-[#FF3355] font-bold">85%</span> 도달!
          </p>
        </div>

        {/* 미니 통계 3칸 */}
        <div className="grid grid-cols-3 gap-2.5" style={{ animation: "st-fade 0.45s ease 380ms both" }}>
          {[
            { icon: Trophy,       label: "최고",   value: "화요일",  color: "#f59e0b", bg: "bg-amber-50"   },
            { icon: Clock,        label: "평균",   value: "오전 7시", color: "#FF3355", bg: "bg-[#FFE8EC]" },
            { icon: CheckCircle2, label: "총 인증", value: "24회",   color: "#10b981", bg: "bg-emerald-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-3 text-center bg-white border border-black/[0.04]">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <p className="text-[13px] font-black text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 월간 히트맵 달력 */}
        <div
          className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          style={slide(440)}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">월간 달성 현황</p>
              <h3 className="text-[16px] font-black text-slate-900">{calMonth}</h3>
            </div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
          <CalendarHeatmap mounted={mounted} />
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
            <div className="flex-1 text-center">
              <p className="text-[22px] font-black text-[#FF3355] leading-none">13</p>
              <p className="text-[10px] text-slate-400 mt-0.5">달성일</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div className="flex-1 text-center">
              <p className="text-[22px] font-black text-slate-700 leading-none">4</p>
              <p className="text-[10px] text-slate-400 mt-0.5">미달성</p>
            </div>
            <div className="w-px bg-slate-100" />
            <div className="flex-1 text-center">
              <p className="text-[22px] font-black text-slate-300 leading-none">13</p>
              <p className="text-[10px] text-slate-400 mt-0.5">남은 날</p>
            </div>
          </div>
        </div>

        {/* 목표별 달성률 브레이크다운 */}
        <div
          className="bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          style={slide(500)}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">목표별 분석</p>
              <h3 className="text-[16px] font-black text-slate-900">개별 달성률</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#FFE8EC] flex items-center justify-center">
              <Target className="w-4 h-4 text-[#FF3355]" />
            </div>
          </div>
          <div className="space-y-4">
            {goalStats.map((g, i) => (
              <GoalRow key={g.id} goal={g} idx={i} mounted={mounted} />
            ))}
          </div>
        </div>

        {/* 주간 리포트 진입 카드 */}
        <Link
          to="/stats/weekly-report"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform duration-150"
          style={slide(510)}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #FF3355, #ff5570)", boxShadow: "0 4px 14px rgba(255,51,85,0.3)" }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black text-slate-900">주간 리포트</p>
            <p className="text-[12px] text-slate-400 mt-0.5">이번 주 목표별 달성 분석 보기</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#FFE8EC] flex items-center justify-center shrink-0">
            <ChevronRight className="w-4 h-4 text-[#FF3355]" />
          </div>
        </Link>

        {/* 인증 갤러리 진입 카드 */}
        <Link
          to="/gallery"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform duration-150"
          style={slide(520)}
        >
          <div className="flex -space-x-2 shrink-0">
            {recentThumbs.map(({ id, grad }) => (
              <div
                key={id}
                className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden shrink-0"
                style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#FF3355]" />
              <p className="text-[14px] font-black text-slate-900">인증 히스토리</p>
            </div>
            <p className="text-[12px] text-slate-400">총 15장 · 갤러리에서 확인</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#FFE8EC] flex items-center justify-center shrink-0">
            <ChevronRight className="w-4 h-4 text-[#FF3355]" />
          </div>
        </Link>

        <div className="h-4" />
      </div>
    </div>
  );
}
