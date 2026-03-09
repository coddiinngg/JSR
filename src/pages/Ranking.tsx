import { useState, useEffect } from "react";
import { ChevronLeft, Share2, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const top3 = [
  { rank: 2, name: "이영희", seed: "Jane",  streak: 38, rate: 94, color: "#94A3B8" },
  { rank: 1, name: "김철수", seed: "John",  streak: 45, rate: 98, color: "#F59E0B" },
  { rank: 3, name: "박지민", seed: "Alex",  streak: 35, rate: 91, color: "#FB923C" },
];

const rankList = [
  { rank: 4,  name: "최민준", streak: 29, rate: 92, seed: "Leo"  },
  { rank: 5,  name: "정서윤", streak: 24, rate: 88, seed: "Mia"  },
  { rank: 6,  name: "강다니엘",streak: 21, rate: 85, seed: "Dan"  },
  { rank: 7,  name: "윤보라", streak: 19, rate: 82, seed: "Zoe"  },
  { rank: 8,  name: "한소희", streak: 15, rate: 79, seed: "Ava"  },
];

const best = [
  { name: "김철수", seed: "John", streak: 45, rate: 98 },
  { name: "이영희", seed: "Jane", streak: 38, rate: 94 },
  { name: "박지민", seed: "Alex", streak: 35, rate: 91 },
];

const worst = [
  { name: "김도현", seed: "Liam", streak: 1, rate: 22 },
  { name: "오지현", seed: "Lily", streak: 2, rate: 31 },
  { name: "박준서", seed: "Evan", streak: 0, rate: 18 },
];

export function Ranking() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "group">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes rk-down  { from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes rk-pop   { 0%{opacity:0;transform:scale(0.7) translateY(10px);}70%{transform:scale(1.05);}100%{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes rk-glow  { 0%,100%{box-shadow:0 0 16px rgba(245,158,11,0.4);}50%{box-shadow:0 0 28px rgba(245,158,11,0.7);} }
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
          <Share2 className="w-4.5 h-4.5 text-slate-700" style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* 탭 */}
      <div
        className="shrink-0 flex gap-2 px-4 pt-3 pb-3 bg-white"
        style={{ animation: "rk-down 0.4s ease 60ms both" }}
      >
        {(["all", "group"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 py-2 rounded-full text-[13px] font-bold transition-all duration-200",
              activeTab === key
                ? "bg-[#FF3355] text-white shadow-[0_4px_12px_rgba(255,51,85,0.3)]"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {key === "all" ? "전체" : "그룹"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-32">

        {/* TOP 3 포디엄 */}
        <div
          className="relative overflow-hidden px-6 pt-6 pb-10"
          style={{
            background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
          }}
        >
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FF3355]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-amber-400/8 blur-2xl" />

          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6">
            이번 주 TOP 3
          </p>

          <div className="flex items-end justify-center gap-3">
            {/* 순서: 2위 → 1위 → 3위 */}
            {top3.map(({ rank, name, seed, streak, rate, color }, i) => {
              const is1st = rank === 1;
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
                  {/* 왕관 */}
                  {is1st && (
                    <div className="text-[22px] mb-0.5" style={{ filter: "drop-shadow(0 2px 6px rgba(245,158,11,0.6))" }}>
                      👑
                    </div>
                  )}

                  {/* 아바타 */}
                  <div
                    className={cn("rounded-full overflow-hidden bg-white/10 border-2")}
                    style={{
                      width: is1st ? 72 : 56,
                      height: is1st ? 72 : 56,
                      borderColor: color,
                      boxShadow: is1st ? `0 0 0 4px ${color}30, 0 8px 24px rgba(0,0,0,0.3)` : `0 4px 12px rgba(0,0,0,0.2)`,
                    }}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 순위 배지 */}
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

                  {/* 포디엄 기둥 */}
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

        <div className="px-4 pt-4 space-y-3">

          {/* 전체 랭킹 리스트 */}
          <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]" style={slide(100)}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 px-5 pt-4 pb-2">전체 순위</p>
            {rankList.map(({ rank, name, streak, rate, seed }, i) => (
              <div key={rank}>
                {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                <div
                  className="flex items-center px-5 py-3"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateX(0)" : "translateX(-12px)",
                    transition: `opacity 0.4s ease ${i * 60 + 300}ms, transform 0.4s ease ${i * 60 + 300}ms`,
                  }}
                >
                  <span className="w-6 text-[13px] font-black text-slate-300 shrink-0">{rank}</span>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt={name}
                    className="w-9 h-9 rounded-full mx-3 border border-slate-100 bg-slate-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900">{name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                      <span className="text-[11px] text-slate-400">{streak}일 연속</span>
                    </div>
                  </div>
                  <span className="text-[15px] font-black text-[#FF3355]">{rate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* BEST / WORST */}
          <div className="grid grid-cols-2 gap-3" style={slide(300)}>

            {/* BEST */}
            <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-500">Best</p>
              </div>
              {best.map(({ name, seed, rate }, i) => (
                <div key={name} className="flex items-center gap-2.5 px-4 py-2.5">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt={name}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{name}</p>
                    <p className="text-[11px] font-black text-emerald-500">{rate}%</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{i + 1}위</span>
                </div>
              ))}
              <div className="h-3" />
            </div>

            {/* WORST */}
            <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-rose-400">Worst</p>
              </div>
              {worst.map(({ name, seed, rate }, i) => (
                <div key={name} className="flex items-center gap-2.5 px-4 py-2.5">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt={name}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{name}</p>
                    <p className="text-[11px] font-black text-rose-400">{rate}%</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{i + 1}</span>
                </div>
              ))}
              <div className="h-3" />
            </div>
          </div>

        </div>
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
        <div
          className="flex items-center px-4 py-3.5 rounded-2xl text-white"
          style={{
            background: "linear-gradient(110deg, #FF3355, #CC0030)",
            boxShadow: "0 10px 28px -8px rgba(255,51,85,0.5)",
          }}
        >
          <span className="w-7 text-center text-[15px] font-black">12</span>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
            alt="나"
            className="w-9 h-9 rounded-full border-2 border-white/30 mx-3 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold">나 (김지수)</p>
            <p className="text-[11px] text-white/60">상위 15% 진입까지 3% 남음</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[15px] font-black">74%</p>
            <div className="flex items-center justify-end gap-0.5">
              <Flame className="w-3 h-3 text-orange-300 fill-orange-300" />
              <span className="text-[11px] text-white/60">12일</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
