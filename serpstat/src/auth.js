/**
 * Checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
 return true;
}

/**
 * Returns the authentication type for the connector.
 * @returns {Object} response is an authentication type for the connector.
 */
function getAuthType() {
 var response = { type: 'KEY' };
 return response;
}

/**
 * Stores the credentials passed in from Data Studio.
 *
 * @param {Object} request A JavaScript object containing the data request parameters.
 * @return {object} A JavaScript object that contains an error code indicating if the credentials were able to be set successfully.
 */
function setCredentials(request) {
 var key = request.key;
 var validKey = validateKey(key);
 if (!validKey) {
  return {
   errorCode: 'INVALID_CREDENTIALS'
  };
 }
 var userProperties = PropertiesService.getUserProperties();
 userProperties.setProperty('api_key', key);

 return {
  errorCode: 'NONE'
 };
}

/**
 * Determines if the authentication for the serpstat.com is valid.
 * If authentication is valid then it is expected that calls to getData() and getSchema() will not fail due to unauthorized access.
 * If the auth is not valid then the user may receive a notification to start the authorization flow.
 *
 * @return {boolean} Returns true if the serpstat.com credentials are valid, false otherwise.
 */
function isAuthValid() {
 var userProperties = PropertiesService.getUserProperties();
 var key = userProperties.getProperty('api_key');
 return validateKey(key);
}

/**
 * Validates if the provided key is valid through a call to serpstat.com.
 *
 * @return {boolean} Returns true if the check was successful, false otherwise.
 */
function validateKey(key) {
 var validToken = new SerpstatToken(key);
 return validToken.validateToken();
}

/**
 * Clears any credentials stored for the user.
 */
function resetAuth() {
 var userProperties = PropertiesService.getUserProperties();
 userProperties.deleteProperty('api_key');
}
