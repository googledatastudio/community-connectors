function Connector() {
  this.cache = null;
}

/** @const */
Connector.OAUTH_CONST = 'OAUTH2';

/** @const */
Connector.logEnabled = true;

/** @const */
Connector.MILLIS_PER_SECOND = 1000;

/** @const */
Connector.SECONDS_PER_MINUTE = 60;

/** @const */
Connector.LOCK_TIMEOUT_MINUTES = 5;

/** @const */
Connector.DEFAULT_URL_NAME = 'Igniter';

/** @const */
Connector.API_TYPE_MEMBERS = 'members';

/** @const */
Connector.API_TYPE_EVENTS = 'events';

/** @const */
Connector.API_TYPE_GENERAL_INFO = 'general_info';

/** @const */
Connector.API_TYPE_PRO_GROUPS = 'pro_groups';

/** @const */
Connector.DEFAULT_API_TYPE = Connector.API_TYPE_MEMBERS;

/** @const */
Connector.customConfig = [
  {
    type: 'TEXTINPUT',
    name: 'url_name',
    displayName: 'Meetup Group Name in URL',
    helpText:
        'E.g. if the URL for your Meetup is https://www.meetup.com/gdg-silicon-valley/, enter "gdg-silicon-valley" here.',
    placeholder: 'Igniter'
  },
  {
    type: 'SELECT_SINGLE',
    name: 'api_type',
    displayName: 'Query Type',
    helpText: 'What type of data would you like to pull from Meetup.com?',
    options: [
      {label: 'Members', value: Connector.API_TYPE_MEMBERS},
      {label: 'General Info', value: Connector.API_TYPE_GENERAL_INFO},
      {label: 'Pro Groups', value: Connector.API_TYPE_PRO_GROUPS},
      {label: 'Events', value: Connector.API_TYPE_EVENTS}
    ]
  }
];

/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} request - The request passed to `Connector.getData(request)`.
 * @return {Object} Updated Config parameters.
 */
Connector.prototype.validateConfig = function(request) {
  request.configParams = request.configParams || {};
  request.configParams.url_name =
      request.configParams.url_name || Connector.DEFAULT_URL_NAME;
  request.configParams.api_type =
      request.configParams.api_type || Connector.DEFAULT_API_TYPE;
  return request;
};

/**
 * Builds up the url needed for the request.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @return {string} The built url.
 */
Connector.prototype.buildURL = function(request) {
  var baseURL = 'https://api.meetup.com';
  var urlName = request.configParams.url_name;

  var url, urlParams;

  switch (request.configParams.api_type) {
    case Connector.API_TYPE_MEMBERS: {
      urlParams = [
        '?', 'sign=true', 'photo-host=public',
        'only=id,joined,status,lat,lon,city,state', 'page=100'
      ].join('&');
      url = [baseURL, urlName, 'members'].join('/');
      break;
    }
    case Connector.API_TYPE_EVENTS: {
      var onlyParam = 'only=' + [
        'name', 'time', 'waitlist_count', 'yes_rsvp_count', 'link', 'fee', 'manual_attendance_count'
      ].join(',');

      urlParams = ['?', 'page=100', 'status=upcoming,past', onlyParam].join('&');

      url = [baseURL, urlName, 'events'].join('/');
      break;
    }
    case Connector.API_TYPE_GENERAL_INFO: {
      var onlyParam = 'only=' + [
        'name', 'link', 'members', 'group_photo.photo_link', 'meta_category'
      ].join(',');
      urlParams = ['?', onlyParam].join('&');
      url = [baseURL, urlName].join('/');
      break;
    }
    case Connector.API_TYPE_PRO_GROUPS:
      var onlyParam = 'only=' + [
        'id', 'name', 'lat', 'lon', 'city', 'country', 'member_count',
        'average_age', 'founded_date', 'past_events', 'upcoming_events',
        'past_rsvps', 'rsvps_per_event', 'repeat_rsvpers', 'gender_unknown',
        'gender_female', 'gender_male', 'gender_other'
      ].join(',');
      urlParams = ['?', 'page=100', onlyParam].join('&');
      url = [baseURL, 'pro', urlName, 'groups'].join('/');
      break;
    default: {
      this.throwError(
          'An invalid value was passed to api type: ' +
              request.configParams.api_type,
          false);
    }
  }
  return url + urlParams;
};

