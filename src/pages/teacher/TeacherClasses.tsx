import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import type { Classroom } from "../../types/classroom";
import { useAuth } from "../../context/AuthContext";
import { useClassrooms } from "../../hooks/useClassrooms";
import ClassroomCard from "../../components/classroom/ClassroomCard";
import CreateClassroomModal from "../../components/classroom/CreateClassroomModal";
import DeleteConfirmModal from "../../components/classroom/DeleteConfirmModal";
import { PlusIcon } from "../../components/ui/Icons";

const TeacherClasses: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name ?? "Teacher";

  const { classrooms, isLoading, error, createClassroom, deleteClassroom } =
    useClassrooms("teacher");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Classroom | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleCreate = async (body: { name: string; description: string }) => {
    setActionLoading(true);
    try {
      await createClassroom(body);
      setShowCreateModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setActionError("");
    try {
      await deleteClassroom(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete classroom.";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-text">My Classes</h1>
          <p className="text-text-muted text-xs mt-0.5">
            {userName} · {classrooms.length} classroom
            {classrooms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"

        >
          <PlusIcon /> Create New Class
        </button>
      </div>

      {actionError && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{actionError}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-border p-5 animate-pulse"
            >
              <div className="w-9 h-9 bg-surface-raised rounded-lg mb-3" />
              <div className="h-4 bg-surface-raised rounded w-3/4 mb-2" />
              <div className="h-3 bg-surface-raised rounded w-full mb-1" />
              <div className="h-3 bg-surface-raised rounded w-2/3" />
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
        <div className="bg-surface rounded-xl border border-dashed border-border-strong p-12 text-center">
          <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center mx-auto mb-4 text-text">
            <PlusIcon />
          </div>
          <p className="text-text font-semibold text-sm mb-1">
            No classrooms yet
          </p>
          <p className="text-text-muted text-xs mb-4">
            Create your first classroom to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Create Classroom
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
              role="teacher"
              onClick={(id) => navigate(`/app/classes/${id}`)}
              onDelete={(classroom) => setDeleteTarget(classroom)}
            />
          ))}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-surface rounded-xl border border-dashed border-border-strong p-5 flex flex-col items-center justify-center gap-2 hover:border-gray-500 transition-colors min-h-[180px]"
          >
            <div className="w-9 h-9 bg-surface-raised rounded-lg flex items-center justify-center text-text">
              <PlusIcon />
            </div>
            <span className="text-text-secondary text-sm">
              Create New Classroom
            </span>
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateClassroomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        isLoading={actionLoading}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        classroomName={deleteTarget?.name ?? ""}
        isLoading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
          setActionError("");
        }}
      />
    </div>
  );
};

export default TeacherClasses;
