import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Assignment, UpdateAssignmentBody } from "../../types/assignment";
import type { SupportedLanguage, LanguageOption } from "../../types/code";
import type { Submission } from "../../types/submission";
import { getAssignmentByIdAPI, updateAssignmentAPI } from "../../services/assignmentService";
import { getSupportedLanguagesAPI } from "../../services/codeService";
import { useMySubmission, useSubmissions } from "../../hooks/useSubmission";
import EditAssignmentModal from "../../components/assignment/EditAssignmentModal";
import GradeModal from "../../components/submission/GradeModal";
import CodeEditor from "../../components/code/CodeEditor";
import RunCodePanel from "../../components/code/RunCodePanel";

interface Props {
  role: "teacher" | "student";
}

const STARTER_CODE: Record<SupportedLanguage, string> = {
  python: 'print("Hello, World!")\n',

  javascript: 'console.log("Hello, World!");\n',

  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
  java: 'This is java\n',

};

const getTimeLeft = (deadline: string) => {
  const diff = new Date(deadline).getTime() - Date.now();

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CompactCountdown: FC<{
  timeLeft: ReturnType<typeof getTimeLeft>;
}> = ({ timeLeft }) => {
  if (!timeLeft) return null;

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3">
      <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">
        Time left
      </span>

      <span className="text-white text-xl font-black font-mono tabular-nums">
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};

//  STUDENT VIEW
const StudentView: FC<{
  assignment: Assignment;
  isExpired: boolean;
  languages: LanguageOption[];
  langLoading: boolean;
  language: SupportedLanguage;
  code: string;
  assignmentId: string;
  onLangChange: (l: SupportedLanguage) => void;
  onCodeChange: (c: string) => void;
}> = ({
  assignment,
  isExpired,
  languages,
  langLoading,
  language,
  code,
  assignmentId,
  onLangChange,
  onCodeChange,
}) => {
    const {
      submission,
      isLoading: subLoading,
      isSubmitting,
      submitError,
      submit,
    } = useMySubmission(assignment.id);

    const isSubmitted = !!submission;

    const isGraded =
      submission?.marks !== null &&
      submission?.marks !== undefined;

    const handleSubmit = async () => {
      try {
        await submit({
          assignmentId: assignment.id,
          code,
        });

        localStorage.removeItem(`code_draft_${assignmentId}`);
        localStorage.removeItem(`code_language_${assignmentId}`);
      } catch {
        // submitError is handled by useMySubmission
      }
    };

    if (subLoading) {
      return (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse mb-4" />
          <div className="h-40 bg-gray-800 rounded animate-pulse" />
        </div>
      );
    }

    //  ALREADY SUBMITTED
    if (isSubmitted) {
      return (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">
                Your Submission
              </h3>

              <div className="flex items-center gap-2">
                {isGraded ? (
                  <span className="bg-green-900 text-green-300 border border-green-700 px-2 py-0.5 rounded text-xs font-medium">
                    Graded - {submission.marks}/{assignment.marks}
                  </span>
                ) : (
                  <span className="bg-yellow-900 text-yellow-300 border border-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                    Submitted - Awaiting Grade
                  </span>
                )}

                {submission.isLate && (
                  <span className="bg-red-900 text-red-300 border border-red-700 px-2 py-0.5 rounded text-xs font-medium">
                    Late
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-400 text-xs mb-3">
              Submitted:{" "}
              {new Date(submission.submittedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>

            <CodeEditor
              language={language}
              value={submission.code}
              onChange={() => { }}
              height="400px"
              readOnly
            />
          </div>

          {isGraded && submission.feedback && (
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-bold text-white mb-2">
                Teacher Feedback
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed">
                {submission.feedback}
              </p>
            </div>
          )}
        </div>
      );
    }

    //  NOT SUBMITTED
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        {isExpired ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Submissions are closed.
            </p>

            <p className="text-gray-600 text-xs mt-1">
              The deadline has passed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-bold text-white">
                Code Editor
              </h3>

              {langLoading ? (
                <div className="h-8 w-36 bg-gray-800 rounded-lg animate-pulse" />
              ) : (
                <select
                  title="Select language"
                  value={language}
                  onChange={(e) =>
                    onLangChange(
                      e.target.value as SupportedLanguage
                    )
                  }
                  className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-gray-500"
                >
                  {languages.map((l) => (
                    <option key={l.key} value={l.key}>
                      {l.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <CodeEditor
              language={language}
              value={code}
              onChange={onCodeChange}
              height="500px"
            />

            <RunCodePanel
              code={code}
              language={language}
            />

            {submitError && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-sm">
                  {submitError}
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="w-full bg-white text-black py-3 rounded-xl text-sm font-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Solution"
              )}
            </button>

            <p className="text-gray-600 text-xs text-center">
              You can only submit once. Make sure your solution is
              complete.
            </p>
          </div>
        )}
      </div>
    );
  };

//  TEACHER SUBMISSIONS VIEW
const TeacherSubmissionsView: FC<{
  assignment: Assignment;
  classroomId: string;
  assignmentId: string;
}> = ({
  assignment,
  classroomId,
  assignmentId,
}) => {
    const navigate = useNavigate();

    const {
      submissions,
      isLoading,
      error,
      grade,
    } = useSubmissions(assignment.id);

    const [gradeTarget, setGradeTarget] =
      useState<Submission | null>(null);

    const [gradeLoading, setGradeLoading] =
      useState(false);

    const submittedCount = submissions.length;

    const gradedCount = submissions.filter(
      (s) => s.marks != null
    ).length;

    const pendingCount =
      submittedCount - gradedCount;

    const handleGrade = async (
      id: string,
      marks: number,
      feedback: string
    ) => {
      setGradeLoading(true);

      try {
        await grade(id, {
          marks,
          feedback,
        });

        setGradeTarget(null);
      } finally {
        setGradeLoading(false);
      }
    };

    //  OPEN SUBMISSION DETAIL PAGE
    const handleOpenSubmission = (submissionId: string) => {
      navigate(
        `/app/classes/${classroomId}/assignments/${assignmentId}/submissions/${submissionId}`
      );
    };

    return (
      <div className="space-y-4">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">
              Submitted
            </p>

            <p className="text-white text-2xl font-black">
              {submittedCount}
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">
              Graded
            </p>

            <p className="text-green-400 text-2xl font-black">
              {gradedCount}
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">
              Pending
            </p>

            <p className="text-yellow-400 text-2xl font-black">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* SUBMISSIONS LIST */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">
              All Submissions ({submittedCount})
            </h3>
          </div>

          {isLoading && (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="p-8 text-center">
              <p className="text-red-400 text-sm">
                {error}
              </p>
            </div>
          )}

          {!isLoading &&
            !error &&
            submissions.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">
                  No submissions yet.
                </p>

                <p className="text-gray-600 text-xs mt-1">
                  Students haven't submitted yet.
                </p>
              </div>
            )}

          {!isLoading &&
            !error &&
            submissions.length > 0 && (
              <div className="divide-y divide-gray-800">

                {submissions.map((s) => {
                  const student =
                    typeof s.studentId === "object"
                      ? (s.studentId as any)
                      : null;

                  const isGraded = s.marks != null;

                  return (
                    <div
                      key={s.id}
                      onClick={() =>
                        handleOpenSubmission(s.id)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.key === " "
                        ) {
                          handleOpenSubmission(s.id);
                        }
                      }}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/40 transition-colors cursor-pointer"
                    >

                      {/* Student Info */}

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {student?.name
                            ?.charAt(0)
                            .toUpperCase() ?? "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {student?.name ?? "—"}
                          </p>

                          <p className="text-gray-500 text-xs">
                            {new Date(
                              s.submittedAt
                            ).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}

                            {s.isLate && (
                              <span className="ml-2 bg-red-900 text-red-300 border border-red-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                Late
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Marks / Status */}

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">

                        {isGraded ? (
                          <span className="text-green-400 text-xs font-semibold">
                            {s.marks}/{assignment.marks}
                          </span>
                        ) : (
                          <span className="bg-yellow-900 text-yellow-300 border border-yellow-700 px-2 py-0.5 rounded text-[10px] font-medium">
                            Pending
                          </span>
                        )}

                        <span className="text-gray-500 text-sm">
                          →
                        </span>

                      </div>
                    </div>
                  );
                })}

              </div>
            )}
        </div>

        {/* GRADE MODAL */}
        <GradeModal
          isOpen={!!gradeTarget}
          submission={gradeTarget}
          maxMarks={assignment.marks}
          isLoading={gradeLoading}
          onClose={() => setGradeTarget(null)}
          onGrade={handleGrade}
        />

      </div>
    );
  };

//  MAIN ASSIGNMENT DETAIL
const AssignmentDetail: FC<Props> = ({ role }) => {
  const {
    classroomId,
    assignmentId,
  } = useParams<{
    classroomId: string;
    assignmentId: string;
  }>();

  const navigate = useNavigate();

  const [assignment, setAssignment] =
    useState<Assignment | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [timeLeft, setTimeLeft] =
    useState<ReturnType<typeof getTimeLeft>>(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editLoading, setEditLoading] =
    useState(false);

  const [languages, setLanguages] =
    useState<LanguageOption[]>([]);

  const [langLoading, setLangLoading] =
    useState(true);

  const [language, setLanguage] =
    useState<SupportedLanguage>("python");

  const [code, setCode] =
    useState(STARTER_CODE.python);

  //  RESTORE SAVED CODE
  useEffect(() => {
    if (!assignmentId) return;

    const savedCode = localStorage.getItem(
      `code_draft_${assignmentId}`
    );

    const savedLanguage = localStorage.getItem(
      `code_language_${assignmentId}`
    ) as SupportedLanguage | null;

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (savedCode) {
      setCode(savedCode);
    }
  }, [assignmentId]);

  //  SAVE CODE DRAFT
  useEffect(() => {
    if (!assignmentId || !code) return;

    localStorage.setItem(
      `code_draft_${assignmentId}`,
      code
    );

    localStorage.setItem(
      `code_language_${assignmentId}`,
      language
    );
  }, [code, language, assignmentId]);

  //  FETCH SUPPORTED LANGUAGES
  useEffect(() => {
    if (role !== "student") return;

    const fetchLanguages = async () => {
      setLangLoading(true);

      try {
        const data =
          await getSupportedLanguagesAPI();

        setLanguages(data);
        const savedLanguage = localStorage.getItem(
          `code_language_${assignmentId}`
        ) as SupportedLanguage | null;

        const selectedLanguage =
          savedLanguage &&
            data.some((l) => l.key === savedLanguage)
            ? savedLanguage
            : data[0]?.key;

        if (selectedLanguage) {
          setLanguage(selectedLanguage);

          const savedCode = localStorage.getItem(
            `code_draft_${assignmentId}`
          );

          if (savedCode) {
            setCode(savedCode);
          } else {
            setCode(
              STARTER_CODE[selectedLanguage] ?? ""
            );
          }
        }
      } catch {
        setLanguages([
          {
            key: "python",
            label: "Python",
          },
          {
            key: "javascript",
            label: "JavaScript",
          },
          {
            key: "cpp",
            label: "C++",
          },
        ]);
      } finally {
        setLangLoading(false);
      }
    };

    fetchLanguages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  //  LANGUAGE CHANGE
  const handleLanguageChange = (
    lang: SupportedLanguage
  ) => {
    if (!assignmentId) return;

    // Previous language code completely delete
    localStorage.removeItem(
      `code_draft_${assignmentId}`
    );

    // New language set karo
    setLanguage(lang);

    // New language ka fresh starter code
    const starterCode = STARTER_CODE[lang] ?? "";

    setCode(starterCode);

    // New language
    localStorage.setItem(
      `code_language_${assignmentId}`,
      lang
    );

    localStorage.setItem(
      `code_draft_${assignmentId}`,
      starterCode
    );
  };

  //  FETCH ASSIGNMENT

  useEffect(() => {
    if (!classroomId || !assignmentId) return;

    const fetchAssignment = async () => {
      setIsLoading(true);

      try {
        const data =
          await getAssignmentByIdAPI(
            classroomId,
            assignmentId
          );

        setAssignment(data);

        setTimeLeft(
          getTimeLeft(data.deadline)
        );
      } catch (err: unknown) {
        const msg =
          (
            err as {
              response?: {
                data?: {
                  message?: string;
                };
              };
            }
          )?.response?.data?.message ??
          "Failed to load assignment.";

        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [classroomId, assignmentId]);

  //  COUNTDOWN
  useEffect(() => {
    if (!assignment) return;

    const interval = setInterval(() => {
      setTimeLeft(
        getTimeLeft(assignment.deadline)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [assignment]);

  //  BACK TO CLASSROOM
  const handleBack = () => {
    navigate(
      `/app/classes/${classroomId}`
    );
  };

  //  UPDATE ASSIGNMENT
  const handleUpdate = async (
    id: string,
    body: UpdateAssignmentBody
  ) => {
    if (!classroomId) return;

    setEditLoading(true);

    try {
      const updated = await updateAssignmentAPI(classroomId, id, body);

      setAssignment(updated);

      setTimeLeft(
        getTimeLeft(updated.deadline)
      );
    } finally {
      setEditLoading(false);
    }
  };

  //  LOADING
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

  //  ERROR
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
          <p className="text-red-400">
            {error || "Assignment not found."}
          </p>
        </div>
      </div>
    );
  }

  const isExpired = !timeLeft;

  // PAGE
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
          <h1 className="text-2xl font-black text-white">
            {assignment.title}
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            {assignment.marks} marks
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">

          {isExpired ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900 text-red-300 border border-red-700">
              Submissions Closed
            </span>
          ) : (
            <CompactCountdown
              timeLeft={timeLeft}
            />
          )}

          {role === "teacher" && (
            <button
              onClick={() =>
                setShowEditModal(true)
              }
              className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
          )}

        </div>
      </div>

      {/* Assignment Statement */}

      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-6">
        <h3 className="text-sm font-bold text-white mb-3">
          Assignment Statement
        </h3>

        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {assignment.statement}
        </p>
      </div>

      {/* STUDENT */}
      {role === "student" && (
        <StudentView
          assignment={assignment}
          isExpired={isExpired}
          languages={languages}
          langLoading={langLoading}
          language={language}
          code={code}
          assignmentId={assignmentId ?? ""}
          onLangChange={handleLanguageChange}
          onCodeChange={setCode}
        />
      )}

      {/* TEACHER */}
      {role === "teacher" && (
        <>
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-lg font-black text-white">
              Submissions
            </h2>
          </div>

          <TeacherSubmissionsView
            assignment={assignment}
            classroomId={classroomId ?? ""}
            assignmentId={assignmentId ?? ""}
          />
        </>
      )}

      {/* EDIT MODAL */}
      {role === "teacher" && (
        <EditAssignmentModal
          isOpen={showEditModal}
          assignment={assignment}
          onClose={() =>
            setShowEditModal(false)
          }
          onUpdate={handleUpdate}
          isLoading={editLoading}
        />
      )}

    </div>
  );
};

export default AssignmentDetail;