import { useState, type FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import PreAuthLayout from "../../components/layout/PreAuthLayout";
import { ChevronRight } from "../../components/ui/Icons";
import { resetPasswordAPI } from "../../services/authService";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

interface LocationState {
  resetToken: string;
  email?: string;
}

const FEATURE_LIST: string[] = [
  "Access all your assignments",
  "Submit code from the browser",
  "Track grades in real-time",
  "Receive instant notifications",
  "View performance analytics",
];

const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // The resetToken is short-lived (15 min) and only exists in-memory as
  // router state - it is NOT carried in the URL, since this is an
  // OTP-verified flow rather than an email-link flow.
  const resetToken = (location.state as LocationState | null)?.resetToken ?? "";

  const [backendError, setBackendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const passwordValue = watch("password");

  const onSubmit = async (data: ResetPasswordForm) => {
    setBackendError("");
    setIsLoading(true);
    try {
      await resetPasswordAPI(resetToken, data.password);
      setIsDone(true);
      setTimeout(() => navigate("/signin"), 2500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
        "This reset session is invalid or has expired. Please start over.";
      setBackendError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // No resetToken available (page opened directly / refreshed)
  if (!resetToken) {
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
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-black mb-2">Session expired</h1>
          <p className="text-text-muted text-sm mb-6">
            This reset session is no longer available. Please request a new
            code.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex w-full items-center justify-center bg-black text-white py-3 rounded-xl font-semibold"
          >
            Request New Code
          </Link>
        </div>
      </PreAuthLayout>
    );
  }

  // Success state
  if (isDone) {
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
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-black mb-2">Password updated</h1>
          <p className="text-text-muted text-sm mb-6">
            Your password has been reset. Taking you to sign in...
          </p>
          <Link to="/signin" className="text-black font-semibold hover:underline text-sm">
            Go to sign in now
          </Link>
        </div>
      </PreAuthLayout>
    );
  }

  // Default state: new password form
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
        <h1 className="text-3xl font-black mb-2">Set a new password</h1>
        <p className="text-text-muted text-sm mb-6">
          Choose a new password for your account.
        </p>

        {backendError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
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

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === passwordValue || "Passwords do not match",
            })}
            className="w-full border rounded-lg px-3 py-2.5 text-sm"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Reset Password <ChevronRight />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          Remembered your password?{" "}
          <Link to="/signin" className="text-black font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </PreAuthLayout>
  );
};

export default ResetPasswordPage;