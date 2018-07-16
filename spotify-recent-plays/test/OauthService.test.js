import OauthService from '../src/OauthService';
import HtmlServiceMock from './mocks/HtmlServiceMock';
import Oauth2BuilderMock from './mocks/Oauth2BuilderMock';

let service, htmlServiceMock, oauth2BuilderMock;

beforeEach(() => {
  htmlServiceMock = new HtmlServiceMock();
  oauth2BuilderMock = new Oauth2BuilderMock();
  service = new OauthService(oauth2BuilderMock, htmlServiceMock);
});

test('authCallback', () => {
  const request = 'mockedRequest';
  const o2 = oauth2BuilderMock.build();
  service.authCallback(request);
  expect(o2.handleCallbackCalled).toBe(request);
  expect(htmlServiceMock.lastHtmlContent).toMatch(/Success/);

  o2.authorized = false;
  service.authCallback(request);
  expect(htmlServiceMock.lastHtmlContent).toMatch(/Denied/);
});

test('isAuthValid', () => {
  expect(service.isAuthValid()).toBe(true);

  const o2 = oauth2BuilderMock.oauth2Mock;
  o2.hasAccessValue = false;
  expect(service.isAuthValid()).toBe(false);

  oauth2BuilderMock.oauth2Mock = null;

  expect(service.isAuthValid()).toBe(false);
});

test('get3PAuthorizationUrls', () => {
  const o2 = oauth2BuilderMock.oauth2Mock;

  expect(service.get3PAuthorizationUrls()).toBe(o2.authorizationUrl);

  oauth2BuilderMock.oauth2Mock = null;

  expect(service.get3PAuthorizationUrls()).toBe('');
});

test('resetAuth', () => {
  const o2 = oauth2BuilderMock.oauth2Mock;

  service.resetAuth();
  expect(o2.resetCalled).toBe(true);
});

test('getAccessToken', () => {
  const o2 = oauth2BuilderMock.oauth2Mock;

  expect(service.getAccessToken()).toBe(o2.accessToken);
});
