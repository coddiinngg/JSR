# Chally

챌린지로 모임, 챌린지가 모임! — 사진 인증 기반 습관 챌린지 앱.

## 기술 스택

- **Frontend**: Vite 6 + React 19 + TypeScript 5.8
- **Styling**: Tailwind CSS v4 + clsx + tailwind-merge (`cn()`)
- **Routing**: React Router DOM v7
- **Animation**: Framer Motion (motion)
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions, Realtime)
- **AI 인증**: Gemini 2.0 Flash Lite (via Supabase Edge Function)

## 개발 명령어

```bash
npm run dev       # 포트 3000, 0.0.0.0 바인딩
npm run build     # 프로덕션 빌드
npm run lint      # tsc --noEmit
npm run clean     # dist 삭제
supabase functions deploy verify-photo   # Edge Function 배포
supabase secrets set GEMINI_API_KEY=<key>
```

## 라우팅 구조

### 공개 (누구나)
| 경로 | 페이지 |
|------|--------|
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/forgot-password` | 비밀번호 재설정 |

### 게스트 포함 — 바텀 네비 있음 (4탭)
| 경로 | 페이지 |
|------|--------|
| `/` | 홈 (슬라이드 카드: 그룹현황/순위/채팅) |
| `/challenge` | 챌린지 (그룹 목록, 참여하기) |
| `/stats` | 통계 |
| `/profile` | 프로필 |

### 로그인 전용 — 바텀 네비 없음
| 경로 | 페이지 |
|------|--------|
| `/onboarding` | 온보딩 (1회, 닉네임 입력) |
| `/verify/select` | 인증 방법 선택 (6가지 타입) |
| `/verify/guide/:type` | 인증 가이드 + 체크리스트 |
| `/verify/camera` | 카메라 인증 |
| `/verify/upload` | 사진 업로드 + AI 인증 |
| `/success` | 인증 완료 (공유 카드 Canvas 합성) |
| `/challenge/group/:groupId` | 그룹 상세 (피드/순위/채팅 탭) |
| `/challenge/group/:groupId/activity` | 활동 사진 갤러리 |
| `/challenge/group/:groupId/result` | 챌린지 결과 (크루 달성률, 베네핏) |
| `/challenge/request` | 챌린지 건의 (작성/투표/댓글) |
| `/gallery` | 내 인증 갤러리 (그리드/월간/연간) |
| `/rewards` | 리워드 / 뱃지 |
| `/notifications` | 알림 목록 |
| `/settings/notifications` | 알림 설정 |
| `/profile/edit` | 프로필 편집 (닉네임, 아바타) |
| `/stats/weekly-report` | 주간 리포트 |
| `/stats/challenge-history` | 챌린지 이력 |
| `/friends/invite` | 친구 초대 (코드 공유, 검색) |
| `/user/:seed` | 공개 유저 프로필 |
| `/feed` | 전체 활동 피드 (3열 그리드) |

## 주요 파일

```
src/
├── App.tsx                    # 라우터 설정, ProtectedRoute, AuthOnlyRoute
├── main.tsx                   # 앱 진입점
├── index.css                  # 전역 스타일 (Tailwind v4)
├── components/
│   ├── Layout.tsx             # 레이아웃 래퍼 (showNav prop)
│   └── BottomNav.tsx          # 4탭 바텀 네비게이션
├── contexts/
│   ├── AppContext.tsx         # 전역 상태 (verificationHistory, groups, notifications)
│   ├── AuthContext.tsx        # Supabase 인증 상태 + profile
│   └── GuestGuardContext.tsx  # 게스트 모드 접근 제어 (guardAction)
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트 초기화
│   ├── utils.ts               # cn() 유틸리티
│   ├── verifyAI.ts            # Edge Function 호출 + 이미지 압축 (1024px, JPEG 0.85)
│   ├── verifyTypes.ts         # 인증 타입 정의 (VerifyTypeKey, 체크리스트, 거절사유)
│   ├── challengeUtils.ts      # 챌린지 단계 계산 (recruit/active/closing/ended)
│   ├── activity.ts            # 활동 피드 로드 + 리액션 캐시
│   ├── chat.ts                # 그룹 메시지 로드 + 시간 포맷
│   ├── leaderboard.ts         # 그룹 리더보드 로드 (get_group_leaderboard RPC)
│   ├── grades.ts              # XP 등급 계산 (LV0~LV100)
│   └── share.ts               # Web Share API + 폴백 (복사)
├── types/
│   └── database.ts            # Supabase DB 타입 (자동생성)
└── pages/                     # 페이지 컴포넌트 (라우팅 구조와 1:1)
    ├── challenge/
    │   ├── GroupDetail.tsx        # 그룹 상세 데이터 레이어
    │   ├── group-detail/
    │   │   └── GroupDetailUI.tsx  # 그룹 상세 UI (1,186줄)
    │   ├── ActivityPhoto.tsx
    │   └── ChallengeResult.tsx    # 크루 달성률 결과 페이지
    └── verify/
        ├── Select.tsx / Guide.tsx / Camera.tsx
        ├── Upload.tsx             # AI 인증 + 결과 처리
        └── ShareCard.tsx          # Canvas 합성 공유 카드
