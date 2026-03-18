import { ChevronLeft, Bell, Trophy, BarChart2, Clock, Zap, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "../lib/utils";
import { CoachCharacter } from "../components/CoachCharacter";
import { useApp } from "../contexts/AppContext";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
        value ? "bg-[#FF3355]" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200",
          value ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

const COACH_TYPES = [
  { id: "king",     emoji: "👑", label: "잔소리 대마왕", desc: "직설적이고 강한 메시지" },
  { id: "pressure", emoji: "⏰", label: "압박",          desc: "시간 압박 동기부여" },
  { id: "gentle",   emoji: "🌿", label: "온화",          desc: "따뜻한 격려 메시지" },
];

export function NotificationSettings() {
  const navigate = useNavigate();
  const { coachType, setCoachType } = useApp();
  const [daily, setDaily] = useState(true);
  const [time, setTime] = useState("07:00");
  const [challenge, setChallenge] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [achievementAlert, setAchievementAlert] = useState(true);
  const [coachNag, setCoachNag] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(coachType);

  return (
    <div className="flex flex-col h-full bg-[#F5F6FA] overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center px-4 pt-12 pb-4 bg-white border-b border-slate-100">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-[17px] font-black text-slate-900 ml-3">알림 설정</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* 일일 목표 알림 */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">일일 알림</p>
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FFF0F3]">
                <Bell className="w-4 h-4 text-[#FF3355]" />
              </div>
              <span className="flex-1 text-[14px] font-semibold text-slate-800">매일 목표 알림</span>
              <Toggle value={daily} onChange={setDaily} />
            </div>

            {daily && (
              <>
                <div className="h-px bg-slate-50 mx-4" />
                <div className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="flex-1 text-[14px] font-semibold text-slate-800">알림 시간</span>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="text-[14px] font-black text-[#FF3355] bg-transparent focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 잔소리 코치 알림 */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">잔소리 코치 알림</p>
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FFF0F3]">
                <MessageSquare className="w-4 h-4 text-[#FF3355]" />
              </div>
              <span className="flex-1 text-[14px] font-semibold text-slate-800">코치 잔소리 알림</span>
              <Toggle value={coachNag} onChange={setCoachNag} />
            </div>

            {coachNag && (
              <>
                <div className="h-px bg-slate-50" />
                <div className="p-4 pt-3">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mb-3">코치 유형 선택</p>
                  <div className="space-y-2">
                    {COACH_TYPES.map(({ id, emoji, label, desc }) => (
                      <button
                        key={id}
                        onClick={() => setSelectedCoach(id as "king" | "pressure" | "gentle")}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-200",
                          selectedCoach === id
                            ? "border-[#FF3355] bg-[#FFF0F3]"
                            : "border-slate-100 bg-white"
                        )}
                      >
                        <span className="text-xl shrink-0">{emoji}</span>
                        <div className="flex-1">
                          <p className={cn("text-[13px] font-bold", selectedCoach === id ? "text-[#FF3355]" : "text-slate-800")}>{label}</p>
                          <p className="text-[11px] text-slate-400">{desc}</p>
                        </div>
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedCoach === id ? "border-[#FF3355] bg-[#FF3355]" : "border-slate-200"
                          )}
                        >
                          {selectedCoach === id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 기타 알림 */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">기타 알림</p>
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            {[
              { icon: Trophy,    color: "#FF3355", bg: "#FFF0F3", label: "챌린지 알림",     value: challenge,      onChange: setChallenge      },
              { icon: BarChart2, color: "#3b82f6", bg: "#eff6ff", label: "주간 리포트",      value: weeklyReport,   onChange: setWeeklyReport   },
              { icon: Zap,       color: "#a855f7", bg: "#f5f3ff", label: "목표 달성 축하",   value: achievementAlert, onChange: setAchievementAlert },
            ].map(({ icon: Icon, color, bg, label, value, onChange }, i) => (
              <div key={label}>
                {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="flex-1 text-[14px] font-semibold text-slate-800">{label}</span>
                  <Toggle value={value} onChange={onChange} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 미리보기 */}
        {coachNag && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">메시지 미리보기</p>
            <div className="bg-[#0F1117] rounded-2xl p-4 border border-white/5">
              <div className="flex items-end gap-3">
                <div className="shrink-0 -mb-1">
                  <CoachCharacter
                    type={selectedCoach as "king" | "pressure" | "gentle"}
                    size={64}
                    animated
                  />
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-white/40 text-[11px] font-semibold mb-1">
                    {COACH_TYPES.find(c => c.id === selectedCoach)?.label} · 오전 7:00
                  </p>
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                    <p className="text-white text-[13px] font-semibold leading-relaxed">
                      {selectedCoach === "king" && "지금 안 하면 언제 하려고???!! 얼른 해!"}
                      {selectedCoach === "pressure" && "아직 안 했네? 시간이 많지 않을텐데?"}
                      {selectedCoach === "gentle" && "오늘 조금만 해도 충분해. 같이 해보자!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* 저장 버튼 */}
      <div className="shrink-0 px-4 pb-8 pt-3 bg-[#F5F6FA]">
        <button
          onClick={() => { setCoachType(selectedCoach as "king" | "pressure" | "gentle"); navigate(-1); }}
          className="w-full h-14 rounded-2xl text-white font-bold text-[15px] active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #FF3355, #ff5570)", boxShadow: "0 6px 20px -4px rgba(255,51,85,0.45)" }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
