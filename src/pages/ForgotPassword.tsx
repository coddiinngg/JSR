import { ChevronLeft, Mail, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0F18] overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors -ml-1"
        >
          <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {!sent ? (
          <>
            {/* 아이콘 */}
            <div className="w-16 h-16 bg-[#EEF4FF] dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-[#0066FF]" />
            </div>

            <h1 className="text-[28px] font-black text-slate-900 dark:text-white leading-tight mb-2">
              비밀번호 찾기
            </h1>
            <p className="text-[15px] text-slate-400 mb-8 leading-relaxed">
              가입 시 사용한 이메일을 입력하면<br />
              비밀번호 재설정 링크를 보내드릴게요.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base focus:outline-none focus:border-[#0066FF] transition-colors"
              />
            </div>
          </>
        ) : (
          /* 전송 완료 상태 */
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              이메일을 보냈어요!
            </h2>
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-[260px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{email}</span>으로
              재설정 링크를 보냈습니다.<br />메일함을 확인해주세요.
            </p>
            <p className="text-xs text-slate-400 mt-6">
              메일이 오지 않으면 스팸함을 확인하거나<br />
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 px-6 pb-8 pt-4 bg-white dark:bg-[#0A0F18]">
        {!sent ? (
          <button
            onClick={() => setSent(true)}
            disabled={!email.includes("@")}
            className="w-full h-14 bg-[#0066FF] disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 hover:bg-[#0052cc] active:scale-[0.98] text-white text-[17px] font-bold rounded-2xl transition-all shadow-[0_8px_20px_-4px_rgba(0,102,255,0.35)] disabled:shadow-none"
          >
            재설정 링크 보내기
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[17px] font-bold rounded-2xl transition-all hover:bg-slate-200 active:scale-[0.98]"
          >
            로그인으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}
