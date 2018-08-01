var crux = crux || {};

// Default URL used for the connector
crux.defaultUrl = "www.google.com";

// Key used for the lastDataUpdate flag
crux.lastDataUpdateFlag = "lastDataUpdate";

// Apps Script cache duration in seconds
crux.secondsInMinute = 60;
crux.minutesInHour = 60;
crux.cacheDurationInHour = 1;
crux.cacheDuration = crux.secondsInMinute * crux.minutesInHour * crux.cacheDurationInHour;

// Exceptions for script properties that will not get flushed
crux.cacheFlushWhitelist = [
  "oauth2.bigQuery",
  "oauth2.firebase",
  "admins",
  "bigQuery.client",
  "firebase.client",
  crux.lastDataUpdateFlag
];

// Query used to pull data from BigQuery
crux.queryString =
  "SELECT * FROM `chrome-ux-report.materialized.summary` WHERE origin = @url";

function getConfig(request) {
  var customConfig = [
    {
      type: "TEXTINPUT",
      name: "url",
      displayName: "Enter origin URL:",
      placeholder: "e.g. " + crux.defaultUrl,
      parameterControl: {
        allowOverride: true
      }
    },
    {
      type: "INFO",
      name: "information",
      text:
        "'https://' is added by default. If needed, add 'http://' at the URL beginning (e.g. http://example.com)"
    }
  ];

  // For admin users, show the additional option for changing the
<<<<<<< HEAD
  // lastDataUpdate flag. This date indicates when the original dataset
  // in BigQuery was last updated and is saved in script properties on update.
  // While caching to Apps Script or Firebase, each Url's cache is tagged with
  // this date. Later when cache is retrived, the tagged date is compared against
  // the date in script properties to determine if cache should be reset.
=======
  // lastDataUpdate flag
>>>>>>> master
  if (isAdminUser()) {
    var lastUpdate = propStore.get("script", crux.lastDataUpdateFlag);
    customConfig.push({
      type: "TEXTINPUT",
      name: crux.lastDataUpdateFlag,
      displayName: "ADMIN ONLY: Date when BigQuery dataset was updated last (YYYYMMDD)",
      placeholder: lastUpdate
    });
  }
  return {
    configParams: customConfig
  };
}

crux.Schema = [
  {
    name: "yyyymm",
    label: "Release",
    dataType: "STRING",
    semantics: {
      conceptType: "DIMENSION",
      semanticType: "YEAR_MONTH"
    }
  },
  {
    name: "yyyymmdd",
    label: "yyyymmdd",
    dataType: "STRING",
    semantics: {
      conceptType: "DIMENSION",
      semanticType: "YEAR_MONTH_DAY"
    }
  },
  {
    name: "origin",
    label: "origin",
    dataType: "STRING",
    semantics: {
      conceptType: "DIMENSION",
      semanticType: "TEXT"
    }
  },
  {
    name: "fast_fcp",
    label: "Fast",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "avg_fcp",
    label: "Average",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "slow_fcp",
    label: "Slow",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "desktopDensity",
    label: "Desktop",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "phoneDensity",
    label: "Phone",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "tabletDensity",
    label: "Tablet",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "_4GDensity",
    label: "4G",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "_3GDensity",
    label: "3G",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "_2GDensity",
    label: "2G",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "slow2GDensity",
    label: "Slow 2G",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  },
  {
    name: "offlineDensity",
    label: "Offline",
    dataType: "NUMBER",
    defaultAggregationType: "MAX",
    semantics: {
      conceptType: "METRIC",
      semanticType: "PERCENT",
      isReaggregatable: true
    }
  }
];

function getSchema(request) {
  // Caches the data beforehand. This call also returns an error if
  // config url is invalid or does not exist in the database. The error
  // stops the users from proceeding from the config screen.
  getOriginDataset(request);
  
  return {
    schema: crux.Schema
  };
}

/**
 * Returns whether the BigQuery dataset has been updated. Also updates the
 * lastDataUpdate flag.
 *
 * @param {object} request getSchema/getData request parameter.
 * @returns {string} Last dataset update in YYYYMMDD format.
 */
function getDatasetUpdate(request) {
  var lastDataUpdate = propStore.get("script", crux.lastDataUpdateFlag);
  var configLastDataUpdate = request.configParams &&
    request.configParams.lastDataUpdate;
  
  var shouldUpdate = false;
  if (configLastDataUpdate !== undefined) {
    shouldUpdate = configLastDataUpdate > lastDataUpdate;
  }

  if (shouldUpdate) {
    lastDataUpdate = request.configParams.lastDataUpdate;
    updateDataUpdateFlag(lastDataUpdate);
  }
  return lastDataUpdate;
}

/**
 * Resets all script properties except for the ones in persistent list.
 * Deletes the cache in Firebase.
 */
