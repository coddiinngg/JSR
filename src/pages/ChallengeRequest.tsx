import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, ChevronUp, ChevronDown, MessageCircle, Share2, Bell,
  ArrowUpDown, Plus, X, Flame, CheckCircle, Clock, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── 타입 ── */
type Status = "투표중" | "개발확정" | "검토중";
type Category = "운동/건강" | "독서/공부" | "생산성" | "마음챙김" | "식습관" | "기타";
type Duration = "7일" | "21일" | "30일";
type Tab = "전체" | "투표중" | "확정됨" | "내건의";
type Sort = "최신순" | "인기순";

interface Suggestion {
  id: string;
  title: string;
  desc: string;
  status: Status;
  category: Category;
  duration: Duration;
  votes: number;
  comments: number;
  agreeRate: number;
  daysAgo: string;
  isMine?: boolean;
  operatorComment?: string;
  verifyMethod?: string;
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
    operatorComment: "많은 분들의 투표와 응원 덕분에 개발을 시작하게 됐어요. 최대한 빠르게 만들어 드릴게요!",
    commentList: [
      { name: "박", text: "와 드디어 확정됐군요. 빨리 출시됐으면 좋겠어요!" },
      { name: "최", text: "기다리고 있을게요, 기대됩니다!" },
    ],
  },
  {
    id: "3", title: "물 2L 마시기 챌린지",
    desc: "하루 권장 수분 섭취를 습관으로 만드는 챌린지예요.",
    status: "검토중", category: "식습관", duration: "21일",
    votes: 57, comments: 6, agreeRate: 72, daysAgo: "5일 전",
    progress: 57,
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

/* ── 상태별 스타일 ── */
function statusStyle(s: Status) {
  if (s === "투표중")   return { bg: "bg-[#FF3355]/10", text: "text-[#FF3355]",  border: "border-[#FF3355]/20", bar: "#FF3355", label: "투표 중",  icon: <ChevronUp className="w-3 h-3" /> };
  if (s === "개발확정") return { bg: "bg-slate-100",   text: "text-slate-700",  border: "border-slate-200",   bar: "#1e293b", label: "개발 확정", icon: <CheckCircle className="w-3 h-3" /> };
  return                       { bg: "bg-slate-100",   text: "text-slate-500",  border: "border-slate-200",   bar: "#94a3b8", label: "검토 중",  icon: <Clock className="w-3 h-3" /> };
}

const CAT_EMOJI: Record<string, string> = {
  "운동/건강": "💪", "독서/공부": "📖", "생산성": "⚡", "마음챙김": "🧘", "식습관": "🥗", "기타": "✨",
};

/* ── 카드 컴포넌트 ── */
function SuggCard({ s, idx, mounted, onDetail }: { s: Suggestion; idx: number; mounted: boolean; onDetail: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [voted, setVoted]       = useState(false);
  const st  = statusStyle(s.status);
  const pct = Math.min((s.progress / 200) * 100, 100);
  const isHot      = s.votes >= 100;
  const voteCount  = s.votes + (voted ? 1 : 0);

  const cardStyle: React.CSSProperties = {
    border: "1px solid rgba(0,0,0,0.06)",
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.4s ease ${idx * 60}ms, transform 0.4s cubic-bezier(0.4,0,0.2,1) ${idx * 60}ms`,
  };

  /* ── 투표 중 카드 ── */
  if (s.status === "투표중") {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]" style={cardStyle}>
        {/* 상단 컬러 바 */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#FF3355,#ff6b85)" }} />
        <div className="p-4">
          {/* 헤더 행 */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF3355]/10 text-[#FF3355]">
                <ChevronUp className="w-3 h-3" />투표 중
              </span>
              {isHot && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF3355]/8 text-[#FF3355]">
                  <Flame className="w-2.5 h-2.5 fill-[#FF3355]" />인기
                </span>
              )}
              {s.isMine && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">내 건의</span>
              )}
            </div>
            {/* 햄버거(펼치기) 버튼 */}
            <button
              onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200"
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
          </div>

          {/* 제목 */}
          <button className="w-full text-left mb-3" onClick={() => onDetail(s.id)}>
            <h3 className="text-[16px] font-black text-slate-900 leading-snug">{s.title}</h3>
          </button>

          {/* 진행 바 */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-500">확정까지 <span className="font-bold text-[#FF3355]">{Math.max(200 - voteCount, 0)}표</span> 남았어요</span>
              <span className="text-slate-400 font-semibold">{voteCount} / 200</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: mounted ? `${pct}%` : "0%", background: "linear-gradient(90deg,#FF3355,#ff6b85)" }} />
            </div>
          </div>

          {/* 펼침 영역 */}
          {expanded && (
            <div className="mb-3 pt-3 border-t border-slate-100"
              style={{ animation: "cr-expand 0.2s ease both" }}>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-2.5">{s.desc}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  {CAT_EMOJI[s.category]} {s.category}
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  📅 {s.duration}
                </span>
                <span className="text-[11px] text-slate-400 ml-auto">{s.daysAgo}</span>
              </div>
            </div>
          )}

          {/* 액션 행 */}
          <div className="flex gap-2">
            <button
              onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setVoted(v => !v); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[14px] transition-all active:scale-[0.97]"
              style={voted
                ? { background: "linear-gradient(115deg,#FF5C7A,#FF3355)", color: "white", boxShadow: "0 4px 14px rgba(255,51,85,0.3)" }
                : { background: "rgba(255,51,85,0.08)", color: "#FF3355", border: "1.5px solid rgba(255,51,85,0.15)" }}>
              <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
              {voted ? "투표됨" : "투표하기"} · {voteCount}
            </button>
            <button
              onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onDetail(s.id); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[13px] font-semibold active:bg-slate-200 transition-colors">
              <MessageCircle className="w-4 h-4" />{s.comments}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 개발확정 / 검토중 심플 카드 ── */
  return (
    <button
      onClick={() => onDetail(s.id)}
      className="w-full text-left bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
      style={cardStyle}
    >
      <div className="h-0.5 w-full" style={{ background: st.bar }} />
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
              {st.icon}{st.label}
            </span>
            {s.isMine && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">내 건의</span>}
          </div>
          <h3 className="text-[14px] font-black text-slate-900 leading-snug truncate">{s.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-slate-400">{CAT_EMOJI[s.category]} {s.category}</span>
            <span className="text-slate-200">·</span>
            <span className="flex items-center gap-0.5 text-[11px] text-slate-400"><MessageCircle className="w-3 h-3" />{s.comments}</span>
            <span className="text-slate-200">·</span>
            <span className="text-[11px] text-slate-400">{s.daysAgo}</span>
          </div>
          {s.status === "개발확정" && (
            <div className="flex items-center gap-1 mt-1.5">
              <CheckCircle className="w-3 h-3 text-slate-600" />
              <span className="text-[11px] text-slate-600 font-semibold">개발이 시작됐어요!</span>
            </div>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-300 shrink-0 -rotate-90" />
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   뷰: 목록
───────────────────────────────────────────── */
function ListView({ onNew, onDetail }: { onNew: () => void; onDetail: (id: string) => void }) {
  const [tab, setTab]           = useState<Tab>("전체");
  const [sort, setSort]         = useState<Sort>("최신순");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [query, setQuery]       = useState("");
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const tabs: Tab[] = ["전체", "투표중", "확정됨", "내건의"];
  const catTags = [
    { key: "운동", emoji: "💪" }, { key: "독서", emoji: "📖" },
    { key: "생산성", emoji: "⚡" }, { key: "식습관", emoji: "🥗" },
  ];

  const filtered = SUGGESTIONS.filter(s => {
    if (tab === "투표중"  && s.status !== "투표중")    return false;
    if (tab === "확정됨"  && s.status !== "개발확정")  return false;
    if (tab === "내건의"  && !s.isMine)               return false;
    if (catFilter === "운동"   && !s.category.includes("운동")) return false;
    if (catFilter === "독서"   && !s.category.includes("독서")) return false;
    if (catFilter === "생산성" && s.category !== "생산성")      return false;
    if (catFilter === "식습관" && s.category !== "식습관")      return false;
    if (query && !s.title.includes(query) && !s.desc.includes(query)) return false;
    return true;
  }).sort((a, b) => sort === "인기순" ? b.votes - a.votes : 0);

  const voting    = filtered.filter(s => s.status === "투표중");
  const confirmed = filtered.filter(s => s.status === "개발확정");
  const reviewing = filtered.filter(s => s.status === "검토중");

  function Section({ title, items, badge }: { title: string; items: Suggestion[]; badge?: string }) {
    if (!items.length) return null;
    return (
      <div className="mb-5">
        {title && (
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <span className="text-[13px] font-black text-slate-700">{title}</span>
            {badge && <span className="text-[11px] bg-[#FF3355]/10 text-[#FF3355] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {items.map((s, i) => (
            <React.Fragment key={s.id}>
              <SuggCard s={s} idx={i} mounted={mounted} onDetail={onDetail} />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#f8f8fa]">
      <style>{`
        @keyframes cr-in { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* 배너 */}
      <div className="px-4 py-3 bg-white" style={{ animation: "cr-in 0.35s ease both" }}>
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "linear-gradient(120deg,#FF3355,#ff6b85)", boxShadow: "0 4px 16px rgba(255,51,85,0.2)" }}>
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-white font-black text-[14px] leading-snug">챌린지를 직접 만들어요!</p>
            <p className="text-white/70 text-[12px]">아이디어를 건의하면 투표로 결정해요</p>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="px-4 pt-2.5 pb-2 bg-white">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="챌린지 검색..."
            className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none"
          />
          {query && <button onClick={() => setQuery("")}><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex bg-white px-4 pt-1 gap-1 border-b border-slate-100">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-[13px] font-bold transition-all ${
              tab === t
                ? "text-[#FF3355] border-b-2 border-[#FF3355]"
                : "text-slate-400"
            }`}>
            {t === "투표중" ? "투표 중" : t === "내건의" ? "내 건의" : t}
          </button>
        ))}
        <div className="ml-auto flex items-center pb-1">
          <button onClick={() => setSort(s => s === "최신순" ? "인기순" : "최신순")}
            className="flex items-center gap-1 text-[12px] text-slate-400 font-medium px-2 py-1.5 rounded-lg active:bg-slate-100 transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />{sort}
          </button>
        </div>
      </div>

      {/* 카테고리 태그 */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
        {catTags.map(c => (
          <button key={c.key} onClick={() => setCatFilter(catFilter === c.key ? null : c.key)}
            className={`shrink-0 flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
              catFilter === c.key
                ? "bg-[#FF3355] text-white border-[#FF3355] shadow-[0_2px_10px_rgba(255,51,85,0.25)]"
                : "bg-white text-slate-500 border-slate-200"
            }`}>
            <span>{c.emoji}</span>{c.key}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-32">
        {tab === "전체" ? (
          <>
            <Section title="🗳️ 투표 중" items={voting} badge={voting.length ? `${voting.length}개` : undefined} />
            <Section title="✅ 개발 확정" items={confirmed} />
            <Section title="🔍 검토 중" items={reviewing} />
          </>
        ) : (
          <Section title="" items={filtered} />
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">🔍</div>
            <p className="text-[14px] text-slate-500 font-semibold">해당하는 건의가 없어요</p>
            <p className="text-[13px] text-slate-400">직접 아이디어를 건의해보세요!</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-[#f8f8fa] via-[#f8f8fa]/90 to-transparent pointer-events-none">
        <button onClick={onNew}
          className="w-full py-4 rounded-2xl bg-[#FF3355] text-white font-black text-[15px] flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(255,51,85,0.4)] active:scale-[0.97] transition-transform pointer-events-auto"
          style={{ background: "linear-gradient(115deg,#FF5C7A,#FF3355,#C8002B)" }}>
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          새 챌린지 건의하기
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   뷰: 건의 작성 폼
───────────────────────────────────────────── */
const FORM_STEPS = ["챌린지 이름", "소개 & 이유", "세부 설정"];

function NewRequestView({ onBack }: { onBack: () => void }) {
  const [name, setName]             = useState("");
  const [reason, setReason]         = useState("");
  const [duration, setDuration]     = useState<Duration | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [category, setCategory]     = useState<Category | null>(null);
  const [verifyMethod, setVerifyMethod] = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const durations: Duration[]   = ["7일", "21일", "30일"];
  const categories: Category[]  = ["운동/건강", "독서/공부", "생산성", "마음챙김", "식습관", "기타"];
  const canSubmit = name.trim() && reason.trim() && category;

  const step = !name.trim() ? 0 : !reason.trim() ? 1 : 2;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 bg-white gap-6">
        <style>{`@keyframes cr-pop{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`}</style>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_8px_32px_rgba(255,51,85,0.25)]"
          style={{ background: "linear-gradient(135deg,#FF3355,#ff6b85)", animation: "cr-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <span className="text-4xl">🎉</span>
        </div>
        <div className="text-center" style={{ animation: "cr-pop 0.5s ease 0.2s both" }}>
          <h2 className="text-[22px] font-black text-slate-900 mb-2">건의가 접수됐어요!</h2>
          <p className="text-[14px] text-slate-500 leading-relaxed">운영팀 검토 후 투표에 올려드릴게요.<br />많은 응원 부탁드려요! 💛</p>
        </div>
        <button onClick={onBack}
          className="w-full py-4 rounded-2xl text-white font-black text-[15px] shadow-[0_6px_24px_rgba(255,51,85,0.35)] active:scale-[0.97] transition-transform"
          style={{ background: "linear-gradient(115deg,#FF5C7A,#FF3355,#C8002B)", animation: "cr-pop 0.5s ease 0.35s both" }}>
          건의함으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white"
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>

      {/* 스텝 진행 바 */}
      <div className="px-4 pt-3 pb-4 bg-white border-b border-slate-50">
        <div className="flex items-center gap-2 mb-2.5">
          {FORM_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                  i <= step ? "bg-[#FF3355] text-white shadow-[0_2px_8px_rgba(255,51,85,0.35)]" : "bg-slate-100 text-slate-400"
                }`}>{i < step ? "✓" : i + 1}</div>
                <span className={`text-[11px] font-semibold transition-colors ${i <= step ? "text-slate-700" : "text-slate-400"}`}>{s}</span>
              </div>
              {i < FORM_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 rounded-full transition-colors" style={{ background: i < step ? "#FF3355" : "#e2e8f0" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-5 pb-28 space-y-6">

        {/* 챌린지 이름 */}
        <div>
          <label className="block text-[13px] font-black text-slate-700 mb-2">
            챌린지 이름 <span className="text-[#FF3355]">*</span>
          </label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="예) 매일 스트레칭 10분 챌린지"
            className="w-full rounded-xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all"
            style={{ border: name ? "1.5px solid #FF3355" : "1.5px solid #e2e8f0", boxShadow: name ? "0 0 0 3px rgba(255,51,85,0.08)" : "none" }}
          />
        </div>

        {/* 소개 */}
        <div>
          <label className="block text-[13px] font-black text-slate-700 mb-2">
            소개 및 제안 이유 <span className="text-[#FF3355]">*</span>
          </label>
          <textarea
            value={reason} onChange={e => setReason(e.target.value.slice(0, 200))}
            placeholder="아침마다 간단한 스트레칭으로 하루를 시작하면 몸과 마음이 가벼워져요..."
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
            style={{ border: reason ? "1.5px solid #FF3355" : "1.5px solid #e2e8f0", boxShadow: reason ? "0 0 0 3px rgba(255,51,85,0.08)" : "none" }}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-[12px] font-medium transition-colors ${reason.length > 160 ? "text-[#FF3355]" : "text-slate-400"}`}>
              {reason.length} / 200자
            </span>
          </div>
        </div>

        {/* 기간 */}
        <div>
          <label className="block text-[13px] font-black text-slate-700 mb-2">챌린지 기간</label>
          <div className="flex gap-2 flex-wrap">
            {durations.map(d => (
              <button key={d} onClick={() => { setDuration(d); setCustomDuration(""); }}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all active:scale-95 ${
                  duration === d
                    ? "bg-[#FF3355] text-white border-[#FF3355] shadow-[0_2px_12px_rgba(255,51,85,0.3)]"
                    : "bg-white text-slate-600 border-slate-200"
                }`}>{d}</button>
            ))}
            <div className={`flex items-center border rounded-xl px-3 transition-all ${
              customDuration ? "border-[#FF3355] shadow-[0_0_0_3px_rgba(255,51,85,0.08)]" : "border-slate-200"
            }`}>
              <input
                value={customDuration}
                onChange={e => { setCustomDuration(e.target.value); setDuration(null); }}
                placeholder="직접 입력"
                className="w-20 text-[13px] text-slate-700 placeholder-slate-400 outline-none py-2.5 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-[13px] font-black text-slate-700 mb-2">
            카테고리 <span className="text-[#FF3355]">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`py-3 rounded-xl text-[13px] font-bold border transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
                  category === c
                    ? "bg-[#FF3355] text-white border-[#FF3355] shadow-[0_4px_14px_rgba(255,51,85,0.25)]"
                    : "bg-white text-slate-600 border-slate-200"
                }`}>
                <span>{CAT_EMOJI[c]}</span>{c}
              </button>
            ))}
          </div>
        </div>

        {/* 인증 방법 */}
        <div>
          <label className="block text-[13px] font-black text-slate-700 mb-1">
            인증 방법 제안 <span className="text-[11px] text-slate-400 font-normal">(선택)</span>
          </label>
          <p className="text-[12px] text-slate-400 mb-2">어떻게 인증하면 좋을지 알려주세요</p>
          <input
            value={verifyMethod} onChange={e => setVerifyMethod(e.target.value)}
            placeholder="예) 스트레칭 완료 사진 또는 영상"
            className="w-full rounded-xl px-4 py-3 text-[14px] text-slate-800 placeholder-slate-400 outline-none transition-all"
            style={{ border: verifyMethod ? "1.5px solid #FF3355" : "1.5px solid #e2e8f0" }}
          />
        </div>
      </div>

      {/* 제출 */}
      <div className="px-4 pb-8 pt-3 bg-white border-t border-slate-100">
        <button onClick={handleSubmit} disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl font-black text-[15px] transition-all active:scale-[0.97] ${
            canSubmit
              ? "text-white shadow-[0_6px_24px_rgba(255,51,85,0.35)]"
              : "bg-slate-100 text-slate-400"
          }`}
          style={canSubmit ? { background: "linear-gradient(115deg,#FF5C7A,#FF3355,#C8002B)" } : {}}>
          건의 제출하기
        </button>
        <p className="text-center text-[12px] text-slate-400 mt-2">제출 후 운영팀 검토가 진행됩니다</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   뷰: 건의 상세
───────────────────────────────────────────── */
function DetailView({ suggestion, onBack }: { suggestion: Suggestion; onBack: () => void }) {
  const [voted, setVoted]           = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments]     = useState(suggestion.commentList);
  const [notifyOn, setNotifyOn]     = useState(false);
  const [barW, setBarW]             = useState(0);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      setBarW(Math.min((suggestion.progress / 200) * 100, 100));
    }, 120);
    return () => clearTimeout(t);
  }, []);

  const st = statusStyle(suggestion.status);
  const voteCount = suggestion.votes + (voted ? 1 : 0);

  function submitComment() {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { name: "나", text: commentText.trim() }]);
    setCommentText("");
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white"
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
        <div className="px-4 pt-4">

          {/* 배지 */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className={`inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
              {st.icon}{st.label}
            </span>
            <span className="text-[12px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {CAT_EMOJI[suggestion.category]} {suggestion.category}
            </span>
            <span className="text-[12px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">📅 {suggestion.duration}</span>
          </div>

          <h1 className="text-[22px] font-black text-slate-900 leading-snug mb-2">{suggestion.title}</h1>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-1">{suggestion.desc}</p>
          {suggestion.verifyMethod && (
            <div className="flex items-center gap-1.5 mt-2 mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">인증 방법</span>
              <span className="text-[13px] text-slate-600">{suggestion.verifyMethod}</span>
            </div>
          )}

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            {[
              { label: "투표수",  value: voteCount,          color: "#FF3355", bg: "bg-[#FF3355]/[0.06]" },
              { label: "댓글",    value: comments.length + suggestion.comments - suggestion.commentList.length, color: "#475569", bg: "bg-slate-50" },
              { label: "공감률",  value: `${suggestion.agreeRate}%`, color: "#FF7090", bg: "bg-[#FF3355]/[0.06]" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 text-center`}>
                <p className="text-[20px] font-black leading-none mb-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 투표 진행 바 */}
          {suggestion.status === "투표중" && (
            <div className="mb-5 bg-slate-50 rounded-2xl p-4">
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-slate-600 font-semibold">확정까지 {Math.max(200 - suggestion.progress, 0)}표 더 필요해요</span>
                <span className="text-[#FF3355] font-black">{suggestion.progress} / 200</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${barW}%`, background: "linear-gradient(90deg,#FF3355,#ff6b85)" }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-right">{Math.round(barW)}% 달성</p>
            </div>
          )}

          {/* 개발 확정 배너 */}
          {suggestion.status === "개발확정" && (
            <div className="rounded-2xl p-4 mb-4 border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-slate-700" />
                <p className="text-[14px] font-black text-slate-900">이 챌린지가 확정됐어요!</p>
              </div>
              <p className="text-[13px] text-slate-500 mb-3 leading-relaxed">현재 개발 중이에요. 출시되면 알림으로 알려드릴게요.</p>
              <div className="flex gap-2">
                <button onClick={() => setNotifyOn(n => !n)}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
                    notifyOn
                      ? "bg-[#FF3355] text-white shadow-[0_4px_12px_rgba(255,51,85,0.3)]"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}>
                  <Bell className="w-4 h-4" />{notifyOn ? "알림 설정됨 ✓" : "출시 알림 받기"}
                </button>
                <button className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-slate-900 text-white active:scale-[0.97] transition-transform">
                  기대돼요! 🎉
                </button>
              </div>
            </div>
          )}

          {/* 운영자 코멘트 */}
          {suggestion.operatorComment && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "#fff8f9", border: "1px solid rgba(255,51,85,0.12)", borderLeft: "4px solid #FF3355" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <img src="/chally-logo-nobg.png" alt="" className="w-4 h-4 object-contain opacity-70" />
                <span className="text-[12px] font-black text-[#FF3355]">운영자 코멘트</span>
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed">"{suggestion.operatorComment}"</p>
              <p className="text-[11px] text-slate-400 mt-2">운영자 · 2일 전</p>
            </div>
          )}

          {/* 투표 버튼 */}
          {suggestion.status === "투표중" && (
            <button onClick={() => setVoted(v => !v)}
              className={`w-full py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 mb-5 transition-all active:scale-[0.97] ${
                voted
                  ? "text-white shadow-[0_6px_24px_rgba(255,51,85,0.35)]"
                  : "text-[#FF3355]"
              }`}
              style={voted
                ? { background: "linear-gradient(115deg,#FF5C7A,#FF3355,#C8002B)" }
                : { background: "rgba(255,51,85,0.08)", border: "1.5px solid rgba(255,51,85,0.2)" }}>
              <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
              {voted ? "투표 취소하기" : "이 챌린지에 투표하기"}
              <span className="text-lg font-black ml-1">{voteCount}</span>
            </button>
          )}

          {/* 댓글 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-slate-400" />
              <h3 className="text-[14px] font-black text-slate-700">댓글 {comments.length + suggestion.comments - suggestion.commentList.length}</h3>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF3355]/10 flex items-center justify-center text-[13px] font-black text-[#FF3355] shrink-0">
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
        <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
          style={{ background: "#f8f8fa", border: commentText ? "1.5px solid #FF3355" : "1.5px solid #e9eaec" }}>
          <input
            value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="댓글 남기기..."
            className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none"
            onKeyDown={e => e.key === "Enter" && submitComment()}
          />
          <button onClick={submitComment}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              commentText.trim()
                ? "bg-[#FF3355] text-white shadow-[0_2px_8px_rgba(255,51,85,0.35)]"
                : "bg-slate-200 text-white"
            }`}>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */
type View = "list" | "new" | "detail";

export function ChallengeRequest() {
  const navigate = useNavigate();
  const [view, setView]       = useState<View>("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  const currentSuggestion = detailId ? SUGGESTIONS.find(s => s.id === detailId) : null;

  function headerTitle() {
    if (view === "new")    return "챌린지 건의하기";
    if (view === "detail") return "건의 상세";
    return "챌린지 건의함";
  }

  function handleBack() {
    if (view === "list") navigate(-1);
    else setView("list");
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="shrink-0 bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <button onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="text-center">
          <h1 className="text-[17px] font-black text-slate-900 leading-none">{headerTitle()}</h1>
          {view === "list" && <p className="text-[11px] text-slate-400 mt-0.5">아이디어를 투표로 결정해요</p>}
        </div>
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
      {view === "detail" && currentSuggestion && <DetailView suggestion={currentSuggestion} onBack={() => setView("list")} />}
    </div>
  );
}
