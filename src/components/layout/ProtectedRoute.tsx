import type { FC, ReactNode } from "react";
import type { Screen } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  setScreen: (screen: Screen) => void;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, setScreen }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    setScreen("signin");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
