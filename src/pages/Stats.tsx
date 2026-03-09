import { useState, useEffect } from "react";
import { TrendingUp, Flame, Calendar, Trophy, Clock, CheckCircle2, ChevronRight, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

const bars = [
  { day: "월", v: 50 },
  { day: "화", v: 85, hi: true },
  { day: "수", v: 70 },
  { day: "목", v: 40 },
  { day: "금", v: 15 },
  { day: "토", v: 30 },
  { day: "일", v: 60 },
];

// 최근 인증 미리보기 (갤러리 진입 카드용)
const recentThumbs = [
  { id: 1, grad: ["#FF3355","#FF6680"] },
  { id: 2, grad: ["#38BDF8","#0EA5E9"] },
  { id: 3, grad: ["#FB923C","#F59E0B"] },
  { id: 4, grad: ["#FF3355","#FF6680"] },
  { id: 5, grad: ["#38BDF8","#0EA5E9"] },
];

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

export function Stats() {
  const [mounted, setMounted] = useState(false);

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
        @keyframes lb-in   { from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);} }
        @keyframes lb-bg   { from{opacity:0;}to{opacity:1;} }
      `}</style>

      {/* 헤더 */}
      <header
        className="shrink-0 flex items-center justify-between px-5 pt-12 pb-4 bg-white border-b border-black/[0.05]"
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
          <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,51,85,0.08) 0%, transparent 70%)", filter: "blur(24px)" }} />
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
            <div className="pointer-events-none absolute -bottom-6 -right-6 w-28 h-28 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
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

        {/* ── 인증 갤러리 진입 카드 ── */}
        <Link
          to="/gallery"
          className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform duration-150"
          style={slide(480)}
        >
          {/* 썸네일 미리보기 */}
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
