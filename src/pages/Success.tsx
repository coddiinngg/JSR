import { X, Check, ArrowRight, Share2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Success() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 bg-[#F7F8FA] dark:bg-[#0A0A0A] relative h-full overflow-hidden">
      {/* 닫기 버튼 */}
      <div className="flex items-center p-4 justify-end absolute top-0 w-full z-20">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative w-full pt-10 overflow-y-auto">
        {/* 배경 장식 */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-green-100/40 via-blue-50/20 to-transparent dark:from-green-900/20 dark:via-blue-900/10 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute top-[25%] left-[20%] w-2 h-2 rounded-full bg-yellow-400 opacity-60"></div>
          <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-blue-400 opacity-50"></div>
          <div className="absolute top-[15%] right-[30%] w-2.5 h-2.5 rounded-full bg-green-400 opacity-40"></div>
          <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 rounded-full bg-pink-400 opacity-30"></div>
        </div>

        <div className="flex flex-col items-center z-10 w-full max-w-sm">
          {/* 체크 아이콘 */}
          <div className="mb-10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-green-100/50 dark:border-green-500/10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-green-200/60 dark:border-green-500/20 rounded-full border-dashed"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 rounded-full shadow-lg opacity-80"></div>
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#22c55e] to-[#15803d] shadow-[0_0_20px_rgba(34,197,94,0.3)] dark:shadow-green-900/50 transform transition-transform hover:scale-105 duration-300 ring-4 ring-white dark:ring-[#111827]">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <div className="absolute -top-2 left-0 text-xl">🎉</div>
            <div className="absolute -bottom-2 right-0 text-xl">✨</div>
          </div>

          {/* 텍스트 */}
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              오늘 목표 완료!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed max-w-[280px]">
              멋져요! 오늘의 목표를 달성하셨네요.<br />
              꾸준함이 습관을 만듭니다.
            </p>
          </div>

          {/* 연속 기록 카드 */}
          <div className="w-full bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 flex items-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 mb-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
            <div className="flex-shrink-0 mr-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-slate-800 flex items-center justify-center text-2xl shadow-sm border border-orange-100 dark:border-orange-800/30">
                🔥
              </div>
            </div>
            <div className="flex-1 text-left relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">현재 연속 기록</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 dark:text-white">8</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">일째 성공 중</span>
              </div>
            </div>
            <div className="flex-shrink-0 relative z-10">
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            </div>
          </div>

          {/* 통계 그리드 */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <span className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">총 달성</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">24회</span>
            </div>
            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <span className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">성공률</span>
              <span className="text-xl font-bold text-emerald-500">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="w-full px-6 pb-10 pt-4 bg-[#F7F8FA] dark:bg-[#0A0A0A] z-20 relative shrink-0">
        <div className="absolute top-[-20px] left-0 right-0 h-6 bg-gradient-to-t from-[#F7F8FA] dark:from-[#0A0A0A] to-transparent"></div>
        <button
          onClick={() => navigate("/")}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 active:scale-[0.98] transition-all duration-200 flex items-center justify-center shadow-lg shadow-green-500/30 dark:shadow-green-900/40 group"
        >
          <span className="text-white text-[17px] font-bold tracking-wide mr-2">홈으로 돌아가기</span>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="w-full mt-5 h-auto py-2 flex items-center justify-center text-slate-400 hover:text-[#0066FF] dark:text-slate-500 dark:hover:text-white font-semibold text-sm transition-colors group">
          <Share2 className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
          인증 사진 공유하기
        </button>
      </div>
    </div>
  );
}
