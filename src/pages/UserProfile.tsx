import React, { useState, useEffect } from "react";
import { ChevronLeft, Flame, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database";

interface UserStats {
  streak: number;
  rate: number;
}

interface UserGroup {
  id: string;
  title: string;
}

function rateColor(r: number) {
  if (r >= 90) return "#22c55e";
  if (r >= 70) return "#f59e0b";
  return "#94a3b8";
}

function computeStreak(verifications: { verified_at: string; status: string }[]) {
  const completedDays = new Set(
    verifications
      .filter(v => v.status === "completed")
      .map(v => v.verified_at.slice(0, 10))
  );
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!completedDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (completedDays.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function UserProfile() {
  const { seed: userId = "" } = useParams<{ seed: string }>();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!userId) return;
    void loadUserData(userId);
  }, [userId]);

  async function loadUserData(id: string) {
    setLoading(true);
    try {
      const [{ data: profileData }, { data: verifications }, { data: memberships }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("verifications").select("verified_at, status").eq("user_id", id),
        supabase.from("group_members").select("group_id, groups(id, name)").eq("user_id", id).limit(3),
      ]);

      if (profileData) setProfile(profileData);

      if (verifications) {
        const completed = verifications.filter(v => v.status === "completed");
        const total = verifications.length;
        setStats({
          streak: computeStreak(verifications),
          rate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
        });
      }

      if (memberships) {
        const userGroups: UserGroup[] = memberships
          .map((m: any) => m.groups)
          .filter(Boolean)
          .map((g: any) => ({ id: g.id, title: g.name }));
        setGroups(userGroups);
      }
    } finally {
      setLoading(false);
    }
  }

  const displayName = profile?.username ?? "알 수 없는 사용자";
  const avatarUrl = profile?.avatar_url ?? null;
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-[#FAFAFA]">
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
              <div
                className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center overflow-hidden"
                style={{
                  outline: "3px solid rgba(255,255,255,0.6)",
                  outlineOffset: 2,
                  ...(avatarUrl ? { backgroundImage: `url("${avatarUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
                }}
              >
                {!avatarUrl && !loading && (
                  <span className="text-[28px] font-black text-white">{avatarInitial}</span>
                )}
              </div>
            </div>

            <h2
              className="text-[20px] font-black text-white mt-3"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(8px)",
                transition: "all 0.4s 0.15s ease",
              }}
            >
              {loading ? "..." : displayName}
            </h2>

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
                  <span className="text-[20px] font-black text-white leading-none">
                    {stats.streak}
                    <span className="text-[11px] font-semibold text-white/60 ml-0.5">일</span>
                  </span>
                  <span className="text-[10px] text-white/50 mt-1">연속</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 border border-white/25 rounded-2xl px-4 py-2.5 min-w-[72px]">
                  <span className="text-[20px] font-black leading-none" style={{ color: rateColor(stats.rate) }}>
                    {stats.rate}
                    <span className="text-[11px] font-semibold text-white/60 ml-0.5">%</span>
                  </span>
                  <span className="text-[10px] text-white/50 mt-1">달성률</span>
                </div>
                <div className="flex flex-col items-center bg-white/20 border border-white/25 rounded-2xl px-4 py-2.5 min-w-[72px]">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span className="text-[20px] font-black text-white leading-none">
                      {profile?.xp_total ?? 0}
                      <span className="text-[11px] font-semibold text-white/60 ml-0.5">xp</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 mt-1">경험치</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-3">참여 중인 챌린지</p>

          {loading ? (
            <div className="rounded-2xl bg-white border border-black/[0.04] p-8 flex flex-col items-center">
              <p className="text-[13px] text-slate-400">불러오는 중...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl bg-white border border-black/[0.04] p-8 flex flex-col items-center">
              <span className="text-3xl mb-2">🏅</span>
              <p className="text-[13px] text-slate-400">참여 챌린지 정보가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((g, i) => (
                <div
                  key={g.id}
                  className="rounded-2xl bg-white border border-black/[0.04] px-4 py-4 flex items-center gap-3"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(14px)",
                    transition: `all 0.4s ${0.3 + i * 0.08}s cubic-bezier(0.4,0,0.2,1)`,
                  }}
                  onClick={() => navigate(`/challenge/group/${g.id}`)}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFE8EC] flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-[#FF3355]" />
                  </div>
                  <p className="flex-1 font-bold text-[14px] text-slate-800">{g.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
