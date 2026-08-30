// Single submission detail — teacher views student code + grades
// Route: /app/classes/:classroomId/assignments/:assignmentId/submissions/:submissionId

import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Submission } from "../../types/submission";
import type { Assignment } from "../../types/assignment";
import { getSubmissionByIdAPI, gradeSubmissionAPI } from "../../services/submissionService";
import { getAssignmentByIdAPI } from "../../services/assignmentService";
import CodeEditor from "../../components/code/CodeEditor";
import GradeModal from "../../components/submission/GradeModal";

interface Props {
  role: "teacher";
}

const SubmissionDetail: FC<Props> = ({ role }) => {
  const { classroomId, assignmentId, submissionId } = useParams<{
    classroomId:  string;
    assignmentId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();

  const [submission,   setSubmission]   = useState<Submission | null>(null);
  const [assignment,   setAssignment]   = useState<Assignment | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState("");
  const [showGrade,    setShowGrade]    = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);

  const handleBack = () =>
    navigate(`/app/classes/${classroomId}/assignments/${assignmentId}/submissions`);

  // Fetch submission + assignment together
  useEffect(() => {
    if (!classroomId || !assignmentId || !submissionId) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const [sub, asgn] = await Promise.all([
          getSubmissionByIdAPI(submissionId),
          getAssignmentByIdAPI(classroomId, assignmentId),
        ]);
        setSubmission(sub);
        setAssignment(asgn);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load submission.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [classroomId, assignmentId, submissionId]);

  const handleGrade = async (id: string, marks: number, feedback: string) => {
    setGradeLoading(true);
    try {
      const updated = await gradeSubmissionAPI(id, { marks, feedback });
      setSubmission(updated);
      setShowGrade(false);
    } finally {
      setGradeLoading(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div>
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Submissions
        </button>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error
  if (error || !submission || !assignment) {
    return (
      <div>
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Submissions
        </button>
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Submission not found."}</p>
        </div>
      </div>
    );
  }

  const student  = typeof submission.studentId === "object" ? (submission.studentId as any) : null;
  const isGraded = submission.marks !== null && submission.marks !== undefined;

  return (
    <div>
      {/* Back */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back to Submissions
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-white">
            {student?.name ?? "Student"}'s Submission
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {student?.email} · {assignment.title}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Grade status */}
          {isGraded ? (
            <span className="bg-green-900 text-green-300 border border-green-700 px-3 py-1 rounded-lg text-xs font-medium">
              Graded: {submission.marks}/{assignment.marks}
            </span>
          ) : (
            <span className="bg-yellow-900 text-yellow-300 border border-yellow-700 px-3 py-1 rounded-lg text-xs font-medium">
              Not Graded
            </span>
          )}

          {/* Late badge */}
          {submission.isLate && (
            <span className="bg-red-900 text-red-300 border border-red-700 px-3 py-1 rounded-lg text-xs font-medium">
              Late Submission
            </span>
          )}

          {/* Grade button */}
          <button
            onClick={() => setShowGrade(true)}
            className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            {isGraded ? "Re-grade" : "Grade"}
          </button>
        </div>
      </div>

      {/* Submission meta info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Student</p>
          <p className="text-white text-sm font-medium truncate">{student?.name ?? "—"}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Submitted At</p>
          <p className="text-white text-sm font-medium">
            {new Date(submission.submittedAt).toLocaleString("en-US", {
              month: "short", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Marks</p>
          <p className="text-white text-sm font-medium">
            {isGraded ? `${submission.marks} / ${assignment.marks}` : `— / ${assignment.marks}`}
          </p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Status</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            isGraded
              ? "bg-green-900 text-green-300 border border-green-700"
              : "bg-yellow-900 text-yellow-300 border border-yellow-700"
          }`}>
            {isGraded ? "Graded" : "Pending"}
          </span>
        </div>
      </div>

      {/* Code editor — read only, same height as student editor */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-3">Submitted Code</h3>
        <CodeEditor
          language="python"
          value={submission.code}
          onChange={() => {}}
          height="500px"
          readOnly
        />
      </div>

      {/* Feedback — if graded */}
      {isGraded && submission.feedback && (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-bold text-white mb-2">Feedback</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{submission.feedback}</p>
        </div>
      )}

      {/* Grade Modal */}
      <GradeModal
        isOpen={showGrade}
        submission={submission}
        maxMarks={assignment.marks}
        isLoading={gradeLoading}
        onClose={() => setShowGrade(false)}
        onGrade={handleGrade}
      />
    </div>
  );
};

export default SubmissionDetail;