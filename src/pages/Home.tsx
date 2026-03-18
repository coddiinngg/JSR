import { useState, useEffect, useRef } from "react";
import {
  Search, Bell, ChevronDown, Users,
  Droplet, Flame, CheckCircle2, Activity,
  BookOpen, Apple, Sparkles, X, TrendingUp, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { SnoozeModal } from "../components/SnoozeModal";
import { useApp } from "../contexts/AppContext";
import { CoachCharacter } from "../components/CoachCharacter";

/* ─── 타입 ─── */
type ViewMode = "group" | "all" | "joined";

/* ─── 카테고리 메타 ─── */
const CAT_ICON: Record<string, React.ElementType> = {
  생활: Sparkles,
  운동: Activity,
  식단: Apple,
  학습: BookOpen,
  수분: Droplet,
};

const CAT_COLOR: Record<string, string> = {
  생활: "#a855f7",
  운동: "#f97316",
  식단: "#22c55e",
  학습: "#3b82f6",
  수분: "#06b6d4",
};

const CAT_BG: Record<string, string> = {
  생활: "#f5f3ff",
  운동: "#fff7ed",
  식단: "#f0fdf4",
  학습: "#eff6ff",
  수분: "#ecfeff",
};

/* ─── 챌린지 데이터 ─── */
type ChallengeStatus = "참여 중" | "같이 해요" | "마감됐어요";

interface ChallengeCard {
  id: string;
  title: string;
  desc: string;
  category: string;
  current: number;
  total: number;
  progress: number;
  status: ChallengeStatus;
  trending?: boolean;
}

const CHALLENGES: ChallengeCard[] = [
  { id: "1", title: "새벽 미라클 모닝", desc: "매일 오전 6시 이전 기상 인증", category: "생활",  current: 8,  total: 12,  progress: 82, status: "참여 중"    },
  { id: "2", title: "매일 1만보 걷기",  desc: "걸음 수 스크린샷으로 인증",   category: "운동",  current: 21, total: 30,  progress: 60, status: "참여 중",   trending: true },
  { id: "3", title: "주 1권 독서",       desc: "매주 금요일까지 독서 인증",  category: "학습",  current: 5,  total: 10,  progress: 48, status: "같이 해요"  },
  { id: "4", title: "물 2L 마시기",      desc: "하루 물 섭취 인증",          category: "수분",  current: 17, total: 20,  progress: 65, status: "참여 중"    },
  { id: "5", title: "저탄고지 식단",     desc: "식단 사진으로 매일 인증",    category: "식단",  current: 8,  total: 15,  progress: 71, status: "같이 해요"  },
  { id: "6", title: "매일 명상 10분",    desc: "명상 완료 후 인증",          category: "생활",  current: 0,  total: 31,  progress: 0,  status: "마감됐어요" },
];

const JOINED_IDS = new Set(["1", "2", "4"]);

/* ─── 상태 스타일 ─── */
const STATUS_STYLE: Record<ChallengeStatus, string> = {
  "참여 중":    "bg-emerald-50  text-emerald-600",
  "같이 해요":  "bg-[#FFF0F3]   text-[#FF3355]",
  "마감됐어요": "bg-slate-100   text-slate-400",
};

/* ─── 뷰 모드 레이블 ─── */
const VIEW_LABELS: Record<ViewMode, string> = {
  group:  "그룹 챌린지",
  all:    "모두 챌린지",
  joined: "참여 중 챌린지",
};

/* ─── 원형 아이콘 ─── */
function CatCircle({ category }: { category: string }) {
  const Icon = CAT_ICON[category] ?? Sparkles;
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      style={{ background: CAT_BG[category] ?? "#f8f8f8" }}
    >
      <Icon className="w-5 h-5" style={{ color: CAT_COLOR[category] ?? "#888" }} strokeWidth={2} />
    </div>
  );
}

