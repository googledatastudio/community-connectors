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
 * @fileoverview Community Connector for Stack Overflow Questions. This can
 * retrieve questions for a specified tag from StackOverflow. Users can also
 * limit the number of results (max 100) and the sort order for results.
 *
 */

/** Define namespace */
var connector = connector || {};

/** @const */
connector.API_KEY = 'mvc7LGl6DPrONLRHo4)lYQ((';

/** @const */
connector.defaultTag = 'google-data-studio';

/**
 * Apps Script Cache expiration time (in seconds) for UrlFetch response.
 * @const
 */
connector.cacheExpiration = 1 * 60;

/** @const */
connector.cacheTag = 'ulrFetch-results';

/** @const */
connector.customConfig = [
  {
    type: 'INFO',
    name: 'Unique1',
    text:
      'Enter the tag you want to search for in StackExchange, the maximum result count, and the sorting method.'
  },
  {
    type: 'TEXTINPUT',
    name: 'tagged',
    displayName: 'Tag',
    helpText: 'Enter the tag you want to search for',
    placeholder: connector.defaultTag
  },
  {
    type: 'TEXTINPUT',
    name: 'pagesize',
    displayName: 'Result Count (max 100)',
    helpText: 'Enter how many questions should be shown',
    placeholder: '20'
  },
  {
    type: 'SELECT_SINGLE',
    name: 'sort',
    displayName: 'Sort',
    helpText: 'Enter the sorting method for results',
    options: [
      {
        label: 'activity (default)',
        value: 'activity'
      },
      {
        label: 'votes',
        value: 'votes'
      },
      {
        label: 'creation',
        value: 'creation'
      }
    ]
  }
];

