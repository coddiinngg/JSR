import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout({ showNav = true }: { showNav?: boolean }) {
  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden max-w-md mx-auto shadow-2xl">
      <Outlet />
      {showNav && <BottomNav />}
    </div>
  );
}
