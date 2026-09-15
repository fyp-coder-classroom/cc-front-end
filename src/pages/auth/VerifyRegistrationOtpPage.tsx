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
import { useAuth } from "../../context/AuthContext";
import type { RegisterCredentials } from "../../types/auth";

const OTP_LENGTH = 6;
// The registrationToken issued by /auth/register/initiate is only valid
// for 3 minutes on the backend (see auth.service.ts: expiresIn: "3m").
const TOKEN_TTL_SECONDS = 3 * 60;

const FEATURE_LIST: string[] = [
  "Join or create classrooms",
  "Solve assignments in-browser",
  "Get graded by your teacher",
  "Monitor your performance",
  "Receive email updates",
];

interface LocationState {
  registrationToken: string;
  credentials: RegisterCredentials;
}

const VerifyRegistrationOtpPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeRegistration, initiateRegistration } = useAuth();

  const state = location.state as LocationState | null;
  const [registrationToken, setRegistrationToken] = useState(
    state?.registrationToken ?? "",
  );
  const credentials = state?.credentials ?? null;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [backendError, setBackendError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TOKEN_TTL_SECONDS);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown until the registrationToken (and its embedded OTP) expires.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const isExpired = secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

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
      // completeRegistration creates the user on the backend AND logs
      // them in immediately (persistAuth happens inside AuthContext),
      // so we can navigate straight into the app.
      await completeRegistration(registrationToken, otpValue);
      navigate("/app");
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
    if (!credentials) return;
    setBackendError("");
    setResendMessage("");
    setIsResending(true);
    try {
      // There is no separate "resend OTP" endpoint - a fresh OTP +
      // registrationToken is issued by simply calling initiate again
      // with the same signup details.
      const { registrationToken: freshToken } =
        await initiateRegistration(credentials);
      setRegistrationToken(freshToken);
      setSecondsLeft(TOKEN_TTL_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      setResendMessage("A new code has been sent to your email.");
      focusInput(0);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not resend the code. Please try again.";
      setBackendError(message);
    } finally {
      setIsResending(false);
    }
  };

  // ── No registration in progress (page opened directly / refreshed) ──
  if (!registrationToken || !credentials) {
    return (
      <PreAuthLayout
        leftTitle={
          <>
            Start your
            <br />
            coding journey
            <br />
            today.
          </>
        }
        features={FEATURE_LIST}
      >
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-black mb-2">Nothing to verify</h1>
          <p className="text-text-muted text-sm mb-6">
            Please sign up again to receive a new verification code.
          </p>
          <Link
            to="/signup"
            className="inline-flex w-full items-center justify-center bg-black text-white py-3 rounded-xl font-semibold"
          >
            Go to Sign Up
          </Link>
        </div>
      </PreAuthLayout>
    );
  }

  return (
    <PreAuthLayout
      leftTitle={
        <>
          Start your
          <br />
          coding journey
          <br />
          today.
        </>
      }
      features={FEATURE_LIST}
    >
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black mb-2">Verify your email</h1>
        <p className="text-text-muted text-sm mb-6">
          We've sent a 6-digit code to{" "}
          <span className="font-semibold text-text">{credentials.email}</span>.
          Enter it below to create your account.
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
        {isExpired && !backendError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2 rounded-lg mb-4">
            This code has expired. Please request a new one.
          </div>
        )}

        <div className="flex justify-between gap-2 mb-2" onPaste={handlePaste}>
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
              disabled={isExpired}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            />
          ))}
        </div>

        <p className="text-xs text-text-muted mb-6">
          {isExpired ? (
            "Code expired"
          ) : (
            <>
              Code expires in{" "}
              <span className="font-semibold text-text">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </>
          )}
        </p>

        <button
          onClick={handleVerify}
          disabled={isVerifying || isExpired}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isVerifying ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Verify & Create Account <ChevronRight />
            </>
          )}
        </button>

        <p className="text-center text-xs text-text-muted mt-5">
          Didn't get the code?{" "}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-black font-semibold hover:underline disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </div>
    </PreAuthLayout>
  );
};

export default VerifyRegistrationOtpPage;