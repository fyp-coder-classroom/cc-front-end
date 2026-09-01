import { useState, useEffect, type FC } from "react";
import type { Assignment } from "../../types/assignment";

interface Props {
  assignment: Assignment;
  role: "teacher" | "student";
  onView: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
};

//  Returns a live countdown string.
const getTimeLeft = (deadline: string): string | null => {
  const diff = new Date(deadline).getTime() - Date.now();

  if (diff <= 0) {
    return null;
  }

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (diff / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (diff / 1000) % 60
  );

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s left`;
  }

  return `${seconds}s left`;
};

const AssignmentCard: FC<Props> = ({
  assignment,
  role,
  onView,
  onDelete,
}) => {
  //  Live countdown.
  //  It updates every second so that when the deadline passes, the card automatically becomes expired.
  const [timeLeft, setTimeLeft] = useState<string | null>(() =>
    getTimeLeft(assignment.deadline)
  );

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(getTimeLeft(assignment.deadline));
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [assignment.deadline]);

  const isExpired = timeLeft === null;

  //  * Format deadline for display.
  const deadlineDate = new Date(
    assignment.deadline
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Prevent Delete click from triggering the assignment card's click handler.
  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    onDelete?.(assignment);
  };

  //  * Prevent View button click from bubbling.
  const handleView = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    onView(assignment);
  };

  return (
    <div
      onClick={() => onView(assignment)}
      className={` bg-surface rounded-xl border p-5 transition-all cursor-pointer group relative
        ${isExpired
          ? "border-border opacity-70 hover:opacity-90"
          : "border-border hover:border-gray-600 hover:-translate-y-0.5"
        } `}
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 pr-2">
          <h4 className="text-text font-bold text-sm leading-tight truncate">
            {assignment.title}
          </h4>
        </div>

        {/* Expired badge - TOP RIGHT */}
        {isExpired && (
          <span
            className=" flex-shrink-0 text-[10px] px-2 py-0.5 rounded border bg-red-900
             text-red-300 border-red-700 font-medium " >
            Expired
          </span>
        )}
      </div>

      {/* STATEMENT */}
      <p
        className=" text-text-muted text-xs leading-relaxed mb-4 line-clamp-2 " >
        {assignment.statement}
      </p>

      {/* META */}
      <div
        className=" flex items-center justify-between gap-3 text-xs text-text-faint mb-4 " >
        <span>
          <span className="text-text-secondary font-medium">
            {assignment.marks}
          </span>{" "}
          marks
        </span>

        <span className="truncate">
          Due:{" "}
          <span className="text-text-secondary">
            {deadlineDate}
          </span>
        </span>
      </div>

      {/* ACTIVE COUNTDOWN */}
      {!isExpired && timeLeft && (
        <div
          className=" bg-green-900/20 border border-green-800 rounded-lg px-3 py-2 mb-4 flex justify-between " >
          <span className="text-green-500 text-[11px] font-medium">
            ⏱ Time Remaining
          </span>

          <span className="text-green-400 text-xs font-bold font-mono">
            {timeLeft}
          </span>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-2">

        {/* DELETE - TEACHER ONLY */}
        {/* Shows ONLY when teacher hovers card */}
        {role === "teacher" && onDelete && (
          <button onClick={handleDelete}
            className=" opacity-0 group-hover:opacity-100 border border-red-800
              text-red-500 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-900/30
              hover:text-red-400 transition-all whitespace-nowrap" >
            Delete
          </button>
        )}
      </div>

      {/* TEACHER HOVER INDICATOR */}
      {role === "teacher" && onDelete && (
        <div
          className=" absolute top-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none text-[9px] text-red-400 transition-opacity hidden" >
          Delete
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;