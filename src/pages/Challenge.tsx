import { Search, Users, ChevronDown,
         Activity, BookOpen, Apple, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";

// 카테고리 아이콘 + 배경
const CAT_META: Record<string, { icon: React.ElementType; bg: string; color: string; glow: string; grad: string; cardGrad: string }> = {
  "운동": { icon: Activity,  bg: "bg-orange-50",  color: "text-orange-400", glow: "rgba(255,51,85,0.15)",  grad: "linear-gradient(135deg,#FB923C,#F59E0B)", cardGrad: "linear-gradient(140deg,#FF3355 0%,#CC0030 60%,#8B001F 100%)" },
  "식단": { icon: Apple,     bg: "bg-green-50",   color: "text-green-500",  glow: "rgba(255,51,85,0.15)",  grad: "linear-gradient(135deg,#22C55E,#16A34A)", cardGrad: "linear-gradient(140deg,#FF3355 0%,#CC0030 60%,#8B001F 100%)" },
  "학습": { icon: BookOpen,  bg: "bg-blue-50",    color: "text-blue-400",   glow: "rgba(255,51,85,0.15)",  grad: "linear-gradient(135deg,#38BDF8,#0EA5E9)", cardGrad: "linear-gradient(140deg,#FF3355 0%,#CC0030 60%,#8B001F 100%)" },
  "생활": { icon: Sparkles,  bg: "bg-purple-50",  color: "text-purple-400", glow: "rgba(255,51,85,0.15)",  grad: "linear-gradient(135deg,#A855F7,#7C3AED)", cardGrad: "linear-gradient(140deg,#FF3355 0%,#CC0030 60%,#8B001F 100%)" },
};

const STATUS_STYLE: Record<string, string> = {
  "진행중":  "text-emerald-600 bg-emerald-50",
  "인기":    "text-[#FF3355] bg-[#FFE8EC]",
  "마감임박": "text-amber-600 bg-amber-50",
};

const allGroups = [
  { id: "1", title: "새벽 미라클 모닝", desc: "매일 새벽 5시 30분, 함께 일어나요", members: 12, rate: 82, status: "진행중",  category: "생활", joined: true  },
  { id: "2", title: "매일 1만보 걷기",   desc: "하루 만 보를 함께 걸어요",         members: 45, rate: 65, status: "인기",    category: "운동", joined: false },
  { id: "3", title: "주 1권 독서",       desc: "매주 한 권씩 읽고 생각을 나눠요",  members: 8,  rate: 48, status: "마감임박", category: "학습", joined: true  },
  { id: "4", title: "저탄고지 식단",     desc: "건강한 식습관을 함께 만들어요",    members: 23, rate: 71, status: "진행중",  category: "식단", joined: false },
  { id: "5", title: "매일 명상 10분",    desc: "하루 10분, 마음의 여유를 찾아요",  members: 31, rate: 88, status: "인기",    category: "생활", joined: false },
  { id: "6", title: "영어 단어 30개",    desc: "매일 꾸준히 어휘를 늘려요",        members: 17, rate: 60, status: "진행중",  category: "학습", joined: false },
];

const CATS = ["전체", "운동", "식단", "학습", "생활"];

// 카테고리 태그 (카드 상단)
function CatTag({ category }: { category: string }) {
  const meta = CAT_META[category] ?? { icon: Sparkles, bg: "bg-slate-100", color: "text-slate-400" };
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold", meta.bg, meta.color)}>
      <Icon className="w-3 h-3" strokeWidth={2} />
      {category}
    </span>
  );
}

