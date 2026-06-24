import { describe, it, expect } from "vitest";
import {
  formatGhs,
  getDashboardPath,
  getGreeting,
  getInitials,
  getPortalFromPathname,
  inferTenantSlugFromEmail,
} from "./utils";

describe("web utils", () => {
  describe("formatGhs", () => {
    it("formats currency for Ghana locale", () => {
      const result = formatGhs(1250.5);
      expect(result).toContain("1,250.50");
    });
  });

  describe("getDashboardPath", () => {
    it("routes super admin to admin dashboard", () => {
      expect(getDashboardPath(["super_admin"])).toBe("/admin/dashboard");
    });

    it("routes company admin to staff dashboard", () => {
      expect(getDashboardPath(["company_admin"])).toBe("/staff/dashboard");
    });

    it("routes collector to collector dashboard", () => {
      expect(getDashboardPath(["collector"])).toBe("/collector/dashboard");
    });

    it("routes customer to customer dashboard", () => {
      expect(getDashboardPath(["customer"])).toBe("/dashboard");
    });
  });

  describe("inferTenantSlugFromEmail", () => {
    it("maps Apex Susu emails to apex-susu", () => {
      expect(inferTenantSlugFromEmail("apex.admin@apexsusu.com")).toBe(
        "apex-susu",
      );
    });

    it("returns empty for platform super admin emails", () => {
      expect(inferTenantSlugFromEmail("admin@susuflow.com")).toBe("");
    });

    it("returns empty for temp susuflow customer emails", () => {
      expect(
        inferTenantSlugFromEmail("customer-000003@temp.susuflow.com"),
      ).toBe("");
    });

    it("does not guess tenant from generic email domains", () => {
      expect(inferTenantSlugFromEmail("user@gmail.com")).toBe("");
    });
  });

  describe("getPortalFromPathname", () => {
    it("detects collector portal routes", () => {
      expect(getPortalFromPathname("/collector/dashboard")).toBe("collector");
    });

    it("detects staff portal routes", () => {
      expect(getPortalFromPathname("/staff/dashboard")).toBe("staff");
    });
  });

  describe("getGreeting", () => {
    it("returns a time-based greeting", () => {
      expect(["Good morning", "Good afternoon", "Good evening"]).toContain(
        getGreeting(),
      );
    });
  });

  describe("getInitials", () => {
    it("combines first letters of names", () => {
      expect(getInitials("Kwame", "Mensah")).toBe("KM");
    });

    it("returns ? when names missing", () => {
      expect(getInitials()).toBe("?");
    });
  });
});
