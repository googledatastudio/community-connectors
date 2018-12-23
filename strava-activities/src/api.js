var RESULTS_PER_PAGE = 200;
var STRAVA_BASE_URL = 'https://www.strava.com/api/v3';

function getAuthType() {
  return {
    type: 'OAUTH2',
  };
}

function isAdminUser() {
  return true;
}

function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newSelectSingle()
    .setId('activityType')
    .setName('Activity Type')
    .setHelpText(
      'The type of activity to include. Leave blank for all activities'
    )
    .setAllowOverride(true)
    .addOption(
      config.newOptionBuilder()
        .setLabel('All')
        .setValue('All')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Ride')
        .setValue('Ride')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Run')
        .setValue('Run')
    );

  config.setDateRangeRequired(true);

  return config.build();
}

function getSchema(request) {
  var fields = getFields().build();
  return {schema: fields};
}

/**
 * Takes a timestamp, and parses it into the YYYY-MM-DD-HH format.
 *
 * @param {string} timestamp A timestamp that can be used by the `Date constructor`.
 * @return {string} A YYYY-MM-DD-HH formatted string.
 */
function parseTimestamp(timestamp) {
  var date = new Date(timestamp);

  var year = date.getUTCFullYear();

  var month = date.getUTCMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  var day = date.getUTCDate();
  if (day < 10) {
    day = '0' + day;
  }

  var hour = date.getUTCHours();
  if (hour < 10) {
    hour = '0' + hour;
  }

  var ymdh = '' + year + month + day + hour;
  return ymdh;
}

function parseLatLong(latLng) {
  return latLng ? latLng.join(',') : null;
}

/**
 * Takes the requested fields and the API response, and return rows formatted
 * for Data Studio.
 */
function responseToRows(requestedFields, response) {
  return response.map(function(activity) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
        case 'start_latlng':
        case 'end_latlng':
          return row.push(parseLatLong(activity[field.getId()]));
        case 'start_date_local':
          return row.push(parseTimestamp(activity[field.getId()]));
        // force these fields to be a string.
        case 'id':
        case 'elapsed_time':
        case 'moving_time':
          return row.push('' + activity[field.getId()]);
        default:
          return row.push(activity[field.getId()]);
      }
    });
    return {values: row};
  });
}

/**
 * Takes a queryParam object and formats it for use in a URL.
 *
 * @param {Object} queryParams An object with string keys.
 * @return {string} A query parameter string for use in a URL.
 */
function formatQueryParams(queryParams) {
  return (
    '?' +
    Object.keys(queryParams)
      .map(function(queryParamKey) {
        return '' + queryParamKey + '=' + queryParams[queryParamKey];
      })
      .join('&')
  );
}

function urlFetchOptions() {
  return {
    headers: {
      Authorization: 'Bearer ' + getOAuthService().getAccessToken(),
    },
  };
}

function hashString(str) {
  var hash = 0,
    i,
    chr;
  if (str === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Gets all activities from the api. Makes use of the CacheService to speed up
 * the average request.
 */
function getAllDataFromAPI(request, requestedFields) {
  var configParams = request.configParams || {};
  var cache = CacheService.getUserCache();
  var queryParams = {};

  var keysToKeep = getFields()
    .asArray()
    .map(function(field) {
      return field.getId();
    });

  queryParams['per_page'] = RESULTS_PER_PAGE;
  if (request.dateRange) {
    queryParams['before'] =
      new Date(request.dateRange.endDate).getTime() / 1000;
    queryParams['after'] =
      new Date(request.dateRange.startDate).getTime() / 1000;
  }

  var options = urlFetchOptions();
  var page = 1;
  var results = [];
  var moreResults = true;
  var cacheKeyBase = requestedFields
    .asArray()
    .map(function(field) {
      return field.getId();
    })
    .join('|');
  while (moreResults) {
    queryParams['page'] = page;
    var formattedParams = formatQueryParams(queryParams);
    var url = [STRAVA_BASE_URL, '/athlete/activities', formattedParams].join(
      ''
    );
    var cacheKey = formattedParams + cacheKeyBase;
    cacheKey = hashString(cacheKey);
    page++;

    var cacheValue = cache.get(cacheKey);
    // cache.get returns null on cache miss.
    if (cacheValue == null) {
      var apiResponse = JSON.parse(UrlFetchApp.fetch(url, options));
      var filteredResponse = apiResponse.map(function(activity) {
        var filteredActivity = keysToKeep.reduce(function(obj, key) {
          obj[key] = activity[key];
          return obj;
        }, {});
        return filteredActivity;
      });
      cacheValue = JSON.stringify({value: filteredResponse});
      cache.put(cacheKey, cacheValue);
    }
    var rows = responseToRows(
      requestedFields,
      JSON.parse(cacheValue).value.filter(function(activity) {
        if (configParams.activityType && configParams.activityType != 'All') {
          return activity['type'].match(
            new RegExp(request.configParams.activityType)
          );
        } else {
          return true;
        }
      })
    );
    if (rows.length === 0) {
      moreResults = false;
    }
    results = results.concat(rows);
  }
  return results;
}

function getData(request) {
  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );
  return {
    schema: requestedFields.build(),
    rows: getAllDataFromAPI(request, requestedFields),
  };
}
