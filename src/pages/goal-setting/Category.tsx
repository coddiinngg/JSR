import { ChevronLeft, Dumbbell, GraduationCap, BookOpen, Repeat, Palette, MoreHorizontal, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { useApp } from "../../contexts/AppContext";

const categories = [
  { id: "exercise", icon: Dumbbell,       label: "운동",  sub: "건강한 신체" },
  { id: "study",    icon: GraduationCap,  label: "공부",  sub: "새로운 지식" },
  { id: "reading",  icon: BookOpen,       label: "독서",  sub: "마음의 양식" },
  { id: "habit",    icon: Repeat,         label: "습관",  sub: "매일의 약속" },
  { id: "hobby",    icon: Palette,        label: "취미",  sub: "즐거운 시간" },
  { id: "etc",      icon: MoreHorizontal, label: "기타",  sub: "자유 주제"   },
];

export function Category() {
  const navigate = useNavigate();
  const { setGoalDraft } = useApp();
  const [selected, setSelected] = useState("exercise");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F1117] text-white">

      {/* 배경 오브 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#FF3355]/18 blur-[80px] anim-shimmer" />
        <div className="absolute -left-16 top-48 h-44 w-44 rounded-full bg-[#FF3355]/12 blur-2xl anim-float" />
        <div className="absolute -right-16 top-64 h-52 w-52 rounded-full bg-violet-600/8 blur-2xl anim-float-r" />
      </div>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center justify-between px-4 pt-4 pb-3 z-10"
        style={{ animation: "ob-fade 0.4s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[13px] font-semibold text-white/40 tracking-widest uppercase">1 / 3</span>
        <div className="w-10" />
      </div>

      {/* 스텝 인디케이터 */}
      <div
        className="shrink-0 flex gap-1.5 px-5 pb-1 z-10"
        style={{ animation: "ob-fade 0.4s ease 60ms both" }}
      >
        {[0,1,2].map(i => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              flex: i === 0 ? 2 : 1,
              background: i === 0 ? "#FF3355" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>

      {/* 타이틀 */}
      <div className="shrink-0 px-5 pt-5 pb-4 z-10">
        <div style={{ animation: "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 120ms both" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">카테고리 선택</p>
          <h1 className="text-[28px] font-black leading-tight tracking-tight">
            어떤 목표를<br />이루고 싶으세요?
          </h1>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 z-10">
        <div className="grid grid-cols-2 gap-3">
          {categories.map(({ id, icon: Icon, label, sub }, i) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={cn(
                  "relative flex flex-col items-center text-center gap-2.5 p-5 rounded-3xl border-2 transition-all duration-250 active:scale-[0.96]",
                  isSelected
                    ? "border-[#FF3355] bg-[#FF3355]/15"
                    : "border-white/10 bg-white/[0.05] hover:border-white/20"
                )}
                style={{
                  animation: mounted ? `ob-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 55}ms both` : "none",
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-3 right-3"
                    style={{ animation: "ob-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FF3355]" strokeWidth={2.5} />
                  </div>
                )}
                <div className={cn(
                  "w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-250",
                  isSelected ? "bg-[#FF3355] shadow-[0_6px_20px_rgba(255,51,85,0.45)]" : "bg-white/10"
                )}>
                  <Icon className={cn("w-7 h-7", isSelected ? "text-white" : "text-white/60")} strokeWidth={1.8} />
                </div>
                <div>
                  <p className={cn("text-[15px] font-bold transition-colors", isSelected ? "text-white" : "text-white/80")}>{label}</p>
                  <p className={cn("text-[11px] font-medium mt-0.5 transition-colors", isSelected ? "text-[#FF9DB2]" : "text-white/35")}>{sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div
        className="shrink-0 px-5 pb-10 pt-4 z-10"
        style={{ animation: "ob-fade 0.5s ease 400ms both" }}
      >
        <button
          onClick={() => { setGoalDraft({ category: selected }); navigate("/goal-setting/frequency"); }}
          className="anim-gradient-x flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)] text-[17px] font-black text-white shadow-[0_12px_28px_-8px_rgba(255,51,85,0.6)] active:scale-[0.98] transition-transform group"
        >
          다음
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
