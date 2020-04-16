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
function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newTextInput()
    .setAllowOverride(false)
    .setId('resourceUsageDatasetID')
    .setName('Enter the fully-qualified name of the BigQuery dataset in which the GKE resource usage data resides')
    .setHelpText('A full-qualified BigQuery dataset name should be in format ${PROJECT_ID}.${DATASET_ID}')
    .setPlaceholder('${PROJECT_ID}.${DATASET_ID}');

  config
    .newTextInput()
    .setAllowOverride(false)
    .setId('gcpBillingExportTableID')
    .setName('Enter the fully-qualified name of the BigQuery table in which the GCP billing data is exported to')
    .setHelpText('A full-qualified BigQuery dataset name should be in format ${PROJECT_ID}.${DATASET_ID}.gcp_billing_export_v1_${BILLING_ACCOUNT_ID}')
    .setPlaceholder('${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}');

  config
    .newCheckbox()
    .setAllowOverride(false)
    .setId('consumptionMeteringEnabled')
    .setName('Check if you have enabled consumption-based usage metering')

  // This forces a date range object to be provided for `getData()` requests.
  // https://developers.google.com/apps-script/reference/data-studio/config#setDateRangeRequired(Boolean)
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
  var cc = DataStudioApp.createCommunityConnector();
  gkeUsageMetering.validateConfig(cc, request.configParams);

  return gkeUsageMetering.getSchema(request);
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  var resourceUsageDatasetID = (request.configParams && request.configParams.resourceUsageDatasetID)
  let authToken = ScriptApp.getOAuthToken();
  let endDate = request.dateRange.endDate;
  let gcpBillingExportTableID = request.configParams.gcpBillingExportTableID
  let startDate = request.dateRange.startDate;
  let billingProjectID = resourceUsageDatasetID.split('.')[0];
  let consumptionEnabled = request.configParams.consumptionMeteringEnabled
  let response = {
    authConfig: {
      accessToken: authToken
    },
    dataConfig: {
      type: 'BIGQUERY',
      bigQueryConnectorConfig: {
        billingProjectId: billingProjectID,
        query: gkeUsageMetering.generateSQLQuery(
            gcpBillingExportTableID,
            resourceUsageDatasetID,
            startDate,
            endDate,
            consumptionEnabled),
        useStandardSql: true
      }
    }
  };
  return response;
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
  return false;
}


