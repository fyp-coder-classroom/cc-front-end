// // ─────────────────────────────────────────────
// // components/layout/Sidebar.tsx
// // Fixed left navigation sidebar for the authenticated app.
// // ─────────────────────────────────────────────

// import type { FC } from "react";
// import type { Page } from "../../types";
// import type { Role } from "../../types/auth";
// import { useAuth } from "../../context/AuthContext";
// import {
//   GridIcon,
//   DashboardIcon,
//   ClassesIcon,
//   ProfileIcon,
//   SignOutIcon,
// } from "../ui/Icons";

// interface SidebarProps {
//   role: Role;
//   activePage: Page;
//   setPage: (p: Page) => void;
//   onLogout: () => void;
// }

// interface NavItem {
//   id: Page;
//   label: string;
//   Icon: FC;
// }

// const NAV_ITEMS: NavItem[] = [
//   { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
//   { id: "classes", label: "My Classes", Icon: ClassesIcon },
// ];

// const Sidebar: FC<SidebarProps> = ({ role, activePage, setPage, onLogout }) => {
//   const { user } = useAuth();

//   const isTeacher = role === "teacher";
//   const userName = user?.name ?? (isTeacher ? "Professor" : "Student");
//   const userRole = isTeacher ? "Professor" : "Student";
//   // Initials from the real name, e.g. "Usman Ahmad" → "UA"
//   const initials = userName
//     .split(" ")
//     .map((w) => w[0]?.toUpperCase() ?? "")
//     .slice(0, 2)
//     .join("");

//   return (
//     <aside className="w-[110px] sm:w-28 bg-[#111111] h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800 z-20">
//       {/* ── Logo ── */}
//       <div className="p-4 flex items-center gap-2 border-b border-gray-800">
//         <GridIcon />
//         <span className="text-white font-bold text-xs leading-tight hidden sm:block">
//           Coder
//           <br />
//           Classroom
//         </span>
//       </div>

//       {/* ── Main Navigation ── */}
//       <nav className="flex-1 p-3 space-y-1 mt-2">
//         <p className="text-gray-500 text-[10px] uppercase tracking-widest px-2 mb-2">
//           Overview
//         </p>
//         {NAV_ITEMS.map(({ id, label, Icon }) => (
//           <button
//             key={id}
//             onClick={() => setPage(id)}
//             className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
//               activePage === id
//                 ? "bg-white text-black font-semibold"
//                 : "text-gray-400 hover:text-white hover:bg-gray-800"
//             }`}
//           >
//             <Icon />
//             <span className="hidden sm:block">{label}</span>
//           </button>
//         ))}
//       </nav>

//       {/* ── Account Links ── */}
//       <div className="p-3 border-t border-gray-800 space-y-1">
//         <p className="text-gray-500 text-[10px] uppercase tracking-widest px-2 mb-2">
//           Account
//         </p>
//         <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
//           <ProfileIcon />
//           <span className="hidden sm:block">Profile</span>
//         </button>
//         <button
//           onClick={onLogout}
//           className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
//         >
//           <SignOutIcon />
//           <span className="hidden sm:block">Sign Out</span>
//         </button>
//       </div>

//       {/* ── User Info ── */}
//       <div className="p-3 border-t border-gray-800">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//             {initials}
//           </div>
//           <div className="hidden sm:block">
//             <p className="text-white text-xs font-medium leading-tight">
//               {userName}
//             </p>
//             <p className="text-gray-500 text-[10px]">{userRole}</p>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



// components/layout/Sidebar.tsx
// Narrow sidebar — responsive on all devices
// Logo click → goes to dashboard
// Mobile: icon-only, Desktop: icon + label

// import type { FC } from "react";
// import type { Page } from "../../types";
// import {
//   GridIcon,
//   DashboardIcon,
//   ClassesIcon,
//   ProfileIcon,
//   SignOutIcon,
// } from "../ui/Icons";

// interface NavItem {
//   id:    Page;
//   label: string;
//   Icon:  FC;
// }

// const NAV_ITEMS: NavItem[] = [
//   { id: "dashboard", label: "Dashboard",  Icon: DashboardIcon },
//   { id: "classes",   label: "My Classes", Icon: ClassesIcon   },
// ];

// interface SidebarProps {
//   role:       "teacher" | "student";
//   activePage: Page;
//   setPage:    (page: Page) => void;
//   onLogout:   () => void;
// }

// const Sidebar: FC<SidebarProps> = ({ role, activePage, setPage, onLogout }) => {
//   const isTeacher = role === "teacher";
//   const userName  = isTeacher ? "Usman Ahmad" : "Ali Hassan";
//   const userRole  = isTeacher ? "Professor"   : "Student";
//   const initials  = isTeacher ? "UA"           : "AH";

//   return (
//     <>
//       {/* ── Desktop Sidebar ── */}
//       <aside className="
//         hidden md:flex
//         w-16 lg:w-64
//         bg-[#111111]
//         h-screen fixed left-0 top-0
//         flex-col
//         border-r border-gray-800
//         z-20
//         transition-all duration-200
//       ">
//         {/* Logo — click goes to dashboard */}
//         <button
//           onClick={() => setPage("dashboard")}
//           className="flex items-center gap-3 p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors w-full"
//         >
//           <div className="flex-shrink-0 text-white">
//             <GridIcon />
//           </div>
//           <span className="text-white font-bold text-xs leading-tight hidden lg:block text-left">
//             Coder<br />Classroom
//           </span>
//         </button>

