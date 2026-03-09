import { useState, useEffect } from "react";
import {
  Flame, Bell, Trophy, ChevronRight,
  Zap, Target, Droplet, CheckCircle2,
  TrendingUp, Star, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SnoozeModal } from "../components/SnoozeModal";

const PROGRESS = 0.65;
const R = 76;
const STROKE = 11;
const CIRC = 2 * Math.PI * R;
const SZ = (R + STROKE) * 2 + 8;

const WEEK = [
  { d: "월", v: 0.85, done: true },
  { d: "화", v: 1,    done: true },
  { d: "수", v: 0.70, done: true },
  { d: "목", v: 0.50, done: true },
  { d: "금", v: 0.60, today: true },
  { d: "토", v: 0 },
  { d: "일", v: 0 },
];

const LEADERS = [
  { rank: 1, name: "김민준", xp: 2840, color: "#f59e0b" },
  { rank: 2, name: "이서연", xp: 2650, color: "#94a3b8" },
  { rank: 3, name: "나",     xp: 2480, color: "#FF3355", me: true },
];

const BADGES = [
  { icon: Flame,        label: "7일 연속",   bg: "#fff3e0", color: "#f97316", border: "#fed7aa" },
  { icon: Zap,          label: "+120 XP",    bg: "#ede9fe", color: "#7c3aed", border: "#c4b5fd" },
  { icon: CheckCircle2, label: "인증 완료",  bg: "#d1fae5", color: "#059669", border: "#6ee7b7" },
];

function AnimBar({ v, done, today, delay }: { v: number; done?: boolean; today?: boolean; delay: number }) {
  const [h, setH] = useState(0);
  useEffect(() => { const t = setTimeout(() => setH(v), delay); return () => clearTimeout(t); }, [v, delay]);
  return (
    <div
      className="w-full rounded-t-lg transition-all duration-700 ease-out"
      style={{
        height: `${h * 100}%`,
        background: done
          ? "linear-gradient(180deg, #ff7088, #FF3355)"
          : today
          ? "linear-gradient(180deg, #ffaab8, #ff5570)"
          : "#f1f5f9",
        boxShadow: (done || today) ? "0 -4px 10px rgba(255,51,85,0.25)" : "none",
      }}
    />
  );
}

