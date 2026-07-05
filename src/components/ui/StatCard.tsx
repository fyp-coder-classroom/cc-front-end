// // ─────────────────────────────────────────────
// // components/ui/StatCard.tsx
// // Dashboard metric card.
// // Props:
// //   label  — card title
// //   value  — large displayed number/value
// //   sub    — small subtitle text
// //   accent — highlight card with red accent color (default: false)
// // Usage: <StatCard label="Total Classes" value="3" sub="↑ 1 from last semester" />
// // ─────────────────────────────────────────────

// import type { FC } from "react";
// import type { StatCardProps } from "../../types";

// const StatCard: FC<StatCardProps> = ({ label, value, sub, accent = false }) => (
//   <div
//     className={`rounded-xl p-4 border ${
//       accent ? "bg-surface border-red-900" : "bg-surface border-border"
//     }`}
//   >
//     <p className="text-text-secondary text-xs">{label}</p>
//     <p
//       className={`text-3xl font-black mt-1 ${accent ? "text-red-400" : "text-text"}`}
//     >
//       {value}
//     </p>
//     <p
//       className={`text-xs mt-1 ${accent ? "text-red-500" : "text-text-muted"}`}
//     >
//       {sub}
//     </p>
//   </div>
// );

// export default StatCard;





// Dashboard metric card.
// Props:
//   label  — card title
//   value  — large displayed number/value
//   sub    — small subtitle text
//   accent — (kept for backward compatibility, no longer changes color —
//             all cards now use the same neutral style)
// Usage: <StatCard label="Total Classes" value="3" sub="↑ 1 from last semester" />
// ─────────────────────────────────────────────

import type { FC } from "react";
import type { StatCardProps } from "../../types";

const StatCard: FC<StatCardProps> = ({ label, value, sub }) => (
  <div className="rounded-xl p-4 border bg-surface border-border">
    <p className="text-text-secondary text-xs">{label}</p>
    <p className="text-3xl font-black mt-1 text-text">{value}</p>
    <p className="text-xs mt-1 text-text-muted">{sub}</p>
  </div>
);

export default StatCard;