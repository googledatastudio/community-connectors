var cc = DataStudioApp.createCommunityConnector();
var scriptProperties = PropertiesService.getScriptProperties();

function isAdminUser() {
  return false;
}

function getAuthType() {
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}

function getConfig(request) {
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('info')
    .setText(
      'No configuration is required for this connector. Click connect to create a new data source.'
    );

  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('country_name')
    .setName('Country')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('country_code')
    .setName('Country Code')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('indicator_name')
    .setName('Indicator')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('year')
    .setName('Year')
    .setType(types.YEAR);

  fields
    .newMetric()
    .setId('value')
    .setName('Value')
    .setType(types.NUMBER)
    .setIsReaggregatable(true)
    .setAggregation(aggregations.SUM);

  return fields;
}

function getSchema(request) {
  return {
    schema: getFields().build()
  };
}

var SERVICE_ACCOUNT_CREDS = 'SERVICE_ACCOUNT_CREDS';
var SERVICE_ACCOUNT_KEY = 'private_key';
var SERVICE_ACCOUNT_EMAIL = 'client_email';
var BILLING_PROJECT_ID = 'project_id';

/**
 * Copy the entire credentials JSON file from creating a service account in GCP.
 */
function getServiceAccountCreds() {
  return JSON.parse(scriptProperties.getProperty(SERVICE_ACCOUNT_CREDS));
}

function getOauthService() {
  var serviceAccountCreds = getServiceAccountCreds();
  var serviceAccountKey = serviceAccountCreds[SERVICE_ACCOUNT_KEY];
  var serviceAccountEmail = serviceAccountCreds[SERVICE_ACCOUNT_EMAIL];

  return OAuth2.createService('WorldBankHealthPopulation')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setPrivateKey(serviceAccountKey)
    .setIssuer(serviceAccountEmail)
    .setPropertyStore(scriptProperties)
    .setCache(CacheService.getScriptCache())
    .setScope(['https://www.googleapis.com/auth/bigquery.readonly']);
}

var FIELDS_WHITELIST = [
  'country_name',
  'country_code',
  'indicator_name',
  'year',
  'value'
];
var BASE_SQL =
  'SELECT {{FIELDS}} FROM `bigquery-public-data.world_bank_health_population.health_nutrition_population`';

function makeSQL(request) {
  // Create an object of {[fieldName]: boolean} to use as a constant time lookup.
  var simpleSet = FIELDS_WHITELIST.reduce(function(obj, field) {
    obj[field] = true;
    return obj;
  }, {});
  var requestFieldNames = request.fields.map(function(field) {
    return field.name;
  });
  var fieldNames = FIELDS_WHITELIST.filter(function(fieldName) {
    return simpleSet[fieldName];
  });
  var fieldsSQL = fieldNames.join(', ');
  return BASE_SQL.replace('{{FIELDS}}', fieldsSQL);
}

function getData(request) {
  var accessToken = getOauthService().getAccessToken();
  var serviceAccountCreds = getServiceAccountCreds();
  var billingProjectId = serviceAccountCreds[BILLING_PROJECT_ID];
  var sql = makeSQL(request);

  return cc
    .newBigQueryConfig()
    .setAccessToken(accessToken)
    .setBillingProjectId(billingProjectId)
    .setUseStandardSql(true)
    .setQuery(sql)
    .build();
}