supabase/
├── schema.sql                 # DB 전체 스키마 (테이블, RLS, 트리거)
├── migrations/                # 마이그레이션 이력 (아래 참조)
└── functions/
    └── verify-photo/
        └── index.ts           # AI 인증 Edge Function (Deno, 549줄)
```

## 상태 관리

### AuthContext
- `user`, `session`, `profile`, `loading`
- `signInWithEmail` / `signUpWithEmail` / `signOut` / `refreshProfile`
- 로그인 성공 시 `setGuestMode(false)` 자동 호출

### AppContext
- **verificationHistory**: `verifications` 테이블 실연동, 로그인 시 로드
- **groups**: `groups` + `group_members` 실연동
  - 앱 화면의 그룹 ID `"1"~"6"`은 `groups.legacy_id`로 유지
  - 실제 DB membership은 `group_members.group_id` UUID 기준
  - 멤버 상태: `ACTIVE` / `LEFT` (자발적 탈퇴) / `REMOVED` (강제 퇴장)
- **notifications**: `notifications` 테이블 실연동 + Realtime
- **verification 흐름**: `beginVerification` → `setVerificationImage` → `completeCurrentVerification`
- **theme**: `localStorage`에 저장

### GuestGuardContext
- `guardAction(fn)`: 게스트면 "로그인 필요" 모달, 로그인 유저면 fn 실행

## Supabase

- **Project ref**: `xufcmyavctkugjkauqxc`
- **환경변수**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (`.env` 파일)

### DB 테이블 (실제 컬럼 기준)

#### `profiles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | auth.users.id 참조 |
| `username` | text unique | 닉네임 |
| `avatar_url` | text | 프로필 사진 URL |
| `plan_type` | text | `'free'` \| `'premium'` (default: 'free') |
| `xp_total` | int | 누적 XP (default: 0) |
| `streak_count` | int | 연속 인증 일수 (default: 0) |
| `recovery_tickets` | int | 복구권 (default: 2) |
| `invite_code` | text unique | 내 초대코드 |
| `referred_by` | uuid | 추천인 profiles.id |
| `joined_group_ids` | text[] | 레거시 필드 (현재는 group_members로 관리) |

