import { ChevronLeft, Bell, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../../contexts/AppContext";

const suggestions = [
  "30분 러닝",
  "10분 명상",
  "물 2L",
  "독서 30p",
  "근력 3회",
  "아침 스트레칭",
  "영어 단어 30개",
  "저탄고지 식단",
];

export function GoalName() {
  const navigate = useNavigate();
  const { nickname, addGoal } = useApp();
  const [name, setName] = useState("");
  const [time, setTime] = useState("07:00");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0F1117] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="anim-gradient-x absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#FF3355_0%,rgba(255,51,85,0)_70%)] opacity-90" />
        <div className="anim-float absolute -left-16 top-40 h-48 w-48 rounded-full bg-[#FF3355]/25 blur-2xl" />
        <div className="anim-float-r absolute -right-16 top-56 h-56 w-56 rounded-full bg-[#FF3355]/20 blur-2xl" />
      </div>

      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[13px] font-semibold text-white/40 tracking-widest uppercase">3 / 3</span>
        <div className="w-10" />
      </div>

      {/* 스텝 바 */}
      <div className="shrink-0 flex gap-1.5 px-5 pb-1 z-10">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: "#FF3355" }}
          />
        ))}
      </div>

      {/* 타이틀 */}
      <div className="shrink-0 px-5 pt-5 pb-4 z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">목표 이름</p>
        <h1 className="text-[28px] font-black leading-tight tracking-tight">
          마지막으로,<br />목표 이름을 정해요
        </h1>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 pt-2">
        {/* 목표 입력 카드 */}
        <div className="rounded-[24px] border border-white/15 bg-white/8 p-5 backdrop-blur-xl mb-4">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">목표 이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 30분 유산소"
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-[15px] font-semibold text-white placeholder:text-white/30 focus:border-[#FF3355] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex h-14 items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 transition-colors focus-within:border-[#FF3355]">
              <div className="flex items-center gap-2 text-white/70">
                <Bell className="h-4 w-4" />
                <span className="text-[14px] font-semibold">알림 시간</span>
              </div>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="bg-transparent text-[14px] font-black text-[#FF3355] focus:outline-none"
              />
            </div>
          </div>

          {/* 제안 태그 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={s}
                onClick={() => setName(s)}
                className="rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-[12px] font-semibold text-white/70 transition-all hover:border-[#FF3355]/60 hover:bg-[#FF3355]/15 hover:text-white active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 하단 버튼 */}
      <div className="relative z-10 shrink-0 px-5 pb-10 pt-4">
        <button
          onClick={() => { addGoal(name.trim(), time); navigate("/", { replace: true }); }}
          disabled={!name.trim()}
          className="anim-gradient-x flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)] text-[17px] font-black text-white shadow-[0_16px_30px_-10px_rgba(255,51,85,0.65)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale"
        >
          <CheckCircle2 className="size-5" />
          목표 시작하기
        </button>
      </div>
    </div>
  );
}
