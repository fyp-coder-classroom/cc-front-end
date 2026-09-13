import { useState, useRef, useEffect, type FC } from "react";
import type { ClassroomStats } from "../../types/stats";

interface Props {
  stats:      ClassroomStats;
  onDownload: (format: "xlsx" | "pdf") => void;
}

const fmt = (v: number | null, suffix = "%") =>
  v != null ? `${v.toFixed(1)}${suffix}` : "--";

export const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const ClassOverviewCards: FC<Props> = ({ stats, onDownload }) => {
  const [showDl, setShowDl] = useState(false);
  const dlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) {
        setShowDl(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cards = [
    { label: "Class Avg Score",    value: fmt(stats.classAverageScore),   color: "text-text"       },
    { label: "Participation Rate", value: fmt(stats.participationRate),    color: "text-blue-400"   },
    { label: "Grading Backlog",    value: String(stats.gradingBacklog),    color: stats.gradingBacklog > 0 ? "text-yellow-400" : "text-text" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-text-muted text-xs mb-1">{c.label}</p>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-text-muted text-[10px]">
          Stats as of {timeAgo(stats.computedAt)}
        </p>
        <div ref={dlRef} className="relative">
          <button
            onClick={() => setShowDl((v) => !v)}
            className="text-[10px] text-text-secondary hover:text-text border border-border-strong px-2 py-1 rounded transition-colors"
          >
            📥 Download ▾
          </button>
          {showDl && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-surface border border-border rounded-xl shadow-lg overflow-hidden w-40">
              <button
                onClick={() => { onDownload("xlsx"); setShowDl(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text hover:bg-surface-raised transition-colors text-left"
              >
                📊 Excel (.xlsx)
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => { onDownload("pdf"); setShowDl(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text hover:bg-surface-raised transition-colors text-left"
              >
                📄 PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassOverviewCards;