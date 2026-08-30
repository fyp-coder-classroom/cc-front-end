import { useState, type FC } from "react";
import type { Submission } from "../../types/submission";

interface Props {
  isOpen:     boolean;
  submission: Submission | null;
  maxMarks:   number;
  isLoading:  boolean;
  onClose:    () => void;
  onGrade:    (submissionId: string, marks: number, feedback: string) => Promise<void>;
}

const GradeModal: FC<Props> = ({
  isOpen, submission, maxMarks, isLoading, onClose, onGrade,
}) => {
  const [marks,    setMarks]    = useState(submission?.marks?.toString() ?? "");
  const [feedback, setFeedback] = useState(submission?.feedback ?? "");
  const [error,    setError]    = useState("");

  if (!isOpen || !submission) return null;

  const studentName = typeof submission.studentId === "object"
    ? (submission.studentId as any).name
    : "Student";

  const handleSubmit = async () => {
    const m = Number(marks);
    if (isNaN(m) || m < 0)  { setError("Enter valid marks."); return; }
    if (m > maxMarks)         { setError(`Marks cannot exceed ${maxMarks}.`); return; }
    setError("");
    try {
      await onGrade(submission.id, m, feedback.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to grade.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-black text-lg">Grade Submission</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Student: <span className="text-white font-semibold">{studentName}</span>
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Marks * (out of {maxMarks})
            </label>
            <input
              type="number"
              min="0"
              max={maxMarks}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              disabled={isLoading}
              placeholder={`0 – ${maxMarks}`}
              className="w-full bg-[#111111] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="Write feedback for the student..."
              className="w-full bg-[#111111] border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-white text-black py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Grading...</>
              : "Submit Grade"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeModal;