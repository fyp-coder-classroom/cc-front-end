import { useAuth } from "../context/AuthContext";

interface AuthStatus {
  isLoggedIn: boolean;
  isTeacher:  boolean;
  isStudent:  boolean;
  fullName:   string;
  email:      string;
  userId:     string;
}

export const useAuthStatus = (): AuthStatus => {
  const { user, token } = useAuth();

  return {
    isLoggedIn: !!token,
    isTeacher:  user?.role === "teacher",
    isStudent:  user?.role === "student",
    fullName:   user ? `${user.firstName} ${user.lastName}` : "",
    email:      user?.email ?? "",
    userId:     user?.id    ?? "",
  };
};