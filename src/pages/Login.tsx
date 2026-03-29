import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { signInWithEmail } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1117] relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#FF3355]/20 blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-[#FF3355]/10 blur-[60px]" />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center pt-16 pb-8 px-8">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_12px_40px_rgba(255,51,85,0.5)]"
            style={{ background: "linear-gradient(135deg, #FF3355, #cc0030)" }}
          >
            <span className="text-white font-black text-2xl tracking-tighter">챌리</span>
          </div>
          <h1 className="text-[28px] font-black text-white leading-tight text-center">
            반가워요!<br />
            <span className="text-[#FF3355]">챌리</span>에 오신 걸 환영해요
          </h1>
          <p className="text-white/40 text-[13px] font-medium mt-2 text-center">
            목표를 세우고, 함께 달성해요
          </p>
        </div>

        {/* 소셜 로그인 */}
        <div className="px-6 space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setError("소셜 로그인은 아직 준비 중이에요. 이메일 로그인을 사용해주세요.")}
            className="w-full h-14 flex items-center justify-center gap-2.5 bg-[#FEE500] hover:bg-[#FDD800] text-black font-bold text-[15px] rounded-2xl transition-all active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 3c-5.523 0-10 3.504-10 7.826 0 2.76 1.83 5.185 4.63 6.554-.35 1.32-1.27 4.86-1.31 5.02-.05.18.06.27.19.19.16-.1 5.34-3.5 7.4-4.85.36.03.73.05 1.1.05 5.523 0 10-3.504 10-7.826C24 6.504 19.523 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>

          <button
            type="button"
            onClick={() => setError("소셜 로그인은 아직 준비 중이에요. 이메일 로그인을 사용해주세요.")}
            className="w-full h-14 flex items-center justify-center gap-2.5 bg-white hover:bg-white/90 text-slate-800 font-bold text-[15px] rounded-2xl border border-white/20 transition-all active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 시작하기
          </button>

          <button
            type="button"
            onClick={() => setError("소셜 로그인은 아직 준비 중이에요. 이메일 로그인을 사용해주세요.")}
            className="w-full h-14 flex items-center justify-center gap-2.5 bg-black hover:bg-black/80 text-white font-bold text-[15px] rounded-2xl border border-white/10 transition-all active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.75 2.05.06 3.53.96 4.41 2.5-3.8 2.22-3.14 7.22.69 8.78-1.01 2.53-2.6 5.06-3.77 1.64zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple로 시작하기
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 px-6 mb-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/30 text-[12px] font-medium">또는 이메일로</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* 이메일 폼 */}
        <form onSubmit={handleLogin} className="px-6 space-y-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/[0.07] text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3355] transition-colors text-[15px]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full h-14 pl-5 pr-12 rounded-2xl border border-white/10 bg-white/[0.07] text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3355] transition-colors text-[15px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF3355, #ff5570)", boxShadow: "0 8px 24px -4px rgba(255,51,85,0.5)" }}
          >
            {loading ? "로그인 중..." : (
              <>
                로그인
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 링크 */}
        <div className="flex items-center justify-center gap-4 text-[13px] text-white/30 pb-4">
          <Link to="/forgot-password" className="hover:text-white/60 transition-colors">비밀번호 찾기</Link>
          <div className="w-px h-3 bg-white/10" />
          <Link to="/signup" className="text-[#FF3355] font-bold hover:text-[#ff5570] transition-colors">회원가입</Link>
        </div>

        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="w-full h-12 rounded-2xl border border-white/10 bg-white/[0.05] text-white/70 text-[14px] font-semibold transition-all active:scale-[0.98] hover:bg-white/[0.08]"
          >
            로그인 없이 둘러보기
          </button>
        </div>

        <p className="text-center text-[11px] text-white/15 pb-8 px-8">
          계속 진행 시 챌리의{" "}
          <button className="underline hover:text-white/30 transition-colors">서비스 약관</button>{" "}
          및{" "}
          <button className="underline hover:text-white/30 transition-colors">개인정보 처리방침</button>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