//         {/* Main Nav */}
//         <nav className="flex-1 p-2 space-y-1 mt-2">
//           <p className="text-gray-600 text-[9px] uppercase tracking-widest px-2 mb-2 hidden lg:block">
//             Overview
//           </p>
//           {NAV_ITEMS.map(({ id, label, Icon }) => (
//             <button
//               key={id}
//               onClick={() => setPage(id)}
//               className={`
//                 w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs transition-colors
//                 ${activePage === id
//                   ? "bg-white text-black font-semibold"
//                   : "text-gray-400 hover:text-white hover:bg-gray-800"
//                 }
//               `}
//               title={label}
//             >
//               <div className="flex-shrink-0"><Icon /></div>
//               <span className="hidden lg:block">{label}</span>
//             </button>
//           ))}
//         </nav>

//         {/* Account */}
//         <div className="p-2 border-t border-gray-800 space-y-1">
//           <p className="text-gray-600 text-[9px] uppercase tracking-widest px-2 mb-2 hidden lg:block">
//             Account
//           </p>
//           <button
//   onClick={() => setPage("profile")}
//   className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
//   title="Profile"
// >
//             <div className="flex-shrink-0"><ProfileIcon /></div>
//             <span className="hidden lg:block">Profile</span>
//           </button>
//           <button
//             onClick={onLogout}
//             className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
//             title="Sign Out"
//           >
//             <div className="flex-shrink-0"><SignOutIcon /></div>
//             <span className="hidden lg:block">Sign Out</span>
//           </button>
//         </div>

//         {/* User Info */}
//         <div className="p-3 border-t border-gray-800">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//               {initials}
//             </div>
//             <div className="hidden lg:block min-w-0">
//               <p className="text-white text-xs font-medium leading-tight truncate">{userName}</p>
//               <p className="text-gray-500 text-[10px]">{userRole}</p>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* ── Mobile Bottom Nav ── */}
//       <nav className="
//         md:hidden
//         fixed bottom-0 left-0 right-0
//         bg-[#111111] border-t border-gray-800
//         z-20
//         flex items-center justify-around
//         px-4 py-2
//       ">
//         {NAV_ITEMS.map(({ id, label, Icon }) => (
//           <button
//             key={id}
//             onClick={() => setPage(id)}
//             className={`
//               flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors
//               ${activePage === id ? "text-white" : "text-gray-500"}
//             `}
//           >
//             <Icon />
//             <span className="text-[10px]">{label}</span>
//           </button>
//         ))}
//         <button
//           onClick={onLogout}
//           className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg text-gray-500 transition-colors"
//         >
//           <SignOutIcon />
//           <span className="text-[10px]">Logout</span>
//         </button>
//          <button
//           onClick={onLogout}
//           className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg text-gray-500 transition-colors"
//         >
//           <ProfileIcon />
//           <span className="text-[10px]">Profile</span>
//         </button>
//       </nav>
//     </>
//   );
// };

// export default Sidebar;



// components/layout/Sidebar.tsx — Fixed:
// 1. Dynamic name from useAuth()
// 2. Mobile profile button properly navigates to profile
// 3. Logo click → dashboard

import type { FC } from "react";
import type { Page } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  GridIcon,
  DashboardIcon,
  ClassesIcon,
  ProfileIcon,
  SignOutIcon,
} from "../ui/Icons";

interface NavItem {
  id:    Page;
  label: string;
  Icon:  FC;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",  Icon: DashboardIcon },
  { id: "classes",   label: "My Classes", Icon: ClassesIcon   },
];

interface SidebarProps {
  role:       "teacher" | "student";
  activePage: Page;
  setPage:    (page: Page) => void;
  onLogout:   () => void;
}

const Sidebar: FC<SidebarProps> = ({ role, activePage, setPage, onLogout }) => {
  const { user } = useAuth();

  // ── Dynamic name from logged-in user ──────
  const userName = user?.name ?? (role === "teacher" ? "Teacher" : "Student");
  const userRole = role === "teacher" ? "Professor" : "Student";

  // Initials from name — e.g. "Usman Ahmad" → "UA"
  const initials = userName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <>
      {/* ── Desktop Sidebar ── */}
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
        {/* Logo — click goes to dashboard */}
        <button
          onClick={() => setPage("dashboard")}
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
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`
                w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs transition-colors
                ${activePage === id
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
        <div className="p-2 border-t border-gray-800 space-y-1">
          <p className="text-gray-600 text-[9px] uppercase tracking-widest px-2 mb-2 hidden lg:block">
            Account
          </p>
          <button
            onClick={() => setPage("profile")}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Profile"
          >
            <div className="flex-shrink-0"><ProfileIcon /></div>
            <span className="hidden lg:block">Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Sign Out"
          >
            <div className="flex-shrink-0"><SignOutIcon /></div>
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>

        {/* User Info — Dynamic */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-white text-xs font-medium leading-tight truncate">{userName}</p>
              <p className="text-gray-500 text-[10px]">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="
        md:hidden
        fixed bottom-0 left-0 right-0
        bg-[#111111] border-t border-gray-800
        z-20
        flex items-center justify-around
        px-4 py-2
      ">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`
              flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
              ${activePage === id ? "text-white" : "text-gray-500"}
            `}
          >
            <Icon />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}

        {/* Profile button — mobile */}
        <button
          onClick={() => setPage("profile")}
          className={`
            flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
            ${activePage === "profile" ? "text-white" : "text-gray-500"}
          `}
        >
          <ProfileIcon />
          <span className="text-[10px]">Profile</span>
        </button>

        {/* Logout button — mobile */}
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