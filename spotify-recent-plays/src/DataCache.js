/* istanbul ignore next */
if (typeof(require) !== 'undefined') {
  var DateUtils = require('./DateUtils.js')['default'];
}

/**
 * Constructor for DataCache.
 * More info on caching: https://developers.google.com/apps-script/reference/cache/cache
 *
 * @param {object} cacheService - GDS caching service
 * @param {Date} startDate - beggining of GDS request interval
 * @param {Date} endDate - end of GDS request interval
 *
 * @return {object} DataCache.
 */
function DataCache(cacheService, startDate, endDate) {
  this.service = cacheService.getUserCache();
  this.cacheKey = this.buildCacheKey(startDate, endDate);

  return this;
}

/**
 * Gets stored value for dates passed in constructor
 *
 * @return {String} Response string
 */
DataCache.prototype.get = function() {
  var value = '';
  var chunk = '';
  var chunkIndex = 0;

  do {
    var chunkKey = this.getChunkKey(chunkIndex);
    chunk = this.service.get(chunkKey);
    value += (chunk || '');
    chunkIndex++;
  } while (chunk && chunk.length == DataCache.MAX_CACHE_SIZE);

  return value;
};

/**
 * Stores value in cache.
 *
 * @param {String} key - cache key
 * @param {String} value
 */
DataCache.prototype.set = function(value) {
  this.storeChunks(value);
};

// private

/** @const - 6 hours, Google's max */
DataCache.REQUEST_CACHING_TIME = 21600;

/** @const - 100 KB */
DataCache.MAX_CACHE_SIZE = 100 * 1024;

/**
 * Builds a cache key for given GDS request
 *
 * @return {String} cache key
 */
DataCache.prototype.buildCacheKey = function(startDate, endDate) {
  return DateUtils.getDatePart(startDate) + '_' + DateUtils.getDatePart(endDate);
};

DataCache.prototype.storeChunks = function(value) {
  var chunks = this.splitInChunks(value);

  for (var i = 0; i < chunks.length; i++) {
    var chunkKey = this.getChunkKey(i);
    this.service.put(chunkKey, chunks[i], DataCache.REQUEST_CACHING_TIME);
  }
};

DataCache.prototype.getChunkKey = function(chunkIndex) {
  return this.cacheKey + '_' + chunkIndex;
};

DataCache.prototype.splitInChunks = function(str) {
  var size = DataCache.MAX_CACHE_SIZE;
  var numChunks = Math.ceil(str.length / size);
  var chunks = new Array(numChunks);

  for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = DataCache;
}
