/** Pure PIN rules — kept free of Expo imports for unit tests. */
export const APP_LOCK_PIN_MIN = 4;
export const APP_LOCK_PIN_MAX = 6;

export function isValidLockPin(pin: string): boolean {
  return (
    /^\d+$/.test(pin) &&
    pin.length >= APP_LOCK_PIN_MIN &&
    pin.length <= APP_LOCK_PIN_MAX
  );
}
