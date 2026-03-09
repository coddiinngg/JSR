import { ChevronLeft, Timer, Heart, Leaf, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";

const coaches = [
  {
    id: "strict",
    icon: Timer,
    label: "엄격한 코치",
    sub: "규율과 성과를 중시하는 스타일",
    accent: "from-red-500 to-orange-500",
    glow: "rgba(239,68,68,0.4)",
  },
  {
    id: "supportive",
    icon: Heart,
    label: "응원형 코치",
    sub: "따뜻한 격려와 동기부여를 주는 스타일",
    accent: "from-[#FF3355] to-pink-500",
    glow: "rgba(255,51,85,0.4)",
  },
  {
    id: "calm",
    icon: Leaf,
    label: "차분한 코치",
    sub: "차분하게 마음챙김을 도와주는 스타일",
    accent: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.4)",
  },
];

export function GoalCoach() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("supportive");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F1117] text-white">

      {/* 배경 오브 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#FF3355]/15 blur-[80px] anim-shimmer" />
        <div className="absolute -left-16 top-44 h-48 w-48 rounded-full bg-[#FF3355]/10 blur-2xl anim-float" />
        <div className="absolute -right-16 bottom-40 h-52 w-52 rounded-full bg-violet-600/8 blur-2xl anim-float-r" />
      </div>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center justify-between px-4 pt-12 pb-3 z-10"
        style={{ animation: "ob-fade 0.4s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[13px] font-semibold text-white/40 tracking-widest uppercase">3 / 4</span>
        <div className="w-10" />
      </div>

      {/* 스텝 인디케이터 */}
      <div
        className="shrink-0 flex gap-1.5 px-5 pb-1 z-10"
        style={{ animation: "ob-fade 0.4s ease 60ms both" }}
      >
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              flex: i <= 2 ? 2 : 1,
              background: i <= 2 ? "#FF3355" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      {/* 타이틀 */}
      <div className="shrink-0 px-5 pt-5 pb-4 z-10">
        <div style={{ animation: "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 120ms both" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">코치 선택</p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight">
            어떤 코치가<br />좋으세요?
          </h1>
        </div>
      </div>

      {/* 코치 카드 */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 z-10 space-y-3">
        {coaches.map(({ id, icon: Icon, label, sub, accent, glow }, i) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-[#FF3355] bg-[#FF3355]/10"
                  : "border-white/10 bg-white/[0.05] hover:border-white/20"
              )}
              style={{
                animation: mounted ? `ob-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 70}ms both` : "none",
              }}
            >
              {/* 아이콘 */}
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
                  isSelected
                    ? `bg-gradient-to-br ${accent}`
                    : "bg-white/10"
                )}
                style={isSelected ? { boxShadow: `0 8px 20px ${glow}` } : {}}
              >
                <Icon
                  className={cn("w-6 h-6", isSelected ? "text-white" : "text-white/45")}
                  strokeWidth={isSelected ? 2 : 1.8}
                />
              </div>

              <div className="flex-1">
                <p className={cn("text-[15px] font-bold leading-snug transition-colors", isSelected ? "text-white" : "text-white/75")}>
                  {label}
                </p>
                <p className={cn("text-[12px] font-medium mt-1 leading-snug transition-colors", isSelected ? "text-[#FF9DB2]" : "text-white/30")}>
                  {sub}
                </p>
              </div>

              {/* 라디오 */}
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                  isSelected ? "border-[#FF3355] bg-[#FF3355]" : "border-white/20 bg-transparent"
                )}
              >
                {isSelected && (
                  <div
                    className="w-2 h-2 bg-white rounded-full"
                    style={{ animation: "ob-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div
        className="shrink-0 px-5 pb-10 pt-4 z-10"
        style={{ animation: "ob-fade 0.5s ease 400ms both" }}
      >
        <button
          onClick={() => navigate("/goal-setting/name")}
          className="anim-gradient-x flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)] text-[17px] font-black text-white shadow-[0_12px_28px_-8px_rgba(255,51,85,0.6)] active:scale-[0.98] transition-transform group"
        >
          다음
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
