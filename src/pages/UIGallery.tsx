import { useState, useEffect } from "react";
import { ExternalLink, X } from "lucide-react";

const SCALE = 0.44;
const FRAME_W = 390;
const FRAME_H = 844;

interface PageDef {
  title: string;
  path: string;
  emoji: string;
  note?: string;
}

interface Group {
  label: string;
  pages: PageDef[];
}

const GROUPS: Group[] = [
  {
    label: "🔐 공개",
    pages: [
      { title: "로그인",         path: "/login",               emoji: "🔐" },
      { title: "회원가입",       path: "/signup",              emoji: "📝" },
      { title: "비밀번호 찾기",  path: "/forgot-password",     emoji: "🔑" },
    ],
  },
  {
    label: "🏠 바텀 네비",
    pages: [
      { title: "홈",     path: "/",          emoji: "🏠" },
      { title: "챌린지", path: "/challenge", emoji: "🎯" },
      { title: "통계",   path: "/stats",     emoji: "📊" },
      { title: "프로필", path: "/profile",   emoji: "👤" },
    ],
  },
  {
    label: "📸 인증 흐름",
    pages: [
      { title: "인증 방법 선택",  path: "/verify/select",           emoji: "📋" },
      { title: "인증 가이드",     path: "/verify/guide/step_walk",  emoji: "📖" },
      { title: "카메라",          path: "/verify/camera",           emoji: "📷" },
      { title: "업로드 & AI 판정",path: "/verify/upload",           emoji: "🤖", note: "이미지 없으면 빈 상태" },
      { title: "인증 완료",       path: "/success",                 emoji: "✅", note: "직접 접근 시 홈으로 이동" },
    ],
  },
  {
    label: "👥 그룹 & 챌린지",
    pages: [
      { title: "그룹 상세",    path: "/challenge/group/1",          emoji: "👥" },
      { title: "활동 사진",    path: "/challenge/group/1/activity", emoji: "🖼️" },
      { title: "챌린지 건의",  path: "/challenge/request",          emoji: "💡" },
    ],
  },
  {
    label: "🏅 리워드 & 기록",
    pages: [
      { title: "리워드",       path: "/rewards",             emoji: "🏅" },
      { title: "갤러리",       path: "/gallery",             emoji: "🖼️" },
      { title: "주간 리포트",  path: "/stats/weekly-report", emoji: "📈" },
      { title: "전체 피드",    path: "/feed",                emoji: "📰" },
    ],
  },
  {
    label: "🔔 알림 & 설정",
    pages: [
      { title: "알림",         path: "/notifications",         emoji: "🔔" },
      { title: "알림 설정",    path: "/settings/notifications",emoji: "⚙️" },
      { title: "프로필 편집",  path: "/profile/edit",          emoji: "✏️" },
    ],
  },
  {
    label: "🎉 온보딩 & 기타",
    pages: [
      { title: "온보딩",       path: "/onboarding",   emoji: "🎉" },
      { title: "친구 초대",    path: "/friends/invite",emoji: "🔗" },
      { title: "유저 프로필",  path: "/user/alice",   emoji: "🙋" },
    ],
  },
];

function PhoneFrame({ page, base, onClick }: { page: PageDef; base: string; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const src = `${base}${page.path}?preview=1`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 프레임 wrapper */}
      <button
        onClick={onClick}
        className="group relative cursor-pointer"
        style={{ width: FRAME_W * SCALE, height: FRAME_H * SCALE }}
      >
        {/* 폰 외곽 */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden"
          style={{
            border: "2px solid rgba(255,255,255,0.15)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            background: "#111",
          }}
        >
          {/* 노치 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-2xl z-10" />
          {/* iframe */}
          <iframe
            src={src}
            title={page.title}
            style={{
              width: FRAME_W,
              height: FRAME_H,
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
              border: "none",
              pointerEvents: "none",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F1117]">
              <div className="w-6 h-6 rounded-full border-2 border-[#FF3355]/40 border-t-[#FF3355] animate-spin" />
            </div>
          )}
        </div>
        {/* hover 오버레이 */}
        <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          style={{ background: "rgba(255,51,85,0.18)", backdropFilter: "blur(2px)" }}>
          <div className="bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
            <ExternalLink className="w-3.5 h-3.5" />
            전체화면
          </div>
        </div>
      </button>

      {/* 레이블 */}
      <div className="text-center">
        <p className="text-white font-bold text-[12px]">{page.emoji} {page.title}</p>
        <p className="text-white/30 text-[10px] font-mono mt-0.5">{page.path}</p>
        {page.note && <p className="text-amber-400/70 text-[9px] mt-0.5">{page.note}</p>}
      </div>
    </div>
  );
}

function FullscreenModal({ page, base, onClose }: { page: PageDef; base: string; onClose: () => void }) {
  const src = `${base}${page.path}?preview=1`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="relative" onClick={e => e.stopPropagation()}>
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        {/* 제목 */}
        <div className="absolute -top-12 left-0 flex items-center gap-2">
          <span className="text-white font-bold">{page.emoji} {page.title}</span>
          <a
            href={`${page.path}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="text-white/50 hover:text-white transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        {/* 폰 프레임 */}
        <div
          className="rounded-[44px] overflow-hidden"
          style={{
            width: 390,
            height: 844,
            border: "6px solid rgba(255,255,255,0.15)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
          }}
        >
          <iframe
            src={src}
            title={page.title}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

export function UIGallery() {
  const [base, setBase] = useState("");
  const [selected, setSelected] = useState<PageDef | null>(null);
  const totalPages = GROUPS.reduce((s, g) => s + g.pages.length, 0);

  useEffect(() => {
    setBase(window.location.origin);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0C10] overflow-x-hidden">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,12,16,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <h1 className="text-white font-black text-[20px]">🎨 UI Gallery</h1>
          <p className="text-white/40 text-[12px]">Chally · {totalPages}개 페이지</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FF3355]/15 border border-[#FF3355]/30 rounded-xl px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF3355] animate-pulse" />
          <span className="text-[#FF9DB2] text-[12px] font-semibold">preview 모드</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-12">
        {GROUPS.map(group => (
          <section key={group.label}>
            <h2 className="text-white/60 font-bold text-[13px] uppercase tracking-widest mb-5 pb-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {group.label}
            </h2>
            <div className="flex flex-wrap gap-6">
              {base && group.pages.map(page => (
                <div key={page.path}>
                  <PhoneFrame
                    page={page}
                    base={base}
                    onClick={() => setSelected(page)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <FullscreenModal page={selected} base={base} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
