import {
  APP_LOCK_PIN_MAX,
  APP_LOCK_PIN_MIN,
  isValidLockPin,
} from "./app-lock-pin";

describe("isValidLockPin", () => {
  it("accepts 4–6 digit PINs", () => {
    expect(isValidLockPin("1234")).toBe(true);
    expect(isValidLockPin("12345")).toBe(true);
    expect(isValidLockPin("123456")).toBe(true);
  });

  it("rejects non-digits and wrong lengths", () => {
    expect(isValidLockPin("12")).toBe(false);
    expect(isValidLockPin("1234567")).toBe(false);
    expect(isValidLockPin("12ab")).toBe(false);
    expect(isValidLockPin("")).toBe(false);
  });

  it("exposes documented length bounds", () => {
    expect(APP_LOCK_PIN_MIN).toBe(4);
    expect(APP_LOCK_PIN_MAX).toBe(6);
  });
});
