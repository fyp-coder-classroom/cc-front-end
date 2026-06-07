// ─────────────────────────────────────────────
// pages/student/StudentClasses.tsx
// My Classes page for the Student role.
// ─────────────────────────────────────────────

import type { FC } from "react";
import ClassCard       from "../../components/ui/ClassCard";
import AssignmentTable from "../../components/ui/AssignmentTable";
import {
  STUDENT_COURSES,
  ASSIGNMENTS_CS_A,
  ASSIGNMENTS_CS_B,
} from "../../data/mockData";

const StudentClasses: FC = () => (
  <div>

    {/* ── Header ── */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-white">My Classes</h1>
        <p className="text-gray-500 text-xs mt-0.5">2 courses enrolled</p>
      </div>
      <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
        Join with Code
      </button>
    </div>

    {/* ── Course Cards ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {STUDENT_COURSES.map((c) => (
        <ClassCard
          key={c.title}
          title={c.title}
          desc={c.desc}
          meta={`${c.assignments} Assignments · ${c.pending} Pending`}
          progress={c.progress}
          status="Active"
        />
      ))}
    </div>

    {/* ── CS-A Assignments ── */}
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 mb-4">
      <h3 className="text-sm font-bold text-white mb-0.5">CS-A Assignments</h3>
      <p className="text-xs text-gray-500 mb-4">Introduction to C++</p>
      <AssignmentTable assignments={ASSIGNMENTS_CS_A} />
    </div>

    {/* ── CS-B Assignments ── */}
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
      <h3 className="text-sm font-bold text-white mb-0.5">CS-B Assignments</h3>
      <p className="text-xs text-gray-500 mb-4">Data Structures</p>
      <AssignmentTable assignments={ASSIGNMENTS_CS_B} />
    </div>
  </div>
);

export default StudentClasses;
