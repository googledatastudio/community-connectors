/**
 * Returns if user is admin
 * {boolean} true if user is current user is admin.
 */
function isAdminUser() {
  return false;
}

/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.USER_TOKEN)
    .setHelpUrl('https://id.atlassian.com/manage/api-tokens')
    .build();
}

/**
 * Resets the auth service.
 */
function resetAuth() {
  var user_tokenProperties = PropertiesService.getUserProperties();
  user_tokenProperties.deleteProperty('dscc.username');
  user_tokenProperties.deleteProperty('dscc.password');
}

/**
 * Returns true if the auth service has access.
 * @return {boolean} True if the auth service has access.
 */
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var userName = userProperties.getProperty('dscc.username');
  var token = userProperties.getProperty('dscc.token');

  return hasValue(userName) && hasValue(token);
}

/**
 * Sets the credentials.
 * @param {Request} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
  var creds = request.userToken;
  var username = creds.username;
  var token = creds.token;
  var validCreds = hasValue(username) && hasValue(token);

  if (!validCreds) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.username', username);
  userProperties.setProperty('dscc.token', token);
  return {
    errorCode: 'NONE'
  };
}
