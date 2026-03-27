import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2, Trophy, Users, Star, Flame, Bell, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

type NotifType = "goal" | "badge" | "group" | "rank" | "streak";

interface Notif {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  emoji?: string;
  actionable?: boolean;    // 수락/거절 버튼 표시 여부
  actionDone?: boolean;    // 이미 처리된 경우
}

const INITIAL: Notif[] = [
  { id: 1,  type: "goal",   title: "목표 달성 성공!",   body: "오늘 '30분 유산소' 를 완료했어요. 대단해요! 🎉", time: "1시간 전",    read: false },
  { id: 2,  type: "streak", title: "8일 연속 달성!",    body: "연속 8일 목표를 달성했어요. 이 페이스 유지해요!", time: "2시간 전",    read: false, emoji: "🔥" },
  { id: 3,  type: "group",  title: "그룹 활동",          body: "김지수님이 '새벽 미라클 모닝' 그룹에서 1위를 달성했어요.", time: "3시간 전", read: true },
  { id: 4,  type: "badge",  title: "새 배지 획득!",     body: "'7일 연속' 배지를 획득했어요. 리워드에서 확인해보세요.", time: "오늘",      read: true, emoji: "🏅" },
  { id: 5,  type: "rank",   title: "랭킹 변동",          body: "주간 랭킹이 12위에서 9위로 올랐어요! 🚀",         time: "어제",       read: true },
  { id: 6,  type: "goal",   title: "목표 알림",          body: "'독서 30페이지' 목표 시간이 다가오고 있어요",      time: "어제",       read: true },
  { id: 7,  type: "group",  title: "그룹 초대",          body: "박민혁님이 '매일 5,000보 걷기' 그룹에 초대했어요.",  time: "2일 전",     read: false, emoji: "👥", actionable: true },
  { id: 8,  type: "badge",  title: "새 배지 획득!",     body: "'첫 인증' 배지를 획득했어요!",                    time: "3일 전",     read: true, emoji: "⚡" },
];

const TYPE_ICON: Record<NotifType, React.ElementType> = {
  goal:   CheckCircle2,
  badge:  Star,
  group:  Users,
  rank:   Trophy,
  streak: Flame,
};

const TYPE_COLOR: Record<NotifType, string> = {
  goal:   "#10B981",
  badge:  "#F59E0B",
  group:  "#6366F1",
  rank:   "#F97316",
  streak: "#FB923C",
};

const TYPE_BG: Record<NotifType, string> = {
  goal:   "#ECFDF5",
  badge:  "#FFFBEB",
  group:  "#EEF2FF",
  rank:   "#FFF7ED",
  streak: "#FFF7ED",
};

export function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(INITIAL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAction = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true, actionDone: true } : n));
  };

  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n => n.read);

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-hidden">
      <style>{`@keyframes nf-in { from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);} }`}</style>

      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-black/[0.05]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-black text-slate-900">알림</h1>
          {unreadCount > 0 && (
            <span className="bg-[#FF3355] text-white text-[11px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="text-[12px] font-bold text-[#FF3355]"
          >
            모두 읽음
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* 읽지 않은 알림 */}
        {unread.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2">새 알림</p>
            <div className="space-y-2">
              {unread.map((n, i) => {
                const Icon = TYPE_ICON[n.type];
                return (
                  <div
                    key={n.id}
                    className="w-full bg-white rounded-2xl px-4 py-3.5 border border-[#FFD6DC] text-left"
                    style={{
                      opacity: mounted ? 1 : 0,
                      animation: `nf-in 0.35s ease ${i * 50}ms both`,
                      boxShadow: "0 2px 12px rgba(255,51,85,0.08)",
                    }}
                  >
                    <button
                      className="w-full flex items-start gap-3 active:opacity-70 transition-opacity"
                      onClick={() => markRead(n.id)}
                    >
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: TYPE_BG[n.type] }}
                      >
                        {n.emoji ? (
                          <span className="text-lg">{n.emoji}</span>
                        ) : (
                          <Icon className="w-4.5 h-4.5" style={{ color: TYPE_COLOR[n.type], width: 18, height: 18 }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-black text-slate-900">{n.title}</p>
                          <div className="w-2 h-2 rounded-full bg-[#FF3355] shrink-0" />
                        </div>
                        <p className="text-[12px] text-slate-500 leading-snug">{n.body}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-semibold">{n.time}</p>
                      </div>
                    </button>
                    {/* 그룹 초대 액션 버튼 */}
                    {n.actionable && !n.actionDone && (
                      <div className="flex gap-2 mt-3 pl-13" style={{ paddingLeft: 52 }}>
                        <button
                          onClick={() => handleAction(n.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF3355] text-white text-[13px] font-bold active:scale-95 transition-all"
                          style={{ boxShadow: "0 4px 12px rgba(255,51,85,0.3)" }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          수락
                        </button>
                        <button
                          onClick={() => handleAction(n.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[13px] font-bold active:scale-95 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          거절
                        </button>
                      </div>
                    )}
                    {n.actionable && n.actionDone && (
                      <p className="text-[11px] text-slate-400 mt-2 pl-13 font-semibold" style={{ paddingLeft: 52 }}>
                        처리 완료
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 읽은 알림 */}
        {read.length > 0 && (
          <div className="px-4 pt-4 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2">이전 알림</p>
            <div className="space-y-1.5">
              {read.map((n, i) => {
                const Icon = TYPE_ICON[n.type];
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-black/[0.04]"
                    style={{
                      opacity: mounted ? 0.85 : 0,
                      transform: mounted ? "translateX(0)" : "translateX(-8px)",
                      transition: `opacity 0.4s ease ${(i + unread.length) * 40 + 100}ms, transform 0.4s ease ${(i + unread.length) * 40 + 100}ms`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 opacity-60"
                      style={{ background: TYPE_BG[n.type] }}
                    >
                      {n.emoji ? (
                        <span className="text-base">{n.emoji}</span>
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: TYPE_COLOR[n.type] }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-500">{n.title}</p>
                      <p className="text-[12px] text-slate-400 leading-snug mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-slate-300 mt-0.5 font-semibold">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-[15px] font-bold text-slate-400">알림이 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
}
