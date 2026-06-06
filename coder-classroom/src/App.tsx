// ─────────────────────────────────────────────
// App.tsx
// Root component. Manages top-level screen and role state.
//
// Screen flow:
//   landing → signin / signup → app
//   app (sidebar) → landing (sign out)
// ─────────────────────────────────────────────

import { useState, type FC } from "react";
import type { Screen, Role } from "./types";
import LandingPage  from "./pages/LandingPage";
import SignInPage   from "./pages/auth/SignInPage";
import SignUpPage   from "./pages/auth/SignUpPage";
import AppShell     from "./components/layout/AppShell";

const App: FC = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [role,   setRole]   = useState<Role>("student");

  switch (screen) {
    case "signin":
      return <SignInPage setScreen={setScreen} setRole={setRole} />;
    case "signup":
      return <SignUpPage setScreen={setScreen} setRole={setRole} />;
    case "app":
      return <AppShell role={role} setScreen={setScreen} />;
    default:
      return <LandingPage setScreen={setScreen} />;
  }
};

export default App;
