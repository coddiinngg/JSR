import { createContext, useContext, useState, type ReactNode } from "react";

type CoachType = "king" | "pressure" | "gentle";

interface CoachConfig {
  type: CoachType;
  emoji: string;
  label: string;
  messages: string[];
}

export const COACH_CONFIGS: Record<CoachType, CoachConfig> = {
  king: {
    type: "king",
    emoji: "👑",
    label: "잔소리 대마왕",
    messages: [
      "지금 안 하면 언제 하려고???!!",
      "아직도 안 했어? 내가 아까부터 하라고 했잖아. 나중에 또 밤에 허겁지겁 할 거지?",
      "이상한 핑계 대지 말고 얼른 해!",
    ],
  },
  pressure: {
    type: "pressure",
    emoji: "⏰",
    label: "압박",
    messages: [
      "아직 안 했네? 시간이 많지 않을텐데?",
      "엄마는 그냥 말해주는 거야. 나중에 힘든 건 너잖아",
      "지금 잠깐만 하자. 시작하면 생각보다 금방 끝나",
    ],
  },
  gentle: {
    type: "gentle",
    emoji: "🌿",
    label: "온화",
    messages: [
      "오늘 조금만 해도 충분해. 같이 해보자!",
      "시작이 제일 어려운 거야. 일단 해보자",
      "할 수 있는 거 다 알아. 조금만 해보자",
    ],
  },
};

/* ── 카테고리 메타 ── */
export const CATEGORY_META: Record<string, { color: string; colorRgb: string; label: string }> = {
  exercise: { color: "#FF3355", colorRgb: "255,51,85",  label: "운동" },
  study:    { color: "#3b82f6", colorRgb: "59,130,246", label: "공부" },
  reading:  { color: "#FB923C", colorRgb: "251,146,60", label: "독서" },
  habit:    { color: "#a855f7", colorRgb: "168,85,247", label: "습관" },
  hobby:    { color: "#22c55e", colorRgb: "34,197,94",  label: "취미" },
  etc:      { color: "#38BDF8", colorRgb: "56,189,248", label: "기타" },
};

/* ── Goal 타입 ── */
export interface Goal {
  id: string;
  title: string;
  color: string;
  colorRgb: string;
  category: string;
  frequency: string;
  notifyTime: string;
  streak: number;
  progress: number;
  completedToday: boolean;
  skippedToday: boolean;
}

/* ── 목표 추가 마법사 드래프트 ── */
export interface GoalDraft {
  category: string;
  frequency: string;
}

/* ── 기본 목표 데이터 ── */
const DEFAULT_GOALS: Goal[] = [
  { id: "1", title: "30분 유산소",   color: "#FF3355", colorRgb: "255,51,85",  category: "exercise", frequency: "daily", notifyTime: "07:00", streak: 8, progress: 60, completedToday: false, skippedToday: false },
  { id: "2", title: "물 2L 마시기",  color: "#38BDF8", colorRgb: "56,189,248", category: "habit",    frequency: "daily", notifyTime: "08:00", streak: 5, progress: 45, completedToday: false, skippedToday: false },
  { id: "3", title: "독서 30페이지", color: "#FB923C", colorRgb: "251,146,60", category: "reading",  frequency: "daily", notifyTime: "21:00", streak: 0, progress: 0,  completedToday: false, skippedToday: false },
];

interface AppContextType {
  coachType: CoachType;
  setCoachType: (t: CoachType) => void;
  getRandomMessage: () => { emoji: string; text: string; label: string };
  nickname: string;
  setNickname: (n: string) => void;
  recoveryTickets: number;
  useRecoveryTicket: () => boolean;
  // Goals
  goals: Goal[];
  goalDraft: GoalDraft;
  setGoalDraft: (patch: Partial<GoalDraft>) => void;
  addGoal: (name: string, notifyTime: string) => void;
  completeGoalToday: (id: string) => void;
  skipGoalToday: (id: string) => void;
  verifyingGoalId: string | null;
  setVerifyingGoalId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [coachType, setCoachType] = useState<CoachType>("pressure");
  const [nickname, setNickname] = useState("이름");
  const [recoveryTickets, setRecoveryTickets] = useState(2);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [goalDraft, setGoalDraftState] = useState<GoalDraft>({ category: "exercise", frequency: "daily" });
  const [verifyingGoalId, setVerifyingGoalId] = useState<string | null>(null);

  function getRandomMessage() {
    const cfg = COACH_CONFIGS[coachType];
    const text = cfg.messages[Math.floor(Math.random() * cfg.messages.length)];
    return { emoji: cfg.emoji, text, label: cfg.label };
  }

  function useRecoveryTicket() {
    if (recoveryTickets <= 0) return false;
    setRecoveryTickets(n => n - 1);
    return true;
  }

  function setGoalDraft(patch: Partial<GoalDraft>) {
    setGoalDraftState(prev => ({ ...prev, ...patch }));
  }

  function addGoal(name: string, notifyTime: string) {
    const meta = CATEGORY_META[goalDraft.category] ?? CATEGORY_META.etc;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: name,
      color: meta.color,
      colorRgb: meta.colorRgb,
      category: goalDraft.category,
      frequency: goalDraft.frequency,
      notifyTime,
      streak: 0,
      progress: 0,
      completedToday: false,
      skippedToday: false,
    };
    setGoals(prev => [...prev, newGoal]);
    setGoalDraftState({ category: "exercise", frequency: "daily" });
  }

  function completeGoalToday(id: string) {
    setGoals(prev => prev.map(g =>
      g.id === id
        ? { ...g, completedToday: true, streak: g.streak + 1, progress: Math.min(g.progress + 10, 100) }
        : g
    ));
  }

  function skipGoalToday(id: string) {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, skippedToday: true } : g
    ));
  }

  return (
    <AppContext.Provider value={{
      coachType, setCoachType, getRandomMessage,
      nickname, setNickname,
      recoveryTickets, useRecoveryTicket,
      goals, goalDraft, setGoalDraft, addGoal, completeGoalToday, skipGoalToday,
      verifyingGoalId, setVerifyingGoalId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be within AppProvider");
  return ctx;
}
