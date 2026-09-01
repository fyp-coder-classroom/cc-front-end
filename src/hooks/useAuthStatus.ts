import { useAuth } from "../context/AuthContext";

interface AuthStatus {
  isLoggedIn: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  fullName: string;
  email: string;
  userId: string;
}

export const useAuthStatus = (): AuthStatus => {
  const { user, token } = useAuth();

  return {
    isLoggedIn: !!token,
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    // Backend stores a single "name" field - no split needed
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    userId: user?.id ?? "",
  };
};
