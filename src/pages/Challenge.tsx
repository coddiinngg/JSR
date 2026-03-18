import { Search, Users, Flame, Plus, ArrowUpRight, Minus, ChevronRight,
         Activity, BookOpen, Apple, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const myGroups = [
  { id: "1", title: "새벽 미라클 모닝", members: 12, rate: 82, streak: 5, status: "진행중",  category: "생활" },
  { id: "3", title: "주 1권 독서",       members: 8,  rate: 48, streak: 2, status: "마감임박", category: "학습" },
];

const allGroups = [
  { id: "1", title: "새벽 미라클 모닝", desc: "매일 새벽 5시 30분, 함께 일어나요", members: 12, rate: 82, status: "진행중",  category: "생활", joined: true  },
  { id: "2", title: "매일 1만보 걷기",   desc: "하루 만 보를 함께 걸어요",         members: 45, rate: 65, status: "인기",    category: "운동", joined: false },
  { id: "3", title: "주 1권 독서",       desc: "매주 한 권씩 읽고 생각을 나눠요",  members: 8,  rate: 48, status: "마감임박", category: "학습", joined: true  },
  { id: "4", title: "저탄고지 식단",     desc: "건강한 식습관을 함께 만들어요",    members: 23, rate: 71, status: "진행중",  category: "식단", joined: false },
  { id: "5", title: "매일 명상 10분",    desc: "하루 10분, 마음의 여유를 찾아요",  members: 31, rate: 88, status: "인기",    category: "생활", joined: false },
  { id: "6", title: "영어 단어 30개",    desc: "매일 꾸준히 어휘를 늘려요",        members: 17, rate: 60, status: "진행중",  category: "학습", joined: false },
];

const topRankers = [
  { rank: 1, name: "김지수", streak: 24, rate: 98, seed: "Felix", up: true  },
  { rank: 2, name: "박민혁", streak: 18, rate: 92, seed: "Aneka", up: true  },
  { rank: 3, name: "이성민", streak: 15, rate: 87, seed: "Jude",  up: false },
];

// 추천 그룹 (내 관심사 기반)
const recommended = [
  { id: "5", title: "매일 명상 10분",  desc: "하루 10분, 마음의 여유를 찾아요", members: 31, rate: 88, category: "생활", reason: "인기 급상승 🔥" },
  { id: "6", title: "영어 단어 30개",  desc: "매일 꾸준히 어휘를 늘려요",       members: 17, rate: 60, category: "학습", reason: "학습 목표 유사" },
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
  const [activeTab, setActiveTab] = useState<"group" | "all">("group");
  const [activeCat, setActiveCat] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
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
    .filter((g) => activeCat === "전체" || g.category === activeCat)
    .filter((g) => !searchQuery || g.title.includes(searchQuery) || g.desc.includes(searchQuery));

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#F8F8FA]">
      <style>{`
        @keyframes ch-down  { from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes ch-scale { from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);} }
      `}</style>

      {/* 헤더 */}
      <div
        className="shrink-0 bg-white border-b border-black/[0.05]"
        style={{ animation: "ch-down 0.4s ease both" }}
      >
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight">챌린지</h1>
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
            <button
              onClick={() => navigate("/challenge/create")}
              className="h-9 px-3.5 flex items-center gap-1.5 bg-[#FF3355] rounded-full text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(255,51,85,0.35)] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              만들기
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

      {/* 탭 */}
      <div
        className="shrink-0 flex gap-2 px-5 pt-3 pb-3 bg-white"
        style={{ animation: "ch-down 0.4s ease 60ms both" }}
      >
        {(["group", "all"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 py-2 rounded-full text-[13px] font-bold transition-all duration-200",
              activeTab === key
                ? "bg-[#FF3355] text-white shadow-[0_4px_12px_rgba(255,51,85,0.3)]"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {key === "group" ? "내 그룹" : "전체"}
          </button>
        ))}
      </div>

      {/* ─── 내 그룹 탭 ─── */}
      {activeTab === "group" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {/* 참여 중인 그룹 2열 카드 */}
          <section>
            <div className="flex items-center justify-between mb-3" style={slide(0)}>
              <h2 className="text-[14px] font-bold text-slate-900">참여 중인 그룹</h2>
              <span className="text-[12px] text-slate-400 font-semibold">{myGroups.length}개</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {myGroups.map(({ id, title, members, rate, category }, i) => {
                const meta = CAT_META[category] ?? CAT_META["생활"];
                const Icon = meta.icon;
                return (
                  <Link
                    key={id}
                    to={`/challenge/group/${id}`}
                    className="relative flex flex-col rounded-3xl p-4 active:scale-[0.96] transition-all duration-200 overflow-hidden"
                    style={{ ...slide(i * 70 + 60), background: meta.cardGrad, minHeight: 196 }}
                  >
                    {/* 장식 원 */}
                    <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.12]" />
                    <div className="pointer-events-none absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-black/[0.12]" />

                    {/* 카테고리 아이콘 */}
                    <div className="relative z-10 w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-auto">
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.2} />
                    </div>

                    {/* 그룹 이름 */}
                    <h3 className="relative z-10 font-black text-[15px] text-white leading-snug mt-3 mb-3">
                      {title}
                    </h3>

                    {/* 달성률 */}
                    <div className="relative z-10">
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-[10px] text-white/50 font-semibold">달성률</span>
                        <span className="text-[36px] font-black text-white leading-none tabular-nums drop-shadow-sm">
                          {rate}<span className="text-[18px]">%</span>
                        </span>
                      </div>
                      {/* 진행바 */}
                      <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white/80"
                          style={{
                            width: mounted ? `${rate}%` : "0%",
                            transition: `width 1.1s cubic-bezier(0.4,0,0.2,1) ${i * 120 + 200}ms`,
                          }}
                        />
                      </div>
                      {/* 멤버 */}
                      <div className="flex items-center gap-1 mt-2.5">
                        <Users className="w-3 h-3 text-white/40" />
                        <span className="text-[11px] text-white/40">{members}명 참여 중</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 실시간 랭킹 */}
          <section style={slide(320)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-slate-900">실시간 랭킹</h2>
              <Link to="/ranking" className="flex items-center gap-0.5 text-[12px] text-[#FF3355] font-bold">
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              {topRankers.map(({ rank, name, streak, rate, seed, up }, i) => (
                <div key={rank}>
                  {i > 0 && <div className="h-px bg-slate-50 mx-4" />}
                  <div className="flex items-center px-4 py-3.5 gap-3">
                    <span className={cn("w-5 text-center text-[13px] font-black tabular-nums shrink-0",
                      rank === 1 ? "text-[#FF3355]" : "text-slate-300")}>
                      {rank}
                    </span>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={name}
                      className="w-9 h-9 rounded-full bg-slate-100 border border-slate-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-slate-900">{name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                        <span className="text-[11px] text-slate-400">{streak}일 연속</span>
                      </div>
                    </div>
                    <span className="text-[14px] font-black text-[#FF3355] shrink-0">{rate}%</span>
                    {up ? <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        : <Minus className="w-4 h-4 text-slate-200 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 추천 그룹 */}
          <section style={slide(480)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-slate-900">추천 그룹</h2>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">관심사 기반</span>
            </div>
            <div className="space-y-2.5">
              {recommended.map(({ id, title, desc, members, rate, category, reason }, i) => {
                const meta = CAT_META[category] ?? CAT_META["생활"];
                const Icon = meta.icon;
                return (
                  <Link
                    key={id}
                    to={`/challenge/group/${id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-black/[0.05] active:scale-[0.98] transition-all duration-150"
                    style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: meta.grad }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-[14px] font-black text-slate-900 truncate">{title}</p>
                      </div>
                      <p className="text-[12px] text-slate-400 truncate">{desc}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-[#FF3355] bg-[#FFF0F3] px-1.5 py-0.5 rounded-full">{reason}</span>
                        <span className="text-[11px] text-slate-400">{members}명 · {rate}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="h-4" />
        </div>
      )}

      {/* ─── 전체 탭 ─── */}
      {activeTab === "all" && (
        <div className="flex-1 overflow-y-auto">

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

          {/* 통계 배너 */}
          <div className="px-4 pt-4 pb-1" style={slide(60)}>
            <div
              className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(110deg, #FF3355 0%, #CC0030 100%)" }}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.07] blur-xl" />
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
                  className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden"
                  style={slide(i * 55 + 120)}
                >
                  <Link to={`/challenge/group/${id}`} className="block p-4 pb-3 active:bg-slate-50 transition-colors">
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
                  </Link>

                  {/* 참여 버튼 */}
                  <div className="px-4 pb-4 pt-2">
                    <button
                      onClick={() => {
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
      )}
    </div>
  );
}
