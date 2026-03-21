import { useState, useEffect } from "react";
import { Bell, Flag, LogOut, Ticket, Pencil, ChevronRight, Star, UserPlus, Moon, Sun, Smartphone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

function useCountUp(target: number, duration = 900, delay = 400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return val;
}

const stats = [
  { label: "달성",   targetVal: 24, suffix: "회", delay: 400 },
  { label: "연속",   targetVal: 8,  suffix: "일", delay: 550 },
  { label: "성공률", targetVal: 92, suffix: "%",  delay: 700 },
];

function StatBadge({ label, targetVal, suffix, delay }: { label: string; targetVal: number; suffix: string; delay: number }) {
  const val = useCountUp(targetVal, 900, delay);
  return (
    <div className="flex-1 rounded-2xl p-3 text-center bg-white/20 border border-white/25">
      <p className="text-[20px] font-black text-white leading-none">
        {val}<span className="text-[12px] font-semibold text-white/60 ml-0.5">{suffix}</span>
      </p>
      <p className="text-[10px] text-white/50 mt-1">{label}</p>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const { nickname, theme, setTheme } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#FAFAFA]">
      <div className="flex-1 overflow-y-auto">

      {/* 히어로 헤더 */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #FF3355 0%, #CC0030 55%, #A00025 100%)",
          paddingTop: 32,
          paddingBottom: 24,
        }}
      >
        {/* 장식 원 */}

        <div className="relative z-10 px-5">
          {/* 아바타 + 캐릭터 행 */}
          <div className="flex items-end justify-between mb-3">
            {/* 아바타 */}
            <div
              className="relative"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0) scale(1)" : "translateY(14px) scale(0.88)",
                transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <div
                className="absolute -inset-1 rounded-full"
                style={{ background: "conic-gradient(from 0deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3), rgba(255,255,255,0.8))", borderRadius: "50%" }}
              />
              <div
                className="relative w-20 h-20 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop")',
                  outline: "3px solid #FF3355",
                  outlineOffset: 1,
                }}
              />
              <Link
                to="/profile/edit"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-all bg-white"
                style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.2)", border: "2px solid #FF3355" }}
              >
                <Pencil className="w-2.5 h-2.5 text-[#FF3355]" />
              </Link>
            </div>

            {/* 이름 + 레벨 (가운데) */}
            <div
              className="flex-1 flex flex-col items-center px-2"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(8px)",
                transition: "all 0.5s 0.15s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <h2 className="text-[18px] font-black text-white text-center">{nickname}</h2>
              <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white bg-white/20 border border-white/30 mt-1">
                Free Plan
              </span>
            </div>

          </div>

          {/* 통계 */}
          <div
            className="w-full flex gap-2"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.5s 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {stats.map((s) => <StatBadge key={s.label} {...s} />)}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* 복구권 카드 */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden flex items-center justify-between bg-white border border-black/[0.04] shadow-[0_4px_20px_rgba(255,51,85,0.08)]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(14px)",
            transition: "all 0.5s 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="relative z-10">
            <p className="text-[11px] text-slate-400 mb-1">보유한 복구권</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[44px] font-black text-slate-900 leading-none">2</span>
              <span className="text-[16px] text-slate-400 ml-1">개</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">실패 시 사용 가능</p>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FFE8EC] border border-[#FFD6DC]">
            <Ticket className="w-7 h-7 text-[#FF3355]" />
          </div>
        </div>

        {/* 설정 */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(14px)",
            transition: "all 0.5s 0.45s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2">설정</p>
          <div className="rounded-2xl overflow-hidden bg-white border border-black/[0.04]">
            {[
              { icon: Bell,         bg: "bg-[#FFE8EC]", color: "text-[#FF3355]", label: "알림 설정",    onClick: () => navigate("/settings/notifications") },
              { icon: Flag,         bg: "bg-[#FFE8EC]", color: "text-[#CC0030]", label: "목표 관리",    onClick: () => navigate("/goals") },
              { icon: Star,         bg: "bg-amber-50",  color: "text-amber-500", label: "리워드 & 배지", onClick: () => navigate("/rewards") },
              { icon: UserPlus,     bg: "bg-sky-50",    color: "text-sky-500",   label: "친구 초대",    onClick: () => navigate("/friends/invite") },
            ].map(({ icon: Icon, bg, color, label, onClick }, i) => (
              <div key={label}>
                {i > 0 && <div className="h-px bg-slate-100 mx-4" />}
                <button
                  onClick={onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="flex-1 text-left text-[14px] font-semibold text-slate-800">{label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            ))}

            {/* 테마 설정 */}
            <div className="h-px bg-slate-100 mx-4" />
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                  {theme === "dark" ? <Moon className="w-4 h-4 text-slate-500" />
                    : theme === "system" ? <Smartphone className="w-4 h-4 text-slate-500" />
                    : <Sun className="w-4 h-4 text-slate-500" />}
                </div>
                <span className="text-[14px] font-semibold text-slate-800">화면 모드</span>
              </div>
              <div className="flex gap-2">
                {([
                  { value: "light",  label: "라이트", icon: Sun },
                  { value: "dark",   label: "다크",   icon: Moon },
                  { value: "system", label: "사용자 지정", icon: Smartphone },
                ] as const).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 active:scale-95"
                    style={theme === value ? {
                      background: "linear-gradient(115deg,#FF5C7A,#FF3355)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(255,51,85,0.3)",
                    } : {
                      background: "#F1F5F9",
                      color: "#64748b",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ml-1 mb-2 mt-5">계정</p>
          <div className="rounded-2xl overflow-hidden bg-white border border-black/[0.04]">
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                <LogOut className="w-4 h-4 text-slate-400" />
              </div>
              <span className="flex-1 text-left text-[14px] font-semibold text-slate-500">로그아웃</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-300 pb-2">JSR v1.0.0</p>
      </div>
      </div>
    </div>
  );
}
