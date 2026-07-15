"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRiskScores } from "@/hooks/use-ai";
import type { StudentRiskScore } from "@/services/ai.service";

function levelVariant(level: StudentRiskScore["level"]): "destructive" | "warning" | "success" {
  if (level === "high") return "destructive";
  if (level === "moderate") return "warning";
  return "success";
}

export function RiskScoresTable() {
  const { data, isLoading } = useRiskScores();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning" /> Student risk indicators
        </CardTitle>
        <CardDescription>
          A rule-based score (0-100) combining attendance, hostel leave frequency, library overdue rate, and
          health visit frequency over the last 30 days — not a trained ML prediction. See docs/ROADMAP.md for
          why. Only students you have access to are shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}
        {!isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Top factor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No students to show.
                  </TableCell>
                </TableRow>
              )}
              {data?.map((s) => {
                const topFactor = [...s.factors].sort((a, b) => b.contribution - a.contribution)[0];
                return (
                  <TableRow key={s.studentId}>
                    <TableCell className="font-medium">
                      {s.name}
                      <span className="ml-2 text-xs text-muted-foreground">{s.admissionNumber}</span>
                    </TableCell>
                    <TableCell>
                      {s.className ?? "—"}
                      {s.section ? `-${s.section}` : ""}
                    </TableCell>
                    <TableCell>{s.score}</TableCell>
                    <TableCell>
                      <Badge variant={levelVariant(s.level)}>{s.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {topFactor && topFactor.contribution > 0 ? topFactor.label : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
