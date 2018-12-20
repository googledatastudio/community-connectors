var SERVICE_NAME = 'strava';
var AUTHORIZATION_BASE_URL = 'https://www.strava.com/api/v3/oauth/authorize';
var TOKEN_URL = 'https://www.strava.com/api/v3/oauth/token';
var CALLBACK_FUNCTION_NAME = 'authCallback';

/** Returns a parameterized OAuth2 Service object. */
function getOAuthService() {
  var scriptProps = PropertiesService.getScriptProperties();
  var clientId = scriptProps.getProperty('OAUTH_CLIENT_ID');
  var clientSecret = scriptProps.getProperty('OAUTH_CLIENT_SECRET');

  return OAuth2.createService(SERVICE_NAME)
    .setAuthorizationBaseUrl(AUTHORIZATION_BASE_URL)
    .setTokenUrl(TOKEN_URL)
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction(CALLBACK_FUNCTION_NAME);
}

/** The callback that is invoked after an authentication attempt. */
function authCallback(request) {
  var authorized = getOAuthService().handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

/** Returns {boolean} `true` if successfully authenticated--false otherwise. */
function isAuthValid() {
  return getOAuthService().hasAccess();
}

/** Resets the OAuth2 service. */
function resetAuth() {
  getOAuthService().reset();
}

/** Returns the 3P authorization urls for the service. */
function get3PAuthorizationUrls() {
  return getOAuthService().getAuthorizationUrl();
}
