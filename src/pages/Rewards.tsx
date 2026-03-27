import React, { useState, useEffect } from "react";
import { ChevronLeft, Flame, Star, Lock, Zap, Trophy, Shield, Crown, Target, Sunrise } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const XP = 1240;
const LEVEL = 7;
const NEXT_LEVEL_XP = 1500;
const STREAK = 8;

const badges = [
  { id: 1, icon: Flame,   emoji: "🔥", label: "7일 연속",      desc: "7일 연속 달성",       unlocked: true,  color: "#FB923C", bg: "#FFF7ED" },
  { id: 2, icon: Zap,     emoji: "⚡", label: "첫 인증",        desc: "첫 인증 완료",         unlocked: true,  color: "#F59E0B", bg: "#FFFBEB" },
  { id: 3, icon: Star,    emoji: "⭐", label: "5번 달성",        desc: "누적 5회 달성",        unlocked: true,  color: "#6366F1", bg: "#EEF2FF" },
  { id: 4, icon: Trophy,  emoji: "🏆", label: "그룹 1위",        desc: "그룹에서 1위 달성",    unlocked: true,  color: "#F59E0B", bg: "#FFFBEB" },
  { id: 5, icon: Target,  emoji: "🎯", label: "30일 달성",       desc: "30일 연속 달성",       unlocked: false, color: "#FF3355", bg: "#FFF0F3" },
  { id: 6, icon: Shield,  emoji: "🛡️", label: "완벽한 주",       desc: "한 주 100% 달성",      unlocked: false, color: "#10B981", bg: "#ECFDF5" },
  { id: 7, icon: Crown,   emoji: "👑", label: "전설",            desc: "100일 연속 달성",      unlocked: false, color: "#CC0030", bg: "#FFF0F3" },
  { id: 8, icon: Sunrise, emoji: "🌅", label: "새벽 기상",       desc: "오전 6시 이전 인증",   unlocked: false, color: "#0EA5E9", bg: "#F0F9FF" },
];

const milestones = [
  { xp: 0,    label: "Lv.1  새싹",    color: "#10B981" },
  { xp: 500,  label: "Lv.3  새내기",  color: "#6366F1" },
  { xp: 1000, label: "Lv.5  도전자",  color: "#F59E0B" },
  { xp: 1500, label: "Lv.8  전사",    color: "#FF3355" },
  { xp: 3000, label: "Lv.10 레전드",  color: "#CC0030" },
];

function XPBar({ current, total, mounted }: { current: number; total: number; mounted: boolean }) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: mounted ? `${pct}%` : "0%",
          background: "linear-gradient(90deg, #FF3355, #FF6680)",
          boxShadow: "0 0 10px rgba(255,51,85,0.4)",
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s",
        }}
      />
    </div>
  );
}

