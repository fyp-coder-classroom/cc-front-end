import { useState, useEffect, type FC } from "react";
import type { Assignment } from "../../types/assignment";

interface Props {
  assignment: Assignment;
  role:       "teacher" | "student";
  onView:     (assignment: Assignment) => void;
  onDelete?:  (assignment: Assignment) => void; // teacher only
}

const getTimeLeft = (deadline: string): string | null => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (days > 0)    return `${days}d ${hours}h left`;
  if (hours > 0)   return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
};

const AssignmentCard: FC<Props> = ({ assignment, role, onView, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(assignment.deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(assignment.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment.deadline]);

  const isExpired = !timeLeft;
  const deadlineDate = new Date(assignment.deadline).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className={`bg-[#111] rounded-xl border p-5 transition-colors ${
      isExpired ? "border-gray-800 opacity-70" : "border-gray-700 hover:border-gray-600"
    }`}>
      {/* Title + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-white font-bold text-sm leading-tight">{assignment.title}</h4>
        {isExpired && (
          <span className="text-[10px] px-2 py-0.5 rounded border bg-red-900 text-red-300 border-red-700 font-medium flex-shrink-0">
            Expired
          </span>
        )}
      </div>

      {/* Statement preview */}
      <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
        {assignment.statement}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
        <span>
          <span className="text-gray-400 font-medium">{assignment.marks}</span> marks
        </span>
        <span>Due: <span className="text-gray-400">{deadlineDate}</span></span>
      </div>

      {/* Countdown */}
      {!isExpired && timeLeft && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg px-3 py-2 mb-4">
          <p className="text-green-400 text-xs font-medium">⏱ {timeLeft}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(assignment)}
          className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
        >
          {role === "teacher" ? "View Assignment" : isExpired ? "View (Expired)" : "View Assignment"}
        </button>
        {role === "teacher" && onDelete && (
          <button
            onClick={() => onDelete(assignment)}
            className="border border-red-800 text-red-400 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
