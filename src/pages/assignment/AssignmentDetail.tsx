import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Assignment, UpdateAssignmentBody } from "../../types/assignment";
import {
  getAssignmentByIdAPI,
  updateAssignmentAPI,
} from "../../services/assignmentService";
import EditAssignmentModal from "../../components/assignment/EditAssignmentModal";

interface Props {
  role: "teacher" | "student";
}

const getTimeLeft = (deadline: string) => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const AssignmentDetail: FC<Props> = ({ role }) => {
  const { classroomId, assignmentId } = useParams<{
    classroomId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState("");
  const [timeLeft,   setTimeLeft]   = useState<ReturnType<typeof getTimeLeft>>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading,   setEditLoading]   = useState(false);

  // Fetch assignment by ID from the URL
  useEffect(() => {
    if (!classroomId || !assignmentId) return;

    const fetchAssignment = async () => {
      setIsLoading(true);
      try {
        const data = await getAssignmentByIdAPI(classroomId, assignmentId);
        setAssignment(data);
        setTimeLeft(getTimeLeft(data.deadline));
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? "Failed to load assignment.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [classroomId, assignmentId]);

  // Live countdown - updates every second, clears on unmount
  useEffect(() => {
    if (!assignment) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(assignment.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment]);

  const handleBack = () => navigate(`/app/classes/${classroomId}`);

  // Update assignment 
  const handleUpdate = async (id: string, body: UpdateAssignmentBody) => {
    if (!classroomId) return;
    setEditLoading(true);
    try {
      const updated = await updateAssignmentAPI(classroomId, id, body);
      setAssignment(updated);
      setTimeLeft(getTimeLeft(updated.deadline));
    } finally {
      setEditLoading(false);
    }
  };

  // Loading 
  if (isLoading) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Classroom
        </button>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-32 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error 
  if (error || !assignment) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Classroom
        </button>
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Assignment not found."}</p>
        </div>
      </div>
    );
  }

  const isExpired = !timeLeft;

  return (
    <div>
      {/* Back */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back to Classroom
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{assignment.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{assignment.marks} marks</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            isExpired
              ? "bg-red-900 text-red-300 border border-red-700"
              : "bg-green-900 text-green-300 border border-green-700"
          }`}>
            {isExpired ? "Submissions Closed" : "Open for Submission"}
          </span>

          {/* Teacher - Edit button */}
          {role === "teacher" && (
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Statement */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-3">Assignment Statement</h3>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {assignment.statement}
        </p>
      </div>

      {/* Deadline / Countdown */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-3">
          {isExpired ? "Deadline Passed" : "Time Remaining"}
        </h3>
        {isExpired ? (
          <p className="text-red-400 text-sm">
            Closed on {new Date(assignment.deadline).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
            })}
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-w-xs">
            {[
              { label: "Days",    value: timeLeft.days },
              { label: "Hours",   value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((u) => (
              <div key={u.label} className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-3 text-center">
                <p className="text-white text-xl font-black tabular-nums">
                  {String(u.value).padStart(2, "0")}
                </p>
                <p className="text-gray-500 text-[10px] uppercase mt-1">{u.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student - submission placeholder */}
      {role === "student" && (
        <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm">Code editor & submission coming in the next module.</p>
          <button
            disabled={isExpired}
            className="mt-4 bg-white text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isExpired ? "Submissions Closed" : "Open Code Editor"}
          </button>
        </div>
      )}

      {/* Teacher - submissions placeholder */}
      {role === "teacher" && (
        <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm">Student submissions will appear here.</p>
          <p className="text-gray-600 text-xs mt-1">Submission & Grading module coming soon.</p>
        </div>
      )}

      {/* Edit Modal - Teacher only */}
      {role === "teacher" && (
        <EditAssignmentModal
          isOpen={showEditModal}
          assignment={assignment}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
          isLoading={editLoading}
        />
      )}
    </div>
  );
};

export default AssignmentDetail;