function AbstractConnector(customConfig, logEnabled, authType) {
  this.customConfig = customConfig;
  this.logEnabled = logEnabled;
  this.authType = authType;
}

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName - Function to be logged and executed.
 * @param {Object} parameter - Parameter for the `functionName` function.
 * @return {any} Returns the response of `functionName` function.
 */
AbstractConnector.prototype.logAndExecute = function(functionName, parameter) {
  if (this[functionName] === undefined) {
    this.throwError(
      'The function you are trying to log is not defined: ' + functionName,
      false
    );
  } else {
    if (this.logEnabled && this.isAdminUser()) {
      var paramString = JSON.stringify(parameter, null, 2);
      console.log([functionName, 'request', paramString]);
    }

    var returnObject = this[functionName](parameter);

    if (this.logEnabled && this.isAdminUser()) {
      var returnString = JSON.stringify(returnObject, null, 2);
      console.log([functionName, 'response', returnString]);
    }

    return returnObject;
  }
};

/**
 * Wraps the call to UrlFetchApp with error handling.
 *
 * @param {string} url The url to fetch.
 * @param {object} options The options to use for the fetch.
 */
AbstractConnector.prototype.fetch = function(url, options) {
  var result;
  try {
    options = options || {};
    result = UrlFetchApp.fetch(url, options);
  } catch (e) {
    this.throwError(e);
  }
  return result;
};

AbstractConnector.prototype.getIndexedSchema = function() {
  return this.getSchema().schema.reduce(function(acc, schemaEntry) {
    var name = schemaEntry.name;
    acc[name] = schemaEntry;
    return acc;
  }, {});
};

/**
 * Returns a dynamic schema that only contains fields that were in the request.
 *
 * @param {object} request - The request passed to `AbstractConnector.getData(request)`.
 *
 * @return {obj} The schema keyed by `schemaEntry.name`.
 */
AbstractConnector.prototype.getDataSchema = function(request) {
  var indexedSchema = this.getIndexedSchema();

  var that = this;
  var dataSchema = [];
  request.fields.forEach(function(field) {
    if (field.name in indexedSchema) {
      dataSchema.push(indexedSchema[field.name]);
    } else {
      that.throwError(
        'A field was requested that was not in the schema: ' + field.name,
        false
      );
    }
  });
  return dataSchema;
};

/**
 * Returns the user configurable options for the AbstractConnector.
 *
 * Required function for Community AbstractConnector.
 *
 * @param {Object} request - Config request parameters.
 * @return {Object} AbstractConnector configuration to be displayed to the user.
 */
AbstractConnector.prototype.getConfig = function() {
  return {configParams: this.customConfig};
};

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request - Schema request parameters.
 * @return {Object} Schema for the given request.
 */
AbstractConnector.prototype.getSchema = function(request) {
  this.validateConfig(request);
  return new Schema().getSchema();
};

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message - Error message to be shown in UI.
 * @param {boolean} userSafe - Indicates whether the error message can be shown to
 *      regular users (as opposed to debug error messages meant for admin users
 *      only.)
 */
AbstractConnector.prototype.throwError = function(message, userSafe) {
  if (userSafe) {
    message = 'DS_USER:' + message;
  }
  console.log(message);
  throw new Error(message);
};

/**
 * Returns the authentication method required by the AbstractConnector to authorize the
 * third-party service.
 *
 * Required function for Community AbstractConnector.
 *
 * @return {Object} `AuthType` used by the AbstractConnector.
 */
AbstractConnector.prototype.getAuthType = function() {
  var response = {type: this.authType};
  return response;
};

// Needed for testing
var module = module || {};
module.exports = AbstractConnector;