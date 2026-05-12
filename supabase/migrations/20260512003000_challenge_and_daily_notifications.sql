-- ============================================================
-- 챌린지 라이프사이클 알림 + 일일 인증 리마인더
-- 새 알림 타입: challenge_start, challenge_end, challenge_dday, daily_reminder
-- ============================================================

-- ── 0. notifications.type CHECK 확장 ──────────────────────────
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'goal', 'badge', 'group', 'rank', 'streak',
    'member_warning', 'member_removed',
    'challenge_start', 'challenge_end', 'challenge_dday',
    'daily_reminder'
  ));

-- ── 1. notify_challenge_lifecycle() ────────────────────────────
-- 매일 자정 KST(= 15:00 UTC) 에 pg_cron이 호출
-- 시작·종료·D-3·D-1 알림 발송 (당일 중복 방지)
CREATE OR REPLACE FUNCTION notify_challenge_lifecycle()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (NOW() AT TIME ZONE 'Asia/Seoul')::date;
  grp     RECORD;
  rec     RECORD;
BEGIN

  -- ── 챌린지 시작 ─────────────────────────────────────────────
  FOR grp IN
    SELECT id, name FROM groups
    WHERE challenge_start IS NOT NULL
      AND challenge_start::date = v_today
  LOOP
    CONTINUE WHEN EXISTS(
      SELECT 1 FROM notifications
      WHERE type = 'challenge_start' AND related_id = grp.id::text
        AND (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
    );
    FOR rec IN
      SELECT user_id FROM group_members
      WHERE group_id = grp.id AND member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
    LOOP
      INSERT INTO notifications (user_id, type, title, body, emoji, related_id)
      VALUES (rec.user_id, 'challenge_start', '챌린지 시작!',
        grp.name || ' 챌린지가 시작됐어요! 오늘부터 인증해보세요 🚀', '🚀', grp.id::text);
    END LOOP;
  END LOOP;

  -- ── 챌린지 종료 ─────────────────────────────────────────────
  FOR grp IN
    SELECT id, name FROM groups
    WHERE challenge_end IS NOT NULL
      AND challenge_end::date = v_today
  LOOP
    CONTINUE WHEN EXISTS(
      SELECT 1 FROM notifications
      WHERE type = 'challenge_end' AND related_id = grp.id::text
        AND (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
    );
    FOR rec IN
      SELECT user_id FROM group_members
      WHERE group_id = grp.id AND member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
    LOOP
      INSERT INTO notifications (user_id, type, title, body, emoji, related_id)
      VALUES (rec.user_id, 'challenge_end', '챌린지 종료',
        grp.name || ' 챌린지가 종료됐어요! 결과를 확인해보세요 🏁', '🏁', grp.id::text);
    END LOOP;
  END LOOP;

  -- ── D-3 리마인더 ─────────────────────────────────────────────
  FOR grp IN
    SELECT id, name FROM groups
    WHERE challenge_end IS NOT NULL
      AND challenge_end::date = v_today + 3
  LOOP
    CONTINUE WHEN EXISTS(
      SELECT 1 FROM notifications
      WHERE type = 'challenge_dday' AND related_id = grp.id::text
        AND (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
    );
    FOR rec IN
      SELECT user_id FROM group_members
      WHERE group_id = grp.id AND member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
    LOOP
      INSERT INTO notifications (user_id, type, title, body, emoji, related_id)
      VALUES (rec.user_id, 'challenge_dday', 'D-3 마감 임박',
        grp.name || ' 챌린지가 3일 후 종료돼요! 마지막까지 파이팅 💪', '⏳', grp.id::text);
    END LOOP;
  END LOOP;

  -- ── D-1 리마인더 ─────────────────────────────────────────────
  FOR grp IN
    SELECT id, name FROM groups
    WHERE challenge_end IS NOT NULL
      AND challenge_end::date = v_today + 1
  LOOP
    CONTINUE WHEN EXISTS(
      SELECT 1 FROM notifications
      WHERE type = 'challenge_dday' AND related_id = grp.id::text
        AND (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
    );
    FOR rec IN
      SELECT user_id FROM group_members
      WHERE group_id = grp.id AND member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
    LOOP
      INSERT INTO notifications (user_id, type, title, body, emoji, related_id)
      VALUES (rec.user_id, 'challenge_dday', 'D-1 마지막 기회',
        grp.name || ' 챌린지가 내일 종료돼요! 오늘 꼭 인증하세요 🔥', '🔥', grp.id::text);
    END LOOP;
  END LOOP;

END;
$$;

-- ── 2. notify_daily_reminders() ────────────────────────────────
-- 매시 정각 pg_cron이 호출 → 해당 KST 시간에 daily_time이 맞는 유저 중
-- 오늘 아직 미인증 + 활성 그룹 있는 경우에만 발송
CREATE OR REPLACE FUNCTION notify_daily_reminders()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now_kst  timestamptz := NOW() AT TIME ZONE 'Asia/Seoul';
  v_hour_kst int         := EXTRACT(HOUR FROM v_now_kst)::int;
  v_today    date        := v_now_kst::date;
  rec        RECORD;
BEGIN
  FOR rec IN
    SELECT ns.user_id
    FROM   notification_settings ns
    WHERE  ns.daily_enabled = TRUE
      AND  EXTRACT(HOUR FROM ns.daily_time::time)::int = v_hour_kst
  LOOP
    -- 오늘 이미 daily_reminder 보냈으면 스킵
    CONTINUE WHEN EXISTS(
      SELECT 1 FROM notifications
      WHERE user_id = rec.user_id AND type = 'daily_reminder'
        AND (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
    );

    -- 오늘 이미 인증했으면 스킵
    CONTINUE WHEN EXISTS(
      SELECT 1 FROM verifications
      WHERE user_id = rec.user_id AND status = 'completed'
        AND (verified_at AT TIME ZONE 'Asia/Seoul')::date = v_today
    );

    -- 진행 중인 활성 그룹 없으면 스킵
    CONTINUE WHEN NOT EXISTS(
      SELECT 1
      FROM   group_members gm
      JOIN   groups g ON g.id = gm.group_id
      WHERE  gm.user_id       = rec.user_id
        AND  gm.member_status IN ('ACTIVE', 'EXIT_ELIGIBLE')
        AND  g.challenge_start IS NOT NULL
        AND  g.challenge_end   IS NOT NULL
        AND  g.challenge_start::date <= v_today
        AND  g.challenge_end::date   >= v_today
    );

    INSERT INTO notifications (user_id, type, title, body, emoji)
    VALUES (
      rec.user_id,
      'daily_reminder',
      '오늘 인증을 잊지 마세요!',
      '아직 오늘 인증을 안 했어요. 지금 바로 인증하러 가볼까요? ⏰',
      '⏰'
    );
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION notify_challenge_lifecycle() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION notify_daily_reminders()     FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION notify_challenge_lifecycle() TO service_role;
GRANT  EXECUTE ON FUNCTION notify_daily_reminders()     TO service_role;

-- ── 3. pg_cron 스케줄 등록 ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 기존 스케줄 제거 후 재등록
DO $$ BEGIN PERFORM cron.unschedule('challenge-lifecycle-kst'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('daily-reminders-hourly');   EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 매일 자정 KST (= 15:00 UTC): 챌린지 시작/종료/D-3/D-1
SELECT cron.schedule('challenge-lifecycle-kst', '0 15 * * *',
  $$SELECT public.notify_challenge_lifecycle()$$);

-- 매시 정각 UTC: 일일 인증 리마인더 (함수 내부에서 KST 시간 매칭)
SELECT cron.schedule('daily-reminders-hourly', '0 * * * *',
  $$SELECT public.notify_daily_reminders()$$);
