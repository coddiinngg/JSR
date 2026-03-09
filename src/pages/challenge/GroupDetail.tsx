import { useState, useEffect } from "react";
import { ChevronLeft, Share2, Users, Flame, Crown, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";

const GROUPS: Record<string, {
  title: string;
  desc: string;
  members: number;
  rate: number;
  status: string;
  statusColor: string;
  joined: boolean;
  rule: string;
  best: { name: string; seed: string; streak: number; rate: number }[];
  worst: { name: string; seed: string; streak: number; rate: number }[];
  activity: { name: string; time: string; msg: string }[];
}> = {
  "1": {
    title: "새벽 미라클 모닝",
    desc: "매일 새벽 5시 30분, 함께 일어나 하루를 시작해요",
    members: 12, rate: 82, status: "진행중", statusColor: "#10B981",
    joined: true, rule: "매일 오전 6시 이전 기상 인증 사진 업로드",
    best: [
      { name: "김지수", seed: "Felix", streak: 24, rate: 98 },
      { name: "박민혁", seed: "Aneka", streak: 18, rate: 92 },
      { name: "이성민", seed: "Jude",  streak: 15, rate: 87 },
    ],
    worst: [
      { name: "강태양", seed: "Bear", streak: 1, rate: 25 },
      { name: "오지현", seed: "Lily", streak: 0, rate: 18 },
      { name: "최다은", seed: "Dawn", streak: 2, rate: 33 },
    ],
    activity: [
      { name: "김지수", time: "방금",    msg: "오늘 목표 완료했어요" },
      { name: "박민혁", time: "1시간 전", msg: "새벽 5시 30분 기상 인증" },
      { name: "이성민", time: "3시간 전", msg: "연속 15일째 성공" },
      { name: "최다은", time: "5시간 전", msg: "오늘도 화이팅" },
    ],
  },
  "2": {
    title: "매일 1만보 걷기",
    desc: "하루 만 보를 함께 걸어요. 걸을수록 건강해져요",
    members: 45, rate: 65, status: "인기", statusColor: "#FF3355",
    joined: false, rule: "매일 걸음 수 스크린샷 또는 앱 연동으로 인증",
    best: [
      { name: "강민준", seed: "Leo", streak: 30, rate: 95 },
      { name: "오서연", seed: "Mia", streak: 22, rate: 90 },
      { name: "유하늘", seed: "Zoe", streak: 19, rate: 85 },
    ],
    worst: [
      { name: "김도현", seed: "Liam", streak: 1, rate: 22 },
      { name: "박준서", seed: "Evan", streak: 0, rate: 18 },
      { name: "이민영", seed: "Hope", streak: 2, rate: 30 },
    ],
    activity: [
      { name: "강민준", time: "방금",    msg: "오늘 12,345보 달성" },
      { name: "오서연", time: "2시간 전", msg: "점심시간에 공원 한 바퀴 완료" },
      { name: "유하늘", time: "4시간 전", msg: "퇴근길에 한 정거장 더 걸었어요" },
      { name: "박준혁", time: "어제",     msg: "10,200보 달성" },
    ],
  },
  "3": {
    title: "주 1권 독서",
    desc: "매주 한 권씩 읽고 함께 생각을 나눠요",
    members: 8, rate: 48, status: "마감임박", statusColor: "#F59E0B",
    joined: true, rule: "매주 금요일까지 독서 인증 사진 + 한 줄 감상 업로드",
    best: [
      { name: "한소희", seed: "Ava",  streak: 8,  rate: 100 },
      { name: "이준혁", seed: "Dan",  streak: 6,  rate: 87 },
      { name: "김나래", seed: "Ella", streak: 5,  rate: 75 },
    ],
    worst: [
      { name: "정우성", seed: "Owen", streak: 0, rate: 12 },
      { name: "노현지", seed: "Noel", streak: 1, rate: 25 },
      { name: "박성준", seed: "Paul", streak: 0, rate: 20 },
    ],
    activity: [
      { name: "한소희", time: "방금",    msg: "이번 주도 완독 성공" },
      { name: "이준혁", time: "1시간 전", msg: "절반 읽었어요" },
      { name: "김나래", time: "어제",    msg: "이번 주 책 정말 좋아요" },
    ],
  },
};

export function GroupDetail() {
  const navigate = useNavigate();
  const { groupId = "1" } = useParams<{ groupId: string }>();
  const group = GROUPS[groupId] ?? GROUPS["1"];
  const [joined, setJoined] = useState(group.joined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`
        @keyframes gp-down { from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes gp-bar  { from{width:0%;}to{width:var(--w);} }
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
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
          <Share2 style={{ width: 18, height: 18 }} className="text-slate-700" />
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

          {/* BEST / WORST */}
          <div className="grid grid-cols-2 gap-3" style={slide(140)}>

            {/* BEST */}
            <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-500">Best</p>
              </div>
              {group.best.map(({ name, seed, streak, rate: r }, i) => (
                <div key={name} className="flex items-center gap-2.5 px-4 py-2.5 relative">
                  <div className="relative shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                      alt={name}
                      className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100"
                    />
                    {i === 0 && (
                      <Crown className="absolute -top-1.5 -right-1 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{name}</p>
                    <div className="flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                      <span className="text-[10px] text-slate-400">{streak}일</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-emerald-500">{r}%</span>
                </div>
              ))}
              <div className="h-3" />
            </div>

            {/* WORST */}
            <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-rose-400">Worst</p>
              </div>
              {group.worst.map(({ name, seed, rate: r }, i) => (
                <div key={name} className="flex items-center gap-2.5 px-4 py-2.5">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt={name}
                    className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{name}</p>
                    <p className="text-[11px] font-black text-rose-400">{r}%</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">{i + 1}</span>
                </div>
              ))}
              <div className="h-3" />
            </div>
          </div>

          {/* 참여 규칙 */}
          <div
            className="bg-white rounded-2xl p-5 border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
            style={slide(220)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">참여 규칙</p>
            <p className="text-[14px] text-slate-700 leading-relaxed">{group.rule}</p>
          </div>

          {/* 최근 활동 */}
          <div
            className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.05)]"
            style={slide(300)}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 px-5 pt-4 pb-3">최근 활동</p>
            {group.activity.map(({ name, time, msg }, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                <div className="flex items-start gap-3 px-5 py-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-black shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF3355, #CC0030)" }}
                  >
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-bold text-slate-900">{name}</p>
                      <span className="text-[11px] text-slate-400">{time}</span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-snug">{msg}</p>
                  </div>
                </div>
              </div>
            ))}
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
          onClick={() => setJoined(!joined)}
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
    </div>
  );
}
