import { AnalyticsEvents } from "./analytics-events";

describe("AnalyticsEvents", () => {
  it("uses stable dotted event names for core funnels", () => {
    expect(AnalyticsEvents.loginSuccess).toBe("auth.login_success");
    expect(AnalyticsEvents.depositConfirmed).toBe("deposit.confirmed");
    expect(AnalyticsEvents.withdrawConfirmed).toBe("withdraw.confirmed");
    expect(AnalyticsEvents.supportTicketCreated).toBe("support.ticket_created");
  });

  it("has unique values", () => {
    const values = Object.values(AnalyticsEvents);
    expect(new Set(values).size).toBe(values.length);
  });
});
