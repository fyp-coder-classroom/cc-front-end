// Reusable page header - same across all pages
// Dynamic title + dynamic button based on page/role

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon } from "../ui/Icons";

const PageHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;

  // Determine current page from URL
  const isClassroom = location.pathname.includes("/classes/");
  const isClasses = location.pathname.endsWith("/classes");
  const isDashboard = location.pathname.endsWith("/dashboard");
  const isProfile = location.pathname.endsWith("/profile");

  // ── Dynamic Page Title
  const getTitle = (): string => {
    if (isClassroom) return "Classroom Detail";
    if (isClasses) return "My Classes";
    if (isProfile) return "My Profile";
    return "Dashboard";
  };

  // ── Dynamic Button
  const getButton = () => {
    // No button on classroom detail or profile
    if (isClassroom || isProfile) return null;

    if (role === "teacher") {
      if (isDashboard || isClasses) {
        return (
          <button
            onClick={() => navigate("/app/classes")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            <PlusIcon /> Create Class
          </button>
        );
      }
    }

    if (role === "student") {
      if (isDashboard || isClasses) {
        return (
          <button
            onClick={() => navigate("/app/classes")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            <PlusIcon /> Join Class
          </button>
        );
      }
    }

    return null;
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-text">{getTitle()}</h1>
        <p className="text-text-muted text-xs mt-0.5">
          {user?.name} · {role === "teacher" ? "Professor" : "Student"}
        </p>
      </div>
      {getButton()}
    </div>
  );
};

export default PageHeader;
