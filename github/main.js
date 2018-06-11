'use strict';

/**
 * @license
 * Copyright 2018 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0*
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * HELPERS: THESE FUNCTIONS ARE GENERAL PURPOSE HELPERS FOR THE REST
 * OF THE COMMUNITY CONNECTORS
 */

//TODO(nathanwest): Roll this stuff into a separate library

/**
 * Given an unkeyed schema, which is an array of schema fields, return an
 * object containing those same fields, mapped on field.name
 * @param  {!Array<Object>} unkeyedSchema The schema (as an array) to convert
 *   into an object
 * @return {!Object<string, Object>} The same schema, keyed by field name
 */
function makeKeyedSchema(unkeyedSchema) {
  var keyedSchema = {};
  unkeyedSchema.forEach(function(field) {
    keyedSchema[field.name] = field;
  });
  return keyedSchema;
}

/**
 * Given a connector, which has a .schema property, which should be an array
 * of schema fields, attach a getSchema() function and a keyedSchema property
 * to the connector. getSchema is a function returning a schema, per the
 * community connector spec. keyedSchema is an object containing all the
 * schema fields, keyed on field.name.
 *
 * @param  {!Object} connector The connector to be modified
 * @return {!Object} The same connector object, with a getSchema() and
 *   keyedSchema attached
 */
function applyGetSchema(connector) {
  var unkeyedSchema = connector.schema;
  var keyedSchema = makeKeyedSchema(unkeyedSchema);
  var schema = {schema: unkeyedSchema};

  connector.getSchema = function getSchema() {
    return schema;
  };
  connector.keyedSchema = keyedSchema;

  return connector;
}

/**
 * Given a static config, create a function returning that config. The static
 * config can be either an object with "configParams" and (optionally)
 * "dateRangeRequired", or an array. If it is an array it will be treated as
 * the configParams by the returned getConfig
 * @param  {!{
 *   configParams: Array<Object>,
 *   dateRangeRequired: boolean
 * } | Array<Object>} config The static config object to use. If it is an
 *   object, the object will be returned directly by getConfig. If it is an
 *   array, getConfig will return { configParams: <config> }
 * @return {function(): {configParams, dateRangeRequired}} A function suitible
 *   for use as getConfig.
 */
function makeGetConfig(config) {
  var normalizedConfig =
    config instanceof Array
      ? {configParams: config, dateRangeRequired: false}
      : config;

  return function getConfig() {
    return normalizedConfig;
  };
}

/**
 * Given an object used as a key-value store, encode the keys and values in
 * the object to a URL query string. If no values are given, returns an empty
 * string; otherwise returns a query string with "?" prepended. The keys and
 * values are correctly URL escaped.
 *
 * @param  {Object<String, String>} queryParams The parameters to encode. Can
 *   also be falsey, in which case an empty query string is returned
 * @return {!String} The encoded query string. Has '?' prepended, unless no
 *   fields were given, in which case it returns an empty query string.
 */
function encodeQuery(queryParams) {
  if (!queryParams) return '';

  var query = Object.keys(queryParams)
    .map(function(key) {
      return (
        encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key])
      );
    })
    .join('&');

  return query === '' ? '' : '?' + query;
}

/**
 * Format a date in the YYYYMMDDHH format expected by datastudio. Pays no
 * attention to time zones.
 *
 * @param  {!String|Date} date An iso-8601 formatted timestamp, or a Date
 *   object, or something falsey
 * @return {[type]} The date formatted as YYYYMMDDHH, or null if something
 *   falsey was given.
 */
function formatDate(date) {
  return !date
    ? null
    : date instanceof Date
      ? formatDate(date.toISOString())
      : date.slice(0, 4) +
        date.slice(5, 7) +
        date.slice(8, 10) +
        date.slice(11, 13);
}

/**
 * Repeatedly fetch a URL for a paginated API. Call a callback function
 * once for each response.
 *
 * @param {Object} options named options for the function
 * @param {String} options.url The initial URL to fetch
 * @param {Object} options.fetchOptions The set of options that will be passed
 *   to UrlFetchApp.fetch
 * @param {function(Response)} options.handleResponse Callback function. Called
 *   with the Response object once for each page.
 * @param {function(Response): (String?)} options.getNextUrl function to get
 *   the URL for the next page. Called with the Response object of the current
 *   page. Should return the URL for the next page, or null when there are no
 *   more pages. See githubApiV3getNextUrl for an example.
 */
function getPaginated(options) {
  var url = options.url,
    fetchOptions = options.fetchOptions,
    handleResponse = options.handleResponse,
    getNextUrl = options.getNextUrl;

  while (url) {
    var response = UrlFetchApp.fetch(url, fetchOptions);
    handleResponse(response);
    url = getNextUrl(response);
  }
}

/**
 * Repeatedly fetch a URL for a paginated API. Assume that the response is a
 * JSON Array, and invoke a callback function once per element in that array,
 * for each page in the paginated response.
 *
 * @param {Object} options named options for the function
 * @param {String} options.url The initial URL to fetch
 * @param {Object} options.fetchOptions The set of options that will be passed
 *   to UrlFetchApp.fetch
 * @param {function(Object)} options.handleRow Callback function. Called
 *   multiple times per page; once for each row in the page's response.
 * @param {function(Response): (String?)} options.getNextUrl function to get
 *   the URL for the next page. Called with the Response object of the current
 *   page. Should return the URL for the next page, or null when there are no
 *   more pages. See githubApiV3getNextUrl for an example.
 */
function getPaginatedRows(options) {
  var handleRow = options.handleRow;

  return getPaginated({
    url: options.url,
    fetchOptions: options.fetchOptions,
    getNextUrl: options.getNextUrl,
    handleResponse: function(response) {
      var body = JSON.parse(response);
      if (!(body instanceof Array)) {
        throw new Error("API didn't return a Javascript Array");
      } else {
        body.forEach(handleRow);
      }
    },
  });
}

/**
 * An exception type that will be seen by all users. See
 * https://developers.google.com/datastudio/connector/error-handling#non-admin-messages
 * for details.
 *
 * @param {String} message The message to attach to the exception
 * @return {Error} A new Error object with the given string, with DS_USER:
 *   prepended (see the linked docs for details about this prefix).
 */
function UserError(message) {
  return new Error('DS_USER:' + message);
}

/**
 * Ensure that a subconnector has all the required methods and properties
 * required for use in combineConnectors. Checks that it has getData, getSchema,
 * and a label property. Also checks that it *doesn't* have a getConfig
 * property, as getConfig is handled by combineConnectors, not the individual
 * subconnectors.
 *
 * @param {Object} subconnector the subconnector to validate
 * @throws {Error} If the subconnector fails validation, an Error is thrown.
 */
function validateSubconnector(subconnector) {
  if (!subconnector) throw new Error('You provided a falsey connector');

  if (!(subconnector.getData instanceof Function))
    throw new Error('subconnector requires .getData()');

  if (!(subconnector.getSchema instanceof Function))
    throw new Error('subconnector requires .getSchema()');

  if (typeof subconnector.label !== 'string')
    throw new Error('subconnector requires a .label');

  if (subconnector.getConfig instanceof Function)
    throw new Error(
      'subconnector should NOT have .getConfig(); this is handled by combineConnectors'
    );
}

/**
 * Combine a set of partial subconnectors into a single connector interface.
 * Each partial subconnector should have its own schema and data model, but they
 * should all share the same config.
 *
 * This function returns an object with 3 functions: getConfig, getSchema, and
 * getData, which should be exported globally in your apps script project so
 * that the community connector can use them. The getConfig function is modified
 * to return an additional "Data Type" config field, which allows the consumer
 * of the connector to select which underlying connector they want to use. For
 * example, if you're creating a G Suite connector, you could use this function
 * with subconnectors that retreive a user's emails, calendar events, contacts,
 * and so on, with a single getConfig that specifies the user to examine.
 *
 * @param {Object} options The arguments to this functiom. For readability,
 *   these are passed as an object (see following params for details)
 *
 * @param  {!Function} options.getConfig getConfig function, which is shared
 *   among all subconnectors.
 *
 * @param  {!Object<string, {getSchema, getData, label}>} options.connectors
 *   an object containing subconnectors to use. Each property of the
 *   connectors argument should be an object with a getSchema method, a getData
 *   method, and a label. When the global connector's getSchema and getData
 *   functions are called, the request is routed to the appropriate connector,
 *   based on request.configParams. The method is called directly on the
 *   connector object, so feel free to use `this` methods in your functions.
 *
 * @param {!Function} options.validateConfig if given, this function will be
 *   used to validate incoming configs from the user. It will be called before
 *   getSchema and getData with request.configParams. It should throw an
 *   exception on validation errors.
 *
 * @return {!{getSchema, getData, getConfig}} Returns the 3 primary community
 *   connector methods, which can be set directly in your global namespace to
 *   export them to the Apps Script community connector interface.
 *
 * @example
 *
 * gsuiteConnector = combineConnectors({
 *   getConfig(request) {
 *     // Configuration parameters to specify a single G Suite user
 *   }
 *   connectors: {
 *     gmails: {
 *      label: "Gmail threads"
 *      getSchema(request) {
 *        // Schema for gmail
 *      }
 *      getData(request) {
 *        // Data for gmail
 *      }
 *     }
 *     contacts: {
 *       getSchema(request) {
 *         // Schema for contacts
 *       }
 *       getData(request) {
 *         // Data for contacts
 *       }
 *     }
 *   }
 * })
 *
 * // Set the functions globally so that Apps Script is aware of them
 * var getConfig = gsuiteConnector.getConfig
 * var getSchema = gsuiteConnector.getSchema
 * var getData = gsuiteConnector.getData
 */
