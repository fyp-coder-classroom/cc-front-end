import { useState, useEffect, type FC } from "react";
import type { Submission } from "../../types/submission";

interface Props {
  isOpen:     boolean;
  submission: Submission | null;
  maxMarks:   number;
  isLoading:  boolean;
  onClose:    () => void;
  onGrade:    (id: string, marks: number, feedback: string) => Promise<void>;
}

const GradeModal: FC<Props> = ({
  isOpen, submission, maxMarks, isLoading, onClose, onGrade,
}) => {
  const [marks,    setMarks]    = useState("");
  const [feedback, setFeedback] = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!submission) return;
    setMarks(
      submission.marks !== undefined && submission.marks !== null
        ? String(submission.marks)
        : ""
    );
    setFeedback(submission.feedback ?? "");
    setError("");
  }, [submission]);

  if (!isOpen || !submission) return null;

  const student =
    typeof submission.studentId === "object" ? submission.studentId : null;
  const isAlreadyGraded =
    submission.marks !== null && submission.marks !== undefined;

  // Live validation
  const marksNum        = Number(marks);
  const isAboveMax      = marks !== "" && marksNum > maxMarks;
  const isBelowMin      = marks !== "" && marksNum < 0;
  const isMarksInvalid  = isAboveMax || isBelowMin;

  const handleSubmit = async () => {
    setError("");
    if (marks === "" || isNaN(marksNum)) {
      setError("Marks is required.");
      return;
    }
    if (marksNum < 0) {
      setError("Marks cannot be negative.");
      return;
    }
    if (marksNum > maxMarks) {
      setError(`Marks cannot exceed ${maxMarks}.`);
      return;
    }
    try {
      await onGrade(submission.id, marksNum, feedback.trim());
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to grade. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-white font-black text-lg mb-1">
          {isAlreadyGraded ? "Re-grade" : "Grade"} Submission
        </h2>
        {student && (
          <p className="text-gray-400 text-xs mb-4">
            {student.name} · {student.email}
          </p>
        )}

        {/* Server / submit error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Marks input */}
        <div className="mb-4">
          <label className="text-gray-400 text-xs mb-1.5 block">
            Marks{" "}
            <span className="text-gray-500">(out of {maxMarks})</span>{" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min={0}
            max={maxMarks}
            value={marks}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") { setMarks(""); return; }
              const num = Number(val);
              if (num < 0) return; 
              setMarks(val);
            }}
            placeholder={`0 - ${maxMarks}`}
            className={`w-full bg-[#111] border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors ${
              isMarksInvalid
                ? "border-red-600 focus:border-red-500"
                : "border-gray-700 focus:border-gray-500"
            }`}
          />

          {/* Inline red error - marks exceed max */}
          {isAboveMax && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              ⚠ Marks cannot exceed {maxMarks}. Please enter a valid value.
            </p>
          )}
        </div>

        {/* Feedback */}
        <div className="mb-6">
          <label className="text-gray-400 text-xs mb-1.5 block">
            Feedback <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Leave a comment for the student..."
            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isMarksInvalid}
            className="flex-1 bg-white text-black py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              isAlreadyGraded ? "Update Grade" : "Save Grade"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeModal;