"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsOverview } from "@/services/analytics.service";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: fetchAnalyticsOverview,
    staleTime: 60_000,
  });
}
