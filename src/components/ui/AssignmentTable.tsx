// ─────────────────────────────────────────────
// components/ui/AssignmentTable.tsx
// Table of assignments with status badges and action buttons.
// Props:
//   assignments — Assignment[] from types/index.ts
// Usage: <AssignmentTable assignments={ASSIGNMENTS_CS_A} />
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { AssignmentTableProps, BadgeStatus } from "../../types";
import Badge from "./Badge";

// Maps assignment status → button label + Tailwind style
const ACTION_MAP: Record<string, { label: string; style: string }> = {
  "Not Started": {
    label: "Solve",
    style: "bg-primary text-primary-foreground",
  },
  "In Progress": { label: "Resume", style: "border border-gray-600 text-text" },
  Graded: { label: "View", style: "border border-gray-600 text-text" },
  Submitted: { label: "View", style: "border border-gray-600 text-text" },
};

interface ActionButtonProps {
  status: BadgeStatus;
}

const ActionButton: FC<ActionButtonProps> = ({ status }) => {
  const action = ACTION_MAP[status] ?? {
    label: "View",
    style: "border border-gray-600 text-text",
  };
  return (
    <button
      className={`text-xs px-3 py-1 rounded ${action.style} hover:opacity-80 transition-opacity`}
    >
      {action.label}
    </button>
  );
};

const TABLE_HEADERS = [
  "Assignment",
  "Assigned",
  "Deadline",
  "Your Score",
  "Status",
  "",
];

const AssignmentTable: FC<AssignmentTableProps> = ({ assignments }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border">
          {TABLE_HEADERS.map((header) => (
            <th
              key={header}
              className="text-left text-text-muted pb-2 pr-4 font-medium whitespace-nowrap"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {assignments.map((a) => (
          <tr key={a.name}>
            <td className="py-3 pr-4 text-text font-medium whitespace-nowrap">
              {a.name}
            </td>
            <td className="py-3 pr-4 text-text-secondary">{a.assigned}</td>
            <td className="py-3 pr-4 text-text-secondary">{a.deadline}</td>
            <td className="py-3 pr-4 text-text font-mono">{a.score}</td>
            <td className="py-3 pr-4">
              <Badge status={a.status} />
            </td>
            <td className="py-3">
              <ActionButton status={a.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AssignmentTable;
