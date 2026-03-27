import React, { useState, useEffect } from "react";
import { ChevronLeft, Camera, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";

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

  const slide = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.45s ease ${delay}ms, transform 0.45s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA]">

      {/* 히어로 헤더 */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{ background: `linear-gradient(150deg, ${vt.bgGrad[0]}, ${vt.bgGrad[1]})`, paddingBottom: 32 }}
      >
        {/* 장식 원 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-20 -left-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

        {/* 네비 */}
        <div className="relative z-10 flex items-center px-4 pt-4 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 이모지 + 타이틀 */}
        <div className="relative z-10 px-6 pt-2" style={slide(60)}>
          <span className="text-[56px] block mb-3">{vt.emoji}</span>
          <h1 className="text-[28px] font-black text-white leading-tight">{vt.label}</h1>
          <p className="text-white/70 text-[14px] mt-1 leading-relaxed">{vt.desc}</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* 인증 방법 */}
        <div style={slide(120)}
          className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">인증 방법</p>
          <div className="space-y-3">
            {vt.guide.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black text-white mt-0.5"
                  style={{ background: `linear-gradient(135deg, ${vt.bgGrad[0]}, ${vt.bgGrad[1]})` }}
                >
                  {i + 1}
                </div>
                <p className="text-[14px] text-slate-700 leading-snug flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 확인 항목 */}
        <div style={slide(200)}
          className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">AI가 확인하는 것</p>
          <div className="space-y-2.5">
            {vt.checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: vt.bgGrad[0] }}
                  strokeWidth={2.5}
                />
                <p className="text-[13px] text-slate-700 leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 거절 사유 */}
        <div style={slide(280)}
          className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">이런 사진은 거절돼요</p>
          <div className="space-y-2.5">
            {vt.rejectReasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <XCircle
                  className="w-4 h-4 shrink-0 text-rose-400"
                  strokeWidth={2.5}
                />
                <p className="text-[13px] text-slate-500 leading-snug">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 배너 */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            ...slide(200),
            background: `linear-gradient(110deg, ${vt.bgGrad[0]}18, ${vt.bgGrad[1]}18)`,
            border: `1px solid ${vt.bgGrad[0]}30`,
          }}
        >
          <div
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${vt.bgGrad[0]}, ${vt.bgGrad[1]})` }}
          >
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: vt.bgGrad[0] }}>Tip</p>
            <p className="text-[13px] text-slate-700 leading-snug">{vt.tip}</p>
          </div>
        </div>

        {/* 여백 */}
        <div className="h-2" />
      </div>

      {/* 촬영 시작 버튼 */}
      <div className="shrink-0 px-4 pb-8 pt-3 bg-[#F8F8FA]">
        <button
          onClick={() => navigate("/verify/camera")}
          className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl text-white font-black text-[16px] active:scale-[0.98] transition-transform"
          style={{
            background: `linear-gradient(135deg, ${vt.bgGrad[0]}, ${vt.bgGrad[1]})`,
            boxShadow: `0 8px 24px -4px ${vt.bgGrad[0]}60`,
          }}
        >
          <Camera className="w-5 h-5" />
          촬영 시작
        </button>
      </div>
    </div>
  );
}
