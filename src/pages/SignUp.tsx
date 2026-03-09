import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function SignUp() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = name.trim() && email.includes("@") && password.length >= 8 && password === confirm;

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
        <div className="mb-8">
          <h1 className="text-[28px] font-black text-slate-900 dark:text-white leading-tight mb-2">
            회원가입
          </h1>
          <p className="text-[15px] text-slate-400">
            JSR과 함께 목표를 달성해보세요
          </p>
        </div>

        <div className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base focus:outline-none focus:border-[#0066FF] transition-colors"
            />
          </div>

          {/* 이메일 */}
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

          {/* 비밀번호 */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              비밀번호 (8자 이상)
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full h-14 px-4 pr-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base focus:outline-none focus:border-[#0066FF] transition-colors"
              />
              <button
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className={`w-full h-14 px-4 rounded-2xl border-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base focus:outline-none transition-colors ${
                confirm && confirm !== password
                  ? "border-red-400 focus:border-red-400"
                  : "border-slate-200 dark:border-slate-700 focus:border-[#0066FF]"
              }`}
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-400 mt-1.5 ml-1">비밀번호가 일치하지 않습니다</p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
          가입하면{" "}
          <span className="text-[#0066FF] font-semibold">이용약관</span> 및{" "}
          <span className="text-[#0066FF] font-semibold">개인정보처리방침</span>에
          동의한 것으로 간주됩니다.
        </p>
      </div>

      <div className="shrink-0 px-6 pb-8 pt-4 bg-white dark:bg-[#0A0F18] space-y-3">
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        <button
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              await signUpWithEmail(email, password, name);
              navigate("/onboarding");
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
          disabled={!isValid || loading}
          className="w-full h-14 bg-[#0066FF] disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 hover:bg-[#0052cc] active:scale-[0.98] text-white text-[17px] font-bold rounded-2xl transition-all shadow-[0_8px_20px_-4px_rgba(0,102,255,0.35)] disabled:shadow-none"
        >
          {loading ? "가입 중..." : "가입하기"}
        </button>
        <p className="text-center text-sm text-slate-400">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-[#0066FF] font-bold">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
