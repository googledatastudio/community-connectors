import SpotifyClient from '../src/SpotifyClient';
import CacheServiceMock from './mocks/CacheServiceMock';
import UrlFetchAppMock from './mocks/UrlFetchAppMock';
import apiResponses from './helpers/ApiResponses';

let service, cacheServiceMock, urlFetchAppMock;

beforeEach(() => {
  cacheServiceMock = new CacheServiceMock();
  urlFetchAppMock = new UrlFetchAppMock(apiResponses);
  service = new SpotifyClient(cacheServiceMock, urlFetchAppMock, 'api_key');
});

test('getRecentPlays', () => {
  const startDate = new Date('2018-07-13T00:00:00Z');
  const endDate = new Date('2018-07-14T23:59:59.999Z');
  let result = service.getRecentPlays(startDate, endDate);
  expect(result.length).toBe(50, 'it gets paginated data');
  const expectedApiCalls = {
    'https://api.spotify.com/v1/me/player/recently-played?before=1531612799999': 1,
    'https://api.spotify.com/v1/me/player/recently-played?before=1531487208351': 1,
    'https://api.spotify.com/v1/me/player/recently-played?before=1531482414230': 1
  };
  expect(urlFetchAppMock.calls).toEqual(expectedApiCalls, 'it calls proper endpoints');
  expect(urlFetchAppMock.passedHeaders['Authorization']).toBe('Bearer api_key');
  expect(cacheServiceMock.userCache.hits).toBe(1, 'it checks if data is cached');

  result = service.getRecentPlays(startDate, endDate);
  expect(result.length).toBe(50, 'it gets paginated data');
  expect(urlFetchAppMock.calls).toEqual(expectedApiCalls, 'it does not call api if result is cached');
  expect(cacheServiceMock.userCache.hits).toBe(3, 'it gets data from cache');
});

test('limiting the data', () => {
  const startDate = new Date('2018-07-13T12:22:37.186Z');
  const endDate = new Date('2018-07-14T23:59:59.999Z');
  let result = service.getRecentPlays(startDate, endDate);
  const expectedApiCalls = {
    'https://api.spotify.com/v1/me/player/recently-played?before=1531487208351': 1,
    'https://api.spotify.com/v1/me/player/recently-played?before=1531612799999': 1
  };
  expect(urlFetchAppMock.calls).toEqual(expectedApiCalls, 'it calls proper endpoints');
  expect(result.length).toBe(31, 'it returns only data that fit into the time constraint');
});

test('handling cache.set errors', () => {
  cacheServiceMock.userCache.put = function() {
    throw 'error';
  };

  const startDate = new Date('2018-07-13T00:00:00Z');
  const endDate = new Date('2018-07-14T23:59:59.999Z');
  let result = service.getRecentPlays(startDate, endDate);

  expect(result.length).toBe(50, 'it works even when setting data to cache fails');
});
