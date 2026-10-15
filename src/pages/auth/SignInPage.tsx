import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { MAX_ATTEMPTS, useLoginAttempts } from "../../hooks/useLoginAttempts";
import PreAuthLayout from "../../components/layout/PreAuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { ChevronRight } from "../../components/ui/Icons";

interface SignInForm {
  email: string;
  password: string;
}

const FEATURE_LIST: string[] = [
  "Access all your assignments",
  "Submit code from the browser",
  "Track grades in real-time",
  "Receive instant notifications",
  "View performance analytics",
];

const LAST_EMAIL_KEY = "cc_login_last_email";

// Email of the last failed attempt, so after a refresh the field is pre-filled
// and the saved lock for that email can be found again.
const getLastEmail = (): string => {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
};

const SignInPage: FC = () => {
  const { login } = useAuth();

  const [backendError, setBackendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInForm>({ defaultValues: { email: getLastEmail() } });

  const emailValue = watch("email") ?? "";
  const {
    isLocked,
    secondsLeft,
    registerFailure,
    registerSuccess,
  } = useLoginAttempts(emailValue);

  const formatTime = (total: number) =>
    `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

  const onSubmit = async (data: SignInForm) => {
    if (isLocked) return;
    setBackendError("");
    setIsLoading(true);

    try {
      await login({
        email: data.email.trim(),
        password: data.password,
      });
      registerSuccess();
    } catch (err: unknown) {
      const res = (
        err as {
          response?: { status?: number; data?: { message?: string } };
        }
      )?.response;
      let message = res?.data?.message ?? "Invalid email or password.";

      // Only wrong-credential responses (401) count as a failed attempt.
      if (res?.status === 401) {
        try {
          localStorage.setItem(LAST_EMAIL_KEY, data.email.trim());
        } catch {
          /* ignore */
        }
        const entry = registerFailure();
        const left = Math.max(0, MAX_ATTEMPTS - entry.attempts);
        if (entry.lockedUntil === 0) {
          message += ` (${left} attempt${left === 1 ? "" : "s"} left)`;
        }
      }

      setBackendError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PreAuthLayout
      leftTitle={
        <>
          Where <span>code</span> meets
          <br />
          the classroom.
        </>
      }
      features={FEATURE_LIST}
    >
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black mb-6">Sign in to your account</h1>

        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2 rounded-lg mb-4">
            Too many failed attempts. Try again in{" "}
            <span className="font-semibold">{formatTime(secondsLeft)}</span>.
          </div>
        )}

        {!isLocked && backendError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />

          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLocked}
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-text-muted hover:text-black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}

          <div className="text-right -mt-2">
            <Link
              to="/forgot-password"
              className="text-xs text-text-muted hover:text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ChevronRight />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-black font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </PreAuthLayout>
  );
};

export default SignInPage;