import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout({ showNav = true }: { showNav?: boolean }) {
  return (
    <div
      className="relative flex h-screen w-full flex-col bg-white text-slate-900 font-display overflow-hidden max-w-md mx-auto"
      style={{ boxShadow: "0 0 60px rgba(0,0,0,0.15)" }}
    >
      <Outlet />
      {showNav && <BottomNav />}
    </div>
  );
}
