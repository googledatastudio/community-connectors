function getAsanaService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('asana')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://app.asana.com/-/oauth_authorize')
      .setTokenUrl('https://app.asana.com/-/oauth_token')

      // Set the client ID and secret.
      .setClientId('693348398969321')
      .setClientSecret('94caebb97d26b186803b2c3f4ce75a14')

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())
  
      // Set minutes for a year
      .setExpirationMinutes(525600)

};

function authCallback(request) {
  var authorized = getAsanaService().handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.' + PropertiesService.getUserProperties());
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab.');
  };
};

function isAuthValid() {
  var service = getAsanaService();
  if (service == null) {
    return false;
  }
  return service.hasAccess();
};

function get3PAuthorizationUrls() {
  var service = getAsanaService();
  if (service == null) {
    return '';
  }
  return service.getAuthorizationUrl();
};

function resetAuth() {
  var service = getAsanaService()
  service.reset();
};