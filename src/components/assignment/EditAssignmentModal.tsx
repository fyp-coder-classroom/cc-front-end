import { useState, useMemo, type FC } from "react";
import type { Assignment, UpdateAssignmentBody } from "../../types/assignment";

interface Props {
  isOpen: boolean;
  assignment: Assignment | null;
  onClose: () => void;
  onUpdate: (assignmentId: string, body: UpdateAssignmentBody) => Promise<void>;
  isLoading: boolean;
}

const pad = (n: number): string => String(n).padStart(2, "0");

const toLocalDateValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toLocalTimeValue = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const EditAssignmentModal: FC<Props> = ({
  isOpen,
  assignment,
  onClose,
  onUpdate,
  isLoading,
}) => {
  const todayMin = useMemo(() => toLocalDateValue(new Date()), []);

  const [form, setForm] = useState({
    title: assignment?.title ?? "",
    statement: assignment?.statement ?? "",
    marks: assignment?.marks ?? 100,
    deadlineDate: assignment
      ? toLocalDateValue(new Date(assignment.deadline))
      : "",
    deadlineTime: assignment
      ? toLocalTimeValue(new Date(assignment.deadline))
      : "23:59",
  });
  const [error, setError] = useState("");

  // Re-sync form when a new/different assignment is passed in
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (assignment && assignment.id !== loadedId) {
    setForm({
      title: assignment.title,
      statement: assignment.statement,
      marks: assignment.marks,
      deadlineDate: toLocalDateValue(new Date(assignment.deadline)),
      deadlineTime: toLocalTimeValue(new Date(assignment.deadline)),
    });
    setLoadedId(assignment.id);
    setError("");
  }

  if (!isOpen || !assignment) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "marks" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.statement.trim()) {
      setError("Assignment statement is required.");
      return;
    }
    if (!form.deadlineDate) {
      setError("Deadline date is required.");
      return;
    }
    if (!form.deadlineTime) {
      setError("Deadline time is required.");
      return;
    }

    const [year, month, day] = form.deadlineDate.split("-").map(Number);
    const [hour, minute] = form.deadlineTime.split(":").map(Number);
    const deadline = new Date(year, month - 1, day, hour, minute);

    if (deadline <= new Date()) {
      setError("Deadline must be a future date and time.");
      return;
    }
    if (form.marks < 1) {
      setError("Marks must be at least 1.");
      return;
    }

    try {
      await onUpdate(assignment.id, {
        title: form.title.trim(),
        statement: form.statement.trim(),
        marks: form.marks,
        deadline: deadline.toISOString(),
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update assignment.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-8">
      <div className="bg-surface border border-border-strong rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-text font-black text-lg">Edit Assignment</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-text-secondary text-xs mb-1 block">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Arrays & Pointers"
              className="w-full bg-[#111] border border-border-strong rounded-lg px-3 py-2.5 text-text text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Statement */}
          <div>
            <label className="text-text-secondary text-xs mb-1 block">
              Assignment Statement <span className="text-red-400">*</span>
            </label>
            <textarea
              name="statement"
              value={form.statement}
              onChange={handleChange}
              rows={5}
              placeholder="Describe what students need to do..."
              className="w-full bg-[#111] border border-border-strong rounded-lg px-3 py-2.5 text-text text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          {/* Marks */}
          <div>
            <label className="text-text-secondary text-xs mb-1 block">
              Marks <span className="text-red-400">*</span>
            </label>
            <input
              name="marks"
              type="number"
              min={1}
              value={form.marks}
              onChange={handleChange}
              className="w-full bg-[#111] border border-border-strong rounded-lg px-3 py-2.5 text-text text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Deadline - split date + time */}
          <div>
            <label className="text-text-secondary text-xs mb-1 block">
              Deadline <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="deadlineDate"
                type="date"
                value={form.deadlineDate}
                onChange={handleChange}
                min={todayMin}
                style={{ colorScheme: "dark" }}
                className="w-full bg-[#111] border border-border-strong rounded-lg px-3 py-2.5 text-text text-sm focus:outline-none focus:border-gray-500 [&::-webkit-calendar-picker-indicator]:invert"
              />
              <input
                name="deadlineTime"
                type="time"
                value={form.deadlineTime}
                onChange={handleChange}
                style={{ colorScheme: "dark" }}
                className="w-full bg-[#111] border border-border-strong rounded-lg px-3 py-2.5 text-text text-sm focus:outline-none focus:border-gray-500 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <p className="text-text-faint text-[11px] mt-1">
              Pick a future date and time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-border-strong text-text-secondary py-2.5 rounded-xl text-sm font-medium hover:border-gray-500 hover:text-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentModal;
