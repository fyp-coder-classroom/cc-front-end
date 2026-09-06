import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import ThemePicker from "../../components/ui/ThemePicker";
import { getTeacherClassroomsAPI } from "../../services/classroomService";
import { getAssignmentsByClassroomAPI } from "../../services/assignmentService";
import { getSubmissionsByAssignmentAPI } from "../../services/submissionService";
import type { Classroom } from "../../types/classroom";
import type { Assignment } from "../../types/assignment";
import type { Submission } from "../../types/submission";

//  Submission with extra context 
interface SubmissionWithContext extends Submission {
  classroomId: string;
  classroomName: string;
}

//  Build activity bars, exact day matching
const buildActivityBars = (submissions: SubmissionWithContext[]): number[] => {
  const counts = Array(7).fill(0);
  const now = new Date();

  // Normalize today to midnight
  const todayMidnight = new Date(
    now.getFullYear(), now.getMonth(), now.getDate()
  ).getTime();

  submissions.forEach((s) => {
    const subDate = new Date(s.submittedAt);
    const subMidnight = new Date(
      subDate.getFullYear(), subDate.getMonth(), subDate.getDate()
    ).getTime();

    const diffDays = Math.round(
      (todayMidnight - subMidnight) / (1000 * 60 * 60 * 24)
    );

    // diffDays=0 => today (index 6), diffDays=1 => yesterday (index 5), etc.
    if (diffDays >= 0 && diffDays < 7) {
      counts[6 - diffDays] += 1;
    }
  });

  return counts;
};

// Day labels Mon, Tue... Today 
const getDayLabels = (): string[] => {
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();
  return Array.from({ length: 7 }, (_, i) => {
    if (i === 6) return "Today";
    const idx = (today - 6 + i + 7) % 7;
    return dayMap[idx];
  });
};

const TeacherDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name ?? "Teacher";

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionWithContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    );

    const fetchData = async () => {
      try {
        const classroomData = await getTeacherClassroomsAPI();
        setClassrooms(classroomData);

        const assignmentLists = await Promise.all(
          classroomData.map((c) =>
            getAssignmentsByClassroomAPI(c.id)
              .then((list) => list.map((a) => ({ ...a, classroomId: c.id })))
              .catch(() => [] as Assignment[])
          )
        );
        const flatAssignments = assignmentLists.flat();
        setAllAssignments(flatAssignments);

        // Fetch submissions with classroom context
        const submissionLists = await Promise.all(
          flatAssignments.map((a) => {
            // Find classroom for this assignment
            const classroom = classroomData.find((c) => c.id === a.classroomId);
            return getSubmissionsByAssignmentAPI(a.id)
              .then((list) =>
                list.map((s) => ({
                  ...s,
                  classroomId: classroom?.id ?? "",
                  classroomName: classroom?.name ?? "Unknown Class",
                }))
              )
              .catch(() => [] as SubmissionWithContext[]);
          })
        );
        setAllSubmissions(submissionLists.flat());
      } catch (err) {
        console.error("Teacher dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = classrooms.reduce(
    (sum, c) => sum + (Array.isArray(c.students) ? c.students.length : 0), 0
  );
  const activeAssignments = allAssignments.filter(
    (a) => new Date(a.deadline).getTime() > Date.now()
  ).length;

  const activityBars = buildActivityBars(allSubmissions);
  const dayLabels = getDayLabels();
  const maxBar = Math.max(...activityBars, 1);

  // Sort by newest first
  const recentSubmissions = [...allSubmissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Total Classes", value: isLoading ? "---" : String(classrooms.length), sub: "Active classrooms" },
    { label: "Total Students", value: isLoading ? "---" : String(totalStudents), sub: "Across all classes" },
    { label: "Active Assignments", value: isLoading ? "---" : String(activeAssignments), sub: "Open for submission" },
    { label: "Total Submissions", value: isLoading ? "---" : String(allSubmissions.length), sub: "All time" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black text-text">Dashboard</h1>
          <p className="text-text-muted text-xs mt-0.5">{currentDate} · Welcome, {userName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ThemePicker />
          <button
            onClick={() => navigate("/app/classes")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Create Class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

        {/* Submission Activity Bar Chart */}
        <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5 flex flex-col">
          <div>
            <h3 className="text-sm font-bold text-text mb-1">Submission Activity</h3>
            <p className="text-xs text-text-muted mb-0">Last 7 days · All assignments</p>
          </div>

          {isLoading ? (
            <div className="h-32 bg-surface-raised rounded animate-pulse" />
          ) : allSubmissions.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-text-faint text-xs">No submissions yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 flex-1" style={{ minHeight: "120px" }}>
              {activityBars.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {/* Count label above bar */}
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: count > 0 ? "#eab308" : "transparent" }}
                  >
                    {count}
                  </span>
                  {/* Bar */}
                  <div className="w-full flex items-end justify-center" style={{ height: "88px" }}>
                    <div
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${Math.max((count / maxBar) * 88, count > 0 ? 8 : 3)}px`,
                        backgroundColor: count > 0 ? "#eab308" : "#374151",
                      }}
                    />
                  </div>
                  {/* Day label */}
                  <span className="text-[9px] text-text-muted whitespace-nowrap font-medium">
                    {dayLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions  */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text">Recent Submissions</h3>
            {recentSubmissions.length > 0 && (
              <span className="text-[10px] text-text-muted">
                {recentSubmissions.length} total
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-surface-raised rounded animate-pulse" />
              ))}
            </div>
          ) : recentSubmissions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-muted text-xs">No submissions yet.</p>
            </div>
          ) : (
            // No max height - card grows with content
            <div className="space-y-1 overflow-y-auto max-h-[240px]">
              {recentSubmissions.map((s) => {
                const student = typeof s.studentId === "object" ? s.studentId : null;
                const isGraded = s.marks !== null && s.marks !== undefined;

                return (
                  <button
                    key={s.id}
                    onClick={() =>
                      navigate(`/app/classes/${s.classroomId}`)
                    }
                    className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg hover:bg-surface-raised transition-colors text-left group"
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center text-text text-[10px] font-bold flex-shrink-0">
                      {student?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-text text-xs font-medium truncate group-hover:text-primary transition-colors">
                        {student?.name ?? "Student"}
                      </p>
                      {/* Class name - middle row */}
                      <p className="text-text-secondary text-[10px] truncate">
                        {s.classroomName}
                      </p>
                      <p className="text-text-muted text-[10px]">
                        {new Date(s.submittedAt).toLocaleString("en-US", {
                          month: "short", day: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Grade badge */}
                    {isGraded ? (
                      <span className="text-[10px] bg-green-900 text-green-300 border border-green-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        {s.marks}pts
                      </span>
                    ) : (
                      <span className="text-[10px] bg-yellow-900 text-yellow-300 border border-yellow-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        New
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* All Classrooms Table */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text">All Classrooms</h3>
          <span className="text-xs text-text-muted">{classrooms.length} total</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-surface-raised rounded animate-pulse" />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm">No classrooms yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Classroom", "Class Code", "Students", "Assignments", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-text-muted pb-2 pr-4 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classrooms.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/app/classes/${c.id}`)}
                    className="cursor-pointer hover:bg-surface-raised/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-text font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-text-secondary font-mono">{c.classCode}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {Array.isArray(c.students) ? c.students.length : 0}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {allAssignments.filter((a) => a.classroomId === c.id).length}
                    </td>
                    <td className="py-3 pr-4"><Badge status="Active" /></td>
                    <td className="py-3 text-text-muted text-xs">View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;