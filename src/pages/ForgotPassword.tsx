import { ChevronLeft, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPasswordWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email.includes("@")) return;
    setError("");
    setLoading(true);
    try {
      await resetPasswordWithEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이메일 전송에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F1117] overflow-hidden relative">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FF3355]/12 blur-[60px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 dark:hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FF3355]/06 blur-[60px]" />
      </div>

      {/* 헤더 */}
      <div className="shrink-0 flex items-center px-4 pt-4 pb-3 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 relative z-10">
        {!sent ? (
          <>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(255,51,85,0.15)", border: "1.5px solid rgba(255,51,85,0.3)" }}
            >
              <Mail className="w-8 h-8 text-[#FF3355]" />
            </div>

            <h1 className="text-[28px] font-black text-slate-900 dark:text-white leading-tight mb-2">비밀번호 찾기</h1>
            <p className="text-slate-400 dark:text-white/40 text-[14px] mb-8 leading-relaxed">
              가입 시 사용한 이메일을 입력하면<br />
              비밀번호 재설정 링크를 보내드릴게요.
            </p>

            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-2 block">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@chally.app"
                className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.07] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-[#FF3355] transition-colors text-[15px]"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!email.includes("@") || loading}
              className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl font-bold text-[15px] text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={email.includes("@") ? {
                background: "linear-gradient(135deg, #FF3355, #ff5570)",
                boxShadow: "0 8px 24px -4px rgba(255,51,85,0.5)",
              } : { background: "rgba(128,128,128,0.15)" }}
            >
              {loading ? "전송 중..." : (
                <>
                  이메일 전송
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {error && (
              <p className="mt-3 text-center text-[13px] text-red-400">{error}</p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{
                background: "linear-gradient(135deg, #34d399, #059669)",
                boxShadow: "0 12px 40px rgba(52,211,153,0.4)",
              }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-[24px] font-black text-slate-900 dark:text-white mb-3">이메일을 보냈어요!</h2>
            <p className="text-slate-500 dark:text-white/40 text-[14px] leading-relaxed mb-2">
              <span className="text-slate-800 dark:text-white/70 font-semibold">{email}</span>
            </p>
            <p className="text-slate-400 dark:text-white/30 text-[13px] leading-relaxed mb-10">
              받은 편지함을 확인해주세요.<br />
              메일이 안 보이면 스팸함을 확인해보세요.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="h-14 px-8 rounded-2xl font-bold text-[15px] text-white active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(135deg, #FF3355, #ff5570)",
                boxShadow: "0 8px 24px -4px rgba(255,51,85,0.5)",
              }}
            >
              로그인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
