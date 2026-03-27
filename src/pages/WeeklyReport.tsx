import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Flame, Trophy, TrendingUp, TrendingDown, Minus, Target, Calendar, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import type { Goal } from "../contexts/AppContext";
import type { Verification } from "../types/database";

/* ─── 타입 ─── */
interface GoalWeekData {
  id: string;
  title: string;
  color: string;
  colorRgb: string;
  days: boolean[]; // 7일 (월~일)
  streak: number;
  prevRate: number; // 이전 주 달성률
  currRate: number; // 이번 주 달성률
}

interface WeekData {
  label: string;
  startDate: string;
  endDate: string;
  goals: GoalWeekData[];
  totalXP: number;
  prevTotalXP: number;
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const daysFromMonday = (next.getDay() + 6) % 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - daysFromMonday);
  return next;
}

function formatMonthDay(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function diffDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function buildDays(verifications: Verification[], weekStart: Date) {
  const days = Array.from({ length: 7 }, () => false);

  verifications.forEach(item => {
    const index = diffDays(weekStart, new Date(item.verified_at));
    if (index >= 0 && index < 7) {
      days[index] = true;
    }
  });

  return days;
}

function buildGoalWeekData(goal: Goal, verifications: Verification[], weekStart: Date): GoalWeekData {
  const previousWeekStart = addDays(weekStart, -7);
  const currentDays = buildDays(verifications, weekStart);
  const previousDays = buildDays(verifications, previousWeekStart);
  const currDone = currentDays.filter(Boolean).length;
  const prevDone = previousDays.filter(Boolean).length;

  return {
    id: goal.id,
    title: goal.title,
    color: goal.color,
    colorRgb: goal.colorRgb,
    days: currentDays,
    streak: goal.streak,
    prevRate: Math.round((prevDone / 7) * 100),
    currRate: Math.round((currDone / 7) * 100),
  };
}

function buildWeekData(label: string, weekStart: Date, goals: Goal[], verifications: Verification[]): WeekData {
  const previousWeekStart = addDays(weekStart, -7);
  const goalData = goals.map(goal => buildGoalWeekData(
    goal,
    verifications.filter(item => item.goal_id === goal.id),
    weekStart,
  ));

  const totalXP = verifications
    .filter(item => {
      const verifiedAt = new Date(item.verified_at);
      const index = diffDays(weekStart, verifiedAt);
      return index >= 0 && index < 7;
    })
    .reduce((sum, item) => sum + item.xp_earned, 0);

  const prevTotalXP = verifications
    .filter(item => {
      const verifiedAt = new Date(item.verified_at);
      const index = diffDays(previousWeekStart, verifiedAt);
      return index >= 0 && index < 7;
    })
    .reduce((sum, item) => sum + item.xp_earned, 0);

  return {
    label,
    startDate: formatMonthDay(weekStart),
    endDate: formatMonthDay(addDays(weekStart, 6)),
    goals: goalData,
    totalXP,
    prevTotalXP,
  };
}

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

function Trend({ curr, prev }: { curr: number; prev: number }) {
  const diff = curr - prev;
  if (diff > 0) return (
    <div className="flex items-center gap-0.5 text-emerald-500">
      <TrendingUp className="w-3 h-3" />
      <span className="text-[10px] font-black">+{diff}%</span>
    </div>
  );
  if (diff < 0) return (
    <div className="flex items-center gap-0.5 text-red-400">
      <TrendingDown className="w-3 h-3" />
      <span className="text-[10px] font-black">{diff}%</span>
    </div>
  );
  return (
    <div className="flex items-center gap-0.5 text-slate-400">
      <Minus className="w-3 h-3" />
      <span className="text-[10px] font-black">0%</span>
    </div>
  );
}

function GoalWeekCard({ goal, mounted, delay }: { goal: GoalWeekData; mounted: boolean; delay: number; key?: React.Key }) {
  const doneCount = goal.days.filter(Boolean).length;
  const rate = Math.round((doneCount / 7) * 100);
  const counted = useCountUp(mounted ? rate : 0, 1000, delay + 400);

  return (
    <div
      className="bg-white rounded-2xl p-4 border border-black/[0.04]"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: goal.color, boxShadow: `0 0 6px rgba(${goal.colorRgb},0.5)` }} />
          <span className="text-[14px] font-bold text-slate-800">{goal.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {goal.streak > 0 && (
            <div className="flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded-full">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-orange-500 text-[10px] font-black">{goal.streak}일</span>
            </div>
          )}
          <Trend curr={goal.currRate} prev={goal.prevRate} />
        </div>
      </div>

      {/* 요일 체크 */}
      <div className="flex gap-1.5 mb-3">
        {DAYS.map((d, i) => (
          <div key={d} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-lg transition-all duration-300"
              style={{
                height: 32,
                background: goal.days[i]
                  ? `linear-gradient(160deg, ${goal.color}, ${goal.color}CC)`
                  : "rgba(0,0,0,0.05)",
                boxShadow: goal.days[i] ? `0 2px 8px rgba(${goal.colorRgb},0.25)` : "none",
              }}
            >
              {goal.days[i] && (
                <div className="flex items-center justify-center h-full">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 font-semibold">{d}</span>
          </div>
        ))}
      </div>

      {/* 달성률 바 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: mounted ? `${rate}%` : "0%",
              background: `linear-gradient(90deg, ${goal.color}, ${goal.color}BB)`,
              transitionDelay: `${delay + 200}ms`,
            }}
          />
        </div>
        <span className="text-[13px] font-black tabular-nums w-8 text-right" style={{ color: goal.color }}>
          {counted}%
        </span>
      </div>
    </div>
  );
}

export function WeeklyReport() {
  const navigate = useNavigate();
  const { nickname, goals, verificationHistory } = useApp();
  const [weekIdx, setWeekIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const completedVerifications = verificationHistory.filter(item => item.status === "completed");
  const currentWeekStart = startOfWeek(new Date());
  const weeks = [
    buildWeekData("이번 주", currentWeekStart, goals, completedVerifications),
    buildWeekData("지난 주", addDays(currentWeekStart, -7), goals, completedVerifications),
  ];

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const week = weeks[weekIdx];
  const totalDone = week.goals.reduce((sum, g) => sum + g.days.filter(Boolean).length, 0);
  const totalPossible = week.goals.length * 7;
  const activeDays = DAYS.reduce((sum, _, index) => (
    week.goals.some(goal => goal.days[index]) ? sum + 1 : sum
  ), 0);
  const overallRate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  const xpCounted = useCountUp(mounted ? week.totalXP : 0, 1000, 500);
  const xpDiff = week.totalXP - week.prevTotalXP;
  const maxStreak = Math.max(...week.goals.map(goal => goal.streak), 0);
  const suggestedGoals = [...week.goals]
    .sort((a, b) => a.currRate - b.currRate)
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes wr-in { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes wr-slide { from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center px-4 pt-12 pb-4 bg-white border-b border-black/[0.05]"
        style={{ animation: "wr-in 0.4s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1 ml-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF3355]">통계</p>
          <h1 className="text-[20px] font-black text-slate-900">주간 리포트</h1>
        </div>
        {/* 주 네비게이터 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekIdx(i => Math.min(weeks.length - 1, i + 1))}
            disabled={weekIdx === weeks.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 disabled:opacity-30 active:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-[13px] font-bold text-slate-700 w-14 text-center">{week.label}</span>
          <button
            onClick={() => setWeekIdx(i => Math.max(0, i - 1))}
            disabled={weekIdx === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 disabled:opacity-30 active:bg-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">

        {/* 히어로 배너 */}
        <div
          className="relative overflow-hidden mx-4 mt-4 rounded-3xl p-5"
          style={{
            background: "linear-gradient(160deg, #FF3355 0%, #CC0030 55%, #A00025 100%)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease 60ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 60ms",
          }}
        >
          {/* 장식 */}
          <div className="pointer-events-none absolute -top-8 -right-8 w-44 h-44 rounded-full bg-white/[0.07]" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/[0.06]" />

          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[11px] text-white/50 font-bold">
                  {week.startDate} – {week.endDate}
                </span>
              </div>
              <p className="text-white/60 text-[12px] font-bold uppercase tracking-widest mb-1">전체 달성률</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-[48px] font-black text-white leading-none">{overallRate}</span>
                <span className="text-[18px] text-white/70 font-bold">%</span>
                {xpDiff > 0 && (
                  <span className="text-[12px] font-black text-emerald-300 ml-1">▲ {xpDiff} XP</span>
                )}
              </div>
              {/* 달성률 바 */}
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: mounted ? `${overallRate}%` : "0%",
                    background: "rgba(255,255,255,0.85)",
                    boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                    transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s",
                  }}
                />
              </div>
              <p className="text-white/40 text-[11px] mt-1.5">
                {totalPossible > 0 ? `${totalDone}/${totalPossible}개 완료` : "아직 생성한 목표가 없어요"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-4">

          {/* 이번 주 핵심 지표 */}
          <div
            className="grid grid-cols-3 gap-2"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease 280ms, transform 0.5s ease 280ms",
            }}
          >
            {[
              { icon: Target,   label: "인증한 날",  value: activeDays,  suffix: "일", color: "#FF3355", bg: "#FFF0F3" },
              { icon: Zap,      label: "획득 XP",    value: xpCounted,  suffix: " XP", color: "#f59e0b", bg: "#fffbeb" },
              { icon: Trophy,   label: "최고 연속",  value: maxStreak, suffix: "일", color: "#6366f1", bg: "#eef2ff" },
            ].map(({ icon: Icon, label, value, suffix, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-3.5 border border-black/[0.04] text-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-[18px] font-black leading-none text-slate-900">
                  {value}<span className="text-[10px] font-semibold text-slate-400 ml-0.5">{suffix}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* 목표별 주간 카드 */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2">
              목표별 주간 달성
            </p>
            {week.goals.length > 0 ? (
              <div className="space-y-2.5">
                {week.goals.map((goal, i) => (
                  <GoalWeekCard key={goal.id} goal={goal} mounted={mounted} delay={360 + i * 80} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
                <p className="text-[13px] font-semibold text-slate-500">표시할 목표가 없어요</p>
                <p className="text-[12px] text-slate-400 mt-1">목표를 만들면 주간 달성 현황이 여기서 집계됩니다.</p>
              </div>
            )}
          </div>

          {/* 이전 주 비교 */}
          <div
            className="bg-white rounded-2xl p-4 border border-black/[0.04]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease 600ms, transform 0.5s ease 600ms",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">지난 주 대비</p>
            {week.goals.length > 0 ? (
              <div className="space-y-3">
                {week.goals.map(goal => (
                  <div key={goal.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: goal.color }} />
                    <span className="text-[13px] text-slate-600 flex-1 font-medium">{goal.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-slate-400 font-semibold">{goal.prevRate}%</span>
                      <span className="text-slate-200">→</span>
                      <span className="text-[13px] font-black" style={{ color: goal.color }}>{goal.currRate}%</span>
                      <Trend curr={goal.currRate} prev={goal.prevRate} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-400">비교할 목표 데이터가 아직 없어요.</p>
            )}
          </div>

          {/* 다음 주 도전 제안 */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(110deg, #1A1A2E, #16213E)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease 680ms, transform 0.5s ease 680ms",
            }}
          >
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1">다음 주 도전 목표</p>
              <p className="text-white font-black text-[16px] mb-3">{nickname}님, 이렇게 도전해 보세요!</p>
              {suggestedGoals.length > 0 ? (
                suggestedGoals.map(goal => {
                  const target = Math.min(100, Math.round(goal.currRate + (100 - goal.currRate) / 2));
                  return (
                    <div key={goal.id} className="flex items-center gap-3 mb-2.5 last:mb-0">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/10">
                        <Target className="w-4 h-4" style={{ color: goal.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-[12px] font-bold">{goal.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-white/30 text-[11px]">{goal.currRate}% →</span>
                          <span className="text-[11px] font-black" style={{ color: goal.color }}>{target}%</span>
                          <span className="text-[10px] text-white/30">목표</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[13px] text-white/50">먼저 목표와 인증 기록이 쌓이면 다음 주 추천 목표가 계산됩니다.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
