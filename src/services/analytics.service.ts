import { apiFetch } from "@/lib/api-client";

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

export interface HostelOccupancyRow {
  building: string;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancyRate: number;
}

export interface LibraryCirculation {
  issuesPerDay: { date: string; count: number }[];
  topCategories: { category: string; count: number }[];
  overdueCount: number;
}

export interface HealthTrendPoint {
  date: string;
  medicineLogs: number;
  doctorVisits: number;
}

export interface AnalyticsOverview {
  attendanceTrend: AttendanceTrendPoint[];
  hostelOccupancy: HostelOccupancyRow[];
  libraryCirculation: LibraryCirculation;
  healthTrends: HealthTrendPoint[];
}

export async function fetchAnalyticsOverview() {
  const res = await apiFetch<AnalyticsOverview>("/api/analytics");
  return res.data as AnalyticsOverview;
}
