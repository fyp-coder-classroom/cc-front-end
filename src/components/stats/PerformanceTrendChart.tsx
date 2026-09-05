import { type FC } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { PerformanceTrend } from "../../types/stats";

interface Props {
  trend: PerformanceTrend[];
  title?: string;
}

const PerformanceTrendChart: FC<Props> = ({ trend, title = "Performance Trend" }) => {
  if (!trend || trend.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-text mb-2">{title}</h3>
        <div className="h-32 flex items-center justify-center">
          <p className="text-text-muted text-xs">No graded submissions yet.</p>
        </div>
      </div>
    );
  }

  const data = trend.map((t, i) => ({
    name:  `A${i+1}`,
    score: Number(t.score.toFixed(1)),
    date:  new Date(t.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
  }));

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-bold text-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [`${v}%`, "Score"]}
            labelFormatter={(l, payload) => payload?.[0]?.payload?.date ?? l}
          />
          <Line type="monotone" dataKey="score" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceTrendChart;