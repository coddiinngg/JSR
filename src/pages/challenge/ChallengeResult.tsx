import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Zap, Flame, Users, ArrowRight, ChevronLeft, Crown, CheckCircle2, Calendar, ImageIcon } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { getBenefitGrade } from "../../lib/challengeUtils";
import { loadGroupLeaderboard, type LeaderboardItem } from "../../lib/leaderboard";
import { loadActivityFeed, formatActivityTime, type ActivityFeedItem } from "../../lib/activity";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";
import { cn } from "../../lib/utils";

interface Stats {
  myVerifyCount: number;
  myStreak: number;
  myRate: number;
  crewRate: number;
}

function fmtPeriod(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const fmt = (d: string) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
  };
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function ChallengeResult() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate    = useNavigate();
  const { groups, confirmEndedGroup } = useApp();
  const { user }    = useAuth();

  // 페이지 진입 시 즉시 확인 완료 처리 — 홈 카드 제거
  useEffect(() => {
    if (groupId) confirmEndedGroup(groupId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const group = groups.find(g => g.id === groupId);
  const vt    = group ? VERIFY_TYPES[(group.verifyType as VerifyTypeKey) ?? "step_walk"] : null;

  const [stats, setStats]                 = useState<Stats | null>(null);
  const [leaderboard, setLeaderboard]     = useState<LeaderboardItem[]>([]);
  const [activityPosts, setActivityPosts] = useState<ActivityFeedItem[]>([]);
  const [mounted, setMounted]             = useState(false);
  const [currentSlide, setCurrentSlide]   = useState(0);
  const slideContainerRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // 리더보드 + 활동 피드 + 내 통계 로드
  useEffect(() => {
    if (!group?.dbId) {
      setStats({ myVerifyCount: 0, myStreak: 0, myRate: 0, crewRate: group?.crewRate ?? 0 });
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const [rows, posts] = await Promise.all([
          loadGroupLeaderboard(group!.dbId!, 100),
          loadActivityFeed({ groupId: group!.dbId!, userId: user?.id ?? null, limit: 40, withinChallengePeriod: true }),
        ]);
        if (cancelled) return;
        setLeaderboard(rows);
        setActivityPosts(posts);
        const me = rows.find(r => r.isMe);
        setStats({
          myVerifyCount: me?.totalDone ?? 0,
          myStreak:      me?.streak    ?? 0,
          myRate:        me?.rate      ?? 0,
          crewRate:      group!.crewRate,
        });
      } catch {
        if (cancelled) return;
        setStats({ myVerifyCount: 0, myStreak: 0, myRate: 0, crewRate: group!.crewRate });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [user?.id, group?.dbId]);

  const achieved  = (stats?.crewRate ?? group?.crewRate ?? 0) >= 50;
  const grade     = stats ? getBenefitGrade(stats.myRate, stats.crewRate) : "D";
  const myRank    = leaderboard.find(r => r.isMe);
  const top3      = leaderboard.slice(0, 3);
  const restList  = leaderboard.slice(3);

  // 슬라이드 변경 감지 (scroll-snap 기반)
  const handleScroll = () => {
    const el = slideContainerRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    if (slideWidth === 0) return;
    const idx = Math.round(el.scrollLeft / slideWidth);
    if (idx !== currentSlide) setCurrentSlide(idx);
  };

  const goToSlide = (idx: number) => {
    const el = slideContainerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
  };

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const GRADE_META: Record<string, { label: string; color: string; desc: string }> = {
    A: { label: "A등급", color: "#FF3355", desc: "최대 혜택 수령 자격" },
    B: { label: "B등급", color: "#F97316", desc: "상위 혜택 수령 자격" },
    C: { label: "C등급", color: "#F59E0B", desc: "기본 혜택 수령 자격" },
    D: { label: "D등급", color: "#94A3B8", desc: "혜택 수령 불가" },
  };
  const gradeMeta = GRADE_META[grade] ?? GRADE_META.D;

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0F0F0F] text-white/70">
        <p>챌린지 정보를 불러올 수 없어요.</p>
        <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 rounded-full bg-white/10">홈으로</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-hidden relative">
      <style>{`
        @keyframes cr-pop  { 0%{opacity:0;transform:scale(0.7)}60%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)} }
        @keyframes cr-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,51,85,0.3); }
          50%      { box-shadow: 0 0 0 20px rgba(255,51,85,0); }
        }
        @keyframes cr-shine {
          from { transform: translateX(-100%) skewX(-20deg); }
          to   { transform: translateX(220%) skewX(-20deg); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>

      {/* ── 배경 커버 이미지 ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={group.cover}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0" style={{
          background: achieved
            ? "linear-gradient(180deg, rgba(255,51,85,0.55) 0%, rgba(0,0,0,0.78) 35%, #0F0F0F 70%)"
            : "linear-gradient(180deg, rgba(30,30,40,0.65) 0%, rgba(0,0,0,0.82) 35%, #0F0F0F 70%)",
        }} />
      </div>

      {/* ── top bar ── */}
      <div className="relative z-20 shrink-0 flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">
            {currentSlide === 0 ? "활동 기록" : "결과 정리"}
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* ── 슬라이드 컨테이너 (좌우 스와이프) ── */}
      <div
        ref={slideContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar relative z-10"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* ════════ 슬라이드 1: 그룹 세부 페이지 유사 ════════ */}
        <div className="w-full shrink-0 snap-start overflow-y-auto no-scrollbar pb-32">
          <div className="px-5 pt-4 flex flex-col gap-3">

            {/* 그룹 헤더 */}
            <div style={slide(80)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/70 uppercase tracking-widest">종료됨</span>
                {group.category && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/70">{group.category}</span>
                )}
              </div>
              <h1 className="text-white font-black text-[24px] leading-tight">{group.title}</h1>
              {group.desc && (
                <p className="text-white/60 text-[13px] mt-1.5 leading-relaxed">{group.desc}</p>
              )}
              {fmtPeriod(group.challengeStart, group.challengeEnd) && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  <p className="text-white/40 text-[12px] font-medium">{fmtPeriod(group.challengeStart, group.challengeEnd)}</p>
                </div>
              )}
            </div>

            {/* 챌린지 정보 카드 */}
            {(group.rule || group.goal || vt) && (
              <div
                className="rounded-3xl px-5 py-4 flex flex-col gap-3"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  ...slide(160),
                }}
              >
                {vt && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[20px]">
                      {vt.emoji}
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">인증 방식</p>
                      <p className="text-white font-bold text-[14px]">{vt.label}</p>
                    </div>
                  </div>
                )}
                {group.rule && (
                  <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">규칙</p>
                    <p className="text-white/80 text-[13px] leading-relaxed">{group.rule}</p>
                  </div>
                )}
                {group.goal && (
                  <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">목표</p>
                    <p className="text-white/80 text-[13px] leading-relaxed">{group.goal}</p>
                  </div>
                )}
              </div>
            )}

            {/* 참여 현황 미니 통계 (3-grid) */}
            <div className="grid grid-cols-3 gap-2" style={slide(220)}>
              <div className="rounded-2xl py-3 flex flex-col items-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <Users className="w-4 h-4 text-white/60 mb-1" />
                <p className="text-white font-black text-[16px] tabular-nums">{group.members}</p>
                <p className="text-white/45 text-[10px] mt-0.5">멤버</p>
              </div>
              <div className="rounded-2xl py-3 flex flex-col items-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <Trophy className="w-4 h-4 mb-1" style={{ color: achieved ? "#FF3355" : "#94A3B8" }} />
                <p className="font-black text-[16px] tabular-nums" style={{ color: achieved ? "#FF3355" : "#FFFFFF" }}>
                  {stats?.crewRate ?? group.crewRate}%
                </p>
                <p className="text-white/45 text-[10px] mt-0.5">크루 달성</p>
              </div>
              <div className="rounded-2xl py-3 flex flex-col items-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <ImageIcon className="w-4 h-4 text-white/60 mb-1" />
                <p className="text-white font-black text-[16px] tabular-nums">{activityPosts.length}</p>
                <p className="text-white/45 text-[10px] mt-0.5">전체 인증</p>
              </div>
            </div>

            {/* 리더보드 */}
            {leaderboard.length > 0 && (
              <div style={slide(280)}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">최종 리더보드</p>
                  <p className="text-white/30 text-[10px]">{leaderboard.length}명</p>
                </div>

                {/* TOP 3 podium */}
                {top3.length >= 1 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[1, 0, 2].map(podiumIdx => {
                      const p = top3[podiumIdx];
                      if (!p) return <div key={podiumIdx} />;
                      const podiumColors = ["#C0C0C0", "#FFD700", "#CD7F32"]; // 2등, 1등, 3등
                      const color = podiumColors[podiumIdx];
                      return (
                        <div key={p.userId}
                          className="rounded-2xl py-3 flex flex-col items-center"
                          style={{
                            background: p.isMe ? "rgba(255,51,85,0.18)" : "rgba(255,255,255,0.07)",
                            border: p.isMe ? "1px solid rgba(255,51,85,0.4)" : "1px solid rgba(255,255,255,0.09)",
                            transform: podiumIdx === 0 ? "translateY(-6px)" : "none",
                          }}>
                          <Crown className="w-4 h-4 mb-1" style={{ color }} />
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 mb-1">
                            {p.avatarUrl
                              ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-white text-[13px] font-bold">{p.name.charAt(0)}</div>
                            }
                          </div>
                          <p className="text-white font-bold text-[11px] truncate w-full text-center px-1">
                            {p.isMe ? "나" : p.name}
                          </p>
                          <p className="font-black text-[13px] tabular-nums" style={{ color }}>{p.rate}%</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 4위 이하 */}
                {restList.length > 0 && (
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {restList.slice(0, 10).map((p) => (
                      <div key={p.userId}
                        className="flex items-center gap-2.5 px-3 py-2.5 border-b last:border-b-0"
                        style={{
                          borderColor: "rgba(255,255,255,0.05)",
                          background: p.isMe ? "rgba(255,51,85,0.12)" : "transparent",
                        }}>
                        <span className="text-white/40 text-[12px] font-bold tabular-nums w-6 text-center">{p.rank}</span>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
                          {p.avatarUrl
                            ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold">{p.name.charAt(0)}</div>
                          }
                        </div>
                        <p className="flex-1 text-white text-[13px] font-bold truncate">{p.isMe ? "나" : p.name}</p>
                        <p className="text-white font-black text-[13px] tabular-nums">{p.rate}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 활동 피드 (사진 그리드) */}
            {activityPosts.length > 0 && (
              <div style={slide(360)}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">활동 사진</p>
                  <p className="text-white/30 text-[10px]">{activityPosts.length}장</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {activityPosts.slice(0, 12).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => navigate(`/challenge/group/${groupId}/activity`)}
                      className="aspect-square rounded-xl overflow-hidden relative active:scale-95 transition-transform"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {post.photo_url ? (
                        <img src={post.photo_url} alt="" className="w-full h-full object-cover" draggable={false} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📸</div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 px-1.5 py-1"
                        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                        <p className="text-white text-[9px] font-bold truncate">
                          {post.author_name ?? "유저"}
                          {post.authorMemberStatus === "LEFT" && <span className="text-white/60"> · 탈퇴</span>}
                          {post.authorMemberStatus === "REMOVED" && <span className="text-white/60"> · 퇴장</span>}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {activityPosts.length > 12 && (
                  <button
                    onClick={() => navigate(`/challenge/group/${groupId}/activity`)}
                    className="w-full mt-2 py-3 rounded-2xl text-white/70 text-[12px] font-bold active:scale-[0.98] transition-transform"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
                  >
                    전체 {activityPosts.length}장 보기
                  </button>
                )}
              </div>
            )}

            {/* 스와이프 힌트 */}
            <div className="mt-3 text-center" style={slide(440)}>
              <p className="text-white/40 text-[12px] font-medium">
                옆으로 넘겨 챌린지 결과 보기 →
              </p>
            </div>

          </div>
        </div>

        {/* ════════ 슬라이드 2: 챌린지 결과 정리 ════════ */}
        <div className="w-full shrink-0 snap-start overflow-y-auto no-scrollbar pb-32">

          {/* 대형 이모지 + 상태 */}
          <div className="flex flex-col items-center pt-6 pb-4">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-[54px] mb-4"
              style={{
                background: achieved ? "rgba(255,51,85,0.2)" : "rgba(100,116,139,0.2)",
                border: `2px solid ${achieved ? "rgba(255,51,85,0.4)" : "rgba(100,116,139,0.3)"}`,
                animation: mounted && currentSlide === 1 ? "cr-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
              }}
            >
              {achieved ? "🏆" : "💪"}
            </div>
            <h1 className="text-white font-black text-[28px] leading-none">
              챌린지 {achieved ? "달성" : "미달성"}
            </h1>
            <p className="text-white/60 text-[13px] mt-1.5 font-medium">{group.title}</p>
          </div>

          {/* 스크롤 영역 */}
          <div className="px-5 flex flex-col gap-3">

            {/* 크루 달성률 배너 */}
            <div className="rounded-3xl overflow-hidden">
              <div
                className="relative flex items-center justify-between px-5 py-5"
                style={{
                  background: achieved
                    ? "linear-gradient(135deg, rgba(255,51,85,0.18), rgba(255,102,128,0.10))"
                    : "rgba(255,255,255,0.08)",
                  border: `1px solid ${achieved ? "rgba(255,51,85,0.3)" : "rgba(255,255,255,0.12)"}`,
                }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute top-0 bottom-0 w-1/3 opacity-10"
                    style={{
                      background: "linear-gradient(90deg, transparent, white, transparent)",
                      animation: mounted ? "cr-shine 2s ease 0.4s both" : "none",
                    }} />
                </div>

                <div>
                  <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">크루 달성률</p>
                  <p className="text-white font-black text-[40px] leading-none tabular-nums italic mt-0.5">
                    {stats?.crewRate ?? group.crewRate}
                    <span className="text-[20px] font-black ml-0.5">%</span>
                  </p>
                  <p className="text-white/50 text-[11px] mt-0.5">
                    {achieved ? "목표 달성! 크루가 함께 해냈어요 🎉" : "아쉽게 목표에 못 미쳤어요"}
                  </p>
                </div>

                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: achieved ? "rgba(255,51,85,0.2)" : "rgba(100,116,139,0.15)",
                    border: `1px solid ${achieved ? "rgba(255,51,85,0.3)" : "rgba(100,116,139,0.2)"}`,
                  }}
                >
                  <Users className="w-7 h-7" style={{ color: achieved ? "#FF3355" : "#94A3B8" }} />
                </div>
              </div>
            </div>

            {/* 내 기록 */}
            <div>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-1 mb-2">내 기록</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "인증 횟수",   value: `${stats?.myVerifyCount ?? 0}회`,  Icon: CheckCircle2, color: "#FF3355" },
                  { label: "최근 7일",   value: `${stats?.myStreak ?? 0}일`,       Icon: Flame,        color: "#F97316" },
                  { label: "내 달성률",   value: `${stats?.myRate ?? 0}%`,          Icon: Zap,          color: "#F59E0B" },
                ].map(({ label, value, Icon, color }) => (
                  <div key={label}
                    className="flex flex-col items-center py-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
                    <Icon className="w-5 h-5 mb-1.5" style={{ color }} />
                    <p className="text-white font-black text-[18px] tabular-nums leading-none">{value}</p>
                    <p className="text-white/45 text-[10px] mt-1 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 내 최종 순위 */}
            {myRank && (
              <div
                className="rounded-3xl px-5 py-4 flex items-center justify-between"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <div>
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-0.5">내 순위</p>
                  <p className="text-white font-black text-[22px] tabular-nums">{myRank.rank}위 <span className="text-white/40 text-[14px]">/ {leaderboard.length}명</span></p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-amber-300" />
                </div>
              </div>
            )}

            {/* 베네핏 등급 */}
            <div
              className="rounded-3xl px-5 py-4 flex items-center justify-between"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <div>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-0.5">베네핏 등급</p>
                <p className="font-black text-[22px]" style={{ color: gradeMeta.color }}>{gradeMeta.label}</p>
                <p className="text-white/50 text-[12px] mt-0.5">{gradeMeta.desc}</p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[26px]"
                style={{ background: `${gradeMeta.color}22`, border: `1.5px solid ${gradeMeta.color}44` }}
              >
                {grade}
              </div>
            </div>

            {/* 안내 텍스트 */}
            <div
              className="rounded-3xl px-5 py-4 text-center"
              style={{
                background: achieved ? "rgba(255,51,85,0.08)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${achieved ? "rgba(255,51,85,0.2)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {achieved ? (
                <p className="text-white/70 text-[13px] leading-relaxed">
                  챌리가 참가권을 드려요!<br />
                  <span className="text-white font-bold">리워드 탭</span>에서 혜택을 확인하고<br />
                  다음 챌린지에도 참여해보세요 🎉
                </p>
              ) : (
                <p className="text-white/70 text-[13px] leading-relaxed">
                  이번엔 아쉬웠지만 괜찮아요!<br />
                  <span className="text-white font-bold">다른 챌린지</span>에 도전하면서<br />
                  습관을 계속 이어가세요 🔥
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── 하단 인디케이터 + 버튼 (sticky) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-3"
        style={{ background: "linear-gradient(to top, #0F0F0F 70%, rgba(15,15,15,0.7) 90%, transparent)" }}>

        {/* 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[0, 1].map(i => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`슬라이드 ${i + 1}`}
              className={cn(
                "rounded-full transition-all",
                currentSlide === i ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30"
              )}
            />
          ))}
        </div>

        {/* 액션 버튼 */}
        {achieved ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/rewards")}
              className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-[16px] active:scale-[0.98] transition-transform relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#FF3355,#FF6680)", boxShadow: "0 8px 24px -4px rgba(255,51,85,0.45)" }}
            >
              <Trophy className="w-5 h-5" />
              챌린지 참가권 받기
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full h-10 flex items-center justify-center gap-1.5 text-white/50 text-[13px] font-medium active:text-white/70 transition-colors"
            >
              홈으로
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/challenge")}
              className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-bold text-[16px] active:scale-[0.98] transition-transform"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF" }}
            >
              <Flame className="w-5 h-5 text-orange-400" />
              다른 챌린지 탐색하기
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full h-10 flex items-center justify-center gap-1.5 text-white/50 text-[13px] font-medium active:text-white/70 transition-colors"
            >
              홈으로
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
