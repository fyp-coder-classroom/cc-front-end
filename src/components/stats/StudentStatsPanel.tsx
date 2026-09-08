import { useState, useRef, useEffect, type FC } from "react";
import type { MyStats } from "../../types/stats";
import PerformanceTrendChart from "./PerformanceTrendChart";

interface Props {
  stats:      MyStats;
  onDownload: (format: "xlsx" | "pdf") => void;
}

export const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const rankColor = (rank: MyStats["myClassRank"]) =>
  rank === "above_average" ? "text-green-400" :
  rank === "below_average" ? "text-red-400"   : "text-yellow-400";

const rankLabel = (rank: MyStats["myClassRank"]) =>
  rank === "above_average" ? "Above Average"  :
  rank === "below_average" ? "Below Average"  :
  rank === "around_average" ? "Around Average" : "--";

const StudentStatsPanel: FC<Props> = ({ stats, onDownload }) => {
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

  const notSubmitted = stats.myTotalAssignments - stats.mySubmissionsMade;

  // Rank display - show rank or fallback to class avg comparison
  const hasRank = stats.myRankPosition != null && stats.totalStudents != null;
  const rankDisplay = hasRank
    ? `#${stats.myRankPosition} of ${stats.totalStudents}`
    : stats.myClassRank
      ? rankLabel(stats.myClassRank)
      : "--";

  const cards = [
    {
      label: "My Avg Score",
      value: stats.myAverageScore != null ? `${stats.myAverageScore.toFixed(1)}%` : "--",
      color: stats.myAverageScore != null
        ? (stats.myAverageScore >= 50 ? "text-green-400" : "text-red-400")
        : "text-text-muted",
    },
    { label: "Submitted",     value: `${stats.mySubmissionsMade}/${stats.myTotalAssignments}`, color: "text-text" },
    { label: "Not Submitted", value: String(notSubmitted), color: notSubmitted > 0 ? "text-red-400" : "text-green-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Header: computedAt + download */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-[10px]">Stats as of {timeAgo(stats.computedAt)}</p>
        <div ref={dlRef} className="relative">
          <button
            onClick={() => setShowDl((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-text border border-border-strong px-2 py-1 rounded transition-colors"
          >
            📥 Download ▾
          </button>
          {showDl && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-surface border border-border rounded-xl shadow-lg overflow-hidden w-36">
              <button onClick={() => { onDownload("xlsx"); setShowDl(false); }}
                className="w-full px-3 py-2.5 text-xs text-text hover:bg-surface-raised transition-colors text-left">
                📊 Excel
              </button>
              <div className="border-t border-border"/>
              <button onClick={() => { onDownload("pdf"); setShowDl(false); }}
                className="w-full px-3 py-2.5 text-xs text-text hover:bg-surface-raised transition-colors text-left">
                📄 PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-text-muted text-xs mb-1">{c.label}</p>
            <p className={`text-lg font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Rank card */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-xs mb-1">My Class Rank</p>
          <p className={`text-xl font-black ${rankColor(stats.myClassRank)}`}>
            {rankDisplay}
          </p>
          {hasRank && (
            <p className={`text-xs mt-0.5 ${rankColor(stats.myClassRank)}`}>
              {rankLabel(stats.myClassRank)}
            </p>
          )}
        </div>
        {stats.classAverageScore != null && (
          <div className="text-right">
            <p className="text-text-muted text-xs mb-1">Class Average</p>
            <p className="text-text font-bold">{stats.classAverageScore.toFixed(1)}%</p>
          </div>
        )}
      </div>

      {/* Trend chart */}
      <PerformanceTrendChart trend={stats.myPerformanceTrend} title="My Performance Trend" />
    </div>
  );
};

export default StudentStatsPanel;