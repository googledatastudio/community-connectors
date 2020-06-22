var cc = DataStudioApp.createCommunityConnector();

/**
 * Mocks the Mite API for grouped time entries for the Google Data Studio connector.
 *
 * @constructor
 * @param {MiteTimeEntries} timeEntriesApi - the main API wrapper (for flat time entries)
 * @param {string} groupConfig - the flat string that indicates the configured grouping
 * @returns {MiteTimeEntriesGrouped} the connector wrapper for the Mite grouped time entries API
 */
function MiteTimeEntriesGrouped(timeEntriesApi, groupConfig) {
  this.api = timeEntriesApi;
  this.groups = groupConfig.split(",").map((group) => group.trim());

  return this;
}

/** @constant TAG - the JSON tag name used by the grouped Mite time entries API */
MiteTimeEntriesGrouped.TAG = "time_entry_group";

/** @constant GROUPBY_USER group by user */
const GROUPBY_USER = "user";

/** @constant GROUPBY_CUSTOMER group by customer */
const GROUPBY_CUSTOMER = "customer";

/** @constant GROUPBY_PROJECT group by project */
const GROUPBY_PROJECT = "project";

/** @constant GROUPBY_SERVICE group by service */
const GROUPBY_SERVICE = "service";

/** @constant GROUPBY_DAY group by day */
const GROUPBY_DAY = "day";

/** @constant GROUPBY_WEEK group by week */
const GROUPBY_WEEK = "week";

/** @constant GROUPBY_MONTH group by month */
const GROUPBY_MONTH = "month";

/** @constant GROUPBY_YEAR group by year */
const GROUPBY_YEAR = "year";

/** @constant GROUPBY_LOCKED group by locked/unlocked */
const GROUPBY_LOCKED = "locked";

/**
 * Gets all groups that are related to grouping by time (e.g. day, week, month and year).
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {Array} an array containing all groups that are related to grouping by time (e.g. day, week, month and year)
 */
MiteTimeEntriesGrouped.prototype.getTimeGroups = function () {
  return [GROUPBY_DAY, GROUPBY_WEEK, GROUPBY_MONTH, GROUPBY_YEAR];
};

/**
 * Indicates if the current configuation is grouped by time (e.g. day, week, month or year).
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {boolean} true if the current configuration is grouped by time (e.g. day, week, month or year); false else.
 */
MiteTimeEntriesGrouped.prototype.isGroupedByTime = function () {
  var times = this.getTimeGroups();
  return this.groups.some((group) => times.includes(group));
};

/**
 * Looks for the first group that is related to grouping by time (e.g. day, week, month or year).
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {string} The group if the current configuration is grouped by time (e.g. day, week, month or year); undefined else.
 */
MiteTimeEntriesGrouped.prototype.findTimeGroup = function () {
  var times = this.getTimeGroups();
  return this.groups.find((group) => times.includes(group));
};

/**
 * Gets all dimensions supported by the Mite time entries API.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteTimeEntriesGrouped.prototype.getDimensions = function () {
  var dimensions = this.api
    .getDimensions()
    .filter(
      (field) =>
        field.hasOwnProperty("group") && this.groups.includes(field.group)
    );

  var types = cc.FieldType;

  if (this.isGroupedByTime()) {
    var group = this.findTimeGroup();
    var field;
    switch (group) {
      case GROUPBY_DAY:
        field = {
          id: "day",
          name: "Day",
          isDefault: true,
          type: types.YEAR_MONTH_DAY,
        };
        break;
      case GROUPBY_WEEK:
        field = {
          id: "week",
          name: "Week",
          isDefault: true,
          type: types.YEAR_WEEK,
        };
        break;
      case GROUPBY_MONTH:
        field = {
          id: "month",
          name: "Month",
          isDefault: true,
          type: types.YEAR_MONTH,
        };
        break;
      case GROUPBY_YEAR:
        field = {
          id: "week",
          name: "Week",
          isDefault: true,
          type: types.YEAR,
        };
        break;
    }

    if (field) dimensions.push(field);
  } else {
    dimensions.push(
      {
        id: "from",
        name: "From",
        type: types.YEAR_MONTH_DAY,
      },
      {
        id: "to",
        name: "To",
        type: types.YEAR_MONTH_DAY,
      }
    );
  }
  return dimensions;
};

/**
 * Gets all metrics supported by the Mite time entries API.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteTimeEntriesGrouped.prototype.getMetrics = function () {
  return this.api.getMetrics();
};

/**
 * Get the full data schema supported by the Mite time entries API; including dimensions and metrics.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {Array} an array of fields given in JSON object notation
 */
