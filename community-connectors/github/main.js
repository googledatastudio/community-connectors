// Copyright 2017 Google LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

/**
 * @fileoverview Community Connector for GitHub. Retrieves historical star data
 * for a GitHub repository.
 */

/** define namespace */
var connector = connector || {};

/** @const */
connector.STARRED_AT = 'starred_at';

/** @const */
connector.LINK_KEY = 'Link';

/** @const */
connector.OAUTH_CONST = 'OAUTH2';

/** @const */
connector.OAUTH_CLIENT_ID = 'OAUTH_CLIENT_ID';

/** @const */
connector.OAUTH_CLIENT_SECRET = 'OAUTH_CLIENT_SECRET';

/** @const */
connector.logEnabled = false;


/**
 * Wrapper function for `connector.getAuthType()`.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  return connector.logAndExecute('getAuthType', undefined);
}

/**
 * Wrapper function for `connector.getConfig()`.
 *
 * @param {Object} request - Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  return connector.logAndExecute('getConfig', request);
}

/**
 * Wrapper function for `connector.getSchema()`.
 *
 * @param {Object} request - Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  return connector.logAndExecute('getSchema', request);
}

/**
 * Wrapper function for `connector.getData()`.
 *
 * @param {Object} request - Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  return connector.logAndExecute('getData', request);
}

/**
 * Wrapper function for `connector.isAdminUser()`.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
  return connector.logAndExecute('isAdminUser', null);
}

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message - Error message to be shown in UI.
 * @param {boolean} userSafe - Indicates whether the error message can be shown to
 *      regular users (as opposed to debug error messages meant for admin users
 *      only.)
 */
connector.throwError = function(message, userSafe) {
  if (userSafe) {
    message = 'DS_USER:' + message;
  }
  throw new Error(message);
};

/**
 * Sample data that will be returned when `sampleExtraction` is set to `true`
 * for `getData()`. Dates are formatted in Unix time.
 *
 * @const
 */
connector.sampleData = [{
  "starred_at": "2017-05-31-T12:50:00Z",
}];

/** @const */
connector.customConfig = [
  {
    name: 'Organization',
    displayName: 'Organization',
    helpText:
    'Enter the name of the organization for which you would like to retrieve information.',
    placeholder: 'google'
  },
  {
    name: 'Repository',
    displayName: 'Repository',
    helpText:
    'Enter the name of the repository for which you would like to retrieve information.',
    placeholder: 'datastudio'
  }
];

/** @const */
connector.schema = [
  {
    name: 'starred_at',
    label: 'Starred At',
    dataType: 'STRING',
    semantics: {conceptType: 'DIMENSION'}
  },
  {
    name: 'stars',
    label: 'Stars',
    dataType: 'NUMBER',
    semantics: {conceptType: 'METRIC'}
  }
];

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * Required function for Community Connector.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
connector.getAuthType = function() {
  var response = {'type': connector.OAUTH_CONST};
  return response;
};

/**
 * Returns the user configurable options for the connector.
 *
 * Required function for Community Connector.
 *
 * @param {Object} request - Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
connector.getConfig = function(request) {
  var config = {configParams: connector.customConfig};
  return config;
};

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request - Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
connector.getSchema = function(request) {
  return {schema: connector.schema};
};

/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} configParams - Config parameters from `request`.
 * @returns {Object} Updated Config parameters.
 */
connector.validateConfig = function(configParams) {
  configParams = configParams || {};

  configParams.Organization = configParams.Organization ||
      connector.throwError('You must provide an Organization.', true);

  configParams.Repository = configParams.Repository ||
      connector.throwError('You must provide a Repository.', true);
};

/**
 * Builds a parameterized url.
 *
 * @param {int} pageNumber - The page of data you are requesting.
 * @param {string} organization - The GitHub organization the repository is under.
 * @param {string} repository - The repository you are getting star data for.
 *
 * @returns {string} A url for requesting star data.
 */
connector.paginatedUrl = function(pageNumber, organization, repository) {
  var urlParts = [
    'https://api.github.com/repos/', organization, '/', repository,
    '/stargazers',
    // URL Parameters
    '?', 'page=', pageNumber, '&per_page=', 100
  ];
  var url = urlParts.join('');
  return url;
};

/**
 * Fetches the response based on requested page number.
 *
 * @param {object} request - The request passed to `connector.getData(request)`.
 * @param {int} pageNumber - The page number you would like to fetch.
 *
 * @returns {object} the response from the `UrlFetchApp.fetch()`.
 */
connector.fetchURL = function(request, pageNumber) {
  var organization = request.configParams.Organization;
  var repository = request.configParams.Repository;
  var options = {
    headers: {
      'Accept': 'application/vnd.github.v3.star+json',
      'Authorization': 'token ' + getOAuthService().getAccessToken()
    }
  };
  var url = connector.paginatedUrl(pageNumber, organization, repository);
  var response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    connector.throwError('Unable to fetch data from source.', true);
  }
  return response;
};

/**
 * Returns the total number of pages that need to be requested.
 *
 * @param {object} initialResponse - The response from the first api call.
 *
 * @returns {int} Total number of pages.
 */