/**
 * Gets data from the cache using a paginated strategy. Since this data was put
 * into the cache in order, we can return the rest of the results from the cache
 * after our first cache hit.
 *
 * @param {object} cache The cache.
 * @param {object} cacheKey The key to lokup in the cache.
 * @return {object|undefined} either the aggregated values from the cache or undefined, if the key was not found.
 */
Connector.prototype.getFromCachePaginated = function(cache, cacheKey) {
  var cached = cache.getRestFrom(cacheKey, function(acc, row) {
    const cachedValue = JSON.parse(row[1]);
    const results = acc.json.concat(cachedValue.json);
    const nextLink = cachedValue.nextLink;
    return {json: results, nextLink: nextLink};
  }, {json: [], nextLink: undefined});
  return cached;
};


/**
 * Attempts to get the data from the cache. If it fails, it makes all necessary
 * requests, and caches results as it goes.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @param {string} url - The url to request.
 * @param {object} options - The options to use for the UrlFetchApp, if necessary.
 * @return {object} The response from the cache, or `this.wrappedFetch`.
 */
Connector.prototype.getCachedData = function(request, url, options) {
  if (this.cache === null) {
    this.cache = new CustomCache(
        request.configParams.url_name, request.configParams.api_type);
  }
  var cache = this.cache;
  var cacheKey = url;
  var cached = this.getFromCachePaginated(cache, cacheKey);
  var nextUrl = url;
  if (cached) {
    return cached;
  } else {
    try {
      var results = [];
      var shouldCache = true;
      var response = this.wrappedFetch(nextUrl, options);
      var JSONed = JSON.parse(response);
      results = results.concat(JSONed);
      nextUrl = this.getNextLink(response);


      if (!nextUrl || JSONed.length !== 100) {
        shouldCache = false;
      }

      var toCache = {json: results, nextLink: nextUrl};

      if (shouldCache) {
        cache.put(cacheKey, toCache);
      }
      return toCache;
    } catch (e) {
      console.log(e);
      this.throwError('Unable to get data from meetup.com', true);
    }
  }
};

/**
 * Parses out the next link from the response headers. Returns undefined if no
 * next link was found.
 *
 * @param {object} response - The response from `this.wrappedFetch`
 * @return {string|undefined} the next link, or undefined if there was none.
 */
Connector.prototype.getNextLink = function(response) {
  var regex = /<(.*)>; rel="next"/;
  var headers = response.getAllHeaders();
  var linkHeaders = headers['Link'] || [];
  if (typeof linkHeaders === 'string') {
    // make it where it's always an array, even if there is only 1 response.
    linkHeaders = [linkHeaders];
  }
  var nextUrl;
  for (var j = 0; j < linkHeaders.length; j++) {
    var link = linkHeaders[j];
    var nextUrl = link && link.match(regex) && link.match(regex)[1];
    if (nextUrl) {
      return nextUrl;
    }
  }
  return undefined;
};

/**
 * Chains all necessary requests together respecting pagination.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @param {string} url - The first url to call in the pagination chain.
 * @return {object} All responses from the api joined together.
 */
Connector.prototype.paginatedResult = function(request, url) {
  var lock = LockService.getUserLock();
  // Will throw an exception if the lock is not obtained within 5 minutes.
  var timeout = Connector.MILLIS_PER_SECOND * Connector.SECONDS_PER_MINUTE * Connector.LOCK_TIMEOUT_MINUTES;
  lock.waitLock(timeout);
  var options = this.getFetchOptions();
  var response = this.getCachedData(request, url, options);
  var nextUrl = response.nextLink;
  var responses = response.json;
  while (nextUrl) {
    var r = this.getCachedData(request, nextUrl, options);
    responses = responses.concat(r.json);
    nextUrl = r.nextLink;
  }
  lock.releaseLock();
  return responses;
};

