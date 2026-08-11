import {
  buildPushCopy,
  normalizeNotificationPreferences,
  shouldDeliverPush,
} from "./catalog";

describe("notification preferences", () => {
  it("defaults to all alerts on and keeps security locked", () => {
    const prefs = normalizeNotificationPreferences(undefined);
    expect(prefs).toEqual({
      pushEnabled: true,
      transactions: true,
      identity: true,
      security: true,
      account: true,
    });
  });

  it("never lets security be turned off", () => {
    expect(
      shouldDeliverPush({ pushEnabled: true, security: false }, "security"),
    ).toBe(true);
    expect(shouldDeliverPush({ pushEnabled: false }, "security")).toBe(true);
    expect(shouldDeliverPush({ transactions: false }, "transactions")).toBe(
      false,
    );
  });
});

describe("buildPushCopy", () => {
  it("writes a payment-received alert with balance and reference", () => {
    const copy = buildPushCopy("deposit-confirmed", {
      firstName: "Ama",
      tenantName: "Adipa",
      formattedAmount: "50.00",
      formattedBalance: "200.00",
      reference: "48291033",
    });
    expect(copy?.title).toBe("Money received");
    expect(copy?.body).toContain("GHS 50.00");
    expect(copy?.body).toContain("Balance: GHS 200.00");
    expect(copy?.body).toContain("48291033");
  });

  it("returns null for unknown events", () => {
    expect(buildPushCopy("not-a-real-event")).toBeNull();
  });
});
