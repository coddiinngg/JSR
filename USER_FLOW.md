# Chally — 사용자 플로우

앱을 처음 설치한 사람부터 매일 쓰는 사람까지, 실제 화면 흐름 기준으로 정리.

---

## 1. 최초 진입 (신규 사용자)

```
앱 실행
  └─ /login
       ├─ 회원가입 클릭 → /signup
       │     이메일 + 비밀번호 + 닉네임 입력
       │     (추천코드 있으면 입력 → 양방향 XP +50)
       │     → Supabase Auth signUp
       │     → trigger: profiles 자동 생성, referrals 기록
       │     → /onboarding
       │           닉네임 확인/수정 → profiles.username 저장
       │           → /  (홈)
       │
       └─ 로그인 클릭
             이메일 + 비밀번호
             → Supabase Auth signIn
             → ob_done_{uid} 로컬 확인 → 없으면 /onboarding, 있으면 /
```

---

## 2. 홈 화면 (/)

참여 중인 그룹이 있을 때와 없을 때 모습이 다름.

```
홈 (/)
  ├─ 바텀 네비: 홈 / 챌린지 / 통계 / 프로필
  │
  ├─ [참여 그룹 없음] 빈 상태 + "챌린지 둘러보기" CTA
  │
  └─ [참여 그룹 있음] 슬라이드 카드 3장
        ┌─────────────────────────────────┐
        │ 카드 1: 그룹 현황               │
        │  - 오늘 인증 완료 여부 (체크)   │
        │  - 크루 달성률 %                │
        │  - 챌린지 단계 (진행중/마감D-3) │
        │  - "인증하기" 버튼 → 인증 플로우│
        │  - 종료 시 → "결과 확인하기"   │
        └─────────────────────────────────┘
        ┌─────────────────────────────────┐
        │ 카드 2: 순위                    │
        │  - get_group_leaderboard RPC    │
        │  - 내 순위 하이라이트           │
        └─────────────────────────────────┘
        ┌─────────────────────────────────┐
        │ 카드 3: 채팅                    │
        │  - group_messages (Realtime)    │
        │  - 메시지 입력/전송             │
        │  - 이모지 리액션                │
        └─────────────────────────────────┘
  │
  └─ 실시간 피드 (activity_posts)
        최근 그룹원 인증 사진들
        사진 탭 → 확대 + 이모지 리액션
        "전체 피드 보기" → /feed
```

---

## 3. 인증 플로우 (핵심 기능)

```
인증 시작 (홈 카드 "인증하기" 또는 그룹 상세 "인증하기")
  └─ /verify/select
        6가지 타입 중 하나 선택
        (step_walk / run_scenery / quote_photo / book_cover / celeb_pose / location_photo)
        그룹 챌린지면 그룹 타입 고정 표시

  └─ /verify/guide/:type
        인증 방법 설명 + 체크리스트
        "카메라로 촬영" 또는 "갤러리에서 선택"

  ├─ 카메라 선택 → /verify/camera
  │     실시간 카메라 미리보기 + 촬영 프레임
  │     촬영 → /verify/upload

  └─ 갤러리 선택 → /verify/upload (직접)
        사진 미리보기 표시
        "AI 인증 시작" 버튼

        [AI 인증 처리 중...]
        Edge Function 호출:
          이미지 압축 (1024px, JPEG 0.85)
          → Gemini 2.0 Flash Lite 판정
          → 서버사이드 이중 검증
          → Storage 업로드
          → verifications INSERT
          → activity_posts INSERT
          → XP +10

        ├─ 통과 → /success
        │     축하 애니메이션
        │     오늘의 인증 카드 (사진 + 타입 + XP)
        │     공유 카드: Canvas 합성 → 4-앱 바텀시트
        │       (인스타그램 / 카카오 / X / 더보기)
        │     "홈으로" → /

        └─ 실패 → 업로드 페이지에 실패 사유 표시
              재촬영 / 다시 선택 가능
              (일 20회 rate limit)
```

---

## 4. 챌린지 탭 (/challenge)

