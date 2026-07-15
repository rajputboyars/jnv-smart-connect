"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsOverview } from "@/hooks/use-analytics";

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
};

const AXIS_PROPS = { tick: { fontSize: 12 }, stroke: "var(--muted-foreground)" };

function EmptyChart({ label = "No data yet for this period" }: { label?: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">{label}</div>
  );
}

export function AnalyticsDashboard() {
  const { data, isLoading } = useAnalyticsOverview();

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[320px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Student attendance trend (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.attendanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="present" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="absent" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="late" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hostel occupancy by building</CardTitle>
        </CardHeader>
        <CardContent>
          {data.hostelOccupancy.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.hostelOccupancy}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="building" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="occupiedBeds" name="Occupied" stackId="beds" fill="var(--color-chart-1)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="vacantBeds" name="Vacant" stackId="beds" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No hostel buildings set up yet" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Library circulation (30 days)</CardTitle>
            {data.libraryCirculation.overdueCount > 0 && (
              <Badge variant="warning">{data.libraryCirculation.overdueCount} overdue</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.libraryCirculation.issuesPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.libraryCirculation.issuesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Books issued" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No books issued in this period" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health incidents (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.healthTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.healthTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="medicineLogs" name="Medicine given" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="doctorVisits" name="Doctor visits" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No health logs in this period" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
