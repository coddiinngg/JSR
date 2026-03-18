import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, RefreshCw, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp, COACH_CONFIGS } from "../contexts/AppContext";
import { CoachCharacter } from "../components/CoachCharacter";
import { cn } from "../lib/utils";

interface Message {
  id: number;
  from: "coach" | "user";
  text: string;
  time: string;
}

const QUICK_REPLIES = {
  king:     ["알겠어요...", "열심히 할게요!", "잠깐만요"],
  pressure: ["지금 할게요!", "오늘은 좀 힘들어요", "알겠어요"],
  gentle:   ["네, 해볼게요 😊", "고마워요!", "조금 있다가요"],
};

const COACH_RESPONSES = {
  king: [
    "잠깐만이 어딨어? 지금 당장 해!",
    "핑계는 집어치워. 할 수 있어, 없어?",
    "이러다가 또 밤에 후회할 거야!",
    "말만 하면 뭐해. 몸이 움직여야지!",
  ],
  pressure: [
    "시간은 기다려 주지 않아. 지금 시작해.",
    "나중에라는 건 없어. 지금이 '나중'이야.",
    "딱 10분만. 시작하면 금방이잖아.",
    "오늘 안 하면 내일은 더 힘들어져.",
  ],
  gentle: [
    "괜찮아, 천천히 해도 돼. 함께 하자 😊",
    "조금만 해도 충분해. 시작이 제일 어려운 거야.",
    "잘 할 수 있어. 내가 옆에 있을게 🌿",
    "오늘 하루도 수고했어. 조금만 더 힘내자!",
  ],
};

// 코치 유형별 환영 메시지
const WELCOME_MSGS = {
  king: "야, 오늘 목표 했어? 아직도 안 했으면 지금 당장 해!",
  pressure: "오늘 목표 확인했어? 시간이 얼마 없어. 얼른 시작해.",
  gentle: "안녕~ 오늘 어때? 목표 조금씩 같이 해보자 🌿",
};

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function CoachChat() {
  const navigate = useNavigate();
  const { coachType, nickname } = useApp();
  const cfg = COACH_CONFIGS[coachType];

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "coach", text: WELCOME_MSGS[coachType], time: now() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(2);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function sendCoachReply() {
    setTyping(true);
    const delay = 900 + Math.random() * 800;
    setTimeout(() => {
      setTyping(false);
      const pool = COACH_RESPONSES[coachType];
      const text = pool[Math.floor(Math.random() * pool.length)];
      setMessages(prev => [...prev, {
        id: nextId.current++,
        from: "coach",
        text,
        time: now(),
      }]);
    }, delay);
  }

  function sendUserMessage(text: string) {
    if (!text.trim()) return;
    setMessages(prev => [...prev, {
      id: nextId.current++,
      from: "user",
      text: text.trim(),
      time: now(),
    }]);
    setInput("");
    sendCoachReply();
  }

  function requestNag() {
    setMessages(prev => [...prev, {
      id: nextId.current++,
      from: "user",
      text: "잔소리 해줘!",
      time: now(),
    }]);
    sendCoachReply();
  }

  return (
    <div
      className="flex flex-col h-full bg-[#F5F6FA] overflow-hidden"
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <style>{`
        @keyframes cc-pop { 0%{opacity:0;transform:scale(0.85) translateY(8px);}100%{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes cc-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1);opacity:1;} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-black/[0.05]"
        style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>

        {/* 코치 아바타 + 이름 */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative shrink-0">
            <CoachCharacter type={coachType} size={44} animated />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-[15px] font-black text-slate-900">{cfg.label}</p>
            <p className="text-[11px] text-emerald-500 font-bold">온라인</p>
          </div>
        </div>

        {/* 잔소리 요청 버튼 */}
        <button
          onClick={requestNag}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold text-[#FF3355] bg-[#FFF0F3] active:bg-[#FFE0E7] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          잔소리
        </button>
      </div>

      {/* 날짜 구분선 */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] text-slate-400 font-semibold">오늘</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* 메시지 리스트 */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 pb-3 space-y-3"
      >
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={cn("flex gap-2.5", msg.from === "user" ? "flex-row-reverse" : "flex-row")}
            style={{ animation: `cc-pop 0.3s cubic-bezier(0.34,1.2,0.64,1) both` }}
          >
            {/* 코치 아바타 */}
            {msg.from === "coach" && (
              <div className="shrink-0 self-end mb-1">
                <CoachCharacter type={coachType} size={32} animated={false} />
              </div>
            )}

            <div className={cn("flex flex-col", msg.from === "user" ? "items-end" : "items-start")}>
              {/* 말풍선 */}
              <div
                className={cn(
                  "max-w-[240px] px-4 py-2.5 rounded-2xl text-[14px] font-medium leading-relaxed",
                  msg.from === "coach"
                    ? "bg-white text-slate-800 border border-black/[0.06] rounded-bl-sm"
                    : "text-white rounded-br-sm"
                )}
                style={msg.from === "user" ? {
                  background: "linear-gradient(135deg, #FF3355, #ff5570)",
                  boxShadow: "0 4px 14px rgba(255,51,85,0.3)",
                } : {
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-300 mt-1 font-semibold">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {typing && (
          <div className="flex gap-2.5" style={{ animation: "cc-pop 0.25s ease both" }}>
            <div className="shrink-0 self-end mb-1">
              <CoachCharacter type={coachType} size={32} animated={false} />
            </div>
            <div className="bg-white border border-black/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-slate-400 rounded-full"
                  style={{ animation: `cc-dot 1.2s ease infinite ${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 빠른 답장 */}
      <div className="shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_REPLIES[coachType].map(reply => (
          <button
            key={reply}
            onClick={() => sendUserMessage(reply)}
            className="px-3.5 py-2 rounded-full bg-white border border-slate-200 text-[13px] font-semibold text-slate-700 whitespace-nowrap shrink-0 active:bg-slate-50 transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="shrink-0 px-4 pb-8 pt-1 bg-[#F5F6FA] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-4 py-2.5 focus-within:border-[#FF3355] transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendUserMessage(input)}
            placeholder={`${nickname}님, 답장하기...`}
            className="flex-1 bg-transparent text-[14px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button className="text-slate-300 active:text-slate-400 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => sendUserMessage(input)}
          disabled={!input.trim()}
          className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all active:scale-95 disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #FF3355, #ff5570)", boxShadow: "0 4px 12px rgba(255,51,85,0.35)" }}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
