// ─────────────────────────────────────────────
// components/ui/StatCard.tsx
// Dashboard metric card.
// Props:
//   label  — card title
//   value  — large displayed number/value
//   sub    — small subtitle text
//   accent — highlight card with red accent color (default: false)
// Usage: <StatCard label="Total Classes" value="3" sub="↑ 1 from last semester" />
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { StatCardProps } from "../../types";

const StatCard: FC<StatCardProps> = ({ label, value, sub, accent = false }) => (
  <div
    className={`rounded-xl p-4 border ${
      accent ? "bg-[#1a1a1a] border-red-900" : "bg-[#1a1a1a] border-gray-800"
    }`}
  >
    <p className="text-gray-400 text-xs">{label}</p>
    <p className={`text-3xl font-black mt-1 ${accent ? "text-red-400" : "text-white"}`}>
      {value}
    </p>
    <p className={`text-xs mt-1 ${accent ? "text-red-500" : "text-gray-500"}`}>{sub}</p>
  </div>
);

export default StatCard;