#### `groups`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | |
| `legacy_id` | text unique | 앱 내 ID `"1"~"6"` 매핑용 |
| `name` | text | 그룹명 |
| `emoji` | text | 대표 이모지 |
| `description` | text | 설명 |
| `rule` | text | 인증 규칙 |
| `goal` | text | 목표 문구 |
| `cover` | text | 커버 이미지 URL |
| `verify_type` | text | 인증 타입 (VerifyTypeKey) |
| `member_count` | int | 현재 멤버 수 (트리거 자동 관리) |
| `max_members` | int | 최대 인원 (default: 50) |
| `recruit_start/end` | timestamptz | 모집 기간 |
| `challenge_start/end` | timestamptz | 챌린지 기간 |
| `crew_rate` | float8 | 크루 달성률 **0.0~1.0** (트리거 자동 갱신) |
| `crew_grade` | text | `'A'`\|`'B'`\|`'C'`\|`'D'` |
| `is_public` | bool | 공개 여부 (default: true) |

#### `group_members`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | |
| `group_id` | uuid | groups 참조 |
| `user_id` | uuid | auth.users 참조 |
| `role` | text | `'admin'` \| `'member'` |
| `member_status` | text | `'ACTIVE'` \| `'EXIT_ELIGIBLE'` \| `'REMOVED'` \| `'LEFT'` |
| `joined_at` | timestamptz | 가입일 |
| `last_verified_at` | timestamptz | 마지막 인증일 |
| `exit_deadline` | timestamptz | 강제퇴장 유예 기한 |
| `removed_at` | timestamptz | 실제 퇴장 처리 시각 |
| `is_contributor` | bool | 달성률 계산 포함 여부 |
| `join_day` | int | 가입 순번 |

> **member_status 상태 전이**: `ACTIVE` → (48h 미인증) → `EXIT_ELIGIBLE` → (6h 경과) → `REMOVED`  
> 자발적 탈퇴는 `ACTIVE` → `LEFT`. `REMOVED`는 재참여 불가, `LEFT`는 챌린지 재시작 시 재참여 가능.

#### `verifications`
- `user_id`, `group_id`(nullable), `verify_type`, `photo_url`, `status`(`completed`|`skipped`), `xp_earned`(default 10), `verified_at`
- 그룹별 일일 1회 유니크 제약 (KST 기준)

#### `activity_posts`
- `group_id`, `user_id`, `verification_id`(unique, 1:1), `verify_type`, `photo_url`, `message`, `author_name`, `author_avatar_url`
- Edge Function이 인증 성공 시 자동 INSERT

#### `activity_reactions`
- PK: (`activity_post_id`, `user_id`) — 게시글당 유저 1개 리액션
- `emoji`: `❤️` `🔥` `👍` `😮` `🎉`

#### `group_messages`
- `group_id`, `user_id`, `body`(1~500자), `author_name`, `author_avatar_url`
- Realtime publication 활성화됨

#### `group_message_reactions`
- PK: (`message_id`, `user_id`)
- `emoji`: `❤️` `😂` `🔥` `👍` `😮` `🎉`

#### `notifications`
- `type` (CHECK): `goal` | `badge` | `group` | `rank` | `streak` | `member_warning` | `member_removed` | `challenge_start` | `challenge_end` | `challenge_dday` | `daily_reminder`
- `actionable`, `action_done`, `read_at`, `related_id`, `emoji`
- INSERT는 service role만 가능 (트리거 함수 또는 Edge Function)

#### `notification_settings`
- PK: `user_id`
- `daily_enabled`(bool), `daily_time`(text, default `'07:00'`), `challenge_enabled`, `weekly_report_enabled`, `achievement_enabled`

#### `challenge_suggestions`
- `status`: `'투표중'` | `'개발확정'` | `'검토중'`
- `category`: `'운동/건강'` | `'독서/공부'` | `'생산성'` | `'마음챙김'` | `'식습관'` | `'기타'`
- `duration`: `'7일'` | `'21일'` | `'30일'`
- `votes_count`, `comments_count` (트리거 자동 갱신), `agree_rate`, `operator_comment`

#### `referrals`
- `inviter_id`, `referred_id`(unique), `invite_code`, `xp_awarded`(default 50)
- `handle_new_user` 트리거가 회원가입 시 자동 INSERT + 양방향 XP 지급

