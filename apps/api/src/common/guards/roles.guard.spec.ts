import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createContext = (user?: { roles: string[] }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows access when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext({ roles: ['customer'] }))).toBe(true);
  });

  it('allows access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['company_admin']);
    expect(guard.canActivate(createContext({ roles: ['company_admin'] }))).toBe(true);
  });

  it('denies access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['company_admin']);
    expect(guard.canActivate(createContext({ roles: ['customer'] }))).toBe(false);
  });

  it('denies access when user is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['collector']);
    expect(guard.canActivate(createContext())).toBe(false);
  });

  it('allows if user has any of multiple required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['collector', 'account_officer']);
    expect(guard.canActivate(createContext({ roles: ['collector'] }))).toBe(true);
  });
});
