import { useState, useEffect } from "react";
import { ChevronLeft, Share2, Users, Flame, Crown, TrendingUp, TrendingDown, Copy, Check, Bell, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";

type ActivityItem = {
  name: string;
  seed: string;
  time: string;
  msg: string;
  type: "verify" | "streak" | "rank" | "comment";
  grad: [string, string];
};

const GROUPS: Record<string, {
  title: string;
  desc: string;
  members: number;
  rate: number;
  status: string;
  statusColor: string;
  joined: boolean;
  rule: string;
  leaderboard: { rank: number; name: string; seed: string; streak: number; rate: number; isMe?: boolean }[];
  activity: ActivityItem[];
}> = {
  "1": {
    title: "새벽 미라클 모닝",
    desc: "매일 새벽 5시 30분, 함께 일어나 하루를 시작해요",
    members: 12, rate: 82, status: "진행중", statusColor: "#10B981",
    joined: true, rule: "매일 오전 6시 이전 기상 인증 사진 업로드",
    leaderboard: [
      { rank: 1,  name: "김지수", seed: "Felix", streak: 24, rate: 98 },
      { rank: 2,  name: "박민혁", seed: "Aneka", streak: 18, rate: 92 },
      { rank: 3,  name: "이성민", seed: "Jude",  streak: 15, rate: 87 },
      { rank: 4,  name: "나 (홍길동)", seed: "Kim", streak: 8, rate: 75, isMe: true },
      { rank: 5,  name: "최다은", seed: "Dawn", streak: 6, rate: 68 },
      { rank: 6,  name: "유나연", seed: "Luna", streak: 5, rate: 60 },
      { rank: 7,  name: "서준혁", seed: "Alex", streak: 3, rate: 48 },
      { rank: 8,  name: "강민지", seed: "Mina", streak: 2, rate: 35 },
      { rank: 9,  name: "강태양", seed: "Bear", streak: 1, rate: 25 },
      { rank: 10, name: "오지현", seed: "Lily", streak: 0, rate: 18 },
    ],
    activity: [
      { name: "김지수",   seed: "Felix", time: "방금",    msg: "오늘 새벽 5시 25분 기상 인증 완료!",   type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "박민혁",   seed: "Aneka", time: "1시간 전", msg: "18일 연속 기상 달성 🔥",              type: "streak",  grad: ["#FB923C","#F59E0B"] },
      { name: "이성민",   seed: "Jude",  time: "3시간 전", msg: "연속 15일째! 오늘도 성공했어요 ✅",   type: "verify",  grad: ["#34d399","#10B981"] },
      { name: "최다은",   seed: "Dawn",  time: "5시간 전", msg: "오늘도 화이팅!! 모두 다 할 수 있어요", type: "comment", grad: ["#A78BFA","#7C3AED"] },
      { name: "유나연",   seed: "Luna",  time: "어제",     msg: "처음으로 5시 30분 이전 기상 성공 🌅",  type: "verify",  grad: ["#38BDF8","#0EA5E9"] },
    ],
  },
  "2": {
    title: "매일 1만보 걷기",
    desc: "하루 만 보를 함께 걸어요. 걸을수록 건강해져요",
    members: 45, rate: 65, status: "인기", statusColor: "#FF3355",
    joined: false, rule: "매일 걸음 수 스크린샷 또는 앱 연동으로 인증",
    leaderboard: [
      { rank: 1, name: "강민준", seed: "Leo",  streak: 30, rate: 95 },
      { rank: 2, name: "오서연", seed: "Mia",  streak: 22, rate: 90 },
      { rank: 3, name: "유하늘", seed: "Zoe",  streak: 19, rate: 85 },
      { rank: 4, name: "임태현", seed: "Tom",  streak: 14, rate: 78 },
      { rank: 5, name: "박준서", seed: "Evan", streak: 0,  rate: 18 },
    ],
    activity: [
      { name: "강민준", seed: "Leo", time: "방금",    msg: "오늘 12,345보 달성했어요 👟",        type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "오서연", seed: "Mia", time: "2시간 전", msg: "점심시간에 공원 한 바퀴 완료 🌳",   type: "verify",  grad: ["#34d399","#10B981"] },
      { name: "유하늘", seed: "Zoe", time: "4시간 전", msg: "퇴근길에 한 정거장 더 걸었어요 😊", type: "comment", grad: ["#38BDF8","#0EA5E9"] },
    ],
  },
  "3": {
    title: "주 1권 독서",
    desc: "매주 한 권씩 읽고 함께 생각을 나눠요",
    members: 8, rate: 48, status: "마감임박", statusColor: "#F59E0B",
    joined: true, rule: "매주 금요일까지 독서 인증 사진 + 한 줄 감상 업로드",
    leaderboard: [
      { rank: 1, name: "한소희", seed: "Ava",  streak: 8,  rate: 100 },
      { rank: 2, name: "이준혁", seed: "Dan",  streak: 6,  rate: 87 },
      { rank: 3, name: "나 (홍길동)", seed: "Kim", streak: 5, rate: 75, isMe: true },
      { rank: 4, name: "정우성", seed: "Owen", streak: 0,  rate: 12 },
    ],
    activity: [
      { name: "한소희", seed: "Ava", time: "방금",    msg: "이번 주도 완독 성공! 정말 좋은 책이에요 📚", type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "이준혁", seed: "Dan", time: "1시간 전", msg: "절반 읽었어요, 오늘 다 끝낼게요",           type: "comment", grad: ["#A78BFA","#7C3AED"] },
      { name: "한소희", seed: "Ava", time: "어제",     msg: "8주 연속 완독 달성 🏅",                     type: "streak",  grad: ["#FB923C","#F59E0B"] },
    ],
  },
};

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const INVITE_LINK = "https://jsr.app/join/GROUP-XK4P";

export function GroupDetail() {
  const navigate = useNavigate();
  const { groupId = "1" } = useParams<{ groupId: string }>();
  const group = GROUPS[groupId] ?? GROUPS["1"];
  const [joined, setJoined] = useState(group.joined);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"leaderboard" | "activity">("leaderboard");
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(INVITE_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes gp-down { from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes sheet-up { from{opacity:0;transform:translateY(100%);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-black/[0.05]"
        style={{ animation: "gp-down 0.4s ease both" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-[17px] font-black text-slate-900">그룹 상세</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <Share2 className="w-4.5 h-4.5 text-slate-700" style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">

        {/* 히어로 */}
        <div
          className="relative overflow-hidden px-5 pt-6 pb-12"
          style={{
            background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)",
            animation: "gp-down 0.45s ease 40ms both",
          }}
        >
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#FF3355]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/[0.03] blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">그룹 챌린지</p>
                <h2 className="text-[22px] font-black text-white leading-tight">{group.title}</h2>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 mt-1"
                style={{ color: group.statusColor, background: `${group.statusColor}20`, border: `1px solid ${group.statusColor}40` }}
              >
                {group.status}
              </span>
            </div>
            <p className="text-white/50 text-[13px] leading-relaxed mb-4">{group.desc}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/40 text-[12px]">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold">{group.members}명 참여</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-[12px]">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-semibold">평균 {group.rate}% 달성</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-5 space-y-3">

          {/* 달성률 카드 */}
          <div
            className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            style={slide(60)}
          >
            <div className="flex justify-between items-end mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">이번 주 평균 달성률</p>
              <span className="text-[28px] font-black text-[#FF3355] leading-none tabular-nums">{group.rate}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${group.rate}%` : "0%",
                  background: "linear-gradient(90deg, #FF3355, #FF6680)",
                  transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.2s",
                  boxShadow: "0 0 10px rgba(255,51,85,0.35)",
                }}
              />
            </div>
          </div>

          {/* 참여 규칙 */}
          <div
            className="bg-white rounded-2xl px-5 py-4 border border-black/[0.05] flex items-start gap-3"
            style={slide(120)}
          >
            <div className="w-8 h-8 rounded-xl bg-[#FFE8EC] flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-[#FF3355]" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">참여 규칙</p>
              <p className="text-[14px] text-slate-700 leading-relaxed">{group.rule}</p>
            </div>
          </div>

          {/* 리더보드 / 활동 탭 */}
          <div style={slide(180)}>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-3">
              {(["leaderboard", "activity"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-lg text-[13px] font-bold transition-all duration-200"
                  style={{
                    background: tab === t ? "white" : "transparent",
                    color: tab === t ? "#FF3355" : "#94A3B8",
                    boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  {t === "leaderboard" ? "🏆 순위" : "💬 활동"}
                </button>
              ))}
            </div>

            {tab === "leaderboard" ? (
              <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
                {group.leaderboard.map(({ rank, name, seed, streak, rate: r, isMe }, i) => (
                  <div key={name}>
                    {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 transition-colors",
                        isMe ? "bg-[#FFF5F7]" : ""
                      )}
                    >
                      {/* 순위 */}
                      <div className="w-7 text-center shrink-0">
                        {rank <= 3 ? (
                          <span className="text-lg">{RANK_MEDAL[rank]}</span>
                        ) : (
                          <span className={cn(
                            "text-[13px] font-black tabular-nums",
                            isMe ? "text-[#FF3355]" : "text-slate-400"
                          )}>{rank}</span>
                        )}
                      </div>
                      {/* 아바타 */}
                      <div className="relative shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                          alt={name}
                          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-100"
                        />
                        {rank === 1 && (
                          <Crown className="absolute -top-2 -right-1 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      {/* 이름 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={cn(
                            "text-[13px] font-bold truncate",
                            isMe ? "text-[#FF3355]" : "text-slate-800"
                          )}>{name}</p>
                          {isMe && (
                            <span className="text-[9px] font-black text-white bg-[#FF3355] px-1.5 py-0.5 rounded-full shrink-0">나</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                          <span className="text-[11px] text-slate-400 font-semibold">{streak}일 연속</span>
                        </div>
                      </div>
                      {/* 달성률 */}
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-[15px] font-black tabular-nums",
                          r >= 80 ? "text-emerald-500" : r >= 50 ? "text-amber-500" : "text-rose-400"
                        )}>{r}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
                {group.activity.map(({ name, seed, time, msg, type, grad }, i) => {
                  const typeEmoji = type === "verify" ? "📸" : type === "streak" ? "🔥" : type === "rank" ? "🏆" : "💬";
                  const typeBg    = type === "verify" ? "#FFF0F3" : type === "streak" ? "#FFF7ED" : type === "rank" ? "#FFFBEB" : "#F8FAFC";
                  const typeColor = type === "verify" ? "#FF3355" : type === "streak" ? "#FB923C" : type === "rank" ? "#F59E0B" : "#94A3B8";
                  return (
                    <div key={i}>
                      {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                      <div
                        className="flex items-start gap-3 px-4 py-3.5"
                        style={{
                          opacity: mounted ? 1 : 0,
                          transform: mounted ? "translateX(0)" : "translateX(-8px)",
                          transition: `opacity 0.4s ease ${i * 60 + 280}ms, transform 0.4s ease ${i * 60 + 280}ms`,
                        }}
                      >
                        {/* 아바타 */}
                        <div className="relative shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                            alt={name}
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-100"
                          />
                          {/* 활동 타입 뱃지 */}
                          <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-white"
                            style={{ background: typeBg }}
                          >
                            {typeEmoji}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-bold text-slate-900">{name}</p>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: typeBg, color: typeColor }}
                            >
                              {type === "verify" ? "인증" : type === "streak" ? "연속달성" : type === "rank" ? "순위" : "댓글"}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-auto shrink-0">{time}</span>
                          </div>
                          <p className="text-[13px] text-slate-600 leading-snug">{msg}</p>

                          {/* 인증 타입이면 썸네일 */}
                          {type === "verify" && (
                            <div
                              className="mt-2 w-14 h-14 rounded-xl overflow-hidden shrink-0"
                              style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 하단 버튼 */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{
          background: "linear-gradient(to top, #F8F8FA 65%, transparent)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease 0.4s",
        }}
      >
        <button
          onClick={() => joined ? setJoined(false) : setShowJoinConfirm(true)}
          className={cn(
            "w-full h-14 text-[16px] font-black rounded-2xl transition-all duration-200 active:scale-[0.98]",
            joined
              ? "bg-slate-100 text-slate-400"
              : "text-white"
          )}
          style={!joined ? {
            background: "linear-gradient(110deg, #FF3355, #CC0030)",
            boxShadow: "0 12px 28px -8px rgba(255,51,85,0.5)",
          } : {}}
        >
          {joined ? "그룹 탈퇴" : "그룹 참여하기"}
        </button>
      </div>

      {/* 초대 링크 시트 */}
      {showInvite && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.5)", animation: "gp-down 0.2s ease both" }}
          onClick={() => setShowInvite(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6"
            style={{ animation: "sheet-up 0.35s cubic-bezier(0.4,0,0.2,1) both" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-black text-slate-900">그룹 초대</h3>
              <button
                onClick={() => setShowInvite(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
              아래 링크를 공유하면 친구를 이 그룹으로 초대할 수 있어요
            </p>
            <div className="flex gap-2">
              <div className="flex-1 h-12 px-4 rounded-2xl bg-slate-100 flex items-center overflow-hidden">
                <span className="text-[13px] text-slate-600 font-semibold truncate">{INVITE_LINK}</span>
              </div>
              <button
                onClick={handleCopy}
                className="h-12 px-4 rounded-2xl flex items-center gap-1.5 text-[13px] font-black transition-all active:scale-95"
                style={{
                  background: copied ? "#10B981" : "linear-gradient(110deg, #FF3355, #CC0030)",
                  color: "white",
                  boxShadow: copied ? "0 8px 20px -4px rgba(16,185,129,0.5)" : "0 8px 20px -4px rgba(255,51,85,0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
            <div className="pb-2" />
          </div>
        </div>
      )}

      {/* 참여 확인 시트 */}
      {showJoinConfirm && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowJoinConfirm(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6"
            style={{ animation: "sheet-up 0.35s cubic-bezier(0.4,0,0.2,1) both" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
            <h3 className="text-[18px] font-black text-slate-900 mb-1">그룹 참여하기</h3>
            <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
              <span className="font-bold text-slate-700">{group.title}</span>에 참여하시겠어요?{" "}
              목표를 달성하지 못하면 그룹 순위에 영향을 줍니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinConfirm(false)}
                className="flex-1 h-12 rounded-2xl bg-slate-100 text-slate-500 font-bold text-[14px]"
              >
                취소
              </button>
              <button
                onClick={() => { setJoined(true); setShowJoinConfirm(false); }}
                className="flex-1 h-12 rounded-2xl text-white font-black text-[14px] active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(110deg, #FF3355, #CC0030)",
                  boxShadow: "0 8px 20px -4px rgba(255,51,85,0.5)",
                }}
              >
                참여하기
              </button>
            </div>
            <div className="pb-2" />
          </div>
        </div>
      )}
    </div>
  );
}
