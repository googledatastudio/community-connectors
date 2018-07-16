/**
 * Constructor for Oauth2Builder - initializes an OAuth2 service instance with correct attributes

 * @param {object} propertiesService - a service with interface same as Google's PropertiesService
 * @param {object} oauth2Service - a service with interface same as Google's OAuth2

 * @return {object} Oauth2Builder object.
 */
function Oauth2Builder(propertiesService, oauth2Service) {
  this.propertiesService = propertiesService;
  this.oauth2Service = oauth2Service;

  return this;
}

Oauth2Builder.OAUTH_CLIENT_ID = 'OAUTH_CLIENT_ID';

Oauth2Builder.OAUTH_CLIENT_SECRET = 'OAUTH_CLIENT_SECRET';

/**
 * This builds an OAuth2 service for connecting to Spotify
 * More info here: https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorizaton-code-flow
 *
 * @return {OAuth2Service}
 */
Oauth2Builder.prototype.build = function() {
  var clientId = this.getClientId();
  var clientSecret = this.getClientSecret();

  return this.oauth2Service.createService('spotify')
    .setAuthorizationBaseUrl('https://accounts.spotify.com/authorize')
    .setTokenUrl('https://accounts.spotify.com/api/token')
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setPropertyStore(this.propertiesService.getUserProperties())
    .setScope('user-read-recently-played')
    .setCallbackFunction('authCallback');
};

// private

Oauth2Builder.prototype.getClientSecret = function() {
  var scriptProps = this.propertiesService.getScriptProperties();
  return scriptProps.getProperty(Oauth2Builder.OAUTH_CLIENT_SECRET);
};

Oauth2Builder.prototype.getClientId = function() {
  var scriptProps = this.propertiesService.getScriptProperties();
  return scriptProps.getProperty(Oauth2Builder.OAUTH_CLIENT_ID);
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = Oauth2Builder;
}
