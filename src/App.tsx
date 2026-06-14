import { useAuth } from "./context/AuthContext";
import PublicLayout from "./components/layout/PublicLayout";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import AppShell from "./components/layout/AppShell";
import { Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const auth = !!user;

  return (
    <Routes>
      {/* Landing — uses PublicLayout (navbar + footer) */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={auth ? <Navigate to="/app" replace /> : <LandingPage />}
        />
      </Route>

      {/* Auth pages — use their own PreAuthLayout (dark left panel, no footer) */}
      <Route
        path="/signin"
        element={auth ? <Navigate to="/app" replace /> : <SignInPage />}
      />
      <Route
        path="/signup"
        element={auth ? <Navigate to="/app" replace /> : <SignUpPage />}
      />

      {/* Authenticated — no public layout */}
      <Route
        path="/app"
        element={
          auth ? <AppShell role={user.role} /> : <Navigate to="/" replace />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={auth ? "/app" : "/"} replace />} />
    </Routes>
  );
};

export default App;
