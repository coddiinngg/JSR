import { cn } from "../lib/utils";

export type CoachType = "king" | "pressure" | "gentle";

const COACH_IMAGE: Record<CoachType, string> = {
  king:     "/coaches/king.png",
  pressure: "/coaches/pressure.png",
  gentle:   "/coaches/gentle.png",
};

export function CoachCharacter({
  type,
  size = 120,
  animated = true,
  className,
}: {
  type: CoachType;
  size?: number;
  animated?: boolean;
  talking?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex items-center justify-center select-none", className)}
      style={{
        width: size,
        height: size,
        animation: animated ? "char-bob 2.8s ease-in-out infinite" : undefined,
      }}
    >
      <style>{`
        @keyframes char-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
      <img
        src={COACH_IMAGE[type]}
        alt={type}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 8%",
        }}
        draggable={false}
      />
    </div>
  );
}
