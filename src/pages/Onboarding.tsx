import React, { useEffect, useState, useRef } from "react";
import {
  Flame, CheckCircle2, ArrowRight,
  Camera, Trophy, Users, Star, Zap, User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

/* 카드에 spring-in + float 콤보 animation 문자열 생성 */
function cardAnim(delay: number, floatName = "ob-float-a") {
  return `ob-spring 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both, ${floatName} 5s ease-in-out ${delay + 600}ms infinite`;
}

/* ─── 슬라이드 0: 인트로 (로고) ───────────────── */
function Slide0({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-8 relative z-10">
      {/* 로고 */}
      <div
        className="mb-8"
        style={{ animation: on ? "ob-spring 0.7s cubic-bezier(0.34,1.56,0.64,1) 80ms both" : "none" }}
      >
        <img
          src="/chally-logo-nobg.png"
          alt="Chally"
          className="w-40 h-40 object-contain drop-shadow-2xl"
        />
      </div>

      {/* 타이틀 */}
      <div
        className="text-center"
        style={{ animation: on ? "ob-fade 0.5s ease 350ms both" : "none" }}
      >
        <h1 className="text-[36px] font-black text-white leading-tight mb-3">
          챌리<span className="text-[#FF9DB2]">(Chally)</span>
        </h1>
        <p className="text-white/50 text-[16px] font-medium">챌린지로 모임, 챌린지가 모임!</p>
      </div>
    </div>
  );
}

/* ─── 슬라이드 1 ───────────────────────────────── */
function Slide1({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center px-8 pt-2 pb-2 relative z-10">
        <div className="relative w-[300px] h-[280px]">

          {/* 그룹 멤버 카드 */}
          <div
            className="absolute top-[10%] left-[4%] w-[74%] rounded-3xl p-4"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              animation: on ? cardAnim(0) : "none",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#FF9DB2]" strokeWidth={2} />
              <span className="text-white/45 text-[9px] font-bold uppercase tracking-widest">함께하는 챌린지</span>
            </div>
            {[
              { name: "김민준", rate: 98, color: "#f59e0b" },
              { name: "이서연", rate: 94, color: "#94a3b8" },
              { name: "나",     rate: 87, color: "#FF3355", me: true },
            ].map((u, i) => (
              <div
                key={u.name}
                className={`flex items-center gap-2.5 py-1.5 ${u.me ? "rounded-xl px-2 -mx-2" : ""}`}
                style={{
                  ...(u.me ? { background: "rgba(255,51,85,0.15)", border: "1px solid rgba(255,51,85,0.2)" } : {}),
                  animation: on ? `ob-slide-in-l 0.4s ease ${300 + i * 80}ms both` : "none",
                }}
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="text-[9px] text-white/60">{u.name[0]}</span>
                </div>
                <span className={`text-xs font-semibold flex-1 ${u.me ? "text-[#FF9DB2]" : "text-white/70"}`}>{u.name}</span>
                <span className="text-[10px] font-bold" style={{ color: u.color }}>{u.rate}%</span>
              </div>
            ))}
          </div>

          {/* 참여 배지 */}
          <div
            className="absolute top-[2%] right-[0%] rounded-2xl px-3.5 py-2.5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg,#FF3355,#CC0030)",
              boxShadow: "0 8px 28px rgba(255,51,85,0.5)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(130, "ob-float-b") : "none",
            }}
          >
            <Users className="w-4 h-4 text-white" strokeWidth={2} />
            <div>
              <div className="text-white/60 text-[8px] font-semibold mb-0.5">지금 참여 중</div>
              <div className="text-white font-extrabold text-sm leading-none">38명</div>
            </div>
          </div>

          {/* 연속 달성 배지 */}
          <div
            className="absolute bottom-[8%] right-[2%] rounded-2xl px-3.5 py-2.5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg,#f97316,#ef4444)",
              boxShadow: "0 8px 24px rgba(239,68,68,0.45)",
              border: "1px solid rgba(255,255,255,0.2)",
              animation: on ? cardAnim(280, "ob-float-c") : "none",
            }}
          >
            <Flame className="w-4 h-4 text-white fill-white/80" />
            <div>
              <div className="text-orange-100/60 text-[8px] font-semibold mb-0.5">연속 달성</div>
              <div className="text-white font-extrabold text-sm leading-none">7일 🔥</div>
            </div>
          </div>
        </div>
      </div>

      <TextBlock on={on} tag="함께하는 챌린지" tagColor="text-[#FF9DB2]" tagBg="bg-[#FF3355]/15 border-[#FF3355]/25">
        <span className="text-white">목표가 있다면</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#FF3355,#FF99B2)" }}>이루어 내는 사람들</span>
      </TextBlock>
      <SubText on={on}>같은 목표를 바라보는 사람들과 함께 해요.</SubText>
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

      <TextBlock on={on} tag="AI 사진 인증" tagColor="text-violet-300" tagBg="bg-violet-500/15 border-violet-500/25">
        <span className="text-white">사진 한 장으로</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#818cf8)" }}>끝나는 인증</span>
      </TextBlock>
      <SubText on={on}>챌린지를 가장 쉽게 인증해요.</SubText>
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

      <TextBlock on={on} tag="실시간 공동 달성" tagColor="text-amber-300" tagBg="bg-amber-500/15 border-amber-500/25">
        <span className="text-white">중요한 건</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#fbbf24,#f97316)" }}>꺾이지 않는 의지</span>
      </TextBlock>
      <SubText on={on}>하고자 하는 마음만 있다면 하게 됩니다.</SubText>
    </div>
  );
}