function combineConnectors(options) {
  var getUserConfig = options.getConfig,
    connectors = options.connectors,
    validateConfig = options.validateConfig;

  for (var connectorKey in connectors) {
    try {
      validateSubconnector(connectors[connectorKey]);
    } catch (e) {
      throw new Error(
        'problem with subconnector ' + connectorKey + ': ' + e.message
      );
    }
  }

  var connectorOptionKey = 'combineConnectors__connectorSelection';
  var connectorOptionDef = {
    type: 'SELECT_SINGLE',
    name: connectorOptionKey,
    displayName: 'Data Type',
    helpText: 'Select the type of data you want.',
    options: Object.keys(connectors).map(function(connectorKey) {
      return {
        value: connectorKey,
        label: connectors[connectorKey].label,
      };
    }),
  };

  var getConfig = function getConfig(request) {
    var userConfig = getUserConfig(request);
    return {
      configParams: userConfig.configParams.concat([connectorOptionDef]),
      dateRangeRequired: userConfig.dateRangeRequired,
    };
  };

  var getConnector = function getConnector(request) {
    return connectors[request.configParams[connectorOptionKey]];
  };

  var validateFullConfig = function validateFullConfig(configParams) {
    if (validateConfig) validateConfig(configParams);

    if (!connectors[configParams[connectorOptionKey]]) {
      throw new UserError(
        'Invalid Connector selected: ' + configParams[connectorOptionKey]
      );
    }
  };

  var getSchema = function getSchema(request) {
    validateFullConfig(request.configParams);
    return getConnector(request).getSchema(request);
  };

  var getData = function getData(request) {
    validateFullConfig(request.configParams);
    return getConnector(request).getData(request);
  };

  return {
    getConfig: getConfig,
    getSchema: getSchema,
    getData: getData,
  };
}

/**
 * GITHUB-SPECIFIC UTILITY STUFF
 */

/**
 * Create a full, safely encoded URL for a specific github repository API call.
 * Effectively returns:
 *
 * https://api.github.com/repos/{organization}/{repository}/{endpoint}?{query}
 *
 * Each of the components are escaped with encodeURIComponent. In addition, the
 * query should be a key-value object containing query parameters, which are
 * encoded with encodeQuery.
 *
 * @param {Object} options The options for the URL
 * @param  {!string} options.organization The organization to query
 * @param  {!string} options.repository   The repository to query
 * @param  {!string} options.endpoint     The API endpoint to call
 * @param  {Object<string, string>} options.query optionally, the query
 *   parameters to append to the URL, in the form of key-value object.
 *   These are encoded into the standard ?a=b&c=d format with encodeQuery.
 * @return {string} The complete github API URL
 */
function githubRepoApiUrl(options) {
  var organization = options.organization,
    repository = options.repository,
    endpoint = options.endpoint,
    query = options.query;

  var path = [organization, repository, endpoint]
    .map(encodeURIComponent)
    .join('/');

  return 'https://api.github.com/repos/' + path + encodeQuery(query);
}

var _githubApiV3NextUrlPattern = /<([^>]+)>; rel="next"/;
/**
 * Given a response from a github v3 paginated API, examine the headers and
 * return the URL for the next page, or null if there is no next page.
 * @param  {Response} response The response from the github API
 * @return {?String}          The URL of the next page, or null
 */
function githubApiV3getNextUrl(response) {
  var headers = response.getAllHeaders();
  var linkHeaders = headers['Link'] || [];
  if (typeof linkHeaders === 'string') {
    // make it where it's always an array, even if there is only 1 response.
    linkHeaders = [linkHeaders];
  }
  for (var j = 0; j < linkHeaders.length; j++) {
    var link = linkHeaders[j];
    if (!link) continue;

    var match = link.match(_githubApiV3NextUrlPattern);
    if (!match) continue;

    return match[1];
  }
  return null;
}