function arcEndpoint(cx: number, cy: number, r: number, pct: number) {
  const angle = pct * 2 * Math.PI - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function Home() {
  const [showSnooze, setShowSnooze] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState([false, false, false]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!mounted) return;
    [0, 1, 2].forEach(i => {
      setTimeout(() => setBadgeVisible(p => { const n = [...p]; n[i] = true; return n; }), 300 + i * 150);
    });
  }, [mounted]);

  const ep = arcEndpoint(SZ / 2, SZ / 2, R, PROGRESS);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#F4F7FC]">
      <main className="flex-1 overflow-y-auto no-scrollbar">

        {/* ── 헤더 ── */}
        <div
          className={`flex items-center justify-between px-5 pt-6 pb-3 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0 -translate-y-3"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg, #FF3355, #ff7088)", boxShadow: "0 4px 14px rgba(255,51,85,0.35)" }}
            >
              나
            </div>
            <div>
              <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-widest">안녕하세요</p>
              <p className="text-slate-900 font-extrabold text-sm leading-tight">김지수 님</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "#fff3e0", border: "1px solid #fed7aa" }}
            >
              <Flame className="w-3.5 h-3.5 anim-flame" style={{ color: "#f97316", fill: "rgba(249,115,22,0.5)" }} />
              <span className="text-orange-500 font-extrabold text-sm tabular-nums">7</span>
            </div>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center relative bg-white shadow-sm"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3355]" style={{ boxShadow: "0 0 6px rgba(255,51,85,0.6)" }} />
            </button>
          </div>
        </div>

        {/* ── 히어로 카드 ── */}
        <div
          className={`mx-5 mb-4 rounded-3xl overflow-hidden relative transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{
            background: "linear-gradient(145deg, #FF3355 0%, #cc1a3a 60%, #990022 100%)",
            boxShadow: "none",
          }}
        >
          {/* 배경 장식 */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/8 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-rose-300/15 blur-xl pointer-events-none" />
          {/* 회전 링 */}
          <svg className="absolute top-1/2 right-4 -translate-y-1/2 anim-spin-slow opacity-10 pointer-events-none" width={140} height={140}>
            <circle cx={70} cy={70} r={60} fill="none" stroke="white" strokeWidth={1} strokeDasharray="5 14" />
          </svg>

          <div className="flex items-center p-5 gap-5 relative z-10">
            {/* 링 */}
            <div className="relative shrink-0" style={{ width: SZ, height: SZ }}>
              <svg width={SZ} height={SZ} className="-rotate-90">
                <defs>
                  <linearGradient id="ringW" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
                  </linearGradient>
                  <filter id="glow2">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx={SZ/2} cy={SZ/2} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={STROKE} />
                <circle
                  cx={SZ/2} cy={SZ/2} r={R} fill="none"
                  stroke="url(#ringW)" strokeWidth={STROKE} strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={mounted ? CIRC * (1 - PROGRESS) : CIRC}
                  filter="url(#glow2)"
                  style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1,0.64,1) 0.2s" }}
                />
                {mounted && (
                  <circle cx={ep.x} cy={ep.y} r={5.5} fill="white"
                    style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-black tabular-nums" style={{ fontSize: 36 }}>
                  {Math.round(PROGRESS * 100)}
                </span>
                <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">%</span>
              </div>
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">오늘의 목표</span>
              </div>
              <h1 className="text-white font-extrabold text-xl leading-tight mb-3">30분 유산소</h1>

              {/* 타이머 */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Zap className="w-3 h-3 text-rose-200" />
                <span className="text-white/80 text-xs font-mono tabular-nums">02:13:45</span>
              </div>
            </div>
          </div>

          {/* 배지 행 */}
          <div className="flex gap-2 px-5 pb-5 relative z-10">
            {BADGES.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl flex-1 justify-center transition-all duration-500 ${badgeVisible[i] ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    transitionDelay: `${i * 100}ms`,
                  }}
                >
                  <Icon className="w-3 h-3 text-white/70 shrink-0" />
                  <span className="text-white/80 text-[10px] font-bold truncate">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 이번 주 ── */}
        <div
          className={`mx-5 mb-4 bg-white rounded-2xl p-4 transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ border: "1px solid #edf0f7", boxShadow: "none" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF3355]" />
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">이번 주</span>
            </div>
            <span className="text-[#FF3355] text-xs font-bold">4 / 7일</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {WEEK.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                <div className="flex-1 w-full flex items-end rounded-lg overflow-hidden bg-slate-100">
                  <AnimBar v={w.v} done={w.done} today={w.today} delay={400 + i * 80} />
                </div>
                <span className="text-[9px] font-bold" style={{ color: w.today ? "#FF3355" : "#94a3b8" }}>
                  {w.d}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 리더보드 ── */}
        <div
          className={`mx-5 mb-4 bg-white rounded-2xl overflow-hidden transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ border: "1px solid #edf0f7", boxShadow: "none" }}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">리더보드</span>
            </div>
            <Link to="/ranking" className="flex items-center gap-0.5 text-[#FF3355] text-xs font-bold">
              전체 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-3 pb-3 space-y-1.5">
            {LEADERS.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={l.me
                  ? { background: "rgba(255,51,85,0.06)", border: "1.5px solid rgba(255,51,85,0.18)" }
                  : { background: "#f8fafc" }
                }
              >
                <span className="text-sm font-extrabold w-5 text-center tabular-nums" style={{ color: l.color }}>
                  {l.rank}
                </span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    background: l.me ? "linear-gradient(135deg, #FF3355, #ff7088)" : `${l.color}20`,
                    color: l.me ? "white" : l.color,
                    boxShadow: l.me ? "0 4px 12px rgba(255,51,85,0.3)" : "none",
                  }}
                >
                  {l.name[0]}
                </div>
                <span className={`flex-1 text-sm font-bold ${l.me ? "text-[#FF3355]" : "text-slate-700"}`}>
                  {l.name}
                  {l.me && (
                    <span className="ml-1.5 text-[9px] bg-[#FF3355]/10 text-[#FF3355] px-1.5 py-0.5 rounded-full font-semibold">나</span>
                  )}
                </span>
                <span className="text-xs font-bold tabular-nums" style={{ color: l.me ? "#FF3355" : "#94a3b8" }}>
                  {l.xp.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2열 카드 ── */}
        <div
          className={`grid grid-cols-2 gap-3 mx-5 mb-4 transition-all duration-500 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* 챌린지 */}
          <Link
            to="/challenge"
            className="rounded-2xl p-4 flex flex-col gap-2 active:scale-[0.96] transition-transform relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FF3355 0%, #cc1a3a 100%)",
              boxShadow: "none",
            }}
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <Users className="w-4 h-4 text-white/60" />
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            </div>
            <div className="relative z-10">
              <div className="text-white font-black text-2xl tabular-nums">12</div>
              <div className="text-white/50 text-[10px] font-semibold mt-0.5">챌린지 참여</div>
            </div>
            <div
              className="text-white/70 text-[9px] font-bold px-2 py-1 rounded-lg w-fit relative z-10"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              월요일 시작
            </div>
          </Link>

          {/* 수분 챌린지 */}
          <Link
            to="/challenge"
            className="bg-white rounded-2xl p-4 flex flex-col gap-2 active:scale-[0.96] transition-transform relative overflow-hidden"
            style={{ border: "1px solid #edf0f7", boxShadow: "none" }}
          >
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-rose-100 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "#cffafe", border: "1px solid #a5f3fc" }}
              >
                <Droplet className="w-3.5 h-3.5 text-cyan-500 fill-cyan-400/40" />
              </div>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-300/50" />
            </div>
            <div className="relative z-10">
              <div className="text-slate-800 font-extrabold text-sm leading-tight">수분 섭취</div>
              <div className="text-slate-400 text-[10px] font-medium mt-0.5">5일 챌린지</div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden relative z-10">
              <div className="h-full w-3/5 rounded-full" style={{ background: "linear-gradient(90deg, #06b6d4, #22d3ee)" }} />
            </div>
          </Link>
        </div>

        {/* ── CTA ── */}
        <div
          className={`px-5 pb-10 space-y-3 transition-all duration-500 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Link
            to="/verify/camera"
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-base active:scale-[0.97] transition-transform relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FF3355, #ff5570)",
              boxShadow: "none",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }}
            />
            <CheckCircle2 className="w-5 h-5 relative z-10" />
            <span className="relative z-10">지금 인증하기</span>
          </Link>
          <button
            onClick={() => setShowSnooze(true)}
            className="w-full h-10 text-slate-400 text-sm font-medium hover:text-slate-500 transition-colors"
          >
            오늘 건너뛰기
          </button>
        </div>

      </main>

      {showSnooze && (
        <SnoozeModal onClose={() => setShowSnooze(false)} onSnooze={() => setShowSnooze(false)} />
      )}
    </div>
  );
}
