# Chally — 개발자 플로우

코드를 처음 보는 개발자 또는 새 기능을 추가할 때 참조하는 문서.

---

## 1. 로컬 개발 환경 세팅

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env)
VITE_SUPABASE_URL=https://xufcmyavctkugjkauqxc.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>

# 3. 개발 서버 실행
npm run dev   # http://localhost:3000

# 4. 타입 체크
npm run lint  # tsc --noEmit
```

---

## 2. 코드 구조 원칙

### 페이지 vs 컴포넌트
- `src/pages/` — 라우트 1:1 대응 페이지. 데이터 페칭과 로컬 상태를 담당.
- `src/components/` — Layout, BottomNav만 존재. 재사용 컴포넌트는 현재 없음.
- 큰 페이지(GroupDetail 등)는 `페이지명/UI.tsx`로 UI 분리.

### 상태 관리 레이어
```
AuthContext       → 인증 세션, 프로필 (모든 페이지에서 useAuth())
AppContext         → 그룹, 인증 기록, 알림 (모든 페이지에서 useApp())
GuestGuardContext → 게스트 차단 (guardAction 래핑)
페이지 로컬 state → Supabase 직접 쿼리 (RPC, 실시간 구독 등)
```

### Supabase 직접 쿼리 패턴
```typescript
// 페이지 로컬: useEffect 안에서 직접 쿼리
const { data, error } = await supabase
  .from("activity_posts")
  .select("*, profiles(username, avatar_url)")
  .eq("group_id", groupDbId)
  .order("created_at", { ascending: false })
  .limit(30);

// Realtime 구독 (cleanup 필수)
const channel = supabase
  .channel(`group-messages-${groupId}`)
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages" },
    (payload) => setMessages(prev => [...prev, payload.new as GroupMessage]))
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

---

## 3. 인증 플로우 데이터 흐름

```
[클라이언트]                          [Supabase Edge Function]
Upload.tsx
  └─ verifyAI.ts:callVerifyPhoto()
       이미지 압축 (canvas, 1024px)
       base64 변환
       fetch('/functions/v1/verify-photo', {
         body: { imageBase64, verifyType, groupId }
         headers: { Authorization: Bearer <session.access_token> }
       })
                                        ↓
                                    verify-photo/index.ts
                                      1. supabase.auth.getUser() 인증
                                      2. verify_attempts 조회 (일 20회)
                                      3. groups 조회 (verify_type, 기간)
                                      4. group_members 조회 (ACTIVE 확인)
                                      5. Gemini API 호출
                                      6. 서버사이드 이중 검증
                                      7. Storage.upload()
                                      8. verifications.insert()
                                      9. activity_posts.insert()
                                     10. increment_user_xp()
                                        ↓
       { passed: true, photoUrl, xpEarned }
  └─ completeCurrentVerification(photoUrl)
       → verificationHistory 갱신
       → navigate('/success')
```

---

## 4. 그룹 참여/탈퇴 흐름

```typescript
// AppContext.joinGroup(legacyId)
const { data: dbGroup } = await supabase
  .from("groups").select("id").eq("legacy_id", legacyId).single();

await supabase.from("group_members").insert({
  group_id: dbGroup.id,   // UUID
  user_id: user.id,
  role: "member",
  member_status: "ACTIVE"
});
// BEFORE INSERT: gm_set_contributor 트리거 → is_contributor 초기화
// AFTER INSERT:  group_members_adjust_count_insert → groups.member_count++

// AppContext.leaveGroup(legacyId) — 자발적 탈퇴
await supabase.rpc("member_voluntary_exit", {
  p_group_id: dbGroupId,
  p_user_id: user.id,
});
// LEFT 상태로 변경, member_count-- 자동 처리
// LEFT는 챌린지 재시작 시 재참여 가능

// 강제퇴장 흐름 (서버 자동):
// ACTIVE → (48h 미인증) → EXIT_ELIGIBLE → (6h 경과) → REMOVED
// update_member_statuses() RPC가 cron으로 실행
// REMOVED는 재참여 불가
```

### member_status 전이도

```
[ACTIVE]
   │ 자발적 탈퇴 (member_voluntary_exit)
   ↓
[LEFT] ──────── 챌린지 재시작 시 재참여 가능

[ACTIVE]
   │ 48h 미인증 감지 (update_member_statuses cron)
   ↓
[EXIT_ELIGIBLE] ── member_warning 알림 발송
   │ 6h 경과
   ↓
[REMOVED] ─────── member_removed 알림 발송, 재참여 불가
```

---

## 5. 챌린지 단계 계산 (`challengeUtils.ts`)

```typescript
type Phase = "recruit" | "active" | "closing" | "ended";

// 그룹 객체의 challengeStart, challengeEnd (ISO string) 기준
function getPhase(group: Group): Phase {
  const now = new Date();
  if (!group.challengeStart) return "recruit";
  if (now < new Date(group.recruitEnd))   return "recruit";
  if (now < new Date(group.challengeEnd) - 3일) return "active";
  if (now < new Date(group.challengeEnd)) return "closing";
  return "ended";
}
```

---

## 6. Realtime 구독 패턴

프로젝트 내 3곳에서 Realtime 사용:

| 위치 | 테이블 | 이벤트 |
|------|--------|--------|
| Home.tsx | `group_messages` | INSERT → 채팅 메시지 실시간 수신 |
| GroupDetailUI.tsx | `group_messages` | INSERT → 그룹 상세 채팅 |
| AppContext.tsx | `notifications` | INSERT → 알림 배지 업데이트 |

