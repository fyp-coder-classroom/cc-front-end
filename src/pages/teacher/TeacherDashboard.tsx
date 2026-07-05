// import { useState, useEffect, type FC } from "react";
// import { useAuth }      from "../../context/AuthContext";
// import StatCard         from "../../components/ui/StatCard";
// import Badge            from "../../components/ui/Badge";
// import { PlusIcon }     from "../../components/ui/Icons";
// import { getTeacherClassroomsAPI } from "../../services/classroomService";
// import type { Classroom } from "../../types/classroom";

// interface Props {
//   onOpenClassroom: (id: string) => void;
// }

// const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const TeacherDashboard: FC<Props> = ({ onOpenClassroom }) => {
//   const { user } = useAuth();
//   const userName = (user as any)?.name ?? "Teacher";

//   const [classrooms,  setClassrooms]  = useState<Classroom[]>([]);
//   const [isLoading,   setIsLoading]   = useState(true);
//   const [currentDate, setCurrentDate] = useState("");

//   useEffect(() => {
//     const now = new Date();
//     setCurrentDate(now.toLocaleDateString("en-US", {
//       weekday: "long", day: "numeric", month: "long", year: "numeric"
//     }));

//     const fetchData = async () => {
//       try {
//         const data = await getTeacherClassroomsAPI();
//         setClassrooms(data);
//       } catch (err) {
//         console.error("Dashboard fetch error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const totalStudents = classrooms.reduce((sum, c) => {
//     return sum + (Array.isArray(c.students) ? c.students.length : 0);
//   }, 0);

//   const stats = [
//     { label: "Total Classes",      value: isLoading ? "—" : String(classrooms.length), sub: "Active classrooms"   },
//     { label: "Total Students",     value: isLoading ? "—" : String(totalStudents),      sub: "Across all classes" },
//     { label: "Active Assignments", value: "—",                                           sub: "Coming soon"       },
//     { label: "Pending Reviews",    value: "—",                                           sub: "Coming soon", accent: true },
//   ];

//   const activityBars = [40, 65, 35, 80, 55, 70, 45];

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
//         <div>
//           <h1 className="text-xl font-black text-text">Dashboard</h1>
//           <p className="text-text-muted text-xs mt-0.5">{currentDate} · Welcome, {userName}</p>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           <button
//     onClick={onGoToClasses}
//     className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
//     Create Class
//   </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
//         {stats.map((s) => <StatCard key={s.label} {...s} />)}
//       </div>

//       {/* Activity + Classes */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
//         <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5">
//           <h3 className="text-sm font-bold text-text mb-1">Submission Activity</h3>
//           <p className="text-xs text-text-muted mb-4">Last 7 days · All classes</p>
//           <div className="flex items-end gap-2 h-24">
//             {activityBars.map((h, i) => (
//               <div key={i} className="flex-1 flex flex-col items-center gap-1">
//                 <div className="w-full bg-surface-raised rounded-sm" style={{ height: `${h}%` }} />
//                 <span className="text-[10px] text-text-muted">{DAYS[i]}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5">
//           <h3 className="text-sm font-bold text-text mb-4">My Classes</h3>
//           {isLoading ? (
//             <div className="space-y-3">
//               {[1,2,3].map(i => <div key={i} className="h-8 bg-surface-raised rounded animate-pulse" />)}
//             </div>
//           ) : classrooms.length === 0 ? (
//             <p className="text-text-muted text-xs">No classes yet.</p>
//           ) : (
//             <div className="space-y-2">
//               {classrooms.slice(0, 5).map((c) => (
//             <button
//                   key={c.id}
//                   onClick={() => onOpenClassroom(c.id|| "")}
//                   className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-raised transition-colors group"
//                 >
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
//                     <span className="text-xs text-text truncate max-w-[130px] group-hover:text-text transition-colors">
//                       {c.name}
//                     </span>
//                   </div>
//                   <span className="text-xs text-text-muted font-mono">{c.classCode}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Classrooms Table */}
//       <div className="bg-surface rounded-xl border border-border p-5">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-sm font-bold text-text">All Classrooms</h3>
//           <span className="text-xs text-text-muted">{classrooms.length} total</span>
//         </div>

