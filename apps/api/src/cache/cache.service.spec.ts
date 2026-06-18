import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    service = new CacheService();
  });

  it('returns null on get when Redis is unavailable', async () => {
    const value = await service.get('missing-key');
    expect(value).toBeNull();
  });

  it('reports unavailable when not connected', () => {
    expect(service.isAvailable()).toBe(false);
    expect(service.ping()).resolves.toBe(false);
  });

  it('set and del are no-ops when Redis is unavailable', async () => {
    await expect(service.set('key', { a: 1 }, 60)).resolves.toBeUndefined();
    await expect(service.del('key')).resolves.toBeUndefined();
  });
});
