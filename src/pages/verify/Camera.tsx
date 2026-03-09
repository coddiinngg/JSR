import { ChevronLeft, HelpCircle, Image as ImageIcon, Zap, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Camera() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
      {/* 카메라 배경 미리보기 */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop"
          alt="카메라 미리보기"
          className="h-full w-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        {/* 비네트 오버레이 */}
        <div
          className="absolute inset-0 flex items-center justify-center p-8 bg-black/40"
          style={{
            maskImage: "radial-gradient(circle, transparent 65%, black 66%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 65%, black 66%)",
          }}
        />
        {/* 프레이밍 가이드 */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full max-w-sm aspect-[3/4] rounded-lg flex flex-col items-center justify-center relative border-2 border-dashed border-white/60">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            <span className="text-white/80 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
              여기에 맞춰주세요
            </span>
          </div>
        </div>
      </div>

      {/* 상단 네비게이션 */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center size-10 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">인증 사진 촬영</h2>
        <button className="flex items-center justify-center size-10 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {/* 안내 텍스트 */}
      <div className="relative z-10 flex flex-col items-center pt-6 px-6">
        <div className="bg-black/30 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
          <p className="text-white text-sm font-semibold tracking-wide text-center">
            인증할 대상을 사각형 안에 맞춰주세요
          </p>
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div className="mt-auto relative z-10 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* 갤러리 */}
          <button className="flex flex-col items-center gap-2 group">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 group-hover:bg-white/20 transition-all">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-white text-xs font-medium">갤러리</span>
          </button>

          {/* 셔터 버튼 */}
          <div className="relative flex items-center justify-center">
            <div className="absolute size-24 rounded-full border-4 border-white/30 animate-pulse"></div>
            <button
              onClick={() => navigate("/verify/upload")}
              className="relative flex size-20 items-center justify-center rounded-full bg-white shadow-xl hover:scale-95 transition-transform active:bg-slate-200"
            >
              <div className="size-[72px] rounded-full border-2 border-slate-200"></div>
            </button>
          </div>

          {/* 플래시 */}
          <button className="flex flex-col items-center gap-2 group">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 group-hover:bg-white/20 transition-all">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-white text-xs font-medium">플래시</span>
          </button>
        </div>

        {/* JSR 브랜딩 */}
        <div className="mt-8 flex justify-center opacity-40">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">JSR 보안 인증</span>
          </div>
        </div>
      </div>
    </div>
  );
}
