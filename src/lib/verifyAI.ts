import { VERIFY_TYPES, type VerifyTypeKey } from "./verifyTypes";

export interface VerifyResult {
  passed: boolean;
  score: number;
  failedChecks: string[];
  reason: string;
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
      // 압축 후는 항상 JPEG — mimeType도 그에 맞춤
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지 로드 실패")); };
    img.src = url;
  });
}

function todayLabel(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });
}

function buildPrompt(key: VerifyTypeKey): string {
  const vt = VERIFY_TYPES[key];
  const today = todayLabel();
  const dateNote = key === "step_walk"
    ? `\n⚠️ [날짜 필수] 사진에 표시된 날짜가 오늘(${today})과 일치해야 합니다. 날짜가 다르거나 보이지 않으면 자동 거절합니다.`
    : "";

  return `당신은 챌린지 앱의 엄격한 사진 인증 AI입니다.
오늘 날짜: ${today}${dateNote}

인증 유형: ${vt.label} (${key})
목적: ${vt.desc}

[필수 체크리스트 - 모든 항목이 사진에서 명확히 확인돼야 합니다]
${vt.checklist.map((item, i) => `${i + 1}. ${item}`).join("\n")}

[자동 거절 기준 - 하나라도 해당하면 즉시 거절]
${vt.rejectReasons.map(r => `• ${r}`).join("\n")}

[이미지 품질 기준 - 아래 중 하나라도 해당하면 거절]
• 심한 블러 또는 초점이 전혀 맞지 않음
• 핵심 정보가 가려지거나 잘려 있음
• 과노출 또는 극도로 어두워 내용 확인 불가

[판정 일관성 규칙 - 반드시 준수]
• passed=true 이면 failedChecks는 반드시 빈 배열 []
• passed=false 이면 failedChecks에 실패한 체크리스트 항목 원문을 반드시 포함
• score 기준: 통과 확신=85~100, 통과이지만 일부 불명확=70~84, 거절=0~69
• 확신이 없으면 거절 (엄격하게 판단)

JSON만 응답하세요 (마크다운, 설명 없이):
{
  "passed": true 또는 false,
  "score": 0~100 정수,
  "failedChecks": [],
  "reason": "한국어 1~2문장"
}`;
}

/** AI 응답 검증 및 정규화 */
function parseResult(raw: unknown, key: VerifyTypeKey): VerifyResult {
  if (typeof raw !== "object" || raw === null) {
    return { passed: false, score: 0, failedChecks: [], reason: "AI 응답 형식 오류" };
  }
  const obj = raw as Record<string, unknown>;
  const passed = obj.passed === true;
  const score = typeof obj.score === "number"
    ? Math.max(0, Math.min(100, Math.round(obj.score))) : 0;
  const reason = typeof obj.reason === "string" && obj.reason.trim()
    ? obj.reason.trim() : "판정 이유 없음";

  const checklist = VERIFY_TYPES[key].checklist;
  let failedChecks: string[] = [];
  if (!passed && Array.isArray(obj.failedChecks)) {
    failedChecks = (obj.failedChecks as unknown[])
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .map(c => checklist.find(ci => ci === c) ?? c)
      .slice(0, checklist.length);
  }
  // passed=true인데 failedChecks가 있으면 제거 (모순 방지)
  if (passed) failedChecks = [];

  return { passed, score, failedChecks, reason };
}

/** AbortSignal.any() 폴리필 — 어느 signal이든 abort되면 controller abort */
function mergeSignals(signals: AbortSignal[]): AbortController {
  const ctrl = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) { ctrl.abort(); break; }
    sig.addEventListener("abort", () => ctrl.abort(), { once: true });
  }
  return ctrl;
}

/** 1회 재시도 가능한 fetch wrapper (네트워크 오류 한정) */
async function fetchWithRetry(
  url: string, init: RequestInit, signal: AbortSignal,
): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal });
  } catch (err) {
    // AbortError나 4xx는 재시도하지 않음
    if (err instanceof Error && err.name === "AbortError") throw err;
    if (signal.aborted) throw err;
    // 네트워크 일시 오류 1회 재시도 (1초 대기)
    await new Promise(r => setTimeout(r, 1000));
    return fetch(url, { ...init, signal });
  }
}

export async function verifyPhotoWithAI(
  file: File,
  key: VerifyTypeKey,
  externalSignal?: AbortSignal,
): Promise<VerifyResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API 키가 설정되지 않았습니다.");

  // 파일 타입 기본 검증
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 인증할 수 있습니다.");
  }

  const base64 = await compressImage(file);

  // 타임아웃(25초) + 외부 signal 병합
  const timeoutCtrl = new AbortController();
  const timeout = setTimeout(() => timeoutCtrl.abort(), 25_000);
  const combined = externalSignal
    ? mergeSignals([externalSignal, timeoutCtrl.signal])
    : timeoutCtrl;

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: base64 } },
              { text: buildPrompt(key) },
            ],
          }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
      },
      combined.signal,
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => null) as { error?: { message?: string; code?: number } } | null;
      const code = errBody?.error?.code;
      const msg = errBody?.error?.message ?? `HTTP ${response.status}`;
      // 할당량 초과 메시지 친화적으로 변환
      if (code === 429) throw new Error("API 사용량이 초과됐습니다. 잠시 후 다시 시도해주세요.");
      throw new Error(`Gemini: ${msg}`);
    }

    const data = await response.json() as {
      candidates?: { content: { parts: { text: string }[] }; finishReason?: string }[];
    };

    // 안전 필터로 차단된 경우
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === "SAFETY") {
      return { passed: false, score: 0, failedChecks: [], reason: "사진이 안전 정책에 의해 차단됐습니다." };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) return { passed: false, score: 0, failedChecks: [], reason: "AI 응답이 비어있습니다." };

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { passed: false, score: 0, failedChecks: [], reason: "AI 응답을 파싱할 수 없습니다." };

    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    return parseResult(parsed, key);

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("분석 시간이 초과됐습니다. 다시 시도해주세요.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
