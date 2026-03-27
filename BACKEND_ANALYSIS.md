# Chally 백엔드 분석 문서

작성일: 2026-03-09 (앱명 변경: 2026-03-26)
기준 경로: `/home/omom/JSR`

## 1) 프로젝트 구조 요약

- 앱명: 챌리 (Chally) - 챌린지로 모임, 챌린지가 모임!
- 현재 실작업본은 루트 `/home/omom/JSR` 폴더.
  - Supabase 연동 코드 존재
- 코치 기능 전면 제거 (2026-03-26)

주요 폴더:
- `/home/omom/JSR`: 현재 통합 버전(React + Vite)

## 2) 백엔드 아키텍처 현황

현재 구조는 **별도 Node 서버(API 서버) 없이 Supabase(BaaS) 중심**.

- Supabase 클라이언트 초기화
  - `src/lib/supabase.ts`
- 인증 상태 관리(Auth Context)
  - `src/contexts/AuthContext.tsx`
  - 구현 범위: 로그인/회원가입/로그아웃, 세션 구독, 프로필 조회
- DB 스키마 및 권한 정책
  - `supabase/schema.sql`
  - 테이블, RLS 정책, 트리거 함수 정의
- 타입 매핑
  - `src/types/database.ts`

## 3) DB 스키마 및 권한(RLS) 상태

`supabase/schema.sql` 기준:

- 테이블
  - `profiles`
  - `goals`
  - `verifications`
  - `groups`
  - `group_members`
  - `snooze_records`
- RLS 활성화 완료
- 정책 정의 완료(사용자 소유 데이터 중심 접근 제어)
- 트리거
  - 회원가입 시 `profiles` 자동 생성
  - `profiles.updated_at` 자동 갱신

결론:
- DB/권한 설계는 초기 버전으로 충분히 잘 잡혀 있음.
- 프론트 실제 연결이 부족해 기능 체감이 낮은 상태.

## 4) 실제 구현된 백엔드 연동 범위

실제로 동작 중인 백엔드 연동:
- 이메일/비밀번호 로그인
- 이메일/비밀번호 회원가입
- 로그아웃
- 현재 사용자 `profiles` 조회

즉, **Auth + Profile 일부만 실연동** 상태.

## 5) 미연동/공백(핵심)

아래는 백엔드 작업 관점의 핵심 공백.

1. 도메인 CRUD 미연동
- `goals`, `verifications`, `groups`, `group_members`, `snooze_records`
- 현재 페이지 다수가 하드코딩(mock) 데이터로 렌더링

2. 목표 생성 플로우 미저장
- 목표 설정 후 DB INSERT 없이 화면 이동 중심

3. 인증 업로드 미구현
- 업로드 페이지가 타이머 후 완료 페이지로 이동
- Supabase Storage 업로드 및 `verifications` INSERT 없음

4. 비밀번호 재설정 미구현
- UI는 있으나 `resetPasswordForEmail` 호출 없음

5. 인증 가드 미적용
- 로그인 없이 주요 화면 접근 가능한 라우트 구조

6. 의존성 불일치
- `express`, `better-sqlite3`, `dotenv` 패키지는 있으나 서버 코드 부재
- 사용하지 않는 의존성 정리 필요

## 6) 기술 리스크

- 화면 데이터와 DB 데이터가 분리되어 실제 사용자 데이터 신뢰도가 낮음
- 인증 업로드/검증 흐름 부재로 핵심 서비스 가치(인증 기반 습관 추적) 미완성
- 라우트 보호 미비로 인증 UX 및 보안 일관성 저하
- 장기적으로 mock 기반 UI와 실데이터 모델 간 불일치 가능성 증가

## 7) 우선 작업 제안(백엔드 중심)

Phase 1 (필수, 즉시)
- 인증 가드(Protected Route) 적용
- 비밀번호 재설정 API 연동
- 목표 생성(`goals`) INSERT 연동

Phase 2 (핵심 기능 완성)
- 목표 목록/상세를 `goals` 실데이터 기반으로 전환
- 인증 업로드: Storage 업로드 + `verifications` INSERT
- 통계 화면을 `verifications` 집계 데이터 기반으로 전환

Phase 3 (챌린지 고도화)
- 그룹/멤버 조회 및 가입/탈퇴 실연동
- 랭킹 로직(달성률, streak) 계산 규칙 정의 및 반영

## 8) 작업 기준 폴더 및 명령

작업 기준:
- `/home/omom/JSR/잔소리 통합`

검증:
- `npm run lint` (현재 통과 확인)

환경변수:
- `.env.example` 기준으로 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 설정 필요

## 9) 참고 파일

- `package.json`
- `vite.config.ts`
- `src/lib/supabase.ts`
- `src/contexts/AuthContext.tsx`
- `src/types/database.ts`
- `supabase/schema.sql`
- `src/pages/goal-setting/GoalName.tsx`
- `src/pages/verify/Upload.tsx`
- `src/pages/ForgotPassword.tsx`
- `src/pages/GoalsList.tsx`
- `src/pages/Challenge.tsx`
- `src/pages/Gallery.tsx`

