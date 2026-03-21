import { useEffect, useState, useRef } from "react";
import {
  Flame, Target, TrendingUp, CheckCircle2, ArrowRight,
  Camera, Trophy, Users, Star, Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* 카드에 spring-in + float 콤보 animation 문자열 생성 */
function cardAnim(delay: number, floatName = "ob-float-a") {
  return `ob-spring 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both, ${floatName} 5s ease-in-out ${delay + 600}ms infinite`;
}

/* ─── 슬라이드 1 ───────────────────────────────── */
function Slide1({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center px-8 pt-2 pb-2 relative z-10">
        <div className="relative w-[300px] h-[280px]">

          {/* 메인 목표 카드 */}
          <div
            className="absolute top-[16%] left-[2%] w-[72%] rounded-3xl p-5"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              animation: on ? cardAnim(0) : "none",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF3355] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(255,51,85,0.5)]">
                <Target className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-white/45 text-[9px] font-bold uppercase tracking-widest">오늘의 목표</div>
                <div className="text-white font-bold text-sm">30분 유산소</div>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF3355] to-[#FF7799] rounded-full"
                style={{ animation: on ? "ob-bar 1s cubic-bezier(0.4,0,0.2,1) 500ms both" : "none" }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-white/35 text-[9px]">진행중</span>
              <span className="text-[#FF9DB2] text-[9px] font-bold">60%</span>
            </div>
          </div>

          {/* 연속 달성 배지 */}
          <div
            className="absolute top-[2%] right-[2%] rounded-2xl px-3.5 py-2.5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 8px 28px rgba(239,68,68,0.45)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(120, "ob-float-b") : "none",
            }}
          >
            <Flame className="w-5 h-5 text-white fill-white/80" />
            <div>
              <div className="text-orange-100/70 text-[8px] font-semibold mb-0.5">연속 달성</div>
              <div className="text-white font-extrabold text-base leading-none">7일</div>
            </div>
          </div>

          {/* 인증 완료 */}
          <div
            className="absolute bottom-[8%] right-[6%] rounded-2xl px-3 py-2 flex items-center gap-1.5"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(250, "ob-float-c") : "none",
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="text-white font-bold text-xs">어제 인증 완료</span>
          </div>

          {/* 달성률 */}
          <div
            className="absolute bottom-[12%] left-[-4%] rounded-2xl px-3.5 py-2.5 flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
              animation: on ? cardAnim(380) : "none",
            }}
          >
            <div className="w-7 h-7 rounded-xl bg-[#FF3355]/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF9DB2]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-white/35 text-[8px]">이번 달 달성률</div>
              <div className="text-white font-extrabold text-sm">87%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 텍스트 */}
      <TextBlock on={on} tag="체계적인 목표 달성 시스템" tagColor="text-[#FF9DB2]" tagBg="bg-[#FF3355]/15 border-[#FF3355]/25">
        <span className="text-white">다짐은 왜 항상</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#FF3355,#FF99B2)" }}>실패할까?</span>
      </TextBlock>
      <SubText on={on}>혼자 하는 의지는 오래가지 않습니다.<br />체계적인 시스템으로 시작해보세요.</SubText>
    </div>
  );
}

/* ─── 슬라이드 2 ───────────────────────────────── */
function Slide2({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center px-8 pt-2 pb-2 relative z-10">
        <div className="relative w-[300px] h-[280px]">

          {/* 카메라 카드 */}
          <div
            className="absolute top-[10%] left-[8%] w-[75%] rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              animation: on ? cardAnim(0) : "none",
            }}
          >
            <div className="relative h-28 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FF3355]/20 flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#FF9DB2]" strokeWidth={1.5} />
              </div>
              {[["top-3 left-3","border-l-2 border-t-2"],["top-3 right-3","border-r-2 border-t-2"],
                ["bottom-3 left-3","border-l-2 border-b-2"],["bottom-3 right-3","border-r-2 border-b-2"]].map(([pos, border], i) => (
                <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-[#FF3355]/60 rounded-sm`} />
              ))}
            </div>
            <div className="p-3.5">
              <div className="text-white font-bold text-sm mb-1">사진으로 인증하기</div>
              <div className="text-white/40 text-[10px]">AI가 자동으로 인증을 확인해요</div>
            </div>
          </div>

          {/* AI 배지 */}
          <div
            className="absolute top-[2%] right-[0%] rounded-2xl px-3 py-2.5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              boxShadow: "0 8px 28px rgba(124,58,237,0.5)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(150, "ob-float-b") : "none",
            }}
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300/60" />
            <div>
              <div className="text-purple-200/70 text-[8px] font-semibold mb-0.5">AI 자동 인증</div>
              <div className="text-white font-extrabold text-sm leading-none">통과!</div>
            </div>
          </div>

          {/* 주간 인증 */}
          <div
            className="absolute bottom-[5%] right-[-2%] rounded-2xl px-3.5 py-2.5"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
              animation: on ? cardAnim(300, "ob-float-c") : "none",
            }}
          >
            <div className="text-white/35 text-[8px] font-medium mb-1.5">이번 주 인증</div>
            <div className="flex gap-1.5">
              {["월","화","수","목","금","토","일"].map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${i < 5 ? "bg-[#FF3355]" : "bg-white/10"}`}
                    style={{ animation: on && i < 5 ? `ob-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${460 + i * 60}ms both` : "none" }}
                  >
                    {i < 5 && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2.5} />}
                  </div>
                  <span className="text-white/30 text-[7px]">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TextBlock on={on} tag="AI 사진 인증 시스템" tagColor="text-violet-300" tagBg="bg-violet-500/15 border-violet-500/25">
        <span className="text-white">사진 한 장으로</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#818cf8)" }}>증명하세요</span>
      </TextBlock>
      <SubText on={on}>목표를 달성하면 사진으로 인증하세요.<br />AI가 자동으로 확인하고 기록합니다.</SubText>
    </div>
  );
}

/* ─── 슬라이드 3 ───────────────────────────────── */
function Slide3({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center px-8 pt-2 pb-2 relative z-10">
        <div className="relative w-[300px] h-[280px]">

          {/* 랭킹 카드 */}
          <div
            className="absolute top-[5%] left-[4%] w-[76%] rounded-3xl p-4"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              animation: on ? cardAnim(0) : "none",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" strokeWidth={2} />
              <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest">이번 주 랭킹</span>
            </div>
            {([
              { rank: 1, name: "김민준", score: 2840, color: "#f59e0b", me: false },
              { rank: 2, name: "이서연", score: 2650, color: "#94a3b8", me: false },
              { rank: 3, name: "나",    score: 2480, color: "#cd7c32", me: true  },
            ] as const).map((u, i) => (
              <div
                key={u.rank}
                className={`flex items-center gap-2.5 py-1.5 ${u.me ? "rounded-xl px-2 -mx-2" : ""}`}
                style={{
                  ...(u.me ? { background: "rgba(255,51,85,0.15)", border: "1px solid rgba(255,51,85,0.2)" } : {}),
                  animation: on ? `ob-slide-in-l 0.4s ease ${340 + i * 80}ms both` : "none",
                }}
              >
                <span className="font-extrabold text-sm w-4 text-center" style={{ color: u.color }}>{u.rank}</span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="text-[9px] text-white/60">{u.name[0]}</span>
                </div>
                <span className={`text-xs font-semibold flex-1 ${u.me ? "text-[#FF9DB2]" : "text-white/70"}`}>{u.name}</span>
                <span className="text-[10px] font-bold text-white/50">{u.score.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* 챌린지 배지 */}
          <div
            className="absolute top-[2%] right-[-2%] rounded-2xl px-3 py-2.5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              boxShadow: "0 8px 28px rgba(245,158,11,0.45)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(180, "ob-float-b") : "none",
            }}
          >
            <Users className="w-4 h-4 text-white" strokeWidth={2} />
            <div>
              <div className="text-amber-100/70 text-[8px] font-semibold mb-0.5">챌린지</div>
              <div className="text-white font-extrabold text-sm leading-none">12명 참여</div>
            </div>
          </div>

          {/* 포인트 배지 */}
          <div
            className="absolute bottom-[8%] right-[4%] rounded-2xl px-3 py-2 flex items-center gap-1.5"
            style={{
              background: "linear-gradient(135deg,#FF3355,#FF6680)",
              boxShadow: "0 8px 24px rgba(255,51,85,0.45)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(330, "ob-float-c") : "none",
            }}
          >
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300/60" strokeWidth={2} />
            <span className="text-white font-bold text-xs">+120 포인트 획득!</span>
          </div>
        </div>
      </div>

      <TextBlock on={on} tag="함께하는 챌린지" tagColor="text-amber-300" tagBg="bg-amber-500/15 border-amber-500/25">
        <span className="text-white">같이 하면</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#fbbf24,#f97316)" }}>더 오래갑니다</span>
      </TextBlock>
      <SubText on={on}>친구들과 챌린지로 서로 동기부여하고<br />랭킹으로 경쟁하며 목표를 달성하세요.</SubText>
    </div>
  );
}

/* ─── 공통 텍스트 블록 ─────────────────────────── */
function TextBlock({ on, tag, tagColor, tagBg, children }: {
  on: boolean; tag: string; tagColor: string; tagBg: string; children: React.ReactNode;
}) {
  return (
    <div className="px-8 z-10 text-center">
      <div
        className={`inline-flex items-center gap-1.5 ${tagBg} border rounded-full px-3 py-1 mb-4`}
        style={{ animation: on ? "ob-fade 0.5s ease 180ms both" : "none" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ animation: "ob-orb 2s ease-in-out infinite" }} />
        <span className={`${tagColor} text-xs font-semibold tracking-wide`}>{tag}</span>
      </div>
      <div className="overflow-hidden mb-1.5">
        <h1
          className="text-[36px] leading-[1.15] font-extrabold tracking-tight break-keep"
          style={{ animation: on ? "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 260ms both" : "none" }}
        >
          {children}
        </h1>
      </div>
    </div>
  );
}

function SubText({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <p
      className="px-8 pb-4 text-center text-[14px] leading-relaxed text-white/45 font-medium break-keep"
      style={{ animation: on ? "ob-fade 0.5s ease 380ms both" : "none" }}
    >
      {children}
    </p>
  );
}

/* ─── 슬라이드 목록 ─────────────────────────────── */
const SLIDES = [Slide1, Slide2, Slide3];

/* ─── 메인 ─────────────────────────────────────── */
export function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [on, setOn] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setOn(false);
    setTimeout(() => { setCurrent(idx); setOn(true); }, 220);
  };

  const SlideComponent = SLIDES[current];

  return (
    <div
      className="flex-1 flex flex-col bg-[#0A0808] relative h-full overflow-hidden"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
        touchX.current = null;
      }}
    >
      {/* 슬라이드 */}
      <div
        className="flex-1 flex flex-col"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <SlideComponent on={on} />
      </div>

      {/* 하단 CTA */}
      <div
        className="w-full px-8 pb-6 flex flex-col items-center gap-5 z-30"
        style={{ animation: "ob-fade 0.6s ease 500ms both" }}
      >
        {/* 인디케이터 */}
        <div className="flex gap-2 items-center">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 28 : 6,
                height: 6,
                borderRadius: 9999,
                background: i === current ? "#FF3355" : "rgba(255,255,255,0.18)",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>

        {current < SLIDES.length - 1 ? (
          <button
            onClick={() => goTo(current + 1)}
            className="w-full h-14 text-white rounded-2xl text-[17px] font-bold flex items-center justify-center gap-2 group active:scale-[0.97] transition-transform"
            style={{
              background: "linear-gradient(135deg,#FF3355,#FF6680)",
              animation: "ob-glow 2.5s ease-in-out infinite",
            }}
          >
            다음
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/goal-setting/category")}
            className="w-full h-14 text-white rounded-2xl text-[17px] font-bold flex items-center justify-center gap-2 group active:scale-[0.97] transition-transform"
            style={{
              background: "linear-gradient(135deg,#FF3355,#FF6680)",
              animation: "ob-glow 2.5s ease-in-out infinite",
            }}
          >
            시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {current < SLIDES.length - 1 && (
          <button
            onClick={() => navigate("/goal-setting/category")}
            className="text-white/30 text-sm font-medium hover:text-white/50 transition-colors"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
