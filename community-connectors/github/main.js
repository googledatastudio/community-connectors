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

/** @const */
connector.defaultOrganization = 'google';

/** @const */
connector.defaultRepository = 'datastudio';

/** @const */
connector.resultsPerPage = 100;

/** @return {object} The CustomCache namespace. Enables mocking. */
connector.getCustomCacheNS = function() {
  return CustomCache;
};

/** @return {object} The UrlFetchApp object. Enables mocking. */
connector.getUrlFetchApp = function() {
  return UrlFetchApp;
};

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
connector.sampleData = [
  {
    starred_at: '2017-05-31-T12:50:00Z',
  },
];

/** @const */
connector.customConfig = [
  {
    name: 'Organization',
    displayName: 'Organization',
    helpText:
      'Enter the name of the organization for which you would like to retrieve information.',
    placeholder: connector.defaultOrganization,
  },
  {
    name: 'Repository',
    displayName: 'Repository',
    helpText:
      'Enter the name of the repository for which you would like to retrieve information.',
    placeholder: connector.defaultRepository,
  },
];

/** @const */
connector.schema = [
  {
    name: 'starred_at',
    label: 'Starred At',
    dataType: 'STRING',
    semantics: {conceptType: 'DIMENSION'},
  },
  {
    name: 'stars',
    label: 'Stars',
    dataType: 'NUMBER',
    semantics: {conceptType: 'METRIC'},
  },
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
  var response = {type: connector.OAUTH_CONST};
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
  configParams.Organization =
    configParams.Organization || connector.defaultOrganization;
  configParams.Repository =
    configParams.Repository || connector.defaultRepository;
};

/**
 * Builds a parameterized url.
 *
 * @param {object} request - Schema request parameters.
 *
 * @returns {string} A url for requesting star data.
 */
connector.buildURL = function(request) {
  var configParams = request.configParams;
  var organization = configParams.Organization;
  var repository = configParams.Repository;
  var urlParts = [
    'https://api.github.com/repos/',
    organization,
    '/',
    repository,
    '/stargazers',
  ];
  var urlParams = ['?per_page=' + connector.resultsPerPage];
  var url = urlParts.join('') + urlParams.join('&');
  return url;
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
    // { values: ["2017-10-13T11:52:44Z", 1]}
    return {values: values};
  });
};

/**
 * Gets data from the cache using a paginated strategy.
 *
 * @param {object} cache The cache.
 * @param {object} cacheKey The key to lokup in the cache.
 * @return {object|undefined} either the aggregated values from the cache or undefined, if the key was not found.
 */
connector.getFromCachePaginated = function(cache, cacheKey) {
  var cached = cache.getRestFrom(
    cacheKey,
    function(acc, row) {
      const cachedValue = JSON.parse(row[1]);
      const results = acc.json.concat(cachedValue.json);
      const nextLink = cachedValue.nextLink;
      return {
        json: results,
        nextLink: nextLink,
      };
    },
    {json: [], nextLink: undefined}
  );
  return cached;
};

/**
 * Attempts to get the data from the cache. If it fails, it makes all necessary
 * requests, caches results as it goes.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @param {string} url - The url to request.
 * @param {object} options - The options to use for the UrlFetchApp, if necessary.
 * @return {object} The response from the cache, or `UrlFetchApp.fetch`.
 */
connector.getCachedData = function(request, url, options) {
  if (connector.cache === null || connector.cache === undefined) {
    connector.cache = new (connector.getCustomCacheNS())(
      request.configParams.url_name,
      request.configParams.api_type
    );
  }
  var cache = connector.cache;
  var cacheKey = url;
  var cached = connector.getFromCachePaginated(cache, cacheKey);
  var nextUrl = url;
  if (cached) {
    return cached;
  } else {
    try {
      var shouldCache = true;
      var response = connector.getUrlFetchApp().fetch(nextUrl, options);
      var results = JSON.parse(response);
      nextUrl = connector.getNextLink(response);

      if (!nextUrl || results.length !== connector.resultsPerPage) {
        shouldCache = false;
      }

      var toCache = {json: results, nextLink: nextUrl};

      if (shouldCache) {
        cache.put(cacheKey, toCache);
      }
      return toCache;
    } catch (e) {
      console.log(e);
      connector.throwError('Unable to get data from GitHub.com', true);
    }
  }
};

/**
 * Parses out the next link from the response headers. Returns undefined if no
 * next link was found.
 *
 * @param {object} response - The response from `UrlFetchApp.fetch`
 * @return {string|undefined} the next link, or undefined if there was none.
 */
connector.getNextLink = function(response) {
  var regex = /<(.*)>; rel="next"/;
  var headers = response.getAllHeaders();
  var linkHeaders = headers['Link'] || [];
  if (typeof linkHeaders === 'string') {
    // make it where it's always an array, even if there is only 1 response.
    linkHeaders = [linkHeaders];
  }
  var nextUrl;
  for (var j = 0; j < linkHeaders.length; j++) {
    var link = linkHeaders[j];
    var nextUrl = link && link.match(regex) && link.match(regex)[1];
    if (nextUrl) {
      return nextUrl;
    }
  }
  return undefined;
};

/**
 * Chains all necessary requests together respecting pagination.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @param {string} url - The first url to call in the pagination chain.
 * @return {object} All responses from the api joined together.
 */
connector.paginatedResult = function(request, url) {
  // make request
  var options = {
    headers: {
      Accept: 'application/vnd.github.v3.star+json',
      Authorization: 'token ' + getOAuthService().getAccessToken(),
    },
  };

  var response = connector.getCachedData(request, url, options);
  var nextUrl = response.nextLink;
  var responses = response.json;
  while (nextUrl) {
    var r = connector.getCachedData(request, nextUrl, options);
    responses = responses.concat(r.json);
    nextUrl = r.nextLink;
  }
  return responses;
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request - Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
connector.getData = function(request) {
  connector.validateConfig(request.configParams);

  var url = connector.buildURL(request);

  var stars = [];
  if (request.scriptParams && request.scriptParams.sampleExtraction === true) {
    stars = connector.sampleData;
  } else {
    stars = connector.paginatedResult(request, url);
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
