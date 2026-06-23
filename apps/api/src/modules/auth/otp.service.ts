import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { createHash, randomInt } from "crypto";
import { CacheService } from "../../cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_SEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
} from "@susuflow/shared";

type OtpChannel = "email" | "phone";

interface StoredOtp {
  hash: string;
  attempts: number;
}

@Injectable()
export class OtpService {
  constructor(
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
  ) {}

  private otpKey(userId: string, channel: OtpChannel): string {
    return `otp:${userId}:${channel}`;
  }

  private cooldownKey(userId: string, channel: OtpChannel): string {
    return `otp:cooldown:${userId}:${channel}`;
  }

  private hourlyKey(userId: string, channel: OtpChannel): string {
    return `otp:hourly:${userId}:${channel}`;
  }

  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  private generateCode(): string {
    const length = Number(this.config.get("OTP_LENGTH", OTP_LENGTH));
    const max = 10 ** length;
    return String(randomInt(0, max)).padStart(length, "0");
  }

  async send(userId: string, channel: OtpChannel, tenantId: string) {
    if (!this.cache.isAvailable()) {
      throw new BadRequestException(
        "Verification service temporarily unavailable",
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: { tenant: { select: { name: true } } },
    });
    if (!user) throw new NotFoundException("User not found");

    if (channel === "email" && user.emailVerified) {
      throw new BadRequestException("Email already verified");
    }
    if (channel === "phone" && user.phoneVerified) {
      throw new BadRequestException("Phone already verified");
    }

    const recipient = channel === "email" ? user.email : user.phone;
    if (!recipient) {
      throw new BadRequestException(
        `${channel} not registered for this account`,
      );
    }

    const onCooldown = await this.cache.exists(
      this.cooldownKey(userId, channel),
    );
    if (onCooldown) {
      throw new HttpException(
        `Wait ${OTP_SEND_COOLDOWN_SECONDS}s before requesting another code`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const sendCount = await this.cache.incr(this.hourlyKey(userId, channel));
    if (sendCount === 1) {
      await this.cache.expire(this.hourlyKey(userId, channel), 3600);
    }
    if (sendCount > OTP_MAX_SENDS_PER_HOUR) {
      throw new HttpException(
        "Too many verification requests. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.generateCode();
    const stored: StoredOtp = { hash: this.hashCode(code), attempts: 0 };
    await this.cache.set(this.otpKey(userId, channel), stored, OTP_TTL_SECONDS);
    await this.cache.set(
      this.cooldownKey(userId, channel),
      true,
      OTP_SEND_COOLDOWN_SECONDS,
    );

    await this.notificationQueue.add("send-verification-otp", {
      tenantId,
      userId,
      channel,
      recipient,
      code,
      tenantName: user.tenant?.name || "SusuFlow",
      firstName: user.firstName,
    });

    return {
      message: `Verification code sent to your ${channel}`,
      channel,
      expiresIn: OTP_TTL_SECONDS,
    };
  }

  async verify(
    userId: string,
    channel: OtpChannel,
    code: string,
    tenantId: string,
  ) {
    if (!this.cache.isAvailable()) {
      throw new BadRequestException(
        "Verification service temporarily unavailable",
      );
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: { customer: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const stored = await this.cache.get<StoredOtp>(
      this.otpKey(userId, channel),
    );
    if (!stored) {
      throw new BadRequestException(
        "Code expired or not found. Request a new one.",
      );
    }

    if (stored.attempts >= OTP_MAX_ATTEMPTS) {
      await this.cache.del(this.otpKey(userId, channel));
      throw new ForbiddenException(
        "Too many failed attempts. Request a new code.",
      );
    }

    if (stored.hash !== this.hashCode(code)) {
      stored.attempts += 1;
      await this.cache.set(
        this.otpKey(userId, channel),
        stored,
        OTP_TTL_SECONDS,
      );
      throw new BadRequestException("Invalid verification code");
    }

    await this.cache.del(this.otpKey(userId, channel));

    const updateData =
      channel === "email" ? { emailVerified: true } : { phoneVerified: true };

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const bothVerified = updated.emailVerified && updated.phoneVerified;
    if (bothVerified) {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { status: "active" },
        });
        if (user.customer) {
          await tx.customer.update({
            where: { id: user.customer.id },
            data: { status: "active" },
          });
        }
      });
    }

    return {
      message: `${channel} verified successfully`,
      channel,
      emailVerified: updated.emailVerified,
      phoneVerified: updated.phoneVerified,
      accountActive: bothVerified,
    };
  }

  async getVerificationStatus(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        id: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
