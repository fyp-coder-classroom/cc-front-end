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
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);

    const email = data.email.trim();
    // Security note: regardless of whether the backend actually found
    // an account for this email (it may 404 if not), we always move the
    // user forward to the OTP screen with the same generic wording. This
    // avoids leaking whether a given email is registered ("email
    // enumeration") - a real attacker gets no signal either way.
    try {
      await forgotPasswordAPI(email);
    } catch {
      // Intentionally ignored - see note above.
    } finally {
      setIsLoading(false);
    }
    // Absolute timestamps (not plain countdown numbers) - carried as router
    // state so the OTP page's countdowns survive a page refresh instead of
    // resetting back to their starting values every time.
    // expiresAt matches backend OTP_EXPIRATION_MINUTES=2 in .env.example -
    // update OTP_TTL_MINUTES below if that .env value changes.
    const OTP_TTL_MINUTES = 2;
    const RESEND_COOLDOWN_SECONDS = 2 * 60; // 2 minutes
    const expiresAt = Date.now() + OTP_TTL_MINUTES * 60 * 1000;
    const resendAvailableAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
    navigate("/verify-reset-otp", {
      state: { email, expiresAt, resendAvailableAt },
    });
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