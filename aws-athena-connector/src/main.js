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
  var response = { type: 'NONE' };
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

  config.newTextInput()
    .setId('awsAccessKeyId')
    .setName('AWS_ACCESS_KEY_ID');

  config.newTextInput()
    .setId('awsSecretAccessKey')
    .setName('AWS_SECRET_ACCESS_KEY');

  config.newTextInput()
    .setId('awsRegion')
    .setName('AWS Region')
    .setPlaceholder('us-east-1');

  config.newTextInput()
    .setId('databaseName')
    .setName('Glue Database Name')
    .setPlaceholder('e.g. default');

  config.newTextInput()
    .setId('tableName')
    .setName('Glue Table Name');

  config.newTextInput()
    .setId('outputLocation')
    .setName('Query Output Location')
    .setHelpText('S3 path to store the Athena query results')
    .setPlaceholder('s3://<bucket>/<directory>');

  config.newTextInput()
    .setId('dateRangeColumn')
    .setName('Date Range Column Name')
    .setHelpText('(Optional) If date range is applied in the report, the corresponding column to apply the filtering conditions.');

  config.newTextInput()
    .setId('rowLimit')
    .setName('Row Limit')
    .setHelpText('Maximum number of rows to fetch in each query. Default is 1000. If set to -1, all rows will be fetched.')
    .setPlaceholder('1000')
    .setAllowOverride(true);

  config.setDateRangeRequired(true);

  return config.build();
}

/**
 * Throws User-facing errors.
 *
 * @param  {string} message Error message.
 */
function throwUserError(message) {
  DataStudioApp.createCommunityConnector()
    .newUserError()
    .setText(message)
    .throwException();
}

/**
 * Validate config object and throw error if anything wrong.
 *
 * @param  {Object} configParams Config object supplied by user.
 */
function validateConfig(configParams) {
  configParams = configParams || {};
  if (!configParams.awsAccessKeyId) {
    throwUserError('AWS_ACCESS_KEY_ID is empty.');
  }
  if (!configParams.awsSecretAccessKey) {
    throwUserError('AWS_SECRET_ACCESS_KEY is empty.');
  }
  if (!configParams.awsRegion) {
    throwUserError('AWS Region is empty.');
  }
  if (!configParams.databaseName) {
    throwUserError('Database Name is empty.');
  }
  if (!configParams.tableName) {
    throwUserError('Table Name is empty.');
  }
  if (configParams.outputLocation.indexOf('s3://') !== 0) {
    throwUserError('Query Output Location must in the format of s3://<bucket>/<directory>');
  }
  if (configParams.rowLimit) {
    var rowLimit = parseInt(configParams.rowLimit);
    if (isNaN(rowLimit)) {
      throwUserError('Invalid Row Limit.');
    }
  }
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
    var fields = getFieldsFromGlue(request).build();
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
  validateConfig(request.configParams);
  try {
    var data = getDataFromAthena(request);
    return data;
  } catch (err) {
    throwUserError(err.message);
  }
}
