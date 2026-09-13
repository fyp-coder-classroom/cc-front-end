import { useState, type FC } from "react";
import type { CreateClassroomBody } from "../../types/classroom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (body: CreateClassroomBody) => Promise<void>;
  isLoading: boolean;
}

const CreateClassroomModal: FC<Props> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      setError("Classroom name is required.");
      return;
    }
    setError("");
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
      // Reset + close on success
      setName("");
      setDescription("");
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create classroom.";
      setError(msg);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-surface border border-border-strong rounded-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text font-black text-lg">Create New Classroom</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Classroom Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to C++"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-background border border-border-strong rounded-lg px-3 py-2.5 text-sm text-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Brief description of this classroom..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full bg-background border border-border-strong rounded-lg px-3 py-2.5 text-sm text-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 border border-border-strong text-text-secondary py-2.5 rounded-xl text-sm font-medium hover:border-gray-500 hover:text-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Create Classroom"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassroomModal;
