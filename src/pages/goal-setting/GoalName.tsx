import { ChevronLeft, Bell, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const suggestions = [
  "30분 러닝",
  "10분 명상",
  "물 2L",
  "독서 30p",
  "근력 3회",
  "아침 스트레칭",
];

export function GoalName() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [time, setTime] = useState("07:00");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F1117] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="anim-gradient-x absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#FF3355_0%,rgba(255,51,85,0)_70%)] opacity-90" />
        <div className="anim-float absolute -left-16 top-40 h-48 w-48 rounded-full bg-[#FF3355]/25 blur-2xl" />
        <div className="anim-float-r absolute -right-16 top-56 h-56 w-56 rounded-full bg-[#FF3355]/20 blur-2xl" />
      </div>

      <div className="shrink-0 flex items-center justify-between p-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="pr-10 text-center text-[17px] font-bold tracking-tight text-white/90">GOAL</h2>
      </div>

      <div className="anim-fade-up relative z-10 px-5 pt-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-9 rounded-full bg-[#FF3355]" />
          <span className="h-1.5 w-9 rounded-full bg-[#FF3355]" />
          <span className="h-1.5 w-9 rounded-full bg-[#FF3355]" />
          <span className="h-1.5 w-9 rounded-full bg-[#FF3355]" />
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <div className="anim-fade-up rounded-[30px] border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Final</p>
              <h3 className="mt-1 text-[30px] font-black leading-[0.95]">MAKE IT REAL</h3>
            </div>
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-[#FF3355]/25">
              <span className="anim-pulse-ring absolute inset-0 rounded-2xl bg-[#FF3355]" />
              <Sparkles className="relative z-10 size-5 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="목표 한 줄"
              className="h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-base font-semibold text-white placeholder:text-white/45 focus:border-[#FF3355] focus:outline-none"
            />
            <div className="flex h-14 items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 transition-colors focus-within:border-[#FF3355]">
              <div className="flex items-center gap-2 text-white/85">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-semibold">알림</span>
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-base font-black text-[#FF3355] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {suggestions.map((s, index) => (
              <button
                key={s}
                onClick={() => setName(s)}
                className="anim-pop-in rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 transition-all hover:-translate-y-0.5 hover:border-[#FF3355]/80 hover:bg-[#FF3355]/25"
                style={{ animationDelay: `${0.06 * index}s` }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 shrink-0 px-5 pb-8 pt-4">
        <button
          onClick={() => navigate("/")}
          disabled={!name.trim()}
          className="anim-gradient-x flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)] text-[17px] font-black text-white shadow-[0_16px_30px_-10px_rgba(255,51,85,0.65)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:grayscale"
        >
          <Zap className="size-4 anim-shimmer" />
          START
        </button>
      </div>
    </div>
  );
}
