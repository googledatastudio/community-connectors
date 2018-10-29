/*
This connector can connect to your any specified Slack channel, 
and bring the data to the Data Studio.
*/

var connector = connector || {};

/**
 * Returns an object of config for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} config for the given request.
 */

function getConfig(request) {
  
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newTextInput()
      .setId('token')
      .setName('Token')
      .setHelpText('Enter the Authentication token bearing required scopes.')
      .setPlaceholder('xxxx-xxxxxxxxx-xxxx');
  
  config.newTextInput()
      .setId('channel')
      .setName('Channel')
      .setHelpText('Enter the Channel to fetch history for.')
      .setPlaceholder('C1234567890');
  
  config.newTextInput()
      .setId('count')
      .setName('Count')
      .setHelpText('Enter the Number of messages to return, between 1 and 1000.')
      .setPlaceholder('default=100');
  
  config.newTextInput()
      .setId('inclusive')
      .setName('Inclusive')
      .setHelpText('The number of inclusive messages')
      .setPlaceholder('default=0');

  config.newTextInput()
      .setId('latest')
      .setName('Latest')
      .setHelpText('The time from which you need the messages')
      .setPlaceholder('default=0');
  
  config.newTextInput()
      .setId('oldest')
      .setName('Oldest')
      .setHelpText('The number of oldeest messages')
      .setPlaceholder('default=0');
  
  config.newTextInput()
      .setId('unreads')
      .setName('Unreads')
      .setHelpText('The number of unread messages')
      .setPlaceholder('default=0');

  return config.build();
}


function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields.newDimension()
      .setId('type')
      .setName('type')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('user')
      .setName('user ID')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('text')
      .setName('Text message sent by the User')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('client_msg_id')
      .setName('Client message ID')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('ts')
      .setName('Time Stamp')
      .setType(types.TEXT);

  return fields;

}

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */

function getSchema(request) {
  var fields = getFields().build();
  return { 'schema': fields};
}



function responseToRows(requestedFields, slackData) {
  // Transform parsed data and filter for requested fields
  return slackData.map(function(message) {
    var values = [];
    requestedFields.asArray().forEach(function (field) {
      switch (field.getId()) {
        case 'type':
          values.push(message.type);
          break;
        case 'user':
          values.push(message.user);
          break;
        case 'text':
          values.push(message.text);
          break;
        case 'client_msg_id':
          values.push(message.client_msg_id);
          break;
        case 'ts':
          values.push(message.ts);
          break;
        default:
          values.push('');
      }
    });
    return { values: values };
  });
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */

function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);
  
  if (!request.configParams.count) {
    request.configParams.count = 100; // assigning the default value
  }
  
  
  var url = [
    'https://slack.com/api/channels.history?token=',
    request.configParams.token,
    '&channel=',
    request.configParams.channel,
    '&count=',
    request.configParams.count,
    '&inclusive=',
    request.configParams.inclusive,
    '&latest=',
    request.configParams.latest,
    '&oldest=',
    request.configParams.oldest,
    '&unreads=',
    request.configParams.unreads];

  // Fetch the data.
  // By default URL fetch will throw an exception if the response code indicates failure.
  var response = UrlFetchApp.fetch(url.join(''));
  console.log(response);
  var slackData = JSON.parse(response).messages;
  var rows = responseToRows(requestedFields, slackData);
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  var response = { type: "NONE"};
  return response;
}


