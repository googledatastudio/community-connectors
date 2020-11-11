var cc = DataStudioApp.createCommunityConnector();

/**
 * Indicates if the current user to whom the connector is authorized is an admin user thus enabling advanced
 * debugging capabilities. Shall be false in productive environments.
 *
 * @returns {boolean} true if admin user (debug mode); false else
 */
function isAdminUser() {
  return false;
}

/**
 * Retrieves the connector configuration that depends on the specified request.
 *
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the new (e.g. updated) configuration
 */
function getConfig(request) {
  // ToDo: handle request.languageCode for different languages being displayed
  console.log(request);

  var params = request.configParams;
  var config = cc.getConfig();

  var isFirst = params === undefined;
  if (isFirst) config.setIsSteppedConfig(true);

  config
    .newSelectSingle()
    .setId('cache')
    .setName('Data Caching')
    .setHelpText(
      'e.g. data that is retrieved from the Mite API will be cache in order to reduce API calls and increase performance'
    )
    .setAllowOverride(true)
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('15 Minutes (Default)')
        .setValue(15 * 60)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('30 Minutes')
        .setValue(30 * 60)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('1 Hour')
        .setValue(1 * 60 * 60)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('3 Hours')
        .setValue(3 * 60 * 60)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('6 Hours')
        .setValue(6 * 60 * 60)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Off')
        .setValue(0)
    );

  config
    .newSelectSingle()
    .setId('api')
    .setName('Mite API')
    .setHelpText('e.g. time entries, projects and more')
    .setIsDynamic(true)
    .setAllowOverride(false)
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Time entries')
        .setValue(MiteTimeEntries.API)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Projects')
        .setValue('projects')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Users')
        .setValue('users')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Customers')
        .setValue(MiteCustomers.API)
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Services')
        .setValue('services')
    );

  if (params && params.api == MiteTimeEntries.API) {
    config
      .newTextInput()
      .setId('group_by')
      .setName('Group by')
      .setHelpText(
        'e.g. free combination of user, customer, project, service and time (day, week, month or year) with values separated by comma. Leave blank for no grouping. Example: project, user, day'
      )
      .setAllowOverride(false);

    config
      .newSelectSingle()
      .setId('billable')
      .setName('Services')
      .setHelpText('e.g. all services, or just billable or non-billable')
      .setAllowOverride(true)
      .addOption(
        config
          .newOptionBuilder()
          .setLabel('all')
          .setValue(0)
      )
      .addOption(
        config
          .newOptionBuilder()
          .setLabel('billable')
          .setValue(1)
      )
      .addOption(
        config
          .newOptionBuilder()
          .setLabel('bon-billable')
          .setValue(2)
      );

    config.setDateRangeRequired(true);
  }

  Logger.log(config.printJson());

  return config.build();
}

/**
 * Instanciates the desired Mite API based on the configuration given in the original request. The Mite API mocks the connector functionality.
 *
 * @param {object} request - the current (e.g. original) request
 * @returns {obejct} the Mite API that mocks the connector API.
 */
function getApi(request) {
  if (!request) return new MiteTimeEntries();

  switch (request.configParams.api) {
    case MiteUsers.API:
      return new MiteUsers().createApi();
    case MiteServices.API:
      return new MiteServices().createApi();
    case MiteProjects.API:
      return new MiteProjects().createApi();
    case MiteCustomers.API:
      return new MiteCustomers().createApi();
    case MiteTimeEntries.API:
      if (
        request.configParams.group_by &&
        request.configParams.group_by.length > 0
      ) {
        return new MiteTimeEntriesGrouped(
          new MiteTimeEntries(),
          request.configParams.group_by
        );
      }
      return new MiteTimeEntries();
    default:
      return new MiteTimeEntries();
  }
}

/**
 * Get the data schema (all fields) in a format that is supported by Google Data Studio.
 *
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the fields in Google Data Studio format
 */
function getFields(request) {
  Logger.log(request);

  var api = getApi(request);
  return api.getFields(request);
}

/**
 * Get the data schema (all fields) in a format that is supported by Google Data Studio.
 *
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the fields in Google Data Studio format
 */
function getSchema(request) {
  var fields = getFields(request).build();
  return {schema: fields};
}

