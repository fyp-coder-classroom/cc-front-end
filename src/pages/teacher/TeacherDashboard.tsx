import { useState, useEffect, type FC } from "react";
import { useAuth }      from "../../context/AuthContext";
import StatCard         from "../../components/ui/StatCard";
import Badge            from "../../components/ui/Badge";
import { PlusIcon }     from "../../components/ui/Icons";
import { getTeacherClassroomsAPI } from "../../services/classroomService";
import type { Classroom } from "../../types/classroom";

interface Props {
  onOpenClassroom: (id: string) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TeacherDashboard: FC<Props> = ({ onOpenClassroom }) => {
  const { user } = useAuth();
  const userName = (user as any)?.name ?? "Teacher";

  const [classrooms,  setClassrooms]  = useState<Classroom[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("en-US", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    }));

    const fetchData = async () => {
      try {
        const data = await getTeacherClassroomsAPI();
        setClassrooms(data);
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

  const stats = [
    { label: "Total Classes",      value: isLoading ? "—" : String(classrooms.length), sub: "Active classrooms"   },
    { label: "Total Students",     value: isLoading ? "—" : String(totalStudents),      sub: "Across all classes" },
    { label: "Active Assignments", value: "—",                                           sub: "Coming soon"       },
    { label: "Pending Reviews",    value: "—",                                           sub: "Coming soon", accent: true },
  ];

  const activityBars = [40, 65, 35, 80, 55, 70, 45];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black text-white">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">{currentDate} · Welcome, {userName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs hover:border-gray-500 transition-colors">
            <PlusIcon /> New Assignment
          </button>
          <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
            Create Class
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Activity + Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-bold text-white mb-1">Submission Activity</h3>
          <p className="text-xs text-gray-500 mb-4">Last 7 days · All classes</p>
          <div className="flex items-end gap-2 h-24">
            {activityBars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-700 rounded-sm" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-gray-500">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-bold text-white mb-4">My Classes</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-800 rounded animate-pulse" />)}
            </div>
          ) : classrooms.length === 0 ? (
            <p className="text-gray-500 text-xs">No classes yet.</p>
          ) : (
            <div className="space-y-2">
              {classrooms.slice(0, 5).map((c) => (
            <button
                  key={c.id || c._id}
                  onClick={() => onOpenClassroom(c.id || c._id || "")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-xs text-gray-300 truncate max-w-[130px] group-hover:text-white transition-colors">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{c.classCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Classrooms Table */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">All Classrooms</h3>
          <span className="text-xs text-gray-500">{classrooms.length} total</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No classrooms yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {["Classroom", "Class Code", "Students", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-gray-500 pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {classrooms.map((c) => (
                  <tr
                    key={c.id || c._id}
                    onClick={() => onOpenClassroom(c._id)}
                    className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-white font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-400 font-mono">{c.classCode}</td>
                    <td className="py-3 pr-4 text-gray-400">
                      {Array.isArray(c.students) ? c.students.length : 0}
                    </td>
                    <td className="py-3 pr-4"><Badge status="Active" /></td>
                    <td className="py-3 text-gray-500 text-xs">View →</td>
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