/* ─── 슬라이드 4: 닉네임 입력 ──────────────────── */
function Slide4({ on, value, onChange }: { on: boolean; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (on) setTimeout(() => inputRef.current?.focus(), 400);
  }, [on]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-2 pb-2 relative z-10">
        {/* 아바타 */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_16px_40px_rgba(255,51,85,0.4)]"
          style={{
            background: "linear-gradient(135deg,#FF3355,#CC0030)",
            animation: on ? "ob-spring 0.6s cubic-bezier(0.34,1.56,0.64,1) 80ms both" : "none",
          }}
        >
          <User className="w-10 h-10 text-white" strokeWidth={1.8} />
        </div>

        {/* 입력 */}
        <div
          className="w-full"
          style={{ animation: on ? "ob-fade 0.5s ease 220ms both" : "none" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="닉네임을 입력하세요"
            maxLength={12}
            className="w-full text-center text-white text-[20px] font-bold bg-transparent outline-none placeholder:text-white/25 border-b-2 pb-2"
            style={{ borderColor: value ? "#FF3355" : "rgba(255,255,255,0.15)" }}
          />
          <p className="text-center text-white/30 text-[11px] mt-2">최대 12자</p>
        </div>
      </div>

      <TextBlock on={on} tag="프로필 설정" tagColor="text-[#FF9DB2]" tagBg="bg-[#FF3355]/15 border-[#FF3355]/25">
        <span className="text-white">어떻게</span>
        <br />
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#FF3355,#FF99B2)" }}>불러드릴까요?</span>
      </TextBlock>
      <SubText on={on}>챌리에서 사용할 닉네임을 입력해주세요.</SubText>
    </div>
  );
}

/* ─── 슬라이드 5: 관심 카테고리 선택 ──────────── */
const OB_CATS = [
  { id: "exercise", label: "운동",  emoji: "💪", grad: ["#FF3355","#FF6680"] as [string,string] },
  { id: "study",    label: "학습",  emoji: "📖", grad: ["#3b82f6","#6366f1"] as [string,string] },
  { id: "reading",  label: "독서",  emoji: "📚", grad: ["#FB923C","#F59E0B"] as [string,string] },
  { id: "habit",    label: "습관",  emoji: "🌱", grad: ["#22c55e","#16a34a"] as [string,string] },
  { id: "hobby",    label: "취미",  emoji: "🎨", grad: ["#a855f7","#7c3aed"] as [string,string] },
  { id: "etc",      label: "기타",  emoji: "✨", grad: ["#38BDF8","#0EA5E9"] as [string,string] },
];

function Slide5({ on, selected, toggle }: {
  on: boolean; selected: string[]; toggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-3 z-10">
        <div
          className="inline-flex items-center gap-1.5 bg-[#3b82f6]/15 border border-[#3b82f6]/25 rounded-full px-3 py-1 mb-3"
          style={{ animation: on ? "ob-fade 0.5s ease 100ms both" : "none" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ animation: "ob-orb 2s ease-in-out infinite" }} />
          <span className="text-blue-300 text-xs font-semibold tracking-wide">관심 분야</span>
        </div>
        <h1
          className="text-[28px] leading-tight font-extrabold tracking-tight break-keep text-white"
          style={{ animation: on ? "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 180ms both" : "none" }}
        >
          어떤 분야에<br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#60a5fa,#a78bfa)" }}>관심 있나요?</span>
        </h1>
        <p
          className="text-white/40 text-[13px] mt-1.5 break-keep"
          style={{ animation: on ? "ob-fade 0.5s ease 280ms both" : "none" }}
        >
          여러 개 선택할 수 있어요
        </p>
      </div>

      <div
        className="flex-1 px-5 overflow-y-auto"
        style={{ animation: on ? "ob-fade 0.5s ease 320ms both" : "none" }}
      >
        <div className="grid grid-cols-2 gap-2.5 pb-4">
          {OB_CATS.map((cat, i) => {
            const isOn = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className="relative rounded-2xl p-4 text-left transition-all active:scale-[0.97]"
                style={{
                  background: isOn
                    ? `linear-gradient(135deg,${cat.grad[0]},${cat.grad[1]})`
                    : "rgba(255,255,255,0.07)",
                  border: isOn ? "2px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isOn ? `0 8px 24px ${cat.grad[0]}44` : "none",
                  backdropFilter: "blur(12px)",
                  animation: on ? `ob-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) ${140 + i * 55}ms both` : "none",
                }}
              >
                {isOn && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                )}
                <div className="text-[26px] mb-2 leading-none">{cat.emoji}</div>
                <p className="text-white font-bold text-[14px]">{cat.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── 슬라이드 6: 챌린지 선택 ──────────────────── */
const OB_CHALLENGES = [
  { id: "1", title: "매일 5,000보 걷기",  emoji: "👟", members: 38, img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&fit=crop&q=80" },
  { id: "2", title: "러닝 크루",       emoji: "🏃", members: 24, img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&fit=crop&q=80" },
  { id: "3", title: "일일 독서 클럽",  emoji: "📚", members: 15, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&fit=crop&q=80" },
  { id: "4", title: "필사 챌린지",     emoji: "✍️", members: 11, img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&fit=crop&q=80" },
  { id: "5", title: "포즈 챌린지",     emoji: "📸", members: 42, img: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&fit=crop&q=80" },
  { id: "6", title: "장소 탐험대",     emoji: "📍", members: 19, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&fit=crop&q=80" },
];

function Slide6({ on, selected, toggle }: {
  on: boolean; selected: string[]; toggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-3 z-10">
        <div
          className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-3 py-1 mb-3"
          style={{ animation: on ? "ob-fade 0.5s ease 100ms both" : "none" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: "ob-orb 2s ease-in-out infinite" }} />
          <span className="text-amber-300 text-xs font-semibold tracking-wide">챌린지 참여</span>
        </div>
        <h1
          className="text-[28px] leading-tight font-extrabold tracking-tight break-keep text-white"
          style={{ animation: on ? "ob-word 0.5s cubic-bezier(0.34,1.2,0.64,1) 180ms both" : "none" }}
        >
          참여할 챌린지를<br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#fbbf24,#f97316)" }}>골라보세요</span>
        </h1>
        <p
          className="text-white/40 text-[13px] mt-1.5 break-keep"
          style={{ animation: on ? "ob-fade 0.5s ease 280ms both" : "none" }}
        >
          최대 2개까지 선택할 수 있어요{selected.length > 0 && <span className="text-amber-400 font-semibold"> · {selected.length}개 선택됨</span>}
        </p>
      </div>

      <div
        className="flex-1 px-5 overflow-y-auto"
        style={{ animation: on ? "ob-fade 0.5s ease 320ms both" : "none" }}
      >
        <div className="flex flex-col gap-2.5 pb-4">
          {OB_CHALLENGES.map((ch, i) => {
            const isOn = selected.includes(ch.id);
            const maxed = selected.length >= 2 && !isOn;
            return (
              <button
                key={ch.id}
                onClick={() => !maxed && toggle(ch.id)}
                className="relative rounded-2xl overflow-hidden text-left transition-all active:scale-[0.99]"
                style={{
                  opacity: maxed ? 0.4 : 1,
                  outline: isOn ? "2.5px solid #FF3355" : "none",
                  outlineOffset: 2,
                  animation: on ? `ob-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) ${140 + i * 50}ms both` : "none",
                }}
              >
                {/* 배경 이미지 */}
                <div className="relative h-[72px]">
                  <img
                    src={ch.img}
                    alt={ch.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to right,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.25) 100%)" }}
                  />
                  <div className="absolute inset-0 flex items-center px-4 gap-3">
                    <span className="text-[22px] leading-none shrink-0">{ch.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-[15px] leading-tight">{ch.title}</p>
                      <p className="text-white/50 text-[11px] mt-0.5">{ch.members}명 참여 중</p>
                    </div>
                    {isOn && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-[#FF3355] flex items-center justify-center shadow-[0_4px_12px_rgba(255,51,85,0.5)]">
                        <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
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

const TOTAL = 7;

/* ─── 메인 ─────────────────────────────────────── */
export function Onboarding() {
  const navigate = useNavigate();
  const { setNickname, joinGroup } = useApp();
  const [current, setCurrent] = useState(0);
  const [on, setOn] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= TOTAL) return;
    setOn(false);
    setTimeout(() => { setCurrent(idx); setOn(true); }, 220);
  };

  const toggleCat = (id: string) =>
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const toggleChallenge = (id: string) =>
    setSelectedChallenges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 2 ? [...prev, id] : prev
    );

  const handleStart = () => {
    if (nicknameInput.trim()) setNickname(nicknameInput.trim());
    selectedChallenges.forEach(id => joinGroup(id));
    navigate("/");
  };

  // slide 4(닉네임)은 입력 필수, 나머지 선택 단계는 선택 없어도 통과 가능
  const canNext = current !== 4 || nicknameInput.trim().length > 0;

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
        className="flex-1 flex flex-col min-h-0"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        {current === 0 && <Slide0 on={on} />}
        {current === 1 && <Slide1 on={on} />}
        {current === 2 && <Slide2 on={on} />}
        {current === 3 && <Slide3 on={on} />}
        {current === 4 && <Slide4 on={on} value={nicknameInput} onChange={setNicknameInput} />}
        {current === 5 && <Slide5 on={on} selected={selectedCats} toggle={toggleCat} />}
        {current === 6 && <Slide6 on={on} selected={selectedChallenges} toggle={toggleChallenge} />}
      </div>

      {/* 하단 CTA */}
      <div
        className="w-full px-8 pb-6 flex flex-col items-center gap-4 z-30 shrink-0"
        style={{ animation: "ob-fade 0.6s ease 500ms both" }}
      >
        {/* 인디케이터 */}
        <div className="flex gap-2 items-center">
          {Array.from({ length: TOTAL }).map((_, i) => (
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

        {current < TOTAL - 1 ? (
          <button
            onClick={() => canNext && goTo(current + 1)}
            disabled={!canNext}
            className="w-full h-14 text-white rounded-2xl text-[17px] font-bold flex items-center justify-center gap-2 group active:scale-[0.97] transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg,#FF3355,#FF6680)",
              animation: canNext ? "ob-glow 2.5s ease-in-out infinite" : "none",
            }}
          >
            다음
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-full h-14 text-white rounded-2xl text-[17px] font-bold flex items-center justify-center gap-2 group active:scale-[0.97] transition-transform"
            style={{
              background: "linear-gradient(135deg,#FF3355,#FF6680)",
              animation: "ob-glow 2.5s ease-in-out infinite",
            }}
          >
            {selectedChallenges.length > 0 ? `${selectedChallenges.length}개 챌린지로 시작하기` : "시작하기"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {current >= 1 && current <= 3 && (
          <button
            onClick={() => goTo(4)}
            className="text-white/30 text-sm font-medium hover:text-white/50 transition-colors"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
