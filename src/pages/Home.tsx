import React, { useState, useEffect, useRef } from "react";
import { Bell, Camera, Flame, Send, Crown, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../lib/verifyTypes";

const GROUP_RANKERS: Record<string, { rank: number; name: string; streak: number; rate: number; seed: string; isMe: boolean }[]> = {
  "1": [ // 매일 5,000보 걷기
    { rank: 1, name: "김지수", streak: 28, rate: 96, seed: "Felix",  isMe: false },
    { rank: 2, name: "박민혁", streak: 20, rate: 90, seed: "Aneka",  isMe: false },
    { rank: 3, name: "이성민", streak: 14, rate: 84, seed: "Jude",   isMe: false },
    { rank: 4, name: "나",     streak:  8, rate: 75, seed: "MyUser", isMe: true  },
    { rank: 5, name: "최예린", streak:  5, rate: 60, seed: "Zara",   isMe: false },
  ],
  "2": [ // 러닝 크루
    { rank: 1, name: "강민준", streak: 30, rate: 97, seed: "Leo",    isMe: false },
    { rank: 2, name: "오서연", streak: 22, rate: 91, seed: "Mia",    isMe: false },
    { rank: 3, name: "유하늘", streak: 15, rate: 83, seed: "Zoe",    isMe: false },
    { rank: 4, name: "정하린", streak:  9, rate: 70, seed: "Sam",    isMe: false },
    { rank: 5, name: "나",     streak:  3, rate: 50, seed: "MyUser", isMe: true  },
  ],
  "3": [ // 일일 독서 클럽
    { rank: 1, name: "한소희", streak: 22, rate: 98, seed: "Ava",    isMe: false },
    { rank: 2, name: "이준혁", streak: 14, rate: 88, seed: "Dan",    isMe: false },
    { rank: 3, name: "나",     streak:  9, rate: 75, seed: "MyUser", isMe: true  },
    { rank: 4, name: "정우성", streak:  5, rate: 60, seed: "Owen",   isMe: false },
  ],
  "4": [ // 필사 챌린지
    { rank: 1, name: "송민재", streak: 18, rate: 95, seed: "Finn",   isMe: false },
    { rank: 2, name: "이수진", streak: 12, rate: 87, seed: "Sue",    isMe: false },
    { rank: 3, name: "나",     streak:  7, rate: 60, seed: "MyUser", isMe: true  },
    { rank: 4, name: "조현우", streak:  3, rate: 45, seed: "Hugh",   isMe: false },
  ],
  "5": [ // 포즈 챌린지
    { rank: 1, name: "윤서아", streak: 32, rate: 99, seed: "Eva",    isMe: false },
    { rank: 2, name: "김태양", streak: 24, rate: 93, seed: "Ray",    isMe: false },
    { rank: 3, name: "이하은", streak: 16, rate: 85, seed: "Hazel",  isMe: false },
    { rank: 4, name: "박준수", streak:  8, rate: 72, seed: "Jake",   isMe: false },
    { rank: 5, name: "나",     streak:  1, rate: 40, seed: "MyUser", isMe: true  },
  ],
  "6": [ // 장소 탐험대
    { rank: 1, name: "정서윤", streak: 20, rate: 94, seed: "Ella",   isMe: false },
    { rank: 2, name: "최민준", streak: 13, rate: 85, seed: "Ace",    isMe: false },
    { rank: 3, name: "나",     streak:  8, rate: 55, seed: "MyUser", isMe: true  },
    { rank: 4, name: "박하늘", streak:  4, rate: 42, seed: "Sky",    isMe: false },
  ],
};

interface ChatMsg {
  id: string; sender: string; text: string;
  seed: string; time: string; isMe?: boolean;
}

const GROUP_CHATS: Record<string, ChatMsg[]> = {
  "1": [ // 매일 5,000보 걷기
    { id: "1", sender: "김지수", text: "오늘 아침 산책 인증 완료! 👟",           seed: "Felix",  time: "07:32" },
    { id: "2", sender: "박민혁", text: "어제 13,000보 달성했어요 😄",            seed: "Aneka",  time: "08:10" },
    { id: "3", sender: "이성민", text: "저도요! 점심에 공원 한 바퀴 했어요",     seed: "Jude",   time: "08:45" },
    { id: "4", sender: "나",     text: "오늘도 같이 열심히 걸어봐요!",           seed: "MyUser", time: "09:00", isMe: true },
    { id: "5", sender: "최예린", text: "날씨 좋다~ 오늘 걷기 딱이네요 ☀️",     seed: "Zara",   time: "09:15" },
  ],
  "2": [ // 러닝 크루
    { id: "1", sender: "강민준", text: "새벽 5km 완주! 오늘 풍경 진짜 예뻤어요 🌅", seed: "Leo",    time: "06:20" },
    { id: "2", sender: "오서연", text: "와 대단해요! 저도 곧 나갈게요 🏃",          seed: "Mia",    time: "07:05" },
    { id: "3", sender: "유하늘", text: "한강 러닝 사진 올렸어요~ 다들 봐주세요",    seed: "Zoe",    time: "07:48" },
    { id: "4", sender: "나",     text: "멋진 풍경이네요! 저도 따라갈게요",          seed: "MyUser", time: "08:00", isMe: true },
    { id: "5", sender: "정하린", text: "오늘 같이 달릴 분? 저녁 7시요!",           seed: "Sam",    time: "09:30" },
  ],
  "3": [ // 일일 독서 클럽
    { id: "1", sender: "한소희", text: "오늘 책 표지 인증 완료 📚 추천 너무 좋아요!", seed: "Ava",    time: "08:15" },
    { id: "2", sender: "이준혁", text: "저도 반 읽었어요! 오늘 다 끝낼 것 같아요",   seed: "Dan",    time: "09:20" },
    { id: "3", sender: "나",     text: "좋은 책 추천해주세요~ 다 읽었어요 😊",       seed: "MyUser", time: "10:00", isMe: true },
    { id: "4", sender: "정우성", text: "저는 이번 주 목표 달성 🎉",                 seed: "Owen",   time: "10:42" },
  ],
  "4": [ // 필사 챌린지
    { id: "1", sender: "송민재", text: "오늘 필사한 문장 올렸어요 ✍️",              seed: "Finn",   time: "09:00" },
    { id: "2", sender: "이수진", text: "손글씨 너무 예쁘다!! 어떻게 그렇게 써요",   seed: "Sue",    time: "09:30" },
    { id: "3", sender: "나",     text: "저도 오늘 인상 깊은 문장 찾았어요!",         seed: "MyUser", time: "10:10", isMe: true },
    { id: "4", sender: "조현우", text: "같이 꾸준히 해봐요 화이팅 💪",              seed: "Hugh",   time: "11:00" },
  ],
  "5": [ // 포즈 챌린지
    { id: "1", sender: "윤서아", text: "오늘 포즈 도전했어요 ㅎㅎ 쪽팔렸지만 재밌어요 📸", seed: "Eva",    time: "10:05" },
    { id: "2", sender: "김태양", text: "진짜 웃겨요 ㅋㅋㅋ 저도 곧 올릴게요",             seed: "Ray",    time: "10:30" },
    { id: "3", sender: "이하은", text: "오늘 포즈 레벨 높다~ 도전해볼게요!",              seed: "Hazel",  time: "11:00" },
    { id: "4", sender: "나",     text: "같이 도전! 오늘 포즈 재밌었어요 😄",              seed: "MyUser", time: "11:20", isMe: true },
  ],
  "6": [ // 장소 탐험대
    { id: "1", sender: "정서윤", text: "오늘 북촌 한옥마을 다녀왔어요 📍 강추!",        seed: "Ella",   time: "13:00" },
    { id: "2", sender: "최민준", text: "와 진짜 예쁘다! 저도 주말에 가봐야겠어요",       seed: "Ace",    time: "13:30" },
    { id: "3", sender: "나",     text: "저도 오늘 카페거리 인증했어요~",                 seed: "MyUser", time: "14:00", isMe: true },
    { id: "4", sender: "박하늘", text: "다음에 같이 탐험 가요!! 🗺️",                  seed: "Sky",    time: "14:20" },
  ],
};

const SLIDE_COUNT = 3;

interface FeedItem {
  id: string;
  user: string;
  seed: string;
  time: string;
  caption: string;
  groupTitle: string;
  verifyEmoji: string;
  img: string;
  aspect: "tall" | "square";
}

const FEED_ITEMS: FeedItem[] = [
  {
    id: "1", user: "김지수", seed: "Felix", time: "방금 전",
    caption: "오늘도 13,200보 달성! 연속 28일째 🔥",
    groupTitle: "매일 5,000보 걷기", verifyEmoji: "👟", aspect: "tall",
    img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&fit=crop",
  },
  {
    id: "2", user: "한소희", seed: "Ava", time: "5분 전",
    caption: "이번 주 독서 인증 완료 📚",
    groupTitle: "일일 독서 클럽", verifyEmoji: "📚", aspect: "square",
    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&fit=crop",
  },
  {
    id: "3", user: "강민준", seed: "Leo", time: "11분 전",
    caption: "새벽 한강 러닝 완주! 오늘 풍경 미쳤다 🌅",
    groupTitle: "러닝 크루", verifyEmoji: "🏃", aspect: "square",
    img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&fit=crop",
  },
  {
    id: "4", user: "송민재", seed: "Finn", time: "19분 전",
    caption: "'작은 습관이 큰 변화를 만든다' 오늘의 문장 ✍️",
    groupTitle: "필사 챌린지", verifyEmoji: "✍️", aspect: "tall",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&fit=crop",
  },
  {
    id: "5", user: "윤서아", seed: "Eva", time: "25분 전",
    caption: "오늘의 포즈 도전 완료 ㅎㅎ 쑥스럽지만 재밌어요 📸",
    groupTitle: "포즈 챌린지", verifyEmoji: "📸", aspect: "square",
    img: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&fit=crop",
  },
  {
    id: "6", user: "정서윤", seed: "Ella", time: "34분 전",
    caption: "오늘 광화문 광장 방문 인증! 역시 멋있다 📍",
    groupTitle: "장소 탐험대", verifyEmoji: "📍", aspect: "tall",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&fit=crop",
  },
];

export function Home() {
  const navigate = useNavigate();
  const { nickname, beginVerification, groups } = useApp();
  const myGroups = groups.filter(g => g.joined);
  const [slideIdx, setSlideIdx]               = useState(0);
  const [showAllFeed, setShowAllFeed]         = useState(false);
  const [chats, setChats]                     = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]             = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(() => myGroups[0]?.id ?? "1");
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [btnFlash, setBtnFlash]               = useState(false);

  const chatEndRef    = useRef<HTMLDivElement>(null);
  const startX        = useRef(0);
  const startY        = useRef(0);
  const dragging      = useRef(false);
  const isHoriz       = useRef<boolean | null>(null);
  const moved         = useRef(false);

  // 그룹이 바뀌면 채팅 초기화
  useEffect(() => {
    setChats(GROUP_CHATS[selectedGroupId] ?? GROUP_CHATS["1"]);
    setChatInput("");
  }, [selectedGroupId]);

  // 참여 중인 그룹 목록이 바뀌면 selectedGroupId 유효성 확인
  useEffect(() => {
    if (myGroups.length > 0 && !myGroups.find(g => g.id === selectedGroupId)) {
      setSelectedGroupId(myGroups[0].id);
    }
  }, [myGroups.length]);

  const selectedGroup = myGroups.find(g => g.id === selectedGroupId) ?? myGroups[0];
  const rankers       = GROUP_RANKERS[selectedGroupId] ?? GROUP_RANKERS["1"];

  function parseMinutes(time: string): number {
    if (time === "방금 전") return 0;
    const m = time.match(/^(\d+)분/);
    return m ? parseInt(m[1]) : 999;
  }
  const recentFeed  = FEED_ITEMS.filter(item => parseMinutes(item.time) <= 30);
  const hiddenCount = FEED_ITEMS.length - recentFeed.length;
  const visibleFeed = showAllFeed ? FEED_ITEMS : recentFeed;

  /* ── 스와이프: 수평/수직 판별 ── */
  function touchBegin(x: number, y: number) {
    startX.current = x; startY.current = y;
    dragging.current = true; isHoriz.current = null; moved.current = false;
  }
  function touchMove(x: number, y: number) {
    if (!dragging.current) return;
    const dx = Math.abs(x - startX.current), dy = Math.abs(y - startY.current);
    if (isHoriz.current === null && (dx > 5 || dy > 5)) isHoriz.current = dx > dy;
    if (isHoriz.current && dx > 8) moved.current = true;
  }
  function touchEnd(x: number) {
    if (!dragging.current) return;
    dragging.current = false;
    if (isHoriz.current === false) return; // 수직 스와이프는 무시
    const dx = x - startX.current;
    if (!moved.current) {
      if (slideIdx === 0 && !showGroupPicker) navigate(`/challenge/group/${selectedGroupId}`);
      return;
    }
    if (dx < -50 && slideIdx < SLIDE_COUNT - 1) setSlideIdx(i => i + 1);
    if (dx >  50 && slideIdx > 0)               setSlideIdx(i => i - 1);
  }

  function selectGroup(id: string) {
    setSelectedGroupId(id);
    setShowGroupPicker(false);
    setBtnFlash(true);
    setTimeout(() => setBtnFlash(false), 600);
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,"0"), mm = String(now.getMinutes()).padStart(2,"0");
    setChats(p => [...p, { id: Date.now().toString(), sender: "나", text, seed: "MyUser", time: `${hh}:${mm}`, isMe: true }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  // 슬라이드별 transform: 각 슬라이드 absolute inset-0, 100%씩 이동
  const slideTx = (i: number) => `translate3d(${(i - slideIdx) * 100}%, 0, 0)`;
  const trans = "transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white relative">
      <style>{`
        @keyframes hm-in     { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
        @keyframes picker-in { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes btn-flash { 0%{opacity:1} 30%{opacity:0.6;transform:scale(0.98)} 60%{opacity:1;transform:scale(1.01)} 100%{opacity:1;transform:scale(1)} }
      `}</style>

      {/* 헤더 */}
      <header className="shrink-0 bg-white z-10 px-6 pt-4 pb-1.5"
        style={{ animation: "hm-in 0.4s ease both", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF3355] flex items-center justify-center text-white font-black text-[16px] shrink-0 shadow-[0_4px_12px_rgba(255,51,85,0.35)]">
              {nickname.charAt(0)}
            </div>
            <div>
              <p className="text-slate-400 text-[11px] font-medium leading-none mb-0.5">챌리</p>
              <p className="text-slate-900 font-black text-[17px] leading-none">{nickname} 님</p>
            </div>
          </div>
          <button onClick={() => navigate("/notifications")}
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3355]" />
          </button>
        </div>
      </header>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        <div className="px-4 pt-2 shrink-0">

          {/* ── 슬라이드 카드 ── */}
          <div
            className="relative w-full overflow-hidden select-none rounded-2xl"
            style={{ aspectRatio: "2/3", boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1.5px rgba(255,51,85,0.25)", outline: "none" }}
            onTouchStart={e => touchBegin(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={e  => touchMove(e.touches[0].clientX,  e.touches[0].clientY)}
            onTouchEnd={e   => touchEnd(e.changedTouches[0].clientX)}
            onMouseDown={e  => touchBegin(e.clientX, e.clientY)}
            onMouseMove={e  => touchMove(e.clientX,  e.clientY)}
            onMouseUp={e    => touchEnd(e.clientX)}
            onMouseLeave={() => { dragging.current = false; isHoriz.current = null; }}
          >

            {/* ─── 슬라이드 1: 오늘의 목표 ─── */}
            <div className="absolute inset-0 overflow-hidden"
              style={{ transform: slideTx(0), transition: trans, willChange: "transform" }}>
              {/* 배경 */}
              <div className="absolute inset-0 overflow-hidden"
                style={{ background: "linear-gradient(160deg, #0d0d18 0%, #1a0810 50%, #250b14 100%)" }}>
                <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-25"
                  style={{ background: "radial-gradient(circle, #FF3355 0%, transparent 70%)" }} />
                <div className="absolute bottom-10 -left-16 w-56 h-56 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #FF6680 0%, transparent 70%)" }} />
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #fff 0px, transparent 1px, transparent 32px)" }} />
              </div>
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

              {/* 하단 텍스트 + 그룹 피커 */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-5"
                onTouchStart={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>

                {/* 그룹 피커 */}
                {showGroupPicker && (
                  <div className="mb-3" style={{ animation: "picker-in 0.2s ease both" }}>
                    <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
                      {myGroups.map(g => (
                        <button key={g.id} onClick={() => selectGroup(g.id)}
                          className="shrink-0 flex flex-col items-start px-3 py-2.5 rounded-xl transition-all active:scale-95"
                          style={{
                            background: g.id === selectedGroupId ? "rgba(255,51,85,0.9)" : "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(8px)",
                            border: g.id === selectedGroupId ? "1px solid rgba(255,51,85,0.5)" : "1px solid rgba(255,255,255,0.2)",
                            minWidth: 130,
                          }}>
                          <p className="text-white font-black text-[13px] leading-tight truncate w-full">{g.title}</p>
                          <p className="text-white/60 text-[10px] mt-0.5">{g.members}명 · #{g.myRank}위</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 그룹 이름 + > 버튼 */}
                <div className="flex items-center gap-2 mb-1.5">
                  <button onClick={() => setShowGroupPicker(v => !v)}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all"
                    style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                    <ChevronRight className="w-4 h-4 text-white transition-transform duration-200"
                      style={{ transform: showGroupPicker ? "rotate(90deg)" : "rotate(0deg)" }} />
                  </button>
                  <h2 className="font-black text-[22px] text-white leading-tight tracking-tight">
                    {showGroupPicker ? "그룹 선택" : (selectedGroup?.title ?? "그룹 없음")}
                  </h2>
                </div>

                {/* 고정 높이 서브라인 — 항상 렌더링해서 높이 유지 */}
                <div className="pl-9 h-5 flex items-center">
                  {showGroupPicker ? (
                    <p className="text-white/50 text-[12px] font-medium">참여 중인 그룹을 선택하세요</p>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[10px] font-bold text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
                        오늘의 목표
                      </span>
                      <p className="text-white/70 text-[12px] font-semibold truncate">{selectedGroup?.goal ?? ""}</p>
                      <span className="shrink-0 text-white/40 text-[12px]">· {selectedGroup?.members ?? 0}명</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── 슬라이드 2: 그룹 내 순위 ─── */}
            <div className="absolute inset-0 overflow-hidden flex flex-col bg-white"
              style={{ transform: slideTx(1), transition: trans, willChange: "transform" }}>

              <div className="px-5 pt-6 pb-3 shrink-0">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">그룹 내 순위</p>
                <p className="text-slate-900 font-black text-[19px]">{selectedGroup?.title ?? ""}</p>
              </div>
              <div className="mx-5 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0"
                style={{ background: "rgba(255,51,85,0.07)", border: "1px solid rgba(255,51,85,0.18)" }}>
                <span className="text-[#FF3355] font-black text-[28px] w-9 text-center tabular-nums leading-none">#{selectedGroup?.myRank ?? "-"}</span>
                <div className="flex-1">
                  <p className="text-slate-800 font-black text-[14px]">내 현재 순위</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                    <span className="text-slate-400 text-[11px]">{selectedGroup?.myStreak ?? 0}일 연속 달성 중</span>
                  </div>
                </div>
                <span className="text-[#FF3355] font-black text-[20px] tabular-nums">{selectedGroup?.myRate ?? 0}%</span>
              </div>
              <div className="flex-1 px-5 pb-4 space-y-2 overflow-y-auto overscroll-contain">
                {rankers.map(({ rank, name, streak, rate, seed, isMe }) => (
                  <div key={rank}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 active:opacity-70 transition-opacity"
                    style={{ background: isMe ? "rgba(255,51,85,0.10)" : "#F8F8FA",
                      border: isMe ? "1px solid rgba(255,51,85,0.25)" : "1px solid rgba(0,0,0,0.06)",
                      cursor: isMe ? "default" : "pointer" }}
                    onClick={() => !isMe && navigate(`/user/${seed}`)}>
                    <div className="w-5 flex items-center justify-center shrink-0">
                      {rank === 1
                        ? <Crown className="w-4 h-4 text-[#FF3355]" />
                        : <span className="text-[13px] font-black tabular-nums"
                            style={{ color: isMe ? "#FF3355" : "rgba(150,150,150,0.6)" }}>{rank}</span>}
                    </div>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name}
                      className="w-8 h-8 rounded-full bg-slate-100 shrink-0" draggable={false} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold truncate ${isMe ? "text-[#FF3355]" : "text-slate-700"}`}>
                        {name}{isMe && <span className="text-[#FF3355] text-[10px] ml-1">나</span>}
                      </p>
                      <div className="flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-orange-400" />
                        <span className="text-slate-400 text-[10px]">{streak}일</span>
                      </div>
                    </div>
                    <span className={`text-[13px] font-black tabular-nums shrink-0 ${isMe ? "text-[#FF3355]" : "text-slate-400"}`}>{rate}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── 슬라이드 3: 그룹 채팅 ─── */}
            <div className="absolute inset-0 overflow-hidden flex flex-col bg-white"
              style={{ transform: slideTx(2), transition: trans, willChange: "transform" }}>

              <div className="px-5 pt-6 pb-3 shrink-0"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">그룹 채팅</p>
                <div className="flex items-center justify-between">
                  <p className="text-slate-900 font-black text-[19px]">{selectedGroup?.title ?? ""}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-400 text-[11px]">5명 온라인</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 bg-slate-50">
                {chats.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!msg.isMe && (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.seed}`} alt={msg.sender}
                        className="w-7 h-7 rounded-full bg-slate-200 shrink-0 mt-0.5 cursor-pointer active:opacity-70 transition-opacity" draggable={false}
                        onClick={() => navigate(`/user/${msg.seed}`)} />
                    )}
                    <div className={`flex flex-col gap-0.5 max-w-[72%] ${msg.isMe ? "items-end" : "items-start"}`}>
                      {!msg.isMe && (
                        <span className="text-slate-400 text-[10px] font-semibold px-1 cursor-pointer active:text-slate-600 transition-colors"
                          onClick={() => navigate(`/user/${msg.seed}`)}>
                          {msg.sender}
                        </span>
                      )}
                      <div className="px-3 py-2 text-[13px] leading-snug"
                        style={{ background: msg.isMe ? "#FF3355" : "white",
                          color: msg.isMe ? "white" : "#1e293b",
                          borderRadius: msg.isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          boxShadow: msg.isMe ? "none" : "0 1px 4px rgba(0,0,0,0.07)" }}>
                        {msg.text}
                      </div>
                      <span className="text-slate-400 text-[10px] px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="shrink-0 px-3 py-3 flex items-center gap-2 bg-white"
                style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <input type="text" value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  onTouchStart={e => e.stopPropagation()}
                  placeholder="메시지 입력..."
                  className="flex-1 h-9 px-3.5 rounded-full text-[13px] text-slate-700 placeholder-slate-300 focus:outline-none"
                  style={{ background: "#F4F4F6", border: "1px solid rgba(0,0,0,0.08)", color: "#1e293b" }} />
                <button onClick={sendChat} onTouchStart={e => e.stopPropagation()}
                  className="w-9 h-9 rounded-full bg-[#FF3355] flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                  style={{ boxShadow: "0 4px 12px rgba(255,51,85,0.3)" }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

          </div>{/* 카드 끝 */}

          {/* 점 인디케이터 */}
          <div className="flex justify-center gap-2 pt-3 pb-1">
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <button key={i} onClick={() => setSlideIdx(i)}
                style={{
                  height: 6, borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                  width: i === slideIdx ? 18 : 6,
                  background: i === slideIdx ? "#FF3355" : "rgba(128,128,128,0.35)",
                  transition: "width 0.35s cubic-bezier(0.4,0,0.2,1), background-color 0.35s ease",
                }} />
            ))}
          </div>

        </div>{/* px-4 끝 */}

        {/* 인증하기 버튼 */}
        <div className="px-4 pb-3 pt-2 shrink-0">
          <button
            onClick={() => {
              if (selectedGroup) {
                const vType = selectedGroup.verifyType as VerifyTypeKey;
                beginVerification({ goalId: null, verifyType: vType });
                navigate(`/verify/guide/${vType}`);
              } else {
                navigate("/challenge");
              }
            }}
            className="relative w-full h-[68px] rounded-[20px] flex items-center px-5 gap-4 text-white active:scale-[0.97] transition-all duration-200 overflow-hidden"
            style={{ background: "linear-gradient(115deg, #FF5C7A 0%, #FF3355 45%, #C8002B 100%)", boxShadow: "0 8px 24px rgba(255,51,85,0.22), 0 1px 0 rgba(255,255,255,0.12) inset", animation: btnFlash ? "btn-flash 0.6s cubic-bezier(0.4,0,0.2,1) both" : undefined }}>
            {/* 배경 광택 원 */}
            {/* 카메라 아이콘 */}
            <div className="shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Camera className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            {/* 텍스트 */}
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="font-black text-[16px] leading-none tracking-tight">오늘 인증하기</span>
              <span className="text-white/55 text-[12px] font-medium leading-none truncate">
                {selectedGroup
                  ? `${VERIFY_TYPES[(selectedGroup.verifyType as VerifyTypeKey) ?? "step_walk"]?.emoji} ${selectedGroup.goal}`
                  : "챌린지에 참여하고 인증해보세요"}
              </span>
            </div>
            {/* 화살표 */}
            <ChevronRight className="w-5 h-5 text-white/40 shrink-0" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── 실시간 인증 피드 ── */}
        <div className="px-4 pb-6 pt-1">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#FF3355,#CC0030)" }}>
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <h3 className="text-[17px] font-black text-slate-900">실시간 인증 피드</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <button
              onClick={() => setShowAllFeed(v => !v)}
              className="text-[12px] font-bold text-slate-400 active:text-slate-600 transition-colors"
            >
              {showAllFeed ? "최근만 보기" : `전체보기${hiddenCount > 0 ? ` +${hiddenCount}` : ""}`}
            </button>
          </div>

          {/* 벤토 비대칭 그리드 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 왼쪽 컬럼 */}
            <div className="flex flex-col gap-2.5">
              {visibleFeed.filter((_, i) => i % 2 === 0).map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
            {/* 오른쪽 컬럼 — 위로 오프셋 */}
            <div className="flex flex-col gap-2.5 mt-6">
              {visibleFeed.filter((_, i) => i % 2 === 1).map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem; key?: React.Key }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-transform cursor-pointer border border-black/[0.04]">
      {/* 이미지 */}
      <div className={`relative ${item.aspect === "tall" ? "aspect-[3/4]" : "aspect-square"}`}>
        <img
          src={item.img}
          alt={item.caption}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {/* 시간 배지 */}
        <div className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className="text-[9px] text-white font-bold">{item.time}</span>
        </div>
        {/* 그룹 배지 */}
        <div className="absolute top-2.5 right-2.5 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
          <span className="text-[10px]">{item.verifyEmoji}</span>
        </div>
        {/* 하단 유저 + 캡션 */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seed}`}
              alt={item.user}
              className="w-5 h-5 rounded-full bg-white/20 shrink-0"
            />
            <span className="text-white text-[11px] font-black truncate">{item.user}</span>
          </div>
          <p className="text-white/75 text-[11px] leading-snug line-clamp-2">{item.caption}</p>
        </div>
      </div>
    </div>
  );
}
