// ─────────────────────────────────────────────
// components/ui/ProgressBar.tsx
// Accessible horizontal progress bar.
// Props:
//   value  — current value (default: 0)
//   max    — maximum value (default: 100)
//   color  — Tailwind bg class (default: "bg-white")
// Usage: <ProgressBar value={75} color="bg-green-500" />
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { ProgressBarProps } from "../../types";

const ProgressBar: FC<ProgressBarProps> = ({ value = 0, max = 100, color = "bg-white" }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
};

export default ProgressBar;
