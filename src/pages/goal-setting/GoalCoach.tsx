import { ChevronLeft, ArrowRight, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { CoachCharacter } from "../../components/CoachCharacter";

const coaches = [
  {
    id: "king",
    emoji: "👑",
    label: "잔소리 대마왕",
    sub: "규율과 성과를 중시하는 직설적인 스타일",
    accent: "from-red-500 to-orange-500",
    glow: "rgba(239,68,68,0.4)",
    sampleMessages: [
      "지금 안 하면 언제 하려고???!!",
      "아직도 안 했어? 내가 아까부터 하라고 했잖아. 나중에 또 밤에 허겁지겁 할 거지?",
      "이상한 핑계 대지 말고 얼른 해!",
    ],
  },
  {
    id: "pressure",
    emoji: "⏰",
    label: "압박",
    sub: "시간과 결과로 동기부여 하는 스타일",
    accent: "from-[#FF3355] to-pink-500",
    glow: "rgba(255,51,85,0.4)",
    sampleMessages: [
      "아직 안 했네? 시간이 많지 않을텐데?",
      "엄마는 그냥 말해주는 거야. 나중에 힘든 건 너잖아",
      "지금 잠깐만 하자. 시작하면 생각보다 금방 끝나",
    ],
  },
  {
    id: "gentle",
    emoji: "🌿",
    label: "온화",
    sub: "따뜻한 격려와 공감으로 이끄는 스타일",
    accent: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.4)",
    sampleMessages: [
      "(닉네임)이/가 할 수 있는 거 엄마 다 알아. 조금만 해보자",
      "시작이 제일 어려운 거야. (닉네임)야, 일단 해보자",
      "오늘 조금만 해도 충분해. 너무 부담 갖지 마",
    ],
  },
];

export function GoalCoach() {
  const navigate = useNavigate();
  const { setCoachType } = useApp();
  const [selected, setSelected] = useState("pressure");
  const [mounted, setMounted] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const selectedCoach = coaches.find(c => c.id === selected)!;

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
        {[0, 1, 2, 3].map(i => (
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
      <div className="shrink-0 px-5 pt-5 pb-2 z-10">
        <div style={{ animation: "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 120ms both" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">코치 선택</p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight">
            어떤 잔소리가<br />맞으세요?
          </h1>
        </div>
      </div>

      {/* 캐릭터 미리보기 */}
      <div className="shrink-0 relative flex justify-center items-end z-10 pb-1 pt-2" style={{ height: 120 }}>
        {coaches.map(({ id }) => (
          <div
            key={id}
            className="absolute transition-all duration-300"
            style={{
              opacity: selected === id ? 1 : 0,
              transform: selected === id ? "scale(1) translateY(0)" : "scale(0.75) translateY(10px)",
              pointerEvents: "none",
            }}
          >
            <CoachCharacter
              type={id as "king" | "pressure" | "gentle"}
              size={90}
              animated
              talking
            />
          </div>
        ))}
      </div>

      {/* 코치 카드 */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 z-10 space-y-3">
        {coaches.map(({ id, emoji, label, sub, accent, glow }, i) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-[#FF3355] bg-[#FF3355]/10"
                  : "border-white/10 bg-white/[0.05] hover:border-white/20"
              )}
              style={{
                animation: mounted ? `ob-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 70}ms both` : "none",
              }}
            >
              {/* 이모지 아이콘 */}
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-200",
                  isSelected ? `bg-gradient-to-br ${accent}` : "bg-white/10"
                )}
                style={isSelected ? { boxShadow: `0 8px 20px ${glow}` } : {}}
              >
                {emoji}
              </div>

              <div className="flex-1">
                <p className={cn("text-[15px] font-bold leading-snug transition-colors", isSelected ? "text-white" : "text-white/75")}>
                  {label}
                </p>
                <p className={cn("text-[12px] font-medium mt-0.5 leading-snug transition-colors", isSelected ? "text-[#FF9DB2]" : "text-white/30")}>
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

        {/* 예시 메시지 미리보기 */}
        <div
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          style={{ animation: mounted ? "ob-fade 0.5s ease 300ms both" : "none" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-[#FF3355]" />
            <span className="text-[12px] font-bold text-white/50 uppercase tracking-widest">예시 메시지</span>
            <span className="text-[11px] text-white/30 font-medium">{selectedCoach.label}</span>
          </div>
          <div className="space-y-2">
            {selectedCoach.sampleMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => setPreviewIdx(previewIdx === i ? null : i)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed font-medium transition-all duration-200",
                  previewIdx === i
                    ? "bg-[#FF3355]/15 text-white border border-[#FF3355]/30"
                    : "bg-white/[0.06] text-white/60 border border-transparent hover:bg-white/10"
                )}
              >
                "{msg}"
              </button>
            ))}
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* 하단 버튼 */}
      <div
        className="shrink-0 px-5 pb-10 pt-4 z-10"
        style={{ animation: "ob-fade 0.5s ease 400ms both" }}
      >
        <button
          onClick={() => {
            setCoachType(selected as "king" | "pressure" | "gentle");
            navigate("/goal-setting/name");
          }}
          className="anim-gradient-x flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)] text-[17px] font-black text-white shadow-[0_12px_28px_-8px_rgba(255,51,85,0.6)] active:scale-[0.98] transition-transform group"
        >
          다음
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