/* ─── 챌린지 카드 ─── */
function Card({ card, delay, mounted, onClick }: { card: ChallengeCard; delay: number; mounted: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-100 p-4 transition-all duration-500 active:scale-[0.98] text-left"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${delay}ms`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* 카테고리 아이콘 */}
        <CatCircle category={card.category} />

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">{card.desc}</span>
              {card.trending && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500">인기</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400 tabular-nums">{card.current}/{card.total}</span>
              <span className={cn("ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0", STATUS_STYLE[card.status])}>
                {card.status}
              </span>
            </div>
          </div>
          <p className="font-bold text-[15px] text-slate-900 leading-snug mb-2.5">{card.title}</p>
          {/* 진행바 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: mounted ? `${card.progress}%` : "0%",
                  background: card.status === "마감됐어요"
                    ? "#cbd5e1"
                    : "linear-gradient(90deg, #FF3355, #ff6680)",
                  transitionDelay: `${delay + 200}ms`,
                }}
              />
            </div>
            <span
              className="text-[13px] font-black tabular-nums w-9 text-right shrink-0"
              style={{ color: card.status === "마감됐어요" ? "#94a3b8" : "#FF3355" }}
            >
              {card.progress}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── 메인 ─── */
export function Home() {
  const navigate = useNavigate();
  const { getRandomMessage, nickname, coachType, goals, setVerifyingGoalId } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>("joined");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [coachToast, setCoachToast] = useState<null | { emoji: string; text: string }>(null);
  const [goalIdx, setGoalIdx] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);

  // 3초 후 잔소리 토스트 표시
  useEffect(() => {
    const t = setTimeout(() => {
      setCoachToast(getRandomMessage());
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 오늘의 목표: 완료/건너뛰기 안 한 것만
  const todayGoals = goals.filter(g => !g.skippedToday);

  const cards = (() => {
    const base = viewMode === "joined"
      ? CHALLENGES.filter(c => JOINED_IDS.has(c.id))
      : CHALLENGES;
    return [...base].sort((a, b) => {
      const aScore = JOINED_IDS.has(a.id) ? 0 : (a.status.includes("마감") ? 2 : 1);
      const bScore = JOINED_IDS.has(b.id) ? 0 : (b.status.includes("마감") ? 2 : 1);
      return aScore - bScore;
    });
  })();

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#F5F6FA] relative">
      <style>{`
        @keyframes drop-in  { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes toast-in { from{opacity:0;transform:translateY(16px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);} }
      `}</style>

      {/* 잔소리 코치 토스트 */}
      {coachToast && (
        <div
          className="absolute top-4 left-4 right-4 z-40 bg-[#0F1117] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
          style={{ animation: "toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="shrink-0 w-10 h-10 overflow-hidden rounded-full bg-white/5">
            <CoachCharacter type={coachType} size={40} animated={false} />
          </div>
          <p className="flex-1 text-white text-[13px] font-semibold leading-snug">{coachToast.text}</p>
          <button
            onClick={() => setCoachToast(null)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 shrink-0 active:bg-white/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>
        </div>
      )}

      {/* ── 상단 헤더 ── */}
      <div
        className="shrink-0 bg-white px-5 pt-12 pb-4 relative z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          {/* 인사말 */}
          <div>
            <p className="text-slate-400 text-[12px] font-medium mb-0.5">안녕하세요</p>
            <h1 className="text-slate-900 font-black text-[22px] leading-tight tracking-tight">{nickname} 님</h1>
          </div>
          {/* 아이콘들 */}
          <div className="flex items-center gap-1.5 mt-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
              <Search className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => navigate("/ranking")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3355]" />
            </button>
          </div>
        </div>

        {/* 뷰 드롭다운 */}
        <div className="relative z-20" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl active:bg-slate-100 transition-colors"
          >
            <ChevronDown
              className="w-4 h-4 text-slate-500 transition-transform duration-200"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            <span className="text-slate-800 font-bold text-[14px]">{VIEW_LABELS[viewMode]}</span>
          </button>

          {/* 드롭다운 메뉴 */}
          {dropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              style={{ animation: "drop-in 0.18s ease both" }}
            >
              {/* 선택 헤더 */}
              <div className="px-4 py-2.5 border-b border-slate-50 flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-400">선택</span>
              </div>
              {(Object.keys(VIEW_LABELS) as ViewMode[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setViewMode(key); setDropdownOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-[14px] font-semibold transition-colors",
                    viewMode === key
                      ? "bg-[#FFF0F3] text-[#FF3355]"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {VIEW_LABELS[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 스크롤 카드 리스트 ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-2 space-y-2.5">
        {/* 이번 주 내 달성 요약 미니 바 */}
        <div
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease 100ms, transform 0.5s ease 100ms",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex gap-1.5 shrink-0">
            {["월","화","수","목","금","토","일"].map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-5 rounded-md"
                  style={{
                    height: 20,
                    background: i < 3 ? "#FF3355" : i === 3 ? "#FFD6DC" : "rgba(0,0,0,0.06)",
                    borderRadius: 4,
                  }}
                />
                <span className="text-[9px] text-slate-400 font-semibold">{d}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-slate-900">이번 주 3/7 완료</p>
            <p className="text-[11px] text-slate-400">오늘 포함 4일 남았어요</p>
          </div>
          <div className="shrink-0">
            <span className="text-[22px] font-black text-[#FF3355]">43%</span>
          </div>
        </div>
        {viewMode === "all" && (
          <div
            className="rounded-2xl overflow-hidden mb-1"
            style={{
              background: "linear-gradient(135deg, #FF3355, #cc0030)",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            <button
              onClick={() => navigate("/challenge")}
              className="w-full p-4 flex items-center justify-between active:opacity-80 transition-opacity"
            >
              <div>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-0.5">현재 진행 중</p>
                <p className="text-white font-black text-[18px]">6개 그룹</p>
                <p className="text-white/50 text-[12px] mt-0.5">136명 참여 · 69% 평균 달성</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[12px] font-black text-white bg-white/20 px-3 py-1.5 rounded-full">
                  전체 보기 →
                </span>
              </div>
            </button>
          </div>
        )}

        {cards.length === 0 && viewMode !== "all" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium text-sm">참여 중인 챌린지가 없어요</p>
            <button
              onClick={() => navigate("/challenge")}
              className="mt-4 px-5 py-2 bg-[#FF3355] text-white text-sm font-bold rounded-full"
            >
              챌린지 찾기
            </button>
          </div>
        ) : (
          cards.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              delay={i * 60}
              mounted={mounted}
              onClick={() => navigate(`/challenge/group/${card.id}`)}
            />
          ))
        )}
        <div className="h-1" />
      </div>

      {/* ── 하단 고정: 오늘의 목표 ── */}
      {todayGoals.length === 0 ? (
        <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-4 flex items-center justify-center gap-3" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
          <span className="text-xl">🎉</span>
          <p className="text-slate-600 font-semibold text-[14px]">오늘 목표 모두 완료!</p>
        </div>
      ) : null}
      {todayGoals.length > 0 && (() => {
        const safeIdx = goalIdx >= todayGoals.length ? 0 : goalIdx;
        const g = todayGoals[safeIdx];
        return (
          <div
            className="shrink-0 bg-white border-t border-slate-100 px-4 pt-3 pb-6"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.5s ease 300ms, transform 0.5s ease 300ms",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
            }}
          >
            {/* 한 줄: 레이블 + 스트릭 + 인덱스 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">오늘의 목표</span>
              <div
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: g.color }}
              >
                <span className="text-white text-[8px] font-black">{todayGoals.length}</span>
              </div>
              {g.streak > 0 && (
                <div className="flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded-full ml-0.5">
                  <Flame className="w-2.5 h-2.5 text-orange-500" />
                  <span className="text-orange-500 text-[10px] font-black">{g.streak}일 연속</span>
                </div>
              )}
              {/* 점 인디케이터 */}
              <div className="flex gap-1 ml-auto">
                {todayGoals.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGoalIdx(i)}
                    className="transition-all duration-300"
                    style={{
                      width: i === safeIdx ? 14 : 5,
                      height: 5,
                      borderRadius: 999,
                      background: i === safeIdx ? g.color : "#E2E8F0",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 본문: 제목 + 버튼 */}
            <div className="flex items-center gap-3">
              {/* 네비 + 제목 */}
              <button
                onClick={() => setGoalIdx(i => (i - 1 + todayGoals.length) % todayGoals.length)}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <h2
                className="flex-1 font-black text-[17px] text-slate-900 leading-tight truncate"
                key={g.id}
              >
                {g.title}
              </h2>
              <button
                onClick={() => setGoalIdx(i => (i + 1) % todayGoals.length)}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* 버튼들 */}
              <button
                onClick={() => { setVerifyingGoalId(g.id); navigate("/verify/camera"); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-[13px] active:scale-95 transition-transform shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${g.color}, ${g.color}CC)`,
                  boxShadow: `0 4px 14px -3px rgba(${g.colorRgb},0.45)`,
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                인증하기
              </button>
              <button
                onClick={() => setShowSnooze(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
                title="오늘 건너뛰기"
              >
                <span className="text-[14px]">😴</span>
              </button>
            </div>
          </div>
        );
      })()}

      {showSnooze && todayGoals.length > 0 && (
        <SnoozeModal
          goalId={todayGoals[goalIdx >= todayGoals.length ? 0 : goalIdx].id}
          onClose={() => setShowSnooze(false)}
          onSnooze={() => setShowSnooze(false)}
        />
      )}
    </div>
  );
}
