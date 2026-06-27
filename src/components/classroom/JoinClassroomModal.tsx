// Modal form - Student joins classroom with classCode.
// Props:
//   isOpen    - show/hide modal
//   onClose   - close modal
//   onJoin    - called with classCode on submit
//   isLoading - disables button while API is running

import { useState, type FC } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (classCode: string) => Promise<void>;
  isLoading: boolean;
}

const JoinClassroomModal: FC<Props> = ({
  isOpen,
  onClose,
  onJoin,
  isLoading,
}) => {
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (): Promise<void> => {
    if (!classCode.trim()) {
      setError("Please enter a class code.");
      return;
    }
    if (classCode.trim().length !== 6) {
      setError("Class code must be 6 characters.");
      return;
    }
    setError("");
    try {
      await onJoin(classCode.trim().toUpperCase());
      setClassCode("");
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid class code. Please try again.";
      setError(msg);
    }
  };

  const handleClose = () => {
    setClassCode("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-surface border border-border-strong rounded-2xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text font-black text-lg">Join a Classroom</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <p className="text-text-muted text-sm mb-5">
          Ask your teacher for the 6-character class code and enter it below.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Input */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Class Code *
          </label>
          <input
            type="text"
            placeholder="e.g. ABC123"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={isLoading}
            className="w-full bg-background border border-border-strong rounded-lg px-3 py-2.5 text-sm text-text font-mono tracking-widest placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent disabled:opacity-50 text-center text-lg"
          />
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
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Joining...
              </>
            ) : (
              "Join Classroom"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassroomModal;
