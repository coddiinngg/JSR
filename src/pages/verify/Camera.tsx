import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { ChevronLeft, Image as ImageIcon, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";
import { VERIFY_TYPES, type VerifyTypeKey } from "../../lib/verifyTypes";

/* 인증 타입별 배경 이미지 */
const TYPE_BG: Record<VerifyTypeKey, string> = {
  step_walk:      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&fit=crop&q=80",
  run_scenery:    "https://images.unsplash.com/photo-1694903089438-b5f75f66b7e7?w=800&fit=crop&q=80",
  quote_photo:    "https://images.unsplash.com/photo-1687360440434-9b1407c5e04c?w=800&fit=crop&q=80",
  book_cover:     "https://images.unsplash.com/photo-1695653422902-c52a1b3ba5be?w=800&fit=crop&q=80",
  celeb_pose:     "https://images.unsplash.com/photo-1698038136041-e1e0d23e2d44?w=800&fit=crop&q=80",
  location_photo: "https://images.unsplash.com/photo-1693411974501-a9c2d1b4a0ee?w=800&fit=crop&q=80",
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

  const MAX_FILE_BYTES = 30 * 1024 * 1024;

  function handleFilePick(event: ChangeEvent<HTMLInputElement>) {
    if (scanning) return;
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
        style={{ opacity: 0.45 }}
        referrerPolicy="no-referrer"
      />

      {/* 그라디언트 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.75) 100%)" }}
      />

      {/* ── 상단 바 ── */}
      <div className="relative z-10 flex items-center px-4 pt-5 pb-3 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white active:bg-black/50 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[17px] leading-none">{vt.emoji}</span>
            <span className="text-white font-black text-[15px]">{vt.label}</span>
          </div>
          <p className="text-white/45 text-[11px] mt-0.5">{vt.desc}</p>
        </div>
      </div>

      {/* ── 카메라 프레임 ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 gap-5">
        <div className={`relative w-full max-w-[280px] ${
          vt.frameAspect === "square" ? "aspect-square"
          : vt.frameAspect === "landscape" ? "aspect-[4/3]"
          : "aspect-[3/4]"
        }`}>
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
              style={{ borderColor: "#FF3355", filter: "drop-shadow(0 0 6px rgba(255,51,85,0.6))" }}
            />
          ))}

          {/* 스캔 라인 */}
          <div
            className="absolute left-2 right-2 h-[2px] rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(to right, transparent, #FF3355, transparent)",
              boxShadow: "0 0 12px #FF3355",
              animation: "cam-scan 2.4s ease-in-out infinite",
              top: "10%",
            }}
          />

          {/* AI 스캔 중 오버레이 */}
          {scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#FF3355,#FF6680)", animation: "cam-pulse 0.8s ease-in-out infinite alternate" }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <p className="text-white font-bold text-[14px]">AI 인증 중…</p>
            </div>
          )}

          {/* 힌트 pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
            <div
              className="px-4 py-1.5 rounded-full text-white text-[12px] font-semibold"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {vt.hint}
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 컨트롤 ── */}
      <div className="relative z-10 pb-12 px-8">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {/* 갤러리 */}
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="flex w-14 h-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 group-active:bg-white/25 transition-all">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-white/55 text-[11px] font-medium">갤러리</span>
          </button>

          {/* 셔터 */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-[92px] h-[92px] rounded-full"
              style={{ border: "2.5px solid rgba(255,51,85,0.45)", animation: "cam-ring 2s ease-in-out infinite" }}
            />
            <button
              onClick={handleShutter}
              className="relative flex w-[76px] h-[76px] items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] active:scale-90 transition-transform"
            >
              <div
                className="w-[64px] h-[64px] rounded-full"
                style={{ background: "linear-gradient(135deg,#FF3355,#FF6680)", opacity: 0.18 }}
              />
            </button>
          </div>

          {/* 빈 자리 (밸런스) */}
          <div className="w-14" />
        </div>
      </div>

      {/* 애니메이션 CSS */}
      <style>{`
        @keyframes cam-scan {
          0%   { top: 10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
        @keyframes cam-ring {
          0%, 100% { transform: scale(1);   opacity: 0.5; }
          50%       { transform: scale(1.1); opacity: 0.9; }
        }
        @keyframes cam-pulse {
          from { transform: scale(0.95); }
          to   { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
