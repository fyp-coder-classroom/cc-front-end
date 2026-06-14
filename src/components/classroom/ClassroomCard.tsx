// Used in both Teacher and Student views.

import type { FC } from "react";
import type { Classroom } from "../../types/classroom";
import { CodeIcon } from "../ui/Icons";

interface Props {
  classroom:  Classroom;
  role:       "teacher" | "student";
  onClick:    (id: string) => void;
  onDelete?:  (classroom: Classroom) => void;  // teacher only
}

const ClassroomCard: FC<Props> = ({ classroom, role, onClick, onDelete }) => {
  const isTeacher     = role === "teacher";
  const studentCount  = Array.isArray(classroom.students) ? classroom.students.length : 0;

  // Copy classCode to clipboard
  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    navigator.clipboard.writeText(classroom.classCode);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(classroom);
  };

  return (
    <div
      onClick={() => onClick(classroom.id || classroom._id || "")}
      className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 hover:border-gray-600 transition-colors cursor-pointer group"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-white">
          <CodeIcon />
        </div>
        <span className="bg-green-900 text-green-300 border border-green-700 px-2 py-0.5 rounded text-xs font-medium">
          Active
        </span>
      </div>

      {/* ── Content ── */}
      <h3 className="text-white font-bold text-sm mb-1 truncate">{classroom.name}</h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
        {classroom.description || "No description provided."}
      </p>

      {/* ── Meta ── */}
      <div className="text-xs text-gray-400 mb-3">
        {isTeacher ? (
          <span>{studentCount} Students</span>
        ) : (
          <span>
            Teacher:{" "}
            {typeof classroom.teacher === "object"
              ? classroom.teacher.name
              : "—"}
          </span>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        {/* Class Code + Copy */}
        <button
          onClick={handleCopyCode}
          title="Click to copy"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors group/copy"
        >
          <span className="font-mono text-gray-300 font-semibold tracking-wider">
            {classroom.classCode}
          </span>
          <span className="opacity-0 group-hover/copy:opacity-100 text-[10px] text-gray-500 transition-opacity">
            copy
          </span>
        </button>

        {/* Delete button — Teacher only */}
        {isTeacher && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-400 transition-all px-2 py-1 rounded border border-transparent hover:border-red-800"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassroomCard;
