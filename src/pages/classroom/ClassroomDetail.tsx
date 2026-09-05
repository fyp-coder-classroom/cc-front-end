import { useState, useEffect, useCallback, type FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Classroom, ClassroomMember } from "../../types/classroom";
import type { Assignment } from "../../types/assignment";
import type { ClassroomStats, MyStats } from "../../types/stats";
import { getClassroomByIdAPI, removeStudentFromClassroomAPI } from "../../services/classroomService";
import { getClassroomStatsAPI, getMyStatsAPI, recomputeClassroomStatsAPI } from "../../services/statsService";
import { useAssignments } from "../../hooks/useAssignments";
import AssignmentCard from "../../components/assignment/AssignmentCard";
import CreateAssignmentModal from "../../components/assignment/CreateAssignmentModal";
import DeleteAssignmentModal from "../../components/assignment/DeleteAssignmentModal";
import ClassOverviewCards from "../../components/stats/ClassOverviewCards";
import StudentBreakdownTable from "../../components/stats/StudentBreakdownTable";
import StudentStatsPanel from "../../components/stats/StudentStatsPanel";
import { PlusIcon } from "../../components/ui/Icons";
import * as XLSX from "xlsx";

interface Props { role: "teacher" | "student"; }
type TeacherTab = "assignments" | "students" | "analytics";

//  localStorage helpers 
const TAB_KEY = (id: string) => `classroom_tab_${id}`;

//  PDF helper 
const downloadPDF = async (title: string, headers: string[], rows: (string | number)[][]) => {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  doc.setFontSize(13);
  doc.text(title, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
  });
  doc.save(`${title}.pdf`);
};

// XLSX helper 
const downloadXLSX = (title: string, headers: string[], rows: (string | number)[][]) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const colWidths = headers.map((_, i) => ({
    wch: Math.max(12, ...rows.map(r => String(r[i] ?? '').length + 2)),
  }));
  ws['!cols'] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stats");
  XLSX.writeFile(wb, `${title}.xlsx`);
};

