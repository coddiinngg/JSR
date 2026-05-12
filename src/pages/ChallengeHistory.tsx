import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, Calendar, CheckCircle2 } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { cn } from "../lib/utils";

function getPhase(start: string | null, end: string | null): "upcoming" | "active" | "ended" {
  if (!start || !end) return "active";
  const now = new Date();
  if (now < new Date(start)) return "upcoming";
  if (now > new Date(end)) return "ended";
  return "active";
}

function fmtDate(d: string): string {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

export function ChallengeHistory() {
  const navigate = useNavigate();
  const { groups, verificationHistory } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const participated = groups
    .filter(g => g.joined || g.isRemoved || g.isLeft)
    .sort((a, b) => {
      // 진행중 먼저 → 종료 → 탈퇴됨 → 퇴장됨
      const rank = (g: typeof a) => {
        if (g.isRemoved) return 4;
        if (g.isLeft)    return 3;
        const p = getPhase(g.challengeStart, g.challengeEnd);
        if (p === "active") return 0;
        if (p === "upcoming") return 1;
        return 2;
      };
      return rank(a) - rank(b);
    });

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA]">
      <style>{`@keyframes ch-in { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }`}</style>

      <header
        className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-3 bg-white border-b border-black/[0.05]"
        style={{ animation: "ch-in 0.35s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-[18px] font-black text-slate-900">참여했던 챌린지</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">총 {participated.length}개</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
        {participated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">🏆</div>
            <p className="text-slate-500 font-bold text-[15px]">참여한 챌린지가 없어요</p>
            <p className="text-slate-400 text-[13px] text-center leading-relaxed">챌린지 탭에서 그룹에 참여해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participated.map((group, i) => {
              const phase = getPhase(group.challengeStart, group.challengeEnd);
              const verifyCount = verificationHistory.filter(v => {
                if (v.group_id !== group.dbId || v.status !== "completed") return false;
                const t = new Date(v.verified_at).getTime();
                if (group.challengeStart && t < new Date(group.challengeStart).getTime()) return false;
                if (group.challengeEnd   && t > new Date(group.challengeEnd).getTime())   return false;
                return true;
              }).length;

              const statusLabel = group.isRemoved
                ? "퇴장됨"
                : group.isLeft
                ? "탈퇴됨"
                : phase === "ended"
                ? "종료됨"
                : phase === "upcoming"
                ? "시작 전"
                : "진행중";

              const statusStyle = group.isRemoved
                ? "text-slate-400 bg-slate-100"
                : group.isLeft
                ? "text-slate-400 bg-slate-100"
                : phase === "ended"
                ? "text-slate-500 bg-slate-100"
                : phase === "upcoming"
                ? "text-amber-600 bg-amber-50"
                : "text-emerald-600 bg-emerald-50";

              return (
                <div
                  key={group.id}
                  onClick={() => { if (!group.isRemoved && !group.isLeft) navigate(`/challenge/group/${group.id}`); }}
                  className={cn(
                    "bg-white rounded-2xl p-4 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
                    (group.isRemoved || group.isLeft) ? "cursor-default" : "active:scale-[0.99] cursor-pointer transition-transform"
                  )}
                  style={{
                    opacity: mounted ? ((group.isRemoved || group.isLeft) ? 0.62 : 1) : 0,
                    transform: mounted ? "translateY(0)" : "translateY(14px)",
                    transition: `opacity 0.4s ease ${i * 55}ms, transform 0.4s ease ${i * 55}ms`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* 이모지 아이콘 */}
                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-[22px] shrink-0 border border-black/[0.04]">
                      {group.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 제목 + 상태 */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="text-[15px] font-black text-slate-900 truncate">{group.title}</p>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", statusStyle)}>
                          {statusLabel}
                        </span>
                      </div>

                      {/* 챌린지 기간 */}
                      {group.challengeStart && group.challengeEnd && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <p className="text-[11px] text-slate-400">
                            {fmtDate(group.challengeStart)} ~ {fmtDate(group.challengeEnd)}
                          </p>
                        </div>
                      )}

                      {/* 멤버 수 + 내 인증 횟수 */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] text-slate-400">{group.members}명</span>
                        </div>
                        {verifyCount > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#FF3355]" />
                            <span className="text-[11px] text-[#FF3355] font-bold">내 인증 {verifyCount}회</span>
                          </div>
                        )}
                        {!group.isRemoved && group.crewRate != null && phase !== "upcoming" && (
                          <span className="text-[11px] text-slate-400">크루 {group.crewRate}%</span>
                        )}
                      </div>
                    </div>

                    {!group.isRemoved && !group.isLeft && (
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
