import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: Home, label: "홈", href: "/" },
  { icon: Trophy, label: "챌린지", href: "/challenge" },
  { icon: BarChart2, label: "통계", href: "/stats" },
  { icon: User, label: "프로필", href: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-2 pt-2 z-50" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.04)", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200",
                isActive
                  ? "text-[#FF3355]"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon
                className={cn("w-6 h-6 transition-transform duration-200", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn("text-[10px] leading-none", isActive ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
