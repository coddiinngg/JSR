import { ChevronLeft, Camera, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("김지수");
  const [nickname, setNickname] = useState("jisu_kim");
  const [bio, setBio] = useState("매일 조금씩 더 나아지는 중 🌱");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate(-1);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6FA] overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-slate-100">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-[17px] font-black text-slate-900">프로필 수정</h1>
        <button
          onClick={handleSave}
          className="h-9 px-4 flex items-center gap-1.5 rounded-full font-bold text-[13px] transition-all active:scale-95"
          style={{
            background: saved ? "#22c55e" : "linear-gradient(135deg, #FF3355, #ff5570)",
            color: "white",
          }}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? "저장됨" : "저장"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 프로필 사진 */}
        <div className="flex flex-col items-center pt-8 pb-6 bg-white border-b border-slate-100">
          <div className="relative mb-3">
            <div
              className="w-24 h-24 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop")',
                border: "3px solid #FF3355",
                boxShadow: "0 0 0 3px white, 0 6px 20px rgba(255,51,85,0.2)",
              }}
            />
            <button
              className="absolute bottom-0 right-0 w-9 h-9 flex items-center justify-center rounded-full border-2 border-white shadow-lg text-white"
              style={{ background: "linear-gradient(135deg, #FF3355, #ff5570)" }}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[12px] text-slate-400 font-medium">탭해서 사진 변경</p>
        </div>

        {/* 입력 필드 */}
        <div className="px-4 pt-5 space-y-4 pb-8">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-[15px] font-medium focus:outline-none focus:border-[#FF3355] transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">닉네임</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[15px] font-medium">@</span>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full h-14 pl-9 pr-5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-[15px] font-medium focus:outline-none focus:border-[#FF3355] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">한 줄 소개</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={80}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-[15px] font-medium focus:outline-none focus:border-[#FF3355] transition-colors resize-none"
            />
            <p className="text-[11px] text-slate-300 text-right mt-1 mr-1">{bio.length}/80</p>
          </div>

        </div>
      </div>
    </div>
  );
}
