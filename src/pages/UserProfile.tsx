import React, { useState, useEffect } from "react";
import { ChevronLeft, Flame, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// 모든 유저 (seed → 이름)
const USER_NAMES: Record<string, string> = {
  Felix: "김지수", Aneka: "박민혁", Jude: "이성민", Dawn: "최다은",
  Luna: "유나연", Alex: "서준혁", Mina: "강민지", Bear: "강태양",
  Lily: "오지현", Leo: "강민준", Mia: "오서연", Zoe: "유하늘",
  Tom: "임태현", Evan: "박준서", Ava: "한소희", Dan: "이준혁",
  Owen: "정우성", Finn: "송민재", Sue: "이수진", Hugh: "조현우",
  Sera: "박서은", Eva: "윤서아", Ray: "김태양", Hazel: "이하은",
  Jake: "박준수", Ruby: "최유리", Rio: "남재원", Sage: "윤아영",
  Max: "이동혁", Cleo: "한유진",
};

// 그룹 정보 (id → title + 이미지)
const GROUPS_INFO: { id: string; title: string; img: string }[] = [
  { id: "1", title: "매일 5,000보 걷기",  img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&fit=crop&q=80" },
  { id: "2", title: "러닝 크루",       img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&fit=crop&q=80" },
  { id: "3", title: "일일 독서 클럽",  img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&fit=crop&q=80" },
  { id: "4", title: "필사 챌린지",     img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&fit=crop&q=80" },
  { id: "5", title: "포즈 챌린지",     img: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&fit=crop&q=80" },
  { id: "6", title: "장소 탐험대",     img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&fit=crop&q=80" },
];

// 시드별 참여 그룹 매핑
const SEED_GROUPS: Record<string, string[]> = {
  Felix: ["1"],         Aneka: ["1"],         Jude: ["1"],
  Dawn: ["1"],          Luna: ["1"],          Alex: ["1"],
  Mina: ["1"],          Bear: ["1"],          Lily: ["1"],
  Leo: ["2"],           Mia: ["2"],           Zoe: ["2"],
  Tom: ["2"],           Evan: ["2"],
  Ava: ["3"],           Dan: ["3"],           Owen: ["3"],
  Finn: ["4"],          Sue: ["4"],           Hugh: ["4"],  Sera: ["4"],
  Eva: ["5"],           Ray: ["5"],           Hazel: ["5"], Jake: ["5"], Ruby: ["5"],
  Rio: ["6"],           Sage: ["6"],          Max: ["6"],   Cleo: ["6"],
};

// 시드별 스탯
const SEED_STATS: Record<string, { streak: number; rate: number; rank: number }> = {
  Felix: { streak: 24, rate: 98, rank: 1 }, Aneka: { streak: 18, rate: 92, rank: 2 },
  Jude:  { streak: 15, rate: 87, rank: 3 }, Dawn:  { streak: 6,  rate: 68, rank: 5 },
  Luna:  { streak: 5,  rate: 60, rank: 6 }, Alex:  { streak: 3,  rate: 48, rank: 7 },
  Mina:  { streak: 2,  rate: 35, rank: 8 }, Bear:  { streak: 1,  rate: 25, rank: 9 },
  Lily:  { streak: 0,  rate: 18, rank: 10 },
  Leo:   { streak: 30, rate: 95, rank: 1 }, Mia:   { streak: 22, rate: 90, rank: 2 },
  Zoe:   { streak: 19, rate: 85, rank: 3 }, Tom:   { streak: 14, rate: 78, rank: 4 },
  Evan:  { streak: 0,  rate: 18, rank: 5 },
  Ava:   { streak: 8,  rate: 100, rank: 1 }, Dan:  { streak: 6,  rate: 87, rank: 2 },
  Owen:  { streak: 0,  rate: 12, rank: 4 },
  Finn:  { streak: 18, rate: 95, rank: 1 }, Sue:  { streak: 12, rate: 87, rank: 2 },
  Hugh:  { streak: 7,  rate: 70, rank: 3 }, Sera: { streak: 2,  rate: 40, rank: 4 },
  Eva:   { streak: 28, rate: 97, rank: 1 }, Ray:  { streak: 21, rate: 91, rank: 2 },
  Hazel: { streak: 17, rate: 85, rank: 3 }, Jake: { streak: 9,  rate: 72, rank: 4 },
  Ruby:  { streak: 4,  rate: 50, rank: 5 },
};

function rateColor(r: number) {
  if (r >= 90) return "#22c55e";
  if (r >= 70) return "#f59e0b";
  return "#94a3b8";
}

export function UserProfile() {
  const { seed = "" } = useParams<{ seed: string }>();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const name = USER_NAMES[seed] ?? seed;
  const stats = SEED_STATS[seed];
  const groupIds = SEED_GROUPS[seed] ?? [];
  // 최근 3개 챌린지
  const challenges = groupIds
    .map(id => GROUPS_INFO.find(g => g.id === id))
    .filter(Boolean)
    .slice(0, 3) as { id: string; title: string; img: string }[];

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-[#FAFAFA]">
      {/* 뒤로 가기 — 스크롤과 무관하게 항상 상단에 고정 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <div className="flex-1 overflow-y-auto">

        {/* 헤더 */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #FF3355 0%, #CC0030 55%, #A00025 100%)",
            paddingTop: 16,
            paddingBottom: 28,
          }}
        >
          <div className="relative z-10 flex flex-col items-center pt-6 px-5">
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.85)",
                transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                alt={name}
                className="w-20 h-20 rounded-full bg-white/30"
                style={{ outline: "3px solid rgba(255,255,255,0.6)", outlineOffset: 2 }}
                referrerPolicy="no-referrer"
              />
            </div>
            <h2
              className="text-[20px] font-black text-white mt-3"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(8px)",
                transition: "all 0.4s 0.15s ease",
              }}
            >
              {name}
            </h2>

            {/* 스탯 배지 */}
            {stats && (
              <div
                className="flex gap-3 mt-4"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(8px)",
                  transition: "all 0.4s 0.25s ease",
                }}
              >
                <div className="flex flex-col items-center bg-white/20 border border-white/25 rounded-2xl px-4 py-2.5 min-w-[72px]">
                  <span className="text-[20px] font-black text-white leading-none">{stats.streak}
                    <span className="text-[11px] font-semibold text-white/60 ml-0.5">일</span>
                  </span>
                  <span className="text-[10px] text-white/50 mt-1">연속</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 border border-white/25 rounded-2xl px-4 py-2.5 min-w-[72px]">
                  <span className="text-[20px] font-black leading-none" style={{ color: rateColor(stats.rate) }}>{stats.rate}
                    <span className="text-[11px] font-semibold text-white/60 ml-0.5">%</span>
                  </span>
                  <span className="text-[10px] text-white/50 mt-1">달성률</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 border border-white/25 rounded-2xl px-4 py-2.5 min-w-[72px]">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span className="text-[20px] font-black text-white leading-none">{stats.rank}
                      <span className="text-[11px] font-semibold text-white/60 ml-0.5">위</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 mt-1">순위</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-5">
          {/* 참여 챌린지 */}
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-3">참여 중인 챌린지</p>

          {challenges.length === 0 ? (
            <div className="rounded-2xl bg-white border border-black/[0.04] p-8 flex flex-col items-center">
              <span className="text-3xl mb-2">🏅</span>
              <p className="text-[13px] text-slate-400">참여 챌린지 정보가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((g, i) => (
                <div
                  key={g.id}
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(14px)",
                    transition: `all 0.4s ${0.3 + i * 0.08}s cubic-bezier(0.4,0,0.2,1)`,
                  }}
                  onClick={() => navigate(`/challenge/group/${g.id}`)}
                >
                  <div className="relative h-[110px] w-full">
                    <img
                      src={g.img}
                      alt={g.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* 그라디언트 오버레이 */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 100%)" }}
                    />
                    <div className="absolute inset-0 flex items-center px-4">
                      <div>
                        <p className="text-white font-black text-[16px] leading-tight">{g.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Flame className="w-3 h-3 text-orange-400 fill-orange-300" />
                          <span className="text-white/70 text-[11px] font-semibold">참여 중</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
