// Props: see AuthPageProps in types/index.ts

import { useState, type FC } from "react";
import type { AuthPageProps, Role } from "../../types";
import { GridIcon, ChevronRight } from "../../components/ui/Icons";

interface SignUpForm {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  confirm:   string;
}

const INITIAL_FORM: SignUpForm = {
  firstName: "",
  lastName:  "",
  email:     "",
  password:  "",
  confirm:   "",
};

const FEATURE_LIST: string[] = [
  "Join or create classrooms",
  "Solve assignments in-browser",
  "Get graded by your teacher",
  "Monitor your performance",
  "Receive email updates",
];

const SignUpPage: FC<AuthPageProps> = ({ setScreen, setRole }) => {
  const [tab,   setTab]   = useState<Role>("student");
  const [form,  setForm]  = useState<SignUpForm>(INITIAL_FORM);
  const [error, setError] = useState<string>("");

  // Generic field updater — keeps state immutable
  const handleChange =
    (field: keyof SignUpForm) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCreate = (): void => {
    if (!form.firstName.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setRole(tab);
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
            Start your<br /><span className="font-black">coding journey</span><br />today.
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
          <span className="text-sm text-gray-500">Already have an account?</span>
          <button
            onClick={() => setScreen("signin")}
            className="text-sm border border-gray-300 px-4 py-1.5 rounded-lg font-medium hover:border-black transition-colors"
          >
            Sign In
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 mb-1">Create account</p>
            <h1 className="text-3xl font-black text-black leading-tight mb-6">
              Join<br /><span className="text-gray-400">CoderClassroom</span>
            </h1>

            {/* Role Toggle */}
            <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
              {(["student", "teacher"] as Role[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                    tab === t ? "bg-black text-white" : "text-gray-500 hover:text-black"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="space-y-3">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">First Name</label>
                  <input
                    placeholder="Usman"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input
                    placeholder="Ahmad"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="coderclassroom@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange("password")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={handleChange("confirm")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Create Account <ChevronRight />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-5">
              Already have an account?{" "}
              <button
                onClick={() => setScreen("signin")}
                className="text-black font-semibold hover:underline"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
