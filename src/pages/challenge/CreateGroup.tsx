import { useState } from "react";
import { ChevronLeft, ArrowRight, Check, Users, Calendar, Activity, BookOpen, Apple, Sparkles, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const CATEGORIES = [
  { id: "생활",  icon: Sparkles,  color: "#A855F7", bg: "#F5F3FF", label: "생활" },
  { id: "운동",  icon: Activity,  color: "#F97316", bg: "#FFF7ED", label: "운동" },
  { id: "식단",  icon: Apple,     color: "#22C55E", bg: "#F0FDF4", label: "식단" },
  { id: "학습",  icon: BookOpen,  color: "#3B82F6", bg: "#EFF6FF", label: "학습" },
  { id: "근력",  icon: Dumbbell,  color: "#EF4444", bg: "#FEF2F2", label: "근력" },
];

const FREQ_OPTIONS = [
  { id: "daily",   label: "매일",    desc: "하루도 빠짐없이" },
  { id: "weekdays", label: "주 5일",  desc: "평일만 진행" },
  { id: "3x",      label: "주 3회",  desc: "자유롭게 3회" },
  { id: "weekly",  label: "주 1회",  desc: "매주 한 번" },
];

const MAX_MEMBERS_OPTIONS = [5, 10, 20, 50];

type Step = 1 | 2 | 3;

export function CreateGroup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("운동");
  const [freq, setFreq] = useState("daily");
  const [maxMembers, setMaxMembers] = useState(10);
  const [rule, setRule] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);

  const canNext1 = title.trim().length >= 2 && desc.trim().length >= 5;
  const canNext2 = freq !== "";
  const canCreate = canNext1 && canNext2;

  const handleCreate = () => {
    if (!canCreate) return;
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setDone(true);
      setTimeout(() => navigate("/challenge"), 1800);
    }, 1200);
  };

  if (done) {
    return (
      <div className="flex flex-col h-full bg-[#0F1117] items-center justify-center px-8 text-center">
        <div
          className="w-24 h-24 rounded-3xl mb-6 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FF3355, #CC0030)", boxShadow: "0 16px 40px rgba(255,51,85,0.4)", animation: "cg-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        <h2 className="text-[26px] font-black text-white mb-2">그룹 생성 완료!</h2>
        <p className="text-white/50 text-[14px] leading-relaxed">
          <span className="text-white font-bold">{title}</span> 그룹이 만들어졌어요.<br />
          친구들을 초대해 함께 도전해보세요!
        </p>
        <style>{`@keyframes cg-pop{0%{opacity:0;transform:scale(0.5);}60%{transform:scale(1.15);}100%{opacity:1;transform:scale(1);}}`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1117] text-white overflow-hidden">
      <style>{`
        @keyframes cg-fade { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
      `}</style>

      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-12 pb-3 z-10">
        <button
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[13px] font-semibold text-white/40 tracking-widest uppercase">{step} / 3</span>
        <div className="w-10" />
      </div>

      {/* 스텝 바 */}
      <div className="shrink-0 flex gap-1.5 px-5 pb-1 z-10">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: i <= step ? "#FF3355" : "rgba(255,255,255,0.15)" }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 space-y-5" style={{ animation: "cg-fade 0.35s ease both" }}>

        {step === 1 && (
          <>
            {/* Step 1: 기본 정보 */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">그룹 만들기</p>
              <h1 className="text-[26px] font-black leading-tight">어떤 그룹을<br />만드시나요?</h1>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2 block">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ id, icon: Icon, color, bg, label }) => (
                  <button
                    key={id}
                    onClick={() => setCategory(id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 transition-all text-[13px] font-bold",
                      category === id
                        ? "border-[#FF3355] bg-[#FF3355]/15 text-white"
                        : "border-white/10 bg-white/5 text-white/60"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 그룹 이름 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">그룹 이름</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="예: 새벽 미라클 모닝"
                maxLength={30}
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-[15px] font-semibold text-white placeholder:text-white/30 focus:border-[#FF3355] focus:outline-none transition-colors"
              />
              <div className="text-right text-[11px] text-white/30 mt-1">{title.length}/30</div>
            </div>

            {/* 그룹 소개 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">그룹 소개</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="그룹에 대해 간단히 소개해주세요"
                maxLength={100}
                rows={3}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-[15px] font-semibold text-white placeholder:text-white/30 focus:border-[#FF3355] focus:outline-none transition-colors resize-none leading-relaxed"
              />
              <div className="text-right text-[11px] text-white/30 mt-1">{desc.length}/100</div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2: 규칙 설정 */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">그룹 규칙</p>
              <h1 className="text-[26px] font-black leading-tight">어떻게<br />진행할까요?</h1>
            </div>

            {/* 빈도 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2 block">달성 빈도</label>
              <div className="space-y-2">
                {FREQ_OPTIONS.map(({ id, label, desc: d }) => (
                  <button
                    key={id}
                    onClick={() => setFreq(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all",
                      freq === id
                        ? "border-[#FF3355] bg-[#FF3355]/10"
                        : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      freq === id ? "border-[#FF3355] bg-[#FF3355]" : "border-white/20"
                    )}>
                      {freq === id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={cn("text-[14px] font-bold", freq === id ? "text-white" : "text-white/70")}>{label}</p>
                      <p className="text-[12px] text-white/40">{d}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 최대 인원 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2 block">최대 인원</label>
              <div className="flex gap-2">
                {MAX_MEMBERS_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setMaxMembers(n)}
                    className={cn(
                      "flex-1 h-12 rounded-2xl border-2 text-[14px] font-bold transition-all",
                      maxMembers === n
                        ? "border-[#FF3355] bg-[#FF3355]/15 text-white"
                        : "border-white/10 bg-white/5 text-white/50"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {n}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 인증 규칙 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">인증 방법 (선택)</label>
              <input
                type="text"
                value={rule}
                onChange={e => setRule(e.target.value)}
                placeholder="예: 매일 사진 업로드"
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-[15px] font-semibold text-white placeholder:text-white/30 focus:border-[#FF3355] focus:outline-none transition-colors"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Step 3: 확인 */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3355]/70 mb-1.5">마지막 확인</p>
              <h1 className="text-[26px] font-black leading-tight">그룹 정보를<br />확인해주세요</h1>
            </div>

            {/* 요약 카드 */}
            <div className="rounded-[24px] border border-white/15 bg-white/8 p-5 space-y-4 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${CATEGORIES.find(c => c.id === category)?.bg ?? "#F8F8F8"}20` }}>
                  {(() => {
                    const cat = CATEGORIES.find(c => c.id === category);
                    if (!cat) return null;
                    const Icon = cat.icon;
                    return <Icon className="w-5 h-5" style={{ color: cat.color }} />;
                  })()}
                </div>
                <div>
                  <p className="text-[11px] text-white/40 mb-0.5">{category}</p>
                  <h3 className="text-[18px] font-black text-white">{title}</h3>
                </div>
              </div>

              <p className="text-[13px] text-white/60 leading-relaxed border-t border-white/10 pt-4">{desc}</p>

              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                {[
                  { icon: Calendar, label: "빈도", value: FREQ_OPTIONS.find(f => f.id === freq)?.label ?? "" },
                  { icon: Users,    label: "최대 인원", value: `${maxMembers}명` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/[0.07] rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-[#FF3355]" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-[14px] font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* 공개/비공개 */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-[14px] font-bold text-white">비공개 그룹</p>
                  <p className="text-[12px] text-white/40">초대 링크로만 참여 가능</p>
                </div>
                <button
                  onClick={() => setIsPrivate(v => !v)}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
                    isPrivate ? "bg-[#FF3355]" : "bg-white/20"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200",
                    isPrivate ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="shrink-0 px-5 pb-10 pt-4 z-10">
        {step < 3 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            disabled={step === 1 ? !canNext1 : !canNext2}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-[17px] font-black text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)",
              backgroundSize: "200% auto",
              animation: "anim-gradient-x 3s linear infinite",
              boxShadow: "0 16px 30px -10px rgba(255,51,85,0.65)",
            }}
          >
            다음
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-[17px] font-black text-white transition-all active:scale-[0.98] disabled:opacity-70"
            style={{
              background: creating ? "#666" : "linear-gradient(110deg,#FF3355,#FF6A63,#FF3355)",
              backgroundSize: "200% auto",
              boxShadow: creating ? "none" : "0 16px 30px -10px rgba(255,51,85,0.65)",
            }}
          >
            {creating ? "생성 중..." : (
              <>
                <Check className="w-5 h-5" />
                그룹 만들기
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
