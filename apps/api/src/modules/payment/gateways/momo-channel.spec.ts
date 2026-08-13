import { normalizeGhanaMsisdn, toHubtelMomoChannel } from "./momo-channel";

describe("momo-channel", () => {
  it("maps SusuFlow methods to Hubtel channels", () => {
    expect(toHubtelMomoChannel("mtn_momo")).toBe("mtn-gh");
    expect(toHubtelMomoChannel("telecel_cash")).toBe("vodafone-gh");
    expect(toHubtelMomoChannel("airteltigo")).toBe("tigo-gh");
  });

  it("normalizes Ghana phone numbers", () => {
    expect(normalizeGhanaMsisdn("0244123456")).toBe("233244123456");
    expect(normalizeGhanaMsisdn("233244123456")).toBe("233244123456");
    expect(normalizeGhanaMsisdn("+233 244 123 456")).toBe("233244123456");
  });
});
