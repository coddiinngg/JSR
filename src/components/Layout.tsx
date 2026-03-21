import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout({ showNav = true }: { showNav?: boolean }) {
  return (
    <div
      className="relative flex flex-1 w-full flex-col bg-white dark:bg-[#1e1e2e] text-slate-900 dark:text-slate-100 font-display overflow-hidden max-w-md mx-auto"
      style={{ height: "100dvh", maxHeight: "100dvh", boxShadow: "0 0 60px rgba(0,0,0,0.15)" }}
    >
      <Outlet />
      {showNav && <BottomNav />}
    </div>
  );
}
