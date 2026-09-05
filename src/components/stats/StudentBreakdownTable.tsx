import { useState, useRef, useEffect, type FC } from "react";
import type { PerStudentStats } from "../../types/stats";
import * as XLSX from "xlsx";

interface StudentInfo { id: string; name: string; email: string; }

interface Props {
  perStudent: PerStudentStats[];
  students: StudentInfo[];
  classroomId: string;
  totalAssignments: number;
}

type SortKey = "averageScore" | "notSubmitted" | "graded";

const downloadStudentXLSX = (student: StudentInfo, ps: any, total: number) => {
  const headers = ["Metric", "Value"];
  const notSub = total - ps.submissionsMade;
  const rows: (string | number)[][] = [
    ["Student Name", student.name],
    ["Email", student.email],
    ["Submitted", `${ps.submissionsMade}/${total}`],
    ["Avg Score", ps.averageScore != null ? `${ps.averageScore.toFixed(1)}%` : "--"],
    ["Not Submitted", notSub],
    ["Graded", `${ps.gradedCount ?? 0}/${total}`],
    ["Class Rank", ps.classRank?.replace("_", " ") ?? "--"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = [{ wch: 18 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Student Stats");
  XLSX.writeFile(wb, `${student.name} - Stats.xlsx`);
};

const downloadStudentPDF = async (student: StudentInfo, ps: any, total: number) => {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  const notSub = total - ps.submissionsMade;
  doc.setFontSize(13);
  doc.text(`${student.name} -- Student Stats`, 14, 16);
  doc.setFontSize(9);
  doc.text(student.email, 14, 23);
  autoTable(doc, {
    startY: 28,
    head: [["Metric", "Value"]],
    body: [
      ["Submitted", `${ps.submissionsMade}/${total}`],
      ["Avg Score", ps.averageScore != null ? `${ps.averageScore.toFixed(1)}%` : "--"],
      ["Not Submitted", String(notSub)],
      ["Graded", `${ps.gradedCount ?? 0}/${total}`],
      ["Class Rank", ps.classRank?.replace("_", " ") ?? "--"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
  });
  doc.save(`${student.name} - Stats.pdf`);
};

//  Download Menu 
const DownloadMenu: FC<{ student: StudentInfo; ps: any; total: number }> = ({ student, ps, total }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] border border-border-strong text-text-secondary hover:text-text px-2 py-0.5 rounded transition-colors"
      >
        📥 ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-surface border border-border rounded-xl shadow-lg overflow-hidden w-32">
          <button
            onClick={() => { downloadStudentXLSX(student, ps, total); setOpen(false); }}
            className="w-full px-3 py-2.5 text-xs text-text hover:bg-surface-raised transition-colors text-left"
          >
            📊 Excel
          </button>
          <div className="border-t border-border" />
          <button
            onClick={() => { downloadStudentPDF(student, ps, total); setOpen(false); }}
            className="w-full px-3 py-2.5 text-xs text-text hover:bg-surface-raised transition-colors text-left"
          >
            📄 PDF
          </button>
        </div>
      )}
    </div>
  );
};

//  Expanded Detail Row 
const StudentDetailRow: FC<{ ps: any; total: number }> = ({ ps, total }) => {
  const notSub = total - ps.submissionsMade;
  const graded = ps.gradedCount ?? 0;

  return (
    <tr className="bg-surface-raised/60 border-b border-border">
      <td colSpan={8} className="px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            {
              label: "Avg Score",
              value: ps.averageScore != null ? `${ps.averageScore.toFixed(1)}%` : "--",
              color: ps.averageScore != null
                ? (ps.averageScore >= 50 ? "text-green-400" : "text-red-400")
                : "text-text-muted",
            },
            { label: "Submitted", value: `${ps.submissionsMade}/${total}`, color: "text-text" },
            { label: "Not Submitted", value: String(notSub), color: notSub > 0 ? "text-red-400" : "text-green-400" },
            { label: "Graded", value: `${graded}/${total}`, color: "text-text-secondary" },
          ].map((c) => (
            <div key={c.label} className="bg-surface border border-border rounded-lg p-3 text-center">
              <p className="text-text-muted text-[10px] mb-1">{c.label}</p>
              <p className={`text-base font-black ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-text-muted text-[10px]">
            Email: <span className="text-text-secondary">{ps.email}</span>
          </p>
          {ps.classRank && (
            <span className={`text-[10px] font-medium ${ps.classRank === "above_average" ? "text-green-400" :
                ps.classRank === "below_average" ? "text-red-400" : "text-yellow-400"
              }`}>
              {ps.classRank.replace("_", " ")}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
};

//  Main Component
const StudentBreakdownTable: FC<Props> = ({ perStudent, students, classroomId, totalAssignments }) => {
  const [sortKey, setSortKey] = useState<SortKey>("averageScore");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = perStudent
    .map((ps) => {
      const info = students.find(
        (s) => s.id === ps.studentId || (s as any)._id === ps.studentId
      );
      const notSubmitted = totalAssignments - ps.submissionsMade;
      const graded = ps.gradedCount ?? 0;
      return {
        ...ps,
        name: info?.name ?? "--",
        email: info?.email ?? "--",
        notSubmitted,
        graded,
      };
    })
    .sort((a, b) => {
      if (sortKey === "averageScore") {
        const aS = a.averageScore ?? -1, bS = b.averageScore ?? -1;
        return bS !== aS ? bS - aS : a.name.localeCompare(b.name);
      }
      if (sortKey === "notSubmitted") {
        return b.notSubmitted !== a.notSubmitted
          ? b.notSubmitted - a.notSubmitted
          : a.name.localeCompare(b.name);
      }
      return b.graded !== a.graded ? b.graded - a.graded : a.name.localeCompare(b.name);
    });

  const rankColor = (rank: PerStudentStats["classRank"]) =>
    rank === "above_average" ? "text-green-400" :
      rank === "below_average" ? "text-red-400" : "text-yellow-400";

  const rankLabel = (rank: PerStudentStats["classRank"]) =>
    rank === "above_average" ? "Above Avg" :
      rank === "below_average" ? "Below Avg" :
        rank === "around_average" ? "Around Avg" : "--";

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold text-text">
          Student Breakdown ({rows.length})
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: "averageScore", label: "Avg Score" },
            { key: "notSubmitted", label: "Not Submitted" },
            { key: "graded", label: "Graded" },
          ] as { key: SortKey; label: string }[]).map((s) => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${sortKey === s.key
                  ? "bg-surface-raised text-text border-border-strong"
                  : "text-text-muted border-transparent hover:text-text"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-text-muted text-sm">No student data yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Rank", "Student", "Submitted", "Avg Score", "Not Submitted", "Graded", "Class Rank", ""].map(h => (
                  <th key={h} className="text-left text-text-muted py-3 px-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <>
                  <tr
                    key={r.studentId}
                    onClick={() => setExpandedId(expandedId === r.studentId ? null : r.studentId)}
                    className="cursor-pointer hover:bg-surface-raised/50 transition-colors border-b border-border"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-text-muted font-bold">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </td>

                    {/* Student name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-raised flex items-center justify-center text-text text-[10px] font-bold flex-shrink-0">
                          {r.name !== "--" ? r.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <p className="text-text font-medium">{r.name}</p>
                      </div>
                    </td>

                    {/* Submitted */}
                    <td className="py-3 px-4 text-text-secondary">
                      {r.submissionsMade}/{totalAssignments}
                    </td>

                    {/* Avg Score */}
                    <td className="py-3 px-4">
                      {r.averageScore != null ? (
                        <span className={`font-bold ${r.averageScore >= 75 ? "text-green-400" :
                            r.averageScore >= 50 ? "text-yellow-400" : "text-red-400"
                          }`}>
                          {r.averageScore.toFixed(1)}%
                        </span>
                      ) : <span className="text-text-muted">--</span>}
                    </td>

                    {/* Not Submitted */}
                    <td className="py-3 px-4">
                      {r.notSubmitted > 0
                        ? <span className="text-red-400 font-medium">{r.notSubmitted}</span>
                        : <span className="text-green-400">0</span>}
                    </td>

                    {/* Graded */}
                    <td className="py-3 px-4 text-text-secondary">
                      {r.graded}/{totalAssignments}
                    </td>

                    {/* Class Rank */}
                    <td className="py-3 px-4">
                      {r.classRank ? (
                        <span className={`text-[10px] font-medium ${rankColor(r.classRank)}`}>
                          {rankLabel(r.classRank)}
                        </span>
                      ) : "--"}
                    </td>

                    {/* Download - stop propagation so row doesn't toggle */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <DownloadMenu
                        student={{ id: r.studentId, name: r.name, email: r.email }}
                        ps={r}
                        total={totalAssignments}
                      />
                    </td>
                  </tr>

                  {/* Expanded detail */}
                  {expandedId === r.studentId && (
                    <StudentDetailRow
                      key={`detail-${r.studentId}`}
                      ps={r}
                      total={totalAssignments}
                    />
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentBreakdownTable;