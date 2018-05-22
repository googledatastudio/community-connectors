// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Community Connector for npm package download count data. This
 * can retrieve download count for one or multiple packages from npm by date.
 *
 */

/** define namespace */
var connector = connector || {};

/** @const */
connector.defaultPackage = 'googleapis';

/** @const */
connector.Config = [
  {
    type: 'INFO',
    name: 'Unique1',
    text:
      'Enter npm package names to fetch their download count. An invalid or blank entry will revert to the default value.',
  },
  {
    type: 'TEXTINPUT',
    name: 'package',
    displayName:
      'Enter a single package name or multiple names separated by commas (no spaces!)',
    helpText: 'e.g. "googleapis" or "package,somepackage,anotherpackage"',
    placeholder: connector.defaultPackage,
  },
];

/** @const */
connector.schema = [
  {
    name: 'packageName',
    label: 'Package',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
    },
  },
  {
    name: 'day',
    label: 'Date',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
    },
  },
  {
    name: 'downloads',
    label: 'Downloads',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true,
    },
  },
];

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  var response = {type: 'NONE'};
  return response;
}

/**
 * Returns the user configurable options for the connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  var config = {
    configParams: connector.Config,
    dateRangeRequired: true,
  };
  return config;
}

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  return {schema: connector.schema};
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  request.configParams = connector.validateConfig(request.configParams);

  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < connector.schema.length; i++) {
      if (connector.schema[i].name == field.name) {
        return connector.schema[i];
      }
    }
  });

  try {
    var apiResponse = connector.fetchDataFromApi(request);
  } catch (e) {
    connector.throwError('Unable to fetch data from source.', true);
  }

  try {
    var parsedResponse = connector.parseData(request, apiResponse);
  } catch (e) {
    connector.throwError('Unable to parse data.', true);
  }

  try {
    var data = connector.getFormattedData(parsedResponse, dataSchema);
  } catch (e) {
    connector.throwError('Unable to process data in required format.', true);
  }

  return {
    schema: dataSchema,
    rows: data,
  };
}

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
  return true;
}

/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the fields included in the original getData request
 * (that are defined dataSchema)
 *
 * @param {Object} parsedResponse The response string from external data source
 *     parsed into an object in a standard format.
 * @param {Array} dataSchema List of schema for each field present in the getData
 *     request.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
connector.getFormattedData = function(parsedResponse, dataSchema) {
  var data = [];
  for (var packageName in parsedResponse) {
    if (
      parsedResponse.hasOwnProperty(packageName) &&
      parsedResponse[packageName]
    ) {
      var downloadData = parsedResponse[packageName].downloads;
      var formatted_data = downloadData.map(function(dailyDownload) {
        return connector.formatData(dataSchema, packageName, dailyDownload);
      });
      data = data.concat(formatted_data);
    }
  }
  return data;
};

/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} configParams Config parameters from `request`.
 * @returns {Object} Updated Config parameters.
 */
connector.validateConfig = function(configParams) {
  configParams = configParams || {};
  configParams.package = configParams.package || connector.defaultPackage;

  configParams.package = configParams.package
    .split(',')
    .map(function(x) {
      return x.trim();
    })
    .join(',');

  return configParams;
};

/**
 * Gets response for UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
connector.fetchDataFromApi = function(request) {
  var url = [
    'https://api.npmjs.org/downloads/range/',
    request.dateRange.startDate,
    ':',
    request.dateRange.endDate,
    '/',
    request.configParams.package,
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  return response;
};

/**
 * Parses response string into an object. Also standardizes the object structure
 * for single vs multiple packages.
 *
 * @param {Object} request Data request parameters.
 * @param {string} responseString Response from the API.
 * @return {Object} Contains package names as keys and associated download count
 *     information(object) as values.
 */
connector.parseData = function(request, responseString) {
  var response = JSON.parse(responseString);
  var package_list = request.configParams.package.split(',');
  var mapped_response = {};

  if (package_list.length == 1) {
    mapped_response[package_list[0]] = response;
  } else {
    mapped_response = response;
  }

  return mapped_response;
};

/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} dataSchema Filtered schema containing fields in the request.
 * @param {string} packageName Name of the package who's download data is being
 *    processed.
 * @param {Object} dailyDownload Contains the download data for a certain day.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
connector.formatData = function(dataSchema, packageName, dailyDownload) {
  var values = [];
  dataSchema.forEach(function(field) {
    switch (field.name) {
      case 'day':
        values.push(dailyDownload.day.replace(/-/g, ''));
        break;
      case 'downloads':
        values.push(dailyDownload.downloads);
        break;
      case 'packageName':
        values.push(packageName);
        break;
      default:
        values.push('');
    }
  });
  return {values: values};
};

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message Error message to be shown in UI.
 * @param {boolean} userSafe Indicates whether the error message can be shown to
 *      regular users (as opposed to debug error messages meant for admin users
 *      only).
 */
connector.throwError = function(message, userSafe) {
  if (userSafe) {
    message = 'DS_USER:' + message;
  }
  throw new Error(message);
};
