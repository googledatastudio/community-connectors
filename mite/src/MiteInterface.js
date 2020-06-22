var cc = DataStudioApp.createCommunityConnector();

/**
 * A wrapper that mocks simple Mite APIs (e.g. Users, Projects, Customers, Services) for the Google Data Studio connector.
 * It supports both, active and archived data retrieval. The API will be selected based on request dimensions filter for "Archived".
 *
 * @constructor
 * @param {function()} dimensionsCallback - a callback that retrieves the dimensions supported by the mocked Mite API
 * @param {function()} metricsCallback - a callback that retrieves the metrics supported by the mocked Mite API
 * @param {string} tag - the JSON tag name used by the mocked Mite API
 * @param {string} api - the relative path for active (non-archived) data handled by the mocked Mite API.
 * @param {string} apiArchived - the relative path for archived (inactive) data handled by the mocked Mite API.
 * @returns {MiteInterface} the connector wrapper for the mocked Mite API
 */
function MiteInterface(
  dimensionsCallback,
  metricsCallback,
  tag,
  api,
  apiArchived
) {
  this.dimensionsCallback = dimensionsCallback;
  this.metricsCallback = metricsCallback;
  this.tag = tag;
  this.api = api;
  this.apiArchived = apiArchived;

  return this;
}

/**
 * Get all dimensions supported by the mocked Mite API.
 *
 * @param {MiteInterface} this
 * @returns {Array} an array of fields given in JSON object notation
 */
MiteInterface.prototype.getDimensions = function () {
  return this.dimensionsCallback ? this.dimensionsCallback() : [];
};

/**
 * Get all metrics supported by the mocked Mite API.
 *
 * @param {MiteInterface} this
 * @returns {Array} an array of fields given in JSON object notation
 */
MiteInterface.prototype.getMetrics = function () {
  return this.metricsCallback ? this.metricsCallback() : [];
};

/**
 * Get the full data schema supported by the mocked Mite API; including dimensions and metrics.
 *
 * @param {MiteInterface} this
 * @returns {Array} an array of fields given in JSON object notation
 */
MiteInterface.prototype.getSchema = function () {
  return this.getDimensions().concat(this.getMetrics());
};

/**
 * Scans the data schema for key-value mappings. Key-value mappings are indicated by the key value (e.g. user_name: {key: user_id}).
 *
 * @param {MiteInterface} this
 * @returns {object} a dictionary having the original fields as keys and the mapped fields as values
 */
MiteInterface.prototype.getFieldMappings = function () {
  return this.getSchema()
    .filter((field) => field.hasOwnProperty("api"))
    .reduce((mappings, field) => ({ ...mappings, [field.id]: field.api }), {});
};

/**
 * Get the data schema (all fields) in a format that is supported by Google Data Studio.
 *
 * @param {MiteInterface} this
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the fields in Google Data Studio format
 */
MiteInterface.prototype.getFields = function (request) {
  var fields = cc.getFields();

  var dimensions = this.getDimensions();
  var metrics = this.getMetrics();
  dimensions.forEach((dimension) =>
    fields
      .newDimension()
      .setId(dimension.id)
      .setName(dimension.name)
      .setType(dimension.type)
  );
  metrics.forEach((metric) =>
    fields
      .newMetric()
      .setId(metric.id)
      .setName(metric.name)
      .setType(metric.type)
      .setAggregation(metric.aggregation)
  );

  var defaultDimension = dimensions.find(
    (field) => field.hasOwnProperty("isDefault") && field.isDefault == true
  );
  var defaultMetric = metrics.find(
    (field) => field.hasOwnProperty("isDefault") && field.isDefault == true
  );

  if (defaultDimension) fields.setDefaultDimension(defaultDimension.id);
  if (defaultMetric) fields.setDefaultMetric(defaultMetric.id);

  return fields;
};

/**
 * Get the JSON tag (e.g. element name) that is being used by the mocked Mite API.
 *
 * @param {MiteInterface} this
 * @returns {string} the JSON tag name
 */
MiteInterface.prototype.getTag = function () {
  return this.tag;
};

/**
 * Converts the original value towards the desired data type.
 *
 * @param {MiteInterface} this
 * @param {object} value - the original value
 * @param {string} id - the field id or name
 * @returns {object} the converted value
 */
MiteInterface.prototype.convertValue = function (value, id) {
  switch (id) {
    default:
      // value will be converted automatically
      return value[id];
  }
};

/**
 * Scans the data request for configurations, date ranges and filters that might be supported by the API (low-level).
 * It will add relevant HTTP GET query parameters to a set of params.
 *
 * @param {MiteInterface} this
 * @param {object} request - the current (e.g. original) data request
 * @returns {object} newly created HTTP GET parameters as a dictionary including date ranges and pagination but excluding low-level API/query filters
 */
MiteInterface.prototype.getParams = function (request) {
  var schema = this.getSchema();
  var params;

  if (request) {
    if (request.pagination) {
      // pagination={startRow=1.0, rowCount=100.0} --> see limit + page in Mite API
      params = {
        limit: request.pagination.rowCount,
        page: Math.floor(
          (request.pagination.rowCount + request.pagination.startRow) /
            request.pagination.rowCount
        ),
      };
    } else params = {};
  } else {
    // preview only
    params = {
      limit: 20,
    };
  }

  return params;
};

/**
 * Retrieves the data from the Mite API with the given HTTP GET query parameters. Data is returned in
 * its original JSON notation. No data caching, no data conversion, no filtering.
 * The Mite API (URL) is selected based on request dimensions filter for "Archived".
 *
 * @param {MiteInterface} this
 * @param {object} credentials - the credentials holding the domain and the API key.
 * @param {object} params - HTTP GET parameters as a dictionary that may include low-level API/query filters and date ranges
 */
MiteInterface.prototype.getJson = function (credentials, params) {
  // check if the params are containing the archived filter
  var showArchivedOnly = params && params.archived == true;
  var api = this.api;
  if (showArchivedOnly) {
    delete params.archived;
    api = this.apiArchived;
  }

  var response = miteGet(credentials.domain, credentials.key, api, params);
  return response.json;
};
