import { ChevronLeft, Bell, Trophy, BarChart2, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
        value ? "bg-[#0066FF]" : "bg-slate-200 dark:bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function NotificationSettings() {
  const navigate = useNavigate();
  const [daily, setDaily] = useState(true);
  const [time, setTime] = useState("07:00");
  const [challenge, setChallenge] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [achievementAlert, setAchievementAlert] = useState(true);
  const [reminderAlert, setReminderAlert] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center px-4 pt-12 pb-4 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors -ml-1"
        >
          <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white ml-1">알림 설정</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* 일일 알림 */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
            일일 알림
          </p>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 dark:border-white/5">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">매일 목표 알림</span>
              <Toggle value={daily} onChange={setDaily} />
            </div>

            {daily && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 ml-16" />
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">알림 시간</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="text-sm font-bold text-[#0066FF] bg-transparent focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 리마인더 */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
            리마인더
          </p>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 dark:border-white/5">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">마감 리마인더</p>
                <p className="text-xs text-slate-400 mt-0.5">목표 마감 1시간 전 알림</p>
              </div>
              <Toggle value={reminderAlert} onChange={setReminderAlert} />
            </div>
          </div>
        </div>

        {/* 커뮤니티 */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
            커뮤니티
          </p>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 dark:border-white/5">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">챌린지 알림</p>
                <p className="text-xs text-slate-400 mt-0.5">그룹 활동 및 랭킹 변동</p>
              </div>
              <Toggle value={challenge} onChange={setChallenge} />
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 ml-16" />
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">주간 리포트</p>
                <p className="text-xs text-slate-400 mt-0.5">매주 월요일 지난 주 요약</p>
              </div>
              <Toggle value={weeklyReport} onChange={setWeeklyReport} />
            </div>
          </div>
        </div>

        {/* 달성 */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
            달성
          </p>
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 dark:border-white/5">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">달성 축하 알림</p>
                <p className="text-xs text-slate-400 mt-0.5">목표 완료 및 연속 기록 달성 시</p>
              </div>
              <Toggle value={achievementAlert} onChange={setAchievementAlert} />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-2">
          알림을 받으려면 기기 설정에서 JSR 알림을 허용해야 해요.
        </p>
      </div>
    </div>
  );
}
