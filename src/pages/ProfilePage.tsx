import type { FC } from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePage: FC = () => {
  const { user } = useAuth();
  const userName = user?.name ?? "User";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">My Profile</h1>
        <p className="text-text-muted text-xs mt-0.5">
          Your account information
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center text-text text-2xl font-black">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-text font-bold text-lg">{userName}</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                user?.role === "teacher"
                  ? "bg-blue-900 text-blue-300 border border-blue-700"
                  : "bg-green-900 text-green-300 border border-green-700"
              }`}
            >
              {user?.role === "teacher" ? "Teacher" : "Student"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="border-t border-border pt-4">
            <p className="text-text-muted text-xs mb-1">Full Name</p>
            <p className="text-text text-sm font-medium">{userName}</p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-text-muted text-xs mb-1">Email Address</p>
            <p className="text-text text-sm font-medium">
              {user?.email ?? "--"}
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-text-muted text-xs mb-1">Role</p>
            <p className="text-text text-sm font-medium capitalize">
              {user?.role ?? "--"}
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-text-muted text-xs mb-1">User ID</p>
            <p className="text-text text-sm font-medium">{user?.id ?? "--"}</p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-text-muted text-xs mb-1">Member Since</p>
            <p className="text-text text-sm font-medium">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
