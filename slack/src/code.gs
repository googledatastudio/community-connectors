/*
This connector can connect to your any specified Slack channel, 
and bring the data to the Data Studio.
*/


/**
 * Returns an object of config for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} config for the given request.
 */
function getConfig(request) {
  var config = {
    configParams: [
      {
        name: 'token',
        displayName: 'Token',
        helpText: 'Enter the Authentication token bearing required scopes.',
        placeholder: 'xxxx-xxxxxxxxx-xxxx'
      },
      {
        name: 'channel',
        displayName: 'Channel',
        helpText: 'Enter the Channel to fetch history for.',
        placeholder: 'C1234567890'
      },
      {
        name: 'count',
        displayName: 'Count',
        helpText: 'Enter the Number of messages to return, between 1 and 1000.',
        placeholder: 'default=100'
      },
      {
        name: 'inclusive',
        displayName: 'Inclusive',
        helpText: 'The number of inclusive messages',
        placeholder: 'default=0'
      },
      {
        name: 'latest',
        displayName: 'Latest',
        helpText: 'The time from which you need the messages',
        placeholder: 'default=0'
      },
      {
        name: 'oldest',
        displayName: 'Oldest',
        helpText: 'The number of oldeest messages',
        placeholder: 'default=0'
      },
      {
        name: 'unreads',
        displayName: 'Unreads',
        helpText: 'The number of oldeest messages',
        placeholder: 'default=0'
      }
    ]
  };
  return config;
}


/** @const */
var fixedSchema = [
  {
    name: 'type',
    label: 'type',
    description: 'type of text',
    dataType: 'STRING'
  },
  {
    name: 'user',
    label: 'user ID',
    description: 'ID of USer',
    dataType: 'STRING'
  },
  {
    name: 'text',
    label: 'text',
    description: 'Text message sent by the User',
    dataType: 'STRING'
  },
  {
    name: 'client_msg_id',
    label: 'client_msg_id',
    description: 'Client message ID',
    dataType: 'STRING'
  },
  {
    name: 'ts',
    label: 'time Stamp',
    description: 'Time Stamp',
    dataType: 'STRING'
  }
];


/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */

function getSchema(request) {
  return {schema: fixedSchema};
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */

function getData(request) {
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
  var slackData = JSON.parse(response.getContentText());

  // Prepare the schema for the fields requested.
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i=0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name == field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });
  
  console.log("slackData.jsonPayload.messages")

  // Prepare the tabular data.
  var data = [];
  slackData.messages.forEach(function(message) { 
    var values = [];
    // Provide values in the order defined by the schema.
    dataSchema.forEach(function(field) {
      switch(field.name) {
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
    data.push({
      values: values
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
}

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
}


