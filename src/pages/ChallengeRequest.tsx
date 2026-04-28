import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Search, ChevronUp, ChevronDown, MessageCircle, Share2,
  Bell, Plus, X, Flame, CheckCircle, Clock, Send, Heart, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── 타입 ── */
type Status   = "투표중" | "개발확정" | "검토중";
type Category = "운동/건강" | "독서/공부" | "생산성" | "마음챙김" | "식습관" | "기타";
type Duration = "7일" | "21일" | "30일";
type Tab      = "전체" | "모으는중" | "만드는중" | "내건의";

interface Suggestion {
  id: string; title: string; desc: string;
  status: Status; category: Category; duration: Duration;
  votes: number; comments: number; agreeRate: number; daysAgo: string;
  isMine?: boolean; operatorComment?: string; verifyMethod?: string;
  commentList: { name: string; text: string }[];
  progress: number;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: "1", title: "매일 스트레칭 10분 챌린지",
    desc: "아침마다 간단한 스트레칭으로 하루를 시작하는 챌린지예요.",
    status: "투표중", category: "운동/건강", duration: "7일",
    votes: 128, comments: 14, agreeRate: 67, daysAgo: "3일 전",
    verifyMethod: "스트레칭 완료 사진 또는 영상", progress: 128,
    commentList: [
      { name: "김", text: "정말 좋은 아이디어에요! 저도 꼭 해보고 싶어요." },
      { name: "이", text: "스트레칭은 부상 예방에도 좋으니 꼭 만들어 주세요!" },
    ],
  },
  {
    id: "2", title: "하루 한 줄 독서 기록",
    desc: "읽은 책의 한 줄 감상을 매일 기록하는 챌린지입니다. 꾸준한 독서 습관 형성에 도움이 돼요.",
    status: "개발확정", category: "독서/공부", duration: "30일",
    votes: 243, comments: 31, agreeRate: 89, daysAgo: "1주 전",
    verifyMethod: "책 페이지 + 한 줄 감상 사진", progress: 200,
    operatorComment: "많은 분들의 응원 덕분에 개발을 시작하게 됐어요. 최대한 빠르게 만들어 드릴게요!",
    commentList: [
      { name: "박", text: "와 드디어 확정됐군요. 빨리 출시됐으면 좋겠어요!" },
      { name: "최", text: "기다리고 있을게요, 기대됩니다!" },
    ],
  },
  {
    id: "3", title: "물 2L 마시기 챌린지",
    desc: "하루 권장 수분 섭취를 습관으로 만드는 챌린지예요.",
    status: "검토중", category: "식습관", duration: "21일",
    votes: 57, comments: 6, agreeRate: 72, daysAgo: "5일 전", progress: 57,
    commentList: [{ name: "정", text: "물 마시는 습관 정말 중요한데 좋아요!" }],
  },
  {
    id: "4", title: "매일 감사 일기 쓰기",
    desc: "하루 세 가지 감사한 점을 적어 긍정적인 마음을 기르는 챌린지예요.",
    status: "투표중", category: "마음챙김", duration: "21일",
    votes: 94, comments: 11, agreeRate: 81, daysAgo: "2일 전",
    isMine: true, progress: 94,
    commentList: [{ name: "한", text: "저도 요즘 감사 일기 써요. 진짜 좋아요 💛" }],
  },
  {
    id: "5", title: "주 3회 홈트 루틴",
    desc: "집에서 할 수 있는 간단한 홈트레이닝을 꾸준히 하는 챌린지예요.",
    status: "투표중", category: "운동/건강", duration: "30일",
    votes: 76, comments: 8, agreeRate: 74, daysAgo: "6일 전",
    progress: 76, commentList: [],
  },
];

const CAT_EMOJI: Record<string, string> = {
  "운동/건강": "💪", "독서/공부": "📖", "생산성": "⚡", "마음챙김": "🧘", "식습관": "🥗", "기타": "✨",
};

const STATUS_META: Record<Status, { label: string; emoji: string; color: string; bg: string }> = {
  "투표중":   { label: "모으는 중",   emoji: "🗳️",  color: "#FF3355", bg: "rgba(255,51,85,0.07)" },
  "개발확정": { label: "만드는 중",   emoji: "🛠️",  color: "#059669", bg: "#ecfdf5" },
  "검토중":   { label: "검토 중",    emoji: "👀",  color: "#78716c", bg: "#fafaf9" },
};

