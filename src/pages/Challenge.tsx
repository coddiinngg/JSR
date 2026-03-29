import { Search, Users, ChevronDown,
         Activity, BookOpen, Apple, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";

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
  const { groups, joinGroup, leaveGroup } = useApp();
  const [activeCat, setActiveCat] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterMode, setFilterMode] = useState<"전체" | "참여중">("전체");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  const filtered = groups
    .filter((g) => filterMode === "전체" || g.joined)
    .filter((g) => activeCat === "전체" || g.category === activeCat)
    .filter((g) => !searchQuery || g.title.includes(searchQuery) || g.desc.includes(searchQuery))
    .sort((a, b) => Number(a.joined) - Number(b.joined));

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
              activeCat === cat
                ? "bg-[#FF3355] text-white shadow-[0_4px_12px_rgba(255,51,85,0.3)]"
                : "bg-slate-100 text-slate-500 active:bg-slate-200"
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
            style={{ background: "linear-gradient(115deg, #FF3355 0%, #C8002B 100%)", boxShadow: "0 6px 20px rgba(255,51,85,0.25)" }}
          >
            {/* 배경 글로우 */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
            <div className="relative">
              <p className="text-white/55 text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5">현재 진행 중</p>
              <p className="text-white text-[24px] font-black leading-tight tracking-tight">{groups.length}<span className="text-[15px] font-semibold text-white/70 ml-1">개 그룹</span></p>
            </div>
            <div className="relative flex items-center gap-4">
              <div className="text-center">
                <p className="text-white text-[20px] font-black leading-none tabular-nums">
                  {groups.reduce((s, g) => s + g.members, 0)}
                </p>
                <p className="text-white/50 text-[10px] mt-0.5 font-medium">참여자</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="text-center">
                <p className="text-white text-[20px] font-black leading-none tabular-nums">
                  {Math.round(groups.reduce((s, g) => s + g.rate, 0) / groups.length)}%
                </p>
                <p className="text-white/50 text-[10px] mt-0.5 font-medium">평균 달성</p>
              </div>
            </div>
          </div>
        </div>

        {/* 전체 그룹 리스트 */}
        <div className="px-4 pt-3 pb-6 space-y-2.5">
          {filtered.map(({ id, title, desc, members, rate, status, category, joined: isJoined }, i) => {
            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden active:scale-[0.99] transition-all duration-150 cursor-pointer"
                style={{ ...slide(i * 55 + 200), boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
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
                      isJoined ? leaveGroup(id) : joinGroup(id);
                    }}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-[0.98]",
                      isJoined
                        ? "bg-slate-100 text-slate-400"
                        : "text-white"
                    )}
                    style={!isJoined ? { background: "linear-gradient(115deg,#FF5C7A,#FF3355)", boxShadow: "0 6px 16px -4px rgba(255,51,85,0.45)" } : undefined}
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
