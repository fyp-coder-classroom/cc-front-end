import type { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  GridIcon,
  DashboardIcon,
  ClassesIcon,
  SignOutIcon,
} from "../ui/Icons";

interface NavItem {
  path:  string;
  label: string;
  Icon:  FC;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/app",         label: "Dashboard",  Icon: DashboardIcon },
  { path: "/app/classes", label: "My Classes", Icon: ClassesIcon   },
];

interface SidebarProps {
  role:     "teacher" | "student";
  onLogout: () => void;
}

const Sidebar: FC<SidebarProps> = ({ role, onLogout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = user?.name ?? (role === "teacher" ? "Teacher" : "Student");
  const userRole = role === "teacher" ? "Professor" : "Student";

  // Initials from name - e.g. "Usman Ahmad" - "UA"
  const initials = userName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  // "My Classes" stays highlighted for /app/classes AND any nested
  // classroom/assignment detail route underneath it.
  const isActive = (path: string): boolean => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  const isProfileActive = location.pathname === "/app/profile";

  return (
    <>
      {/*  Desktop Sidebar  */}
      <aside className="
        hidden md:flex
        w-16 lg:w-64
        bg-[#111111]
        h-screen fixed left-0 top-0
        flex-col
        border-r border-gray-800
        z-20
        transition-all duration-200
      ">
        {/* Logo - click goes to dashboard */}
        <button
          onClick={() => navigate("/app")}
          className="flex items-center gap-3 p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors w-full"
        >
          <div className="flex-shrink-0 text-white">
            <GridIcon />
          </div>
          <span className="text-white font-bold text-xs leading-tight hidden lg:block text-left">
            Coder<br />Classroom
          </span>
        </button>

        {/* Main Nav */}
        <nav className="flex-1 p-2 space-y-1 mt-2">
          <p className="text-gray-600 text-[9px] uppercase tracking-widest px-2 mb-2 hidden lg:block">
            Overview
          </p>
          {NAV_ITEMS.map(({ path, label, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs transition-colors
                ${isActive(path)
                  ? "bg-white text-black font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}
              title={label}
            >
              <div className="flex-shrink-0"><Icon /></div>
              <span className="hidden lg:block">{label}</span>
            </button>
          ))}
        </nav>

        {/* Account */}
        <div className="p-2 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Sign Out"
          >
            <div className="flex-shrink-0"><SignOutIcon /></div>
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>

        {/* User Info - click - /app/profile */}
        <button
          onClick={() => navigate("/app/profile")}
          className={`
            p-3 border-t border-gray-800 w-full text-left transition-colors
            ${isProfileActive ? "bg-gray-800" : "hover:bg-gray-900"}
          `}
          title="View Profile"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-white text-xs font-medium leading-tight truncate">{userName}</p>
              <p className="text-gray-500 text-[10px]">{userRole}</p>
            </div>
          </div>
        </button>
      </aside>

      {/*  Mobile Bottom Nav  */}
      <nav className="
        md:hidden
        fixed bottom-0 left-0 right-0
        bg-[#111111] border-t border-gray-800
        z-20
        flex items-center justify-around
        px-4 py-2
      ">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`
              flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
              ${isActive(path) ? "text-white" : "text-gray-500"}
            `}
          >
            <Icon />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}

        {/* User avatar - click - /app/profile (mobile) */}
        <button
          onClick={() => navigate("/app/profile")}
          className="flex flex-col items-center gap-1 px-3 py-1.5"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isProfileActive ? "bg-white text-black" : "bg-gray-600 text-white"
          }`}>
            {initials}
          </div>
          <span className={`text-[10px] ${isProfileActive ? "text-white" : "text-gray-500"}`}>
            Profile
          </span>
        </button>

        {/* Logout button - mobile */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-gray-500 transition-colors"
        >
          <SignOutIcon />
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;