/**
 * Formats a timestamp to be YYYYMMDD
 * @param{number} timestamp A unix timestamp.
 * @return{string} A string formatted as YYYYMMDD.
 */
Connector.prototype.timeStampToYearMonthDay = function(timestamp) {
  var d = new Date(timestamp);
  var yearMonthDay = d.toISOString().slice(0, 10).replace(/-/g, '');
  return yearMonthDay;
};

/**
 * Formats a timestamp to be UTC time.
 * @param{number} timestamp A unix timestamp.
 * @return{string} A string formatted as HH:MM.
 */
Connector.prototype.timeStampToUTCTime = function(timestamp) {
  var d = new Date(timestamp);
  var hours = d.getUTCHours();
  var minutes = d.getUTCMinutes();
  return (hours < 10 ? '0' + hours : hours) + ':' +
      (minutes < 10 ? '0' + minutes : minutes);
};

/**
 * Takes the apiResults and formats them into rows as needed by Data Studio for
 * the member data.
 *
 * @param {object} apiResults - The results obtained by calling the api.
 * @param {object} dataSchema - The schema for this api request.
 * @return {Array} A formatted array of the apiResults.
 */
Connector.prototype.rowifyMemberData = function(apiResults, dataSchema) {
  var that = this;
  return apiResults.map(function(entry) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'joined': {
          // using the epoch date constructor.
          var d = new Date(entry['joined']);
          var formattedDate = that.timeStampToYearMonthDay(d);
          return values.push(formattedDate);
        }
        case 'id':
          return values.push(entry['id']);
        case 'status':
          return values.push(entry['status']);
        case 'latlong':
          return values.push('' + entry['lat'] + ', ' + entry['lon']);
        case 'city':
          return values.push(entry['city']);
        case 'state':
          return values.push(entry['state']);
        default:
          that.throwError(
              'A field was requested that is not in the schema: ' + field.name,
              true);
      }
    });
    return {values: values};
  });
};

/**
 * Builds the options for UrlFetchApp.
 *
 * @return {object} An object with all needed headers.
 */
Connector.prototype.getFetchOptions = function() {
  var options = {
    headers: {'Authorization': 'Bearer ' + getOAuthService().getAccessToken()}
  };
  return options;
};

/**
 * Returns the data for general info.
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @param {string} url - The url to call.
 * @return {object} The data for general info.
 */
Connector.prototype.requestGeneralInfo = function(request, url) {
  var options = this.getFetchOptions();
  var response = this.wrappedFetch(url, options);
  var JSONed = JSON.parse(response);
  return JSONed;
};

/**
 * Takes the apiResults and formats them into rows as needed by Data Studio for
 * the general info data.
 *
 * @param {object} apiResults - The results obtained by calling the api.
 * @param {object} dataSchema - The schema for this api request.
 * @return {Array} A formatted array of the apiResults.
 */
Connector.prototype.rowifyGeneralInfo = function(apiResults, dataSchema) {
  var values = [];
  var that = this;
  dataSchema.forEach(function(field) {
    switch (field.name) {
      case 'category':
        return values.push(
            apiResults['meta_category'] && apiResults['meta_category']['name']);
      case 'category_photo_url':
        return values.push(
            apiResults['meta_category'] &&
              apiResults['meta_category']['photo'] &&
              apiResults['meta_category']['photo']['photo_link']);
      case 'group_photo_url':
        return values.push(
            apiResults['group_photo'] &&
              apiResults['group_photo']['photo_link']);
      case 'members_count':
        return values.push(apiResults['members']);
      case 'group_link':
        return values.push(apiResults['link']);
      case 'group_name':
        return values.push(apiResults['name']);
      default:
        that.throwError(
            'A field was requested that is not in the schema: ' + field.name,
            true);
    }
  });
  return [{values: values}];
};

/**
 * Wraps the call to UrlFetchApp with error handling.
 *
 * @param {string} url The url to fetch.
 * @param {object} options The options to use for the fetch.
 */
