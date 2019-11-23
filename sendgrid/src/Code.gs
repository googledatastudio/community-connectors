/**
 * Mandatory function required by Google Data Studio that should
 * return the authentication method required by the connector
 * to authorize the third-party service.
 * @return {Object} AuthType
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
  .setAuthType(cc.AuthType.KEY)
  .setHelpUrl('https://sendgrid.com/docs/API_Reference/Web_API_v3/How_To_Use_The_Web_API_v3/authentication.html#-API-key-recommended')
  .build();
}

/**
 * Mandatory function required by Google Data Studio that should
 * clear user credentials for the third-party service.
 * This function does not accept any arguments and
 * the response is empty.
 */
function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

/**
 * Mandatory function required by Google Data Studio that should
 * determine if the authentication for the third-party service is valid.
 * @return {Boolean}
 */
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');
  return checkForValidKey(key);
}

/**
 * Mandatory function required by Google Data Studio that should
 * set the credentials after the user enters either their
 * credential information on the community connector configuration page.
 * @param {Object} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
  var key = request.key;
  var validKey = checkForValidKey(key);
  if (!validKey) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', key);
  return {
    errorCode: 'NONE'
  };
}

/**
 * Mandatory function required by Google Data Studio that should
 * return the user configurable options for the connector.
 * @param {Object} request
 * @return {Object} fields
 */
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  config.setDateRangeRequired(true);
  return config.build();
}

/**
 * Supports the getSchema() function
 * @param {Object} request
 * @return {Object} fields
 */
function getFields(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields.newDimension()
  .setId('date')
  .setType(types.YEAR_MONTH_DAY);
  
  fields.newMetric()
  .setId('blocks')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('bounce_drops')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('bounces')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('clicks')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('deferred')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('delivered')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('invalid_emails')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('opens')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('processed')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('requests')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('spam_report_drops')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('spam_reports')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unique_clicks')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unique_opens')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unsubscribe_drops')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  fields.newMetric()
  .setId('unsubscribes')
  .setType(types.NUMBER)
  .setAggregation(aggregations.SUM);
  
  return fields;
}

/**
 * Mandatory function required by Google Data Studio that should
 * return the schema for the given request.
 * This provides the information about how the connector's data is organized.
 * @param {Object} request
 * @return {Object} fields
 */
function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}

/**
 * Takes the requested fields with the API response and
 * return rows formatted for Google Data Studio.
 * @param {Object} requestedFields
 * @param {Object} response
 * @return {Array} values
 */
function responseToRows(requestedFields, response) {
  return response.map(function(dailyStats) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
        case 'date':
          return row.push(dailyStats.date);
        case 'blocks':
          return row.push(dailyStats.stats[0].metrics.blocks);
        case 'bounce_drops':
          return row.push(dailyStats.stats[0].metrics.bounce_drops);
        case 'bounces':
          return row.push(dailyStats.stats[0].metrics.bounces);
        case 'clicks':
          return row.push(dailyStats.stats[0].metrics.clicks);
        case 'deferred':
          return row.push(dailyStats.stats[0].metrics.deferred);
        case 'delivered':
          return row.push(dailyStats.stats[0].metrics.delivered);
        case 'invalid_emails':
          return row.push(dailyStats.stats[0].metrics.invalid_emails);
        case 'opens':
          return row.push(dailyStats.stats[0].metrics.opens);
        case 'processed':
          return row.push(dailyStats.stats[0].metrics.processed);
        case 'requests':
          return row.push(dailyStats.stats[0].metrics.requests);
        case 'spam_report_drops':
          return row.push(dailyStats.stats[0].metrics.spam_report_drops);
        case 'spam_reports':
          return row.push(dailyStats.stats[0].metrics.spam_reports);
        case 'unique_clicks':
          return row.push(dailyStats.stats[0].metrics.unique_clicks);
        case 'unique_opens':
          return row.push(dailyStats.stats[0].metrics.unique_opens);
        case 'unsubscribe_drops':
          return row.push(dailyStats.stats[0].metrics.unsubscribe_drops);
        case 'unsubscribes':
          return row.push(dailyStats.stats[0].metrics.unsubscribes);
        default:
          return row.push('');
      }
    });
    return { values: row };
  });
}

/**
 * Mandatory function required by Google Data Studio that should
 * return the tabular data for the given request.
 * @param {Object} request
 * @return {Object}
 */
function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);
  var userProperties = PropertiesService.getUserProperties();
  var token = userProperties.getProperty('dscc.key');
  var baseURL = 'https://api.sendgrid.com/v3/stats?start_date=' + request.dateRange.startDate + '&end_date=' + request.dateRange.endDate;
  var options = {
    'method' : 'GET',
    'headers': {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions':true
  };
  var response = UrlFetchApp.fetch(baseURL, options);
  if (response.getResponseCode() == 200) {
    var parsedResponse = JSON.parse(response);
    var rows = responseToRows(requestedFields, parsedResponse);
    return {
      schema: requestedFields.build(),
      rows: rows
    };
  } else {
    DataStudioApp.createCommunityConnector()
    .newUserError()
    .setDebugText('Error fetching data from API. Exception details: ' + response)
    .setText('Error fetching data from API. Exception details: ' + response)
    .throwException();
  }
}

/**
 * Checks if the Key/Token provided by the user is valid
 * @param {String} key
 * @return {Boolean}
 */
function checkForValidKey(key) {
  var token = key;
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var baseURL = 'https://api.sendgrid.com/v3/stats?start_date=' + today;  
  var options = {
    'method' : 'GET',
    'headers': {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    'muteHttpExceptions':true
  };
  var response = UrlFetchApp.fetch(baseURL, options);
  if (response.getResponseCode() == 200) {
    return true;
  } else {
    return false;
  }
}
