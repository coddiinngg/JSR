import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Share2, Users, Flame, Crown, Copy, Check, X, Camera } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";

type ActivityItem = {
  name: string; seed: string; time: string; msg: string;
  type: "verify" | "streak" | "rank" | "comment";
  grad: [string, string];
};

const GROUPS_DETAIL: Record<string, {
  rule: string;
  leaderboard: { rank: number; name: string; seed: string; streak: number; rate: number; isMe?: boolean }[];
  activity: ActivityItem[];
}> = {
  "1": {
    rule: "매일 5,000보 이상 만보기 스크린샷 인증",
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
      { name: "김지수", seed: "Felix", time: "방금",    msg: "오늘 13,200보 달성! 연속 24일째 🔥", type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "박민혁", seed: "Aneka", time: "1시간 전", msg: "18일 연속 달성 🔥",                  type: "streak",  grad: ["#FB923C","#F59E0B"] },
      { name: "이성민", seed: "Jude",  time: "3시간 전", msg: "점심시간 공원 한 바퀴 완료 ✅",       type: "verify",  grad: ["#34d399","#10B981"] },
      { name: "최다은", seed: "Dawn",  time: "5시간 전", msg: "오늘도 화이팅! 다 같이 걸어요 💪",   type: "comment", grad: ["#A78BFA","#7C3AED"] },
    ],
  },
  "2": {
    rule: "러닝 중 찍은 풍경 사진 인증",
    leaderboard: [
      { rank: 1, name: "강민준", seed: "Leo",  streak: 30, rate: 95 },
      { rank: 2, name: "오서연", seed: "Mia",  streak: 22, rate: 90 },
      { rank: 3, name: "유하늘", seed: "Zoe",  streak: 19, rate: 85 },
      { rank: 4, name: "임태현", seed: "Tom",  streak: 14, rate: 78 },
      { rank: 5, name: "박준서", seed: "Evan", streak: 0,  rate: 18 },
    ],
    activity: [
      { name: "강민준", seed: "Leo", time: "방금",    msg: "새벽 한강 러닝 완주! 오늘 풍경 미쳤다 🌅", type: "verify",  grad: ["#34d399","#0EA5E9"] },
      { name: "오서연", seed: "Mia", time: "2시간 전", msg: "퇴근 후 공원 러닝 완료 🏃",               type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "유하늘", seed: "Zoe", time: "4시간 전", msg: "오늘 같이 달릴 분? 저녁 7시요!",          type: "comment", grad: ["#38BDF8","#0EA5E9"] },
      { name: "임태현", seed: "Tom", time: "어제",     msg: "14일 연속 달성 🏅",                        type: "streak",  grad: ["#FB923C","#F59E0B"] },
    ],
  },
  "3": {
    rule: "매일 읽는 책 표지 사진 인증",
    leaderboard: [
      { rank: 1, name: "한소희",     seed: "Ava",  streak: 8, rate: 100 },
      { rank: 2, name: "이준혁",     seed: "Dan",  streak: 6, rate: 87  },
      { rank: 3, name: "나 (홍길동)", seed: "Kim",  streak: 5, rate: 75, isMe: true },
      { rank: 4, name: "정우성",     seed: "Owen", streak: 0, rate: 12  },
    ],
    activity: [
      { name: "한소희", seed: "Ava", time: "방금",    msg: "이번 주 독서 완료! 정말 좋은 책이에요 📚", type: "verify",  grad: ["#FB923C","#F97316"] },
      { name: "이준혁", seed: "Dan", time: "1시간 전", msg: "절반 읽었어요, 오늘 다 끝낼게요",           type: "comment", grad: ["#A78BFA","#7C3AED"] },
      { name: "한소희", seed: "Ava", time: "어제",     msg: "8주 연속 완독 달성 🏅",                    type: "streak",  grad: ["#FB923C","#F59E0B"] },
      { name: "정우성", seed: "Owen",time: "어제",     msg: "오늘 시작했어요! 다들 화이팅 📖",           type: "verify",  grad: ["#34d399","#10B981"] },
    ],
  },
  "4": {
    rule: "오늘의 인상 깊은 문장 사진 인증",
    leaderboard: [
      { rank: 1, name: "송민재", seed: "Finn",  streak: 18, rate: 95 },
      { rank: 2, name: "이수진", seed: "Sue",   streak: 12, rate: 87 },
      { rank: 3, name: "조현우", seed: "Hugh",  streak: 7,  rate: 70 },
      { rank: 4, name: "박서은", seed: "Sera",  streak: 2,  rate: 40 },
    ],
    activity: [
      { name: "송민재", seed: "Finn", time: "방금",    msg: "'작은 습관이 큰 변화를 만든다' 오늘의 문장 ✍️", type: "verify",  grad: ["#A78BFA","#7C3AED"] },
      { name: "이수진", seed: "Sue",  time: "2시간 전", msg: "손글씨 필사 완료! 마음이 차분해져요",          type: "verify",  grad: ["#38BDF8","#0284C7"] },
      { name: "조현우", seed: "Hugh", time: "어제",     msg: "같이 꾸준히 해봐요 💪",                       type: "comment", grad: ["#FB923C","#F59E0B"] },
      { name: "박서은", seed: "Sera", time: "어제",     msg: "7일 연속 달성! 🎉",                           type: "streak",  grad: ["#34d399","#10B981"] },
    ],
  },
  "5": {
    rule: "오늘의 지정 포즈로 셀카 인증",
    leaderboard: [
      { rank: 1, name: "윤서아", seed: "Eva",   streak: 28, rate: 97 },
      { rank: 2, name: "김태양", seed: "Ray",   streak: 21, rate: 91 },
      { rank: 3, name: "이하은", seed: "Hazel", streak: 17, rate: 85 },
      { rank: 4, name: "박준수", seed: "Jake",  streak: 9,  rate: 72 },
      { rank: 5, name: "최유리", seed: "Ruby",  streak: 4,  rate: 50 },
    ],
    activity: [
      { name: "윤서아", seed: "Eva",   time: "방금",    msg: "오늘 포즈 도전 완료! 쑥스럽지만 재밌어요 📸", type: "verify",  grad: ["#FF3355","#FF6680"] },
      { name: "김태양", seed: "Ray",   time: "1시간 전", msg: "21일 연속 달성! 이젠 익숙해졌어요 😄",       type: "streak",  grad: ["#FB923C","#F59E0B"] },
      { name: "이하은", seed: "Hazel", time: "3시간 전", msg: "오늘 포즈 제일 어렵다 ㅋㅋ 그래도 성공!",    type: "verify",  grad: ["#A78BFA","#7C3AED"] },
      { name: "박준수", seed: "Jake",  time: "어제",     msg: "친구 같이 찍었어요~ 2배 재밌어요!",           type: "comment", grad: ["#38BDF8","#0EA5E9"] },
    ],
  },
  "6": {
    rule: "목표 장소 방문 인증 사진",
    leaderboard: [
      { rank: 1, name: "정서윤", seed: "Ella",  streak: 20, rate: 94 },
      { rank: 2, name: "최민준", seed: "Ace",   streak: 13, rate: 85 },
      { rank: 3, name: "임지수", seed: "Grace", streak: 8,  rate: 72 },
      { rank: 4, name: "박하늘", seed: "Sky",   streak: 3,  rate: 45 },
    ],
    activity: [
      { name: "정서윤", seed: "Ella",  time: "방금",    msg: "오늘 북촌 한옥마을 방문 인증! 강추 📍",       type: "verify",  grad: ["#38BDF8","#0284C7"] },
      { name: "최민준", seed: "Ace",   time: "2시간 전", msg: "성수동 카페거리 탐험 완료 ☕",               type: "verify",  grad: ["#34d399","#10B981"] },
      { name: "임지수", seed: "Grace", time: "어제",     msg: "다음에 같이 탐험 가요!! 🗺️",               type: "comment", grad: ["#A78BFA","#7C3AED"] },
      { name: "박하늘", seed: "Sky",   time: "어제",     msg: "8일 연속 달성 🎉",                          type: "streak",  grad: ["#FB923C","#F59E0B"] },
    ],
  },
};

