var myConnector = null;

function initConnector() {
  if (myConnector === null) {
    myConnector = new Connector();
  }
}

/**
 * Wrapper function for `Connector.getAuthType()`.
 *
 * @return {Object} `AuthType` used by the Connector.
 */
function getAuthType() {
  initConnector();
  return myConnector.logAndExecute('getAuthType', undefined);
}

/**
 * Wrapper function for `Connector.getConfig()`.
 *
 * @param {Object} request - Config request parameters.
 * @return {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  initConnector();
  return myConnector.logAndExecute('getConfig', request);
}

/**
 * Wrapper function for `Connector.getSchema()`.
 *
 * @param {Object} request - Schema request parameters.
 * @return {Object} Schema for the given request.
 */
function getSchema(request) {
  initConnector();
  return myConnector.logAndExecute('getSchema', request);
}

/**
 * Wrapper function for `Connector.getData()`.
 *
 * @param {Object} request - Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  initConnector();
  return myConnector.logAndExecute('getData', request);
}

/**
 * Wrapper function for `Connector.isAdminUser()`.
 *
 * @return {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the Connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the Connector.
 */
function isAdminUser() {
  initConnector();
  return myConnector.logAndExecute('isAdminUser', null);
}