```
챌린지 (/challenge)
  ├─ 라이브 티커 (실시간 인증 알림 흐름)
  ├─ 그룹 목록 (6개 그룹)
  │     각 카드: 제목, 멤버 수, 인증 타입, 진행 단계
  │     상태별 버튼:
  │       미참여 + 모집/진행중 → "참여하기"
  │       참여중              → "인증하기"
  │       탈퇴 + 재시작 챌린지 → "다시 참여하기"
  │       종료됨              → "종료된 챌린지"
  │       강제퇴장(REMOVED)   → "퇴장된 그룹"
  │
  ├─ 그룹 카드 탭 → /challenge/group/:groupId
  │     [소개 탭]
  │       그룹 설명, 규칙, 인증 타입, 기간
  │       참여중이면 "인증하기" 버튼
  │       미참여면 하단 "챌린지 참여하기" 버튼
  │     [활동 탭]
  │       그룹원 인증 사진 피드 (activity_posts)
  │       이모지 리액션
  │     [순위 탭]
  │       리더보드 (get_group_leaderboard RPC)
  │       내 순위 카드
  │     [채팅 탭]
  │       그룹 메시지 (Realtime)
  │       이모지 리액션
  │
  └─ 챌린지 건의 버튼 → /challenge/request
        건의 목록 (투표중/개발확정/검토중)
        건의 작성 / 응원(투표) / 댓글 / 알림받기
```

---

## 5. 통계 탭 (/stats)

```
통계 (/stats)
  ├─ 등급 카드 (XP 기반, LV0~LV100)
  ├─ 핵심 지표: 총 달성 수 / 연속 일수(streak) / 성공률
  ├─ 최근 7일 달력 (인증 여부 표시)
  ├─ 챌린지별 통계
  │
  ├─ "주간 리포트" → /stats/weekly-report
  │     활동 요약, 차트, 지난주 비교
  │
  └─ "챌린지 이력" → /stats/challenge-history
        참여했던 챌린지 목록, 성과
```

---

## 6. 프로필 탭 (/profile)

```
프로필 (/profile)
  ├─ 내 정보: 아바타, 닉네임, XP/등급
  ├─ 스트릭 카운트, 복구권 수
  ├─ 테마 설정 (라이트/다크/시스템)
  ├─ 알림 설정 → /settings/notifications
  │     daily_enabled / daily_time
  │     challenge_enabled (챌린지 알림)
  │     weekly_report_enabled
  │     achievement_enabled
  │
  ├─ "프로필 편집" → /profile/edit
  │     닉네임 수정, 아바타 이미지 업로드 (Storage avatars)
  │
  ├─ "내 갤러리" → /gallery
  │     인증 사진 그리드 / 월간 / 연간 보기
  │     핀치줌, 확대보기
  │
  ├─ "리워드" → /rewards
  │     뱃지 목록, 달성 조건
  │
  └─ "친구 초대" → /friends/invite
        내 초대코드 복사/공유
        추천 친구 검색 (search_public_profiles)
        초대 이벤트 기록 (invite_events)
```

---

## 7. 알림 (/notifications)

```
알림 타입:
  badge          — 뱃지 획득
  group          — 그룹 관련
  rank           — 순위 변동
  streak         — 스트릭 달성
  member_warning — 48시간 미인증 경고
  member_removed — 강제퇴장 통보
  challenge_start/end — 챌린지 시작/종료
  dday           — D-3 마감 임박
  daily_reminder — 일일 인증 독려

알림 액션:
  수락/거절 가능한 알림 (actionable=true) → 처리 후 action_done=true
  모두 읽음 처리 가능
```

---

## 8. 크루 달성률 & 챌린지 결과

```
진행 중 그룹현황 카드:
  crew_rate (%) = 챌린지 기간 내 ACTIVE 멤버 달성률 평균
  crew_grade = 달성률 구간별 등급

챌린지 종료 후:
  홈 카드 → "결과 확인하기" 버튼 표시
  → /challenge/group/:groupId/result
       크루 달성률 ≥ 50%: 달성 화면 (베네핏 등급 카드)
       크루 달성률 < 50%: 미달성 화면
       내 기록 (get_group_leaderboard 기반)
       공유 버튼
```

---

## 9. 유저 간 상호작용

```
피드에서 다른 유저 아바타 탭 → /user/:seed
  get_public_profile RPC로 공개 정보만 표시
  (username, avatar_url, streak_count, xp_total)

친구 초대:
  /friends/invite → 닉네임 검색 → 해당 유저 /user/:seed로 이동
  초대코드 공유 → 수신자가 /signup?ref=코드 로 가입 시 양방향 XP +50
```

---

## 10. 게스트 모드

```
로그인 없이도 홈/챌린지/통계/프로필 탭 조회 가능.
인증/참여 시도 시 → "로그인이 필요해요" 바텀시트 → /login 또는 /signup 이동.
로그인 성공 시 게스트 플래그 자동 해제.
```
