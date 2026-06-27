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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const auth = !!user;
  const animationKey = location.pathname.split("/")[1];

  return (
    <div key={animationKey} className="animate-page">
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

        {/*
        Authenticated — AppShell renders the sidebar + topbar shell.
        Everything UNDER /app/* is a nested route inside AppShell's
        own <Routes> (see AppShell.tsx) so the URL always reflects:
          /app                                          → dashboard
          /app/classes                                  → classroom list
          /app/classes/:classroomId                     → classroom detail
          /app/classes/:classroomId/assignments/:id     → assignment detail
          /app/profile                                  → profile
        This is what makes refresh/back-button work correctly —
        previously this was all useState, which reset on every reload.
      */}
        <Route
          path="/app/*"
          element={
            auth ? <AppShell role={user.role} /> : <Navigate to="/" replace />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={auth ? "/app" : "/"} replace />}
        />
      </Routes>
    </div>
  );
};

export default App;
