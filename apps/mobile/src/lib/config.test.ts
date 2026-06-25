import {
  getApiBaseUrl,
  getSupportEmail,
  getSupportPhone,
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

  it("requires web URL when not in dev and unset", () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(() => getWebBaseUrl()).toThrow(/EXPO_PUBLIC_WEB_URL/);
  });

  it("uses configured web URL when set", () => {
    process.env.EXPO_PUBLIC_WEB_URL = "https://susuflow.com";
    expect(getWebBaseUrl()).toBe("https://susuflow.com");
  });

  it("provides support contact defaults", () => {
    expect(getSupportEmail()).toContain("@");
    expect(getSupportPhone()).toMatch(/^\+/);
  });
});
