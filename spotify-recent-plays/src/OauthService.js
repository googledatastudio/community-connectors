/**
 * Constructor for OauthService
 *
 * @param {object} oauth2Builder - a service that sets up a Google OAuth2 service instance
 * @param {object} htmlService - a service with interface same as HtmlService
 *
 * @return {object} OauthService object.
 */
function OauthService(oauth2Builder, htmlService) {
  this.oauth2Builder = oauth2Builder;
  this.htmlService = htmlService;

  return this;
}

/**
 * The callback that is invoked after a successful or failed authentication
 * attempt.
 *
 * @param request {object} GDS request
 * @return {HTMLOutput}
 */
OauthService.prototype.authCallback = function(request) {
  var authorized = this.getInternalService().handleCallback(request);
  var htmlContent = authorized ? 'Success! You can close this tab.' : 'Denied. You can close this tab';

  return this.htmlService.createHtmlOutput(htmlContent);
};

/**
 * @return {boolean} `true` if the user has successfully authenticated and false
 * otherwise.
 */
OauthService.prototype.isAuthValid = function() {
  var service = this.getInternalService();

  if (service == null) {
    return false;
  }
  return service.hasAccess();
};

/**
 * Used as a part of the OAuth2 flow.
 *
 * @return {string} The authorization url if service is defined.
 */
OauthService.prototype.get3PAuthorizationUrls = function() {
  var service = this.getInternalService();
  if (service == null) {
    return '';
  }
  return service.getAuthorizationUrl();
};

/**
 * Resets the OAuth2 service. This will allow the user to reauthenticate with
 * the external OAuth2 provider.
 */
OauthService.prototype.resetAuth = function() {
  this.getInternalService().reset();
};

/**
 * Returns the access token
 */
OauthService.prototype.getAccessToken = function() {
  var service = this.getInternalService();
  return service.getAccessToken();
};

// private

OauthService.prototype.getInternalService = function() {
  return this.oauth2Builder.build();
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = OauthService;
}