Connector.prototype.wrappedFetch = function(url, options) {
  var result;
  try {
    result = UrlFetchApp.fetch(url, options);
  } catch (e) {
    this.throwError(e);
  }
  return result;
}

/**
 * Returns the data for events.
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @param {string} url - The url to call.
 * @return {object} The data for events.
 */
Connector.prototype.requestEventsData = function(request, url) {
  var options = this.getFetchOptions();
  var response = this.wrappedFetch(url, options);
  var JSONed = JSON.parse(response);
  return JSONed;
};

/**
 * Takes the apiResults and formats them into rows as needed by Data Studio for
 * the event data.
 *
 * @param {object} apiResults - The results obtained by calling the api.
 * @param {object} dataSchema - The schema for this api request.
 * @return {Array} A formatted array of the apiResults.
 */
Connector.prototype.rowifyEventData = function(apiResults, dataSchema) {
  var that = this;
  return apiResults.map(function(entry) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'name':
          return values.push(entry['name']);
        case 'event_date':
          return values.push(that.timeStampToYearMonthDay(entry['time']));
        case 'waitlist_count':
          return values.push(entry['waitlist_count']);
        case 'yes_rsvp_count':
          return values.push(entry['yes_rsvp_count']);
        case 'link':
          return values.push(entry['link']);
        case 'manual_attendance_count':
          return values.push(entry['manual_attendance_count']);
        case 'fee':
          return values.push(entry['fee'] && entry['fee']['amount'] || 0);
        case 'event_time':
          return values.push(that.timeStampToUTCTime(entry['time']));
        default:
          that.throwError(
              'A field was requested that is not in the schema: ' + field.name,
              true);
      }
    });
    return {values: values};
  });
};

/**
 * Takes the apiResults and formats them into rows as needed by Data Studio for
 * the pro group data.
 *
 * @param {object} apiResults - The results obtained by calling the api.
 * @param {object} dataSchema - The schema for this api request.
 * @return {Array} A formatted array of the apiResults.
 */
Connector.prototype.rowifyProGroupData = function(apiResults, dataSchema) {
  var that = this;
  return apiResults.map(function(entry) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'id':
          return values.push(entry['id']);
        case 'name':
          return values.push(entry['name']);
        case 'latlong':
          return values.push('' + entry['lat'] + ', ' + entry['lon']);
        case 'city':
          return values.push(entry['city']);
        case 'country':
          return values.push(entry['country']);
        case 'member_count':
          return values.push(entry['member_count']);
        case 'average_age':
          return values.push(entry['average_age']);
        case 'founded_date':
          return values.push(
              that.timeStampToYearMonthDay(entry['founded_date']));
        case 'past_events':
          return values.push(entry['past_events']);
        case 'upcoming_events':
          return values.push(entry['upcoming_events']);
        case 'past_rsvps':
          return values.push(entry['past_rsvps']);
        case 'rsvps_per_event':
          return values.push(entry['rsvps_per_event']);
        case 'repeat_rsvpers':
          return values.push(entry['repeat_rsvpers']);
        case 'gender_unknown':
          return values.push(
              Math.ceil(entry['gender_unknown'] * entry['member_count']));
        case 'gender_female':
          return values.push(
              Math.ceil(entry['gender_female'] * entry['member_count']));
        case 'gender_male':
          return values.push(
              Math.ceil(entry['gender_male'] * entry['member_count']));
        case 'gender_other':
          return values.push(
              Math.ceil(entry['gender_other'] * entry['member_count']));
        default:
          that.throwError(
              'A field was requested that is not in the schema: ' + field.name,
              true);
      }
    });
    return {values: values};
  });
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request - Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
Connector.prototype.getData = function(request) {
  this.validateConfig(request);

  var dataRequestFn;
  var rowifyFn;
  switch (request.configParams.api_type) {
    case Connector.API_TYPE_MEMBERS:
      dataRequestFn = this.paginatedResult;
      rowifyFn = this.rowifyMemberData;
      break;
    case Connector.API_TYPE_EVENTS:
      dataRequestFn = this.requestEventsData;
      rowifyFn = this.rowifyEventData;
      break;
    case Connector.API_TYPE_GENERAL_INFO:
      dataRequestFn = this.requestGeneralInfo;
      rowifyFn = this.rowifyGeneralInfo;
      break;
    case Connector.API_TYPE_PRO_GROUPS:
      dataRequestFn = this.paginatedResult;
      rowifyFn = this.rowifyProGroupData;
      break;
    default:
      this.throwError(
          'An invalid value was passed to apiType: ' +
              request.configParams.api_type,
          false);
  }
  var url = this.buildURL(request);
  var apiResults = dataRequestFn.call(this, request, url);
  var dataSchema = this.getDataSchema(request);
  var rows = rowifyFn.call(this, apiResults, dataSchema);
  var results = {schema: dataSchema, rows: rows};
  return results;
};

