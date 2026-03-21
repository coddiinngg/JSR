import { useState, useEffect, useRef } from "react";
import { Bell, Camera, Flame, Send, Crown, ImageIcon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const CATEGORY_LABEL: Record<string, string> = {
  exercise: "운동", study: "공부", reading: "독서",
  habit: "습관", hobby: "취미", etc: "기타",
};

const MY_GROUPS = [
  { id: "1", name: "새벽 미라클 모닝", goal: "30분 유산소",   members: 12, myRank: 3,  myRate: 80, myStreak: 12 },
  { id: "2", name: "매일 1만보 걷기",  goal: "오늘 1만보 달성", members: 45, myRank: 7,  myRate: 65, myStreak:  5 },
  { id: "3", name: "주 1권 독서",      goal: "책 30분 읽기",  members:  8, myRank: 2,  myRate: 90, myStreak:  8 },
];

const GROUP_RANKERS: Record<string, { rank: number; name: string; streak: number; rate: number; seed: string; isMe: boolean }[]> = {
  "1": [
    { rank: 1, name: "김지수", streak: 24, rate: 98, seed: "Felix",  isMe: false },
    { rank: 2, name: "박민혁", streak: 18, rate: 91, seed: "Aneka",  isMe: false },
    { rank: 3, name: "나",     streak: 12, rate: 80, seed: "MyUser", isMe: true  },
    { rank: 4, name: "이성민", streak:  8, rate: 65, seed: "Jude",   isMe: false },
    { rank: 5, name: "최예린", streak:  5, rate: 48, seed: "Zara",   isMe: false },
  ],
  "2": [
    { rank: 1, name: "이성민", streak: 30, rate: 97, seed: "Jude",   isMe: false },
    { rank: 2, name: "최예린", streak: 22, rate: 88, seed: "Zara",   isMe: false },
    { rank: 3, name: "김지수", streak: 15, rate: 78, seed: "Felix",  isMe: false },
    { rank: 4, name: "박민혁", streak: 10, rate: 70, seed: "Aneka",  isMe: false },
    { rank: 5, name: "정하린", streak:  4, rate: 55, seed: "Sam",    isMe: false },
    { rank: 6, name: "나",     streak:  3, rate: 48, seed: "MyUser", isMe: true  },
  ],
  "3": [
    { rank: 1, name: "박민혁", streak: 20, rate: 95, seed: "Aneka",  isMe: false },
    { rank: 2, name: "나",     streak: 16, rate: 90, seed: "MyUser", isMe: true  },
    { rank: 3, name: "이성민", streak: 12, rate: 82, seed: "Jude",   isMe: false },
    { rank: 4, name: "최예린", streak:  8, rate: 70, seed: "Zara",   isMe: false },
  ],
};

interface ChatMsg {
  id: string; sender: string; text: string;
  seed: string; time: string; isMe?: boolean;
}

const INITIAL_CHATS: ChatMsg[] = [
  { id: "1", sender: "김지수", text: "오늘도 화이팅! 🔥",                    seed: "Felix",  time: "09:12" },
  { id: "2", sender: "박민혁", text: "어제 드디어 달성했어요~",               seed: "Aneka",  time: "09:45" },
  { id: "3", sender: "이성민", text: "저도요 ㅎㅎ 같이 하니까 더 잘 되네요", seed: "Jude",   time: "10:03" },
  { id: "4", sender: "나",     text: "같이 열심히 해봐요!",                   seed: "MyUser", time: "10:15", isMe: true },
  { id: "5", sender: "최예린", text: "오늘 날씨 좋다 운동하기 딱이다 💪",    seed: "Zara",   time: "10:42" },
];

const SLIDE_COUNT = 3;

export function Home() {
  const navigate = useNavigate();
  const { nickname, goals, setVerifyingGoalId } = useApp();
  const [slideIdx, setSlideIdx]               = useState(0);
  const [chats, setChats]                     = useState<ChatMsg[]>(INITIAL_CHATS);
  const [chatInput, setChatInput]             = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(MY_GROUPS[0].id);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [btnFlash, setBtnFlash]               = useState(false);

  const chatEndRef    = useRef<HTMLDivElement>(null);
  const startX        = useRef(0);
  const startY        = useRef(0);
  const dragging      = useRef(false);
  const isHoriz       = useRef<boolean | null>(null);
  const moved         = useRef(false);

  const todayGoals    = goals.filter(g => !g.skippedToday && !g.completedToday);
  const currentGoal   = todayGoals[0] ?? null;
  const displayGoal   = currentGoal ?? goals[0] ?? null;
  const selectedGroup = MY_GROUPS.find(g => g.id === selectedGroupId) ?? MY_GROUPS[0];
  const rankers       = GROUP_RANKERS[selectedGroupId] ?? GROUP_RANKERS["1"];

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
              <p className="text-slate-400 text-[11px] font-medium leading-none mb-0.5">잔소리 앱</p>
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
              {/* 배경 이미지 영역 */}
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)" }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-slate-400 text-[11px] font-medium">이미지 영역</span>
                </div>
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
                      {MY_GROUPS.map(g => (
                        <button key={g.id} onClick={() => selectGroup(g.id)}
                          className="shrink-0 flex flex-col items-start px-3 py-2.5 rounded-xl transition-all active:scale-95"
                          style={{
                            background: g.id === selectedGroupId ? "rgba(255,51,85,0.9)" : "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(8px)",
                            border: g.id === selectedGroupId ? "1px solid rgba(255,51,85,0.5)" : "1px solid rgba(255,255,255,0.2)",
                            minWidth: 130,
                          }}>
                          <p className="text-white font-black text-[13px] leading-tight truncate w-full">{g.name}</p>
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
                    {showGroupPicker ? "그룹 선택" : selectedGroup.name}
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
                      <p className="text-white/70 text-[12px] font-semibold truncate">{selectedGroup.goal}</p>
                      <span className="shrink-0 text-white/40 text-[12px]">· {selectedGroup.members}명</span>
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
                <p className="text-slate-900 font-black text-[19px]">{selectedGroup.name}</p>
              </div>
              <div className="mx-5 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0"
                style={{ background: "rgba(255,51,85,0.07)", border: "1px solid rgba(255,51,85,0.18)" }}>
                <span className="text-[#FF3355] font-black text-[28px] w-9 text-center tabular-nums leading-none">#{selectedGroup.myRank}</span>
                <div className="flex-1">
                  <p className="text-slate-800 font-black text-[14px]">내 현재 순위</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                    <span className="text-slate-400 text-[11px]">{selectedGroup.myStreak}일 연속 달성 중</span>
                  </div>
                </div>
                <span className="text-[#FF3355] font-black text-[20px] tabular-nums">{selectedGroup.myRate}%</span>
              </div>
              <div className="flex-1 px-5 pb-4 space-y-2 overflow-y-auto overscroll-contain">
                {rankers.map(({ rank, name, streak, rate, seed, isMe }) => (
                  <div key={rank} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: isMe ? "rgba(255,51,85,0.06)" : "rgba(0,0,0,0.02)",
                      border: isMe ? "1px solid rgba(255,51,85,0.2)" : "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="w-5 flex items-center justify-center shrink-0">
                      {rank === 1
                        ? <Crown className="w-4 h-4 text-[#FF3355]" />
                        : <span className="text-[13px] font-black tabular-nums"
                            style={{ color: isMe ? "#FF3355" : "rgba(0,0,0,0.2)" }}>{rank}</span>}
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
                  <p className="text-slate-900 font-black text-[19px]">{selectedGroup.name}</p>
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
                        className="w-7 h-7 rounded-full bg-slate-200 shrink-0 mt-0.5" draggable={false} />
                    )}
                    <div className={`flex flex-col gap-0.5 max-w-[72%] ${msg.isMe ? "items-end" : "items-start"}`}>
                      {!msg.isMe && <span className="text-slate-400 text-[10px] font-semibold px-1">{msg.sender}</span>}
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
                  style={{ background: "#F1F5F9", border: "1px solid rgba(0,0,0,0.06)" }} />
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
                  background: i === slideIdx ? "#FF3355" : "rgba(0,0,0,0.15)",
                  transition: "width 0.35s cubic-bezier(0.4,0,0.2,1), background-color 0.35s ease",
                }} />
            ))}
          </div>

        </div>{/* px-4 끝 */}

        {/* 인증하기 버튼 */}
        <div className="px-4 pb-3 pt-2 shrink-0">
          <button
            onClick={() => {
              if (currentGoal) { setVerifyingGoalId(currentGoal.id); navigate("/verify/camera"); }
              else navigate("/goal-setting/category");
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
                {selectedGroup.goal}
              </span>
            </div>
            {/* 화살표 */}
            <ChevronRight className="w-5 h-5 text-white/40 shrink-0" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}