//         {isLoading ? (
//           <div className="space-y-3">
//             {[1,2,3].map(i => <div key={i} className="h-10 bg-surface-raised rounded animate-pulse" />)}
//           </div>
//         ) : classrooms.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-text-muted text-sm">No classrooms yet.</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-xs">
//               <thead>
//                 <tr className="border-b border-border">
//                   {["Classroom", "Class Code", "Students", "Status", ""].map((h) => (
//                     <th key={h} className="text-left text-text-muted pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-border">
//                 {classrooms.map((c) => (
//                   <tr
//                     key={c.id}
//                     onClick={() => onOpenClassroom(c.id)}
//                     className="cursor-pointer hover:bg-surface-raised/50 transition-colors"
//                   >
//                     <td className="py-3 pr-4 text-text font-medium">{c.name}</td>
//                     <td className="py-3 pr-4 text-text-secondary font-mono">{c.classCode}</td>
//                     <td className="py-3 pr-4 text-text-secondary">
//                       {Array.isArray(c.students) ? c.students.length : 0}
//                     </td>
//                     <td className="py-3 pr-4"><Badge status="Active" /></td>
//                     <td className="py-3 text-text-muted text-xs">View →</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeacherDashboard;

import { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { getTeacherClassroomsAPI } from "../../services/classroomService";
import { getAssignmentsByClassroomAPI } from "../../services/assignmentService";
import type { Classroom } from "../../types/classroom";
import type { Assignment } from "../../types/assignment";
import ThemePicker from "../../components/ui/ThemePicker";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TeacherDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name ?? "Teacher";

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );

    const fetchData = async () => {
      try {
        const classroomData = await getTeacherClassroomsAPI();
        setClassrooms(classroomData);

        // Fetch assignments for every classroom in parallel
        const assignmentLists = await Promise.all(
          classroomData.map((c) =>
            getAssignmentsByClassroomAPI(c.id).catch(() => [] as Assignment[]),
          ),
        );
        setAllAssignments(assignmentLists.flat());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = classrooms.reduce((sum, c) => {
    return sum + (Array.isArray(c.students) ? c.students.length : 0);
  }, 0);

  const activeAssignments = allAssignments.filter(
    (a) => new Date(a.deadline).getTime() > Date.now(),
  ).length;

  const stats = [
    {
      label: "Total Classes",
      value: isLoading ? "—" : String(classrooms.length),
      sub: "Active classrooms",
    },
    {
      label: "Total Students",
      value: isLoading ? "—" : String(totalStudents),
      sub: "Across all classes",
    },
    {
      label: "Active Assignments",
      value: isLoading ? "—" : String(activeAssignments),
      sub: "Open for submission",
    },
    {
      label: "Total Assignments",
      value: isLoading ? "—" : String(allAssignments.length),
      sub: "Across all classes",
      accent: true,
    },
  ];

  const activityBars = [40, 65, 35, 80, 55, 70, 45];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black text-text">Dashboard</h1>
          <p className="text-text-muted text-xs mt-0.5">
            {currentDate} · Welcome, {userName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ThemePicker />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Activity + Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text mb-1">
            Submission Activity
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Last 7 days · All classes
          </p>
          <div className="flex items-end gap-2 h-24">
            {activityBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-surface-raised rounded-sm"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-text-muted">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-text mb-4">My Classes</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-surface-raised rounded animate-pulse"
                />
              ))}
            </div>
          ) : classrooms.length === 0 ? (
            <p className="text-text-muted text-xs">No classes yet.</p>
          ) : (
            <div className="space-y-2">
              {classrooms.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/app/classes/${c.id}`)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-raised transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-xs text-text truncate max-w-[130px] group-hover:text-text transition-colors">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted font-mono">
                    {c.classCode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Classrooms Table */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text">All Classrooms</h3>
          <span className="text-xs text-text-muted">
            {classrooms.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 bg-surface-raised rounded animate-pulse"
              />
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
                  {["Classroom", "Class Code", "Students", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-text-muted pb-2 pr-4 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classrooms.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/app/classes/${c.id}`)}
                    className="cursor-pointer hover:bg-surface-raised/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-text font-medium">
                      {c.name}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary font-mono">
                      {c.classCode}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {Array.isArray(c.students) ? c.students.length : 0}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge status="Active" />
                    </td>
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
