import Connector from '../src/Connector';
import CacheServiceMock from './mocks/CacheServiceMock';
import PropertiesServiceMock from './mocks/PropertiesServiceMock';
import OAuth2Mock from './mocks/OAuth2Mock';
import UrlFetchAppMock from './mocks/UrlFetchAppMock';
import HtmlServiceMock from './mocks/HtmlServiceMock';
import { buildFakeRequest } from './helpers/FakeRequest';
import apiResponses from './helpers/ApiResponses';

let service, cacheServiceMock, propertiesServiceMock, oAuth2Mock, urlFetchAppMock, htmlServiceMock;

beforeEach(() => {
  cacheServiceMock = new CacheServiceMock();
  propertiesServiceMock = new PropertiesServiceMock();
  oAuth2Mock = new OAuth2Mock();
  urlFetchAppMock = new UrlFetchAppMock(apiResponses);
  htmlServiceMock = new HtmlServiceMock();
  service = new Connector({
    CacheService: cacheServiceMock,
    UrlFetchApp: urlFetchAppMock,
    HtmlService: htmlServiceMock,
    PropertiesService: propertiesServiceMock,
    OAuth2: oAuth2Mock
  });
});

test('getSchema', () => {
  const fields = service.getSchema().schema.map((f) => f.name);
  const expected = [
    'track_name',
    'artist',
    'played_at_hour',
    'played_at_date',
    'plays',
    'tracks_count',
    'popularity'
  ];
  expect(fields).toEqual(expected, 'it returns the schema content');
});

test('getConfig', () => {
  expect(service.getConfig().dateRangeRequired).toBe(true);
});

test('getAuthType', () => {
  expect(service.getAuthType().type).toBe('OAUTH2');
});

test('isAdminUser', () => {
  expect(service.isAdminUser()).toBe(false);
});

test('getData', () => {
  const startDate = new Date('2018-07-13T00:00:00Z');
  const endDate = new Date('2018-07-14T00:00:00Z');
  const fields = ['track_name', 'artist'];
  let request = buildFakeRequest({
    startDate,
    endDate,
    fields
  });

  const data = service.getData(request);
  const rows = data.rows;
  const schema = data.schema;

  const expectedRowValues = [
    'Make It Wit Chu',
    'Queens of the Stone Age'
  ];
  expect(rows.length).toEqual(50);
  expect(rows[0].values).toEqual(expectedRowValues);
  expect(schema.map(s => s.name)).toEqual(['track_name', 'artist']);
});

test('authCallback', () => {
  service.authCallback();
  expect(htmlServiceMock.lastHtmlContent).toMatch(/Success/);
});

test('isAuthValid', () => {
  expect(service.isAuthValid()).toBe(true);
});

test('get3PAuthorizationUrls', () => {
  expect(service.get3PAuthorizationUrls()).toBe('https://mock.com');
});

test('resetAuth', () => {
  service.resetAuth();
  expect(oAuth2Mock.resetCalled).toBe(true);
});
