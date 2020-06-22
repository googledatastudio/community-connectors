/** @constant - 15min */
DataCache.DEFAULT_TIMEOUT_SECONDS = 15 * 60; // 15min
DataCache.MAX_TIMEOUT_SECONDS = 6 * 60 * 60; // 6h (Google Maximum)

/** @constant - 255 chars */
DataCache.MAX_KEY_LENGTH = 255;

/** @conconstantst - 100 KB */
DataCache.MAX_CACHE_SIZE = 100 * 1024;

/**
 * Constructor for DataCache.
 *
 * see https://developers.google.com/apps-script/reference/cache (remark: use different cache for each domain)
 *
 * @constructor
 * @param {object} cacheService - Google Cache Service (e.g. user realm)
 * @param {int} timeoutSeconds - the experiration time given in seconds (maximum is defined by DataCache.MAX_TIMEOUT_SECONDS)
 * @param {string} prefix - an optional prefix that is used for building the key
 * @param {object} params - the parameters that have been used for data retrieval; they are used for building the key
 *
 * @returns {DataCache} data cache.
 */
function DataCache(cacheService, timeoutSeconds, prefix, params) {
  this.service = cacheService;
  // ToDo: check if a timeoutSeconds of undefined should be treated as 0 (no caching) or as DataCache.DEFAULT_TIMEOUT_SECONDS
  this.timeout =
    timeoutSeconds && Number.isInteger(timeoutSeconds)
      ? Math.min(timeoutSeconds, DataCache.MAX_TIMEOUT_SECONDS)
      : DataCache.DEFAULT_TIMEOUT_SECONDS;
  this.cacheKey = this.buildCacheKey(prefix, params);

  return this;
}

/**
 * Builds a cache key for given GDS request
 *
 * @param {string} prefix - an optional prefix that is used for building the key
 * @param {object} params - the parameters that have been used for data retrieval; they are used for building the key
 * @returns {String} cache key
 */
DataCache.prototype.buildCacheKey = function (prefix, params) {
  var key = prefix;
  if (params && Object.keys(params).length > 0)
    key = prefix + "_" + JSON.stringify(params);

  this.identifier = key;
  if (key.length > DataCache.MAX_KEY_LENGTH) key = key.cyrb53();

  return key;
};

/**
 * Gets the stored value using the built key.
 *
 * @returns {String} - the retrieved value
 */
DataCache.prototype.get = function () {
  var value = "";
  var chunk = "";
  var chunkIndex = 0;

  do {
    var chunkKey = this.getChunkKey(chunkIndex);
    chunk = this.service.get(chunkKey);
    value += chunk || "";
    chunkIndex++;
  } while (chunk && chunk.length == DataCache.MAX_CACHE_SIZE);

  return value;
};

/**
 * Stores a string value using the built key.
 *
 * @param {String} value - the string value to store
 */
DataCache.prototype.set = function (value) {
  this.storeChunks(value);
};

/**
 * Splits the value into chunks of DataCache.MAX_CACHE_SIZE and stores them using the initialy built key as prefix.
 *
 * @param {String} value - the value to store
 */
DataCache.prototype.storeChunks = function (value) {
  var chunks = this.splitInChunks(value);

  for (var i = 0; i < chunks.length; i++) {
    var chunkKey = this.getChunkKey(i);
    this.service.put(chunkKey, chunks[i], this.timeout);
  }
};

/**
 * Builds a key for the given chunk index
 *
 * @param {int} chunkIndex - the chunk index
 * @returns {String} key
 */
DataCache.prototype.getChunkKey = function (chunkIndex) {
  return this.cacheKey + "_" + chunkIndex;
};

/**
 * Splits the value into chunks of DataCache.MAX_CACHE_SIZE.
 *
 * @param {String} str - the string value
 * @returns {Array} chunks in an aray of strings
 */
DataCache.prototype.splitInChunks = function (str) {
  var size = DataCache.MAX_CACHE_SIZE;
  var numChunks = Math.ceil(str.length / size);
  var chunks = new Array(numChunks);

  for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

/**
 * Gets the stored value using the built key and converts it from String to JSON.
 *
 * @returns {object} - the retrieved value as a JSON object
 */
DataCache.prototype.getJson = function () {
  var json;
  try {
    json = JSON.parse(this.get());
    console.log("Got JSON data from cache. " + this.identifier);
  } catch (e) {
    console.log("Could not get JSON data from cache. " + this.identifier, e);
  }

  return json;
};

/**
 * Stores a value of type object using the built key.
 *
 * @param {object} value - the value to store
 */
DataCache.prototype.setJson = function (value) {
  try {
    this.set(JSON.stringify(value));
    console.log("JSON data set to cache. " + this.identifier);
  } catch (e) {
    console.log("Could not set JSON data to cache. " + this.identifier, e);
  }
};
