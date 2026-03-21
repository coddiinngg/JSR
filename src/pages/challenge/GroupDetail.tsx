import { useState, useEffect } from "react";
import { ChevronLeft, Share2, Users, Flame, Crown, Copy, Check, Bell, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";

type ActivityItem = {
  name: string; seed: string; time: string; msg: string;
  type: "verify" | "streak" | "rank" | "comment";
  grad: [string, string];
};

const GROUPS: Record<string, {
  title: string; desc: string; members: number; rate: number;
  status: string; statusColor: string; joined: boolean; rule: string;
  leaderboard: { rank: number; name: string; seed: string; streak: number; rate: number; isMe?: boolean }[];
  activity: ActivityItem[];
}> = {
  "1": {
    title: "새벽 미라클 모닝", desc: "매일 새벽 5시 30분, 함께 일어나 하루를 시작해요",
    members: 12, rate: 82, status: "진행중", statusColor: "#10B981",
    joined: true, rule: "매일 오전 6시 이전 기상 인증 사진 업로드",
    leaderboard: [
      { rank: 1,  name: "김지수",     seed: "Felix", streak: 24, rate: 98 },
      { rank: 2,  name: "박민혁",     seed: "Aneka", streak: 18, rate: 92 },
      { rank: 3,  name: "이성민",     seed: "Jude",  streak: 15, rate: 87 },
      { rank: 4,  name: "나 (홍길동)", seed: "Kim",   streak: 8,  rate: 75, isMe: true },
      { rank: 5,  name: "최다은",     seed: "Dawn",  streak: 6,  rate: 68 },
      { rank: 6,  name: "유나연",     seed: "Luna",  streak: 5,  rate: 60 },
      { rank: 7,  name: "서준혁",     seed: "Alex",  streak: 3,  rate: 48 },
      { rank: 8,  name: "강민지",     seed: "Mina",  streak: 2,  rate: 35 },
      { rank: 9,  name: "강태양",     seed: "Bear",  streak: 1,  rate: 25 },
      { rank: 10, name: "오지현",     seed: "Lily",  streak: 0,  rate: 18 },
    ],
    activity: [
      { name: "김지수", seed: "Felix", time: "방금",    msg: "오늘 새벽 5시 25분 기상 인증 완료!",    type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "박민혁", seed: "Aneka", time: "1시간 전", msg: "18일 연속 기상 달성 🔥",               type: "streak",  grad: ["#FB923C","#F59E0B"] },
      { name: "이성민", seed: "Jude",  time: "3시간 전", msg: "연속 15일째! 오늘도 성공했어요 ✅",    type: "verify",  grad: ["#34d399","#10B981"] },
      { name: "최다은", seed: "Dawn",  time: "5시간 전", msg: "오늘도 화이팅!! 모두 다 할 수 있어요", type: "comment", grad: ["#A78BFA","#7C3AED"] },
      { name: "유나연", seed: "Luna",  time: "어제",     msg: "처음으로 5시 30분 이전 기상 성공 🌅",  type: "verify",  grad: ["#38BDF8","#0EA5E9"] },
    ],
  },
  "2": {
    title: "매일 1만보 걷기", desc: "하루 만 보를 함께 걸어요. 걸을수록 건강해져요",
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
      { name: "강민준", seed: "Leo", time: "방금",    msg: "오늘 12,345보 달성했어요 👟",       type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "오서연", seed: "Mia", time: "2시간 전", msg: "점심시간에 공원 한 바퀴 완료 🌳",  type: "verify",  grad: ["#34d399","#10B981"] },
      { name: "유하늘", seed: "Zoe", time: "4시간 전", msg: "퇴근길에 한 정거장 더 걸었어요 😊", type: "comment", grad: ["#38BDF8","#0EA5E9"] },
    ],
  },
  "3": {
    title: "주 1권 독서", desc: "매주 한 권씩 읽고 함께 생각을 나눠요",
    members: 8, rate: 48, status: "마감임박", statusColor: "#F59E0B",
    joined: true, rule: "매주 금요일까지 독서 인증 사진 + 한 줄 감상 업로드",
    leaderboard: [
      { rank: 1, name: "한소희",     seed: "Ava",  streak: 8, rate: 100 },
      { rank: 2, name: "이준혁",     seed: "Dan",  streak: 6, rate: 87  },
      { rank: 3, name: "나 (홍길동)", seed: "Kim",  streak: 5, rate: 75, isMe: true },
      { rank: 4, name: "정우성",     seed: "Owen", streak: 0, rate: 12  },
    ],
    activity: [
      { name: "한소희", seed: "Ava", time: "방금",    msg: "이번 주도 완독 성공! 정말 좋은 책이에요 📚", type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "이준혁", seed: "Dan", time: "1시간 전", msg: "절반 읽었어요, 오늘 다 끝낼게요",           type: "comment", grad: ["#A78BFA","#7C3AED"] },
      { name: "한소희", seed: "Ava", time: "어제",     msg: "8주 연속 완독 달성 🏅",                    type: "streak",  grad: ["#FB923C","#F59E0B"] },
    ],
  },
};

