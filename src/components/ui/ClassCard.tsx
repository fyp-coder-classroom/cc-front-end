// ─────────────────────────────────────────────
// components/ui/ClassCard.tsx
// Displays a single course/class card tile.
// Props: see ClassCardProps in types/index.ts
// Usage: <ClassCard title="Data Structures" desc="..." meta="21 Students" code="XYZ789" />
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { ClassCardProps } from "../../types";
import Badge from "./Badge";
import ProgressBar from "./ProgressBar";
import { CodeIcon } from "./Icons";

const ClassCard: FC<ClassCardProps> = ({
  title,
  desc,
  meta,
  code,
  progress,
  status = "Active",
  onClick,
}) => (
  <div
    onClick={onClick}
    className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-5 hover:border-gray-600 transition-colors cursor-pointer"
  >
    {/* Header row */}
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-white">
        <CodeIcon />
      </div>
      <Badge status={status} />
    </div>

    {/* Content */}
    <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
    <p className="text-gray-500 text-xs leading-relaxed mb-3">{desc}</p>

    {/* Optional progress bar */}
    {typeof progress === "number" && (
      <div className="mb-3">
        <ProgressBar value={progress} color="bg-white" />
      </div>
    )}

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
      <span className="text-xs text-gray-400">{meta}</span>
      {code && (
        <span className="text-xs text-gray-500">
          CODE: <span className="text-gray-300 font-mono">{code}</span>
        </span>
      )}
    </div>
  </div>
);

export default ClassCard;
