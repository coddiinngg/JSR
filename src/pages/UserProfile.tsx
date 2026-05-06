import React, { useState, useEffect } from "react";
import { ChevronLeft, Flame, Trophy, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getGrade, getNextGrade } from "../lib/grades";
import type { PublicProfileRecord } from "../types/database";

interface UserStats {
  streak: number;
  rate: number;
  total: number;
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
  const [profile, setProfile] = useState<PublicProfileRecord | null>(null);
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
        supabase.rpc("get_public_profile", { p_user_id: id }),
        supabase.from("verifications").select("verified_at, status").eq("user_id", id),
        supabase.from("group_members").select("group_id, groups(id, name)").eq("user_id", id).limit(3),
      ]);

      setProfile(profileData?.[0] ?? null);

      if (verifications) {
        const completed = verifications.filter(v => v.status === "completed");
        const total = verifications.length;
        setStats({
          streak: computeStreak(verifications),
          rate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
          total: completed.length,
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
  const xpTotal = profile?.xp_total ?? 0;
  const grade = getGrade(xpTotal);
  const nextGrade = getNextGrade(grade.level);

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden bg-[#FAFAFA] dark:bg-[#090B10]">
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
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

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
                  boxShadow: "0 0 0 3px rgba(255,255,255,0.7), 0 0 0 5px rgba(255,51,85,0.4)",
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

            {/* 등급 뱃지 */}
            {!loading && (
              <div
                className="flex items-center gap-1.5 mt-1.5"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(6px)",
                  transition: "all 0.4s 0.2s ease",
                }}
              >
                <span
                  className="rounded-lg px-2 py-0.5 text-[10px] font-black tracking-widest uppercase"
                  style={{ background: `${grade.color}30`, border: `1px solid ${grade.color}60`, color: "white" }}
                >
                  {grade.code}
                </span>
                <span className="text-white font-bold text-[13px]">{grade.name}</span>
                <span className="text-white/40 text-[11px]">Lv.{grade.level}</span>
              </div>
            )}

            {/* XP 진행바 */}
            {!loading && nextGrade && (
              <div className="w-full mt-3 px-4"
                style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s 0.25s ease" }}
              >
                <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(((xpTotal - grade.minXp) / (nextGrade.minXp - grade.minXp)) * 100, 100)}%`,
                      background: "rgba(255,255,255,0.8)",
                      transition: "width 1s cubic-bezier(0.4,0,0.2,1) 0.4s",
                    }}
                  />
                </div>
                <p className="text-white/35 text-[9px] text-center mt-0.5">
                  {xpTotal.toLocaleString()} / {nextGrade.minXp.toLocaleString()} XP
                </p>
              </div>
            )}

            {stats && (
              <div
                className="flex gap-2 mt-4 w-full"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(8px)",
                  transition: "all 0.4s 0.3s ease",
                }}
              >
                {[
                  { label: "달성", val: stats.total, suffix: "회" },
                  { label: "연속", val: stats.streak, suffix: "일" },
                  { label: "달성률", val: stats.rate, suffix: "%" },
                  { label: "경험치", val: xpTotal, suffix: "xp" },
                ].map(({ label, val, suffix }) => (
                  <div key={label} className="flex-1 flex flex-col items-center bg-white/20 border border-white/20 rounded-2xl py-2.5">
                    <span className="text-[17px] font-black text-white leading-none tabular-nums">
                      {val}<span className="text-[10px] font-semibold text-white/55 ml-0.5">{suffix}</span>
                    </span>
                    <span className="text-[10px] text-white/50 mt-1">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-3">참여 중인 챌린지</p>

          {loading ? (
            <div className="rounded-2xl bg-white dark:bg-[#12161E] border border-black/[0.04] dark:border-white/[0.07] p-8 flex flex-col items-center">
              <p className="text-[13px] text-slate-400">불러오는 중...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#12161E] border border-black/[0.04] dark:border-white/[0.07] p-8 flex flex-col items-center">
              <span className="text-3xl mb-2">🏅</span>
              <p className="text-[13px] text-slate-400">참여 챌린지 정보가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((g, i) => (
                <div
                  key={g.id}
                  className="rounded-2xl bg-white dark:bg-[#12161E] border border-black/[0.04] dark:border-white/[0.07] px-4 py-4 flex items-center gap-3 active:bg-slate-50 dark:active:bg-white/[0.04] transition-colors cursor-pointer"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(14px)",
                    transition: `all 0.4s ${0.3 + i * 0.08}s cubic-bezier(0.4,0,0.2,1)`,
                  }}
                  onClick={() => navigate(`/challenge/group/${g.id}`)}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFE8EC] dark:bg-[#3A1620] flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-[#FF3355]" />
                  </div>
                  <p className="flex-1 font-bold text-[14px] text-slate-800 dark:text-slate-100">{g.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
