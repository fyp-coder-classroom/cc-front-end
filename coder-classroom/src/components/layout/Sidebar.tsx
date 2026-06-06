// ─────────────────────────────────────────────
// components/layout/Sidebar.tsx
// Fixed left navigation sidebar for the authenticated app.
// Props: see SidebarProps in types/index.ts
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { SidebarProps, Page } from "../../types";
import {
  GridIcon,
  DashboardIcon,
  ClassesIcon,
  ProfileIcon,
  SignOutIcon,
} from "../ui/Icons";

interface NavItem {
  id: Page;
  label: string;
  Icon: FC;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",  Icon: DashboardIcon },
  { id: "classes",   label: "My Classes", Icon: ClassesIcon   },
];

const Sidebar: FC<SidebarProps> = ({ role, activePage, setPage, setScreen }) => {
  const isTeacher = role === "teacher";
  const userName  = isTeacher ? "Usman Ahmad" : "Hamid Raza";
  const userRole  = isTeacher ? "Professor"   : "Student";
  const initials  = isTeacher ? "UA"           : "HR";

  return (
    <aside className="w-[110px] sm:w-28 bg-[#111111] h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800 z-20">

      {/* ── Logo / Home ── */}
      <div
        className="p-4 flex items-center gap-2 cursor-pointer border-b border-gray-800"
        onClick={() => setScreen("landing")}
      >
        <GridIcon />
        <span className="text-white font-bold text-xs leading-tight hidden sm:block">
          Coder<br />Classroom
        </span>
      </div>

      {/* ── Main Navigation ── */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest px-2 mb-2">Overview</p>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
              activePage === id
                ? "bg-white text-black font-semibold"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Icon />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Account Links ── */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest px-2 mb-2">Account</p>
        <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ProfileIcon />
          <span className="hidden sm:block">Profile</span>
        </button>
        <button
          onClick={() => setScreen("landing")}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <SignOutIcon />
          <span className="hidden sm:block">Sign Out</span>
        </button>
      </div>

      {/* ── User Info ── */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-xs font-medium leading-tight">{userName}</p>
            <p className="text-gray-500 text-[10px]">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
