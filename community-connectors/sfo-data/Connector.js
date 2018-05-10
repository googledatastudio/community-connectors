/** @const */
var CUSTOM_CONFIG = [
  // blank because I don't need custom config
];

/** @const */
var LOG_ENABLED = false;

/** @const */
var AUTH_TYPE = 'none';

/**
 * Constructor for creating a Connector.
 */
function Connector() {
  AbstractConnector.call(this, CUSTOM_CONFIG, LOG_ENABLED, AUTH_TYPE);
}

Connector.prototype = Object.create(AbstractConnector.prototype);
Connector.prototype.constructor = Connector;

/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} request - The request passed to `AbstractConnector.getData(request)`.
 * @return {Object} Updated Config parameters.
 */
Connector.prototype.validateConfig = function(request) {
  return request;
};

/**
 * This checks whether the current user is an admin user of the AbstractConnector.
 *
 * @return {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the AbstractConnector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the AbstractConnector.
 */
Connector.prototype.isAdminUser = function() {
  return false;
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request - Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
Connector.prototype.getData = function(request) {
  this.validateConfig(request);
  var dataSchema = this.getDataSchema(request);

  var url = 'https://data.sfgov.org/resource/rptz-7xyh.json?$limit=50000';

  var response = JSON.parse(this.fetch(url));
  var data = [];
  response.forEach(function(row) {
    var values = [];

    dataSchema.forEach(function(field) {
      if (field.name in row) {
        values.push(row[field.name]);
      } else {
        values.push('');
      }
    }); // end of dataSchema forEach
    data.push({
      values: values,
    });
  }); // end of response forEach

  var results = {schema: dataSchema, rows: data};
  return results;
};

var module = module || {};
module.exports = Connector;
