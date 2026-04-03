import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Star, Lock, X, Zap, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

/* ── 상수 ── */
const XP = 1240;
const LEVEL = 7;
const NEXT_XP = 1500;
const STREAK = 8;
const TOTAL_DONE = 24;

const RANK_NAMES = ["새싹", "새싹", "새내기", "새내기", "도전자", "도전자", "도전자", "전사", "전사", "영웅", "레전드"];

/* ── 배지 데이터 ── */
const BADGES = [
  {
    id: 1, emoji: "🔥", label: "7일 연속", desc: "7일 연속 인증을 달성했어요!", hint: "일주일 내내 쉬지 않았어요 🔥",
    unlocked: true, color: "#FB923C", glow: "rgba(251,146,60,0.4)", earnedAt: "2026.03.14",
    progress: null,
  },
  {
    id: 2, emoji: "⚡", label: "첫 인증", desc: "첫 인증을 완료했어요!", hint: "모든 시작은 첫 걸음부터",
    unlocked: true, color: "#F59E0B", glow: "rgba(245,158,11,0.4)", earnedAt: "2026.03.07",
    progress: null,
  },
  {
    id: 3, emoji: "⭐", label: "5번 달성", desc: "누적 5회 인증을 달성했어요!", hint: "꾸준함이 습관을 만들어요",
    unlocked: true, color: "#6366F1", glow: "rgba(99,102,241,0.4)", earnedAt: "2026.03.12",
    progress: null,
  },
  {
    id: 4, emoji: "🏆", label: "그룹 1위", desc: "그룹 챌린지에서 1위를 달성했어요!", hint: "팀원들을 이끌었어요 👑",
    unlocked: true, color: "#F59E0B", glow: "rgba(245,158,11,0.4)", earnedAt: "2026.03.20",
    progress: null,
  },
  {
    id: 5, emoji: "🎯", label: "30일 달성", desc: "30일 연속 인증을 달성해야 해요", hint: "8일 더 하면 달성!",
    unlocked: false, color: "#FF3355", glow: "rgba(255,51,85,0.35)", earnedAt: null,
    progress: { current: 8, total: 30 },
  },
  {
    id: 6, emoji: "🛡️", label: "완벽한 주", desc: "한 주를 100% 달성해야 해요", hint: "이번 주 5일 남았어요!",
    unlocked: false, color: "#10B981", glow: "rgba(16,185,129,0.35)", earnedAt: null,
    progress: { current: 2, total: 7 },
  },
  {
    id: 7, emoji: "👑", label: "전설", desc: "100일 연속 인증을 달성해야 해요", hint: "92일 더 도전해봐요!",
    unlocked: false, color: "#CC0030", glow: "rgba(204,0,48,0.35)", earnedAt: null,
    progress: { current: 8, total: 100 },
  },
  {
    id: 8, emoji: "🌅", label: "새벽 기상", desc: "오전 6시 이전에 인증해야 해요", hint: "일찍 일어나는 새가 벌레를 잡아요",
    unlocked: false, color: "#0EA5E9", glow: "rgba(14,165,233,0.35)", earnedAt: null,
    progress: { current: 0, total: 1 },
  },
];

const HISTORY = [
  { emoji: "✅", label: "오늘 목표 달성",       xp: 30,  time: "방금",      color: "#10B981" },
  { emoji: "🔥", label: "7일 연속 달성 보너스", xp: 50,  time: "오늘",      color: "#FB923C" },
  { emoji: "👥", label: "그룹 챌린지 참여",     xp: 15,  time: "2시간 전",  color: "#6366F1" },
  { emoji: "📸", label: "인증 사진 업로드",     xp: 10,  time: "2시간 전",  color: "#FF3355" },
  { emoji: "✅", label: "어제 목표 달성",       xp: 30,  time: "어제",      color: "#10B981" },
  { emoji: "🏆", label: "그룹 주간 1위",        xp: 100, time: "어제",      color: "#F59E0B" },
  { emoji: "✅", label: "목표 달성",            xp: 30,  time: "2일 전",    color: "#10B981" },
  { emoji: "⭐", label: "5번 달성 배지 획득",   xp: 25,  time: "3일 전",    color: "#6366F1" },
];