#### `invite_events`
- `event_type`: `copy_code` | `share_link` | `sms_share` | `suggested_friend_invite`

#### `verify_attempts`
- rate limit 추적용. `user_id`, `attempted_at`. 일 20회 초과 시 Edge Function이 거부.

### RLS 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `profiles` | 전체 공개 | 본인만 | 본인만 | - |
| `groups` | 전체 공개 | 로그인 유저 | 본인 생성만 | 본인 생성만 |
| `group_members` | 본인 행만 | 본인만 | 본인만 | 본인만 |
| `verifications` | 본인만 | 본인만 | 본인만 | 본인만 |
| `activity_posts` | 전체 공개 | 그룹 멤버만 | - | - |
| `activity_reactions` | 전체 공개 | 본인만 | 본인만 | 본인만 |
| `group_messages` | 그룹 멤버만 | 그룹 멤버만 | - | - |
| `group_message_reactions` | 그룹 멤버만 | 본인만 | 본인만 | 본인만 |
| `notifications` | 본인만 | **없음(service role)** | 본인만 | - |
| `notification_settings` | 본인만 | 본인만 | 본인만 | - |
| `challenge_suggestions` | 전체 공개 | 로그인 유저 | - | - |
| `challenge_suggestion_votes` | 전체 공개 | 로그인 유저 | - | 본인만 |
| `challenge_suggestion_comments` | 전체 공개 | 로그인 유저 | - | - |
| `challenge_suggestion_subscriptions` | 전체 공개 | 로그인 유저 | - | 본인만 |
| `referrals` | 본인 관련만 | - | - | - |
| `friend_invites` | 본인만 | 본인만 | - | - |
| `invite_events` | 본인만 | 본인만 | - | - |
| `verify_attempts` | 본인만 | - | - | - |

### 트리거 (실제 DB 기준)

| 트리거명 | 테이블 | 이벤트 | 역할 |
|---------|--------|--------|------|
| `profiles_updated_at` | profiles | BEFORE UPDATE | updated_at 자동 갱신 |
| `gm_set_contributor` | group_members | BEFORE INSERT | is_contributor 초기값 설정 |
| `group_members_adjust_count_insert` | group_members | AFTER INSERT | groups.member_count++ |
| `group_members_adjust_count_delete` | group_members | AFTER DELETE | groups.member_count-- |
| `trg_crew_rate_on_verification` | verifications | AFTER INSERT/UPDATE | crew_rate 자동 재계산 |
| `trg_notify_on_streak` | verifications | AFTER INSERT | 스트릭 달성 알림 생성 |
| `trg_notify_on_verification` | activity_posts | AFTER INSERT | 그룹 인증 알림 생성 |
| `trg_notify_on_chat` | group_messages | AFTER INSERT | 채팅 알림 생성 |
| `trg_crew_rate_on_challenge_restart` | groups | AFTER UPDATE | 챌린지 재시작 시 crew_rate 초기화 |
| `activity_reactions_updated_at` | activity_reactions | BEFORE UPDATE | updated_at 자동 갱신 |
| `group_message_reactions_updated_at` | group_message_reactions | BEFORE UPDATE | updated_at 자동 갱신 |
| `challenge_suggestion_votes_count` | challenge_suggestion_votes | AFTER INSERT/DELETE | votes_count 자동 갱신 |
| `challenge_suggestion_comments_count` | challenge_suggestion_comments | AFTER INSERT/DELETE | comments_count 자동 갱신 |
| `challenge_suggestions_updated_at` | challenge_suggestions | BEFORE UPDATE | updated_at 자동 갱신 |
| `notification_settings_updated_at` | notification_settings | BEFORE UPDATE | updated_at 자동 갱신 |
| `handle_new_user` (auth schema) | auth.users | AFTER INSERT | profiles 자동 생성, ref코드 처리, 양방향 XP +50 |

### DB 함수 (Functions)

