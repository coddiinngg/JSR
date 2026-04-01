import { supabase, supabaseUrl } from "./supabase";
import type { VerifyTypeKey } from "./verifyTypes";

export interface VerifyResult {
  passed: boolean;
  score: number;
  failedChecks: string[];
  reason: string;
  photoUrl?: string | null;
}

/** 최대 1024px, JPEG 0.85 압축 → base64 반환 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas 생성 실패")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지 로드 실패")); };
    img.src = url;
  });
}

/** AbortSignal.any() 폴리필 */
function mergeSignals(signals: AbortSignal[]): AbortController {
  const ctrl = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) { ctrl.abort(); break; }
    sig.addEventListener("abort", () => ctrl.abort(), { once: true });
  }
  return ctrl;
}

/**
 * 사진을 Supabase Edge Function으로 전송해 AI 인증을 수행합니다.
 * - Gemini API 키는 서버(Edge Function)에서만 사용됩니다.
 * - 인증 통과 시 Edge Function이 DB 저장 + XP 지급까지 처리합니다.
 */
export async function verifyPhotoWithAI(
  file: File,
  key: VerifyTypeKey,
  goalId: string | null,
  externalSignal?: AbortSignal,
): Promise<VerifyResult> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 인증할 수 있습니다.");
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("로그인 후 인증할 수 있습니다.");
  }

  const base64 = await compressImage(file);

  // 30초 타임아웃 + 외부 signal 병합
  const timeoutCtrl = new AbortController();
  const timeout = setTimeout(() => timeoutCtrl.abort(), 30_000);
  const combined = externalSignal
    ? mergeSignals([externalSignal, timeoutCtrl.signal])
    : timeoutCtrl;

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/verify-photo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ image: base64, verifyType: key, goalId }),
        signal: combined.signal,
      },
    );

    if (response.status === 409) {
      throw new Error("오늘 이미 인증했어요.");
    }

    if (!response.ok) {
      const err = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(err?.error ?? `서버 오류 (${response.status})`);
    }

    return await response.json() as VerifyResult;

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("분석 시간이 초과됐습니다. 다시 시도해주세요.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