const ClassroomDetail: FC<Props> = ({ role }) => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();

  const onBack = () => navigate("/app/classes");
  const onViewAssignment = (a: Assignment) =>
    navigate(`/app/classes/${classroomId}/assignments/${a.id}`);

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<ClassroomMember | null>(null);

  // Persistent tab state
  const [activeTab, setActiveTab] = useState<TeacherTab>(() => {
    if (!classroomId) return "assignments";
    return (localStorage.getItem(TAB_KEY(classroomId)) as TeacherTab) ?? "assignments";
  });

  const handleTabChange = (tab: TeacherTab) => {
    setActiveTab(tab);
    if (classroomId) localStorage.setItem(TAB_KEY(classroomId), tab);
  };

  // Stats
  const [classStats, setClassStats] = useState<ClassroomStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const {
    assignments, isLoading: assignmentsLoading, error: assignmentsError,
    createAssignment, deleteAssignment,
  } = useAssignments(classroomId ?? "");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch classroom
  useEffect(() => {
    if (!classroomId) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await getClassroomByIdAPI(classroomId);
        setClassroom(data);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load classroom.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [classroomId]);

  // Fetch stats
  const fetchStats = useCallback(async (showLoader = true) => {
    if (!classroomId) return;
    if (showLoader) setStatsLoading(true);
    setStatsError("");
    try {
      // Recompute karo fresh data ke liye - GET nahi, POST
      const s = await recomputeClassroomStatsAPI(classroomId);
      if (role === "teacher") {
        setClassStats(s);
      } else {
        // Student  entry from recomputed stats
        const myEntry = s.perStudent?.find(
          (ps: any) => ps.studentId?.toString() === user?.id
        );
        setMyStats({
          classroomId: s.classroomId,
          studentId: myEntry?.studentId ?? "",
          mySubmissionsMade: myEntry?.submissionsMade ?? 0,
          myTotalAssignments: s.totalAssignments,
          myAverageScore: myEntry?.averageScore ?? null,
          myPerformanceTrend: myEntry?.performanceTrend ?? [],
          myNotSubmitted: s.totalAssignments - (myEntry?.submissionsMade ?? 0),
          myMissingAssignmentIds: myEntry?.missingAssignmentIds ?? [],
          myGradedCount: myEntry?.gradedCount ?? 0,
          myClassRank: myEntry?.classRank ?? null,
          myRankPosition: null,
          totalStudents: s.perStudent?.length ?? 0,
          classAverageScore: s.classAverageScore,
          computedAt: s.computedAt,
        });
      }
    } catch (err: any) {
      // Fallback to GET if recompute fails
      try {
        if (role === "teacher") {
          const s = await getClassroomStatsAPI(classroomId);
          setClassStats(s);
        } else {
          const s = await getMyStatsAPI(classroomId);
          setMyStats(s);
        }
      } catch { }
    } finally {
      if (showLoader) setStatsLoading(false);
    }
  }, [classroomId, role]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!classroomId) return;
      try {
        // GET only - no recompute, fast
        if (role === "teacher") {
          const s = await getClassroomStatsAPI(classroomId);
          setClassStats(s);
        } else {
          const s = await getMyStatsAPI(classroomId);
          setMyStats(s);
        }
      } catch { }
    }, 5000);
    return () => clearInterval(interval);
  }, [classroomId, role]);

  const handleCopyCode = () => {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveStudent = async (student: ClassroomMember) => {
    if (!classroomId) return;
    setRemovingId(student.id);
    setRemoveError("");
    try {
      await removeStudentFromClassroomAPI(classroomId, student.id);
      setClassroom((prev) => prev
        ? { ...prev, students: (prev.students as ClassroomMember[]).filter((s) => s.id !== student.id) }
        : prev);
      setConfirmRemove(null);
      // Refresh stats after remove
      fetchStats();
    } catch (err: any) {
      setRemoveError(err?.response?.data?.message ?? "Failed to remove student.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCreate = async (body: Parameters<typeof createAssignment>[0]) => {
    setActionLoading(true);
    try { await createAssignment(body); setShowCreateModal(false); }
    finally { setActionLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try { await deleteAssignment(deleteTarget.id); setDeleteTarget(null); }
    finally { setActionLoading(false); }
  };

  //  Teacher Download 
  const handleTeacherOverviewDownload = async (format: "xlsx" | "pdf") => {
    if (!classStats || !classroom) return;
    const students = (classroom.students as ClassroomMember[]) ?? [];

    const headers = ["Rank", "Name", "Email", "Submitted", "Avg Score (%)", "Not Submitted", "Graded", "Class Rank"];
    const rows = classStats.perStudent
      .map((ps) => {
        const info = students.find(
          (s) => s.id === ps.studentId || (s as any)._id === ps.studentId
        );
        const notSub = classStats.totalAssignments - ps.submissionsMade;
        return {
          rank: 0,
          name: info?.name ?? "--",
          email: info?.email ?? "--",
          submitted: `${ps.submissionsMade}/${classStats.totalAssignments}`,
          avgScore: ps.averageScore != null ? ps.averageScore.toFixed(1) : "--",
          notSubmitted: notSub,
          graded: `${ps.gradedCount ?? 0}/${classStats.totalAssignments}`,
          classRank: ps.classRank?.replace("_", " ") ?? "--",
        };
      })
      .sort((a, b) => {
        const aS = Number(a.avgScore) || -1;
        const bS = Number(b.avgScore) || -1;
        return bS - aS;
      })
      .map((r, i) => [i + 1, r.name, r.email, r.submitted, r.avgScore, r.notSubmitted, r.graded, r.classRank]);

    const title = `${classroom.name} - Analytics Overview`;
    if (format === "xlsx") downloadXLSX(title, headers, rows as (string | number)[][]);
    else await downloadPDF(title, headers, rows as (string | number)[][]);
  };

  const handleStudentBreakdownDownload = async (format: "xlsx" | "pdf") => {
    if (!classStats || !classroom) return;
    const students = (classroom.students as ClassroomMember[]) ?? [];

    const headers = ["Rank", "Name", "Email", "Submitted", "Avg Score (%)", "Not Submitted", "Graded", "Class Rank"];
    const rows = [...classStats.perStudent]
      .sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1))
      .map((ps, i) => {
        const info = students.find((s) => s.id === ps.studentId);
        const notSub = classStats.totalAssignments - ps.submissionsMade;
        return [
          i + 1,
          info?.name ?? "--",
          info?.email ?? "--",
          `${ps.submissionsMade}/${classStats.totalAssignments}`,
          ps.averageScore != null ? ps.averageScore.toFixed(1) : "--",
          notSub,
          `${ps.gradedCount ?? 0}/${classStats.totalAssignments}`,
          ps.classRank?.replace("_", " ") ?? "--",
        ];
      });

    const title = `${classroom.name} - Student Breakdown`;
    if (format === "xlsx") downloadXLSX(title, headers, rows as (string | number)[][]);
    else await downloadPDF(title, headers, rows as (string | number)[][]);
  };

  //  Student Download 
  const handleStudentDownload = async (format: "xlsx" | "pdf") => {
    if (!myStats || !classroom) return;
    const notSub = myStats.myTotalAssignments - myStats.mySubmissionsMade;

    const headers = ["Metric", "Value"];
    const rows: (string | number)[][] = [
      ["Classroom", classroom.name],
      ["My Avg Score", myStats.myAverageScore != null ? `${myStats.myAverageScore.toFixed(1)}%` : "--"],
      ["Submitted", `${myStats.mySubmissionsMade}/${myStats.myTotalAssignments}`],
      ["Not Submitted", notSub],
      ["Graded", `${myStats.myGradedCount ?? 0}/${myStats.myTotalAssignments}`],
      ["Class Rank", myStats.myRankPosition != null ? `#${myStats.myRankPosition} of ${myStats.totalStudents}` : "--"],
      ["Class Average", myStats.classAverageScore != null ? `${myStats.classAverageScore.toFixed(1)}%` : "--"],
      ["Stats As Of", new Date(myStats.computedAt).toLocaleString("en-US")],
    ];

    const title = `My Stats - ${classroom.name}`;
    if (format === "xlsx") downloadXLSX(title, headers, rows);
    else await downloadPDF(title, headers, rows);
  };

  if (isLoading) return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text text-sm mb-6 transition-colors">← Back to Classes</button>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-raised rounded w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface-raised rounded-xl" />)}</div>
      </div>
    </div>
  );

  if (error || !classroom) return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text text-sm mb-6 transition-colors">← Back to Classes</button>
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center"><p className="text-red-400">{error || "Classroom not found."}</p></div>
    </div>
  );

  const isTeacher = role === "teacher";
  const teacherName = typeof classroom.teacherId === "object" ? classroom.teacherId.name : "Teacher";
  const students = (classroom.students as ClassroomMember[]) ?? [];

  const tabs: { key: TeacherTab; label: string }[] = [
    { key: "assignments", label: `Assignments (${assignments.length})` },
    { key: "students", label: `Students (${students.length})` },
    { key: "analytics", label: "📊 Analytics" },
  ];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text text-sm transition-colors">← Back to Classes</button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-text">{classroom.name}</h1>
          <p className="text-text-secondary text-sm mt-1">{classroom.description || "No description provided."}</p>
        </div>
        <button onClick={handleCopyCode} className="flex items-center gap-2 bg-surface border border-border-strong rounded-xl px-4 py-2.5 hover:border-gray-500 transition-colors group">
          <span className="text-text-secondary text-xs">Class Code</span>
          <span className="text-text font-mono font-bold text-lg tracking-widest">{classroom.classCode}</span>
          <span className="text-xs text-text-muted group-hover:text-text">{copied ? "✓ Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-xs mb-1">Teacher</p>
          <p className="text-text font-bold text-sm truncate">{teacherName}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-xs mb-1">Students</p>
          <p className="text-text font-bold text-2xl">{students.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-xs mb-1">Assignments</p>
          <p className="text-text font-bold text-2xl">{assignments.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-xs mb-1">Status</p>
          <span className="bg-green-900 text-green-300 border border-green-700 px-2 py-0.5 rounded text-xs font-medium">Active</span>
        </div>
      </div>

      {/* TEACHER VIEW */}
      {isTeacher && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-surface-raised p-1 rounded-xl w-fit">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === t.key ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text">Assignments ({assignments.length})</h3>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-colors">
                  <PlusIcon /> New Assignment
                </button>
              </div>
              {assignmentsLoading && <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-32 bg-surface-raised rounded-xl animate-pulse" />)}</div>}
              {!assignmentsLoading && assignmentsError && <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center"><p className="text-red-400 text-sm">{assignmentsError}</p></div>}
              {!assignmentsLoading && !assignmentsError && assignments.length === 0 && (
                <div className="text-center py-10 border border-dashed border-border-strong rounded-xl">
                  <p className="text-text-muted text-sm mb-4">No assignments yet.</p>
                  <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 mx-auto">
                    <PlusIcon /> Create Assignment
                  </button>
                </div>
              )}
              {!assignmentsLoading && !assignmentsError && assignments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignments.map((a) => <AssignmentCard key={a.id} assignment={a} role="teacher" onView={onViewAssignment} onDelete={(a) => setDeleteTarget(a)} />)}
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-text mb-4">Enrolled Students ({students.length})</h3>
              {removeError && <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 mb-4"><p className="text-red-400 text-sm">{removeError}</p></div>}
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted text-sm">No students enrolled yet.</p>
                  <p className="text-text-faint text-xs mt-1">Share code <span className="font-mono text-text-secondary">{classroom.classCode}</span></p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["#", "Name", "Email", "Action"].map(h => <th key={h} className="text-left text-text-muted pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map((student, i) => (
                        <tr key={student.id}>
                          <td className="py-3 pr-4 text-text-muted">{i + 1}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center text-text text-xs font-bold flex-shrink-0">
                                {student.name?.charAt(0).toUpperCase() ?? "?"}
                              </div>
                              <button onClick={() => navigate(`/app/classes/${classroomId}/students/${student.id}/progress`)}
                                className="text-text font-medium hover:text-primary transition-colors">
                                {student.name ?? "--"}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-text-secondary">{student.email ?? "--"}</td>
                          <td className="py-3">
                            <button onClick={() => setConfirmRemove(student)} disabled={removingId === student.id}
                              className="text-xs text-red-500 hover:text-red-400 border border-transparent hover:border-red-800 px-2 py-1 rounded transition-all disabled:opacity-50">
                              {removingId === student.id ? "Removing..." : "Remove"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              {statsLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface-raised rounded-xl" />)}</div>
                  <div className="h-48 bg-surface-raised rounded-xl" />
                </div>
              )}
              {!statsLoading && statsError && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center"><p className="text-red-400 text-sm">{statsError}</p></div>
              )}
              {!statsLoading && !statsError && !classStats && (
                <div className="bg-surface border border-dashed border-border-strong rounded-xl p-8 text-center">
                  <p className="text-text-muted text-sm">No analytics data yet.</p>
                </div>
              )}
              {!statsLoading && !statsError && classStats && (
                <>
                  <ClassOverviewCards
                    stats={classStats}
                    // isRefreshing={isRefreshing}
                    // onRefresh={handleRefreshStats}
                    onDownload={handleTeacherOverviewDownload}
                  />
                  <StudentBreakdownTable
                    perStudent={classStats.perStudent}
                    students={students}
                    classroomId={classroomId ?? ""}
                    totalAssignments={classStats.totalAssignments}
                    onDownload={handleStudentBreakdownDownload}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* STUDENT VIEW */}
      {!isTeacher && (
        <>
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text mb-4">Class Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-secondary">Teacher</span>
                <span className="text-text font-medium">{teacherName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-text-secondary">Total Students</span>
                <span className="text-text font-medium">{students.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary">Class Code</span>
                <span className="text-text font-mono font-bold">{classroom.classCode}</span>
              </div>
            </div>
          </div>

          {/* My Stats Panel */}
          {statsLoading && (
            <div className="bg-surface rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-surface-raised rounded w-1/3 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-surface-raised rounded-xl" />)}</div>
            </div>
          )}
          {!statsLoading && statsError && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center"><p className="text-red-400 text-sm">{statsError}</p></div>
          )}
          {!statsLoading && !statsError && myStats && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-text mb-4">My Performance</h3>
              <StudentStatsPanel stats={myStats} onDownload={handleStudentDownload} />
            </div>
          )}

          {/* Assignments */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-text mb-4">Assignments ({assignments.length})</h3>
            {assignmentsLoading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-raised rounded-xl animate-pulse" />)}</div>}
            {!assignmentsLoading && assignmentsError && <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center"><p className="text-red-400 text-sm">{assignmentsError}</p></div>}
            {!assignmentsLoading && !assignmentsError && assignments.length === 0 && (
              <div className="text-center py-10"><p className="text-text-muted text-sm">No assignments yet.</p></div>
            )}
            {!assignmentsLoading && !assignmentsError && assignments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignments.map((a) => <AssignmentCard key={a.id} assignment={a} role="student" onView={onViewAssignment} />)}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <CreateAssignmentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} isLoading={actionLoading} />
      <DeleteAssignmentModal isOpen={!!deleteTarget} assignmentTitle={deleteTarget?.title ?? ""} isLoading={actionLoading} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-surface border border-border-strong rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-text font-black text-lg mb-2">Remove Student</h2>
            <p className="text-text-secondary text-sm mb-2">Remove <span className="text-text font-semibold">"{confirmRemove.name}"</span>?</p>
            <p className="text-yellow-500 text-xs mb-6">⚠ Student will need to rejoin using the class code.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => { setConfirmRemove(null); setRemoveError(""); }} disabled={removingId !== null}
                className="flex-1 border border-border-strong text-text-secondary py-2.5 rounded-xl text-sm hover:border-gray-500 hover:text-text transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleRemoveStudent(confirmRemove)} disabled={removingId !== null}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {removingId ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Removing...</> : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetail;