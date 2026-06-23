import {
  clampPageLimit,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "./pagination";

describe("clampPageLimit", () => {
  it("uses default when undefined", () => {
    expect(clampPageLimit()).toBe(DEFAULT_PAGE_LIMIT);
  });

  it("caps at max", () => {
    expect(clampPageLimit(500)).toBe(MAX_PAGE_LIMIT);
  });

  it("rejects invalid values", () => {
    expect(clampPageLimit(-1)).toBe(DEFAULT_PAGE_LIMIT);
    expect(clampPageLimit(NaN)).toBe(DEFAULT_PAGE_LIMIT);
  });
});
