import { useState, useEffect, type FC } from "react";
import type { Assignment } from "../../types/assignment";

interface Props {
  assignment: Assignment;
  role:       "teacher" | "student";
  onView:     (assignment: Assignment) => void;
  onDelete?:  (assignment: Assignment) => void;
  submitted?: boolean;   // student ne submit kiya?
  isGraded?:  boolean;   // teacher ne grade kiya?
}

const getTimeLeft = (deadline: string): string | null => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  if (days > 0)    return `${days}d ${hours}h left`;
  if (hours > 0)   return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
};

const AssignmentCard: FC<Props> = ({
  assignment,
  role,
  onView,
  onDelete,
  submitted = false,
  isGraded  = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(() =>
    getTimeLeft(assignment.deadline)
  );

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft(assignment.deadline));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [assignment.deadline]);

  const isExpired = timeLeft === null;

  const deadlineDate = new Date(assignment.deadline).toLocaleDateString("en-US", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete?.(assignment);
  };

  return (
    <div
      onClick={() => onView(assignment)}
      className={`bg-surface rounded-xl border p-5 transition-all cursor-pointer group relative
        ${isExpired
          ? "border-border opacity-70 hover:opacity-90"
          : "border-border hover:border-gray-600 hover:-translate-y-0.5"
        }`}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 pr-2">
          <h4 className="text-text font-bold text-sm leading-tight truncate">
            {assignment.title}
          </h4>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Expired badge */}
          {isExpired && (
            <span className="text-[10px] px-2 py-0.5 rounded border bg-red-900 text-red-300 border-red-700 font-medium whitespace-nowrap">
              Expired
            </span>
          )}

          {/* Student submission status badge */}
          {role === "student" && submitted && (
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium whitespace-nowrap ${
              isGraded
                ? "bg-green-900 text-green-300 border-green-700"
                : "bg-yellow-900 text-yellow-300 border-yellow-700"
            }`}>
              {isGraded ? "Graded ✓" : "Submitted - Awaiting Grade"}
            </span>
          )}
        </div>
      </div>

      {/* STATEMENT */}
      <p className="text-text-muted text-xs leading-relaxed mb-4 line-clamp-2">
        {assignment.statement}
      </p>

      {/* META */}
      <div className="flex items-center justify-between gap-3 text-xs text-text-faint mb-4">
        <span>
          <span className="text-text-secondary font-medium">{assignment.marks}</span>{" "}marks
        </span>
        <span className="truncate">
          Due: <span className="text-text-secondary">{deadlineDate}</span>
        </span>
      </div>

      {/* ACTIVE COUNTDOWN */}
      {!isExpired && timeLeft && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg px-3 py-2 mb-4 flex justify-between">
          <span className="text-green-500 text-[11px] font-medium">⏱ Time Remaining</span>
          <span className="text-green-400 text-xs font-bold font-mono">{timeLeft}</span>
        </div>
      )}

      {/* DELETE BUTTON - Teacher only */}
      {role === "teacher" && onDelete && (
        <div className="flex items-center justify-end">
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 border border-red-800 text-red-500 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-900/30 hover:text-red-400 transition-all whitespace-nowrap"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;