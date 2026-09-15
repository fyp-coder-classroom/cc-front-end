import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PreAuthLayout from "../../components/layout/PreAuthLayout";
import { ChevronRight } from "../../components/ui/Icons";
import { forgotPasswordAPI } from "../../services/authService";

interface ForgotPasswordForm {
  email: string;
}

const FEATURE_LIST: string[] = [
  "Access all your assignments",
  "Submit code from the browser",
  "Track grades in real-time",
  "Receive instant notifications",
  "View performance analytics",
];

const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setBackendError("");
    setIsLoading(true);

    try {
      const email = data.email.trim();
      // Sends a 6-digit OTP to the email (backend: POST /auth/forgot-password).
      // Note: unlike a typical "always say success" flow, this backend
      // returns a 404 if the email isn't registered, so we surface that
      // as a real error instead of pretending it worked.
      await forgotPasswordAPI(email);
      navigate("/verify-reset-otp", { state: { email } });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Something went wrong. Please try again.";
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
        <h1 className="text-3xl font-black mb-2">Forgot password?</h1>
        <p className="text-text-muted text-sm mb-6">
          Enter the email linked to your account and we'll send you a 6-digit
          code to reset your password.
        </p>

        {backendError && (
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Send Reset Code <ChevronRight />
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

export default ForgotPasswordPage;