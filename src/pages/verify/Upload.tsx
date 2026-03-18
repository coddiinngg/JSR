import { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { CoachCharacter } from "../../components/CoachCharacter";

export function Upload() {
  const navigate = useNavigate();
  const { coachType } = useApp();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // 0 → 100% 애니메이션 후 success 이동
    const startTime = Date.now();
    const duration = 2800;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(Math.round(eased * 100));
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setDone(true);
        setTimeout(() => navigate("/success"), 400);
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [navigate]);

  return (
    <div className="relative flex h-full w-full flex-col bg-[#0F1117] overflow-hidden">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full transition-all duration-700"
          style={{
            background: done
              ? "radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,51,85,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* 닫기 */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-white font-bold text-[16px] flex-1 text-center pr-10">인증 완료</h2>
      </div>

      {/* 메인 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">

        {/* 코치 캐릭터 */}
        <div
          className="mb-4 transition-all duration-500"
          style={{
            opacity: done ? 1 : 0.85,
            transform: done ? "scale(1.05)" : "scale(1)",
          }}
        >
          <CoachCharacter
            type={coachType}
            size={80}
            animated
            talking={done}
          />
        </div>

        {/* 코치 말풍선 */}
        <div
          className="mb-6 px-4 py-2.5 rounded-2xl rounded-tl-sm border transition-all duration-500"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            opacity: progress > 20 ? 1 : 0,
            transform: progress > 20 ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <p className="text-white text-[13px] font-semibold text-center leading-snug">
            {done
              ? "그래, 잘했어! 오늘도 성공이야! 🎉"
              : progress < 50
              ? "업로드 중이야, 조금만 기다려..."
              : "거의 다 됐어! 포기하지 마!"}
          </p>
        </div>

        {/* 원형 진행바 + 이미지 */}
        <div className="relative mb-10">
          {/* SVG 진행바 */}
          <svg width={200} height={200} style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx={100} cy={100} r={88}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={8}
            />
            <circle
              cx={100} cy={100} r={88}
              fill="none"
              stroke={done ? "#34d399" : "url(#uploadGrad)"}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              style={{ transition: "stroke 0.4s ease" }}
            />
            <defs>
              <linearGradient id="uploadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF3355" />
                <stop offset="100%" stopColor="#ff6680" />
              </linearGradient>
            </defs>
          </svg>

          {/* 이미지 or 완료 아이콘 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {done ? (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #34d399, #059669)", boxShadow: "0 0 40px rgba(52,211,153,0.5)" }}
              >
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop"
                  alt="인증 사진"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* 퍼센트 (완료 전) */}
          {!done && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="absolute bottom-4 right-4 text-[#FF3355] font-black text-[15px] tabular-nums px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,51,85,0.15)", border: "1px solid rgba(255,51,85,0.25)" }}
              >
                {progress}%
              </span>
            </div>
          )}
        </div>

        {/* 텍스트 */}
        <div className="text-center space-y-2">
          <h3
            className="text-white font-black text-[22px] transition-all duration-400"
          >
            {done ? "업로드 완료! ✓" : "인증 사진 업로드 중..."}
          </h3>
          <p className="text-white/40 text-[14px] leading-relaxed">
            {done
              ? "목표 달성이 기록됐어요"
              : "잠시만 기다려 주세요.\n목표 달성을 기록하고 있습니다."}
          </p>
        </div>

        {/* 진행바 (선형) */}
        {!done && (
          <div className="w-full max-w-xs mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/30 text-[12px] font-medium">업로드 중</span>
              <span className="text-[#FF3355] text-[12px] font-bold tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #FF3355, #ff6680)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
