import { describe, expect, it } from "vitest";
import { calculateRevenue } from "../shared/revenue";

describe("calculateRevenue", () => {
  it("multiplies activated leads by the contract rate", () => {
    expect(calculateRevenue(12480, 1)).toBe(12480);
  });

  it("does not produce negative revenue", () => {
    expect(calculateRevenue(-10, -1)).toBe(0);
  });
});
