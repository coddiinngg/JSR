import { Link, useLocation } from "react-router-dom";
import { Home, ListChecks, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { icon: Home, label: "홈", href: "/" },
  { icon: ListChecks, label: "목표", href: "/goals" },
  { icon: Trophy, label: "챌린지", href: "/challenge" },
  { icon: BarChart2, label: "통계", href: "/stats" },
  { icon: User, label: "프로필", href: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 pt-2 pb-6 z-50">
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
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
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