/**
 * Converts the original JSON data that has been retrieved from the Mite API an array of dictionaries whereas each row is a dictionary (key-values).
 *
 * @param {object} schema - the full data schema in JSON object notation. key-value mappings are indicated by the key value (e.g. user_name: {key: user_id}).
 * @param {object} data - the original data that has been retrieved from the Mite API given in JSON object notation.
 * @param {function(object: value, str: id)} converter - a callback that is capable of converting the original value towards the desired data type.
 * @param {string} tag - the JSON tag (e.g. element name)
 * @returns {Array} an array of data rows whereas each row is a dictionary holding the fields as keys and the values per field.
 */
function entriesToDicts(schema, data, converter, tag) {
  return data.map(function(element) {
    var entry = element[tag];
    var row = {};
    schema.forEach(function(field) {
      // field has same name in connector and original data source
      var id = field.id;
      if (field.api) {
        // field name in original data source differs to connector naming convention
        id = field.api;
      }

      var value = converter(entry, id);

      // use UI field ID
      row[field.id] = value;
    });

    return row;
  });
}

/**
 * Converts the array of rows, in which each row is a dictionary (key-values), towards the Google Data Studio format
 * in which each rows holds an array of values but no keys since keys are specified by the requested fields.
 *
 * @param {Array} requestedFields - the fields that have been requested by Google Data Studio
 * @param {Array} rows - an array of data rows whereas each row is a dictionary holding the fields as keys and the values per field.
 * @returns {Array} an array of rows whereas each row holds an array of values but no keys
 */
function dictsToRows(requestedFields, rows) {
  // return rows.map(row => ['values'] = requestedFields.reduce((values, field) => ([...values, row[field]]), []));
  return rows.reduce(
    (result, row) => [
      ...result,
      {
        values: requestedFields.reduce(
          (values, field) => [...values, row[field]],
          []
        )
      }
    ],
    []
  );
}

/**
 * Retrieves the data from the Mite API (or data cache) according to the configuration, converst data types, orders fields, caches data and
 * applies dimensions filters.
 *
 * @param {object} request - the current (e.g. original) request
 * @returns {object} the schema, the resulting rows and an indicator that all filters have been applied
 */
function getData(request) {
  Logger.log(request);

  var credentials = getCredentials();
  var cacheService = CacheService.getUserCache();

  var api = getApi(request);
  var schema = api.getSchema();
  var params = api.getParams(request);

  var requestedFields;
  var requestedSchema;
  var cacheTimespanSec;
  if (request) {
    cacheTimespanSec = parseInt(request.configParams.cache);
    // make sure the ordering of the requested fields is kept correct in the resulting data
    requestedFields = request.fields
      .filter((field) => !field.forFilterOnly)
      .map((field) => field.name);
    // requestedFields = request.fields.map(field => field.name); // for debugging only
    requestedSchema = api.getFields(request).forIds(requestedFields);
  } else {
    // use all fields from schema
    requestedFields = schema.map((field) => field.id);
    requestedSchema = api.getFields(request);
  }

  var filterPresent = request && request.dimensionsFilters;

  // apply request filters on API level (before the API call) to minimize data retrieval from API (number of rows) and increase speed
  // see https://developers.google.com/datastudio/connector/filters
  var filter;
  var idHandler;
  if (filterPresent) {
    filter = new Filter(
      schema,
      request ? request.dimensionsFilters : undefined,
      Filter.AND
    );

    if (cacheTimespanSec > 0) {
      idHandler = new IdCache(cacheService, request.configParams.api, schema);
      var mappings = idHandler.get();
      if (mappings) filter.resolveIdMappings(mappings, schema);
    }

    filter.preFilter(params);
  }

  // cache handling to minimize API calls and increase speed
  // see https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
  var cache;
  var cached;
  var data;
  // cacheTimespanSec = 0;  // disable caching for debugging if necessary
  if (cacheTimespanSec > 0) {
    // ToDo: handle params.scriptParams.lastRefresh for cache handling (or ingoring) instead of retrieving a cache value from the config
    // see: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
    cache = new DataCache(
      cacheService,
      15 * 60,
      request.configParams.api,
      params
    );
    cached = true;
    data = cache.getJson();
  }

  if (!data) {
    // ToDo: handle semantic extraction; see https://developers.google.com/datastudio/connector/semantics#semantic-type-detection
    // Remark: semantic extraction will only happen if the data schema is missing the definition of the semantic type of any field

    cached = false;
    data = api.getJson(credentials, params);

    if (cache) {
      // data in cache may be filted with low-level API filters, but MUST NOT be filtered with high-level non-API filters.
      cache.setJson(data);
    }
  } else {
    // ToDo: check if data must be set to cache again in order to reset the timeout?
    cached = true;
  }

  // console.log(data);

  // convert the full dataset including all fields (the full schema). non-requested fields will be filtered later on
  var rows = entriesToDicts(schema, data, api.convertValue, api.getTag());
  if (idHandler && !cached) idHandler.set(rows);

  if (filter) {
    // match rows against filter
    rows = rows.filter((row) => filter.match(row) == true);
  }

  // remove non-requested fields
  var result = dictsToRows(requestedFields, rows);

  console.log(Utils.formatString('{0} rows received', result.length));
  // console.log(result);

  return {
    schema: requestedSchema.build(),
    rows: result,
    filtersApplied: filter ? true : false
  };
}

