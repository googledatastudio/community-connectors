/**
 * Given a set of service account credentials, returns an OAuth2 service for the account.
 *
 * @param {object} client Contains credentials and relevant info for a service account
 * @param {string} client.name Name for the service account
 * @param {string} client.key Key for the service account
 * @param {string} client.email Email for the service account
 * @param {array} client.scopes Array of scopes for the service account
 * @returns {object} OAuth2 service
 */
function getOauthService(client) {
  return OAuth2.createService(client.name)
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setPrivateKey(client.key)
    .setIssuer(client.email)
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setCache(CacheService.getScriptCache())
    .setScope(client.scopes);
}

/**
 * For a given script properties key, fetches the credentials from script
 * property store, creates an oauth2 service, and returns an object with the
 * access token and project Id for the account.
 *
 * @param {string} clientKey Key that holds service account credentials in
 *        script properties.
 * @returns {object} An object with the OAuth2 token and the project Id for the
 *          service account.
 */
function processOauth(clientKey) {
  var client = JSON.parse(propStore.get('script', clientKey));
  var oauthService = getOauthService(client);
  var token = oauthService.getAccessToken();
  return {
    token: token,
    projectId: client.projectId
  };
}
