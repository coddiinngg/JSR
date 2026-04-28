import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { isGuestMode } from "../App";

interface GuestGuardContextType {
  /** 게스트면 모달 표시 후 fn 실행 안 함. 로그인 유저면 fn 실행. */
  guardAction: (fn: () => void) => void;
}

const GuestGuardContext = createContext<GuestGuardContextType | null>(null);

export function GuestGuardProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  function guardAction(fn: () => void) {
    if (isGuestMode()) { setShow(true); return; }
    fn();
  }

  return (
    <GuestGuardContext.Provider value={{ guardAction }}>
      {children}

      {show && (
        <div
          className="fixed inset-0 z-[200] flex items-end"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShow(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl px-6 pt-6 pb-10"
            style={{ animation: "gg-up 0.26s cubic-bezier(0.22,1,0.36,1) both" }}
            onClick={e => e.stopPropagation()}
          >
            <style>{`@keyframes gg-up{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900">로그인이 필요해요</h3>
                <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                  인증, 참여, 기록 등 모든 기능은<br />로그인 후 이용할 수 있어요
                </p>
              </div>
              <button
                onClick={() => setShow(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => { setShow(false); navigate("/login"); }}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-[15px] active:scale-[0.97] transition-transform"
              >
                로그인하기
              </button>
              <button
                onClick={() => { setShow(false); navigate("/signup"); }}
                className="w-full py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-[15px] active:scale-[0.97] transition-transform"
              >
                회원가입
              </button>
              <button
                onClick={() => setShow(false)}
                className="w-full py-2.5 text-slate-400 text-[14px]"
              >
                계속 둘러보기
              </button>
            </div>
          </div>
        </div>
      )}
    </GuestGuardContext.Provider>
  );
}

export function useGuestGuard() {
  const ctx = useContext(GuestGuardContext);
  if (!ctx) throw new Error("useGuestGuard must be used within GuestGuardProvider");
  return ctx;
}
