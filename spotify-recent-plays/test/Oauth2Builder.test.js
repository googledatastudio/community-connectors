import Oauth2Builder from '../src/Oauth2Builder';
import PropertiesServiceMock from './mocks/PropertiesServiceMock';
import OAuth2Mock from './mocks/OAuth2Mock';

let service, propertiesServiceMock, oauth2Mock;

beforeEach(() => {
  propertiesServiceMock = new PropertiesServiceMock();
  oauth2Mock = new OAuth2Mock();
  service = new Oauth2Builder(propertiesServiceMock, oauth2Mock);
});

test('build', () => {
  service.build();

  expect(oauth2Mock.createServiceCalled).toBe('spotify');
  expect(oauth2Mock.setAuthorizationBaseUrlCalled).toBe('https://accounts.spotify.com/authorize');
  expect(oauth2Mock.setTokenUrlCalled).toBe('https://accounts.spotify.com/api/token');
  expect(oauth2Mock.setClientIdCalled).toBe('cid');
  expect(oauth2Mock.setClientSecretCalled).toBe('cs');
  expect(oauth2Mock.setPropertyStoreCalled).toBe(propertiesServiceMock.userProperties);
  expect(oauth2Mock.setScopeCalled).toBe('user-read-recently-played');
  expect(oauth2Mock.setCallbackFunctionCalled).toBe('authCallback');
});
