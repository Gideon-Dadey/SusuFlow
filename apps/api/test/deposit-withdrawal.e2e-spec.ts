import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("Deposit & Withdrawal flows (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Deposits", () => {
    it("rejects unauthenticated deposit initiation", () => {
      return request(app.getHttpServer())
        .post("/api/v1/deposits")
        .set("x-tenant-slug", "abc-susu")
        .send({
          amount: 100,
          paymentMethod: "mtn_momo",
          customerId: "00000000-0000-0000-0000-000000000010",
          payerPhone: "+233241234567",
        })
        .expect(401);
    });

    it("rejects unauthenticated deposit list", () => {
      return request(app.getHttpServer())
        .get("/api/v1/deposits")
        .set("x-tenant-slug", "abc-susu")
        .expect(401);
    });
  });

  describe("Withdrawals", () => {
    it("rejects unauthenticated withdrawal list", () => {
      return request(app.getHttpServer())
        .get("/api/v1/withdrawals")
        .set("x-tenant-slug", "abc-susu")
        .expect(401);
    });

    it("rejects unauthenticated withdrawal request", () => {
      return request(app.getHttpServer())
        .post("/api/v1/withdrawals/request")
        .set("x-tenant-slug", "abc-susu")
        .send({
          amount: 50,
          disbursementMethod: "mtn_momo",
          disbursementPhone: "+233241234567",
        })
        .expect(401);
    });

    it("rejects unauthenticated withdrawal approval", () => {
      return request(app.getHttpServer())
        .post(
          "/api/v1/withdrawals/00000000-0000-0000-0000-000000000099/approve",
        )
        .set("x-tenant-slug", "abc-susu")
        .expect(401);
    });
  });

  describe("OTP verification", () => {
    it("rejects OTP send without tenant context", () => {
      return request(app.getHttpServer())
        .post("/api/v1/auth/verify/send")
        .send({
          userId: "00000000-0000-0000-0000-000000000001",
          channel: "email",
        })
        .expect(400);
    });
  });
});