/* ── 전역 CSS ── */
const G = `
  @keyframes g-up    { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
  @keyframes g-fade  { from{opacity:0}to{opacity:1} }
  @keyframes g-pop   { 0%{transform:scale(0.5);opacity:0}65%{transform:scale(1.12)}100%{transform:scale(1);opacity:1} }
  @keyframes g-heart { 0%,100%{transform:scale(1)}30%{transform:scale(0.85)}60%{transform:scale(1.25)}80%{transform:scale(0.95)} }
  @keyframes g-slide-l { from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)} }
  @keyframes g-slide-r { from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)} }
  @keyframes g-exp   { from{opacity:0;max-height:0}to{opacity:1;max-height:200px} }
  .no-sb::-webkit-scrollbar{display:none}.no-sb{-ms-overflow-style:none;scrollbar-width:none}
`;

/* ════════════════════════════════════════
   카드
════════════════════════════════════════ */
function NoteCard({
  s, idx, onDetail,
}: { s: Suggestion; idx: number; onDetail: (id: string) => void }) {
  const [cheered, setCheered] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[s.status];
  const voteCount = s.progress + (cheered ? 1 : 0);
  const pct = Math.min((voteCount / 200) * 100, 100);
  const isHot = s.votes >= 100;

  function handleCheer(e: React.MouseEvent) {
    e.stopPropagation();
    setCheered(v => !v);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 500);
  }

  const entry: React.CSSProperties = {
    animation: `g-up 0.4s cubic-bezier(0.22,1,0.36,1) ${80 + idx * 60}ms both`,
  };

  /* 투표 중 — 메인 카드 */
  if (s.status === "투표중") {
    return (
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ ...entry, boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)" }}
      >
        <div className="p-4">
          {/* 상단 메타 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.emoji} {meta.label}
              </span>
              {isHot && (
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-500">
                  🔥 인기
                </span>
              )}
              {s.isMine && (
                <span className="text-[11px] px-2 py-1 rounded-full bg-violet-50 text-violet-500 font-bold">내 건의</span>
              )}
            </div>
            <button
              onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
              className="text-[12px] text-slate-400 px-2 py-1 rounded-lg active:bg-slate-50 transition-colors"
            >
              {open ? "접기" : "더보기"}
            </button>
          </div>

          {/* 제목 */}
          <button className="w-full text-left mb-3" onClick={() => onDetail(s.id)}>
            <h3 className="text-[16px] font-bold text-slate-900 leading-snug">{s.title}</h3>
          </button>

          {/* 펼침 내용 */}
          {open && (
            <div className="mb-3 pb-3 border-b border-slate-100" style={{ animation: "g-fade 0.2s ease both" }}>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-2">{s.desc}</p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                  {CAT_EMOJI[s.category]} {s.category}
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                  📅 {s.duration}
                </span>
                {s.verifyMethod && (
                  <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    📸 {s.verifyMethod}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 진행 바 */}
          <div className="mb-3.5">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[12px] text-slate-500">
                <span className="font-bold text-slate-800">{Math.max(200 - voteCount, 0)}명</span> 더 응원하면 만들어져요!
              </span>
              <span className="text-[11px] text-slate-400">{voteCount}/200</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #FF3355, #ff8099)",
                  transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
          </div>

          {/* 액션 */}
          <div className="flex gap-2">
            <button
              onTouchStart={e => e.stopPropagation()}
              onClick={handleCheer}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[14px] transition-colors"
              style={{
                background: cheered ? "#FF3355" : "rgba(255,51,85,0.06)",
                color: cheered ? "white" : "#FF3355",
                border: cheered ? "none" : "1.5px solid rgba(255,51,85,0.15)",
              }}
            >
              <Heart
                className="w-4 h-4"
                fill={cheered ? "white" : "none"}
                style={{ animation: heartAnim ? "g-heart 0.45s ease" : "none" }}
              />
              {cheered ? "응원 중!" : "응원하기"} · {voteCount}
            </button>
            <button
              onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onDetail(s.id); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[13px] active:bg-slate-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />{s.comments}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* 개발확정 / 검토중 — 작은 카드 */
  return (
    <button
      onClick={() => onDetail(s.id)}
      className="w-full text-left bg-white rounded-xl active:scale-[0.98] transition-transform"
      style={{ ...entry, boxShadow: "0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: meta.bg }}>
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-bold" style={{ color: meta.color }}>{meta.label}</span>
            {s.isMine && <span className="text-[11px] text-violet-400 font-bold">· 내 건의</span>}
          </div>
          <h3 className="text-[14px] font-bold text-slate-800 leading-snug truncate">{s.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{s.votes}명 응원 · {s.daysAgo}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 shrink-0" />
      </div>
    </button>
  );
}

/* ════════════════════════════════════════
   목록 뷰
════════════════════════════════════════ */
function ListView({ onNew, onDetail }: { onNew: () => void; onDetail: (id: string) => void }) {
  const [tab, setTab]   = useState<Tab>("전체");
  const [query, setQuery] = useState("");

  const tabs: { key: Tab; label: string }[] = [
    { key: "전체",     label: "전체" },
    { key: "모으는중", label: "🗳️ 모으는 중" },
    { key: "만드는중", label: "🛠️ 만드는 중" },
    { key: "내건의",   label: "내 건의" },
  ];

  const filtered = SUGGESTIONS.filter(s => {
    if (tab === "모으는중" && s.status !== "투표중")   return false;
    if (tab === "만드는중" && s.status !== "개발확정") return false;
    if (tab === "내건의"   && !s.isMine)              return false;
    if (query && !s.title.includes(query) && !s.desc.includes(query)) return false;
    return true;
  });

  const voting    = filtered.filter(s => s.status === "투표중");
  const confirmed = filtered.filter(s => s.status === "개발확정");
  const reviewing = filtered.filter(s => s.status === "검토중");

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "#f7f6f3" }}>
      <style>{G}</style>

      {/* 상단 헤드 */}
      <div className="px-4 pt-3 pb-3 bg-white" style={{ animation: "g-fade 0.3s ease both" }}>
        {/* 검색 */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="어떤 챌린지를 찾고 있나요?"
            className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="active:scale-90 transition-transform">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div
        className="flex gap-1.5 px-4 py-2.5 overflow-x-auto no-sb bg-white border-b border-slate-100"
        style={{ animation: "g-fade 0.3s ease 0.05s both" }}
      >
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all active:scale-95 ${
              tab === t.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto no-sb px-4 pt-4 pb-32">
        {tab === "전체" ? (
          <>
            {voting.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">응원 모으는 중</span>
                  <span className="text-[11px] text-[#FF3355] font-bold bg-[#FF3355]/8 px-2 py-0.5 rounded-full">{voting.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {voting.map((s, i) => <React.Fragment key={s.id}><NoteCard s={s} idx={i} onDetail={onDetail} /></React.Fragment>)}
                </div>
              </div>
            )}
            {confirmed.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">지금 만들고 있어요</p>
                <div className="flex flex-col gap-2">
                  {confirmed.map((s, i) => <React.Fragment key={s.id}><NoteCard s={s} idx={i} onDetail={onDetail} /></React.Fragment>)}
                </div>
              </div>
            )}
            {reviewing.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">운영팀이 보고 있어요</p>
                <div className="flex flex-col gap-2">
                  {reviewing.map((s, i) => <React.Fragment key={s.id}><NoteCard s={s} idx={i} onDetail={onDetail} /></React.Fragment>)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s, i) => <React.Fragment key={s.id}><NoteCard s={s} idx={i} onDetail={onDetail} /></React.Fragment>)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ animation: "g-fade 0.3s ease both" }}>
            <div className="text-5xl">🤔</div>
            <p className="text-[15px] font-bold text-slate-700">아직 여기 아무것도 없네요</p>
            <p className="text-[13px] text-slate-400">첫 번째 건의를 남겨보는 건 어떨까요?</p>
          </div>
        )}
      </div>

      {/* 하단 건의 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-6 bg-gradient-to-t from-[#f7f6f3] via-[#f7f6f3]/95 to-transparent pointer-events-none">
        <button
          onClick={onNew}
          className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform pointer-events-auto"
          style={{
            background: "#1e293b",
            color: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          ✏️ &nbsp;건의하고 싶은 챌린지가 있어요
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   건의 폼 — 대화형 마법사
════════════════════════════════════════ */
const WIZARD_STEPS = [
  {
    key: "name",
    question: "어떤 챌린지를\n만들고 싶으세요? ✏️",
    hint: "챌린지 이름을 간단하게 적어주세요",
    placeholder: "예) 매일 스트레칭 10분 챌린지",
    type: "input" as const,
  },
  {
    key: "reason",
    question: "왜 이 챌린지가\n필요한가요? 💬",
    hint: "어떤 습관을 만들고 싶은지, 어떤 점이 좋은지 알려주세요",
    placeholder: "아침마다 스트레칭하면 몸도 마음도 가벼워지거든요...",
    type: "textarea" as const,
  },
  {
    key: "details",
    question: "마지막으로\n조금만 더요! 🙌",
    hint: "카테고리와 기간을 선택해주세요 (선택사항이에요)",
    type: "details" as const,
  },
];

type Category2 = Category;
type Duration2 = Duration;

function NewRequestView({ onBack }: { onBack: () => void }) {
  const [step, setStep]         = useState(0);
  const [dir, setDir]           = useState<"forward" | "back">("forward");
  const [name, setName]         = useState("");
  const [reason, setReason]     = useState("");
  const [duration, setDuration] = useState<Duration2 | null>(null);
  const [category, setCategory] = useState<Category2 | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const current = WIZARD_STEPS[step];
  const isLast  = step === WIZARD_STEPS.length - 1;

  const canNext =
    step === 0 ? name.trim().length > 0 :
    step === 1 ? reason.trim().length > 0 :
    true;

  function goNext() {
    if (!canNext) return;
    if (isLast) { setSubmitted(true); return; }
    setDir("forward");
    setStep(s => s + 1);
  }

  function goBack() {
    if (step === 0) { onBack(); return; }
    setDir("back");
    setStep(s => s - 1);
  }

  const slideAnim = dir === "forward" ? "g-slide-l 0.28s cubic-bezier(0.22,1,0.36,1) both"
                                       : "g-slide-r 0.28s cubic-bezier(0.22,1,0.36,1) both";

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 bg-white gap-5">
        <div className="text-6xl" style={{ animation: "g-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          🎉
        </div>
        <div className="text-center" style={{ animation: "g-fade 0.4s ease 0.25s both", opacity: 0 }}>
          <h2 className="text-[22px] font-bold text-slate-900 mb-2">고마워요!</h2>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            건의가 잘 도착했어요.<br />
            운영팀이 검토한 뒤 투표에 올려드릴게요 💛
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-[15px] active:scale-[0.97] transition-transform"
          style={{ animation: "g-fade 0.4s ease 0.4s both", opacity: 0 }}
        >
          건의함으로 돌아가기
        </button>
      </div>
    );
  }

  const durations: Duration2[]  = ["7일", "21일", "30일"];
  const categories: Category2[] = ["운동/건강", "독서/공부", "생산성", "마음챙김", "식습관", "기타"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      {/* 진행 도트 */}
      <div className="flex items-center justify-center gap-2 pt-3 pb-2">
        {WIZARD_STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              background: i === step ? "#1e293b" : i < step ? "#94a3b8" : "#e2e8f0",
            }}
          />
        ))}
      </div>

      {/* 슬라이드 영역 */}
      <div key={step} className="flex-1 overflow-y-auto no-sb px-5 pt-6 pb-8" style={{ animation: slideAnim }}>
        {/* 질문 */}
        <h2 className="text-[24px] font-bold text-slate-900 leading-snug mb-1.5" style={{ whiteSpace: "pre-line" }}>
          {current.question}
        </h2>
        <p className="text-[13px] text-slate-400 mb-6">{current.hint}</p>

        {/* 인풋 타입별 */}
        {current.type === "input" && (
          <input
            autoFocus
            value={name} onChange={e => setName(e.target.value)}
            placeholder={current.placeholder}
            className="w-full text-[16px] text-slate-800 placeholder-slate-300 outline-none pb-3 border-b-2 border-slate-200 focus:border-slate-900 transition-colors bg-transparent"
          />
        )}

        {current.type === "textarea" && (
          <div>
            <textarea
              autoFocus
              value={reason} onChange={e => setReason(e.target.value.slice(0, 200))}
              placeholder={current.placeholder}
              rows={5}
              className="w-full text-[15px] text-slate-800 placeholder-slate-300 outline-none resize-none bg-transparent border-b-2 border-slate-200 focus:border-slate-900 transition-colors pb-2"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-[12px] ${reason.length > 160 ? "text-slate-700" : "text-slate-300"}`}>
                {reason.length} / 200
              </span>
            </div>
          </div>
        )}

        {current.type === "details" && (
          <div className="space-y-6">
            {/* 카테고리 */}
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-2.5">카테고리</p>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(category === c ? null : c)}
                    className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all active:scale-95 ${
                      category === c
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {CAT_EMOJI[c]} {c.split("/")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 기간 */}
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-2.5">챌린지 기간</p>
              <div className="flex gap-2">
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(duration === d ? null : d)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all active:scale-95 ${
                      duration === d
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* 인증 방법 */}
            <div>
              <p className="text-[13px] font-semibold text-slate-600 mb-1">인증 방법 <span className="text-slate-400 font-normal">(선택)</span></p>
              <input
                placeholder="예) 완료 사진 또는 영상"
                className="w-full text-[15px] text-slate-800 placeholder-slate-300 outline-none pb-3 border-b-2 border-slate-200 focus:border-slate-900 transition-colors bg-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* 네비 버튼 */}
      <div className="px-5 pb-8 pt-3 flex gap-3 bg-white border-t border-slate-100">
        {step > 0 && (
          <button
            onClick={goBack}
            className="px-5 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[14px] active:scale-[0.97] transition-transform"
          >
            이전
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canNext}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all ${
            canNext ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
          }`}
        >
          {isLast ? "건의 제출하기 🎉" : <>다음 <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   상세 뷰
════════════════════════════════════════ */
function DetailView({ suggestion, onBack }: { suggestion: Suggestion; onBack: () => void }) {
  const [cheered, setCheered]     = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments]   = useState(suggestion.commentList);
  const [notifyOn, setNotifyOn]   = useState(false);
  const [barW, setBarW]           = useState(0);

  const meta      = STATUS_META[suggestion.status];
  const voteCount = suggestion.votes + (cheered ? 1 : 0);
  const pct       = Math.min((voteCount / 200) * 100, 100);

  useEffect(() => {
    const t = setTimeout(() => setBarW(Math.min((suggestion.progress / 200) * 100, 100)), 100);
    return () => clearTimeout(t);
  }, []);

  function handleCheer() {
    setCheered(v => !v);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 500);
  }

  function submitComment() {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { name: "나", text: commentText.trim() }]);
    setCommentText("");
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white" style={{ animation: "g-fade 0.3s ease both" }}>
      <div className="flex-1 overflow-y-auto no-sb pb-28">
        <div className="px-4 pt-4">

          {/* 상태 */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full"
              style={{ color: meta.color, background: meta.bg }}
            >
              {meta.emoji} {meta.label}
            </span>
            <span className="text-[12px] text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-full">
              {CAT_EMOJI[suggestion.category]} {suggestion.category}
            </span>
            <span className="text-[12px] text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-full">📅 {suggestion.duration}</span>
          </div>

          <h1 className="text-[22px] font-bold text-slate-900 leading-snug mb-2">{suggestion.title}</h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">{suggestion.desc}</p>

          {suggestion.verifyMethod && (
            <p className="text-[13px] text-slate-400 mt-2 mb-1">
              <span className="font-semibold text-slate-500">인증 방법</span> — {suggestion.verifyMethod}
            </p>
          )}

          <p className="text-[12px] text-slate-400 mt-1 mb-5">{suggestion.daysAgo} 건의</p>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "응원",   value: `${voteCount}명`, accent: true },
              { label: "댓글",   value: `${comments.length}개`, accent: false },
              { label: "공감률", value: `${suggestion.agreeRate}%`, accent: false },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: s.accent ? "rgba(255,51,85,0.05)" : "#f8f9fa" }}
              >
                <p className="text-[18px] font-bold leading-none mb-1" style={{ color: s.accent ? "#FF3355" : "#475569" }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 진행 바 (투표중) */}
          {suggestion.status === "투표중" && (
            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-slate-600">
                  <span className="font-bold text-slate-800">{Math.max(200 - voteCount, 0)}명</span> 더 응원하면 만들어져요!
                </span>
                <span className="text-slate-400">{Math.round(pct)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${barW}%`,
                    background: "linear-gradient(90deg, #FF3355, #ff8099)",
                    transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </div>
            </div>
          )}

          {/* 개발 확정 */}
          {suggestion.status === "개발확정" && (
            <div className="rounded-xl p-4 mb-5 bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-[14px] font-bold text-emerald-800">지금 만들고 있어요!</p>
              </div>
              <p className="text-[13px] text-emerald-700 leading-relaxed mb-3">출시되면 제일 먼저 알려드릴게요 🎉</p>
              <button
                onClick={() => setNotifyOn(n => !n)}
                className={`w-full py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                  notifyOn ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 border border-emerald-200"
                }`}
              >
                <Bell className="w-4 h-4" />{notifyOn ? "알림 신청됨 ✓" : "출시 알림 받기"}
              </button>
            </div>
          )}

          {/* 운영자 코멘트 */}
          {suggestion.operatorComment && (
            <div className="rounded-xl p-4 mb-5 bg-amber-50 border border-amber-100">
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-1.5">운영팀 코멘트</p>
              <p className="text-[13px] text-amber-900 leading-relaxed">"{suggestion.operatorComment}"</p>
              <p className="text-[11px] text-amber-400 mt-2">운영팀 · 2일 전</p>
            </div>
          )}

          {/* 응원 버튼 */}
          {suggestion.status === "투표중" && (
            <button
              onClick={handleCheer}
              className="w-full py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 mb-5 transition-colors active:opacity-80"
              style={{
                background: cheered ? "#FF3355" : "rgba(255,51,85,0.06)",
                color: cheered ? "white" : "#FF3355",
                border: cheered ? "none" : "1.5px solid rgba(255,51,85,0.18)",
              }}
            >
              <Heart
                className="w-5 h-5"
                fill={cheered ? "white" : "none"}
                style={{ animation: heartAnim ? "g-heart 0.45s ease" : "none" }}
              />
              {cheered ? `응원 중이에요! · ${voteCount}` : `응원하기 · ${voteCount}명`}
            </button>
          )}

          {/* 댓글 */}
          <div>
            <p className="text-[13px] font-bold text-slate-500 mb-3">댓글 {comments.length}</p>
            <div className="flex flex-col gap-3 mb-4">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5" style={{ animation: `g-fade 0.2s ease ${i * 40}ms both` }}>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[13px] font-bold text-slate-500 shrink-0">
                    {c.name}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    <p className="text-[13px] text-slate-700 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 입력 */}
      <div className="px-4 pb-6 pt-3 border-t border-slate-100 bg-white">
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
          style={{ background: "#f8f9fa", border: commentText ? "1.5px solid #1e293b" : "1.5px solid #ebebeb" }}
        >
          <input
            value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="응원 한마디 남겨요 :)"
            className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none"
            onKeyDown={e => e.key === "Enter" && submitComment()}
          />
          <button
            onClick={submitComment}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              commentText.trim() ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   메인
════════════════════════════════════════ */
type View = "list" | "new" | "detail";

export function ChallengeRequest() {
  const navigate = useNavigate();
  const [view, setView]         = useState<View>("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  const suggestion = detailId ? SUGGESTIONS.find(s => s.id === detailId) : null;

  function handleBack() {
    if (view === "list") navigate(-1);
    else setView("list");
  }

  const titles: Record<View, string> = { list: "건의함", new: "건의하기", detail: "건의 내용" };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="shrink-0 bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-[17px] font-bold text-slate-900">{titles[view]}</h1>
        <div className="w-9 h-9 flex items-center justify-center">
          {view === "detail" && (
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
              <Share2 className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>
      </header>

      {view === "list"   && <ListView onNew={() => setView("new")} onDetail={id => { setDetailId(id); setView("detail"); }} />}
      {view === "new"    && <NewRequestView onBack={() => setView("list")} />}
      {view === "detail" && suggestion && <DetailView suggestion={suggestion} onBack={() => setView("list")} />}
    </div>
  );
}
