import { ChevronLeft, CalendarDays, Repeat, SlidersHorizontal, PlayCircle, StopCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";

const options = [
  { id: "daily",  icon: CalendarDays,    label: "매일",      sub: "Daily" },
  { id: "weekly", icon: Repeat,          label: "주 3회",    sub: "3× a week" },
  { id: "custom", icon: SlidersHorizontal, label: "직접 설정", sub: "Custom" },
];

export function GoalFrequency() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("daily");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F1117] text-white">

      {/* 배경 오브 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#FF3355]/15 blur-[80px] anim-shimmer" />
        <div className="absolute -right-20 top-40 h-52 w-52 rounded-full bg-violet-600/10 blur-2xl anim-float-r" />
        <div className="absolute -left-10 bottom-32 h-40 w-40 rounded-full bg-[#FF3355]/10 blur-2xl anim-float" />
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
        <span className="text-[13px] font-semibold text-white/40 tracking-widest uppercase">2 / 4</span>
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
              flex: i <= 1 ? 2 : 1,
              background: i <= 1 ? "#FF3355" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      {/* 타이틀 */}
      <div className="shrink-0 px-5 pt-5 pb-4 z-10">
        <div style={{ animation: "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 120ms both" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">빈도 설정</p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight">
            얼마나 자주<br />할까요?
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 z-10 space-y-3">

        {/* 빈도 옵션 */}
        <div className="space-y-2.5">
          {options.map(({ id, icon: Icon, label, sub }, i) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]",
                  isSelected
                    ? "border-[#FF3355] bg-[#FF3355]/12"
                    : "border-white/10 bg-white/[0.05] hover:border-white/20"
                )}
                style={{
                  animation: mounted ? `ob-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms both` : "none",
                }}
              >
                <div className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
                  isSelected ? "bg-[#FF3355] shadow-[0_6px_18px_rgba(255,51,85,0.4)]" : "bg-white/10"
                )}>
                  <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-white/50")} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-[15px] font-bold transition-colors", isSelected ? "text-white" : "text-white/75")}>{label}</p>
                  <p className={cn("text-[12px] font-medium mt-0.5 transition-colors", isSelected ? "text-[#FF9DB2]" : "text-white/35")}>{sub}</p>
                </div>
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

        {/* 기간 설정 */}
        <div
          className="space-y-2"
          style={{ animation: mounted ? "ob-fade 0.4s ease 240ms both" : "none" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 px-1 mt-2">기간 설정</p>

          {[
            { icon: PlayCircle, label: "시작일", value: today, accent: true },
            { icon: StopCircle, label: "종료일", value: "날짜 선택", accent: false },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-white/30" />
                <span className="text-[14px] font-semibold text-white/70">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[13px] font-bold", accent ? "text-[#FF3355]" : "text-white/35")}>{value}</span>
                <CalendarDays className="w-4 h-4 text-white/25" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div
        className="shrink-0 px-5 pb-10 pt-4 z-10"
        style={{ animation: "ob-fade 0.5s ease 400ms both" }}
      >
        <button
          onClick={() => navigate("/goal-setting/coach")}
          className="anim-gradient-x flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)] text-[17px] font-black text-white shadow-[0_12px_28px_-8px_rgba(255,51,85,0.6)] active:scale-[0.98] transition-transform group"
        >
          다음
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
