import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FC,
  type KeyboardEvent,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PreAuthLayout from "../../components/layout/PreAuthLayout";
import { ChevronRight } from "../../components/ui/Icons";
import { forgotPasswordAPI, verifyResetOtpAPI } from "../../services/authService";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const FEATURE_LIST: string[] = [
  "Access all your assignments",
  "Submit code from the browser",
  "Track grades in real-time",
  "Receive instant notifications",
  "View performance analytics",
];

interface LocationState {
  email: string;
}

const VerifyResetOtpPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email ?? "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [backendError, setBackendError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const focusInput = (index: number) => inputsRef.current[index]?.focus();

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < Math.min(OTP_LENGTH, pasted.length); i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const otpValue = digits.join("");

  const handleVerify = async () => {
    if (otpValue.length !== OTP_LENGTH) {
      setBackendError(`Enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setBackendError("");
    setIsVerifying(true);
    try {
      // Backend verifies the OTP and returns a short-lived resetToken
      // (15 min) which the next page needs to actually change the password.
      const { resetToken } = await verifyResetOtpAPI(email, otpValue);
      navigate("/reset-password", { state: { resetToken, email } });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Invalid or expired code. Please try again.";
      setBackendError(message);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setBackendError("");
    setResendMessage("");
    setIsResending(true);
    try {
      await forgotPasswordAPI(email);
      setResendMessage("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not resend the code. Please try again.";
      setBackendError(message);
    } finally {
      setIsResending(false);
    }
  };

  // ── No email available (page opened directly) ──
  if (!email) {
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
          <h1 className="text-2xl font-black mb-2">Nothing to verify</h1>
          <p className="text-text-muted text-sm mb-6">
            Please restart the password reset process.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex w-full items-center justify-center bg-black text-white py-3 rounded-xl font-semibold"
          >
            Go to Forgot Password
          </Link>
        </div>
      </PreAuthLayout>
    );
  }

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
        <h1 className="text-3xl font-black mb-2">Enter reset code</h1>
        <p className="text-text-muted text-sm mb-6">
          We've sent a 6-digit code to{" "}
          <span className="font-semibold text-text">{email}</span>.
        </p>

        {backendError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
            {backendError}
          </div>
        )}
        {resendMessage && !backendError && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg mb-4">
            {resendMessage}
          </div>
        )}

        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-black"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isVerifying ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Verify Code <ChevronRight />
            </>
          )}
        </button>

        <p className="text-center text-xs text-text-muted mt-5">
          Didn't get the code?{" "}
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-black font-semibold hover:underline disabled:opacity-60"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>
      </div>
    </PreAuthLayout>
  );
};

export default VerifyResetOtpPage;
