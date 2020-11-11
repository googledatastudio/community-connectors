var cc = DataStudioApp.createCommunityConnector();

/**
 * Mocks the Mite API for flat time entries for the Google Data Studio connector.
 *
 * @constructor
 * @returns {MiteTimeEntries} the connector wrapper for the Mite flat time entries API
 */
function MiteTimeEntries() {
  return this;
}

/** @constant API - the relative path for the Mite time entries API */
MiteTimeEntries.API = 'time_entries';

/** @constant TAG - the JSON tag name used by the flat Mite time entries API */
MiteTimeEntries.TAG = 'time_entry';

/**
 * Gets all dimensions supported by the Mite time entries API.
 *
 * @param {MiteTimeEntries} this
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteTimeEntries.prototype.getDimensions = function() {
  var types = cc.FieldType;

  return [
    {
      id: 'id',
      name: 'ID',
      type: types.NUMBER
    },
    {
      id: 'date',
      name: 'Date',
      api: 'date_at',
      type: types.YEAR_MONTH_DAY
    },
    {
      id: 'user_id',
      name: 'User ID',
      group: 'user',
      filter: true,
      type: types.NUMBER
    },
    {
      id: 'user',
      key: 'user_id',
      group: 'user',
      name: 'User',
      api: 'user_name',
      isDefault: true,
      type: types.TEXT
    },
    {
      id: 'note',
      name: 'Note',
      filter: true,
      type: types.TEXT
    },
    {
      id: 'project_id',
      name: 'Project ID',
      group: 'project',
      filter: true,
      type: types.NUMBER
    },
    {
      id: 'project',
      key: 'project_id',
      name: 'Project',
      group: 'project',
      api: 'project_name',
      type: types.TEXT
    },
    {
      id: 'service_id',
      name: 'Service ID',
      group: 'service',
      filter: true,
      type: types.NUMBER
    },
    {
      id: 'service',
      key: 'service_id',
      name: 'Service',
      group: 'service',
      api: 'service_name',
      type: types.TEXT
    },
    {
      id: 'customer_id',
      name: 'Customer ID',
      group: 'customer',
      filter: true,
      type: types.NUMBER
    },
    {
      id: 'customer',
      key: 'customer_id',
      name: 'Customer',
      group: 'customer',
      api: 'customer_name',
      type: types.TEXT
    },
    {
      id: 'billable',
      name: 'Billable',
      filter: true,
      type: types.BOOLEAN
    },
    {
      id: 'locked',
      name: 'Locked',
      group: 'locked',
      filter: true,
      type: types.BOOLEAN
    },
    {
      id: 'hourly_rate',
      name: 'Hourly rate',
      type: types.CURRENCY_EUR
    }
  ];
};

/**
 * Gets all metrics supported by the Mite time entries API.
 *
 * @param {MiteTimeEntries} this
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteTimeEntries.prototype.getMetrics = function() {
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  return [
    {
      id: 'time',
      name: 'Time',
      api: 'minutes',
      type: types.NUMBER,
      isDefault: true,
      aggregation: aggregations.SUM
    },
    {
      id: 'revenue',
      name: 'Revenue',
      type: types.YEAR_MONTH_DAY,
      aggregation: aggregations.SUM
    }
  ];
};

/**
 * Get the full data schema supported by the Mite time entries API; including dimensions and metrics.
 *
 * @param {MiteTimeEntries} this
 * @returns {Array} an array of fields given in JSON object notation
 */
MiteTimeEntries.prototype.getSchema = function() {
  return this.getDimensions().concat(this.getMetrics());
};

/**
 * Scans the data schema for key-value mappings. Key-value mappings are indicated by the key value (e.g. user_name: {key: user_id}).
 *
 * @param {MiteTimeEntries} this
 * @returns {object} a dictionary having the original fields as keys and the mapped fields as values
 */
MiteTimeEntries.prototype.getFieldMappings = function() {
  return this.getSchema()
    .filter((field) => field.hasOwnProperty('api'))
    .reduce(function(mappings, field) {
      mappings[field.id] = field.api;
    }, {});
  // .reduce((mappings, field) => ({...mappings, [field.id]: field.api }), {});
};