**클라이언트 호출용 RPC:**
| 함수 | 인자 | 설명 |
|------|------|------|
| `get_group_leaderboard` | `p_group_id uuid, p_limit int=30` | 그룹 리더보드 (rank/username/avatar/total_done/recent_done/rate/streak/is_me) |
| `get_public_profile` | `p_user_id uuid` | 공개 프로필 조회 |
| `search_public_profiles` | `p_query text, p_limit int=10` | 닉네임 검색 (ILIKE) |
| `calculate_crew_rate` | `p_group_id uuid` | 그룹 크루 달성률 계산 (0.0~1.0) |
| `get_crew_status` | `p_group_id uuid` | crew_rate + crew_grade 반환 |
| `member_voluntary_exit` | `p_group_id uuid, p_user_id uuid` | 자발적 탈퇴 처리 (LEFT 상태로 변경) |
| `update_member_statuses` | `p_group_id uuid=null` | 멤버 상태 갱신 (EXIT_ELIGIBLE→REMOVED 등), cron용 |
| `notify_challenge_lifecycle` | - | 챌린지 시작/종료/D-day 알림 생성, cron용 |
| `notify_daily_reminders` | - | 일일 인증 독려 알림 생성, cron용 |

**내부 트리거 함수 (직접 호출 불필요):**
`adjust_group_member_count`, `grade_from_rate`, `handle_new_user`, `notify_group_on_chat`, `notify_group_on_streak`, `notify_group_on_verification`, `refresh_challenge_suggestion_counts`, `set_member_contributor`, `trg_fn_crew_rate_on_verification`, `trg_fn_reset_on_challenge_restart`, `update_crew_cache`, `update_updated_at`, `default_invite_code`

### Storage 버킷
- `verifications` (공개): 인증 사진 (`{userId}/{timestamp}.jpg`)
- `avatars` (공개): 프로필 사진

## AI 인증 Edge Function (`verify-photo`)

### 인증 흐름
1. 클라이언트: base64 이미지 + `verifyType` + `groupId?` 전송
2. 서버 검증: 사용자 인증 → rate limit (일 20회) → 그룹 verify_type/기간/멤버십(ACTIVE) 확인
3. **Gemini 2.0 Flash Lite** 호출: 타입별 체크리스트 프롬프트 → `{ passed, score, failedChecks[], reason }`
4. **서버사이드 이중 검증** (AI 통과 후 구조적 데이터 재확인):
   - `step_walk`: stepsRead ≥ 5,000
   - `quote_photo`: textRead 길이 ≥ 5
   - `book_cover`: titleRead && authorRead 모두 존재
   - `run_scenery`: runEvidenceRead 길이 ≥ 5
   - `location_photo`: landmarkRead 길이 ≥ 2
5. 통과 시: Storage 업로드 (최대 2회) → `verifications` INSERT → `activity_posts` INSERT → XP +10
6. 실패/오류 시: 업로드된 사진 Storage에서 자동 정리

### 인증 타입 (VerifyTypeKey)
| key | 라벨 | 핵심 조건 |
|-----|------|----------|
| `step_walk` | 걷기 인증 | 만보기 스크린샷, 5,000보 이상 + 오늘 날짜 |
| `run_scenery` | 러닝 풍경 | 러닝앱/복장/운동화 증거 필수 |
| `quote_photo` | 인상 문장 필사 | 텍스트 직독 5자 이상 |
| `book_cover` | 책 표지 | 제목 + 저자 직독 |
| `celeb_pose` | 포즈 인증 | 지정 포즈 유사도 |
| `location_photo` | 장소 인증 | 간판/건물명 직독 |

### 제약
- Rate limit: 사용자당 일 20회 (`verify_attempts`)
- 그룹별 일일 1회 제한 (KST 기준, `verifications` 유니크 제약)
- Gemini 429 시 3초 후 1회 재시도
- 클라이언트 이미지 압축: 최대 1024px, JPEG quality 0.85

## 게스트 모드

