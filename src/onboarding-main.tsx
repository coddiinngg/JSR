import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { Onboarding } from './pages/Onboarding';
import './index.css';

function Done() {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-5 bg-white">
      <div className="text-6xl" style={{ animation: "pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🎉</div>
      <style>{`@keyframes pop{from{opacity:0;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}`}</style>
      <div className="text-center">
        <p className="text-[20px] font-black text-slate-900">온보딩 완료!</p>
        <p className="text-[13px] text-slate-400 mt-1">실제 앱에서는 홈으로 이동해요</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-2xl font-bold text-[15px] text-white active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg,#FF3355,#C8002B)", boxShadow: "0 8px 24px rgba(255,51,85,0.3)" }}
      >
        처음부터 다시 보기
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/"           element={<Done />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    </AuthProvider>
  </StrictMode>,
);
