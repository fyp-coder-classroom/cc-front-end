import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types/auth";
import PreAuthLayout from "../../components/layout/PreAuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { ChevronRight } from "../../components/ui/Icons";

interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

const FEATURE_LIST = [
  "Join or create classrooms",
  "Solve assignments in-browser",
  "Get graded by your teacher",
  "Monitor your performance",
  "Receive email updates",
];

const SignUpPage: FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

const roleFromUrl = searchParams.get("role");

const [role, setRole] = useState<Role>(
  roleFromUrl === "teacher" ? "teacher" : "student"
);
  const [backendError, setBackendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>();

  const onSubmit = async (data: SignUpForm) => {
    setBackendError("");
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role,
      });
      navigate("/signin"); // navigae to signin after register
    } catch (err: unknown) {
      type E = {
        response?: {
          data?: { message?: string; errors?: { message?: string }[] };
        };
      };
      const d = (err as E)?.response?.data;
      setBackendError(
        d?.errors?.[0]?.message ??
          d?.message ??
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-3xl font-black mb-6">
          Join <span className="text-text-secondary">CoderClassroom</span>
        </h1>

        {/* Sliding role toggle */}
        <div className="relative flex bg-gray-100 rounded-xl p-1 mb-6">
          <span
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-black rounded-lg shadow-sm
                       transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              transform:
                role === "teacher"
                  ? "translateX(calc(100% + 8px))"
                  : "translateX(0)",
            }}
          />
          {(["student", "teacher"] as Role[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRole(t)}
              className={`relative z-10 flex-1 py-2 text-sm font-medium capitalize rounded-lg
                         transition-colors duration-300
                         ${role === t ? "text-white" : "text-text-muted hover:text-gray-800"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {backendError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <input
              placeholder="Full name"
              {...register("name", { required: "Name is required" })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email",
                },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                {...register("password", {
                  required: "Password is required",
                  validate: (v) => {
                    if (v.length < 8)
                      return "Password must be at least 8 characters";
                    if (!/[A-Z]/.test(v))
                      return "Password must contain at least one uppercase letter";
                    if (!/[0-9]/.test(v))
                      return "Password must contain at least one number";
                    return true;
                  },
                })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-3 text-text-secondary hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                        disabled:opacity-60 disabled:cursor-not-allowed"

          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ChevronRight />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-black font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </PreAuthLayout>
  );
};

export default SignUpPage;
