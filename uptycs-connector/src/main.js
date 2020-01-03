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
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  var response = { type: "NONE" };
  return response;
}

/**
 * Returns the user configurable options for the connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newTextInput()
    .setId("uptycs_url")
    .setName("Uptycs API URL")
    .setHelpText(
      "https://<tenant>.uptycs.io/public/api/customers/<customerid>."
    );

  config
    .newTextInput()
    .setId("authorization_bearer")
    .setName("Authorization Bearer JSON Web token without Bearer Key");

  config
    .newTextInput()
    .setId("database")
    .setName("Uptycs database ")
    .setHelpText("Uptycs database [global|realtime|timemachine]");

  config
    .newTextArea()
    .setId("sql_query")
    .setName("SQL Query");

  config.setDateRangeRequired(true);

  return config.build();
}

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  validateConfig(request.configParams);
  try {
    var ColumnJSON = UptycsExecute(request, "columns");
    var fields = UptycsQueryToFields(ColumnJSON).build();
    console.info(fields);
    return { schema: fields };
  } catch (err) {
    throwUserError(err.message);
  }
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var ColumnJSON = UptycsExecute(request, "columns");
  var fields = UptycsQueryToFields(ColumnJSON);
  var requestedFields = fields.forIds(requestedFieldIds);
  var schema = requestedFields.build();

  console.info(schema);
  try {
    var data = getDataFromUptycs(request, schema);
    return {
      schema: schema,
      rows: data
    };
  } catch (err) {
    throwUserError(err.message);
  }
}
