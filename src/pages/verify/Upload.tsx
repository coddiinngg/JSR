import { X, CloudUpload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function Upload() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/success");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex h-full w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display">
      {/* 헤더 */}
      <div className="flex items-center bg-transparent p-4 pb-2 justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-[#0066FF]/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          인증 완료
        </h2>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col flex-1 items-center justify-center p-8 text-center">
        <div className="relative mb-12 flex items-center justify-center">
          {/* 원형 진행 배경 */}
          <div className="size-48 rounded-full border-[6px] border-[#0066FF]/10 flex items-center justify-center relative">
            {/* 회전 스피너 */}
            <div className="absolute inset-0 size-full rounded-full border-[6px] border-transparent border-t-[#0066FF] border-r-[#0066FF]/40 animate-spin"></div>
            {/* 이미지 미리보기 */}
            <div className="size-36 overflow-hidden rounded-full opacity-60">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop"
                alt="인증 사진 미리보기"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          {/* 아이콘 배지 */}
          <div className="absolute bottom-2 right-2 size-12 bg-[#0066FF] rounded-full flex items-center justify-center shadow-lg border-4 border-background-light dark:border-background-dark">
            <CloudUpload className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-4 max-w-xs">
          <div className="space-y-2">
            <h3 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">인증 사진 업로드 중...</h3>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-32 bg-[#0066FF]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#0066FF] rounded-full" style={{ width: "65%" }}></div>
              </div>
              <span className="text-[#0066FF] text-sm font-bold">65%</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
            잠시만 기다려 주세요.<br />
            목표 달성을 기록하고 있습니다.
          </p>
        </div>
      </div>

      <div className="h-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0066FF]/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}
