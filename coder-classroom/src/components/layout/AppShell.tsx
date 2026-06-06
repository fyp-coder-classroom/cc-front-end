// ─────────────────────────────────────────────
// components/layout/AppShell.tsx
// Authenticated app wrapper: sidebar + main content.
// Renders the correct page based on role and active page.
// Props: see AppShellProps in types/index.ts
// ─────────────────────────────────────────────

import { useState, type FC } from "react";
import type { AppShellProps, Page } from "../../types";
import Sidebar          from "./Sidebar";
import TeacherDashboard from "../../pages/teacher/TeacherDashboard";
import TeacherClasses   from "../../pages/teacher/TeacherClasses";
import StudentDashboard from "../../pages/student/StudentDashboard";
import StudentClasses   from "../../pages/student/StudentClasses";

const AppShell: FC<AppShellProps> = ({ role, setScreen }) => {
  const [page, setPage] = useState<Page>("dashboard");

  const renderPage = () => {
    if (role === "teacher") {
      return page === "dashboard" ? <TeacherDashboard /> : <TeacherClasses />;
    }
    return page === "dashboard" ? <StudentDashboard /> : <StudentClasses />;
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      <Sidebar
        role={role}
        activePage={page}
        setPage={setPage}
        setScreen={setScreen}
      />
      <main className="flex-1 ml-[110px] p-5 sm:p-6 lg:p-8 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default AppShell;