function flushCache() {
  var tempStorage = {};

  crux.cacheFlushWhitelist.forEach(function(property) {
    tempStorage[property] = propStore.get("script", property);
  });

  propStore.flush("script");

  crux.cacheFlushWhitelist.forEach(function(property) {
    tempStorage[property] = tempStorage[property] || "";
    propStore.set("script", property, tempStorage[property]);
  });

  try {
    fbFlushCache();
  } catch (e) {
    throw new Error("Failed to flush cache");
  }
}

/**
 * Updates the lastDataUpdate flag, and clears Firebase cache.
 *
 * @param {number} newDataUpdate The timestamp for last data update in YYYYMMDD format.
 */
function updateDataUpdateFlag(newDataUpdate) {
  propStore.set("script", crux.lastDataUpdateFlag, newDataUpdate);
  console.log("It seems entire BigQuery dataset has been updated");
  flushCache();
}

/**
 * Returns the validated or default URL given the config.
 *
 * @param {object} configParams config parameters from request.
 * @returns {string} The url for the endpoint.
 */
function validateUrl(configParams) {

  var url = crux.defaultUrl;

  if (configParams !== undefined && configParams.url !== undefined) {
    url = configParams.url;
  }

  // Remove '/' at the end
  var lastChar = url.substring(url.length - 1);
  if (lastChar === "/") {
    url = url.substring(0, url.length - 2);
  }

  // Add 'https://' at the beginning if needed
  var urlHttps = url.toLowerCase().substring(0, 8) === "https://";
  var urlHttp = url.toLowerCase().substring(0, 7) === "http://";
  if (!urlHttps && !urlHttp) {
    url = "https://" + url;
  }

  return url;
}

/**
 * Completes all necessary queries, caching and returns the full dataset for
 * the given endpoint.
 *
 * @param {object} request getSchema/getData request parameter.
 * @returns {object} Full dataset for given endpoint.
 */
function getOriginDataset(request) {
  var origin = {};
  origin.lastUpdate = getDatasetUpdate(request);
  origin.url = validateUrl(request.configParams);
  origin.key = digest(origin.url);

  // If an origin has not been previously cached, a dashboard might trigger
  // multiple getData calls simulteniousy for the same origin. This can result
  // in multiple calls to BigQuery / Firebase. Using a user lock ensures that
  // only one query is make to BigQuery / Firebase and rest of the requests
  // are made to Apps Script cache.
  var userLock = LockService.getUserLock();
  userLock.waitLock(15000);

  var lastFirebaseUpdate = propStore.get("script", origin.key);
  var bqIsFresh = !lastFirebaseUpdate || origin.lastUpdate > lastFirebaseUpdate;

  var scriptCache = CacheService.getScriptCache();

  if (bqIsFresh) {
    try {
      console.log("hitting BigQuery for " + origin.url);
      origin.data = getBqData(origin.url);
    } catch (e) {
      userLock.releaseLock();
      throw new Error("Invalid origin: " + origin.url);
    }
  } else {
    var cachedData = scriptCache.get(origin.key);
    if (cachedData && cachedData !== "undefined") {
      userLock.releaseLock();
      console.log("hitting Apps Script cache for " + origin.url);
      return JSON.parse(cachedData);
    }
  }

  processFirebase(origin);

  console.log("saving apps script cache for " + origin.url);
  scriptCache.put(origin.key, JSON.stringify(origin.data), crux.cacheDuration);
  userLock.releaseLock();
  return origin.data;
}

function getData(request) {
  // Create schema for requested fields
  var requestedSchema = request.fields.map(function(field) {
    for (var i = 0; i < crux.Schema.length; i++) {
      if (crux.Schema[i].name == field.name) {
        return crux.Schema[i];
      }
    }
  });

  // Fetch the data
  var originDataset = getOriginDataset(request);

  // Transform fetched data and filter for requested fields
  var headerIndex = {};
  originDataset.headers.forEach(function(header, index) {
    headerIndex[header] = index;
  });

  var requestedData = originDataset.data.map(function(rowData) {
    var values = [];
    requestedSchema.forEach(function(field) {
      var fieldIndex = headerIndex[field.name];
      var fieldValue = rowData[fieldIndex];
      values.push(fieldValue);
    });
    return {
      values: values
    };
  });

  return {
    schema: requestedSchema,
    rows: requestedData
  };
}

function getAuthType() {
  return {
    type: "NONE"
  };
}

function isAdminUser() {
  var userEmail = Session.getEffectiveUser().getEmail();
  // List of admin users are kept in script property
  var admins = propStore.get("script", "admins");
  admins = JSON.parse(admins);
  var response = admins.indexOf(userEmail) >= 0;
  return response;
}
