
/** @const the key used for storing the Mite domain (account name) in the users properties. */
const MITE_DOMAIN = 'mite.domain'

/** @const the key used for storing the Mite API key in the users properties. */
const MITE_KEY = 'mite.key';

/**
 * Retrieves the credentials (Mite domain and API key) from the user properties.
 * 
 * @returns {object} the credentials holding the domain and the API key.
 */
function getCredentials() {
  var userProperties = PropertiesService.getUserProperties();
  return {
    domain: userProperties.getProperty(MITE_DOMAIN),
    key: userProperties.getProperty(MITE_KEY)
  }
}

/**
 * Retrieves the details for the user for which the domain and API key have been created. 
 * 
 * @param {string} domain - the Mite domain (e.g. account name)
 * @param {string} key - the Mite API key
 * @returns {object} an object with the HTTP response code as code property and the user/account data as json property (e.g. object in JSON notation).
 */
function validateCredentials(domain, key) {
  if (!domain || !key) return false;
  
  var response = miteGetMyself(domain, key, 'myself');
  
  if (response.code == 200)
    console.log('API key for the Mite domain %s successfully validated', domain);
  else
    console.error('API key for the Mite domain %s is invalid. Code: %s', domain, response.code);
  
  return response;
}  

/**
 * Returns the authentication type of this connector, which is user token (token/domain + key).
 * 
 * @return {object} The authentication type set to user token (token/domain + key).
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.USER_TOKEN)
    .setHelpUrl('https://mite.yo.lk/api/index.html#authentication')
    .build();
}

/**
 * Resets the credentials (e.g. deletes Mite domain and the API key from the user properties).
 */
function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty(MITE_DOMAIN);
  userProperties.deleteProperty(MITE_KEY);
  
  console.info('Mite domain and API key deleted');
}

/**
 * Retrieves the details for the user for which the domain and API key have been created. If the 
 * HTTP GET call fails or the HTTP response code is not 200, the credentials are treaten as invalid.
 * 
 * @returns {boolean} true if credentials are known and valid; false else.
 */
function isAuthValid() {
  var credentials = getCredentials()
  if (credentials == null) {
    console.info('Neither Mite domain nor API key found');
    return false;
  }
    
  var response = validateCredentials(credentials.domain, credentials.key);
  return (response != null && response.code == 200);
}

/**
 * Stores the credentials into the user properties.
 * 
 * @param {Request} request - the set credentials request holding the user token consisting of the username (Mite domain) and the token (Mite API key).
 * @return {object} An object with an errorCode that is NONE if credentials are valid.
 */
function setCredentials(request) {
  var creds = request.userToken;
  var credentials = {
    domain: creds.username,
    key: creds.token
  }
  
  var response = validateCredentials(credentials.domain, credentials.key);

  var isValid = (response == null || response.code != 200) ? false : true;
  if (isValid == true) {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty(MITE_DOMAIN, credentials.domain);
    userProperties.setProperty(MITE_KEY, credentials.key);
    
    console.info('Mite domain and API key stored');
  }
  
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newSetCredentialsResponse()
  .setIsValid(isValid)
  .build();  
}

/**
 * Throws a user friendly error message.
 * 
 * @param {String} text - the message to be displayed
 */
function throwConnectorError(text) {
  DataStudioApp.createCommunityConnector()
    .newUserError()
    .setDebugText(text)
    .setText(text)
    .throwException();
}