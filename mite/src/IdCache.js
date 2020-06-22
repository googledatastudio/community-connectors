/**
 * Caches known key-value mappings (e.g. user_name to user_id) that may be reused for low-level API filtering
 * (HTTP GET query parameter) in a subsequent API call thus reducing the number of retrieved rows.
 *
 * @constructor
 * @param {object} mappings - the known key-value mappings whereas the key is the non-supported field name and the value is a dictionary with id keys and their corresponding values
 * @param {string} prefix - an optional prefix that is used for building the key
 * @param {object} schema - the data schema in JSON object notation. key-value mappings are indicated by the key value (e.g. user_name: {key: user_id}).
 * @returns the Id cache
 */
function IdCache(cacheService, prefix, schema) {
  this.params = this.buildParams(schema);
  this.cache = new DataCache(cacheService, prefix, this.params);
  return this;
}

/**
 * Scans the data schema for key-value mappings. Key-value mappings are indicated by the key value (e.g. user_name: {key: user_id}).
 *
 * @returns {object} a dictionary (object in JSON notation) having the original field as parameter (key; e.g. user_name) and the mapped field as value (e.g. user_id).
 */
IdCache.prototype.buildParams = function(schema) {
  return schema
    .filter(field => field.hasOwnProperty("key"))
    .reduce((mappings, field) => ({ ...mappings, [field.id]: field.key }), {});
};

/**
 * Gets the known key-value mappings (e.g. user_name to user_id) that may be reused for low-level API filtering
 * (HTTP GET query parameter) in a subsequent API call thus reducing the number of retrieved rows.
 *
 * @returns {object} the known key-value mappings whereas the key is the original field name (e.g. user_name) and the value is a dictionary with original values (e.g. user_name="John Doe") as keys and their corresponding id as value (e.g. user_id=123).
 */
IdCache.prototype.get = function() {
  return this.cache.getJson();
};

/**
 * Scans the data being retrieved from the API for key-value mappings (as defined in the schema; e.g. user_name to user_id) and stores the values for those mappings.
 * Data is stored as an object in JSON notation (dictionary) whereas the key is the original field name (e.g. user_name) and the value is a dictionary with original values (e.g. user_name="John Doe") as keys and their corresponding id as value (e.g. user_id=123).
 */
IdCache.prototype.set = function(rows) {
  var data = this.get();
  if (!data) data = {};

  var params = this.params;

  Object.keys(params).forEach(function(field) {
    // example: field=project_name; key=project_id;
    var key = params[field];
    var values = data[field];
    if (!values) values = {};

    values = rows.reduce(
      (mappings, row) => ({ ...mappings, [row[field]]: row[key] }),
      values
    );

    data[field] = values;
  });

  this.cache.setJson(data);
};
