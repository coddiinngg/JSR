-- ============================================================
-- 알림 버그 수정
-- 1. LEFT(탈퇴) 멤버가 그룹 알림을 계속 받던 버그 수정
-- 2. 채팅 알림 침묵 임계값 5분 → 30분
-- ============================================================

-- ── 1. 인증 알림 트리거: LEFT 제외 ─────────────────────────────
CREATE OR REPLACE FUNCTION notify_group_on_verification()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author TEXT;
  rec      RECORD;
BEGIN
  v_author := COALESCE(NEW.author_name, '챌리 유저');

  FOR rec IN
    SELECT gm.user_id
    FROM   group_members gm
    WHERE  gm.group_id      = NEW.group_id
      AND  gm.user_id      <> NEW.user_id
      AND  gm.member_status NOT IN ('REMOVED', 'LEFT')
  LOOP
    INSERT INTO notifications (user_id, type, title, body, emoji, actionable, action_done, related_id)
    VALUES (
      rec.user_id, 'group', '인증 완료',
      v_author || '님이 인증을 완료했어요!', '📸',
      FALSE, FALSE, NEW.group_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- ── 2. 스트릭 알림 트리거: LEFT 제외 ────────────────────────────
CREATE OR REPLACE FUNCTION notify_group_on_streak()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today  date    := (NOW() AT TIME ZONE 'Asia/Seoul')::date;
  v_cursor date;
  v_streak int     := 0;
  v_author TEXT;
  rec      RECORD;
BEGIN
  IF NEW.group_id IS NULL        THEN RETURN NEW; END IF;
  IF NEW.status <> 'completed'   THEN RETURN NEW; END IF;

  IF EXISTS(
    SELECT 1 FROM verifications
    WHERE user_id  = NEW.user_id AND group_id = NEW.group_id
      AND status   = 'completed'
      AND (verified_at AT TIME ZONE 'Asia/Seoul')::date = v_today
  ) THEN
    v_cursor := v_today;
  ELSE
    v_cursor := v_today - 1;
  END IF;

  WHILE v_streak < 31 AND EXISTS(
    SELECT 1 FROM verifications
    WHERE user_id  = NEW.user_id AND group_id = NEW.group_id
      AND status   = 'completed'
      AND (verified_at AT TIME ZONE 'Asia/Seoul')::date = v_cursor
  ) LOOP
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
  END LOOP;

  IF v_streak NOT IN (3, 5, 7, 10, 14, 21, 30) THEN RETURN NEW; END IF;

  IF EXISTS(
    SELECT 1 FROM notifications
    WHERE user_id    = NEW.user_id AND type = 'streak'
      AND related_id = NEW.group_id::text
      AND (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
  ) THEN RETURN NEW; END IF;

  v_author := COALESCE(
    (SELECT username FROM profiles WHERE id = NEW.user_id), '챌리 유저'
  );

  FOR rec IN
    SELECT gm.user_id
    FROM   group_members gm
    WHERE  gm.group_id      = NEW.group_id
      AND  gm.member_status NOT IN ('REMOVED', 'LEFT')
  LOOP
    INSERT INTO notifications (user_id, type, title, body, emoji, actionable, action_done, related_id)
    VALUES (
      rec.user_id, 'streak', v_streak::text || '일 연속 달성!',
      v_author || '님이 ' || v_streak::text || '일 연속 달성 중이에요! 🔥',
      '🔥', FALSE, FALSE, NEW.group_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- ── 3. 채팅 알림 트리거: LEFT 제외 + 5분 → 30분 ─────────────────
CREATE OR REPLACE FUNCTION notify_group_on_chat()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev_at  TIMESTAMPTZ;
  v_author   TEXT;
  rec        RECORD;
BEGIN
  SELECT created_at INTO v_prev_at
  FROM   group_messages
  WHERE  group_id = NEW.group_id AND id <> NEW.id
  ORDER  BY created_at DESC LIMIT 1;

  IF v_prev_at IS NULL                         THEN RETURN NEW; END IF;
  IF NOW() - v_prev_at < INTERVAL '30 minutes' THEN RETURN NEW; END IF;

  v_author := COALESCE(NEW.author_name, '챌리 유저');

  FOR rec IN
    SELECT gm.user_id
    FROM   group_members gm
    WHERE  gm.group_id      = NEW.group_id
      AND  gm.user_id      <> NEW.user_id
      AND  gm.member_status NOT IN ('REMOVED', 'LEFT')
  LOOP
    INSERT INTO notifications (user_id, type, title, body, emoji, actionable, action_done, related_id)
    VALUES (
      rec.user_id, 'group', '채팅',
      v_author || '님이 채팅을 보냈어요!', '💬',
      FALSE, FALSE, NEW.group_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION notify_group_on_verification() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_group_on_streak()       FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_group_on_chat()         FROM PUBLIC;