MiteTimeEntriesGrouped.prototype.getSchema = function () {
  return this.getDimensions().concat(this.getMetrics());
};

/**
 * Scans the data schema for key-value mappings. Key-value mappings are indicated by the key value (e.g. user_name: {key: user_id}).
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {object} a dictionary having the original fields as keys and the mapped fields as values
 */
MiteTimeEntriesGrouped.prototype.getFieldMappings = function () {
  return this.getSchema()
    .filter((field) => field.hasOwnProperty("api"))
    .reduce((mappings, field) => ({ ...mappings, [field.id]: field.api }), {});
};

/**
 * Get the data schema (all fields) in a format that is supported by Google Data Studio.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the fields in Google Data Studio format
 */
MiteTimeEntriesGrouped.prototype.getFields = function (request) {
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
 * Get the JSON tag (e.g. element name) that is being used by the grouped Mite time entries API.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @returns {string} the JSON tag name
 */
MiteTimeEntriesGrouped.prototype.getTag = function () {
  return MiteTimeEntriesGrouped.TAG;
};

/**
 * Converts the original value towards the desired data type.
 * Especially, dates and times/durations are converted.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @param {object} value - the original value
 * @param {string} id - the field id or name
 * @returns {object} the converted value
 */
MiteTimeEntriesGrouped.prototype.convertValue = function (value, id) {
  switch (id) {
    case "from":
    case "to":
    case "day":
      var date = new Date(value[id]);
      return Utilities.formatDate(
        date,
        Session.getScriptTimeZone(),
        "yyyyMMdd"
      );
    case "week":
    case "month":
    case "year":
      // no conversion necessary since the original format fits the Google requirements; value will be recognized automatically
      return value[id];
    case "minutes":
      // convert minutes to seconds since data type duration is given in seconds only
      return value[id] * 60;
    default:
      // value will be converted automatically
      return value[id];
  }
};

/**
 * Scans the data request for configurations, date ranges and filters that are supported on the API (low-level).
 * It will add relevant HTTP GET query parameters to a set of params.
 *
 * @param {MiteTimeEntriesGrouped} this
 * @param {object} request - the current (e.g. original) data request
 * @returns {object} newly created HTTP GET parameters as a dictionary including date ranges and pagination but excluding low-level API/query filters
 */
MiteTimeEntriesGrouped.prototype.getParams = function (request) {
  var schema = this.getSchema();
  var params = this.api.getParams(request);

  if (params) params["group_by"] = this.groups;

  return params;
};

/**
 * Retrieves the data from the grouped Mite time entries API with the given HTTP GET query parameters. Data is returned in
 * its original JSON notation. No data caching, no data conversion, no filtering.
 * The Mite API (URL) is selected based on request dimensions filter for "Archived".
 *
 * @param {MiteTimeEntriesGrouped} this
 * @param {object} credentials - the credentials holding the domain and the API key.
 * @param {object} params - HTTP GET parameters as a dictionary that may include low-level API/query filters and date ranges
 */
MiteTimeEntriesGrouped.prototype.getJson = function (credentials, params) {
  return this.api.getJson(credentials, params);
};
