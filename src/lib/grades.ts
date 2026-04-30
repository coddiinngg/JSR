export interface Grade {
  level: number;
  name: string;
  code: string;
  minXp: number;
  color: string;
  glow: string;
}

export const GRADES: Grade[] = [
  { level: 1,  name: "베이직",    code: "BASE",      minXp: 0,      color: "#94A3B8", glow: "rgba(148,163,184,0.4)" },
  { level: 2,  name: "레디",      code: "READY",     minXp: 100,    color: "#64748B", glow: "rgba(100,116,139,0.4)" },
  { level: 3,  name: "스타터",    code: "START",     minXp: 250,    color: "#22C55E", glow: "rgba(34,197,94,0.4)"   },
  { level: 4,  name: "챌린저",    code: "CHALLENGE", minXp: 500,    color: "#3B82F6", glow: "rgba(59,130,246,0.4)"  },
  { level: 5,  name: "엔터",      code: "ENTER",     minXp: 800,    color: "#6366F1", glow: "rgba(99,102,241,0.4)"  },
  { level: 6,  name: "무버",      code: "MOVE",      minXp: 1200,   color: "#A855F7", glow: "rgba(168,85,247,0.4)"  },
  { level: 7,  name: "액터",      code: "ACT",       minXp: 1800,   color: "#EC4899", glow: "rgba(236,72,153,0.4)"  },
  { level: 8,  name: "플로워",    code: "FLOW",      minXp: 2600,   color: "#F97316", glow: "rgba(249,115,22,0.4)"  },
  { level: 9,  name: "러너",      code: "RUNNER",    minXp: 3600,   color: "#EF4444", glow: "rgba(239,68,68,0.4)"   },
  { level: 10, name: "부스터",    code: "BOOST",     minXp: 5000,   color: "#FF3355", glow: "rgba(255,51,85,0.4)"   },
  { level: 11, name: "리더",      code: "LEAD",      minXp: 7000,   color: "#F59E0B", glow: "rgba(245,158,11,0.4)"  },
  { level: 12, name: "메이커",    code: "MAKER",     minXp: 9500,   color: "#10B981", glow: "rgba(16,185,129,0.4)"  },
  { level: 13, name: "임팩터",    code: "IMPACT",    minXp: 12500,  color: "#0EA5E9", glow: "rgba(14,165,233,0.4)"  },
  { level: 14, name: "마스터",    code: "MASTER",    minXp: 16000,  color: "#8B5CF6", glow: "rgba(139,92,246,0.4)"  },
  { level: 15, name: "이노베이터", code: "INOVATE",   minXp: 20000,  color: "#FF3355", glow: "rgba(255,51,85,0.5)"   },
];

export function getGrade(xp: number): Grade {
  let grade = GRADES[0];
  for (const g of GRADES) {
    if (xp >= g.minXp) grade = g;
    else break;
  }
  return grade;
}

export function getNextGrade(level: number): Grade | null {
  return GRADES[level] ?? null;
}