`sessionStorage.setItem("guestMode", "1")` 또는 `?preview=1` 파라미터로 활성화.
로그인 성공 시 자동으로 해제 (`setGuestMode(false)` in `signInWithEmail`).
게스트는 홈/챌린지/통계/프로필 4탭 접근 가능. 인증/참여 등은 `GuestGuardContext`가 차단.

## 미완성 / 껍데기만 있는 영역

- **소셜 로그인**: 로그인·회원가입 페이지에 버튼 배치만, provider 실제 연결 없음
- **채팅 재전송 UI**: 메시지 전송 실패 시 재시도 UX 없음 (정적 전송만)
- **다른 유저 채팅 리액션 실시간**: 내 리액션만 즉시 반영, 타인 리액션은 새로고침 필요

## 챌린지 단계 (`challengeUtils.ts`)

```
recruit  : recruit_start ~ recruit_end   (모집 중)
active   : challenge_start ~ (challenge_end - 3일)  (진행 중)
closing  : (challenge_end - 3일) ~ challenge_end    (마감 3일 전)
ended    : challenge_end 이후             (종료)
```

## 적용된 마이그레이션 전체 (DB 실제 버전 기준)

| 버전 | 이름 | 내용 |
|------|------|------|
| `20260501145701` | remote_schema | 초기 스키마 |
| `20260503000000` | notification_settings | 알림 설정 테이블 |
| `20260503001000` | avatar_storage | 아바타 Storage 정책 |
| `20260503002000` | challenge_suggestions | 챌린지 건의/투표/댓글/구독 |
| `20260503003000` | referrals | 추천코드/보상 (XP +50) |
| `20260503003100` | invite_events | 초대 이벤트 기록 |
| `20260503004000` | group_members_app_mapping | 그룹 legacy_id 매핑 |
| `20260503004100` | fix_group_members_select_policy | RLS 수정 |
| `20260504000000` | activity_posts_reactions | 활동글/리액션 테이블 |
| `20260504001000` | challenge_lifecycle | 챌린지 기간 컬럼 추가 |
| `20260504002000` | group_leaderboard_rpc | get_group_leaderboard RPC |
| `20260505000000` | verifications_storage | 인증 사진 Storage 정책 |
| `20260505001000` | group_messages | 그룹 채팅/리액션 테이블 |
| `20260505002000` | public_profile_rpc | get_public_profile / search_public_profiles |
| `20260505003000` | group_messages_realtime | 채팅 Realtime publication |
| `20260505004000` | group_scoped_verification_uniqueness | 그룹별 일일 인증 중복 방지 |
| `20260507000000` | extend_public_profile_rpc | 공개 프로필 RPC 확장 |
| `20260507001000` | fix_group_member_count | 멤버 수 계산 수정 |
| `20260507101620` | crew_rate_system | 크루 달성률 시스템 (calculate_crew_rate, grade_from_rate) |
| `20260507103506` | group_challenge_notifications | 챌린지 시작/종료/D-day 알림 |
| `20260508150436` | member_status_notifications | member_warning/removed 알림 |
| `20260508152129` | fix_exit_timing_72h | 퇴장 타이밍 조정 |
| `20260511052136` | crew_rate_exclude_removed | REMOVED 멤버 달성률 제외 |
| `20260512090207` | group_members_left_status | LEFT 상태 추가, member_voluntary_exit RPC |
| `20260512090947` | kick_timer_48h_plus_6h | EXIT_ELIGIBLE→REMOVED 타이머 (48h+6h) |
| `20260512091907` | fix_notifications_left_and_chat | 알림/채팅 버그 수정 |
| `20260512091930` | challenge_and_daily_notifications | 일일 독려 알림 |
| `20260512093258` | fix_challenge_data_isolation | 챌린지 데이터 격리 수정 |
| `20260512095257` | group_members_update_policy | 멤버 UPDATE RLS 정책 |
| `20260512095929` | fix_crew_rate_isolation_and_auto_update | crew_rate 격리 + 자동 갱신 |