/** @const */
connector.schema = [
  {
    name: 'owner.display_name',
    label: 'Question Owner',
    description: 'The display name of the question owner.',
    dataType: 'STRING',
    semantics: {
      semanticType: 'TEXT',
      semanticGroup: 'TEXT',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'owner.reputation',
    label: "Owner's reputation",
    description: 'The reputation of the question owner.',
    dataType: 'NUMBER',
    semantics: {
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'is_answered',
    label: 'Answered',
    description: 'Whether or not the question is answered.',
    dataType: 'BOOLEAN',
    semantics: {
      semanticType: 'BOOLEAN',
      semanticGroup: 'BOOLEAN',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'title',
    label: 'Title',
    description: "The question's title.",
    dataType: 'STRING',
    semantics: {
      semanticType: 'TEXT',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'link',
    label: 'Link',
    description: 'A link to the question.',
    dataType: 'STRING',
    semantics: {
      semanticType: 'URL',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'view_count',
    label: 'View Count',
    description: 'How many views the question has received.',
    dataType: 'NUMBER',
    semantics: {
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'answer_count',
    label: 'Answer Count',
    description: 'How many answers the question has received.',
    dataType: 'NUMBER',
    semantics: {
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'score',
    label: 'Score',
    description: 'The score of the question.',
    dataType: 'NUMBER',
    isDefault: true,
    semantics: {
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'question_id',
    label: 'Question ID',
    description: 'The id of the question.',
    dataType: 'NUMBER',
    semantics: {
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'last_activity_date',
    label: 'Last Activity Date',
    description: 'When the last activity on the question happened.',
    dataType: 'STRING',
    isDefault: true,
    semantics: {
      semanticType: 'YEAR_MONTH_DAY',
      semanticGroup: 'DATE_TIME',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'creation_date',
    label: 'Creation Date',
    description: 'When the question was created.',
    dataType: 'STRING',
    semantics: {
      semanticType: 'YEAR_MONTH_DAY',
      semanticGroup: 'DATE_TIME',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'last_edit_date',
    label: 'Last Edit Date',
    description: 'When the question was last edited.',
    dataType: 'STRING',
    semantics: {
      semanticType: 'YEAR_MONTH_DAY',
      semanticGroup: 'DATE_TIME',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'question_count',
    label: 'Question Count',
    description: 'Count of questions.',
    dataType: 'NUMBER',
    formula: 'COUNT_DISTINCT(question_id)',
    semantics: {
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      conceptType: 'METRIC'
    }
  }
];

/** @const */
connector.logEnabled = false;

/**
 * Wrapper function for `connector.getAuthType()`
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  return connector.logAndExecute('getAuthType', null);
}

/**
 * Wrapper function for `connector.getConfig()`
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  return connector.logAndExecute('getConfig', request);
}

/**
 * Wrapper function for `connector.getSchema()`
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  return connector.logAndExecute('getSchema', request);
}

/**
 * Wrapper function for `connector.getData()`
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  return connector.logAndExecute('getData', request);
}

/**
 * Wrapper function for `connector.isAdminUser()`
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
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * Required function for Community Connector.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
connector.getAuthType = function() {
  var response = {type: 'NONE'};
  return response;
};

/**
 * Returns the user configurable options for the connector.
 *
 * Required function for Community Connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
connector.getConfig = function(request) {
  var config = {
    configParams: connector.customConfig
  };
  return config;
};

/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} configParams Config parameters from `request`.
 * @returns {Object} Updated Config parameters.
 */
connector.validateConfig = function(configParams) {
  configParams = configParams || {};
  configParams.tagged = configParams.tagged || connector.defaultTag;
  configParams.pagesize = Math.min(configParams.pagesize, 100) || 100;
  configParams.sort = configParams.sort || 'activity';
  return configParams;
};

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
connector.getSchema = function(request) {
  return {schema: connector.schema};
};

/**
 * Takes date input in Unix epoch and return in YYYYMMDD format. Returns '' if
 * input is undefined or null.
 *
 * @param {int} date Unix epoch.
 * @returns {string} Date in YYYYMMDD format.
 */
connector.formatDate = function(date) {
  if (!date) {
    return '';
  }
  var dateObj = new Date(date * 1000);
  return dateObj
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
};

/**
 * Gets cached response for UrlFetch. If the response has not been cached, make
 * the UrlFetch call, then cache and return the response.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} The response text for UrlFetch.
 */
connector.getCachedData = function(request) {
  var cache = CacheService.getUserCache();
  var cachedData = cache.get(connector.cacheKey);

  if (cachedData !== null) {
    var response = cachedData;
  } else {
    var url = [
      'https://api.stackexchange.com/2.2/questions?site=stackoverflow&key=',
      connector.API_KEY,
      '&tagged=',
      request.configParams.tagged,
      '&pagesize=',
      request.configParams.pagesize,
      '&sort=',
      request.configParams.sort
    ];

    try {
      var response = UrlFetchApp.fetch(url.join(''));
    } catch (e) {
      connector.throwError('Unable to get data from StackOverflow', true);
    }

    cache.put(connector.cacheKey, response, connector.cacheExpiration);
  }
  return response;
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
connector.getData = function(request) {
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < connector.schema.length; i++) {
      if (connector.schema[i].name == field.name) {
        return connector.schema[i];
      }
    }
  });

  request.configParams = connector.validateConfig(request.configParams);

  var responseString = connector.getCachedData(request);
  try {
    var response = JSON.parse(responseString).items;
  } catch (e) {
    connector.throwError('Unable to fetch data from source.', true);
  }

  var data = response.map(function(question) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'owner.display_name':
          values.push(question.owner.display_name);
          break;
        case 'owner.reputation':
          values.push(question.owner.reputation);
          break;
        case 'is_answered':
          values.push(question.is_answered);
          break;
        case 'title':
          values.push(question.title);
          break;
        case 'link':
          values.push(question.link);
          break;
        case 'view_count':
          values.push(question.view_count);
          break;
        case 'answer_count':
          values.push(question.answer_count);
          break;
        case 'score':
          values.push(question.score);
          break;
        case 'question_id':
          values.push(question.question_id);
          break;
        case 'last_activity_date':
          values.push(connector.formatDate(question.last_activity_date));
          break;
        case 'creation_date':
          values.push(connector.formatDate(question.creation_date));
          break;
        case 'last_edit_date':
          values.push(connector.formatDate(question.last_edit_date));
          break;
        default:
          values.push('');
      }
    });
    return {values: values};
  });

  return {
    schema: dataSchema,
    rows: data
  };
};

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message Error message to be shown in UI
 * @param {boolean} userSafe Indicates whether the error message can be shown to
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
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
connector.isAdminUser = function() {
  return true;
};

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName Function to be logged and executed.
 * @param {Object} parameter Parameter for the `functionName` function.
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
