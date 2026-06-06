// Props: see AuthPageProps in types/index.ts

import { useState, type FC } from "react";
import type { AuthPageProps } from "../../types";
import { GridIcon, ChevronRight } from "../../components/ui/Icons";

const FEATURE_LIST: string[] = [
  "Access all your assignments",
  "Submit code from the browser",
  "Track grades in real-time",
  "Receive instant notifications",
  "View performance analytics",
];

const SignInPage: FC<AuthPageProps> = ({ setScreen, setRole }) => {
  const [email, setEmail] = useState<string>("coderclassroom@gmail.com");
  const [password, setPassword] = useState<string>("••••••••");
  const [error, setError] = useState<string>("");

  const handleSignIn = (): void => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    // Demo routing: teacher if email contains "teacher", "prof", or "usman"
    const isTeacher = /teacher|prof|usman/i.test(email);
    setRole(isTeacher ? "teacher" : "student");
    setScreen("app");
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">

      {/* ── Left Branding Panel ── */}
      <div className="hidden sm:flex sm:w-[35%] bg-[#111111] flex-col p-10 justify-between">
        <div className="flex items-center gap-2 text-white">
          <GridIcon />
          <span className="font-bold text-sm">CoderClassroom</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white leading-tight">
            Where <span className="font-black">code</span> meets<br />the classroom.
          </h2>
          <ul className="mt-8 space-y-3">
            {FEATURE_LIST.map((f) => (
              <li key={f} className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="w-1 h-1 rounded-full bg-gray-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div />
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 bg-white flex flex-col">
        <div className="flex justify-end items-center gap-3 p-5">
          <span className="text-sm text-gray-500">Don't have an account?</span>
          <button
            onClick={() => setScreen("signup")}
            className="text-sm bg-black text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create Account
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 mb-1">Welcome back</p>
            <h1 className="text-3xl font-black text-black leading-tight mb-8">
              Sign in to your<br />account
            </h1>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <div className="text-right mt-1.5">
                  <button className="text-xs text-gray-500 hover:text-black transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                onClick={handleSignIn}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Sign In <ChevronRight />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-5">
              Don't have an account?{" "}
              <button
                onClick={() => setScreen("signup")}
                className="text-black font-semibold hover:underline"
              >
                Create for free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
