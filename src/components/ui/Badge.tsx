// ─────────────────────────────────────────────
// components/ui/Badge.tsx
// Displays a colored status pill label.
// Props:
//   status — BadgeStatus union type
// Usage: <Badge status="Graded" />
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { BadgeProps, BadgeStatus } from "../../types";

const STATUS_STYLES: Record<BadgeStatus, string> = {
  Active: "bg-green-900  text-green-300  border border-green-700",
  "Not Started": "bg-surface-raised   text-text   border border-gray-600",
  "In Progress": "bg-blue-900   text-blue-300   border border-blue-700",
  Graded: "bg-green-900  text-green-300  border border-green-700",
  Submitted: "bg-purple-900 text-purple-300 border border-purple-700",
  Pending: "bg-yellow-900 text-yellow-300 border border-yellow-700",
  Reviewed: "bg-blue-900   text-blue-300   border border-blue-700",
  "Past Due": "bg-red-900    text-red-300    border border-red-700",
};

const Badge: FC<BadgeProps> = ({ status }) => {
  const style =
    STATUS_STYLES[status] ??
    "bg-surface-raised text-text border border-gray-600";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {status}
    </span>
  );
};

export default Badge;
