import * as XLSX from "xlsx";

const download = (wb: XLSX.WorkBook, filename: string) =>
  XLSX.writeFile(wb, `${filename}.xlsx`);

const autoWidth = (ws: XLSX.WorkSheet, data: (string | number | null)[][]) => {
  ws["!cols"] = (data[0] ?? []).map((_, i) => ({
    wch: Math.max(10, ...data.map((r) => String(r[i] ?? "").length + 2)),
  }));
};

export interface SubmissionExportRow {
  rank: number; studentName: string; email: string;
  marks: number | string; totalMarks: number; percentage: string;
  submittedAt: string; isLate: boolean; feedback: string;
}
export const exportAssignmentSubmissions = (
  rows: SubmissionExportRow[], assignmentTitle: string, classroomName: string,
) => {
  const headers = ["Rank","Student Name","Email","Marks","Total Marks","Percentage (%)","Submitted At","Late?","Feedback"];
  const data = rows.map((r) => [r.rank,r.studentName,r.email,r.marks,r.totalMarks,r.percentage,r.submittedAt,r.isLate?"Yes":"No",r.feedback||"--"]);
  const all = [headers,...data];
  const ws = XLSX.utils.aoa_to_sheet(all);
  autoWidth(ws,all);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Submissions");
  download(wb,`${classroomName} - ${assignmentTitle} - Submissions`);
};

export interface StudentProgressExportRow {
  serial: number; assignment: string; totalMarks: number;
  obtained: number | string; percentage: string; status: string;
  submittedAt: string; isLate: string; feedback: string;
}
export const exportStudentProgress = (
  rows: StudentProgressExportRow[], studentName: string, studentEmail: string, classroomName: string,
) => {
  const graded = rows.filter((r) => r.status === "Graded");
  const totalObt = graded.reduce((s,r) => s + Number(r.obtained||0), 0);
  const totalMax = graded.reduce((s,r) => s + r.totalMarks, 0);
  const avg = graded.length > 0 ? ((totalObt/totalMax)*100).toFixed(1) : "N/A";
  const summaryH = ["Student","Email","Class","Submitted","Graded","Avg Score"];
  const summaryR = [studentName,studentEmail,classroomName,
    rows.filter((r)=>r.status!=="Not Submitted").length,graded.length,`${avg}%`];
  const headers = ["#","Assignment","Total Marks","Obtained","Percentage (%)","Status","Submitted At","Late?","Feedback"];
  const data = rows.map((r) => [r.serial,r.assignment,r.totalMarks,r.obtained,r.percentage,r.status,r.submittedAt,r.isLate,r.feedback]);
  const all = [summaryH,summaryR,[],headers,...data];
  const ws = XLSX.utils.aoa_to_sheet(all);
  autoWidth(ws,all);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Progress Report");
  download(wb,`${studentName} - Progress - ${classroomName}`);
};

export interface ClassStudentRow {
  rank: number; name: string; email: string;
  submitted: number; total: number; avgScore: string; onTime: number; late: number;
}
export interface ClassAssignmentRow {
  serial: number; title: string; totalMarks: number; deadline: string; submissions: number;
}
export const exportClassReport = (
  studentRows: ClassStudentRow[], assignmentRows: ClassAssignmentRow[], classroomName: string,
) => {
  const wb = XLSX.utils.book_new();
  const s1h = ["Rank","Name","Email","Submitted","Total Assignments","Avg Score (%)","On Time","Late"];
  const s1d = studentRows.map((r) => [r.rank,r.name,r.email,r.submitted,r.total,r.avgScore,r.onTime,r.late]);
  const ws1 = XLSX.utils.aoa_to_sheet([s1h,...s1d]);
  autoWidth(ws1,[s1h,...s1d]);
  XLSX.utils.book_append_sheet(wb,ws1,"Students & Performance");
  const s2h = ["#","Assignment Title","Total Marks","Deadline","Submissions"];
  const s2d = assignmentRows.map((r) => [r.serial,r.title,r.totalMarks,r.deadline,r.submissions]);
  const ws2 = XLSX.utils.aoa_to_sheet([s2h,...s2d]);
  autoWidth(ws2,[s2h,...s2d]);
  XLSX.utils.book_append_sheet(wb,ws2,"Assignments");
  download(wb,`${classroomName} - Class Report`);
};

export interface MyProgressSummaryRow {
  className: string; submitted: number; total: number; avgScore: string;
}
export interface MySubmissionRow {
  serial: number; className: string; assignment: string; totalMarks: number;
  obtained: number | string; percentage: string; status: string;
  submittedAt: string; late: string; feedback: string;
}
export const exportMyProgress = (
  summaryRows: MyProgressSummaryRow[], submissionRows: MySubmissionRow[], studentName: string,
) => {
  const wb = XLSX.utils.book_new();
  const s1h = ["Class Name","Submitted","Total Assignments","Avg Score (%)"];
  const s1d = summaryRows.map((r) => [r.className,r.submitted,r.total,r.avgScore]);
  const ws1 = XLSX.utils.aoa_to_sheet([s1h,...s1d]);
  autoWidth(ws1,[s1h,...s1d]);
  XLSX.utils.book_append_sheet(wb,ws1,"Summary by Class");
  const s2h = ["#","Class","Assignment","Total Marks","Obtained","Percentage (%)","Status","Submitted At","Late?","Feedback"];
  const s2d = submissionRows.map((r) => [r.serial,r.className,r.assignment,r.totalMarks,r.obtained,r.percentage,r.status,r.submittedAt,r.late,r.feedback]);
  const ws2 = XLSX.utils.aoa_to_sheet([s2h,...s2d]);
  autoWidth(ws2,[s2h,...s2d]);
  XLSX.utils.book_append_sheet(wb,ws2,"All Submissions");
  download(wb,`${studentName} - My Progress Report`);
};