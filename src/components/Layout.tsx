import { Outlet, NavLink } from "react-router";
import { MessageSquare, Settings, Users, Sparkles, History, Library } from "lucide-react";
import { cn } from "../lib/utils";

export default function Layout() {
  return (
    <div className="relative h-[100dvh] w-full text-white flex flex-col md:flex-row overflow-hidden">
      <div className="atmosphere-bg"></div>
      
      <aside className="md:w-64 glass-panel border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-4 z-10 shrink-0">
        <div className="mb-2 md:mb-8 px-2 flex items-center justify-between md:justify-start gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-orange-500" size={24} />
            <h1 className="serif-title text-2xl font-semibold tracking-wide">Clio</h1>
          </div>
        </div>
        
        <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
          <NavItem to="/" icon={<Users size={20} />} label="새로운 만남" />
          <NavItem to="/chats" icon={<History size={20} />} label="대화 기록" />
          <NavItem to="/characters" icon={<Library size={20} />} label="캐릭터 관리" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="설정" />
        </nav>

        <div className="mt-auto hidden md:block px-2 py-4 text-left">
          <p className="text-xs text-white/40 mb-1">마스터의 파트너, 클리오입니다.</p>
          <p className="text-xs text-white/30 italic">"당신의 상상을 현실로 만들어줄게요."</p>
        </div>
      </aside>
      
      <main className="flex-1 relative z-0 h-full overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap",
          isActive
            ? "bg-white/10 text-white font-medium"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
