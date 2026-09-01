import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Submission } from "../../types/submission";
import type { Assignment } from "../../types/assignment";
import type { SupportedLanguage } from "../../types/code";
import { getSubmissionByIdAPI, gradeSubmissionAPI } from "../../services/submissionService";
import { getAssignmentByIdAPI } from "../../services/assignmentService";
import CodeEditor from "../../components/code/CodeEditor";
import RunCodePanel from "../../components/code/RunCodePanel";
import GradeModal from "../../components/submission/GradeModal";
import { detectLanguage } from "../../utils/detectInput";

interface Props {
  role: "teacher";
}

const SubmissionDetail: FC<Props> = ({ role }) => {
  const {
    classroomId,
    assignmentId,
    submissionId,
  } = useParams<{
    classroomId: string;
    assignmentId: string;
    submissionId: string;
  }>();

  const navigate = useNavigate();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showGrade, setShowGrade] = useState(false);
  const [gradeLoading, setGradeLoading] = useState(false);

  const handleBack = () => {
    navigate(
      `/app/classes/${classroomId}/assignments/${assignmentId}`
    );
  };

  // Fetch submission + assignment
  useEffect(() => {
    if (!classroomId || !assignmentId || !submissionId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [sub, asgn] = await Promise.all([
          getSubmissionByIdAPI(submissionId),
          getAssignmentByIdAPI(classroomId, assignmentId),
        ]);

        setSubmission(sub);
        setAssignment(asgn);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
          "Failed to load submission."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classroomId, assignmentId, submissionId]);

  // Grade submission
  const handleGrade = async (
    id: string,
    marks: number,
    feedback: string
  ) => {
    setGradeLoading(true);

    try {
      const updated = await gradeSubmissionAPI(id, {
        marks,
        feedback,
      });

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
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
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
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Submissions
        </button>

        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400">
            {error || "Submission not found."}
          </p>
        </div>
      </div>
    );
  }

  const student =
    typeof submission.studentId === "object"
      ? submission.studentId
      : null;

  const isGraded =
    submission.marks !== null &&
    submission.marks !== undefined;

  /*
   * Submission model currently does not store language.
   * Therefore we detect the language directly from submitted code.
   * Example:
   * print("Hello")       -> Python
   * console.log("Hello") -> JavaScript
   * #include <iostream> -> C++
   */
  const detectedLanguage: SupportedLanguage =
    detectLanguage(submission.code);

  const languageLabel: Record<SupportedLanguage, string> = {
    python: "Python",
    javascript: "JavaScript",
    cpp: "C++",
  };

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
        <div className="min-w-0">
          <h1 className="text-xl font-black text-white">
            {student?.name ?? "Student"}'s Submission
          </h1>

          <p className="text-gray-400 text-xs mt-0.5 truncate">
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

      {/* SUBMITTED CODE */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-white">
              Submitted Code
            </h3>

          </div>

          {/* Language badge */}
          <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300">
            {languageLabel[detectedLanguage]}
          </span>
        </div>

        {/* SAME editor size as student */}
        <CodeEditor
          language={detectedLanguage}
          value={submission.code}
          onChange={() => { }}
          height="500px"
          readOnly
        />
      </div>

      {/* RUN STUDENT CODE */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-white">
            Run Submitted Code
          </h3>

          <p className="text-gray-500 text-xs mt-1">
            Code will be executed as{" "}
            <span className="text-gray-300 font-medium">
              {languageLabel[detectedLanguage]}
            </span>
            .
          </p>
        </div>

        <RunCodePanel
          code={submission.code}
          language={detectedLanguage}
        />
      </div>

      {/* FEEDBACK */}
      {isGraded && submission.feedback && (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
          <h3 className="text-sm font-bold text-white mb-2">
            Feedback
          </h3>

          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {submission.feedback}
          </p>
        </div>
      )}

      {/* GRADE MODAL */}
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