import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { PUBLIC_KEY } from "../decorators";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<T>(
    err: Error | null,
    user: T,
    info?: any,
    context?: ExecutionContext,
  ): T {
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or expired token");
    }
    if (context) {
      const request = context.switchToHttp().getRequest();
      const u = user as any;
      if (request && !request.tenant && u?.tenantId) {
        request.tenant = {
          id: u.tenantId,
          slug: u.tenantSlug || "",
          name: "",
          status: "active",
        };
      }
    }
    return user;
  }
}