export function Rewards() {
  const navigate = useNavigate();
  const { nickname } = useApp();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"badges" | "history">("badges");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes rw-pop { 0%{opacity:0;transform:scale(0.7);}60%{transform:scale(1.12);}100%{opacity:1;transform:scale(1);} }
        @keyframes rw-shine { 0%{opacity:0;transform:rotate(-30deg) translateX(-100%);}100%{opacity:0.6;transform:rotate(-30deg) translateX(200%);} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 pt-12 pb-4 bg-white border-b border-black/[0.05]"
        style={{ animation: "rw-pop 0.4s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FF3355]">보상 & 업적</p>
          <h1 className="text-[20px] font-black text-slate-900 leading-tight">리워드</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">

        {/* 레벨 히어로 */}
        <div
          className="relative overflow-hidden px-5 pt-6 pb-8"
          style={{
            background: "linear-gradient(160deg, #FF3355 0%, #CC0030 50%, #A00025 100%)",
            animation: "rw-pop 0.45s ease 40ms both",
          }}
        >
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/[0.06]" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)",
              animation: "rw-shine 3s ease 1s 1 both",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              {/* 레벨 뱃지 */}
              <div
                className="relative flex-shrink-0"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "scale(1)" : "scale(0.5)",
                  transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s",
                }}
              >
                <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex flex-col items-center justify-center backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Lv.</span>
                  <span className="text-[36px] font-black text-white leading-none">{LEVEL}</span>
                </div>
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center"
                  style={{ boxShadow: "0 2px 8px rgba(245,158,11,0.6)" }}
                >
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-0.5">현재 등급</p>
                <h2 className="text-[22px] font-black text-white leading-tight">{nickname} 도전자</h2>
                <p className="text-white/60 text-[12px] mt-0.5">다음 레벨까지 {NEXT_LEVEL_XP - XP} XP</p>
              </div>
            </div>

            {/* XP 바 */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] font-bold text-white/70">{XP.toLocaleString()} XP</span>
                <span className="text-[12px] font-bold text-white/40">{NEXT_LEVEL_XP.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  style={{
                    width: mounted ? `${(XP / NEXT_LEVEL_XP) * 100}%` : "0%",
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
                    boxShadow: "0 0 8px rgba(255,255,255,0.4)",
                    transition: "width 1.3s cubic-bezier(0.4,0,0.2,1) 0.3s",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 space-y-4">

          {/* 핵심 스탯 */}
          <div className="grid grid-cols-3 gap-2.5" style={slide(80)}>
            {[
              { label: "연속",   value: STREAK, suffix: "일",  color: "#FB923C", bg: "bg-orange-50",  emoji: "🔥" },
              { label: "누적 달성", value: 24,  suffix: "회",  color: "#6366F1", bg: "bg-indigo-50",  emoji: "✅" },
              { label: "배지",   value: unlocked.length, suffix: "개", color: "#F59E0B", bg: "bg-amber-50", emoji: "🏅" },
            ].map(({ label, value, suffix, color, bg, emoji }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-black/[0.04] text-center">
                <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-base">{emoji}</span>
                </div>
                <p className="text-[22px] font-black leading-none" style={{ color }}>
                  {value}<span className="text-[12px] font-semibold text-slate-400 ml-0.5">{suffix}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* 탭 */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl" style={slide(140)}>
            {(["badges", "history"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-[13px] font-bold transition-all duration-200"
                style={{
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "#FF3355" : "#94A3B8",
                  boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t === "badges" ? "배지 컬렉션" : "XP 히스토리"}
              </button>
            ))}
          </div>

          {tab === "badges" ? (
            <>
              {/* 획득 배지 */}
              <div style={slide(180)}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2">
                  획득한 배지 ({unlocked.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {unlocked.map(({ id, emoji, label, desc, color, bg }, i) => (
                    <div
                      key={id}
                      className="flex flex-col items-center gap-1.5"
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "scale(1)" : "scale(0.6)",
                        transition: `opacity 0.4s ease ${180 + i * 60}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${180 + i * 60}ms`,
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        style={{ background: bg, border: `2px solid ${color}30` }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ background: `radial-gradient(circle at 30% 30%, ${color}20, transparent 70%)` }}
                        />
                        <span className="text-2xl relative z-10">{emoji}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 text-center leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 잠긴 배지 */}
              <div style={slide(280)}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2">
                  도전 중 ({locked.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {locked.map(({ id, emoji, label, desc }) => (
                    <div key={id} className="flex flex-col items-center gap-1.5">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative bg-slate-100 border-2 border-slate-100">
                        <span className="text-2xl opacity-25 grayscale">{emoji}</span>
                        <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                          <Lock className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 text-center leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 마일스톤 로드맵 */}
              <div
                className="bg-white rounded-2xl p-5 border border-black/[0.04]"
                style={slide(360)}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">레벨 로드맵</p>
                <div className="relative">
                  {/* 연결선 */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100" />
                  <div
                    className="absolute left-4 top-4 w-0.5"
                    style={{
                      height: mounted ? `${((XP / 3000) * 100)}%` : "0%",
                      background: "linear-gradient(180deg, #FF3355, #FF6680)",
                      transition: "height 1.5s cubic-bezier(0.4,0,0.2,1) 0.5s",
                    }}
                  />
                  <div className="space-y-5">
                    {milestones.map(({ xp, label, color }) => {
                      const reached = XP >= xp;
                      return (
                        <div key={xp} className="flex items-center gap-3 relative z-10">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300"
                            style={{
                              background: reached ? color : "#F1F5F9",
                              borderColor: reached ? color : "#E2E8F0",
                              boxShadow: reached ? `0 0 12px ${color}50` : "none",
                            }}
                          >
                            {reached && <Star className="w-3.5 h-3.5 text-white fill-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-[13px] font-bold ${reached ? "text-slate-900" : "text-slate-400"}`}>
                              {label}
                            </p>
                            <p className="text-[11px] text-slate-400">{xp.toLocaleString()} XP</p>
                          </div>
                          {reached && (
                            <span className="text-[10px] font-bold text-[#FF3355] bg-[#FFF0F3] px-2 py-0.5 rounded-full">완료</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* XP 히스토리 */
            <div style={slide(180)}>
              {[
                { emoji: "✅", label: "오늘 목표 달성",         xp: "+30 XP", time: "방금",     color: "#10B981" },
                { emoji: "🔥", label: "7일 연속 달성 보너스",   xp: "+50 XP", time: "오늘",     color: "#FB923C" },
                { emoji: "👥", label: "그룹 챌린지 참여",       xp: "+15 XP", time: "2시간 전", color: "#6366F1" },
                { emoji: "📸", label: "인증 사진 업로드",       xp: "+10 XP", time: "2시간 전", color: "#FF3355" },
                { emoji: "✅", label: "어제 목표 달성",         xp: "+30 XP", time: "어제",     color: "#10B981" },
                { emoji: "🏆", label: "그룹 주간 1위",          xp: "+100 XP", time: "어제",    color: "#F59E0B" },
                { emoji: "✅", label: "목표 달성",              xp: "+30 XP", time: "2일 전",   color: "#10B981" },
                { emoji: "⭐", label: "5번 달성 배지 획득",     xp: "+25 XP", time: "3일 전",   color: "#6366F1" },
              ].map(({ emoji, label, xp, time, color }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-black/[0.04] mb-2"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateX(0)" : "translateX(-12px)",
                    transition: `opacity 0.4s ease ${180 + i * 50}ms, transform 0.4s ease ${180 + i * 50}ms`,
                  }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50">
                    <span className="text-xl">{emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-400">{time}</p>
                  </div>
                  <span className="text-[14px] font-black" style={{ color }}>{xp}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
