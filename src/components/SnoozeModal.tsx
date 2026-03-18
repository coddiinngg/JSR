import { useState } from "react";
import { Ticket, AlertTriangle, Lock } from "lucide-react";
import { cn } from "../lib/utils";
import { useApp } from "../contexts/AppContext";

interface SnoozeModalProps {
  goalId: string;
  onClose: () => void;
  onSnooze: () => void;
}

const SNOOZE_WARNINGS = [
  "정말요? 지금 포기하면 내일이 더 힘들어요...",
  "오늘 건너뛰면 연속 기록이 끊겨요!",
  "딱 1번만 더 해봐요. 시작이 제일 어렵다고 했잖아요.",
];

export function SnoozeModal({ goalId, onClose, onSnooze }: SnoozeModalProps) {
  const { recoveryTickets, useRecoveryTicket, skipGoalToday } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [warning] = useState(() => SNOOZE_WARNINGS[Math.floor(Math.random() * SNOOZE_WARNINGS.length)]);
  const noTickets = recoveryTickets <= 0;

  const handleSnooze = () => {
    if (noTickets) return;
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    useRecoveryTicket();
    skipGoalToday(goalId);
    onSnooze();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <style>{`
        @keyframes sheet-up { from{transform:translateY(100%);}to{transform:translateY(0);} }
      `}</style>

      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full bg-white rounded-t-[28px] px-6 pt-5 pb-10 mx-0 max-w-none"
        style={{ animation: "sheet-up 0.3s cubic-bezier(0.4,0,0.2,1) both" }}
      >
        {/* 핸들 */}
        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: noTickets ? "#F1F5F9" : confirmed ? "#FFF3CD" : "#FFF0F3",
              border: `2px solid ${noTickets ? "#CBD5E1" : confirmed ? "#F59E0B" : "#FFD6DC"}`,
            }}
          >
            {noTickets
              ? <Lock className="w-8 h-8 text-slate-400" />
              : confirmed
                ? <AlertTriangle className="w-8 h-8 text-amber-500" />
                : <span className="text-3xl">😴</span>
            }
          </div>
        </div>

        {/* 텍스트 */}
        <div className="text-center mb-5">
          <h2 className="text-[20px] font-black text-slate-900 mb-2">
            {noTickets ? "복구권이 없어요" : confirmed ? "정말 건너뛸까요?" : "오늘 건너뛰기"}
          </h2>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            {noTickets
              ? "복구권을 모두 사용했어요.\n오늘은 꼭 해봐요! 💪"
              : confirmed
                ? <span className="text-amber-600 font-semibold">{warning}</span>
                : "복구권 1개를 사용해서 오늘을 건너뛸 수 있어요."
            }
          </p>
        </div>

        {/* 복구권 상태 */}
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 mb-5 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
              <Ticket className={cn("w-4 h-4", noTickets ? "text-slate-300" : "text-[#FF3355]")} />
            </div>
            <span className="text-[13px] font-semibold text-slate-600">
              {noTickets ? "복구권 없음" : "차감: 복구권 1개"}
            </span>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full border",
            noTickets
              ? "bg-slate-100 border-slate-200"
              : "bg-[#FFF0F3] border-[#FFD6DC]"
          )}>
            <span className={cn(
              "text-[13px] font-bold",
              noTickets ? "text-slate-400" : "text-[#FF3355]"
            )}>
              잔여 {recoveryTickets}개
            </span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          {noTickets ? (
            <button
              onClick={onClose}
              className="w-full h-14 rounded-2xl bg-[#FF3355] text-white font-bold text-[15px] active:scale-[0.98] transition-all"
              style={{ boxShadow: "0 6px 20px -4px rgba(255,51,85,0.45)" }}
            >
              알겠어요, 할게요! 💪
            </button>
          ) : (
            <>
              <button
                onClick={handleSnooze}
                className={cn(
                  "w-full h-14 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98]",
                  confirmed
                    ? "bg-amber-500 text-white shadow-[0_6px_20px_-4px_rgba(245,158,11,0.5)]"
                    : "bg-[#FF3355] text-white shadow-[0_6px_20px_-4px_rgba(255,51,85,0.45)]"
                )}
              >
                {confirmed ? "그래도 건너뛰기" : "건너뛰기"}
              </button>
              <button
                onClick={onClose}
                className="w-full h-12 text-slate-400 font-medium text-[14px] hover:text-slate-600 transition-colors"
              >
                {confirmed ? "아니요, 할게요! 💪" : "취소"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
