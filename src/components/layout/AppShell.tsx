import type { FC } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { AppShellProps } from "../../types";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import TeacherDashboard from "../../pages/teacher/TeacherDashboard";
import TeacherClasses from "../../pages/teacher/TeacherClasses";
import StudentDashboard from "../../pages/student/StudentDashboard";
import StudentClasses from "../../pages/student/StudentClasses";
import ClassroomDetail from "../../pages/classroom/ClassroomDetail";
import AssignmentDetail from "../../pages/assignment/AssignmentDetail";
import ProfilePage from "../../pages/ProfilePage";


const AppShell: FC<AppShellProps> = ({ role }) => {
  const { logout } = useAuth();
  const location = useLocation();
  

  // Use only the first two segments so nested param changes
  // (e.g. /app/classes/123 → /app/classes/456) still animate,
  // but re-renders within the same page don't re-trigger.
  const animationKey = location.pathname.split("/").slice(0, 3).join("/");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} onLogout={logout} />

      {/*
        Desktop: ml-16 (icon-only) or ml-64 (full sidebar)
        Mobile:  no left margin, bottom padding for bottom nav
      */}
      <main
        className="
        flex-1
        md:ml-16 lg:ml-64
        p-4 sm:p-5 lg:p-8
        pb-20 md:pb-8
        overflow-auto
        min-h-screen
      "
      >
        
        <div key={animationKey} className="animate-page">
          <Routes>
            {/* /app - Dashboard */}
            <Route
              index
              element={
                role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />
              }
            />

            {/* /app/classes - Classroom list */}
            <Route
              path="classes"
              element={
                role === "teacher" ? <TeacherClasses /> : <StudentClasses />
              }
            />

            {/* /app/classes/:classroomId - Single classroom */}
            <Route
              path="classes/:classroomId"
              element={<ClassroomDetail role={role} />}
            />

            {/* /app/classes/:classroomId/assignments/:assignmentId - Single assignment */}
            <Route
              path="classes/:classroomId/assignments/:assignmentId"
              element={<AssignmentDetail role={role} />}
            />

            {/* /app/profile → Profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Fallback inside /app/* */}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AppShell;
