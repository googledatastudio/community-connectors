/*
This connector can connect to your Senuto DataStudio datas,
and use the datas from SENUTO API in Data Studio.
*/

var connector = connector || {};

/**
 * An enum that defines the authentication types that can be set for a connector.
 * $see https://developers.google.com/apps-script/reference/data-studio/auth-type
 */
function getAuthType() {
  var response = {type: 'NONE'}; // OAUTH2, USER_PASS, KEY, USER_TOKEN
  return response;
}

/**
 * Builds the Community Connector config.
 * @returns {Object} config -  The Community Connector config.
 * @see https://developers.google.com/apps-script/reference/data-studio/config
 */
function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newTextInput()
    .setId('hash')
    .setName('Security ID')
    .setHelpText('Enter the Security ID to get history.')
    .setPlaceholder('securityidsecurityidsecurityidsecurityid');

  config
    .newTextInput()
    .setId('domain')
    .setName('Domain')
    .setHelpText('Enter the Domain to get history.')
    .setPlaceholder('senuto.com');

  return config.build();
}

var npmSchema = [
  {
    name: 'time',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'YEAR_MONTH_DAY'
    }
  },
  {
    name: 'top3_history',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  },
  {
    name: 'top10_history',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  },
  {
    name: 'top50_history',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  }
];

/**
 * Builds the Community Connector schema.
 * @param {object} request The request.
 * @return {object} The schema.
 */
function getSchema(request) {
  return {schema: npmSchema};
}

/**
 * Gets the data for the community connector
 * @param {object} request The request.
 * @return {object} The data.
 */
function getData(request) {
  // Create schema for requested fields
  var requestedSchema = request.fields.map(function(field) {
    for (var i = 0; i < npmSchema.length; i++) {
      if (npmSchema[i].name == field.name) {
        return npmSchema[i];
      }
    }
  });

  // Fetch and parse data from API
  var url = [
    'https://api.senuto.com/api/data_studio/visibility_analysis/domain_positions/getPositionsHistoryChartData?',,
    'domain=',
    request.configParams.domain,
    '&date_min=2016-03-01',
    '&hash=',
    request.configParams.hash
  ];

  var response = UrlFetchApp.fetch(url.join(''));
  var parsedResponse = JSON.parse(response).data;

  // Transform parsed data and filter for requested fields
  var requestedData = parsedResponse.map(function(schemaData) {
    var values = [];

    requestedSchema.forEach(function(field) {
      switch (field.name) {
        case 'time':
          values.push(
            Utilities.formatDate(
              new Date(schemaData.time * 1000),
              'Europe/Warsaw',
              'yyyyMMdd'
            ).toString()
          );
          break;
        case 'top3_history':
          values.push(schemaData.top3_history);
          break;
        case 'top10_history':
          values.push(schemaData.top10_history);
          break;
        case 'top50_history':
          values.push(schemaData.top50_history);
          break;
        default:
          values.push('');
          break;
      }
    });

    return {values: values};
  });

  return {
    schema: requestedSchema,
    rows: requestedData
  };
}
