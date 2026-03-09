import { ChevronLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const suggestions = [
  "매일 30분 유산소",
  "아침 명상 10분",
  "하루 물 2L",
  "저녁 독서 30페이지",
  "주 3회 근력 운동",
  "오전 7시 스트레칭",
];

export function GoalName() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [time, setTime] = useState("07:00");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center p-4 pb-2 justify-between border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-[17px] font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          목표 설정
        </h2>
      </div>

      {/* 스텝 4/4 */}
      <div className="shrink-0 flex flex-col gap-2 px-5 pt-4 pb-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">목표 이름 & 알림</p>
          <p className="text-[#0066FF] text-sm font-bold">4/4</p>
        </div>
        <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#0066FF] rounded-full w-full transition-all duration-500" />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        <h3 className="text-[26px] font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-1.5">
          목표 이름을<br />정해주세요
        </h3>
        <p className="text-[14px] text-slate-400 dark:text-slate-500 mb-8">
          구체적일수록 달성률이 높아져요!
        </p>

        {/* 목표 이름 입력 */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            목표 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 매일 아침 30분 달리기"
            className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base font-medium focus:outline-none focus:border-[#0066FF] transition-colors"
          />
        </div>

        {/* 알림 시간 */}
        <div className="mb-8">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            매일 알림 시간
          </label>
          <div className="flex items-center justify-between h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-[#0066FF] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#0066FF]" />
              </div>
              <span className="text-base font-medium text-slate-700 dark:text-slate-300">알림 설정</span>
            </div>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-base font-bold text-[#0066FF] bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* 추천 이름 */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">추천 목표</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setName(s)}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-[#EEF4FF] hover:text-[#0066FF] dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <div className="shrink-0 px-5 pb-8 pt-4 bg-white dark:bg-slate-900">
        <button
          onClick={() => navigate("/")}
          disabled={!name.trim()}
          className="w-full h-14 bg-[#0066FF] disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 hover:bg-[#0052cc] active:scale-[0.98] text-white text-[17px] font-bold rounded-full transition-all shadow-[0_8px_20px_-4px_rgba(0,102,255,0.35)] disabled:shadow-none"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