export function Challenge() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterMode, setFilterMode] = useState<"전체" | "참여중">("전체");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(
    new Set(allGroups.filter((g) => g.joined).map((g) => g.id))
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const filtered = allGroups
    .filter((g) => filterMode === "전체" || joinedIds.has(g.id))
    .filter((g) => activeCat === "전체" || g.category === activeCat)
    .filter((g) => !searchQuery || g.title.includes(searchQuery) || g.desc.includes(searchQuery));

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#F8F8FA]" onClick={() => setShowDropdown(false)}>
      <style>{`
        @keyframes ch-down  { from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes ch-scale { from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 bg-white border-b border-black/[0.05] relative z-50"
        style={{ animation: "ch-down 0.4s ease both" }}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          {/* 드롭다운 */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
            >
              <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
                {filterMode === "전체" ? "전체 챌린지" : "참여중인 챌린지"}
              </h1>
              <ChevronDown
                className="w-5 h-5 text-slate-400 mt-0.5 transition-transform duration-200"
                style={{ transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {showDropdown && (
              <div
                className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-white overflow-hidden z-50"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "ch-down 0.18s ease both" }}
              >
                {(["전체", "참여중"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setFilterMode(mode); setShowDropdown(false); }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-[14px] font-bold transition-colors",
                      filterMode === mode ? "text-[#FF3355] bg-[#FFF0F3]" : "text-slate-700 active:bg-slate-50"
                    )}
                  >
                    {mode === "전체" ? "전체 챌린지" : "참여중인 챌린지"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(v => !v)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                showSearch ? "bg-[#FF3355] text-white" : "bg-slate-100 text-slate-500 active:bg-slate-200"
              )}
            >
              <Search style={{ width: 17, height: 17 }} />
            </button>
          </div>
        </div>
        {/* 검색 입력창 */}
        {showSearch && (
          <div className="px-4 pb-3" style={{ animation: "ch-down 0.2s ease both" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="챌린지 검색..."
              autoFocus
              className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[14px] focus:outline-none focus:border-[#FF3355] transition-colors"
            />
          </div>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-black/[0.04] overflow-x-auto no-scrollbar"
        style={slide(0)}>
        {CATS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-200 shrink-0",
              activeCat === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
            )}
          >
            {cat !== "전체" && (() => {
              const meta = CAT_META[cat];
              const Icon = meta.icon;
              return <Icon className="w-3 h-3" />;
            })()}
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 통계 배너 */}
        <div className="px-4 pt-4 pb-1" style={slide(60)}>
          <div
            className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{ background: "linear-gradient(110deg, #FF3355 0%, #CC0030 100%)" }}
          >
            <div>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.15em]">현재 진행 중</p>
              <p className="text-white text-[22px] font-black leading-tight">{allGroups.length}개 그룹</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-white text-[18px] font-black leading-none">
                  {allGroups.reduce((s, g) => s + g.members, 0)}
                </p>
                <p className="text-white/50 text-[10px] mt-0.5">총 참여자</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-white text-[18px] font-black leading-none">
                  {Math.round(allGroups.reduce((s, g) => s + g.rate, 0) / allGroups.length)}%
                </p>
                <p className="text-white/50 text-[10px] mt-0.5">평균 달성</p>
              </div>
            </div>
          </div>
        </div>

        {/* 전체 그룹 리스트 */}
        <div className="px-4 pt-3 pb-6 space-y-2.5">
          {filtered.map(({ id, title, desc, members, rate, status, category }, i) => {
            const isJoined = joinedIds.has(id);
            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
                style={slide(i * 55 + 200)}
                onClick={() => navigate(`/challenge/group/${id}`)}
              >
                <div className="block p-4 pb-3">
                  {/* 상단: 카테고리 + 상태 + 참여중 */}
                  <div className="flex items-center justify-between mb-2.5">
                    <CatTag category={category} />
                    <div className="flex items-center gap-1.5">
                      {isJoined && (
                        <span className="text-[11px] font-black text-[#FF3355] bg-[#FFE8EC] px-2 py-0.5 rounded-full">참여중</span>
                      )}
                      <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", STATUS_STYLE[status])}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* 제목 + 설명 */}
                  <h3 className="font-black text-[16px] text-slate-900 leading-snug mb-0.5">{title}</h3>
                  <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">{desc}</p>

                  {/* 진행바 */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF3355] to-[#FF6680]"
                        style={{
                          width: mounted ? `${rate}%` : "0%",
                          transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 70 + 300}ms`,
                          boxShadow: "0 0 8px rgba(255,51,85,0.3)",
                        }}
                      />
                    </div>
                    <span className="text-[14px] font-black text-[#FF3355] shrink-0 tabular-nums w-10 text-right">{rate}%</span>
                  </div>

                  {/* 멤버 수 */}
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[12px]">{members}명 참여 중</span>
                  </div>
                </div>

                {/* 참여 버튼 */}
                <div className="px-4 pb-4 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = new Set(joinedIds);
                      isJoined ? next.delete(id) : next.add(id);
                      setJoinedIds(next);
                    }}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.98]",
                      isJoined ? "bg-slate-100 text-slate-400" : "bg-[#FF3355] text-white shadow-[0_6px_16px_-4px_rgba(255,51,85,0.4)]"
                    )}
                  >
                    {isJoined ? "참여 중 · 탈퇴" : "참여하기"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