const MEDAL = ["🥇", "🥈", "🥉"];
const INVITE_LINK = "https://jsr.app/join/GROUP-XK4P";

const rateColor = (r: number) =>
  r >= 80 ? "#10B981" : r >= 50 ? "#F59E0B" : "#FF3355";

export function GroupDetail() {
  const navigate = useNavigate();
  const { groupId = "1" } = useParams<{ groupId: string }>();
  const group = GROUPS[groupId] ?? GROUPS["1"];
  const [joined, setJoined]               = useState(group.joined);
  const [mounted, setMounted]             = useState(false);
  const [tab, setTab]                     = useState<"leaderboard" | "activity">("leaderboard");
  const [copied, setCopied]               = useState(false);
  const [showInvite, setShowInvite]       = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(INVITE_LINK).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const top3    = group.leaderboard.slice(0, 3);
  const restList = group.leaderboard.slice(3);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F2F2F7]">
      <style>{`
        @keyframes sheet-up { from{opacity:0;transform:translateY(100%);}to{opacity:1;transform:translateY(0);} }
        @keyframes fade-in   { from{opacity:0;}to{opacity:1;} }
      `}</style>

      {/* ── 히어로 헤더 ── */}
      <div className="shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg,#1A0A14 0%,#2D0A1A 55%,#0F0F1A 100%)" }}>
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FF3355]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 w-40 h-40 rounded-full bg-[#FF3355]/[0.04] blur-2xl" />

        {/* 네비 바 */}
        <div className="flex items-center justify-between px-4 pt-8 pb-3 relative z-10">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => setShowInvite(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors">
            <Share2 className="text-white" style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* 제목 + 달성률 박스 */}
        <div className="px-5 pb-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 mb-1">그룹 챌린지</p>
              <h1 className="text-[26px] font-black text-white leading-tight tracking-tight">{group.title}</h1>
              <p className="text-white/45 text-[13px] leading-relaxed mt-1.5">{group.desc}</p>
            </div>
            {/* 달성률 박스 */}
            <div className="shrink-0 flex flex-col items-center justify-center w-[76px] h-[76px] rounded-2xl mt-1"
              style={{ background: "rgba(255,51,85,0.15)", border: "1.5px solid rgba(255,51,85,0.35)" }}>
              <span className="text-[22px] font-black text-[#FF3355] leading-none tabular-nums">{group.rate}%</span>
              <span className="text-white/35 text-[9px] font-bold mt-0.5 uppercase tracking-wide">달성률</span>
            </div>
          </div>

          {/* 하단 메타 */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }}>
              <Users className="w-3 h-3 text-white/40" />
              <span className="text-white/60 text-[12px] font-bold">{group.members}명</span>
            </div>
            <div className="px-3 py-1.5 rounded-full"
              style={{ background: `${group.statusColor}1A`, border: `1px solid ${group.statusColor}40` }}>
              <span className="text-[12px] font-bold" style={{ color: group.statusColor }}>{group.status}</span>
            </div>
            {joined && (
              <div className="px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,51,85,0.2)", border: "1px solid rgba(255,51,85,0.4)" }}>
                <span className="text-[#FF3355] text-[12px] font-black">참여중</span>
              </div>
            )}
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06]">
          <div className="h-full rounded-full"
            style={{ width: mounted ? `${group.rate}%` : "0%",
              background: "linear-gradient(90deg,#FF3355,#FF6680)",
              transition: "width 1.4s cubic-bezier(0.4,0,0.2,1) 0.2s",
              boxShadow: "0 0 8px rgba(255,51,85,0.5)" }} />
        </div>
      </div>

      {/* ── 규칙 카드 ── */}
      <div className="mx-4 mt-3 flex items-center gap-3 bg-white px-4 py-3.5 rounded-2xl border border-black/[0.04]"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(8px)", transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s" }}>
        <div className="w-8 h-8 rounded-xl bg-[#FFE8EC] flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-[#FF3355]" />
        </div>
        <p className="text-[13px] text-slate-600 leading-snug flex-1">{group.rule}</p>
      </div>

      {/* ── 탭 ── */}
      <div className="mx-4 mt-3 flex gap-1 p-1 bg-white rounded-2xl border border-black/[0.04]"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(8px)", transition: "opacity 0.4s ease 0.18s, transform 0.4s ease 0.18s" }}>
        {(["leaderboard", "activity"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all duration-200 active:scale-[0.97]",
              tab === t ? "text-white" : "text-slate-400")}
            style={tab === t ? {
              background: "linear-gradient(110deg,#FF3355,#CC0030)",
              boxShadow: "0 4px 14px rgba(255,51,85,0.35)",
            } : {}}>
            {t === "leaderboard" ? "🏆  순위" : "💬  활동"}
          </button>
        ))}
      </div>

      {/* ── 컨텐츠 ── */}
      <div className="flex-1 overflow-y-auto pb-32">
        {tab === "leaderboard" ? (
          <div className="px-4 mt-3 space-y-2.5">

            {/* 상위 3인 포디엄 */}
            <div className="flex gap-2">
              {top3.map(({ rank, name, seed, streak, rate: r, isMe }) => (
                <div key={rank}
                  className="flex-1 flex flex-col items-center py-4 px-2 rounded-2xl"
                  style={{
                    background: rank === 1
                      ? "linear-gradient(160deg,rgba(255,51,85,0.08),white)"
                      : "white",
                    border: rank === 1 ? "1.5px solid rgba(255,51,85,0.2)" : "1px solid rgba(0,0,0,0.05)",
                    boxShadow: rank === 1
                      ? "0 6px 24px rgba(255,51,85,0.12)"
                      : "0 2px 10px rgba(0,0,0,0.04)",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "none" : "translateY(12px)",
                    transition: `opacity 0.45s ease ${rank * 60}ms, transform 0.45s ease ${rank * 60}ms`,
                  }}>
                  <span className="text-[22px] mb-2">{MEDAL[rank - 1]}</span>
                  <div className="relative mb-2">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name}
                      className="w-12 h-12 rounded-full bg-slate-100" />
                    {rank === 1 && (
                      <Crown className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <p className={cn("text-[11px] font-black text-center leading-tight mb-1.5 px-1",
                    isMe ? "text-[#FF3355]" : "text-slate-800")}>
                    {name}{isMe && <span className="block text-[9px] text-[#FF3355]/70">나</span>}
                  </p>
                  <span className="text-[16px] font-black tabular-nums" style={{ color: rateColor(r) }}>{r}%</span>
                  <div className="flex items-center gap-0.5 mt-1">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                    <span className="text-[10px] text-slate-400 font-semibold">{streak}일</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 4위~ */}
            {restList.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                {restList.map(({ rank, name, seed, streak, rate: r, isMe }, i) => (
                  <div key={name}>
                    {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                    <div className={cn("flex items-center gap-3 px-4 py-3.5", isMe ? "bg-[#FFF5F7]" : "")}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "none" : "translateX(-8px)",
                        transition: `opacity 0.4s ease ${i * 55 + 200}ms, transform 0.4s ease ${i * 55 + 200}ms`,
                      }}>
                      <span className={cn("w-6 text-center text-[13px] font-black tabular-nums shrink-0",
                        isMe ? "text-[#FF3355]" : "text-slate-300")}>{rank}</span>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name}
                        className="w-9 h-9 rounded-full bg-slate-100 border border-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={cn("text-[13px] font-bold truncate", isMe ? "text-[#FF3355]" : "text-slate-800")}>{name}</p>
                          {isMe && <span className="text-[9px] font-black text-white bg-[#FF3355] px-1.5 py-0.5 rounded-full shrink-0">나</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-2.5 h-2.5 text-orange-400 fill-orange-300" />
                          <span className="text-[11px] text-slate-400">{streak}일 연속</span>
                        </div>
                      </div>
                      <span className="text-[14px] font-black tabular-nums shrink-0" style={{ color: rateColor(r) }}>{r}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (
          <div className="px-4 mt-3 space-y-2.5">
            {group.activity.map(({ name, seed, time, msg, type, grad }, i) => {
              const typeEmoji = type === "verify" ? "📸" : type === "streak" ? "🔥" : type === "rank" ? "🏆" : "💬";
              const typeBg    = type === "verify" ? "#FFF0F3" : type === "streak" ? "#FFF7ED" : "#F1F5F9";
              const typeColor = type === "verify" ? "#FF3355" : type === "streak" ? "#FB923C" : "#64748B";
              const typeLabel = type === "verify" ? "인증" : type === "streak" ? "연속달성" : type === "rank" ? "순위" : "댓글";
              return (
                <div key={i} className="bg-white rounded-2xl px-4 py-4 border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "none" : "translateY(10px)",
                    transition: `opacity 0.4s ease ${i * 70 + 100}ms, transform 0.4s ease ${i * 70 + 100}ms`,
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name}
                        className="w-10 h-10 rounded-full bg-slate-100" />
                      <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] border-2 border-white"
                        style={{ background: typeBg }}>
                        {typeEmoji}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[14px] font-black text-slate-900">{name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: typeBg, color: typeColor }}>{typeLabel}</span>
                        <span className="text-[11px] text-slate-400 ml-auto shrink-0">{time}</span>
                      </div>
                      <p className="text-[13px] text-slate-600 leading-snug">{msg}</p>
                      {type === "verify" && (
                        <div className="mt-3 h-[72px] w-full rounded-xl overflow-hidden flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg,${grad[0]},${grad[1]})` }}>
                          <span className="text-white/50 text-[11px] font-bold">인증 사진</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 하단 참여 버튼 ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-5"
        style={{
          background: "linear-gradient(to top, #F2F2F7 60%, transparent)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease 0.4s",
        }}>
        <button
          onClick={() => joined ? setJoined(false) : setShowJoinConfirm(true)}
          className="w-full h-14 text-[16px] font-black rounded-2xl transition-all duration-200 active:scale-[0.98]"
          style={joined ? { background: "white", color: "#94A3B8", border: "1.5px solid #E2E8F0" } : {
            background: "linear-gradient(110deg,#FF3355,#CC0030)",
            color: "white",
            boxShadow: "0 12px 28px -8px rgba(255,51,85,0.5)",
          }}>
          {joined ? "그룹 탈퇴" : "그룹 참여하기"}
        </button>
      </div>

      {/* ── 초대 링크 시트 ── */}
      {showInvite && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowInvite(false)}
          style={{ background: "rgba(0,0,0,0.5)", animation: "fade-in 0.2s ease both" }}>
          <div className="w-full bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}
            style={{ animation: "sheet-up 0.35s cubic-bezier(0.4,0,0.2,1) both" }}>
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-black text-slate-900">그룹 초대</h3>
              <button onClick={() => setShowInvite(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">아래 링크를 공유하면 친구를 이 그룹으로 초대할 수 있어요</p>
            <div className="flex gap-2">
              <div className="flex-1 h-12 px-4 rounded-2xl bg-slate-100 flex items-center overflow-hidden">
                <span className="text-[13px] text-slate-600 font-semibold truncate">{INVITE_LINK}</span>
              </div>
              <button onClick={handleCopy}
                className="h-12 px-4 rounded-2xl flex items-center gap-1.5 text-[13px] font-black text-white active:scale-95 transition-all"
                style={{
                  background: copied ? "#10B981" : "linear-gradient(110deg,#FF3355,#CC0030)",
                  boxShadow: copied ? "0 8px 20px -4px rgba(16,185,129,0.5)" : "0 8px 20px -4px rgba(255,51,85,0.4)",
                  transition: "all 0.3s ease",
                }}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
            <div className="pb-2" />
          </div>
        </div>
      )}

      {/* ── 참여 확인 시트 ── */}
      {showJoinConfirm && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowJoinConfirm(false)}
          style={{ background: "rgba(0,0,0,0.5)", animation: "fade-in 0.2s ease both" }}>
          <div className="w-full bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}
            style={{ animation: "sheet-up 0.35s cubic-bezier(0.4,0,0.2,1) both" }}>
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
            <h3 className="text-[18px] font-black text-slate-900 mb-1">그룹 참여하기</h3>
            <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
              <span className="font-bold text-slate-700">{group.title}</span>에 참여하시겠어요?{" "}
              목표를 달성하지 못하면 그룹 순위에 영향을 줍니다.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowJoinConfirm(false)}
                className="flex-1 h-12 rounded-2xl bg-slate-100 text-slate-500 font-bold text-[14px]">
                취소
              </button>
              <button onClick={() => { setJoined(true); setShowJoinConfirm(false); }}
                className="flex-1 h-12 rounded-2xl text-white font-black text-[14px] active:scale-95 transition-all"
                style={{ background: "linear-gradient(110deg,#FF3355,#CC0030)", boxShadow: "0 8px 20px -4px rgba(255,51,85,0.5)" }}>
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
