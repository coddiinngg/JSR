import React, { useState, useEffect } from "react";
import { ChevronLeft, Camera, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";

const TYPE_BG: Record<VerifyTypeKey, string> = {
  step_walk:      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&fit=crop&q=80",
  run_scenery:    "https://images.unsplash.com/photo-1694903089438-b5f75f66b7e7?w=800&fit=crop&q=80",
  quote_photo:    "https://images.unsplash.com/photo-1687360440434-9b1407c5e04c?w=800&fit=crop&q=80",
  book_cover:     "https://images.unsplash.com/photo-1695653422902-c52a1b3ba5be?w=800&fit=crop&q=80",
  celeb_pose:     "https://images.unsplash.com/photo-1698038136041-e1e0d23e2d44?w=800&fit=crop&q=80",
  location_photo: "https://images.unsplash.com/photo-1693411974501-a9c2d1b4a0ee?w=800&fit=crop&q=80",
};

export function VerifyGuide() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const { setVerifyType } = useApp();
  const [mounted, setMounted] = useState(false);

  const key = (type as VerifyTypeKey) ?? "step_walk";
  const vt = VERIFY_TYPES[key] ?? VERIFY_TYPES["step_walk"];

  useEffect(() => {
    setVerifyType(key);
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [key, setVerifyType]);

  const fade = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F] overflow-hidden">

      {/* ── 히어로 (배경 이미지 풀스크린) ── */}
      <div className="relative shrink-0 h-[42%] overflow-hidden">
        <img
          src={TYPE_BG[key]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.5 }}
          referrerPolicy="no-referrer"
        />
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 40%, rgba(10,10,15,0.95) 100%)` }} />
        {/* 컬러 글로우 */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 60% 80%, ${vt.bgGrad[0]}30 0%, transparent 65%)` }} />

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white active:bg-black/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 타입 정보 */}
        <div className="absolute bottom-5 left-5 z-10" style={fade(80)}>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3"
            style={{ background: `${vt.bgGrad[0]}30`, border: `1px solid ${vt.bgGrad[0]}50`, color: vt.bgGrad[0] }}
          >
            {vt.emoji} {vt.label}
          </div>
          <h1 className="text-white font-black text-[26px] leading-tight">{vt.desc}</h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 space-y-5">

        {/* 인증 방법 */}
        <div style={fade(160)}>
          <p className="text-white/35 text-[11px] font-bold uppercase tracking-widest mb-3">이렇게 찍으세요</p>
          <div className="space-y-2.5">
            {vt.guide.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white mt-0.5"
                  style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` }}
                >
                  {i + 1}
                </div>
                <p className="text-white/75 text-[13px] leading-snug flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 확인 항목 */}
        <div style={fade(260)}>
          <p className="text-white/35 text-[11px] font-bold uppercase tracking-widest mb-3">AI가 확인하는 것</p>
          <div className="grid grid-cols-2 gap-2">
            {vt.checklist.map((item, i) => (
              <div key={i}
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: `${vt.bgGrad[0]}12`, border: `1px solid ${vt.bgGrad[0]}25` }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: vt.bgGrad[0] }} strokeWidth={2.5} />
                <span className="text-white/70 text-[11px] font-medium leading-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 */}
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ ...fade(340), background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-[20px] shrink-0">💡</span>
          <p className="text-white/50 text-[12px] leading-relaxed">{vt.tip}</p>
        </div>

        <div className="h-1" />
      </div>

      {/* ── 촬영 시작 버튼 ── */}
      <div className="shrink-0 px-5 pb-8 pt-3">
        <button
          onClick={() => navigate("/verify/camera")}
          className="w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl text-white font-black text-[16px] active:scale-[0.97] transition-transform"
          style={{
            background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})`,
            boxShadow: `0 8px 28px -4px ${vt.bgGrad[0]}55`,
          }}
        >
          <Camera className="w-5 h-5" />
          촬영 시작
        </button>
      </div>
    </div>
  );
}