/**
 * Get the data schema (all fields) in a format that is supported by Google Data Studio.
 *
 * @param {MiteTimeEntries} this
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the fields in Google Data Studio format
 */
MiteTimeEntries.prototype.getFields = function(request) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  this.getDimensions().forEach((dimension) =>
    fields
      .newDimension()
      .setId(dimension.id)
      .setName(dimension.name)
      .setType(dimension.type)
  );

  // ToDo: type conversion to duration
  // fields.newMetric().setId('time').setName('Time').setType(types.DURATION).setAggregation(aggregations.SUM);
  fields
    .newMetric()
    .setId('time')
    .setName('Time')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);
  fields
    .newMetric()
    .setId('revenue')
    .setName('Revenue')
    .setType(types.CURRENCY_EUR)
    .setAggregation(aggregations.SUM);

  fields.setDefaultDimension('user');
  fields.setDefaultMetric('time');

  return fields;
};

/**
 * Get the JSON tag (e.g. element name) that is being used by the flat Mite time entries API.
 *
 * @param {MiteTimeEntries} this
 * @returns {string} the JSON tag name
 */
MiteTimeEntries.prototype.getTag = function() {
  return MiteTimeEntries.TAG;
};

/**
 * Converts the original value towards the desired data type.
 * Especially, dates and times/durations are converted.
 *
 * @param {MiteTimeEntries} this
 * @param {object} value - the original value
 * @param {string} id - the field id or name
 * @returns {object} the converted value
 */
MiteTimeEntries.prototype.convertValue = function(value, id) {
  switch (id) {
    case 'minutes':
      // convert minutes to seconds since data type duration is given in seconds only
      return value[id] * 60;
    case 'date_at':
      var date = new Date(value[id]);
      return Utilities.formatDate(
        date,
        Session.getScriptTimeZone(),
        'yyyyMMdd'
      );
    default:
      // value will be converted automatically
      return value[id];
  }
};

/**
 * Scans the data request for configurations, date ranges and filters that are supported on the API (low-level).
 * It will add relevant HTTP GET query parameters to a set of params.
 *
 * @param {MiteTimeEntries} this
 * @param {object} request - the current (e.g. original) data request
 * @returns {object} newly created HTTP GET parameters as a dictionary including date ranges and pagination but excluding low-level API/query filters
 */
MiteTimeEntries.prototype.getParams = function(request) {
  var schema = this.getSchema();
  var params;

  if (request) {
    /*
    apply request data range filter
    https://mite.yo.lk/api/zeiten.html#list-all
    https://developers.google.com/datastudio/connector/date-range
    https://developers.google.com/datastudio/connector/reference#getdata
    */
    params = {
      from: request.dateRange.startDate,
      to: request.dateRange.endDate
    };

    if (request.pagination) {
      // pagination={startRow=1.0, rowCount=100.0} --> see limit + page in Mite API
      params['limit'] = request.pagination.rowCount;
      params['page'] = Math.floor(
        (request.pagination.rowCount + request.pagination.startRow) /
          request.pagination.rowCount
      );
    }

    if (request.configParams && request.configParams.billable) {
      switch (parseInt(request.configParams.billable)) {
        case 1:
          params['billable'] = true;
          break;
        case 2:
          params['billable'] = false;
          break;
      }
    }
  } else {
    // preview only
    var date = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
    params = {
      from: date,
      to: date,
      limit: 20
    };
  }

  return params;
};

/**
 * Retrieves the data from the flat Mite time entries API with the given HTTP GET query parameters. Data is returned in
 * its original JSON notation. No data caching, no data conversion, no filtering.
 * The Mite API (URL) is selected based on request dimensions filter for "Archived".
 *
 * @param {MiteTimeEntries} this
 * @param {object} credentials - the credentials holding the domain and the API key.
 * @param {object} params - HTTP GET parameters as a dictionary that may include low-level API/query filters and date ranges
 */
MiteTimeEntries.prototype.getJson = function(credentials, params) {
  var response = miteGet(
    credentials.domain,
    credentials.key,
    MiteTimeEntries.API,
    params
  );
  return response.json;
};
