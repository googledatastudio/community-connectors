import DataCache from '../src/DataCache';
import CacheServiceMock from './mocks/CacheServiceMock';

let cache, cacheMock, maxCacheSize;

beforeEach(() => {
  const startDate = new Date('2018-07-09');
  const endDate = new Date('2018-07-10');
  cacheMock = new CacheServiceMock();
  cache = new DataCache(cacheMock, startDate, endDate);
  maxCacheSize = DataCache.MAX_CACHE_SIZE;
  DataCache.MAX_CACHE_SIZE = 3;
});

afterEach(() => {
  DataCache.MAX_CACHE_SIZE = maxCacheSize;
});

test('get - builds value from chunked entries', () => {
  expect(cache.get()).toBe('');

  const userCache = cacheMock.getUserCache();
  const keyPrefix = '2018-07-09_2018-07-10';

  userCache.put(`${keyPrefix}_0`, '123');
  userCache.put(`${keyPrefix}_1`, '456');
  userCache.put(`${keyPrefix}_2`, '789');

  expect(cache.get()).toBe('123456789');
});

test('set - splits value in chunks', () => {
  const userCache = cacheMock.getUserCache();
  const keyPrefix = '2018-07-09_2018-07-10';

  cache.set('123456789');

  userCache.get(`${keyPrefix}_0`, '123');
  userCache.get(`${keyPrefix}_1`, '456');
  userCache.get(`${keyPrefix}_2`, '789');
});
