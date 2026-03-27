import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, XCircle, Sparkles, AlertTriangle, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";
import { verifyPhotoWithAI, type VerifyResult } from "../../lib/verifyAI";

/** 각 체크리스트 항목의 진행률 분기점 (4항목 기준) */
const STAGE_UNTIL = [22, 48, 74, 95];

type Phase = "analyzing" | "passed" | "failed" | "error";

export function Upload() {
  const navigate = useNavigate();
  const { verificationImageUrl, verificationImageFile, verifyType } = useApp();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const calledRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시점 값을 캡처 — verifyType이 나중에 null로 바뀌어도 안전
  const [key] = useState<VerifyTypeKey>(() => (verifyType as VerifyTypeKey) ?? "step_walk");
  const vt = VERIFY_TYPES[key] ?? VERIFY_TYPES["step_walk"];

  const stages = vt.checklist.map((label, i) => ({ label, until: STAGE_UNTIL[i] ?? 95 }));
  const completedStages = stages.filter(s => progress >= s.until).length;
  const currentStage = stages.find(s => progress < s.until);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!verificationImageFile) {
      navigate("/verify/camera");
      return;
    }

    const abortCtrl = new AbortController();
    let rafId: number;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    // 0 → 88% (4초 eased), 이후 88% → 97%를 천천히 증가 (API 응답 대기 중)
    const startTime = Date.now();
    const FAST_DURATION = 4000;
    const FAST_TARGET = 88;

    const fastTick = () => {
      if (stopped) return;
      const p = Math.min((Date.now() - startTime) / FAST_DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 2.2);
      const val = Math.round(eased * FAST_TARGET);
      setProgress(val);
      if (p < 1) {
        rafId = requestAnimationFrame(fastTick);
      } else {
        // 88%에서 멈추지 않고 0.15%씩 천천히 증가
        let slow = FAST_TARGET;
        intervalId = setInterval(() => {
          if (stopped) { if (intervalId) clearInterval(intervalId); return; }
          slow = Math.min(slow + 0.15, 97);
          setProgress(Math.round(slow));
        }, 200);
      }
    };
    rafId = requestAnimationFrame(fastTick);

    verifyPhotoWithAI(verificationImageFile, key, abortCtrl.signal)
      .then(res => {
        stopped = true;
        cancelAnimationFrame(rafId);
        if (intervalId) clearInterval(intervalId);
        setResult(res);
        if (res.passed) {
          setProgress(100);
          setPhase("passed");
          successTimerRef.current = setTimeout(() => navigate("/success"), 900);
        } else {
          setProgress(100);
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
  const isError = phase === "error";

  /* ── 거절 화면 ── */
  if (isFailed && result) {
    return (
      <div className="relative flex h-full w-full flex-col bg-[#080A0F] overflow-hidden">
        {verificationImageUrl && (
          <>
            <img src={verificationImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.12 }} />
            <div className="absolute inset-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
          </>
        )}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.18) 0%, transparent 65%)" }} />

        {/* 상단 바 */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/60 active:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#ef444425", border: "1px solid #ef444440" }}>
            <span className="text-[14px]">{vt.emoji}</span>
            <span className="text-white text-[12px] font-bold">{vt.label}</span>
          </div>
          <div className="w-9" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 gap-5">
          {/* 거절 아이콘 */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 0 48px rgba(239,68,68,0.4)", animation: "upl-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            <XCircle className="w-12 h-12 text-white" strokeWidth={2} />
          </div>

          {/* 헤드라인 */}
          <div className="text-center">
            <p className="text-white font-black text-[22px] mb-1">인증 실패 😥</p>
            <p className="text-white/50 text-[13px] leading-relaxed px-2">{result.reason}</p>
          </div>

          {/* 신뢰도 점수 */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/60 text-[12px]">AI 신뢰도 점수</span>
            <span className="text-white font-black text-[14px]">{result.score}점</span>
          </div>

          {/* 실패 항목 */}
          {result.failedChecks.length > 0 && (
            <div className="w-full max-w-[300px] rounded-2xl p-4 space-y-2.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-400 mb-1">확인되지 않은 항목</p>
              {result.failedChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2.5} />
                  <span className="text-white/70 text-[13px]">{check}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="shrink-0 px-6 pb-10 pt-3 relative z-10 flex flex-col gap-2">
          <button
            onClick={() => navigate("/verify/camera")}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl text-white font-black text-[15px] active:scale-[0.98] transition-transform"
            style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})`, boxShadow: `0 8px 24px -4px ${vt.bgGrad[0]}55` }}
          >
            <Camera className="w-5 h-5" />
            다시 찍기
          </button>
          <button onClick={() => navigate("/")} className="w-full h-10 text-white/40 text-[13px] font-medium active:text-white/70 transition-colors">
            홈으로 돌아가기
          </button>
        </div>

        <style>{`
          @keyframes upl-pop {
            from { transform: scale(0.5); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  /* ── 오류 화면 ── */
  if (isError) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#080A0F] gap-5 px-8">
        <AlertTriangle className="w-14 h-14 text-amber-400" />
        <p className="text-white font-bold text-[18px] text-center">AI 분석 중 오류가 발생했습니다</p>
        <p className="text-white/40 text-[13px] text-center leading-relaxed">{errorMessage || "네트워크 연결을 확인하고 다시 시도해주세요"}</p>
        <button
          onClick={() => navigate("/verify/camera")}
          className="mt-2 px-8 py-3 rounded-2xl text-white font-bold text-[14px]"
          style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` }}
        >
          다시 찍기
        </button>
      </div>
    );
  }

  /* ── 분석 중 / 통과 화면 ── */
  return (
    <div className="relative flex h-full w-full flex-col bg-[#080A0F] overflow-hidden">

      {/* 배경: 인증 사진 */}
      {verificationImageUrl && (
        <>
          <img
            src={verificationImageUrl} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: isPassed ? 0.15 : 0.25, transition: "opacity 0.6s ease" }}
          />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
        </>
      )}

      {/* 글로우 */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{ background: isPassed ? "radial-gradient(ellipse at 50% 40%, rgba(52,211,153,0.22) 0%, transparent 65%)" : `radial-gradient(ellipse at 50% 40%, ${vt.bgGrad[0]}22 0%, transparent 65%)` }}
      />

      {/* 상단 바 */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/60 active:bg-white/20 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: `${vt.bgGrad[0]}25`, border: `1px solid ${vt.bgGrad[0]}40` }}>
          <span className="text-[14px]">{vt.emoji}</span>
          <span className="text-white text-[12px] font-bold">{vt.label}</span>
        </div>
        <div className="w-9" />
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 gap-6">

        {/* 사진 + 스캔 프레임 */}
        <div className="relative w-full max-w-[260px] aspect-[3/4]">
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <img
              src={verificationImageUrl ?? ""}
              alt="인증 사진"
              className="w-full h-full object-cover"
              style={{ filter: isPassed ? "none" : "brightness(0.85)" }}
            />
            <div className="absolute inset-0 rounded-3xl transition-opacity duration-700" style={{ background: "rgba(52,211,153,0.15)", opacity: isPassed ? 1 : 0 }} />
          </div>

          {/* 스캔 라인 */}
          {isAnalyzing && (
            <div
              className="absolute left-3 right-3 h-[2px] rounded-full pointer-events-none z-10"
              style={{ background: `linear-gradient(to right, transparent, ${vt.bgGrad[0]}, ${vt.bgGrad[1]}, transparent)`, boxShadow: `0 0 14px ${vt.bgGrad[0]}`, animation: "upl-scan 1.8s ease-in-out infinite" }}
            />
          )}

          {/* 모서리 브래킷 */}
          {["top-3 left-3 border-t-[2.5px] border-l-[2.5px] rounded-tl-xl", "top-3 right-3 border-t-[2.5px] border-r-[2.5px] rounded-tr-xl", "bottom-3 left-3 border-b-[2.5px] border-l-[2.5px] rounded-bl-xl", "bottom-3 right-3 border-b-[2.5px] border-r-[2.5px] rounded-br-xl"].map((cls, i) => (
            <div key={i} className={`absolute w-7 h-7 z-10 transition-all duration-500 ${cls}`} style={{ borderColor: isPassed ? "#34d399" : vt.bgGrad[0], filter: `drop-shadow(0 0 5px ${isPassed ? "#34d399" : vt.bgGrad[0]})` }} />
          ))}

          {/* 통과 아이콘 */}
          {isPassed && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_48px_rgba(52,211,153,0.6)]" style={{ background: "linear-gradient(135deg,#34d399,#059669)", animation: "upl-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* 진행률 배지 */}
          {isAnalyzing && (
            <div className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full font-black text-[13px] tabular-nums" style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})`, color: "white", boxShadow: `0 4px 12px ${vt.bgGrad[0]}66` }}>
              {progress}%
            </div>
          )}
        </div>

        {/* 상태 텍스트 */}
        <div className="text-center">
          {isPassed ? (
            <>
              <p className="text-white font-black text-[24px] mb-1">인증 완료! 🎉</p>
              <p className="text-white/50 text-[13px]">오늘의 챌린지를 달성했어요</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/60" style={{ animation: "upl-spark 1.2s ease-in-out infinite alternate" }} />
                <p className="text-white font-bold text-[16px]">{currentStage?.label ?? "최종 검토 중..."}</p>
              </div>
              <p className="text-white/40 text-[12px]">AI가 인증 사진을 분석하고 있어요</p>
            </>
          )}
        </div>

        {/* 체크리스트 */}
        {!isPassed && (
          <div className="w-full max-w-[300px] rounded-2xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
            {stages.map((stage, i) => {
              const completed = progress >= stage.until;
              const active = !completed && i === completedStages;
              return (
                <div key={stage.label} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-400"
                    style={{
                      background: completed ? "linear-gradient(135deg,#34d399,#059669)" : active ? `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` : "rgba(255,255,255,0.08)",
                      boxShadow: completed ? "0 0 10px rgba(52,211,153,0.4)" : active ? `0 0 10px ${vt.bgGrad[0]}66` : "none",
                    }}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    ) : active ? (
                      <div className="w-2 h-2 rounded-full bg-white" style={{ animation: "upl-dot 0.7s ease-in-out infinite alternate" }} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span className="text-[13px] font-semibold transition-all duration-300" style={{ color: completed ? "#34d399" : active ? "white" : "rgba(255,255,255,0.3)" }}>
                    {stage.label}
                  </span>
                  {completed && <span className="ml-auto text-[10px] text-white/25 font-medium">확인</span>}
                  {active && (
                    <div className="ml-auto flex gap-0.5">
                      {[0, 1, 2].map(j => (
                        <div key={j} className="w-1 h-1 rounded-full" style={{ background: vt.bgGrad[0], animation: `upl-dot 0.6s ease-in-out ${j * 0.2}s infinite alternate` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 진행률 바 */}
        {isAnalyzing && (
          <div className="w-full max-w-[300px]">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes upl-scan {
          0%   { top: 8%;  opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes upl-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes upl-dot {
          from { transform: scale(0.7); opacity: 0.5; }
          to   { transform: scale(1.3); opacity: 1; }
        }
        @keyframes upl-spark {
          from { opacity: 0.4; transform: rotate(-10deg) scale(0.9); }
          to   { opacity: 1;   transform: rotate(10deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
