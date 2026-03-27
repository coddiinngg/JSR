import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, XCircle, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";
import { verifyPhotoWithAI, type VerifyResult } from "../../lib/verifyAI";

type Phase = "analyzing" | "passed" | "failed" | "error";

export function Upload() {
  const navigate = useNavigate();
  const { verificationImageUrl, verificationImageFile, verifyType } = useApp();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const calledRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [key] = useState<VerifyTypeKey>(() => (verifyType as VerifyTypeKey) ?? "step_walk");
  const vt = VERIFY_TYPES[key] ?? VERIFY_TYPES["step_walk"];

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!verificationImageFile) { navigate("/verify/camera"); return; }

    const abortCtrl = new AbortController();
    let rafId: number;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    const startTime = Date.now();
    const tick = () => {
      if (stopped) return;
      const p = Math.min((Date.now() - startTime) / 4000, 1);
      setProgress(Math.round((1 - Math.pow(1 - p, 2.2)) * 88));
      if (p < 1) { rafId = requestAnimationFrame(tick); }
      else {
        let slow = 88;
        intervalId = setInterval(() => {
          if (stopped) { clearInterval(intervalId!); return; }
          slow = Math.min(slow + 0.15, 97);
          setProgress(Math.round(slow));
        }, 200);
      }
    };
    rafId = requestAnimationFrame(tick);

    verifyPhotoWithAI(verificationImageFile, key, abortCtrl.signal)
      .then(res => {
        stopped = true;
        cancelAnimationFrame(rafId);
        if (intervalId) clearInterval(intervalId);
        setResult(res);
        setProgress(100);
        if (res.passed) {
          setPhase("passed");
          successTimerRef.current = setTimeout(() => navigate("/success"), 900);
        } else {
          setPhase("failed");
        }
      })
      .catch((err: unknown) => {
        stopped = true;
        cancelAnimationFrame(rafId);
        if (intervalId) clearInterval(intervalId);
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setPhase("error");
      });

    return () => {
      stopped = true;
      abortCtrl.abort();
      cancelAnimationFrame(rafId);
      if (intervalId) clearInterval(intervalId);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAnalyzing = phase === "analyzing";
  const isPassed = phase === "passed";
  const isFailed = phase === "failed";

  /* ── 공통 배경 래퍼 ── */
  const Bg = ({ children, glow }: { children: React.ReactNode; glow: string }) => (
    <div className="relative flex h-full w-full flex-col bg-[#080A0F] overflow-hidden">
      {verificationImageUrl && (
        <>
          <img src={verificationImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.18 }} />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} />
        </>
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      {children}
      <style>{`
        @keyframes upl-scan {
          0%   { top: 6%;  opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 92%; opacity: 0; }
        }
        @keyframes upl-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes upl-dot {
          0%,100% { opacity: 0.3; transform: scale(0.8); }
          50%     { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );

  /* ── 상단 바 ── */
  const TopBar = ({ accent }: { accent?: string }) => (
    <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
      <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/50 active:bg-white/20 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: `${accent ?? vt.bgGrad[0]}20`, border: `1px solid ${accent ?? vt.bgGrad[0]}35` }}>
        <span className="text-[13px]">{vt.emoji}</span>
        <span className="text-white text-[12px] font-semibold">{vt.label}</span>
      </div>
      <div className="w-9" />
    </div>
  );

  /* ── 분석 중 ── */
  if (isAnalyzing || isPassed) {
    return (
      <Bg glow={isPassed
        ? "radial-gradient(ellipse at 50% 35%, rgba(52,211,153,0.2) 0%, transparent 60%)"
        : `radial-gradient(ellipse at 50% 35%, ${vt.bgGrad[0]}18 0%, transparent 60%)`
      }>
        <TopBar />

        <div className="flex-1 flex flex-col items-center justify-center gap-7 px-8 relative z-10">
          {/* 사진 프레임 */}
          <div className="relative w-full max-w-[240px] aspect-[3/4]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <img src={verificationImageUrl ?? ""} alt="" className="w-full h-full object-cover"
                style={{ filter: "brightness(0.9)" }} />
              {isPassed && (
                <div className="absolute inset-0 bg-emerald-400/15 transition-opacity duration-700" />
              )}
            </div>

            {/* 스캔 라인 */}
            {isAnalyzing && (
              <div className="absolute left-2 right-2 h-[2px] rounded-full z-10 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${vt.bgGrad[0]}, ${vt.bgGrad[1]}, transparent)`,
                  boxShadow: `0 0 12px ${vt.bgGrad[0]}`,
                  animation: "upl-scan 1.8s ease-in-out infinite",
                }} />
            )}

            {/* 브래킷 */}
            {["top-2 left-2 border-t-2 border-l-2 rounded-tl-lg",
              "top-2 right-2 border-t-2 border-r-2 rounded-tr-lg",
              "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg",
              "bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 z-10 transition-colors duration-500 ${cls}`}
                style={{ borderColor: isPassed ? "#34d399" : vt.bgGrad[0] }} />
            ))}

            {/* 통과 아이콘 */}
            {isPassed && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#34d399,#059669)", boxShadow: "0 0 40px rgba(52,211,153,0.5)", animation: "upl-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>
            )}
          </div>

          {/* 상태 텍스트 */}
          {isPassed ? (
            <p className="text-white font-black text-[22px]">인증 완료! 🎉</p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-white font-semibold text-[15px]">AI 분석 중</p>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50"
                    style={{ animation: `upl-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {/* 진행률 바 */}
          {isAnalyzing && (
            <div className="w-full max-w-[240px] h-[3px] bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` }} />
            </div>
          )}
        </div>
      </Bg>
    );
  }

  /* ── 실패 화면 ── */
  if (isFailed && result) {
    return (
      <Bg glow="radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.15) 0%, transparent 60%)">
        <TopBar accent="#ef4444" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 gap-5">
          {/* X 아이콘 */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 0 40px rgba(239,68,68,0.35)", animation: "upl-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <XCircle className="w-10 h-10 text-white" strokeWidth={2} />
          </div>

          {/* 이유 */}
          <div className="text-center">
            <p className="text-white font-black text-[20px] mb-1.5">인증 실패</p>
            <p className="text-white/50 text-[13px] leading-relaxed">{result.reason}</p>
          </div>

          {/* 실패 항목만 표시 */}
          {result.failedChecks.length > 0 && (
            <div className="w-full max-w-[300px] rounded-2xl p-4 space-y-2.5"
              style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
              {result.failedChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2.5} />
                  <span className="text-white/70 text-[13px]">{check}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="shrink-0 px-6 pb-10 pt-3 relative z-10 flex flex-col gap-2">
          <button onClick={() => navigate("/verify/camera")}
            className="w-full h-13 flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-[15px] active:scale-[0.98] transition-transform"
            style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})`, boxShadow: `0 8px 24px -4px ${vt.bgGrad[0]}44` }}>
            <Camera className="w-4 h-4" />
            다시 찍기
          </button>
          <button onClick={() => navigate("/")}
            className="w-full h-10 text-white/35 text-[13px] active:text-white/60 transition-colors">
            홈으로
          </button>
        </div>
      </Bg>
    );
  }

  /* ── 오류 화면 ── */
  return (
    <Bg glow="radial-gradient(ellipse at 50% 35%, rgba(251,191,36,0.1) 0%, transparent 60%)">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 gap-4">
        <p className="text-[36px]">⚠️</p>
        <p className="text-white font-bold text-[17px] text-center">분석 중 오류가 발생했어요</p>
        <p className="text-white/40 text-[12px] text-center leading-relaxed">{errorMessage || "네트워크를 확인하고 다시 시도해주세요"}</p>
        <button onClick={() => navigate("/verify/camera")}
          className="mt-2 px-8 py-3 rounded-2xl text-white font-semibold text-[14px]"
          style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` }}>
          다시 찍기
        </button>
      </div>
    </Bg>
  );
}
