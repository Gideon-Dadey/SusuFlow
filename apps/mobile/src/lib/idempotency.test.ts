import { createIdempotencyKey } from "./idempotency";

describe("createIdempotencyKey", () => {
  it("prefixes deposit and withdraw keys", () => {
    expect(createIdempotencyKey("dep")).toMatch(/^dep_\d+_[a-z0-9]+$/);
    expect(createIdempotencyKey("wd")).toMatch(/^wd_\d+_[a-z0-9]+$/);
  });

  it("returns unique keys", () => {
    const a = createIdempotencyKey("wd");
    const b = createIdempotencyKey("wd");
    expect(a).not.toBe(b);
  });
});
