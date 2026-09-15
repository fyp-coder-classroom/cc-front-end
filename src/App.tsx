import { useAuth } from "./context/AuthContext";
import PublicLayout from "./components/layout/PublicLayout";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyResetOtpPage from "./pages/auth/VerifyResetOtpPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyRegistrationOtpPage from "./pages/auth/VerifyRegistrationOtpPage";
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

        {/* Verify Registration OTP (step 2 of signup - user is only
            actually created in the DB once this succeeds) */}
        <Route
          path="/verify-registration"
          element={
            auth
              ? <Navigate to="/app" replace />
              : <PageTransition><VerifyRegistrationOtpPage /></PageTransition>
          }
        />

        {/* Forgot Password - step 1: request OTP */}
        <Route
          path="/forgot-password"
          element={
            auth
              ? <Navigate to="/app" replace />
              : <PageTransition><ForgotPasswordPage /></PageTransition>
          }
        />

        {/* Forgot Password - step 2: verify OTP, get resetToken */}
        <Route
          path="/verify-reset-otp"
          element={
            auth
              ? <Navigate to="/app" replace />
              : <PageTransition><VerifyResetOtpPage /></PageTransition>
          }
        />

        {/* Forgot Password - step 3: set new password using resetToken
            (resetToken travels via router state, not a URL query param) */}
        <Route
          path="/reset-password"
          element={
            auth
              ? <Navigate to="/app" replace />
              : <PageTransition><ResetPasswordPage /></PageTransition>
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