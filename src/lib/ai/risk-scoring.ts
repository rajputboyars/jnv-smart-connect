/**
 * Rule-based, transparent risk scoring — NOT a trained ML model.
 *
 * This computes a weighted combination of real, observable signals
 * (attendance, hostel leave frequency, library overdue rate, health visit
 * frequency) into a 0-100 "at-risk" score. It is deliberately not marketed
 * as AI/ML prediction: there is no labeled historical outcome data (did a
 * flagged student actually drop out or fall behind?) to train or validate a
 * classifier against yet. See docs/ROADMAP.md for what would need to be
 * true before a real trained model is honest to build.
 *
 * The weights below are a starting point, intentionally simple enough for
 * a school administrator to read, question, and adjust — that's a feature
 * of a rule-based score, not a limitation relative to an opaque model.
 */

export interface RiskInputs {
  /** Fraction of school days marked present in the trailing window, 0-1. */
  attendanceRate: number;
  /** Hostel leave requests filed in the trailing window (roughly per month). */
  hostelLeaveFrequency: number;
  /** Fraction of this student's currently-issued library books that are overdue, 0-1. */
  libraryOverdueRate: number;
  /** Doctor visits logged in the trailing window (roughly per month). */
  healthVisitFrequency: number;
}

export type RiskLevel = "low" | "moderate" | "high";

export interface RiskFactor {
  label: string;
  /** This factor's contribution to the final score, 0-100. */
  contribution: number;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

const WEIGHTS = {
  attendance: 0.5,
  hostelLeave: 0.2,
  libraryOverdue: 0.15,
  healthVisits: 0.15,
} as const;

// Frequencies at/above this many events in the trailing window are treated
// as "maximally concerning" (normalized to 1.0) rather than scaling forever.
const FREQUENCY_SATURATION_POINT = 4;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalizeFrequency(count: number): number {
  return clamp01(count / FREQUENCY_SATURATION_POINT);
}

export function computeStudentRiskScore(inputs: RiskInputs): RiskResult {
  const attendanceRisk = clamp01(1 - inputs.attendanceRate) * 100;
  const hostelLeaveRisk = normalizeFrequency(inputs.hostelLeaveFrequency) * 100;
  const libraryOverdueRisk = clamp01(inputs.libraryOverdueRate) * 100;
  const healthVisitRisk = normalizeFrequency(inputs.healthVisitFrequency) * 100;

  const factors: RiskFactor[] = [
    { label: "Attendance", contribution: Math.round(attendanceRisk * WEIGHTS.attendance) },
    { label: "Hostel leave frequency", contribution: Math.round(hostelLeaveRisk * WEIGHTS.hostelLeave) },
    { label: "Library overdue rate", contribution: Math.round(libraryOverdueRisk * WEIGHTS.libraryOverdue) },
    { label: "Health visit frequency", contribution: Math.round(healthVisitRisk * WEIGHTS.healthVisits) },
  ];

  const score = Math.min(100, factors.reduce((sum, f) => sum + f.contribution, 0));

  const level: RiskLevel = score >= 60 ? "high" : score >= 30 ? "moderate" : "low";

  return { score, level, factors };
}
