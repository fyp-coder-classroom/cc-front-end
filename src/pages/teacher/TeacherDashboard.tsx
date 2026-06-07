// ─────────────────────────────────────────────
// pages/teacher/TeacherDashboard.tsx
// Dashboard page for Teacher role.
// ─────────────────────────────────────────────

import type { FC } from "react";
import StatCard  from "../../components/ui/StatCard";
import Badge     from "../../components/ui/Badge";
import { PlusIcon } from "../../components/ui/Icons";
import {
  TEACHER_STATS,
  RECENT_ACTIVITY,
  PENDING_REVIEWS,
  TOP_PERFORMERS,
  SUBMISSION_ACTIVITY_BARS,
  SUBMISSION_DAYS,
  CLASS_AVG_BARS,
  CLASS_AVG_LABELS,
} from "../../data/mockData";

const TeacherDashboard: FC = () => (
  <div>

    {/* ── Header ── */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-white">Dashboard</h1>
        <p className="text-gray-500 text-xs mt-0.5">Monday, 13 April 2026 · Semester Spring 2026</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs hover:border-gray-500 transition-colors">
          <PlusIcon /> New Assignment
        </button>
        <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
          Create Class
        </button>
      </div>
    </div>

    {/* ── Stat Cards ── */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {TEACHER_STATS.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>

    {/* ── Activity Row ── */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

      {/* Submission bar chart */}
      <div className="lg:col-span-3 bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-bold text-white mb-1">Submission Activity</h3>
        <p className="text-xs text-gray-500 mb-4">Last 7 days · All classes</p>
        <div className="flex items-end gap-2 h-24">
          {SUBMISSION_ACTIVITY_BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gray-700 rounded-sm" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-gray-500">{SUBMISSION_DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity feed */}
      <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${a.dot}`} />
              <p className="flex-1 text-xs text-gray-300 leading-relaxed min-w-0">{a.text}</p>
              <span className="text-[10px] text-gray-500 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Reviews + Top Performers ── */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

      {/* Pending reviews table */}
      <div className="lg:col-span-3 bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">Pending Reviews</h3>
          <button className="text-xs text-gray-400 hover:text-white transition-colors">View All</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Submissions waiting on your grading</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {["Student", "Assignment", "Class", "Submitted", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-gray-500 pb-2 pr-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {PENDING_REVIEWS.map((r) => (
                <tr key={r.student}>
                  <td className="py-3 pr-3 text-white font-medium whitespace-nowrap">{r.student}</td>
                  <td className="py-3 pr-3 text-gray-400 whitespace-nowrap">{r.assignment}</td>
                  <td className="py-3 pr-3 text-gray-400">{r.class}</td>
                  <td className="py-3 pr-3 text-gray-400 whitespace-nowrap">{r.submitted}</td>
                  <td className="py-3 pr-3"><Badge status={r.status} /></td>
                  <td className="py-3">
                    <button className="text-white text-xs border border-gray-700 px-3 py-1 rounded hover:border-white transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top performers + avg chart */}
      <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-bold text-white mb-4">Top Performers</h3>
        <div className="space-y-3 mb-6">
          {TOP_PERFORMERS.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-gray-500 text-xs w-4">#{p.rank}</span>
              <div className={`w-7 h-7 rounded-full ${p.color} flex items-center justify-center text-black text-xs font-bold flex-shrink-0`}>
                {p.initials}
              </div>
              <span className="flex-1 text-white text-xs">{p.name}</span>
              <span className="text-gray-400 text-xs font-medium">{p.pts} pts</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-3">Class Avg. Score</p>
        <div className="flex items-end gap-1.5 h-16">
          {CLASS_AVG_BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-green-500 rounded-sm" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-gray-500">{CLASS_AVG_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default TeacherDashboard;
