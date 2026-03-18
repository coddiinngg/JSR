import { useState, useEffect } from "react";
import { Share2, ArrowRight, Flame, Trophy, Zap, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const CONFETTI_COLORS = ["#FF3355", "#ff6680", "#ffb3c0", "#fff0f3", "#f97316", "#fbbf24", "#34d399"];

interface Dot {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  drift: number;
}

function Confetti({ dots }: { dots: Dot[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${d.x}%`,
            top: `-${d.size}px`,
            width: d.size,
            height: d.size * 1.4,
            background: d.color,
            animation: `confettiFall 2.8s ease-in ${d.delay}ms both`,
            transform: `rotate(${d.drift}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function Success() {
  const navigate = useNavigate();
  const { verifyingGoalId, completeGoalToday, goals } = useApp();
  const [mounted, setMounted] = useState(false);

  // 인증 완료 처리 (한 번만)
  useEffect(() => {
    if (verifyingGoalId) completeGoalToday(verifyingGoalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifiedGoal = verifyingGoalId ? goals.find(g => g.id === verifyingGoalId) : null;
  const [dots] = useState<Dot[]>(() =>
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: 0,
      size: 4 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 800,
      drift: -30 + Math.random() * 60,
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const pop = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "scale(1)" : "scale(0.7)",
    transition: `opacity 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#F5F6FA] relative overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounce-in {
          0%   { transform: scale(0.3); opacity: 0; }
          55%  { transform: scale(1.15); }
          70%  { transform: scale(0.92); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,51,85,0.3); }
          50%       { box-shadow: 0 0 0 20px rgba(255,51,85,0); }
        }
      `}</style>

      <Confetti dots={dots} />

      {/* 닫기 */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-12 right-4 z-20 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-slate-600 active:scale-90 transition-all"
      >
        ✕
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 overflow-y-auto pt-16 pb-6">

        {/* 체크 원 */}
        <div className="mb-8" style={pop(100)}>
          <div className="relative">
            {/* 펄스 링 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(255,51,85,0.15)",
                transform: "scale(1.4)",
                animation: mounted ? "pulse-glow 2s ease-in-out infinite 0.5s" : "none",
              }}
            />
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-5xl relative z-10"
              style={{
                background: "linear-gradient(135deg, #FF3355, #ff5570)",
                boxShadow: "0 20px 50px -10px rgba(255,51,85,0.5)",
                animation: mounted ? "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 100ms both" : "none",
              }}
            >
              ✓
            </div>
            <div className="absolute -top-1 -right-1 text-2xl" style={{ animation: mounted ? "bounce-in 0.5s ease 400ms both" : "none" }}>🎉</div>
            <div className="absolute -bottom-1 -left-2 text-xl" style={{ animation: mounted ? "bounce-in 0.5s ease 500ms both" : "none" }}>✨</div>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="text-center mb-8" style={slide(250)}>
          <h1 className="text-[32px] font-black text-slate-900 leading-tight mb-2">
            인증 완료! 🔥
          </h1>
          <p className="text-slate-500 text-[14px] leading-relaxed">
            {verifiedGoal ? <><span className="font-bold text-slate-700">"{verifiedGoal.title}"</span> 달성!</> : "오늘의 목표를 달성하셨어요!"}<br />
            꾸준함이 습관을 만듭니다.
          </p>
        </div>

        {/* 연속 기록 카드 */}
        <div
          className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-100 mb-3 relative overflow-hidden"
          style={{ ...slide(350), boxShadow: `0 4px 20px ${verifiedGoal ? verifiedGoal.color + "18" : "rgba(255,51,85,0.08)"}` }}
        >
          <div
            className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full"
            style={{ background: `radial-gradient(circle, ${verifiedGoal?.color ?? "#FF3355"}18 0%, transparent 70%)` }}
          />
          <div className="flex items-center gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", border: "1px solid #fed7aa" }}
            >
              🔥
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">현재 연속 기록</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-black text-slate-900 leading-none">{verifiedGoal?.streak ?? 1}</span>
                <span className="text-[14px] text-slate-500 font-semibold">일째 성공 중</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
          </div>
        </div>

        {/* 통계 그리드 */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm mb-4" style={slide(450)}>
          {[
            { icon: Trophy, label: "총 달성",  value: "24회", color: "#FF3355", bg: "#FFF0F3" },
            { icon: Flame,  label: "연속 기록", value: "8일",  color: "#f97316", bg: "#fff7ed" },
            { icon: Zap,    label: "성공률",   value: "92%",  color: "#7c3aed", bg: "#f5f3ff" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-slate-100"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-[15px] font-black text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* XP 획득 배너 */}
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden mb-4"
          style={{
            ...slide(540),
            background: "linear-gradient(110deg, #1A1A2E, #16213E)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,51,85,0.2)", border: "1px solid rgba(255,51,85,0.3)" }}
            >
              <Star className="w-5 h-5 text-[#FF3355] fill-[#FF3355]/40" />
            </div>
            <div className="flex-1">
              <p className="text-white/50 text-[11px] font-bold">XP 획득</p>
              <p className="text-white font-black text-[14px]">오늘 목표 달성 보상</p>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-[22px] font-black"
                style={{
                  color: "#FF3355",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "scale(1)" : "scale(0.5)",
                  transition: "opacity 0.5s cubic-bezier(0.34,1.56,0.64,1) 600ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 600ms",
                }}
              >
                +30 XP
              </p>
              <p className="text-white/40 text-[10px]">누적 1,270 XP</p>
            </div>
          </div>
          {/* XP 진행바 */}
          <div className="px-4 pb-3.5">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-white/30">Lv.7 도전자</span>
              <span className="text-[10px] text-white/30">Lv.8 전사까지 230 XP</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? "84.7%" : "82.7%",
                  background: "linear-gradient(90deg, #FF3355, #ff6680)",
                  boxShadow: "0 0 8px rgba(255,51,85,0.5)",
                  transition: "width 0.8s cubic-bezier(0.4,0,0.2,1) 700ms",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="shrink-0 px-6 pb-10 pt-3 bg-[#F5F6FA] relative z-10">
        <button
          onClick={() => navigate("/")}
          className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-[16px] active:scale-[0.98] transition-transform mb-3"
          style={{
            background: "linear-gradient(135deg, #FF3355, #ff5570)",
            boxShadow: "0 8px 24px -4px rgba(255,51,85,0.45)",
          }}
        >
          홈으로
          <ArrowRight className="w-5 h-5" />
        </button>
        <button className="w-full h-10 flex items-center justify-center gap-1.5 text-slate-400 text-[14px] font-medium hover:text-slate-600 transition-colors">
          <Share2 className="w-4 h-4" />
          인증 사진 공유하기
        </button>
      </div>
    </div>
  );
}