/* ── 배지 상세 바텀 시트 ── */
function BadgeSheet({ badge, onClose }: {
  badge: typeof BADGES[0] | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (badge) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [badge]);

  if (!badge) return null;
  const pct = badge.progress ? Math.round((badge.progress.current / badge.progress.total) * 100) : 100;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)", transition: "background 0.3s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl px-5 pt-5 pb-10 relative"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

        <button onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* 배지 큰 아이콘 */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-3 relative"
            style={{
              background: badge.unlocked ? `${badge.color}15` : "#F1F5F9",
              border: `2.5px solid ${badge.unlocked ? badge.color + "30" : "#E2E8F0"}`,
              boxShadow: badge.unlocked ? `0 8px 32px ${badge.glow}` : "none",
            }}
          >
            <span className={`text-5xl ${badge.unlocked ? "" : "grayscale opacity-30"}`}>{badge.emoji}</span>
            {badge.unlocked && (
              <div
                className="absolute inset-0 rounded-3xl"
                style={{ background: `radial-gradient(circle at 30% 25%, ${badge.color}25, transparent 65%)` }}
              />
            )}
          </div>
          <h2 className="text-[20px] font-black text-slate-900">{badge.label}</h2>
          <p className="text-[14px] text-slate-500 mt-1 text-center">{badge.desc}</p>
        </div>

        {/* 상태 */}
        {badge.unlocked ? (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-emerald-700">획득 완료</p>
              <p className="text-[12px] text-emerald-600">{badge.earnedAt} 달성</p>
            </div>
          </div>
        ) : badge.progress ? (
          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-4">
            <div className="flex justify-between text-[12px] font-bold mb-2">
              <span className="text-slate-600">진행도</span>
              <span style={{ color: badge.color }}>{badge.progress.current} / {badge.progress.total}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${badge.color}, ${badge.color}99)`,
                  boxShadow: `0 0 8px ${badge.glow}`,
                }}
              />
            </div>
            <p className="text-[12px] text-slate-400 mt-2">{badge.hint}</p>
          </div>
        ) : null}

        {/* 힌트 메시지 */}
        {badge.unlocked && (
          <div className="bg-amber-50 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">💛</span>
            <p className="text-[13px] text-amber-700 font-medium">{badge.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── XP 카운트업 훅 ── */
function useCountUp(target: number, duration: number, delay: number) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const pct = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - pct, 3);
        setVal(Math.round(eased * target));
        if (pct < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [target, duration, delay]);
  return val;
}

/* ── 메인 컴포넌트 ── */
export function Rewards() {
  const navigate = useNavigate();
  const { nickname } = useApp();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"badges" | "history">("badges");
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGES[0] | null>(null);
  const xpDisplay = useCountUp(XP, 1200, 400);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const anim = (delay: number, fromY = 16): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : `translateY(${fromY}px)`,
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const unlocked = BADGES.filter(b => b.unlocked);
  const locked = BADGES.filter(b => !b.unlocked);
  // 가장 진행도 높은 잠긴 배지 (최대 2개)
  const nextUp = [...locked].sort((a, b) =>
    ((b.progress ? b.progress.current / b.progress.total : 0) - (a.progress ? a.progress.current / a.progress.total : 0))
  ).slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes badge-pop  { 0%{opacity:0;transform:scale(0.5);}60%{transform:scale(1.14);}100%{opacity:1;transform:scale(1);} }
        @keyframes rw-shine   { 0%{transform:rotate(-30deg) translateX(-120%);opacity:0;}40%{opacity:0.5;}100%{transform:rotate(-30deg) translateX(250%);opacity:0;} }
        @keyframes pulse-soft { 0%,100%{opacity:1;}50%{opacity:0.55;} }
        @keyframes xp-slide   { from{transform:scaleX(0);}to{transform:scaleX(1);} }
      `}</style>

      {/* ── 헤더 ── */}
      <header
        className="shrink-0 flex items-center gap-3 px-4 pt-5 pb-4 bg-white border-b border-black/[0.05]"
        style={anim(0)}
      >
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-[#FF3355] uppercase tracking-widest">보상 & 업적</p>
          <h1 className="text-[20px] font-black text-slate-900 leading-tight">리워드</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FF3355]/10 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5 text-[#FF3355]" />
          <span className="text-[13px] font-black text-[#FF3355]">{xpDisplay.toLocaleString()} XP</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">

        {/* ── 레벨 히어로 ── */}
        <div
          className="relative overflow-hidden px-5 pt-6 pb-7"
          style={{
            background: "linear-gradient(150deg, #FF3355 0%, #CC0030 55%, #A00025 100%)",
            ...anim(40, 0),
          }}
        >
          {/* 장식 원 */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/[0.07]" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/[0.08]" />
          {/* 광택 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.09) 50%, transparent 65%)", animation: "rw-shine 4s ease 0.8s 1 both" }}
          />

          <div className="relative z-10 flex items-center gap-4 mb-5">
            {/* 레벨 원 */}
            <div
              className="shrink-0 w-[72px] h-[72px] rounded-full bg-white/20 border-2 border-white/40 flex flex-col items-center justify-center"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.4)",
                transition: "opacity 0.5s ease 0.1s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
                boxShadow: "0 0 0 6px rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Lv</span>
              <span className="text-[32px] font-black text-white leading-none">{LEVEL}</span>
            </div>

            <div className="flex-1">
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-0.5">현재 등급</p>
              <h2 className="text-[20px] font-black text-white leading-tight">{nickname} {RANK_NAMES[LEVEL]}</h2>
              <p className="text-white/60 text-[12px] mt-0.5">다음 레벨까지 <span className="font-bold text-white/80">{(NEXT_XP - XP).toLocaleString()} XP</span></p>
            </div>
          </div>

          {/* XP 바 */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[12px] font-bold text-white/70">{xpDisplay.toLocaleString()} XP</span>
              <span className="text-[12px] text-white/40">{NEXT_XP.toLocaleString()} XP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
              <div
                style={{
                  width: mounted ? `${(XP / NEXT_XP) * 100}%` : "0%",
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.65))",
                  boxShadow: "0 0 12px rgba(255,255,255,0.5)",
                  transition: "width 1.4s cubic-bezier(0.4,0,0.2,1) 0.35s",
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 -mt-3 space-y-3">

          {/* ── 핵심 스탯 3칸 ── */}
          <div className="grid grid-cols-3 gap-2" style={anim(100)}>
            {[
              { label: "연속 달성", value: STREAK, suffix: "일",  emoji: "🔥", color: "#FB923C", bg: "#FFF7ED" },
              { label: "누적 달성", value: TOTAL_DONE, suffix: "회", emoji: "✅", color: "#10B981", bg: "#ECFDF5" },
              { label: "획득 배지", value: unlocked.length, suffix: "개", emoji: "🏅", color: "#F59E0B", bg: "#FFFBEB" },
            ].map(({ label, value, suffix, emoji, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-3.5 text-center shadow-sm border border-black/[0.04]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
                  <span className="text-[18px]">{emoji}</span>
                </div>
                <p className="text-[20px] font-black leading-none" style={{ color }}>
                  {value}<span className="text-[11px] font-semibold text-slate-400 ml-0.5">{suffix}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* ── 탭 ── */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl" style={anim(160)}>
            {(["badges", "history"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200"
                style={{
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "#FF3355" : "#94A3B8",
                  boxShadow: tab === t ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
                }}>
                {t === "badges" ? "🏅 배지" : "⚡ XP 기록"}
              </button>
            ))}
          </div>

          {/* ── 배지 탭 ── */}
          {tab === "badges" && (
            <>
              {/* 획득한 배지 */}
              <div style={anim(200)}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2.5">
                  획득한 배지 {unlocked.length}개
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {unlocked.map(({ id, emoji, label, color, glow }, i) => (
                    <button
                      key={id}
                      onClick={() => setSelectedBadge(BADGES.find(b => b.id === id)!)}
                      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150"
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "scale(1)" : "scale(0.4)",
                        animation: mounted ? `badge-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) ${200 + i * 70}ms both` : "none",
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: `${color}18`,
                          border: `2px solid ${color}30`,
                          boxShadow: `0 4px 18px ${glow}`,
                        }}
                      >
                        {/* 내부 광택 */}
                        <div className="absolute inset-0 rounded-2xl"
                          style={{ background: `radial-gradient(circle at 30% 25%, ${color}30, transparent 60%)` }} />
                        <span className="text-2xl relative z-10">{emoji}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 text-center leading-tight">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 도전 중 - 진행도 있는 것 먼저 */}
              <div style={anim(320)}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2.5">
                  다음 도전 목표
                </p>
                <div className="flex flex-col gap-2.5">
                  {nextUp.map(b => {
                    const pct = b.progress ? Math.round((b.progress.current / b.progress.total) * 100) : 0;
                    return (
                      <button key={b.id} onClick={() => setSelectedBadge(b)}
                        className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-black/[0.04] shadow-sm active:scale-[0.98] transition-transform text-left w-full">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ background: `${b.color}12`, border: `2px solid ${b.color}20` }}
                        >
                          <span className="text-2xl grayscale-[30%]">{b.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[14px] font-bold text-slate-800">{b.label}</p>
                            <span className="text-[12px] font-bold" style={{ color: b.color }}>{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: mounted ? `${pct}%` : "0%",
                                background: `linear-gradient(90deg, ${b.color}, ${b.color}99)`,
                                boxShadow: `0 0 6px ${b.glow}`,
                                transition: "width 1s cubic-bezier(0.4,0,0.2,1) 0.5s",
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400">{b.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 잠긴 배지 */}
              <div style={anim(420)}>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2.5">
                  잠긴 배지
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {locked.filter(b => !nextUp.includes(b)).map(({ id, emoji, label }) => (
                    <button key={id}
                      onClick={() => setSelectedBadge(BADGES.find(b => b.id === id)!)}
                      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative bg-slate-100 border-2 border-slate-100">
                        <span className="text-2xl grayscale opacity-20">{emoji}</span>
                        <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                          <Lock className="w-4.5 h-4.5 text-slate-300" />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-300 text-center leading-tight">{label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 응원 메시지 카드 */}
              <div
                className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{
                  background: "linear-gradient(130deg, #FF3355 0%, #CC0030 100%)",
                  ...anim(480),
                }}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/[0.07]" />
                <span className="text-3xl shrink-0">💪</span>
                <div className="flex-1 relative z-10">
                  <p className="text-[14px] font-black text-white leading-snug">오늘도 {STREAK}일째 도전 중!</p>
                  <p className="text-[12px] text-white/70 mt-0.5">30일 배지까지 {30 - STREAK}일 남았어요</p>
                </div>
              </div>
            </>
          )}

          {/* ── XP 기록 탭 ── */}
          {tab === "history" && (
            <div style={anim(180)}>
              {/* 오늘 합계 */}
              <div className="bg-[#FF3355]/8 rounded-2xl px-4 py-3.5 mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#FF3355] uppercase tracking-widest mb-0.5">오늘 획득</p>
                  <p className="text-[22px] font-black text-slate-900">+95 XP</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 mb-0.5">누적 총계</p>
                  <p className="text-[18px] font-black text-slate-700">{XP.toLocaleString()} XP</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {HISTORY.map(({ emoji, label, xp, time, color }, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-black/[0.04] shadow-sm"
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateX(0)" : "translateX(-14px)",
                      transition: `opacity 0.4s ease ${180 + i * 45}ms, transform 0.4s ease ${180 + i * 45}ms`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50">
                      <span className="text-xl">{emoji}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-slate-800">{label}</p>
                      <p className="text-[11px] text-slate-400">{time}</p>
                    </div>
                    <span className="text-[14px] font-black" style={{ color }}>+{xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── 배지 상세 바텀 시트 ── */}
      <BadgeSheet badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </div>
  );
}
