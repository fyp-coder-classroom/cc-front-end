import type { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GridIcon } from "../../components/ui/Icons";

const PreAuthNavbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between h-16">
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-black"
      >
        <GridIcon />
        <span className="font-bold text-base">CoderClassroom</span>
      </button>

      {/* Center links */}
      <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
        <a href="#home" className="hover:text-black transition-colors">
          Home
        </a>

        <a href="#features" className="hover:text-black transition-colors">
          Features
        </a>

        <a href="#who" className="hover:text-black transition-colors">
          About
        </a>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {location.pathname !== "/signin" && (
          <button
            onClick={() => navigate("/signin")}
            className="text-sm text-gray-700 hover:text-black transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
        )}

        {location.pathname !== "/signup" && (
          <button
            onClick={() => navigate("/signup")}
            className="text-sm bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
};

export default PreAuthNavbar;
