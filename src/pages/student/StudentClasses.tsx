import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }        from "../../context/AuthContext";
import { useClassrooms }  from "../../hooks/useClassrooms";
import ClassroomCard      from "../../components/classroom/ClassroomCard";
import JoinClassroomModal from "../../components/classroom/JoinClassroomModal";
import { PlusIcon }       from "../../components/ui/Icons";

const StudentClasses: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name ?? "Student";

  const { classrooms, isLoading, error, joinClassroom } = useClassrooms("student");

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLoading,   setJoinLoading]   = useState(false);

  const handleJoin = async (classCode: string) => {
    setJoinLoading(true);
    try {
      await joinClassroom({ classCode });
      setShowJoinModal(false);
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">My Classes</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {userName} · {classrooms.length} enrolled
          </p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
        >
          <PlusIcon /> Join with Code
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 animate-pulse">
              <div className="w-9 h-9 bg-gray-800 rounded-lg mb-3" />
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-full mb-1" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && classrooms.length === 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
            <PlusIcon />
          </div>
          <p className="text-white font-semibold text-sm mb-1">No classrooms yet</p>
          <p className="text-gray-500 text-xs mb-4">Ask your teacher for a class code.</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-white text-black px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Join a Classroom
          </button>
        </div>
      )}

      {/* Classrooms Grid */}
      {!isLoading && !error && classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classrooms.map((c) => (
            <ClassroomCard
              key={c.id}
              classroom={c}
              role="student"
              onClick={(id) => navigate(`/app/classes/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Join Modal */}
      <JoinClassroomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoin}
        isLoading={joinLoading}
      />
    </div>
  );
};

export default StudentClasses;
