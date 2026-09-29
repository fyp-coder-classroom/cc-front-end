import { useEffect, type FC } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { AppShellProps } from "../../types";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import TeacherDashboard from "../../pages/teacher/TeacherDashboard";
import TeacherClasses from "../../pages/teacher/TeacherClasses";
import StudentDashboard from "../../pages/student/StudentDashboard";
import StudentClasses from "../../pages/student/StudentClasses";
import ClassroomDetail from "../../pages/classroom/ClassroomDetail";
import AssignmentDetail from "../../pages/assignment/AssignmentDetail";
import SubmissionDetail from "../../pages/submission/SubmissionDetail";
import ProfilePage from "../../pages/ProfilePage";

const AppShell: FC<AppShellProps> = ({ role }) => {
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const animationKey = location.pathname.split("/").slice(0, 3).join("/");

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar role={role} onLogout={logout} />

      <main
        className="
          flex-1
          min-w-0
          md:ml-16 lg:ml-64
          p-4 sm:p-5 lg:p-8
          pb-20 md:pb-8
          min-h-screen
        "
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="min-w-0 w-full"
          >
            <Routes>
              {/* Dashboard */}
              <Route index 
                element={ role === "teacher" ? (<TeacherDashboard />) : ( <StudentDashboard />)}
              />

              {/* My Classes */}
              <Route
                path="classes"
                element={ role === "teacher" ? (<TeacherClasses />) : (<StudentClasses />)}
              />

              {/* Classroom detail */}
              <Route
                path="classes/:classroomId"
                element={<ClassroomDetail role={role} />}
              />

              {/* Assignment detail */}
              <Route
                path="classes/:classroomId/assignments/:assignmentId"
                element={<AssignmentDetail role={role} />}
              />

              {/* Single submission detail - teacher */}
              <Route
                path="classes/:classroomId/assignments/:assignmentId/submissions/:submissionId"
                element={<SubmissionDetail role="teacher" />}
              />

              {/* Profile */}
              <Route path="profile"
                element={<ProfilePage />} />

              {/* Fallback */}
              <Route path="*" 
                element={<Navigate to="/app" replace />} />
            </Routes>
            
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppShell;