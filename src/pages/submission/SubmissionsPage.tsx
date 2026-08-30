import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Assignment } from "../../types/assignment";
import { getAssignmentByIdAPI } from "../../services/assignmentService";
import { useSubmissions } from "../../hooks/useSubmission";
import GradeModal from "../../components/submission/GradeModal";
import type { Submission } from "../../types/submission";

interface Props {
  role: "teacher";
}

const SubmissionsPage: FC<Props> = ({ role }) => {
  const { classroomId, assignmentId } = useParams<{
    classroomId:  string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();

  const [assignment,   setAssignment]   = useState<Assignment | null>(null);
  const [assignLoad,   setAssignLoad]   = useState(true);
  const [gradeTarget,  setGradeTarget]  = useState<Submission | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);

  const { submissions, isLoading, error, grade, remove } =
    useSubmissions(assignmentId ?? "");

  // Fetch assignment info
  useEffect(() => {
    if (!classroomId || !assignmentId) return;
    const fetch = async () => {
      setAssignLoad(true);
      try {
        const data = await getAssignmentByIdAPI(classroomId, assignmentId);
        setAssignment(data);
      } finally {
        setAssignLoad(false);
      }
    };
    fetch();
  }, [classroomId, assignmentId]);

  const handleBack = () =>
    navigate(`/app/classes/${classroomId}/assignments/${assignmentId}`);

  const handleViewCode = (submissionId: string) =>
    navigate(
      `/app/classes/${classroomId}/assignments/${assignmentId}/submissions/${submissionId}`
    );

  const handleGrade = async (id: string, marks: number, feedback: string) => {
    setGradeLoading(true);
    try {
      await grade(id, { marks, feedback });
      setGradeTarget(null);
    } finally {
      setGradeLoading(false);
    }
  };

  const submittedCount = submissions.length;
  const gradedCount    = submissions.filter(
    (s) => s.marks !== null && s.marks !== undefined
  ).length;
  const pendingCount   = submittedCount - gradedCount;

  return (
    <div>
      {/* Back */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back to Assignment
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black text-white">
          {assignLoad ? "Loading..." : `Submissions - ${assignment?.title ?? ""}`}
        </h1>
        <p className="text-gray-400 text-xs mt-0.5">
          {assignment?.marks ?? "?"} marks total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Submitted</p>
          <p className="text-white text-2xl font-black">{submittedCount}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Graded</p>
          <p className="text-green-400 text-2xl font-black">{gradedCount}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Pending</p>
          <p className="text-yellow-400 text-2xl font-black">{pendingCount}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white">
            All Submissions ({submittedCount})
          </h3>
        </div>

        {isLoading && (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="p-8 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No submissions yet.</p>
            <p className="text-gray-600 text-xs mt-1">Students haven't submitted yet.</p>
          </div>
        )}

        {!isLoading && !error && submissions.length > 0 && (
          <div className="divide-y divide-gray-800">
            {submissions.map((s) => {
              const student  = typeof s.studentId === "object" ? (s.studentId as any) : null;
              const isGraded = s.marks !== null && s.marks !== undefined;

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/40 transition-colors"
                >
                  {/* Student info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {student?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {student?.name ?? "-"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(s.submittedAt).toLocaleString("en-US", {
                          month: "short", day: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                        {s.isLate && (
                          <span className="ml-2 bg-red-900 text-red-300 border border-red-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            Late
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {isGraded ? (
                      <span className="text-green-400 text-xs font-semibold">
                        {s.marks}/{assignment?.marks ?? "?"}
                      </span>
                    ) : (
                      <span className="bg-yellow-900 text-yellow-300 border border-yellow-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        Pending
                      </span>
                    )}

                    {/* SubmissionDetail page */}
                    <button
                      onClick={() => handleViewCode(s.id)}
                      className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                      View Code
                    </button>

                    <button
                      onClick={() => setGradeTarget(s)}
                      className="text-xs border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg hover:border-white hover:text-white transition-colors"
                    >
                      {isGraded ? "Re-grade" : "Grade"}
                    </button>

                    <button
                      onClick={() => remove(s.id)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GradeModal
        isOpen={!!gradeTarget}
        submission={gradeTarget}
        maxMarks={assignment?.marks ?? 100}
        isLoading={gradeLoading}
        onClose={() => setGradeTarget(null)}
        onGrade={handleGrade}
      />
    </div>
  );
};

export default SubmissionsPage;