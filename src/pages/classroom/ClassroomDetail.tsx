import { useState, useEffect, type FC } from "react";
import type { Classroom } from "../../types/classroom";
import {
  getClassroomByIdAPI,
  removeStudentFromClassroomAPI,
} from "../../services/classroomService";

interface Props {
  classroomId: string;
  role:        "teacher" | "student";
  onBack:      () => void;
}

interface Student {
  _id:   string;
  name:  string;
  email: string;
}

const ClassroomDetail: FC<Props> = ({ classroomId, role, onBack }) => {
  const [classroom,      setClassroom]      = useState<Classroom | null>(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState("");
  const [copied,         setCopied]         = useState(false);
  const [removingId,     setRemovingId]     = useState<string | null>(null);
  const [removeError,    setRemoveError]    = useState("");
  const [confirmRemove,  setConfirmRemove]  = useState<Student | null>(null);

  // ── Fetch classroom ───────────────────────
  useEffect(() => {
    const fetchClassroom = async () => {
      setIsLoading(true);
      try {
        const data = await getClassroomByIdAPI(classroomId);
        setClassroom(data);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? "Failed to load classroom.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassroom();
  }, [classroomId]);

  const handleCopyCode = () => {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Remove student ────────────────────────
  const handleRemoveStudent = async (student: Student) => {
    setRemovingId(student._id);
    setRemoveError("");
    try {
      await removeStudentFromClassroomAPI(classroomId, student._id);
      // Update UI — remove student from list
      setClassroom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          students: (prev.students as Student[]).filter(
            (s) => s._id !== student._id
          ),
        };
      });
      setConfirmRemove(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Failed to remove student.";
      setRemoveError(msg);
    } finally {
      setRemovingId(null);
    }
  };

  // ── Loading ───────────────────────────────
  if (isLoading) {
    return (
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Classes
        </button>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────
  if (error || !classroom) {
    return (
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Classes
        </button>
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Classroom not found."}</p>
        </div>
      </div>
    );
  }

  const isTeacher    = role === "teacher";
  const teacherName  = typeof classroom.teacherId === "object"
    ? (classroom.teacherId as any).name
    : "Teacher";
  const students     = (classroom.students as Student[]) ?? [];
  const studentCount = students.length;

  return (
    <div>

      {/* ── Back Button ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back to Classes
      </button>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{classroom.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {classroom.description || "No description provided."}
          </p>
        </div>

        {/* Class Code — click to copy */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-2.5 hover:border-gray-500 transition-colors group"
        >
          <span className="text-gray-400 text-xs">Class Code</span>
          <span className="text-white font-mono font-bold text-lg tracking-widest">
            {classroom.classCode}
          </span>
          <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
            {copied ? "✓ Copied!" : "Copy"}
          </span>
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Teacher</p>
          <p className="text-white font-bold text-sm truncate">{teacherName}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Students</p>
          <p className="text-white font-bold text-2xl">{studentCount}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Assignments</p>
          <p className="text-white font-bold text-2xl">—</p>
          <p className="text-gray-600 text-[10px]">Coming soon</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">Status</p>
          <span className="bg-green-900 text-green-300 border border-green-700 px-2 py-0.5 rounded text-xs font-medium">
            Active
          </span>
        </div>
      </div>

      {/* ── TEACHER VIEW — Students List ── */}
      {isTeacher && (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-bold text-white mb-4">
            Enrolled Students ({studentCount})
          </h3>

          {/* Remove error */}
          {removeError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 mb-4">
              <p className="text-red-400 text-sm">{removeError}</p>
            </div>
          )}

          {studentCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No students enrolled yet.</p>
              <p className="text-gray-600 text-xs mt-1">
                Share the class code{" "}
                <span className="font-mono text-gray-400">{classroom.classCode}</span>{" "}
                with your students.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["#", "Name", "Email", "Action"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-gray-500 pb-2 pr-4 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {students.map((student, i) => (
                    <tr key={student._id} className="group">
                      <td className="py-3 pr-4 text-gray-500">{i + 1}</td>

                      {/* Avatar + Name */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {student.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <span className="text-white font-medium">
                            {student.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 pr-4 text-gray-400">{student.email ?? "—"}</td>

                      {/* Remove Button */}
                      <td className="py-3">
                        <button
                          onClick={() => setConfirmRemove(student)}
                          disabled={removingId === student._id}
                          className="text-xs text-red-500 hover:text-red-400 border border-transparent hover:border-red-800 px-2 py-1 rounded transition-all disabled:opacity-50"
                        >
                          {removingId === student._id ? "Removing..." : "Remove"}
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

      {/* ── STUDENT VIEW — Info ── */}
      {!isTeacher && (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-bold text-white mb-4">Class Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Teacher</span>
              <span className="text-white font-medium">{teacherName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Total Students</span>
              <span className="text-white font-medium">{studentCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Class Code</span>
              <span className="text-white font-mono font-bold">{classroom.classCode}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Status</span>
              <span className="bg-green-900 text-green-300 border border-green-700 px-2 py-0.5 rounded text-xs font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Assignments placeholder */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h4 className="text-sm font-bold text-white mb-3">Assignments</h4>
            <div className="text-center py-6 bg-[#111111] rounded-xl border border-dashed border-gray-700">
              <p className="text-gray-500 text-sm">No assignments yet.</p>
              <p className="text-gray-600 text-xs mt-1">
                Your teacher hasn't posted any assignments yet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove Student Confirm Modal ── */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-white font-black text-lg mb-2">Remove Student</h2>
            <p className="text-gray-400 text-sm mb-2">
              Are you sure you want to remove{" "}
              <span className="text-white font-semibold">"{confirmRemove.name}"</span>{" "}
              from this classroom?
            </p>
            <p className="text-yellow-500 text-xs mb-6">
              ⚠ Student will need to rejoin using the class code.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setConfirmRemove(null); setRemoveError(""); }}
                disabled={removingId !== null}
                className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveStudent(confirmRemove)}
                disabled={removingId !== null}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {removingId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Yes, Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetail;