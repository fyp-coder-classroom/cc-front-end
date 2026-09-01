import { useAuth } from "./context/AuthContext";
import PublicLayout from "./components/layout/PublicLayout";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import AppShell from "./components/layout/AppShell";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const auth = !!user;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={auth ? "auth" : "guest"}>

        {/* Landing */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              auth
                ? <Navigate to="/app" replace />
                : <PageTransition><LandingPage /></PageTransition>
            }
          />
        </Route>

        {/* Sign In */}
        <Route
          path="/signin"
          element={
            auth
              ? <Navigate to="/app" replace />
              : <PageTransition><SignInPage /></PageTransition>
          }
        />

        {/* Sign Up */}
        <Route
          path="/signup"
          element={
            auth
              ? <Navigate to="/app" replace />
              : <PageTransition><SignUpPage /></PageTransition>
          }
        />

        {/* App */}
        <Route
          path="/app/*"
          element={
            auth
              ? <PageTransition><AppShell role={user.role} /></PageTransition>
              : <Navigate to="/" replace />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={auth ? "/app" : "/"} replace />}
        />

      </Routes>
    </AnimatePresence>
  );
};

export default App;