import { ChevronLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("김지수");
  const [username, setUsername] = useState("jisu_kim");
  const [bio, setBio] = useState("매일 조금씩 더 나아지는 중 🌱");

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] dark:bg-black overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors -ml-1"
        >
          <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">프로필 수정</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold text-[#0066FF] px-2"
        >
          저장
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 프로필 사진 */}
        <div className="flex flex-col items-center pt-8 pb-6 px-5">
          <div className="relative mb-6">
            <div
              className="w-24 h-24 rounded-full ring-4 ring-white dark:ring-slate-800 shadow-lg bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop")',
              }}
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#0066FF] text-white rounded-full flex items-center justify-center shadow-md border-2 border-[#F2F2F7] dark:border-black">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-slate-400">사진을 탭해서 변경하세요</p>
        </div>

        {/* 입력 필드 */}
        <div className="px-4 space-y-5 pb-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">이름</p>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-slate-100/80 dark:border-white/5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-4 text-sm font-medium text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
              사용자 이름
            </p>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-slate-100/80 dark:border-white/5">
              <div className="flex items-center px-4 py-4">
                <span className="text-slate-400 text-sm font-medium mr-1">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="flex-1 text-sm font-medium text-slate-900 dark:text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
              한 줄 소개
            </p>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-slate-100/80 dark:border-white/5">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자신을 소개해보세요"
                rows={3}
                className="w-full px-4 py-4 text-sm font-medium text-slate-900 dark:text-white bg-transparent focus:outline-none resize-none"
              />
            </div>
            <p className="text-right text-xs text-slate-400 mt-1 mr-1">{bio.length}/60</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 mb-2">
              계정
            </p>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-slate-100/80 dark:border-white/5">
              <div className="px-4 py-4">
                <p className="text-sm font-medium text-slate-900 dark:text-white">jisu@example.com</p>
                <p className="text-xs text-slate-400 mt-0.5">연결된 이메일</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
