function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  config.setDateRangeRequired(true);
  return config.build();
}

function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.USER_TOKEN)
    .setHelpUrl('https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin#generate-private-app-credentials')
    .build();
}

function setCredentials(request) {
  console.log(request);
  var creds = request.userToken;
  var username = creds.username;
  var password = creds.token;
  var validCreds = check_connection(username, password);
  if (!validCreds) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.username', username);
  userProperties.setProperty('dscc.password', password);
  return {
    errorCode: 'NONE'
  };
}
function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.username');
  userProperties.deleteProperty('dscc.password');
}
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var url = userProperties.getProperty('dscc.username');
  var token = userProperties.getProperty('dscc.password');
  // This assumes you have a validateCredentials function that
  // can validate if the userName and password are correct.
  return check_connection(url, token);
}