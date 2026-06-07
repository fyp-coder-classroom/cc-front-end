// ─────────────────────────────────────────────
// pages/student/StudentDashboard.tsx
// Dashboard page for the Student role.
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { PendingAssignment } from "../../types";
import StatCard    from "../../components/ui/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { PlusIcon } from "../../components/ui/Icons";
import {
  STUDENT_STATS,
  PENDING_ASSIGNMENTS,
  STUDENT_CLASSES_TABLE,
} from "../../data/mockData";

// Badge style map for pending assignment cards
const CARD_BADGE_STYLES: Record<string, string> = {
  "Past Due":    "bg-red-900    text-red-300    border border-red-700",
  "In Progress": "bg-blue-900   text-blue-300   border border-blue-700",
  "Graded":      "bg-green-900  text-green-300  border border-green-700",
};

// Action button label per assignment status
const ACTION_LABELS: Record<string, string> = {
  "Not Started": "Start",
  "In Progress": "Resume",
  "Submitted":   "View",
};

interface PendingCardProps {
  assignment: PendingAssignment;
}

const PendingCard: FC<PendingCardProps> = ({ assignment }) => {
  const { id, badge, title, desc, deadline, status, score, deadlineRed, progress } = assignment;
  const actionLabel = ACTION_LABELS[status] ?? "View";

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{id}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${CARD_BADGE_STYLES[badge] ?? ""}`}>
          {badge}
        </span>
      </div>
      <h4 className="text-white text-sm font-bold mb-1 leading-tight">{title}</h4>
      <p className="text-gray-500 text-xs leading-relaxed mb-3">{desc}</p>

      {deadline && (
        <p className={`text-xs mb-3 ${deadlineRed ? "text-red-400" : "text-gray-400"}`}>
          Deadline: {deadline}
        </p>
      )}
      {score && <p className="text-xs text-green-400 mb-3">Score: {score}</p>}

      <ProgressBar value={progress} color={badge === "Graded" ? "bg-green-500" : "bg-white"} />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">{status}</span>
        <button className="text-xs border border-gray-700 text-white px-3 py-1 rounded hover:border-white transition-colors">
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

const StudentDashboard: FC = () => (
  <div>

    {/* ── Header ── */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-white">My Dashboard</h1>
        <p className="text-gray-500 text-xs mt-0.5">Monday, 13 April 2026</p>
      </div>
      <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
        <PlusIcon /> Join Class
      </button>
    </div>

    {/* ── Stats ── */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STUDENT_STATS.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>

    {/* ── Pending Assignments ── */}
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Pending Assignments</h3>
        <button className="text-xs text-gray-400 hover:text-white transition-colors">View All →</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {PENDING_ASSIGNMENTS.map((a) => (
          <PendingCard key={a.id} assignment={a} />
        ))}
      </div>
    </div>

    {/* ── My Classes Table ── */}
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
      <h3 className="text-sm font-bold text-white mb-4">My Classes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800">
              {["Class Name", "Teacher", "Assignments", "Progress", "Join Code"].map((h) => (
                <th key={h} className="text-left text-gray-500 pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {STUDENT_CLASSES_TABLE.map((c) => (
              <tr key={c.name}>
                <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">{c.name}</td>
                <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">{c.teacher}</td>
                <td className="py-3 pr-4 text-gray-400">{c.assignments}</td>
                <td className="py-3 pr-4 w-28">
                  <ProgressBar value={c.progress} color="bg-white" />
                </td>
                <td className="py-3 text-gray-400 font-mono">{c.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default StudentDashboard;
