import { useState, useEffect, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Assignment, UpdateAssignmentBody } from "../../types/assignment";
import type { SupportedLanguage, LanguageOption } from "../../types/code";
import {
  getAssignmentByIdAPI,
  updateAssignmentAPI,
} from "../../services/assignmentService";
import { getSupportedLanguagesAPI } from "../../services/codeService";
import EditAssignmentModal from "../../components/assignment/EditAssignmentModal";
import CodeEditor from "../../components/code/CodeEditor";
import RunCodePanel from "../../components/code/RunCodePanel";

interface Props {
  role: "teacher" | "student";
}

const STARTER_CODE: Record<SupportedLanguage, string> = {
  python: 'print("Hello, World!")\n',
  javascript: 'console.log("Hello, World!");\n',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
};

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

// Countdown, top-right pill (larger, more readable) 
const CompactCountdown: FC<{ timeLeft: ReturnType<typeof getTimeLeft> }> = ({ timeLeft }) => {
  if (!timeLeft) return null;
  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3">
      <span className="text-gray-400 text-xs uppercase tracking-wide font-medium">Time left</span>
      <span className="text-white text-xl font-black font-mono tabular-nums">
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
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

  const [languages,   setLanguages]   = useState<LanguageOption[]>([]);
  const [langLoading, setLangLoading] = useState(true);
  const [language,    setLanguage]    = useState<SupportedLanguage>("python");
  const [code,        setCode]        = useState(STARTER_CODE.python);

  useEffect(() => {
    if (role !== "student") return;

    const fetchLanguages = async () => {
      setLangLoading(true);
      try {
        const data = await getSupportedLanguagesAPI();
        setLanguages(data);
        if (data.length > 0 && !data.some((l) => l.key === language)) {
          setLanguage(data[0].key);
          setCode(STARTER_CODE[data[0].key] ?? "");
        }
      } catch {
        setLanguages([
          { key: "python", label: "Python" },
          { key: "javascript", label: "JavaScript" },
          { key: "cpp", label: "C++" },
        ]);
      } finally {
        setLangLoading(false);
      }
    };
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setCode((prev) =>
      prev === STARTER_CODE[language] ? (STARTER_CODE[lang] ?? "") : prev
    );
  };

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

  useEffect(() => {
    if (!assignment) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(assignment.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment]);

  const handleBack = () => navigate(`/app/classes/${classroomId}`);

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
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back to Classroom
      </button>

      {/* Header - title/marks left, countdown + status top-right */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{assignment.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{assignment.marks} marks</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isExpired ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900 text-red-300 border border-red-700">
              Submissions Closed
            </span>
          ) : (
            <CompactCountdown timeLeft={timeLeft} />
          )}

          {role === "teacher" && (
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
              title="Edit assignment"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-3">Assignment Statement</h3>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {assignment.statement}
        </p>
      </div>

      {role === "student" && (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          {isExpired ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Submissions are closed for this assignment.</p>
              <p className="text-gray-600 text-xs mt-1">The deadline has passed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-sm font-bold text-white">Code Editor</h3>
                {langLoading ? (
                  <div className="h-8 w-36 bg-gray-800 rounded-lg animate-pulse" />
                ) : (
                  <select
                    title="Select programming language"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                    className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-gray-500"
                  >
                    {languages.map((l) => (
                      <option key={l.key} value={l.key}>{l.label}</option>
                    ))}
                  </select>
                )}
              </div>

              <CodeEditor language={language} value={code} onChange={setCode} height="500px" />
              <RunCodePanel code={code} language={language} />
            </div>
          )}
        </div>
      )}

      {role === "teacher" && (
        <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm">Student submissions will appear here.</p>
          <p className="text-gray-600 text-xs mt-1">Submission & Grading module coming soon.</p>
        </div>
      )}

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