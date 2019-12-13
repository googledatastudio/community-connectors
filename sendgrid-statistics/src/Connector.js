// user must provide sendgrid apikey
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();

  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.KEY)
    .build();
}

function setCredentials(request) {
  var key = request.key
  if (validateAPIKey(key)) {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('dscc.key', key);
    return {
      errorCode: 'NONE'
    };
  } else {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
}

function isAdminUser() {
  return true;
}

function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  return validateAPIKey(key);
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

function getData(request) {
  if (request.configParams.stats_type == undefined || request.configParams.aggregated_by == undefined) {
    throwUserException('Stats Type and Aggregation are required in order to continue.');
  } else {
    Logger.log(request);
    var results = getSendGridData(request);
  }

  return results;
}

function getConfig(request) {
  var config = getSendGridConfig(request);

  return config.build();
}

function getSchema(request) {
  var fields = getSendGridSchema(request);

  return {
    schema: fields.build()
  };
}