// 그룹별 히어로 이미지
const HERO_IMAGES: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&fit=crop&q=80",
  "2": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&fit=crop&q=80",
  "3": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop&q=80",
  "4": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&q=80",
  "5": "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&fit=crop&q=80",
  "6": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&fit=crop&q=80",
};

// 활동 피드 이미지 (그룹별)
const ACTIVITY_IMGS: Record<string, string[]> = {
  "1": [
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486218119243-13301ac3f579?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&fit=crop&q=80",
  ],
  "2": [
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&fit=crop&q=80",
  ],
  "3": [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&fit=crop&q=80",
  ],
  "4": [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500989145603-8e7ef71d639e?w=400&fit=crop&q=80",
  ],
  "5": [
    "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&fit=crop&q=80",
  ],
  "6": [
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&fit=crop&q=80",
  ],
};

const INVITE_BASE = "https://chally.app/join/GROUP-";
const MEDAL = ["🥇", "🥈", "🥉"];

const rateColor = (r: number) =>
  r >= 80 ? "#10B981" : r >= 50 ? "#F59E0B" : "#FF3355";

export function GroupDetail() {
  const navigate = useNavigate();
  const { groupId = "1" } = useParams<{ groupId: string }>();
  const { groups, joinGroup, leaveGroup, beginVerification } = useApp();

  const group  = groups.find(g => g.id === groupId) ?? groups[0];
  const detail = GROUPS_DETAIL[groupId] ?? GROUPS_DETAIL["1"];

  const [mounted, setMounted]                   = useState(false);
  const [tab, setTab]                           = useState<"leaderboard" | "activity">("leaderboard");
  const [copied, setCopied]                     = useState(false);
  const [showInvite, setShowInvite]             = useState(false);
  const [showJoinConfirm, setShowJoinConfirm]   = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [scrolled, setScrolled]                 = useState(false);
  const [showMyRate, setShowMyRate]             = useState(false);
  const scrollRef                               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const inviteLink = `${INVITE_BASE}${groupId.padStart(4, "0")}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const top3      = detail.leaderboard.slice(0, 3);
  const restList  = detail.leaderboard.slice(3);
  const top3Seeds = detail.leaderboard.slice(0, 3).map(r => r.seed);
  const vt        = VERIFY_TYPES[(group?.verifyType as VerifyTypeKey) ?? "step_walk"];
  const heroImg   = HERO_IMAGES[groupId] ?? HERO_IMAGES["1"];
  const actImgs   = ACTIVITY_IMGS[groupId] ?? ACTIVITY_IMGS["1"];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F2F2F7] relative">
      <style>{`
        @keyframes sheet-up  { from{opacity:0;transform:translateY(100%);}to{opacity:1;transform:translateY(0);} }
        @keyframes fade-in   { from{opacity:0;}to{opacity:1;} }
        @keyframes noti-drop { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* ── 스크롤 시 나타나는 컴팩트 바 ── */}
      <div className="absolute top-0 left-0 right-0 z-30 transition-all duration-300"
        style={{
          opacity: scrolled ? 1 : 0,
          transform: scrolled ? "translateY(0)" : "translateY(-100%)",
          background: "rgba(26,10,20,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 shrink-0 active:bg-white/20 transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <p className="text-white font-black text-[15px] leading-none truncate flex-1">{group.title}</p>
          <span className="text-[#FF3355] font-black text-[15px] tabular-nums shrink-0">{group.rate}%</span>
        </div>
        <div className="flex gap-1 px-4 pb-2">
          {(["leaderboard", "activity"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 py-1.5 rounded-xl text-[12px] font-black transition-all",
                tab === t ? "text-white" : "text-white/40")}
              style={tab === t ? { background: "linear-gradient(110deg,#FF3355,#CC0030)" } : {}}>
              {t === "leaderboard" ? "🏆 순위" : "💬 활동"}
            </button>
          ))}
        </div>
      </div>

      {/* ── 전체 스크롤 영역 ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto"
        onScroll={() => setScrolled((scrollRef.current?.scrollTop ?? 0) > 350)}>

        {/* ── 히어로 이미지 섹션 ── */}
        <section className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
          <img
            src={heroImg}
            alt={group.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* 상단 네비 */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 pb-2 z-10">
            <button onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm active:bg-black/50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setShowInvite(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm active:bg-black/50 transition-colors">
              <Share2 className="text-white" style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* 하단 오버레이: 배지 + 제목 + 설명 + 참여버튼 */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-14 z-10">
            {/* 상태 배지 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: `${group.statusColor}CC`, color: "white" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {group.status}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white/80 bg-white/15 backdrop-blur-sm">
                {vt.emoji} {vt.label}
              </span>
            </div>
            <h2 className="text-[30px] font-black text-white tracking-tight leading-tight">{group.title}</h2>
            <p className="text-white/75 mt-1.5 text-[13px] leading-relaxed">{group.desc}</p>

            {/* 참여/탈퇴 버튼 */}
            <div className="mt-4">
              {group.joined ? (
                <button onClick={() => setShowLeaveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 active:scale-95 transition-transform">
                  <span className="text-[14px]">🚪</span>
                  <span className="text-white/80 text-[13px] font-bold">탈퇴하기</span>
                </button>
              ) : (
                <button onClick={() => setShowJoinConfirm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full active:scale-95 transition-transform"
                  style={{ background: "linear-gradient(110deg,#FF3355,#CC0030)", boxShadow: "0 4px 20px rgba(255,51,85,0.5)" }}>
                  <span className="text-[14px]">✅</span>
                  <span className="text-white text-[13px] font-bold">챌린지 참여하기</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── 스탯 카드 (히어로 오버랩) ── */}
        <section className="px-4 relative z-10" style={{ marginTop: -40 }}>
          <div
            className="bg-white rounded-2xl p-5 space-y-4"
            style={{
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
            }}
          >
            {/* 참여자 아바타 + 수 + 달성률 */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 shrink-0">
                {top3Seeds.map((seed, i) => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 shrink-0" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black text-slate-500">+{Math.max(0, group.members - 3)}</span>
                </div>
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium">현재 참여 중</p>
                <p className="text-[18px] font-black text-[#FF3355] leading-none">{group.members.toLocaleString()}명</p>
              </div>
              <div className="w-px h-8 bg-slate-100 shrink-0" />
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-400 font-medium">달성률</p>
                <p className="text-[18px] font-black text-slate-900 leading-none">{group.rate}%</p>
              </div>
            </div>

            {/* 인증 방식 */}
            <div className="bg-slate-50 rounded-xl px-3.5 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <span className="text-[16px]">{vt.emoji}</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">인증 방식</p>
                <p className="text-[13px] font-black text-slate-900">{vt.label}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 내 달성률 (아코디언) ── */}
        <section className="px-4 mt-5">
          <button
            onClick={() => setShowMyRate(v => !v)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-4 active:bg-slate-50 transition-colors"
            style={{
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(10px)",
              transition: "opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s, background-color 0.15s ease",
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#FF3355,#CC0030)", boxShadow: "0 4px 12px rgba(255,51,85,0.3)" }}>
              <Flame className="w-5 h-5 text-white fill-white/50" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-black text-slate-900">내 달성률</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#FF3355]" style={{ width: `${group.myRate}%`, transition: "width 0.8s ease" }} />
                </div>
                <span className="text-[11px] text-slate-400">{group.myStreak}일 연속</span>
              </div>
            </div>
            <span className="text-[20px] font-black text-[#FF3355] tabular-nums shrink-0">{group.myRate}%</span>
            <ChevronLeft
              className="w-4 h-4 text-slate-300 transition-transform duration-200 shrink-0"
              style={{ transform: showMyRate ? "rotate(-90deg)" : "rotate(180deg)" }}
            />
          </button>

          {showMyRate && (
            <div className="mt-2 bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", animation: "noti-drop 0.2s ease both" }}>
              {/* 달성률 상세 */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">내 달성률</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[38px] font-black text-slate-900 leading-none tabular-nums">{group.myRate}</span>
                      <span className="text-[16px] font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-400 fill-orange-300" />
                    <span className="text-[13px] font-black text-orange-500">{group.myStreak}일 연속</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${group.myRate}%`, background: "linear-gradient(90deg,#FF5C7A,#FF3355)" }} />
                </div>
              </div>
              <div className="h-px bg-slate-50 mx-4" />
              {/* 내 인증 사진 그리드 */}
              <div className="px-4 pt-3 pb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">내 인증 기록</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {actImgs.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img src={src} alt="인증" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 탭 ── */}
        <div className="mx-4 mt-5 flex gap-1 p-1 bg-white rounded-2xl border border-black/[0.04]"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease 0.35s",
          }}>
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

        {/* ── 탭 컨텐츠 ── */}
        <div className="pb-6">
          {tab === "leaderboard" ? (
            <div className="px-4 mt-3 space-y-2.5">
              {/* 상위 3인 포디엄 — 2·1·3 배치 */}
              <div className="flex gap-2 items-end" style={{ alignItems: "flex-end" }}>
                {[
                  top3.find(r => r.rank === 2),
                  top3.find(r => r.rank === 1),
                  top3.find(r => r.rank === 3),
                ].filter((r): r is typeof top3[number] => !!r).map(({ rank, name, seed, streak, rate: r, isMe }, i) => {
                  const is1st = rank === 1;
                  return (
                    <div key={rank}
                      className="flex flex-col items-center px-2 rounded-2xl active:opacity-70 transition-opacity cursor-pointer overflow-hidden"
                      onClick={() => !isMe && navigate(`/user/${seed}`)}
                      style={{
                        flex: is1st ? "1.4" : "1",
                        height: is1st ? 210 : 178,
                        paddingTop: is1st ? 20 : 14,
                        paddingBottom: 14,
                        background: is1st ? "linear-gradient(160deg,rgba(255,51,85,0.08),white)" : "white",
                        border: is1st ? "1.5px solid rgba(255,51,85,0.2)" : "1px solid rgba(0,0,0,0.06)",
                        boxShadow: is1st ? "0 6px 24px rgba(255,51,85,0.12)" : "0 2px 10px rgba(0,0,0,0.04)",
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "none" : "translateY(12px)",
                        transition: `opacity 0.45s ease ${i * 60}ms, transform 0.45s ease ${i * 60}ms`,
                      }}>
                      <span className="text-[22px] mb-2 shrink-0">{MEDAL[rank - 1]}</span>
                      <div className="relative mb-2 shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name}
                          className="rounded-full bg-slate-100"
                          style={{ width: is1st ? 52 : 42, height: is1st ? 52 : 42 }} />
                        {is1st && (
                          <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <p className={cn("font-black text-center leading-tight mb-1.5 px-1 w-full truncate shrink-0",
                        is1st ? "text-[12px]" : "text-[11px]",
                        isMe ? "text-[#FF3355]" : "text-slate-800")}>
                        {name}
                      </p>
                      <span className={cn("font-black tabular-nums shrink-0", is1st ? "text-[17px]" : "text-[15px]")}
                        style={{ color: rateColor(r) }}>{r}%</span>
                      <div className="flex items-center gap-0.5 mt-1 shrink-0">
                        <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                        <span className="text-[10px] text-slate-400 font-semibold">{streak}일</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4위~ */}
              {restList.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {restList.map(({ rank, name, seed, streak, rate: r, isMe }, i) => (
                    <div key={name}>
                      {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                      <div
                        className={cn("flex items-center gap-3 px-4 py-3.5 active:opacity-70 transition-opacity cursor-pointer", isMe ? "bg-[#FFF5F7]" : "")}
                        onClick={() => !isMe && navigate(`/user/${seed}`)}
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
            /* ── 활동 피드: 벤토 포토 그리드 ── */
            <div className="px-4 mt-3">
              <div className="grid grid-cols-2 gap-2.5">
                {/* 왼쪽 컬럼 */}
                <div className="flex flex-col gap-2.5">
                  {detail.activity.filter((_, i) => i % 2 === 0).map((item, i) => {
                    const isVerify = item.type === "verify";
                    const imgSrc = actImgs[i * 2] ?? actImgs[0];
                    return (
                      <ActivityCard key={i} item={item} imgSrc={isVerify ? imgSrc : undefined}
                        aspect={i === 0 ? "tall" : "square"} mounted={mounted} delay={i * 80} />
                    );
                  })}
                </div>
                {/* 오른쪽 컬럼 — mt-6 오프셋 */}
                <div className="flex flex-col gap-2.5 mt-6">
                  {detail.activity.filter((_, i) => i % 2 === 1).map((item, i) => {
                    const isVerify = item.type === "verify";
                    const imgSrc = actImgs[i * 2 + 1] ?? actImgs[1];
                    return (
                      <ActivityCard key={i} item={item} imgSrc={isVerify ? imgSrc : undefined}
                        aspect={i === 0 ? "square" : "tall"} mounted={mounted} delay={i * 80 + 40} />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>{/* 스크롤 영역 끝 */}

      {/* ── FAB: 오늘의 인증하기 (참여 중일 때) ── */}
      {group.joined && (
        <div className="shrink-0 px-4 pb-8 pt-3 bg-[#F2F2F7] border-t border-black/[0.04]">
          <button
            onClick={() => {
              beginVerification({ goalId: null, verifyType: group.verifyType as VerifyTypeKey });
              navigate(`/verify/guide/${group.verifyType}`);
            }}
            className="w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl text-white font-black text-[16px] active:scale-[0.98] transition-transform"
            style={{
              background: `linear-gradient(115deg, ${vt.bgGrad[0]}, ${vt.bgGrad[1]})`,
              boxShadow: `0 8px 24px -4px ${vt.bgGrad[0]}60`,
            }}
          >
            <Camera className="w-5 h-5" />
            {vt.emoji} 오늘의 인증하기
          </button>
        </div>
      )}

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
                <span className="text-[13px] text-slate-600 font-semibold truncate">{inviteLink}</span>
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
                className="flex-1 h-12 rounded-2xl bg-slate-100 text-slate-500 font-bold text-[14px]">취소</button>
              <button onClick={() => { joinGroup(groupId); setShowJoinConfirm(false); }}
                className="flex-1 h-12 rounded-2xl text-white font-black text-[14px] active:scale-95 transition-all"
                style={{ background: "linear-gradient(110deg,#FF3355,#CC0030)", boxShadow: "0 8px 20px -4px rgba(255,51,85,0.5)" }}>
                참여하기
              </button>
            </div>
            <div className="pb-2" />
          </div>
        </div>
      )}

      {/* ── 탈퇴 확인 시트 ── */}
      {showLeaveConfirm && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowLeaveConfirm(false)}
          style={{ background: "rgba(0,0,0,0.5)", animation: "fade-in 0.2s ease both" }}>
          <div className="w-full bg-white rounded-t-3xl p-6" onClick={e => e.stopPropagation()}
            style={{ animation: "sheet-up 0.35s cubic-bezier(0.4,0,0.2,1) both" }}>
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
            <div className="text-center mb-5">
              <span className="text-[40px]">🚪</span>
              <h3 className="text-[18px] font-black text-slate-900 mt-2">탈퇴 하시겠습니까?</h3>
              <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                <span className="font-bold text-slate-600">{group.title}</span>에서 나가면<br />달성 기록이 초기화될 수 있어요.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 h-12 rounded-2xl bg-slate-100 text-slate-500 font-bold text-[14px]">취소</button>
              <button onClick={() => { leaveGroup(groupId); setShowLeaveConfirm(false); }}
                className="flex-1 h-12 rounded-2xl text-white font-black text-[14px] active:scale-95 transition-all"
                style={{ background: "linear-gradient(110deg,#FF3355,#CC0030)", boxShadow: "0 8px 20px -4px rgba(255,51,85,0.5)" }}>
                탈퇴하기
              </button>
            </div>
            <div className="pb-2" />
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({
  item, imgSrc, aspect, mounted, delay,
}: {
  item: ActivityItem; imgSrc?: string; aspect: "tall" | "square";
  mounted: boolean; delay: number; key?: React.Key;
}) {
  const typeEmoji  = item.type === "verify" ? "📸" : item.type === "streak" ? "🔥" : item.type === "rank" ? "🏆" : "💬";
  const typeLabel  = item.type === "verify" ? "인증" : item.type === "streak" ? "연속달성" : item.type === "rank" ? "순위" : "댓글";
  const typeBg     = item.type === "verify" ? "#FFF0F3" : item.type === "streak" ? "#FFF7ED" : "#F1F5F9";
  const typeColor  = item.type === "verify" ? "#FF3355" : item.type === "streak" ? "#FB923C" : "#64748B";

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white border border-black/[0.04] shadow-sm active:scale-[0.97] transition-transform cursor-pointer"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(12px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
      }}
    >
      {/* 이미지 영역 */}
      <div className={`relative ${aspect === "tall" ? "aspect-[3/4]" : "aspect-square"}`}>
        {imgSrc ? (
          <img src={imgSrc} alt={item.msg} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg,${item.grad[0]},${item.grad[1]})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* 타입 배지 */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
          style={{ background: typeBg + "CC", backdropFilter: "blur(4px)" }}>
          <span className="text-[9px] font-black" style={{ color: typeColor }}>{typeEmoji} {typeLabel}</span>
        </div>
        {/* 하단 유저 + 메시지 */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seed}`}
              className="w-5 h-5 rounded-full bg-white/20 shrink-0" />
            <span className="text-white text-[11px] font-black truncate">{item.name}</span>
            <span className="text-white/50 text-[10px] ml-auto shrink-0">{item.time}</span>
          </div>
          <p className="text-white/80 text-[11px] leading-snug line-clamp-2">{item.msg}</p>
        </div>
      </div>
    </div>
  );
}
