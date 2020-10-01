//  Copyright notice
//
//  (c) 2020 Clayton Oliveira <claytondev1@gmail.com>, Brazil
//
//  All rights reserved
//
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
//  This copyright notice MUST APPEAR in all copies of the script!

var cc = DataStudioApp.createCommunityConnector();
var BASE_URL = 'https://api.newrelic.com/v2';

/**
 * Get Authorization Type.
 *
 */
// https://developers.google.com/datastudio/connector/reference#getauthtype
function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

/**
 * Set if is Admin running application
 * for debug purposes.
 */
function isAdminUser() {
  return false;
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  var configParams = request.configParams;
  var isFirstRequest = configParams === undefined;
  var config = cc.getConfig();

  if (isFirstRequest) {
    config.setIsSteppedConfig(true);
  }

  config
    .newInfo()
    .setId('instructions')
    .setText('Enter your New Relic Rest API Key to get your account data.');

  config
    .newTextInput()
    .setId('apiKey')
    .setName('New Relic REST API Key *');

  var option1 = config
    .newOptionBuilder()
    .setLabel('Applications Deployments')
    .setValue('deployments');

  var option2 = config
    .newOptionBuilder()
    .setLabel('Incidents')
    .setValue('incidents');

  var option3 = config
    .newOptionBuilder()
    .setLabel('Violations')
    .setValue('violations');

  config
    .newSelectSingle()
    .setId('endPoint')
    .setName('New Relic - End Point')
    .setIsDynamic(true)
    .addOption(option1)
    .addOption(option2)
    .addOption(option3);

  if (!isFirstRequest) {
    // validate a valid value was selected for configParams.endPoint
    if (configParams.endPoint === undefined) {
      cc.newUserError()
        .setText('You must choose an New Relic End Point')
        .throwException();
    }
    switch (configParams.endPoint) {
      case 'deployments': {
        config
          .newTextInput()
          .setId('application_id')
          .setName('Application ID');
        break;
      }
      case 'incidents': {
        // No additional configuration is needed for incidents.
        break;
      }
      case 'violations': {
        config.setDateRangeRequired(true);
        // No additional configuration is needed for violations.
        break;
      }
      default: {
        cc.newUserError()
          .setText(
            'You must either select "Applications Deployments", "Incidents" or "Violations"'
          )
          .throwException();
      }
    }
  }

  return config.build();
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return {schema: getFields(request.configParams.endPoint).build()};
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  request.configParams = validateConfig(request.configParams);

  var endPoint = request.configParams.endPoint;
  var params = getParams(endPoint, request);

  var requestedFields = getFields(endPoint).forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  try {
    var apiResponse = fetchDataFromApi(
      request.configParams.apiKey,
      endPoint,
      params,
      request
    );
    var parsedResponse = normalizeResponse(request, apiResponse);
    var data = getFormattedData(parsedResponse, requestedFields, endPoint);
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }

  return {
    schema: requestedFields.build(),
    rows: data
  };
}

/**
 * Validate config object and throw error if anything wrong.
 *
 * @param  {Object} configParams Config object supplied by user.
 */
function validateConfig(configParams) {
  configParams = configParams || {};
  if (!configParams.apiKey) {
    throwUserError('New Relic Rest API Key is empty.');
  }
  return configParams;
}

/**
 * Prepare the request with headers and nedded params.
 * Check if data range is available and use it if possible.
 * Itarate over all pages merging the data from the first JSON Array element.
 *
 * @param {string} apiKey parameter provided by user.
 * @param {string} endPoint parameter choosen by user.
 * @param {string} params provided by user.
 * @param {Object} request Data request parameters,
 * @returns {string} Response text after all requests made.
 */
function fetchDataFromApi(apiKey, endPoint, params, request) {
  var url = [BASE_URL, getRoute(endPoint, params)].join('/');
  var options = {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey
    }
  };

  var results = [];
  var page = 1;
  var data_name = '';

  var start_date =
    typeof request.dateRange != 'undefined' ? request.dateRange.startDate : '';
  var end_date =
    typeof request.dateRange != 'undefined' ? request.dateRange.endDate : '';

  while (1) {
    var query = {
      page: page,
      start_date: start_date,
      end_date: end_date
    };

    var request_url = [url, generateQueryString(query)].join('?');
    var response = JSON.parse(UrlFetchApp.fetch(request_url, options));

    data_name = getDataArrayName(response);

    var fresh_results = getDataArrayValues(response);

    if (fresh_results.length == 0) {
      break;
    }

    page += 1;
    results = results.concat(fresh_results);
  }

  response = {};
  response[data_name] = results;
  response = JSON.stringify(response);

  return response;
}

/**
 * Parses response string into an object. Also standardizes the object structure
 * for single vs multiple packages.
 *
 * @param {Object} request Data request parameters.
 * @param {string} responseString Response from the API.
 * @return {Object} Contains strutured data about the endpoint requested.
 */
function normalizeResponse(request, responseString) {
  return JSON.parse(responseString);
}

/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the requestedFields
 *
 * @param {Object} parsedResponse The response string from New Relic API data source
 *     parsed into an object in a standard format.
 * @param {Array} requestedFields The fields requested in the getData request.
 * @param {string} endPoint parameter choosen by user.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
function getFormattedData(parsedResponse, requestedFields, endPoint) {
  var data = [];

  var response_data = parsedResponse[endPoint];

  Object.keys(response_data).map(function(index) {
    switch (endPoint) {
      case 'deployments': {
        var formattedData = formatDeployData(
          requestedFields,
          response_data[index]
        );
        break;
      }
      case 'incidents': {
        var formattedData = formatIncidentData(
          requestedFields,
          response_data[index]
        );
        break;
      }
      case 'violations': {
        var formattedData = formatViolationData(
          requestedFields,
          response_data[index]
        );
        break;
      }
    }

    data = data.concat(formattedData);
  });

  return data;
}

/**
 * Gets the fields for the specific end point.
 *
 * @param {string} endPoint parameter choosen by user.
 * @returns {Array} Array fields requested in the getData request.
 */
function getFields(endPoint) {
  switch (endPoint) {
    case 'deployments': {
      return deploymentFields();
      break;
    }
    case 'incidents': {
      return incidentFields();
      break;
    }
    case 'violations': {
      return violationFields();
      break;
    }
  }
}

/**
 * Gets an Array of parameters available for the specific end point.
 *
 * @param {string} endPoint parameter choosen by user.
 * @param {Object} request object to get config parameters.
 * @returns {Array} Array of params nedded for the request.
 */
function getParams(endPoint, request) {
  switch (endPoint) {
    case 'deployments': {
      return [request.configParams.application_id];
      break;
    }
    case 'incidents': {
      return [];
      break;
    }
    case 'violations': {
      return [];
      break;
    }
  }
}