connector.numberOfPages = function(initialResponse) {
  var headers = initialResponse.getAllHeaders();
  if (connector.LINK_KEY in headers) {
    var link = headers[connector.LINK_KEY];
    var lastPageRegEx = /\?page=([0-9]+)&per_page=[0-9]+>; rel="last"/;
    var matches = link.match(lastPageRegEx);
    var lastPageStr = matches[1];
    var pages = parseInt(lastPageStr, 10);
    return pages;
  } else {
    return 1;
  }
};

/**
 * Returns a dynamic schema that only contains fields that were in the request.
 *
 * @param {object} request - The request passed to `connector.getData(request)`.
 *
 * @returns {obj} The schema keyed by `schemaEntry.name`.
 */
connector.getDataSchema = function(request) {
  var schemaByName = connector.schema.reduce(function(acc, schemaEntry) {
    var name = schemaEntry.name;
    acc[name] = schemaEntry;
    return acc;
  }, {});

  var dataSchema = [];
  request.fields.forEach(function(field) {
    if (field.name in schemaByName) {
      dataSchema.push(schemaByName[field.name]);
    }
  });

  return dataSchema;
};

/**
 * Transforms the star data into rows appropriate for Data Studio.
 *
 * @param {obj} stars - The starData built from the requests.
 * @param {obj} dataSchema - The dynamic schema that contains the correct fields.
 *
 * @returns {array} Array of objects formatted for data studio use.
 */
connector.rowifyStarData = function(stars, dataSchema) {
  return stars.map(function(starData) {
    var values = [];
    // Build a row that includes each schema field
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'stars':
          return values.push(1);
        case 'starred_at':
          return values.push(starData[connector.STARRED_AT]);
        default:
          return values.push('');
      }
    });
    // Individual row format.
    // { values: ["017-10-13T11:52:44Z", 1]}
    return {values: values};
  });
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request - Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
connector.getData = function(request) {
  connector.validateConfig(request.configParams);

  var stars = [];
  if (request.scriptParams && request.scriptParams.sampleExtraction === true) {
    stars = connector.sampleData;
  } else {
    var initialResponse = connector.fetchURL(request, 1);
    var totalPages = connector.numberOfPages(initialResponse);
    for (var i = 1; i <= totalPages; i++) {
      // Intentionally makes an extra request to avoid special casing the first
      // vs subsequent requests
      var currentResponse = connector.fetchURL(request, i);
      try {
        var currentStarData = JSON.parse(currentResponse);
      } catch (e) {
        connector.throwError('Unable to parse data fetched from source.', true);
      }
      stars = stars.concat(currentStarData);
    }
  }
  var dataSchema = connector.getDataSchema(request);
  var rows = connector.rowifyStarData(stars, dataSchema);
  var result = {schema: dataSchema, rows: rows};

  return result;
};

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
connector.isAdminUser = function() {
  return false;
};

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName - Function to be logged and executed.
 * @param {Object} parameter - Parameter for the `functionName` function.
 * @returns {any} Returns the response of `functionName` function.
 */
connector.logAndExecute = function(functionName, parameter) {
  if (connector.logEnabled && connector.isAdminUser()) {
    var paramString = JSON.stringify(parameter, null, 2);
    console.log([functionName, 'request', paramString]);
  }

  var returnObject = connector[functionName](parameter);

  if (connector.logEnabled && connector.isAdminUser()) {
    var returnString = JSON.stringify(returnObject, null, 2);
    console.log([functionName, 'response', returnString]);
  }

  return returnObject;
};

/**
 * This builds an OAuth2 service for connecting to GitHub.
 *
 * NOTE: If you want to pull data from private repos, you'll need to add a
 * `.setScope` to the end of the builder based on this page.
 * https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-scopes-for-oauth-apps/
 *
 * @returns {OAuth2Service}
 */
function getOAuthService() {
  // This is where we pull out the "client id" and "client secret" from the
  // Script Properties.
  var scriptProps = PropertiesService.getScriptProperties();
  var clientId = scriptProps.getProperty(connector.OAUTH_CLIENT_ID);
  var clientSecret = scriptProps.getProperty(connector.OAUTH_CLIENT_SECRET);
  return OAuth2.createService('github')
      .setAuthorizationBaseUrl('https://github.com/login/oauth/authorize')
      .setTokenUrl('https://github.com/login/oauth/access_token')
      .setClientId(clientId)
      .setClientSecret(clientSecret)
      .setPropertyStore(PropertiesService.getUserProperties())
      .setCallbackFunction('authCallback');
}

/**
 * The callback that is invoked after a successful or failed authentication
 * attempt.
 *
 * @param {object} request
 * @returns {OAuth2Service}
 */
function authCallback(request) {
  var authorized = getOAuthService().handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

/**
 * @returns {boolean} `true` if the user has successfully authenticated and false
 * otherwise.
 */
function isAuthValid() {
  var service = getOAuthService();
  if (service == null) {
    return false;
  }
  return service.hasAccess();
}

/**
 * Resets the OAuth2 service. This will allow the user to reauthenticate with
 * the external OAuth2 provider.
 */
function resetAuth() {
  var service = getOAuthService();
  service.reset();
}

/**
 * Used as a part of the OAuth2 flow.
 *
 * @returns {string} The authorization url if service is defined.
 */
function get3PAuthorizationUrls() {
  var service = getOAuthService();
  if (service == null) {
    return '';
  }
  return service.getAuthorizationUrl();
}
