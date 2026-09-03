import { describe, expect, it } from "vitest";
import { calculateMonthlyRevenue } from "../shared/revenue";

describe("calculateMonthlyRevenue", () => {
  it("sums setup, activation and recurring monthly revenue", () => {
    expect(calculateMonthlyRevenue(248, 12480, 10, 1, 5)).toBe(16200);
  });

  it("does not produce negative revenue", () => {
    expect(calculateMonthlyRevenue(-10, -2, -1, -1, -1)).toBe(0);
  });
});
