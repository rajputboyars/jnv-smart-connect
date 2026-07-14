"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "accent";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              accent === "primary" && "bg-primary/10 text-primary",
              accent === "success" && "bg-success/15 text-success",
              accent === "warning" && "bg-warning/15 text-warning",
              accent === "accent" && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-none">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