```typescript
// Realtime publication 활성화 필요 (migration으로 처리됨)
// 20260505003000_group_messages_realtime.sql
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE group_message_reactions;
```

---

## 7. 새 마이그레이션 추가

```bash
# 1. 마이그레이션 파일 생성 (타임스탬프 형식: YYYYMMDDHHMMSS)
# 예: supabase/migrations/20260515000000_새기능.sql

# 2. 로컬 Supabase에서 테스트 (있다면)
supabase db reset

# 3. 원격 DB에 적용
supabase db push
# 또는 Supabase MCP로 apply_migration 호출

# 4. CLAUDE.md 마이그레이션 목록 업데이트
```

마이그레이션 파일 명명 규칙:
```
20260515000000_기능설명.sql       # 새 기능
20260515000100_fix_버그내용.sql   # 버그 수정
20260515001000_add_컬럼명.sql     # 컬럼 추가
```

---

## 8. Edge Function 개발

```bash
# 로컬 실행
supabase functions serve verify-photo --env-file .env.local

# 배포
supabase functions deploy verify-photo

# 시크릿 설정
supabase secrets set GEMINI_API_KEY=<key>

# 로그 확인
supabase functions logs verify-photo
```

Edge Function은 Deno 런타임. `supabase-js` v2 사용.
서비스 롤 클라이언트(admin)로 `notifications.insert()` 가능.

---

## 9. DB 타입 동기화

```bash
# Supabase에서 TypeScript 타입 자동 생성
supabase gen types typescript --project-id xufcmyavctkugjkauqxc > src/types/database.ts
```

`src/types/database.ts`는 자동생성 파일. 직접 수정하지 않음.
마이그레이션 적용 후 재생성 필요.

---

## 10. 게스트 모드 작동 방식

```typescript
// App.tsx
export function setGuestMode(on: boolean) {
  if (on) sessionStorage.setItem("guestMode", "1");
  else     sessionStorage.removeItem("guestMode");
}
export function isGuestMode() {
  return sessionStorage.getItem("guestMode") === "1";
}

// GuestGuardContext.tsx
function guardAction(fn: () => void) {
  if (isGuestMode()) { setShow(true); return; }  // 로그인 모달 표시
  fn();
}

// AuthContext.tsx — 로그인 성공 시 자동 해제
async function signInWithEmail(email, password) {
  await supabase.auth.signInWithPassword({ email, password });
  setGuestMode(false);  // ← 중요: 게스트 플래그 해제
}
```

---

## 11. 라우트 보호 레이어

```typescript
// App.tsx
function ProtectedRoute() {
  // 로그인 유저 OR 게스트 OR ?preview=1 → 통과
  return (user || isGuestMode() || isPreview()) ? <Outlet /> : <Navigate to="/login" />;
}

function AuthOnlyRoute() {
  // 반드시 로그인된 유저만 → 게스트 차단
  return user ? <Outlet /> : <Navigate to="/login" />;
}
```

| 라우트 타입 | 예시 경로 | 접근 가능 |
|------------|----------|----------|
| 공개 | /login, /signup | 누구나 |
| ProtectedRoute | /, /challenge, /stats, /profile | 로그인 + 게스트 |
| AuthOnlyRoute | /verify/*, /gallery, /notifications | 로그인만 |

---

## 12. 크루 달성률 (crew_rate) 계산

```sql
-- groups.crew_rate: float8, 범위 0.0 ~ 1.0 (0% ~ 100%)
-- groups.crew_grade: 'A'|'B'|'C'|'D'  (grade_from_rate 함수 기준)

-- 자동 갱신 트리거:
--   trg_crew_rate_on_verification (verifications AFTER INSERT/UPDATE)
--     → trg_fn_crew_rate_on_verification() 실행
--     → calculate_crew_rate(group_id) 호출
--     → update_crew_cache(group_id) 로 groups 테이블 갱신

-- trg_crew_rate_on_challenge_restart (groups AFTER UPDATE)
--     → trg_fn_reset_on_challenge_restart() 실행
--     → 새 챌린지 시작 시 crew_rate 0으로 초기화

-- REMOVED/LEFT 멤버는 계산에서 제외 (is_contributor=false)
-- 계산 범위: challenge_start ~ challenge_end 기간 내 인증

-- 직접 조회:
SELECT * FROM get_crew_status('group-uuid');
-- → { crew_rate: 0.73, crew_grade: 'B' }
```

---

## 13. 자주 쓰는 디버깅

```bash
# TS 에러 확인
npm run lint

# 빌드 에러 확인
npm run build

# Supabase 마이그레이션 상태
supabase migration list

# Edge Function 실시간 로그
supabase functions logs verify-photo --scroll

# Supabase DB 직접 쿼리 (MCP)
# → mcp__plugin_supabase_supabase__execute_sql 사용
```

---

## 14. 현재 미완성 항목 (개발 대기)

| 항목 | 현황 | 파일 |
|------|------|------|
| 소셜 로그인 | 버튼 UI만, provider 미연결 | Login.tsx, SignUp.tsx |
| 채팅 재전송 UI | 실패 시 UX 없음 | Home.tsx, GroupDetailUI.tsx |
| 타인 리액션 실시간 | 내 리액션만 즉시 반영 | activity.ts |
| iOS/Android 카메라 | 브라우저 테스트 미완 | Camera.tsx, Upload.tsx |
| safe-area inset | 모바일 노치 대응 미완 | index.css, Layout.tsx |
| 번들 최적화 | vite build 경고 잔존 | vite.config.ts |
