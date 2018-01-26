/**
 * Custom cache backed by Google Sheets.
 *
 * @param {string} organization - The organization name.
 * @param {string} repository - The repository name.
 * @return {object} the cache object.
 */
function CustomCache(organization, repository) {
  var spreadsheet;
  var userProperties = CustomCache.getPropertiesServiceNS().getUserProperties();
  var scriptId = userProperties.getProperty(CustomCache.SCRIPT_ID_KEY);
  if (scriptId === null) {
    spreadsheet = CustomCache.getSpreadsheetAppNS().create(CustomCache.SPREADSHEET_NAME);
    userProperties.setProperty(CustomCache.SCRIPT_ID_KEY, spreadsheet.getId());
  } else {
    try {
      spreadsheet = CustomCache.getSpreadsheetAppNS().openById(scriptId);
    } catch (e) {
      if (e.message.match(/is missing/)) {
        spreadsheet = CustomCache.getSpreadsheetAppNS().create(CustomCache.SPREADSHEET_NAME);
        userProperties.setProperty(CustomCache.SCRIPT_ID_KEY, spreadsheet.getId());
      } else {
        console.log(e);
        throw Error('The sheet could not be created.');
      }
    }
  }
  this.spreadsheet = spreadsheet;
  var sheetName = CustomCache.buildSheetName(organization, repository);
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (sheet === null) {
    spreadsheet.insertSheet(sheetName);
  }
  this.sheet = spreadsheet.getSheetByName(sheetName);
  return this;
}

/** @const */
CustomCache.SCRIPT_ID_KEY = 'sheets cache script id';

/** @const */
CustomCache.SPREADSHEET_NAME = 'user cache for GitHub.com connector.';

/** Returns the global for SpreadsheetApp. Allows for testing */
CustomCache.getSpreadsheetAppNS = function() {
  return SpreadsheetApp;
};

/** Returns the global for PropertiesService. Allows for testing */
CustomCache.getPropertiesServiceNS = function() {
  return PropertiesService;
};

/**
 * Deletes the `CustomCache.SCRIPT_ID_KEY` from the userProperties. This
 * effectively deletes the cache.
 */
function clearScriptId() {
  var userProperties = CustomCache.getPropertiesServiceNS().getUserProperties();
  userProperties.deleteProperty(CustomCache.SCRIPT_ID_KEY);
};


/**
 * Builds and returns a formatted string to be used for the sheet name.
 *
 * @param {string} organization - The organization name.
 * @param {string} repository - The repository name.
 * @return {string} The built sheet name.
 */
CustomCache.buildSheetName = function(organization, repository) {
  return organization + ' :: ' + repository;
};

/**
 * Clears the cache.
 */
CustomCache.prototype.clear = function() {
  var range = this.getEntireRange();
  range.clear();
};

/**
 * Puts the key and value into the cache.
 *
 * @param {string|number} key - the key to use. This key will be stringified.
 * @param {object} value - the value to use. This value will be stringified.
 */
CustomCache.prototype.put = function(key, value) {
  var stringifiedKey = this.stringify(key);
  var stringifiedValue = this.stringify(value);
  var row = [stringifiedKey, stringifiedValue];
  this.sheet.appendRow(row);
};

/**
 * Stringifies objects and primatives. This ensures that our keys and values
 * always end up as the same strings.
 *
 * @param {any} value - The value to stringify.
 * @return {string} A string representation of value.
 */
CustomCache.prototype.stringify = function(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  } else {
    return '' + value;
  }
};

/**
 * Returns the range for the sheet.
 *
 * @return {object} the range for the sheet.
 */
CustomCache.prototype.getEntireRange = function() {
  var lastRow = Math.max(this.sheet.getLastRow(), 1);
  return this.sheet.getRange(1, 1, lastRow, 2);
};

/**
 * Calls `predicate` on every row of the the spreadsheet, and returns the first
 * index that matches it, or -1 if none match.
 *
 * @return {number} The index or -1 if not found.
 */
CustomCache.prototype.findIndex = function(predicate) {
  var range = this.getEntireRange();
  var values = range.getValues();
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var result = predicate(row);
    if (result === true) {
      return i;
    }
  }
  return -1;
};

/**
 * Gets the value for the key, or undefined if the key isn't present in the
 * cache.
 *
 * @param {string|number} key - The key to lookup in the cache.
 * @return {object|undefined} The value stored in the cache.
 */
CustomCache.prototype.get = function(key) {
  var stringyKey = this.stringify(key);
  var index = this.findIndex(function(row) {
    return row[0] === stringyKey;
  });
  if (index === -1) {
    return undefined;
  } else {
    var values = this.getEntireRange().getValues();
    return JSON.parse(values[index][1]);
  }
};

/**
 * Finds the row that contains the data for the key, and returns that plus all
 * subsequent rows.
 *
 * @param {string|number} key - The key to lookup in the cache.
 * @return {object|undefined} The value stored in the cache.
 */
CustomCache.prototype.getRestFrom = function(key, reducerFn, initialValue) {
  var stringyKey = this.stringify(key);
  var index = this.findIndex(function(row) {
    return row[0] === stringyKey;
  });
  if (index === -1) {
    return undefined;
  } else {
    var values = this.getEntireRange().getValues();
    return values.splice(index).reduce(reducerFn, initialValue);
  }
};

// Needed for testing
var module = module || {};
module.exports = CustomCache;
