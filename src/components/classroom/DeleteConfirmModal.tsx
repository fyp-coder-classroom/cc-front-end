// Confirmation modal before deleting a classroom.

import type { FC } from "react";

interface Props {
  isOpen:        boolean;
  classroomName: string;
  isLoading:     boolean;
  onConfirm:     () => Promise<void>;
  onCancel:      () => void;
}

const DeleteConfirmModal: FC<Props> = ({
  isOpen,
  classroomName,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-white font-black text-lg mb-2">Delete Classroom</h2>
        <p className="text-gray-400 text-sm mb-2">
          Are you sure you want to delete{" "}
          <span className="text-white font-semibold">"{classroomName}"</span>?
        </p>
        <p className="text-red-400 text-xs mb-6">
          ⚠ This will permanently delete all assignments and submissions in this classroom.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