/**
 * GITHUB ISSUES CONNECTOR
 */

var githubIssuesConnector = applyGetSchema({
  label: 'Issues',
  schema: [
    {
      name: 'number',
      label: 'Number',
      description: 'The issue number',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'NUMBER',
        semanticGroup: 'ID',
      },
    },
    {
      name: 'title',
      label: 'Title',
      description: 'The title of the issue',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'TEXT',
      },
    },
    {
      name: 'open',
      label: 'Open',
      description: 'True if the issue is open, false if closed',
      dataType: 'BOOLEAN',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'BOOLEAN',
      },
    },
    {
      name: 'url',
      label: 'URL',
      description: 'URL of the issue',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'URL',
      },
    },
    {
      name: 'reporter',
      label: 'Reporter',
      description: 'Username of the user who reported the issue',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'locked',
      label: 'Locked',
      description: 'True if the issue is locked',
      dataType: 'BOOLEAN',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'BOOLEAN',
      },
    },
    {
      name: 'num_comments',
      label: 'Number of Comments',
      description: 'Number of comments on the issue',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        semanticType: 'NUMBER',
        semanticGroup: 'NUMERIC',
      },
    },
    {
      name: 'is_pull_request',
      label: 'Pull Request',
      description: 'True if this issue is a Pull Request',
      dataType: 'BOOLEAN',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'BOOLEAN',
      },
    },
    {
      name: 'created_at',
      label: 'Creation Time',
      description: 'The date and time that this issue was created',
      dataType: 'STRING',
      semantics: {
        semanticType: 'YEAR_MONTH_DAY_HOUR',
        semanticGroup: 'DATETIME',
      },
    },
    {
      name: 'closed_at',
      label: 'Close Time',
      description: 'The date and time that this issue was closed',
      dataType: 'STRING',
      semantics: {
        semanticType: 'YEAR_MONTH_DAY_HOUR',
        semanticGroup: 'DATETIME',
      },
    },
  ],

  getData: function getData(request) {
    var self = this;

    var organization = request.configParams.organization,
      repository = request.configParams.repository;

    var fieldNames = request.fields.map(function(field) {
      return field.name;
    });

    var result = [];

    getPaginatedRows({
      url: githubRepoApiUrl({
        organization: organization,
        repository: repository,
        endpoint: 'issues',
        query: {
          state: 'all',
          per_page: 100,
        },
      }),
      fetchOptions: {
        headers: {
          Accept: 'application/vnd.github.v3.full+json',
          Authorization: 'token ' + getOAuthService().getAccessToken(),
        },
      },
      handleRow: function(issueBlob) {
        result.push({
          values: fieldNames.map(function(fieldName) {
            return self.getFieldFromBlob(issueBlob, fieldName);
          }),
        });
      },
      getNextUrl: githubApiV3getNextUrl,
    });

    return {
      cachedData: false,
      schema: fieldNames.map(function(fieldName) {
        return self.keyedSchema[fieldName];
      }),
      rows: result,
    };
  },

  fieldGetters: {
    open: function open(issueBlob) {
      return issueBlob.state === 'open';
    },
    reporter: function reporter(issueBlob) {
      return issueBlob.user.login;
    },
    num_comments: function num_comments(issueBlob) {
      return issueBlob.comments;
    },
    is_pull_request: function is_pull_request(issueBlob) {
      return issueBlob.pull_request !== undefined;
    },
    created_at: function created_at(issueBlob) {
      return formatDate(issueBlob.created_at);
    },
    closed_at: function closed_at(issueBlob) {
      return formatDate(issueBlob.closed_at);
    },
  },

  getFieldFromBlob: function getFieldFromBlob(issueBlob, fieldName) {
    var getter = this.fieldGetters[fieldName];
    return getter ? getter(issueBlob) : issueBlob[fieldName];
  },
});

/**
 * GITHUB STARS CONNECTOR
 */

