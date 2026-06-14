// // Authenticated app wrapper: sidebar + main content.
// // Renders the correct page based on role and active page.
// // ─────────────────────────────────────────────

// import { useState, type FC } from "react";
// import type { AppShellProps, Page } from "../../types";
// import { useAuth } from "../../context/AuthContext";
// import Sidebar from "./Sidebar";
// import TeacherDashboard from "../../pages/teacher/TeacherDashboard";
// import TeacherClasses from "../../pages/teacher/TeacherClasses";
// import StudentDashboard from "../../pages/student/StudentDashboard";
// import StudentClasses from "../../pages/student/StudentClasses";

// const AppShell: FC<AppShellProps> = ({ role }) => {
//   const { logout } = useAuth();
//   const [page, setPage] = useState<Page>("dashboard");

//   const renderPage = () => {
//     if (role === "teacher") {
//       return page === "dashboard" ? <TeacherDashboard /> : <TeacherClasses />;
//     }
//     return page === "dashboard" ? <StudentDashboard /> : <StudentClasses />;
//   };

//   return (
//     <div className="min-h-screen bg-[#0d0d0d] flex">
//       <Sidebar
//         role={role}
//         activePage={page}
//         setPage={setPage}
//         onLogout={logout}
//       />
//       <main className="flex-1 ml-[110px] p-5 sm:p-6 lg:p-8 overflow-auto">
//         {renderPage()}
//       </main>
//     </div>
//   );
// };

// export default AppShell;



// AppShell.tsx — with classroom navigation + responsive margins

import { useState, type FC } from "react";
import type { AppShellProps, Page } from "../../types";
import { useAuth }          from "../../context/AuthContext";
import Sidebar              from "./Sidebar";
import TeacherDashboard     from "../../pages/teacher/TeacherDashboard";
import TeacherClasses       from "../../pages/teacher/TeacherClasses";
import StudentDashboard     from "../../pages/student/StudentDashboard";
import StudentClasses       from "../../pages/student/StudentClasses";
import ClassroomDetail      from "../../pages/classroom/ClassroomDetail";
import ProfilePage from "../../pages/ProfilePage";

const AppShell: FC<AppShellProps> = ({ role }) => {
  const { logout } = useAuth();
  const [page,              setPage]              = useState<Page>("dashboard");
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);

  const openClassroom  = (id: string) => setSelectedClassroom(id);
  const closeClassroom = ()           => setSelectedClassroom(null);

  const handleSetPage = (p: Page) => {
    setPage(p);
    setSelectedClassroom(null);
  };

  const renderPage = () => {
    if (page === "profile") {
  return <ProfilePage />;
}
    if (selectedClassroom) {
      return (
        <ClassroomDetail
          classroomId={selectedClassroom}
          role={role}
          onBack={closeClassroom}
        />
      );
    }

    if (role === "teacher") {
      return page === "dashboard"
        ? <TeacherDashboard onOpenClassroom={openClassroom} />
        : <TeacherClasses   onOpenClassroom={openClassroom} />;
    }

    return page === "dashboard"
      ? <StudentDashboard onOpenClassroom={openClassroom} />
      : <StudentClasses   onOpenClassroom={openClassroom} />;
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      <Sidebar
        role={role}
        activePage={selectedClassroom ? "classes" : page}
        setPage={handleSetPage}
        onLogout={logout}
      />

      {/* 
        Desktop: ml-16 (icon-only) or ml-64 (full sidebar)
        Mobile:  no left margin, bottom padding for bottom nav
      */}
      <main className="
        flex-1
        md:ml-16 lg:ml-64
        p-4 sm:p-5 lg:p-8
        pb-20 md:pb-8
        overflow-auto
        min-h-screen
      ">
        {renderPage()}
      </main>
    </div>
  );
};

export default AppShell;
