/**
 * Mocked service for Google OAuth2 service
 *
 * @return {object}
 */
function OAuth2Mock() {
  this.hasAccessValue = true;
  this.authorized = true;
  this.authorizationUrl = 'https://mock.com';
  this.accessToken = '123456';

  return this;
}

OAuth2Mock.prototype.handleCallback = function(request) {
  this.handleCallbackCalled = request;
  return this.authorized;
};

OAuth2Mock.prototype.hasAccess = function() {
  return this.hasAccessValue;
};

OAuth2Mock.prototype.getAuthorizationUrl = function() {
  return this.authorizationUrl;
};

OAuth2Mock.prototype.getAccessToken = function() {
  return this.accessToken;
};

OAuth2Mock.prototype.reset = function() {
  this.resetCalled = true;
};

OAuth2Mock.prototype.createService = function(name) {
  this.createServiceCalled = name;

  return this;
};

OAuth2Mock.prototype.setAuthorizationBaseUrl = function(url) {
  this.setAuthorizationBaseUrlCalled = url;

  return this;
};

OAuth2Mock.prototype.setTokenUrl = function(url) {
  this.setTokenUrlCalled = url;

  return this;
};

OAuth2Mock.prototype.setClientId = function(id) {
  this.setClientIdCalled = id;

  return this;
};

OAuth2Mock.prototype.setClientSecret = function(secret) {
  this.setClientSecretCalled = secret;

  return this;
};

OAuth2Mock.prototype.setPropertyStore = function(store) {
  this.setPropertyStoreCalled = store;

  return this;
};

OAuth2Mock.prototype.setScope = function(scope) {
  this.setScopeCalled = scope;

  return this;
};

OAuth2Mock.prototype.setCallbackFunction = function(name) {
  this.setCallbackFunctionCalled = name;

  return this;
};

export default OAuth2Mock;