var githubStarsConnector = applyGetSchema({
  label: 'Stars',
  schema: [
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
  ],

  sampleData: [
    {
      starred_at: '2017-05-31-T12:50:00Z',
    },
  ],

  /** @const */
  STARRED_AT: 'starred_at',

  /** @const */
  LINK_KEY: 'Link',

  /** @const */
  RESULTS_PER_PAGE: 100,

  /**
   * Returns a dynamic schema that only contains fields that were in the request.
   *
   * @param {object} request - The request passed to `this.getData(request)`.
   *
   * @return {obj} The schema keyed by `schemaEntry.name`.
   */
  getDataSchema: function getDataSchema(request) {
    var self = this;

    // this.keyedSchema is created by applyGetSchema
    return request.fields.map(function(field) {
      return self.keyedSchema[field.name];
    });
  },

  /**
   * Transforms the star data into rows appropriate for Data Studio.
   *
   * @param {obj} stars - The starData built from the requests.
   * @param {obj} dataSchema - The dynamic schema that contains the correct fields.
   *
   * @return {array} Array of objects formatted for data studio use.
   */
  rowifyStarData: function rowifyStarData(stars, dataSchema) {
    return stars.map(function(starData) {
      var values = [];
      // Build a row that includes each schema field
      dataSchema.forEach(function(field) {
        switch (field.name) {
          case 'stars':
            return values.push(1);
          case 'starred_at':
            return values.push(starData[this.STARRED_AT]);
          default:
            return values.push('');
        }
      });
      // Individual row format.
      // { values: ["017-10-13T11:52:44Z", 1]}
      return {values: values};
    });
  },

  paginatedResult: function paginatedResult(request, url) {
    var options = {
      headers: {
        Accept: 'application/vnd.github.v3.star+json',
        Authorization: 'token ' + getOAuthService().getAccessToken(),
      },
    };

    var responses = [];

    getPaginatedRows({
      url: url,
      fetchOptions: options,
      handleRow: function(row) {
        responses.push(row);
      },
      getNextUrl: githubApiV3getNextUrl,
    });

    return responses;
  },

  getData: function getData(request) {
    var url = githubRepoApiUrl({
      organization: request.configParams.organization,
      repository: request.configParams.repository,
      endpoint: 'stargazers',
      query: {
        per_page: 100,
      },
    });

    var stars = [];

    if (
      request.scriptParams &&
      request.scriptParams.sampleExtraction === true
    ) {
      stars = this.sampleData;
    } else {
      stars = this.paginatedResult(request, url);
    }

    var dataSchema = this.getDataSchema(request);

    return {
      schema: dataSchema,
      rows: this.rowifyStarData(stars, dataSchema),
    };
  },
});

/**
 * MERGED CONNECTOR
 */

var githubConnector = combineConnectors({
  getConfig: makeGetConfig([
    {
      name: 'organization',
      displayName: 'Organization',
      helpText:
        'The name of the organization (or user) that owns the repository',
      placeholder: 'google',
    },
    {
      name: 'repository',
      displayName: 'Repository',
      helpText: 'The name of the repository you want issues from',
      placeholder: 'datastudio',
    },
  ]),

  validateConfig: function validateConfig(configParams) {
    configParams = configParams || {};

    if (!configParams.organization)
      throw new UserError(
        'You must provide an Organization; got ' + configParams.organization
      );

    if (!configParams.repository)
      throw new UserError(
        'You must provide a Repository, got ' + configParams.repository
      );
  },

  connectors: {
    issues: githubIssuesConnector,
    stars: githubStarsConnector,
  },
});

var getConfig = githubConnector.getConfig;
var getSchema = githubConnector.getSchema;
var getData = githubConnector.getData;

/**
 * AUTH STUFF
 */

function getAuthType() {
  return {
    type: 'OAUTH2',
  };
}

function getOAuthService() {
  var scriptProps = PropertiesService.getScriptProperties();
  return OAuth2.createService('github')
    .setAuthorizationBaseUrl('https://github.com/login/oauth/authorize')
    .setTokenUrl('https://github.com/login/oauth/access_token')
    .setClientId(scriptProps.getProperty('OAUTH_CLIENT_ID'))
    .setClientSecret(scriptProps.getProperty('OAUTH_CLIENT_SECRET'))
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction('authCallback');
}

function authCallback(request) {
  return getOAuthService().handleCallback(request)
    ? HtmlService.createHtmlOutput('Success! You can close this tab.')
    : HtmlService.createHtmlOutput('Denied. You can close this tab');
}

function isAuthValid() {
  return getOAuthService().hasAccess();
}

// The first reset is for singleton, which returns the underlying service.
function resetAuth() {
  var auth = getOAuthService.reset();
  return getOAuthService.reset().reset();
}

function get3PAuthorizationUrls() {
  return getOAuthService().getAuthorizationUrl();
}

function isAdminUser() {
  return false;
}
