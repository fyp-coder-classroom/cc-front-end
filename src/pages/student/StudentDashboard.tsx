import { useState, useEffect, type FC } from "react";
import { useAuth }      from "../../context/AuthContext";
import StatCard         from "../../components/ui/StatCard";
import ProgressBar      from "../../components/ui/ProgressBar";
import { PlusIcon }     from "../../components/ui/Icons";
import { getStudentClassroomsAPI } from "../../services/classroomService";
import type { Classroom } from "../../types/classroom";

interface Props {
  onOpenClassroom: (id: string) => void;
}

const StudentDashboard: FC<Props> = ({ onOpenClassroom }) => {
  const { user } = useAuth();
  const userName = (user as any)?.name ?? "Student";

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
        const data = await getStudentClassroomsAPI();
        setClassrooms(data);
      } catch (err) {
        console.error("Student dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Enrolled Classes",  value: isLoading ? "—" : String(classrooms.length), sub: "Currently enrolled" },
    { label: "Total Assignments", value: "—", sub: "Coming soon" },
    { label: "Submitted",         value: "—", sub: "Coming soon" },
    { label: "Avg. Score",        value: "—", sub: "Coming soon", accent: true },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black text-white">My Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">{currentDate} · Welcome, {userName}</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
          <PlusIcon /> Join Class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Pending Assignments */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Pending Assignments</h3>
          <button className="text-xs text-gray-400 hover:text-white transition-colors">View All →</button>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm">Assignments will appear here.</p>
          <p className="text-gray-600 text-xs mt-1">Assignment module coming soon.</p>
        </div>
      </div>

      {/* My Classes Table */}
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-bold text-white mb-4">My Classes</h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No classes joined yet.</p>
            <p className="text-gray-600 text-xs mt-1">Ask your teacher for a class code.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  {["Class Name", "Teacher", "Class Code", "Progress", ""].map((h) => (
                    <th key={h} className="text-left text-gray-500 pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {classrooms.map((c) => (
                  <tr
                    key={c._id || c.id}
                    onClick={() => onOpenClassroom(c._id)}
                    className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-white font-medium whitespace-nowrap">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                      {typeof c.teacherId === "object" ? (c.teacherId as any).name : "Teacher"}
                    </td>
                    <td className="py-3 pr-4 text-gray-400 font-mono">{c.classCode}</td>
                    <td className="py-3 pr-4 w-24">
                      <ProgressBar value={0} color="bg-white" />
                    </td>
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

export default StudentDashboard;
