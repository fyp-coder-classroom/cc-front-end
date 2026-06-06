// ─────────────────────────────────────────────
// pages/teacher/TeacherClasses.tsx
// My Classes page for the Teacher role.
// ─────────────────────────────────────────────

import type { FC } from "react";
import ClassCard        from "../../components/ui/ClassCard";
import { PlusIcon }     from "../../components/ui/Icons";
import { TEACHER_CLASSES } from "../../data/mockData";

const TeacherClasses: FC = () => (
  <div>

    {/* ── Header ── */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-white">My Classes</h1>
        <p className="text-gray-500 text-xs mt-0.5">Usman Ahmad · Spring 2026</p>
      </div>
      <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
        <PlusIcon /> Create New Class
      </button>
    </div>

    {/* ── Cards Grid ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {TEACHER_CLASSES.map((c) => (
        <ClassCard
          key={c.title}
          title={c.title}
          desc={c.desc}
          meta={`${c.students} Students · ${c.assignments} Assignments`}
          code={c.code}
          status="Active"
        />
      ))}

      {/* Create placeholder */}
      <button className="bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700 p-5 flex flex-col items-center justify-center gap-2 hover:border-gray-500 transition-colors min-h-[180px]">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-white">
          <PlusIcon />
        </div>
        <span className="text-gray-400 text-sm">Create New Classroom</span>
      </button>
    </div>
  </div>
);

export default TeacherClasses;
