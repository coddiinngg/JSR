import React, { useState, useEffect } from "react";
import { ChevronLeft, Share2, Flame, TrendingUp, TrendingDown, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

/* ─── 데이터 ─── */
interface RankUser {
  rank: number;
  name: string;
  seed: string;
  streak: number;
  rate: number;
  change: number;   // 순위 변동 (+양수 = 올라감, -음수 = 내려감)
  isMe?: boolean;
}

const WEEKLY_TOP3: RankUser[] = [
  { rank: 2, name: "이영희",   seed: "Jane",  streak: 38, rate: 94, change: +1 },
  { rank: 1, name: "김철수",   seed: "John",  streak: 45, rate: 98, change:  0 },
  { rank: 3, name: "박지민",   seed: "Alex",  streak: 35, rate: 91, change: -1 },
];
const MONTHLY_TOP3: RankUser[] = [
  { rank: 2, name: "박지민",   seed: "Alex",  streak: 35, rate: 89, change: +3 },
  { rank: 1, name: "김철수",   seed: "John",  streak: 45, rate: 96, change:  0 },
  { rank: 3, name: "최민준",   seed: "Leo",   streak: 29, rate: 88, change: -2 },
];

const WEEKLY_LIST: RankUser[] = [
  { rank: 4,  name: "최민준",    seed: "Leo",   streak: 29, rate: 92, change: +2 },
  { rank: 5,  name: "정서윤",    seed: "Mia",   streak: 24, rate: 88, change: -1 },
  { rank: 6,  name: "강다니엘",  seed: "Dan",   streak: 21, rate: 85, change: +3 },
  { rank: 7,  name: "윤보라",    seed: "Zoe",   streak: 19, rate: 82, change:  0 },
  { rank: 8,  name: "한소희",    seed: "Ava",   streak: 15, rate: 79, change: -2 },
  { rank: 9,  name: "임재현",    seed: "Rex",   streak: 13, rate: 77, change: +1 },
  { rank: 10, name: "송유진",    seed: "Yuna",  streak: 11, rate: 75, change: -1 },
  { rank: 11, name: "조성현",    seed: "Sung",  streak:  9, rate: 72, change:  0 },
  { rank: 12, name: "나 (김지수)", seed: "Me",   streak: 12, rate: 74, change: +3, isMe: true },
  { rank: 13, name: "노민아",    seed: "Nina",  streak:  7, rate: 68, change: -1 },
  { rank: 14, name: "류승현",    seed: "Ryan",  streak:  5, rate: 62, change: +2 },
];

const MONTHLY_LIST: RankUser[] = [
  { rank: 4,  name: "정서윤",   seed: "Mia",  streak: 28, rate: 91, change: +4 },
  { rank: 5,  name: "최민준",   seed: "Leo",  streak: 29, rate: 88, change: -1 },
  { rank: 6,  name: "이현우",   seed: "Kyo",  streak: 22, rate: 86, change:  0 },
  { rank: 7,  name: "나 (김지수)", seed: "Me", streak: 30, rate: 81, change: +5, isMe: true },
  { rank: 8,  name: "강다니엘", seed: "Dan",  streak: 21, rate: 79, change: -3 },
  { rank: 9,  name: "윤보라",   seed: "Zoe",  streak: 18, rate: 76, change:  0 },
];

// 그룹 탭
interface GroupRankItem {
  rank: number;
  name: string;
  seed: string;
  rate: number;
  streak: number;
  isMe?: boolean;
}

const GROUP_TABS = [
  {
    id: "g1",
    name: "새벽 미라클 모닝",
    emoji: "🌅",
    members: 8,
    members_list: [
      { rank: 1, name: "강다니엘",    seed: "Dan",  rate: 96, streak: 21 },
      { rank: 2, name: "나 (김지수)", seed: "Me",   rate: 90, streak: 12, isMe: true },
      { rank: 3, name: "이현우",      seed: "Kyo",  rate: 85, streak: 8  },
      { rank: 4, name: "박수진",      seed: "Sue",  rate: 78, streak: 5  },
      { rank: 5, name: "최현준",      seed: "Carl", rate: 71, streak: 3  },
    ] as GroupRankItem[],
  },
  {
    id: "g2",
    name: "매일 5,000보 걷기",
    emoji: "👟",
    members: 21,
    members_list: [
      { rank: 1, name: "김철수",      seed: "John", rate: 98, streak: 45 },
      { rank: 2, name: "이영희",      seed: "Jane", rate: 94, streak: 38 },
      { rank: 3, name: "나 (김지수)", seed: "Me",   rate: 87, streak: 12, isMe: true },
      { rank: 4, name: "한소희",      seed: "Ava",  rate: 79, streak: 15 },
      { rank: 5, name: "윤보라",      seed: "Zoe",  rate: 72, streak: 9  },
    ] as GroupRankItem[],
  },
];

/* ─── 유틸 ─── */
const PODIUM_COLOR: Record<number, string> = {
  1: "#F59E0B",
  2: "#94A3B8",
  3: "#FB923C",
};

function ChangeChip({ change }: { change: number }) {
  if (change === 0) return (
    <span className="text-[10px] font-bold text-slate-300">-</span>
  );
  const up = change > 0;
  return (
    <div className={cn(
      "flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full",
      up ? "text-emerald-600 bg-emerald-50" : "text-rose-500 bg-rose-50"
    )}>
      {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {Math.abs(change)}
    </div>
  );
}

export function Ranking() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "group">("all");
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [groupIdx, setGroupIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const top3    = period === "week" ? WEEKLY_TOP3 : MONTHLY_TOP3;
  const list    = period === "week" ? WEEKLY_LIST  : MONTHLY_LIST;
  const myRank  = list.find(r => r.isMe);
  const myRankGroup = GROUP_TABS[groupIdx].members_list.find(r => r.isMe);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes rk-down { from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes rk-pop  { 0%{opacity:0;transform:scale(0.7) translateY(10px);}70%{transform:scale(1.05);}100%{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes rk-glow { 0%,100%{box-shadow:0 0 16px rgba(245,158,11,0.4);}50%{box-shadow:0 0 28px rgba(245,158,11,0.7);} }
        @keyframes me-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,51,85,0.3);}50%{box-shadow:0 0 0 6px rgba(255,51,85,0);} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-black/[0.05]"
        style={{ animation: "rk-down 0.4s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-[17px] font-black text-slate-900">랭킹</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
          <Share2 style={{ width: 18, height: 18 }} className="text-slate-700" />
        </button>
      </div>

      {/* 탭: 전체 / 그룹 */}
      <div
        className="shrink-0 flex gap-2 px-4 pt-3 pb-3 bg-white"
        style={{ animation: "rk-down 0.4s ease 60ms both" }}
      >
        {(["all", "group"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 py-2 rounded-full text-[13px] font-bold transition-all duration-200",
              tab === key
                ? "bg-[#FF3355] text-white shadow-[0_4px_12px_rgba(255,51,85,0.3)]"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {key === "all" ? "전체 랭킹" : "그룹 랭킹"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-32">

        {/* ─── 전체 랭킹 탭 ─── */}
        {tab === "all" && (
          <>
            {/* 기간 선택 */}
            <div className="flex gap-2 px-4 pt-3 pb-1">
              {(["week", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-200",
                    period === p
                      ? "border-[#FF3355] text-[#FF3355] bg-[#FFF0F3]"
                      : "border-slate-200 text-slate-400 bg-white"
                  )}
                >
                  {p === "week" ? "이번 주" : "이번 달"}
                </button>
              ))}
            </div>

            {/* TOP 3 포디엄 */}
            <div
              className="relative overflow-hidden px-6 pt-5 pb-10 mx-4 mt-3 rounded-3xl"
              style={{ background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)" }}
            >
              <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FF3355]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-amber-400/[0.08] blur-2xl" />

              <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-5">
                {period === "week" ? "이번 주" : "이번 달"} TOP 3
              </p>

              <div className="flex items-end justify-center gap-3">
                {top3.map(({ rank, name, seed, streak, rate }, i) => {
                  const is1st = rank === 1;
                  const color = PODIUM_COLOR[rank];
                  return (
                    <div
                      key={rank}
                      className={cn("flex flex-col items-center gap-1.5", is1st ? "order-2" : rank === 2 ? "order-1" : "order-3")}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0) scale(1)" : `translateY(${is1st ? 20 : 30}px) scale(0.85)`,
                        transition: `opacity 0.6s ease ${i * 80 + 200}ms, transform 0.6s cubic-bezier(0.34,1.2,0.64,1) ${i * 80 + 200}ms`,
                      }}
                    >
                      {is1st && (
                        <div className="text-[22px] mb-0.5" style={{ filter: "drop-shadow(0 2px 6px rgba(245,158,11,0.6))" }}>
                          👑
                        </div>
                      )}
                      <div
                        className="rounded-full overflow-hidden bg-white/10 border-2"
                        style={{
                          width: is1st ? 72 : 56,
                          height: is1st ? 72 : 56,
                          borderColor: color,
                          boxShadow: is1st ? `0 0 0 4px ${color}30, 0 8px 24px rgba(0,0,0,0.3)` : `0 4px 12px rgba(0,0,0,0.2)`,
                        }}
                      >
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <div
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-black"
                        style={{ background: color, color: rank === 1 ? "#1A1A2E" : "white" }}
                      >
                        {rank}위
                      </div>
                      <p className={cn("font-black text-white text-center", is1st ? "text-[14px]" : "text-[12px]")}>{name}</p>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                        <span className="text-[10px] font-bold text-white/50">{streak}일</span>
                      </div>
                      <div
                        className="w-full rounded-t-xl mt-1 flex items-center justify-center"
                        style={{
                          height: is1st ? 56 : rank === 2 ? 40 : 28,
                          minWidth: is1st ? 76 : 60,
                          background: `linear-gradient(180deg, ${color}40, ${color}18)`,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        <span className="text-[12px] font-black" style={{ color }}>{rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 전체 순위 리스트 */}
            <div className="px-4 pt-3 space-y-2">
              <div
                className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
                style={slide(100)}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 px-5 pt-4 pb-2">
                  4위 이하 순위
                </p>
                {list.map(({ rank, name, seed, streak, rate, change, isMe }, i) => (
                  <div key={`${rank}-${name}`}>
                    {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                    <div
                      className={cn(
                        "flex items-center px-4 py-3 transition-opacity active:opacity-60",
                        isMe ? "bg-[#FFF0F3]" : "cursor-pointer"
                      )}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateX(0)" : "translateX(-12px)",
                        transition: `opacity 0.4s ease ${i * 50 + 300}ms, transform 0.4s ease ${i * 50 + 300}ms`,
                      }}
                      onClick={() => !isMe && navigate(`/user/${seed}`)}
                    >
                      <span className={cn(
                        "w-7 text-center text-[13px] font-black shrink-0",
                        isMe ? "text-[#FF3355]" : "text-slate-300"
                      )}>
                        {rank}
                      </span>
                      <div className="relative mx-3 shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                          alt={name}
                          className={cn(
                            "w-9 h-9 rounded-full border bg-slate-50",
                            isMe ? "border-[#FF3355]" : "border-slate-100"
                          )}
                          style={isMe ? { animation: "me-pulse 2s ease-in-out infinite" } : undefined}
                        />
                        {isMe && (
                          <span className="absolute -top-1 -right-1 text-[8px] bg-[#FF3355] text-white font-black px-1 rounded-full leading-tight">
                            나
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-[14px] font-bold leading-snug",
                          isMe ? "text-[#FF3355]" : "text-slate-900"
                        )}>
                          {name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                          <span className="text-[11px] text-slate-400">{streak}일 연속</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={cn(
                          "text-[15px] font-black",
                          isMe ? "text-[#FF3355]" : "text-slate-700"
                        )}>
                          {rate}%
                        </span>
                        <ChangeChip change={change} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── 그룹 랭킹 탭 ─── */}
        {tab === "group" && (
          <div className="px-4 pt-4 space-y-3">

            {/* 그룹 선택 */}
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
              style={slide(60)}
            >
              {GROUP_TABS.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setGroupIdx(i)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[13px] font-bold border whitespace-nowrap shrink-0 transition-all duration-200",
                    groupIdx === i
                      ? "bg-[#FF3355] text-white border-[#FF3355] shadow-[0_4px_12px_rgba(255,51,85,0.25)]"
                      : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  <span>{g.emoji}</span>
                  {g.name}
                </button>
              ))}
            </div>

            {/* 그룹 정보 배너 */}
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #1A1A2E, #0F3460)",
                ...slide(120),
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
                {GROUP_TABS[groupIdx].emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-[15px]">{GROUP_TABS[groupIdx].name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-white/40" />
                  <span className="text-white/50 text-[12px]">{GROUP_TABS[groupIdx].members}명 참여 중</span>
                </div>
              </div>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>

            {/* 그룹 랭킹 리스트 */}
            <div
              className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
              style={slide(180)}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 px-5 pt-4 pb-2">
                이번 주 그룹 순위
              </p>
              {GROUP_TABS[groupIdx].members_list.map(({ rank, name, seed, rate, streak, isMe }, i) => {
                const medal = rank <= 3 ? ["🥇","🥈","🥉"][rank - 1] : null;
                return (
                  <div key={`${rank}-${name}`}>
                    {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                    <div
                      className={cn("flex items-center px-4 py-3 transition-opacity active:opacity-60", isMe ? "bg-[#FFF0F3]" : "cursor-pointer")}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateX(0)" : "translateX(-10px)",
                        transition: `opacity 0.4s ease ${i * 60 + 300}ms, transform 0.4s ease ${i * 60 + 300}ms`,
                      }}
                      onClick={() => !isMe && navigate(`/user/${seed}`)}
                    >
                      <span className="w-8 text-center text-[16px] shrink-0">
                        {medal ?? <span className="text-[12px] font-black text-slate-300">{rank}</span>}
                      </span>
                      <div className="relative mx-3 shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                          alt={name}
                          className={cn("w-9 h-9 rounded-full border bg-slate-50", isMe ? "border-[#FF3355]" : "border-slate-100")}
                          style={isMe ? { animation: "me-pulse 2s ease-in-out infinite" } : undefined}
                        />
                        {isMe && (
                          <span className="absolute -top-1 -right-1 text-[8px] bg-[#FF3355] text-white font-black px-1 rounded-full leading-tight">나</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-[14px] font-bold", isMe ? "text-[#FF3355]" : "text-slate-900")}>{name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                          <span className="text-[11px] text-slate-400">{streak}일 연속</span>
                        </div>
                      </div>

                      {/* 달성률 바 */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0 w-20">
                        <span className={cn("text-[14px] font-black", isMe ? "text-[#FF3355]" : "text-slate-700")}>
                          {rate}%
                        </span>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: mounted ? `${rate}%` : "0%",
                              background: isMe
                                ? "linear-gradient(90deg,#FF3355,#ff6680)"
                                : rank === 1 ? "#F59E0B" : "#94A3B8",
                              transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 80 + 400}ms`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* 내 순위 고정 바 */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{
          background: "linear-gradient(to top, #F8F8FA 65%, transparent)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
        }}
      >
        {tab === "all" && myRank && (
          <div
            className="flex items-center px-4 py-3.5 rounded-2xl text-white"
            style={{
              background: "linear-gradient(110deg, #FF3355, #CC0030)",
              boxShadow: "0 10px 28px -8px rgba(255,51,85,0.5)",
            }}
          >
            <span className="w-7 text-center text-[15px] font-black">{myRank.rank}</span>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
              alt="나"
              className="w-9 h-9 rounded-full border-2 border-white/30 mx-3 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold">나 (김지수)</p>
              <p className="text-[11px] text-white/60">
                {myRank.change > 0 ? `▲ ${myRank.change}위 상승!` : myRank.change < 0 ? `▼ ${Math.abs(myRank.change)}위 하락` : "순위 유지 중"}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[15px] font-black">{myRank.rate}%</p>
              <div className="flex items-center justify-end gap-0.5">
                <Flame className="w-3 h-3 text-orange-300 fill-orange-300" />
                <span className="text-[11px] text-white/60">{myRank.streak}일</span>
              </div>
            </div>
          </div>
        )}
        {tab === "group" && myRankGroup && (
          <div
            className="flex items-center px-4 py-3.5 rounded-2xl text-white"
            style={{
              background: "linear-gradient(110deg, #FF3355, #CC0030)",
              boxShadow: "0 10px 28px -8px rgba(255,51,85,0.5)",
            }}
          >
            <span className="w-7 text-center text-[15px] font-black">{myRankGroup.rank}</span>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
              alt="나"
              className="w-9 h-9 rounded-full border-2 border-white/30 mx-3 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold">나 · {GROUP_TABS[groupIdx].name}</p>
              <p className="text-[11px] text-white/60">{myRankGroup.streak}일 연속 달성 중</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[15px] font-black">{myRankGroup.rate}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
