/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}

///**
// * Returns the Auth Type of this connector.
// * @return {object} The Auth type.
// */
//function getAuthType() {
//  var cc = DataStudioApp.createCommunityConnector();
//  return cc.newAuthTypeResponse()
//    .setAuthType(cc.AuthType.KEY)
//    .setHelpUrl('https://www.example.org/connector-auth-help')
//    .build();
//}
//
///**
// * Resets the auth service.
// */
//function resetAuth() {
//  var userProperties = PropertiesService.getUserProperties();
//  userProperties.deleteProperty('dscc.key');
//}
///**
// * Returns true if the auth service has access.
// * @return {boolean} True if the auth service has access.
// */
//function isAuthValid() {
//  var userProperties = PropertiesService.getUserProperties();
//  var key = userProperties.getProperty('dscc.key');
//  // This assumes you have a validateKey function that can validate
//  // if the key is valid.
//  return validateKey(key);
//}
///**
// * Sets the credentials.
// * @param {Request} request The set credentials request.
// * @return {object} An object with an errorCode.
// */
//function setCredentials(request) {
//  var key = request.key;
//
//  // Optional
//  // Check if the provided key is valid through a call to your service.
//  // You would have to have a `checkForValidKey` function defined for
//  // this to work.
//  var validKey = checkForValidKey(key);
//  if (!validKey) {
//    return {
//      errorCode: 'INVALID_CREDENTIALS'
//    };
//  }
//  var userProperties = PropertiesService.getUserProperties();
//  userProperties.setProperty('dscc.key', key);
//  return {
//    errorCode: 'NONE'
//  };
//}