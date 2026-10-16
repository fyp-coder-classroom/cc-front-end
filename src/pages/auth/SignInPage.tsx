import { useState, type FC } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
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

const SignInPage: FC = () => {
  const { login } = useAuth();

  const [backendError, setBackendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>();

  const onSubmit = async (data: SignInForm) => {
    setBackendError("");
    setIsLoading(true);

    try {
      await login({
        email: data.email.trim(),
        password: data.password,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Invalid email or password.";

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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
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
            disabled={isLoading}
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