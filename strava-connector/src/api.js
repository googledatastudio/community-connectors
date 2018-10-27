var RESULTS_PER_PAGE = 200;

function getAuthType() {
  return {
    type: 'OAUTH2',
  };
}

function isAdminUser() {
  return false;
}

function getConfig(request) {
  var config = {
    dateRangeRequired: true,
  };
  return config;
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

/**
 * Takes the requested fields and the API response, and return rows formatted
 * for Data Studio.
 */
function responseToRows(requestedFields, response) {
  return response.map(function(activity) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
        case 'start_date_local':
          return row.push(parseTimestamp(activity[field.getId()]));
        case 'id':
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

/**
 * Gets all activities from the api. Makes use of the CacheService to speed up
 * the average request.
 */
function getAllData(request, requestedFields) {
  var cache = CacheService.getUserCache();
  var queryParams = {};

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
      field.getId();
    })
    .join('--');
  while (moreResults) {
    queryParams['page'] = page;
    var formattedParams = formatQueryParams(queryParams);
    var url = [
      'https://www.strava.com/api/v3',
      '/athlete/activities',
      formattedParams,
    ].join('');
    var cacheKey = formattedParams + cacheKeyBase;
    page++;

    var rows;
    var response = cache.get(cacheKey);
    // cache.get returns null on cache miss.
    if (response === null) {
      response = JSON.parse(UrlFetchApp.fetch(url, options));
      rows = responseToRows(requestedFields, response);
      cache.put(cacheKey, JSON.stringify({value: rows}));
    } else {
      rows = JSON.parse(response).value;
    }
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
    rows: getAllData(request, requestedFields),
  };
}
