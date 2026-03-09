import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-white dark:bg-slate-900 m-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">

        {/* 로고 */}
        <div className="w-20 h-20 bg-[#0066FF] rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-[#0066FF]/30">
          <span className="text-white font-black text-2xl tracking-tighter">JSR</span>
        </div>

        {/* 환영 문구 */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">환영합니다</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">서비스 이용을 위해 로그인해주세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="w-full space-y-5 mb-8">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@jsr.com"
              className="w-full h-14 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full h-14 pl-5 pr-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-2 bg-[#0066FF] hover:bg-[#0052cc] disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold rounded-2xl shadow-[0_8px_20px_-4px_rgba(0,102,255,0.35)] disabled:shadow-none transition-all active:scale-[0.98]"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 링크 */}
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link to="/forgot-password" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">비밀번호 찾기</Link>
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700"></div>
          <Link to="/signup" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-semibold text-[#0066FF]">회원가입</Link>
        </div>

        {/* 구분선 */}
        <div className="w-full flex items-center gap-4 mb-8">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          <span className="text-xs text-slate-400 font-medium">또는</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        </div>

        {/* 소셜 로그인 */}
        <div className="w-full space-y-3">
          <button type="button" className="w-full h-14 flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-bold rounded-2xl transition-all active:scale-[0.98]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 3c-5.523 0-10 3.504-10 7.826 0 2.76 1.83 5.185 4.63 6.554-.35 1.32-1.27 4.86-1.31 5.02-.05.18.06.27.19.19.16-.1 5.34-3.5 7.4-4.85.36.03.73.05 1.1.05 5.523 0 10-3.504 10-7.826C24 6.504 19.523 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>

          <button type="button" className="w-full h-14 flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white font-bold rounded-2xl transition-all active:scale-[0.98]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.75 2.05.06 3.53.96 4.41 2.5-3.8 2.22-3.14 7.22.69 8.78-1.01 2.53-2.6 5.06-3.77 1.64zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple로 로그인
          </button>

          <button type="button" className="w-full h-14 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google 계정으로 로그인
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          계속 진행함으로써 JSR의{" "}
          <button className="underline hover:text-slate-600">서비스 약관</button> 및{" "}
          <button className="underline hover:text-slate-600">개인정보 처리방침</button>에 동의하게 됩니다.
        </div>

        <div className="mt-5 text-center">
          <Link to="/onboarding" className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors">
            앱 소개 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
