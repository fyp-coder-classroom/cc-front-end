import type { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GridIcon } from "../../components/ui/Icons";
import ThemePicker from "../ui/ThemePicker";

const PreAuthNavbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnLanding = location.pathname === "/";

  const handleNavLink = (sectionId: string) => {
    if (isOnLanding) {
      // Already on landing page
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Not on landing page - navigate to landing with hash
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border px-6 py-4 flex items-center justify-between h-16">
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-text"
      >
        <GridIcon />
        <span className="font-bold text-base">CoderClassroom</span>
      </button>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-6 text-sm text-text-muted">
        <button
          onClick={() => handleNavLink("home")}
          className="hover:text-text transition-colors"
        >
          Home
        </button>
        <button
          onClick={() => handleNavLink("features")}
          className="hover:text-text transition-colors"
        >
          Features
        </button>
        <button
          onClick={() => handleNavLink("who")}
          className="hover:text-text transition-colors"
        >
          About
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {location.pathname !== "/signin" && (
          <button
            onClick={() => navigate("/signin")}
            className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
        )}
        {location.pathname !== "/signup" && (
          <button
            onClick={() => navigate("/signup")}
            className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Get Started
          </button>
        )}
        <ThemePicker />
      </div>
    </nav>
  );
};

export default PreAuthNavbar;