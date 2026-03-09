import { useState } from "react";
import { Flame, Bell, Hexagon, BarChart2, Droplet, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SnoozeModal } from "../components/SnoozeModal";

function getTodayLabel() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${month}월 ${day}일 (${weekdays[now.getDay()]})`;
}

const WEEK_DATA = [
  { label: "월", pct: 85 },
  { label: "화", pct: 100 },
  { label: "수", pct: 70 },
  { label: "목", pct: 50 },
  { label: "오늘", pct: 60 },
  { label: "토", pct: 0 },
  { label: "일", pct: 0 },
];

const LEADERBOARD = [
  { rank: 1, name: "김지수", xp: 1240, initial: "김" },
  { rank: 2, name: "이민준", xp: 1180, initial: "이" },
];

const PROGRESS = 0.65;
const R = 40;
const CIRC = 2 * Math.PI * R;

export function Home() {
  const [showSnooze, setShowSnooze] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#F5F7FA] dark:bg-[#0A0F18]">
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-6 space-y-4">

        {/* ── 헤더 ── */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Today</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{getTodayLabel()}</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#0066FF]/10 dark:bg-[#0066FF]/15 px-3 py-1.5 rounded-full">
              <Hexagon className="text-[#0066FF]" size={13} fill="currentColor" />
              <span className="text-[11px] font-bold text-[#0066FF]">복구권 2</span>
            </div>
            <button className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
              <Bell size={18} className="text-slate-500 dark:text-slate-300" />
            </button>
          </div>
        </header>

        {/* ── 메인 목표 카드 ── */}
        <section className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#0066FF]/6 via-[#0066FF]/10 to-transparent border border-[#0066FF]/14 shadow-sm bg-white dark:bg-slate-900/30">
          <div className="flex items-center justify-between gap-4">
            {/* 텍스트 */}
            <div className="flex-1 min-w-0 space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-[#0066FF] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,102,255,0.35)]">
                <Flame size={10} className="fill-white/80" />
                7일 연속
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">오늘의 목표</h2>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">30분 유산소</p>

              {/* 카운트다운 */}
              <div className="flex items-baseline gap-0.5 pt-1 tabular-nums font-mono">
                {[
                  { val: "02", label: "HR" },
                  { val: "13", label: "MIN", hi: true },
                  { val: "45", label: "SEC" },
                ].map(({ val, label, hi }, i) => (
                  <div key={label} className="flex items-baseline gap-0.5">
                    {i > 0 && (
                      <span className="text-base font-light text-slate-300 dark:text-slate-600 px-0.5 pb-2">:</span>
                    )}
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl font-bold leading-none ${hi ? "text-[#0066FF]" : "text-slate-800 dark:text-slate-100"}`}>
                        {val}
                      </span>
                      <span className={`text-[8px] font-semibold mt-0.5 uppercase tracking-widest ${hi ? "text-[#0066FF]/55" : "text-slate-400"}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG 원형 진행률 */}
            <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48" cy="48" r={R} fill="transparent"
                  stroke="currentColor" strokeWidth="7"
                  className="text-[#0066FF]/12"
                />
                <circle
                  cx="48" cy="48" r={R} fill="transparent"
                  stroke="currentColor" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - PROGRESS)}
                  className="text-[#0066FF]"
                  style={{ filter: "drop-shadow(0 0 6px rgba(0,102,255,0.45))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#0066FF]">
                  {Math.round(PROGRESS * 100)}%
                </span>
                <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">완료</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 명언 + CTA ── */}
        <section className="space-y-3">
          <p className="text-sm italic text-slate-400 dark:text-slate-500 text-center px-2">
            "꾸준함이 동기부여를 이긴다."
          </p>
          <Link
            to="/verify/camera"
            className="w-full py-4 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl font-bold text-lg shadow-lg flex flex-col items-center justify-center gap-1 transition-transform active:scale-[0.98] shadow-[#0066FF]/25"
          >
            지금 인증하기
            <span className="text-[11px] font-normal opacity-75">다음 알림: 오후 7:00</span>
          </Link>
          <button
            onClick={() => setShowSnooze(true)}
            className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/60 dark:hover:bg-white/5 active:scale-[0.98] transition-all rounded-xl font-medium text-sm"
          >
            오늘 건너뛰기
          </button>
        </section>

        {/* ── 그룹 리더보드 ── */}
        <section className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white text-sm">
              <BarChart2 className="text-[#0066FF]" size={17} />
              그룹 리더보드
            </h3>
            <Link to="/ranking" className="text-[#0066FF] text-xs font-semibold hover:underline">
              전체 보기
            </Link>
          </div>
          <div className="space-y-2">
            {LEADERBOARD.map(({ rank, name, xp, initial }) => (
              <div
                key={rank}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-slate-400">#{rank}</span>
                  <div className="w-8 h-8 rounded-full bg-[#0066FF]/10 dark:bg-[#0066FF]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#0066FF] text-xs font-bold">{initial}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{name}</span>
                </div>
                <span className="text-xs font-bold text-[#0066FF]">{xp.toLocaleString()} XP</span>
              </div>
            ))}
            {/* 나 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border-2 border-[#0066FF]/20 bg-[#0066FF]/5 dark:bg-[#0066FF]/8">
              <div className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-[#0066FF]">#4</span>
                <div className="w-8 h-8 rounded-full bg-[#0066FF]/20 flex items-center justify-center shrink-0">
                  <User className="text-[#0066FF]" size={15} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">나 (상승 중)</span>
              </div>
              <span className="text-xs font-black text-[#0066FF]">945 XP</span>
            </div>
          </div>
        </section>

        {/* ── 하단 2열 ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* 이번 주 차트 */}
          <div className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">이번 주</h4>
            <div className="flex items-end gap-1 h-12">
              {WEEK_DATA.map(({ label, pct }) => {
                const isDone = pct === 100;
                const isToday = label === "오늘";
                return (
                  <div key={label} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-700/50" style={{ height: 36 }}>
                      {pct > 0 && (
                        <div
                          className={`w-full rounded-sm ${isDone ? "bg-emerald-400" : isToday ? "bg-[#0066FF]" : "bg-[#0066FF]/35"}`}
                          style={{ height: `${pct}%`, marginTop: "auto" }}
                        />
                      )}
                    </div>
                    <span className={`text-[8px] font-medium ${isToday ? "text-[#0066FF] font-bold" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] mt-2 font-medium text-slate-400">4/7일 완료</p>
          </div>

          {/* 챌린지 카드 */}
          <Link
            to="/challenge"
            className="bg-[#0066FF] p-4 rounded-2xl flex flex-col justify-between text-white relative overflow-hidden shadow-lg shadow-[#0066FF]/25 active:scale-[0.97] transition-transform"
          >
            <div className="relative z-10">
              <h4 className="text-[9px] font-bold uppercase tracking-wider opacity-70">다가오는 챌린지</h4>
              <p className="text-sm font-bold leading-snug mt-1.5">5일 수분 섭취 챌린지</p>
            </div>
            <div className="mt-4 flex items-center justify-between relative z-10">
              <span className="text-[9px] bg-white/20 px-2 py-1 rounded-lg font-semibold">월요일 시작</span>
              <Droplet size={18} fill="currentColor" />
            </div>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          </Link>
        </div>

      </main>

      {showSnooze && (
        <SnoozeModal onClose={() => setShowSnooze(false)} onSnooze={() => setShowSnooze(false)} />
      )}
    </div>
  );
}
