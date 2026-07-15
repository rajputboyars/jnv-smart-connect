import { describe, expect, it } from "vitest";
import { computeStudentRiskScore } from "./risk-scoring";

describe("computeStudentRiskScore", () => {
  it("scores a perfect-attendance, no-incidents student as low risk", () => {
    const result = computeStudentRiskScore({
      attendanceRate: 1,
      hostelLeaveFrequency: 0,
      libraryOverdueRate: 0,
      healthVisitFrequency: 0,
    });
    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
  });

  it("scores a student with very poor attendance as high risk", () => {
    const result = computeStudentRiskScore({
      attendanceRate: 0.2,
      hostelLeaveFrequency: 0,
      libraryOverdueRate: 0,
      healthVisitFrequency: 0,
    });
    // (1 - 0.2) * 100 * 0.5 = 40
    expect(result.score).toBe(40);
    expect(result.level).toBe("moderate");
  });

  it("caps frequency-based factors at the saturation point rather than scaling unbounded", () => {
    const saturated = computeStudentRiskScore({
      attendanceRate: 1,
      hostelLeaveFrequency: 4,
      libraryOverdueRate: 0,
      healthVisitFrequency: 0,
    });
    const overSaturated = computeStudentRiskScore({
      attendanceRate: 1,
      hostelLeaveFrequency: 40,
      libraryOverdueRate: 0,
      healthVisitFrequency: 0,
    });
    expect(saturated.score).toBe(overSaturated.score);
  });

  it("never exceeds 100 even at every worst-case input", () => {
    const result = computeStudentRiskScore({
      attendanceRate: 0,
      hostelLeaveFrequency: 100,
      libraryOverdueRate: 1,
      healthVisitFrequency: 100,
    });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.level).toBe("high");
  });

  it("factor contributions sum to the total score", () => {
    const result = computeStudentRiskScore({
      attendanceRate: 0.7,
      hostelLeaveFrequency: 2,
      libraryOverdueRate: 0.5,
      healthVisitFrequency: 1,
    });
    const sum = result.factors.reduce((total, f) => total + f.contribution, 0);
    expect(sum).toBe(result.score);
  });
});
