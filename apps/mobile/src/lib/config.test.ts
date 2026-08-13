import {
  getApiBaseUrl,
  getSupportEmail,
  getSupportPhone,
  getSupportWhatsApp,
  getWebBaseUrl,
} from "./config";

describe("mobile config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses configured API URL when set", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.com/";
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("uses configured web URL when set", () => {
    process.env.EXPO_PUBLIC_WEB_URL = "https://susuflow.com";
    expect(getWebBaseUrl()).toBe("https://susuflow.com");
  });

  it("provides a support email default", () => {
    delete process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
    expect(getSupportEmail()).toContain("@");
  });

  it("hides placeholder phone and WhatsApp contacts", () => {
    process.env.EXPO_PUBLIC_SUPPORT_PHONE = "+233302000000";
    process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP = "233302000000";
    expect(getSupportPhone()).toBeNull();
    expect(getSupportWhatsApp()).toBeNull();
  });

  it("returns real support phone when configured", () => {
    process.env.EXPO_PUBLIC_SUPPORT_PHONE = "+233201234567";
    expect(getSupportPhone()).toBe("+233201234567");
  });
});