/**
 * Tests the flat Mite time entries API based on a Google Data Studio request with date range, dimensionsFilters and a
 * requested fields (subset of the data schema) using the authorized user credentials (Mite domain and API key).
 */
function testTimeEntriesApi() {
  var credentials = getCredentials();

  var request;

  request = {
    dateRange: {
      endDate: '2020-05-01',
      startDate: '2020-05-05'
    },
    dimensionsFilters: [
      [
        {
          operator: 'EQUALS',
          fieldName: 'project_id',
          type: 'INCLUDE',
          values: [3034258.0]
        }
      ],
      [
        {
          operator: 'EQUALS',
          fieldName: 'user',
          type: 'INCLUDE',
          values: ['Matthias Heise']
        }
      ]
    ],
    configParams: {
      api: 'time_entries'
    },
    scriptParams: {
      lastRefresh: 1588712095513
    },
    fields: [
      {name: 'customer'},
      {name: 'project'},
      {
        name: 'project_id',
        forFilterOnly: true
      },
      {name: 'time'},
      {name: 'user'}
    ]
  };

  var rows = getData(request);
  return;
}

/**
 * Tests the grouped Mite time entries API based on a Google Data Studio request with date range, dimensionsFilters and a
 * requested fields (subset of the data schema) using the authorized user credentials (Mite domain and API key).
 */
function testTimeEntriesGroupedByApi() {
  var credentials = getCredentials();

  var request;

  request = {
    dateRange: {
      endDate: '2020-05-01',
      startDate: '2020-05-05'
    },
    dimensionsFilters: [
      [
        {
          operator: 'EQUALS',
          fieldName: 'project_id',
          type: 'INCLUDE',
          values: [3034258.0]
        }
      ]
    ],
    configParams: {
      api: 'time_entries',
      group_by: 'week, project, user',
      billable: 1
    },
    scriptParams: {
      lastRefresh: 1588712095513
    },
    fields: [
      {name: 'week'},
      {name: 'project'},
      {name: 'user'},
      {name: 'time'},
      {name: 'revenue'}
    ]
  };

  var rows = getData(request);
  return;
}

/**
 * Tests the Mite customers API based on a Google Data Studio request with date range, dimensionsFilters and a
 * requested fields (subset of the data schema) using the authorized user credentials (Mite domain and API key).
 */
function testCustomersApi() {
  var credentials = getCredentials();

  var request;

  request = {
    dimensionsFilters: [
      [
        {
          operator: 'EQUALS',
          fieldName: 'archived',
          type: 'INCLUDE',
          values: [true]
        }
      ]
    ],
    configParams: {
      api: 'customers',
      cache: 15 * 60
    },
    scriptParams: {
      lastRefresh: 1588712095513
    },
    fields: [{name: 'id'}, {name: 'name'}, {name: 'note'}]
  };

  var rows = getData(request);
  return;
}

/**
 * Tests the Mite projects API based on a Google Data Studio request with date range, dimensionsFilters and a
 * requested fields (subset of the data schema) using the authorized user credentials (Mite domain and API key).
 */
function testProjectsApi() {
  var credentials = getCredentials();

  var request;

  request = {
    dimensionsFilters: [
      [
        {
          operator: 'EQUALS',
          fieldName: 'customer_id',
          type: 'INCLUDE',
          values: [493646]
        }
      ]
    ],
    configParams: {
      api: 'projects',
      cache: 15 * 60
    },
    scriptParams: {
      lastRefresh: 1588712095513
    },
    fields: [
      {name: 'id'},
      {name: 'name'},
      {name: 'budget'},
      {name: 'budget_type'}
    ]
  };

  var rows = getData(request);
  return;
}
