/**
 * @fileoverview Community Connector for Serpstat domain history analysis and domain competitors analysis.
 * This connector helps retrieve analysis information for the selected domain and search engine from Serpstat.
 *
 */

/** 
* Define namespace 
*/
var connector = connector || {};

/**
 * Returns the user configurable options for the connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig() {
 return getSerpstatConfig();
}

/**
 * Returns the schema for the given request according to group name.
 *
 * @param request {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */

function getSchema(request) {
 request.configParams = validateConfig(request.configParams);
 var method = request.configParams.method;
 var fields = getSerpstatFields(method).build();
 return { schema: fields };
}
/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
 request.configParams = validateConfig(request.configParams);
 var method = request.configParams.method;

 var requestedFieldIds = request.fields.map(function(field) {
  return field.name;
 });
 var requestedFields = getSerpstatFields(method).forIds(requestedFieldIds);

 var serpstatData = new SerpstatData(request);
 var parsedResponse = serpstatData.fetchDataFromApi();

 var data = connector.getFormattedData(parsedResponse, requestedFields);

 return {
  schema: requestedFields.build(),
  rows: data
 };
}
/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the requestedFields
 *
 * @param {Object} parsedResponse The response string from external data source
 *     parsed into an object in a standard format.
 *
 * @param {Array} requestedFields The fields requested in the getData request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
connector.getFormattedData = function(parsedResponse, requestedFields) {
 var data = [];
 var formatted_data = parsedResponse.map(function(item) {
  return connector.formatData(requestedFields, item);
 });
 data = data.concat(formatted_data);
 return data;
};

/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
connector.formatData = function(requestedFields, response) {
 var values = [];
 requestedFields.asArray().forEach(function(field) {
  if (!!response[field.getId()]) {
   values.push(response[field.getId()]);
  } else {
   values.push('');
  }
 });

 return { values: values };
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
