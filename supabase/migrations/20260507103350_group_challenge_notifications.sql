-- ============================================================
-- 챌린지 그룹 알림 트리거
-- 1. 인증 알림  : activity_posts  INSERT → 그룹 멤버 전원
-- 2. 연속 달성  : verifications   INSERT (completed+group) → 스트릭 마일스톤 도달 시
-- 3. 채팅 알림  : group_messages  INSERT → 5 분+ 공백 후 첫 메시지 시
-- 4. notifications Realtime 활성화
-- ============================================================

-- ── 0. notifications Realtime 활성화 ─────────────────────────
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 1. 인증 알림 트리거 함수 ──────────────────────────────────
-- activity_posts INSERT 시 해당 그룹의 ACTIVE·EXIT_ELIGIBLE 멤버 전원에게 알림
-- (REMOVED 멤버 및 본인 제외)
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
      AND  gm.member_status <> 'REMOVED'
  LOOP
    INSERT INTO notifications (user_id, type, title, body, emoji, actionable, action_done, related_id)
    VALUES (
      rec.user_id,
      'group',
      '인증 완료',
      v_author || '님이 인증을 완료했어요!',
      '📸',
      FALSE, FALSE,
      NEW.group_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_verification ON activity_posts;
CREATE TRIGGER trg_notify_on_verification
  AFTER INSERT ON activity_posts
  FOR EACH ROW EXECUTE FUNCTION notify_group_on_verification();

-- ── 2. 연속 달성 알림 트리거 함수 ──────────────────────────────
-- verifications INSERT (status=completed, group_id 있음) 후
-- KST 기준 연속 달성 일수가 마일스톤(3·5·7·10·14·21·30)에 도달하면
-- 그룹 멤버 전원에게 알림 (당일 중복 알림 방지)
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
  IF NEW.group_id IS NULL          THEN RETURN NEW; END IF;
  IF NEW.status   <> 'completed'   THEN RETURN NEW; END IF;

  -- ── 스트릭 계산 (KST 연속 일수) ──
  IF EXISTS(
    SELECT 1 FROM verifications
    WHERE  user_id  = NEW.user_id
      AND  group_id = NEW.group_id
      AND  status   = 'completed'
      AND  (verified_at AT TIME ZONE 'Asia/Seoul')::date = v_today
  ) THEN
    v_cursor := v_today;
  ELSE
    v_cursor := v_today - 1;
  END IF;

  WHILE v_streak < 31 AND EXISTS(
    SELECT 1 FROM verifications
    WHERE  user_id  = NEW.user_id
      AND  group_id = NEW.group_id
      AND  status   = 'completed'
      AND  (verified_at AT TIME ZONE 'Asia/Seoul')::date = v_cursor
  ) LOOP
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
  END LOOP;

  -- 마일스톤이 아니면 알림 없음
  IF v_streak NOT IN (3, 5, 7, 10, 14, 21, 30) THEN RETURN NEW; END IF;

  -- 당일 같은 그룹에 이미 streak 알림을 보냈으면 스킵
  IF EXISTS(
    SELECT 1 FROM notifications
    WHERE  user_id    = NEW.user_id
      AND  type       = 'streak'
      AND  related_id = NEW.group_id::text
      AND  (created_at AT TIME ZONE 'Asia/Seoul')::date = v_today
  ) THEN
    RETURN NEW;
  END IF;

  v_author := COALESCE(
    (SELECT username FROM profiles WHERE id = NEW.user_id),
    '챌리 유저'
  );

  -- 그룹 멤버 전원에게 알림 (REMOVED 제외)
  FOR rec IN
    SELECT gm.user_id
    FROM   group_members gm
    WHERE  gm.group_id      = NEW.group_id
      AND  gm.member_status <> 'REMOVED'
  LOOP
    INSERT INTO notifications (user_id, type, title, body, emoji, actionable, action_done, related_id)
    VALUES (
      rec.user_id,
      'streak',
      v_streak::text || '일 연속 달성!',
      v_author || '님이 ' || v_streak::text || '일 연속 달성 중이에요! 🔥',
      '🔥',
      FALSE, FALSE,
      NEW.group_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_streak ON verifications;
CREATE TRIGGER trg_notify_on_streak
  AFTER INSERT ON verifications
  FOR EACH ROW EXECUTE FUNCTION notify_group_on_streak();

-- ── 3. 채팅 침묵 알림 트리거 함수 ──────────────────────────────
-- group_messages INSERT 시 직전 메시지가 5분 이상 전이면
-- 그룹 멤버 전원에게 채팅 알림 (본인 제외, REMOVED 제외)
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
  WHERE  group_id = NEW.group_id
    AND  id      <> NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_prev_at IS NULL                        THEN RETURN NEW; END IF;
  IF NOW() - v_prev_at < INTERVAL '5 minutes' THEN RETURN NEW; END IF;

  v_author := COALESCE(NEW.author_name, '챌리 유저');

  FOR rec IN
    SELECT gm.user_id
    FROM   group_members gm
    WHERE  gm.group_id      = NEW.group_id
      AND  gm.user_id      <> NEW.user_id
      AND  gm.member_status <> 'REMOVED'
  LOOP
    INSERT INTO notifications (user_id, type, title, body, emoji, actionable, action_done, related_id)
    VALUES (
      rec.user_id,
      'group',
      '채팅',
      v_author || '님이 채팅을 보냈어요!',
      '💬',
      FALSE, FALSE,
      NEW.group_id::text
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_chat ON group_messages;
CREATE TRIGGER trg_notify_on_chat
  AFTER INSERT ON group_messages
  FOR EACH ROW EXECUTE FUNCTION notify_group_on_chat();

-- ── 4. 보안: 트리거 함수는 PUBLIC 실행 금지 ───────────────────
REVOKE EXECUTE ON FUNCTION notify_group_on_verification() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_group_on_streak()       FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION notify_group_on_chat()         FROM PUBLIC;
