import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { ChevronLeft, Image as ImageIcon, Zap, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";

/* 인증 타입별 배경 이미지 */
const TYPE_BG: Record<VerifyTypeKey, string> = {
  step_walk:      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&fit=crop&q=80",
  run_scenery:    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&fit=crop&q=80",
  quote_photo:    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&q=80",
  book_cover:     "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop&q=80",
  celeb_pose:     "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&fit=crop&q=80",
  location_photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&fit=crop&q=80",
};

/* 타입별 오늘 인증 인원 (목업) */
const TODAY_COUNT: Record<VerifyTypeKey, number> = {
  step_walk: 24, run_scenery: 11, quote_photo: 8,
  book_cover: 15, celeb_pose: 31, location_photo: 6,
};

export function Camera() {
  const navigate = useNavigate();
  const { verifyType, setVerificationImage } = useApp();
  const captureInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState(false);
  const [scanning, setScanning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const key = (verifyType as VerifyTypeKey) ?? "step_walk";
  const vt = VERIFY_TYPES[key] ?? VERIFY_TYPES["step_walk"];
  const bgImg = TYPE_BG[key];
  const todayCount = TODAY_COUNT[key];

  const MAX_FILE_BYTES = 30 * 1024 * 1024; // 30MB

  function handleFilePick(event: ChangeEvent<HTMLInputElement>) {
    if (scanning) return; // 스캔 중 재선택 방지
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있어요.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      alert("파일 크기가 너무 큽니다. 30MB 이하 이미지를 사용해주세요.");
      return;
    }

    setVerificationImage(file);
    setScanning(true);
    timerRef.current = setTimeout(() => navigate("/verify/upload"), 900);
  }

  function handleShutter() {
    if (scanning) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    captureInputRef.current?.click();
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
      {/* 파일 인풋 */}
      <input ref={captureInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFilePick} />
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />

      {/* 셔터 플래시 오버레이 */}
      <div
        className="absolute inset-0 z-50 pointer-events-none bg-white transition-opacity duration-200"
        style={{ opacity: flash ? 0.7 : 0 }}
      />

      {/* 배경 이미지 */}
      <img
        src={bgImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.55 }}
        referrerPolicy="no-referrer"
      />

      {/* 그라디언트 오버레이 — 상단·하단 어둡게 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 65%, rgba(0,0,0,0.80) 100%)",
        }}
      />

      {/* ── 상단 바 ── */}
      <div className="relative z-10 flex items-center px-4 pt-4 pb-3 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white active:bg-black/50 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 타입 정보 */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] leading-none">{vt.emoji}</span>
            <span className="text-white font-black text-[15px]">{vt.label}</span>
          </div>
          <p className="text-white/50 text-[11px] mt-0.5">{vt.desc}</p>
        </div>

        {/* 오늘 인증 수 */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]}cc,${vt.bgGrad[1]}cc)`, backdropFilter: "blur(8px)" }}
        >
          <Users className="w-3 h-3 text-white" />
          <span className="text-white text-[11px] font-bold">{todayCount}명 완료</span>
        </div>
      </div>

      {/* ── 카메라 프레임 ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className={`relative w-full max-w-[300px] ${vt.frameAspect === "square" ? "aspect-square" : vt.frameAspect === "landscape" ? "aspect-[4/3]" : "aspect-[3/4]"}`}>
          {/* 모서리 브래킷 */}
          {[
            "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl",
            "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl",
            "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
            "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 ${cls}`}
              style={{ borderColor: vt.bgGrad[0], filter: `drop-shadow(0 0 6px ${vt.bgGrad[0]}aa)` }}
            />
          ))}

          {/* 스캔 라인 */}
          <div
            className="absolute left-2 right-2 h-[2px] rounded-full pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent, ${vt.bgGrad[0]}, transparent)`,
              boxShadow: `0 0 12px ${vt.bgGrad[0]}`,
              animation: "cam-scan 2.4s ease-in-out infinite",
              top: "10%",
            }}
          />

          {/* AI 스캔 중 오버레이 */}
          {scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})`, animation: "cam-pulse 0.8s ease-in-out infinite alternate" }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <p className="text-white font-bold text-[14px]">AI 인증 중…</p>
            </div>
          )}

          {/* 힌트 pill — 프레임 하단 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div
              className="px-4 py-1.5 rounded-full text-white text-[12px] font-semibold"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {vt.hint}
            </div>
          </div>
        </div>
      </div>

      {/* ── 팁 배너 ── */}
      <div className="relative z-10 mx-5 mb-3">
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
          style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]}22,${vt.bgGrad[1]}11)`, border: `1px solid ${vt.bgGrad[0]}44`, backdropFilter: "blur(12px)" }}
        >
          <span className="text-[16px] shrink-0">💡</span>
          <p className="text-white/80 text-[12px] font-medium leading-tight">{vt.tip}</p>
        </div>
      </div>

      {/* ── AI 체크 항목 chips ── */}
      <div className="relative z-10 mx-5 mb-2 flex flex-wrap gap-1.5">
        {vt.checklist.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white/70 text-[10px] font-semibold"
            style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: vt.bgGrad[0] }} />
            {item}
          </div>
        ))}
      </div>

      {/* ── 가이드 스텝 (compact) ── */}
      <div className="relative z-10 mx-5 mb-4 flex gap-2">
        {vt.guide.map((step, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-center"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
              style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})` }}
            >
              {i + 1}
            </div>
            <p className="text-white/65 text-[9px] leading-tight">{step}</p>
          </div>
        ))}
      </div>

      {/* ── 하단 컨트롤 ── */}
      <div className="relative z-10 pb-10 px-8">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {/* 갤러리 */}
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 group-active:bg-white/25 transition-all">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-white/60 text-[11px] font-medium">갤러리</span>
          </button>

          {/* 셔터 */}
          <div className="relative flex items-center justify-center">
            {/* 외부 링 — 인증 타입 색상 */}
            <div
              className="absolute w-[88px] h-[88px] rounded-full opacity-40"
              style={{ border: `3px solid ${vt.bgGrad[0]}`, animation: "cam-ring 2s ease-in-out infinite" }}
            />
            <button
              onClick={handleShutter}
              className="relative flex w-[72px] h-[72px] items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] active:scale-90 transition-transform"
            >
              {/* 컬러 내부 원 */}
              <div
                className="w-[60px] h-[60px] rounded-full"
                style={{ background: `linear-gradient(135deg,${vt.bgGrad[0]},${vt.bgGrad[1]})`, opacity: 0.15 }}
              />
            </button>
          </div>

          {/* 플래시 */}
          <button className="flex flex-col items-center gap-2 group">
            <div className="flex w-12 h-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 group-active:bg-white/25 transition-all">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-white/60 text-[11px] font-medium">플래시</span>
          </button>
        </div>
      </div>

      {/* 스캔 라인·링 애니메이션 CSS */}
      <style>{`
        @keyframes cam-scan {
          0%   { top: 10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
        @keyframes cam-ring {
          0%, 100% { transform: scale(1);   opacity: 0.35; }
          50%       { transform: scale(1.1); opacity: 0.6;  }
        }
        @keyframes cam-pulse {
          from { transform: scale(0.95); }
          to   { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
