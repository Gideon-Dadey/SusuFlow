import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  Get,
  Param,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiHeader } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  MfaEnableDto,
  MfaDisableDto,
  MfaVerifyLoginDto,
} from "./dto/auth.dto";
import { Public } from "../../common/decorators";
import { TenantContext } from "@susuflow/shared";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("register")
  @ApiOperation({ summary: "Register a new customer" })
  @ApiHeader({ name: "x-tenant-slug", required: true })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    if (!req.tenant) throw new BadRequestException("Tenant context required");
    return this.authService.register(dto, req.tenant as TenantContext);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiHeader({ name: "x-tenant-slug", required: false })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.tenant as TenantContext | undefined);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post("logout")
  @ApiOperation({ summary: "Logout and revoke refresh token" })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("password/forgot")
  @ApiOperation({ summary: "Request a password reset code" })
  @ApiHeader({ name: "x-tenant-slug", required: false })
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.authService.requestPasswordReset(
      dto.email,
      req.tenant as TenantContext | undefined,
    );
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("password/reset")
  @ApiOperation({ summary: "Reset password with email code" })
  @ApiHeader({ name: "x-tenant-slug", required: false })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
      req.tenant as TenantContext | undefined,
    );
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("verify/send")
  @ApiOperation({ summary: "Send OTP verification code" })
  @ApiHeader({ name: "x-tenant-slug", required: true })
  sendOtp(@Body() dto: SendOtpDto, @Req() req: Request) {
    if (!req.tenant) throw new BadRequestException("Tenant context required");
    return this.otpService.send(dto.userId, dto.channel, req.tenant.id);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("verify/confirm")
  @ApiOperation({ summary: "Confirm OTP verification code" })
  @ApiHeader({ name: "x-tenant-slug", required: true })
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    if (!req.tenant) throw new BadRequestException("Tenant context required");
    return this.otpService.verify(
      dto.userId,
      dto.channel,
      dto.code,
      req.tenant.id,
    );
  }

  @Public()
  @Get("verify/status/:userId")
  @ApiOperation({ summary: "Get verification status for a user" })
  @ApiHeader({ name: "x-tenant-slug", required: true })
  verificationStatus(@Param("userId") userId: string, @Req() req: Request) {
    if (!req.tenant) throw new BadRequestException("Tenant context required");
    return this.otpService.getVerificationStatus(userId, req.tenant.id);
  }

  @Post("mfa/setup")
  @ApiOperation({ summary: "Initiate MFA setup challenge" })
  setupMfa(@Req() req: Request) {
    const user = (req as any).user;
    return this.authService.setupMfa(user.id);
  }

  @Post("mfa/enable")
  @ApiOperation({ summary: "Verify code and enable MFA" })
  enableMfa(@Body() dto: MfaEnableDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.authService.enableMfa(user.id, dto.code);
  }

  @Post("mfa/disable")
  @ApiOperation({ summary: "Verify password + code and disable MFA" })
  disableMfa(@Body() dto: MfaDisableDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.authService.disableMfa(user.id, dto.password, dto.code);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("mfa/verify-login")
  @ApiOperation({ summary: "Complete MFA login verification" })
  verifyMfaLogin(@Body() dto: MfaVerifyLoginDto) {
    return this.authService.verifyMfaLogin(dto.mfaToken, dto.userId, dto.code);
  }
}
