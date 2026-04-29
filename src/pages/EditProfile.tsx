import { ChevronLeft, Camera, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { supabase } from "../lib/supabase";

export function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { setNickname } = useApp();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  const avatarUrl = profile?.avatar_url ?? null;
  const initial = (username || profile?.username || "?").charAt(0).toUpperCase();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() || null })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setNickname(username.trim() || "이름");
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate(-1);
      }, 800);
    } catch (e) {
      console.error("프로필 저장 실패:", e);
    } finally {
      setSaving(false);
    }
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
          disabled={saving}
          className="h-9 px-4 flex items-center gap-1.5 rounded-full font-bold text-[13px] transition-all active:scale-95 disabled:opacity-60"
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
              className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden"
              style={{
                border: "3px solid #FF3355",
                boxShadow: "0 0 0 3px white, 0 6px 20px rgba(255,51,85,0.2)",
                ...(avatarUrl ? { backgroundImage: `url("${avatarUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
              }}
            >
              {!avatarUrl && (
                <span className="text-3xl font-black text-slate-400">{initial}</span>
              )}
            </div>
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
        <div className="px-4 pt-5 pb-8">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">닉네임</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="닉네임 입력"
            className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-[15px] font-medium focus:outline-none focus:border-[#FF3355] transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
