import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import ProgressBar from "../../components/ui/ProgressBar";
import { getStudentClassroomsAPI } from "../../services/classroomService";
import { getAssignmentsByClassroomAPI } from "../../services/assignmentService";
import { getMySubmissionAPI } from "../../services/submissionService";
import type { Classroom } from "../../types/classroom";
import type { Assignment } from "../../types/assignment";
import ThemePicker from "../../components/ui/ThemePicker";

interface AssignmentWithClassroom extends Assignment {
  classroomName: string;
  classroomId:   string;
  submitted:     boolean;
}

const StudentDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name ?? "Student";

  const [classrooms,     setClassrooms]     = useState<Classroom[]>([]);
  const [allAssignments, setAllAssignments] = useState<AssignmentWithClassroom[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [currentDate,    setCurrentDate]    = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    );

    const fetchData = async () => {
      try {
        const classroomData = await getStudentClassroomsAPI();
        setClassrooms(classroomData);

        // Step 1 - fetch all assignments across all classrooms
        const assignmentLists = await Promise.all(
          classroomData.map(async (c) => {
            try {
              const list = await getAssignmentsByClassroomAPI(c.id);
              return list.map((a) => ({
                ...a,
                classroomName: c.name,
                classroomId:   c.id,
                submitted:     false,
              }));
            } catch {
              return [] as AssignmentWithClassroom[];
            }
          })
        );
        const flat = assignmentLists.flat();

        // Step 2 - for each assignment check if this student submitted
        const withSubmissions = await Promise.all(
          flat.map(async (a) => {
            try {
              const sub = await getMySubmissionAPI(a.id);
              return { ...a, submitted: !!sub };
            } catch {
              return { ...a, submitted: false };
            }
          })
        );

        setAllAssignments(withSubmissions);
      } catch (err) {
        console.error("Student dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pending = deadline nahi gayi AND submit nahi kiya
  const pendingAssignments = allAssignments
    .filter((a) => new Date(a.deadline).getTime() > Date.now() && !a.submitted)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const submittedCount = allAssignments.filter((a) => a.submitted).length;

  // Progress per classroom
  const classroomProgress = (classroomId: string) => {
    const cls = allAssignments.filter((a) => a.classroomId === classroomId);
    return {
      submitted: cls.filter((a) => a.submitted).length,
      total:     cls.length,
    };
  };

  const stats = [
    { label: "Total Assignments", value: isLoading ? "---" : String(allAssignments.length),      sub: "Across all classes"  },
    { label: "Pending",           value: isLoading ? "---" : String(pendingAssignments.length),  sub: "Not submitted yet"   },
    { label: "Submitted",         value: isLoading ? "---" : String(submittedCount),             sub: "Completed assignments"},
    { label: "Enrolled Classes",  value: isLoading ? "---" : String(classrooms.length),         sub: "Currently enrolled"   },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black text-text">My Dashboard</h1>
          <p className="text-text-muted text-xs mt-0.5">
            {currentDate} · Welcome, {userName}
          </p>
        </div>
        <ThemePicker />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Pending Assignments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text">Pending Assignments</h3>
          {!isLoading && (
            <span className="text-xs text-text-muted">
              {pendingAssignments.length} remaining
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-raised rounded-xl animate-pulse" />
            ))}
          </div>
        ) : pendingAssignments.length === 0 ? (
          <div className="bg-surface rounded-xl border border-dashed border-border-strong p-8 text-center">
            <p className="text-text-muted text-sm">No pending assignments.</p>
            <p className="text-text-faint text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingAssignments.slice(0, 6).map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/app/classes/${a.classroomId}/assignments/${a.id}`)}
                className="bg-surface rounded-xl border border-border p-4 text-left hover:border-gray-600 transition-colors"
              >
                <p className="text-text font-bold text-sm truncate mb-1">{a.title}</p>
                <p className="text-text-muted text-xs mb-2 truncate">{a.classroomName}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{a.marks} marks</span>
                  <span className="text-text-muted">
                    Due {new Date(a.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* My Classes Table */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-text mb-4">My Classes</h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-surface-raised rounded animate-pulse" />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">No classes joined yet.</p>
            <p className="text-text-faint text-xs mt-1">Ask your teacher for a class code.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Class Name", "Teacher", "Class Code", "Progress", ""].map((h) => (
                    <th key={h} className="text-left text-text-muted pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classrooms.map((c) => {
                  const { submitted, total } = classroomProgress(c.id);
                  const teacherName =
                    typeof c.teacherId === "object"
                      ? (c.teacherId as { name: string }).name
                      : "Teacher";
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/app/classes/${c.id}`)}
                      className="cursor-pointer hover:bg-surface-raised/50 transition-colors"
                    >
                      <td className="py-3 pr-4 text-text font-medium whitespace-nowrap">{c.name}</td>
                      <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">{teacherName}</td>
                      <td className="py-3 pr-4 text-text-secondary font-mono">{c.classCode}</td>
                      <td className="py-3 pr-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <ProgressBar value={submitted} max={total || 1} color="bg-green-500" />
                          </div>
                          <span className="text-text-muted text-[10px] whitespace-nowrap">
                            {submitted}/{total}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-text-muted text-xs">View →</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;