/**
 * Returns a dynamic schema that only contains fields that were in the request.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 *
 * @return {obj} The schema keyed by `schemaEntry.name`.
 */
Connector.prototype.getDataSchema = function(request) {
  var that = this;
  var schemaByName =
      this.getSchema(request).schema.reduce(function(acc, schemaEntry) {
        var name = schemaEntry.name;
        acc[name] = schemaEntry;
        return acc;
      }, {});

  var dataSchema = [];
  request.fields.forEach(function(field) {
    if (field.name in schemaByName) {
      dataSchema.push(schemaByName[field.name]);
    } else {
      that.throwError(
          'A field was requested that was not in the schema: ' + field.name,
          false);
    }
  });

  return dataSchema;
};

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName - Function to be logged and executed.
 * @param {Object} parameter - Parameter for the `functionName` function.
 * @return {any} Returns the response of `functionName` function.
 */
Connector.prototype.logAndExecute = function(functionName, parameter) {
  if (this[functionName] === undefined) {
    this.throwError(
        'The function you are trying to log is not defined: ' + functionName,
        false);
  } else {
    if (this.logEnabled && this.isAdminUser()) {
      var paramString = JSON.stringify(parameter, null, 2);
      console.log([functionName, 'request', paramString]);
    }

    var returnObject = this[functionName](parameter);

    if (this.logEnabled && this.isAdminUser()) {
      var returnString = JSON.stringify(returnObject, null, 2);
      console.log([functionName, 'response', returnString]);
    }

    return returnObject;
  }
};

/**
 * This checks whether the current user is an admin user of the Connector.
 *
 * @return {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the Connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the Connector.
 */
Connector.prototype.isAdminUser = function() {
  return false;
};

/**
 * Returns the authentication method required by the Connector to authorize the
 * third-party service.
 *
 * Required function for Community Connector.
 *
 * @return {Object} `AuthType` used by the Connector.
 */
Connector.prototype.getAuthType = function() {
  var response = {'type': Connector.OAUTH_CONST};
  return response;
};

/**
 * Returns the user configurable options for the Connector.
 *
 * Required function for Community Connector.
 *
 * @param {Object} request - Config request parameters.
 * @return {Object} Connector configuration to be displayed to the user.
 */
Connector.prototype.getConfig = function(request) {
  var config = {configParams: Connector.customConfig};
  return config;
};


/**
 * Returns the schema for the given request.
 *
 * @param {Object} request - Schema request parameters.
 * @return {Object} Schema for the given request.
 */
Connector.prototype.getSchema = function(request) {
  this.validateConfig(request);
  return new Schema().getSchema(request.configParams.api_type);
};

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message - Error message to be shown in UI.
 * @param {boolean} userSafe - Indicates whether the error message can be shown to
 *      regular users (as opposed to debug error messages meant for admin users
 *      only.)
 */
Connector.prototype.throwError = function(message, userSafe) {
  if (userSafe) {
    message = 'DS_USER:' + message;
  }
  throw new Error(message);
};

// Needed for testing
var module = module || {};
module.exports = Connector;
