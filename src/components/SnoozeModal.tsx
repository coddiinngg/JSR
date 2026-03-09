import { Moon, Ticket } from "lucide-react";

interface SnoozeModalProps {
  onClose: () => void;
  onSnooze: () => void;
}

export function SnoozeModal({ onClose, onSnooze }: SnoozeModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[6px] animate-in fade-in duration-300">
      <div className="w-full max-w-[320px] bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)] transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 mx-4">
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center relative">
            <div className="absolute w-16 h-16 rounded-full bg-[#0066FF]/10 animate-pulse"></div>
            <Moon className="w-10 h-10 text-[#0066FF] relative z-10 fill-[#0066FF]/20" />
            <span className="absolute top-3 right-4 text-[#0066FF]/60 text-lg font-bold animate-bounce" style={{ animationDuration: '2s' }}>z</span>
            <span className="absolute top-5 right-2 text-[#0066FF]/40 text-sm font-bold animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.2s' }}>z</span>
          </div>
        </div>

        <div className="text-center mb-6 space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">쉬어갈까요?</h2>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-2">
            오늘은 건너뛰어도 괜찮아요.<br />복구권 1개를 사용합니다.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl py-3.5 px-4 mb-8 flex items-center justify-between border border-slate-100 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-600">
              <Ticket className="w-4 h-4 text-[#0066FF]" />
            </div>
            <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">차감: 1 복구권</span>
          </div>
          <div className="bg-[#0066FF]/10 dark:bg-[#0066FF]/20 px-3 py-1.5 rounded-full border border-[#0066FF]/10">
            <span className="text-[13px] font-bold text-[#0066FF]">잔여 2개</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSnooze}
            className="w-full h-12 bg-[#0066FF] hover:bg-[#0052cc] active:scale-[0.98] text-white text-base font-semibold rounded-2xl transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,102,255,0.3)]"
          >
            건너뛰기
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-slate-500 dark:text-slate-400 text-base font-medium rounded-2xl transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
