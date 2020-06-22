var cc = DataStudioApp.createCommunityConnector();

/** 
 * Handles the filter combinations given by Google Data Studio. It will try to add low-level filter (pre-filtering) to 
 * the HTTP GET query and apply high-level filters on the retrieved data (post-filtering).
 * 
 * see https://developers.google.com/datastudio/connector/filters
 * see https://developers.google.com/datastudio/connector/reference#filteroperator
 * 
 * @constructor
 * @param {object} schema - the data schema in JSON object notation
 * @param {object} filter - the the of dimensions filters given in JSON object notation. see request.dimensionsFilters
 * @param {int} filterType - the logical combination for the filters on first level. 0 for AND, 1 for OR, 2 for a leaf (match filter).
 * @returns {Filter} filter handler
 */
function Filter(schema, filter, filterType) {
  
  this.filter = filter;
  this.filterType = filterType;
  this.key;
  
  if (filter) {
    // any filters defined
    
    if (filterType == Filter.AND)
      this.filter = filter.map(orFilter => new Filter(schema, orFilter, Filter.OR));
    else if (filterType == Filter.OR)
      this.filter = filter.map(matchFilter => new Filter(schema, matchFilter, Filter.MATCH));
    else {
      this.id = filter.fieldName;
      this.field = schema.find(field => field.id == this.id);
      if (this.field.hasOwnProperty('api'))
        this.id = this.field.api;
    }
  }

  /**
   * Tests if this instance is an AND filter having children that will be logically combined by an AND condition.
   * @returns {boolean} true if AND; false else
   */
  this.isAnd = function() {
    return (this.filterType == Filter.AND);
  };
  
  /**
   * Tests if this instance is an OR filter having children that will be logically combined by an OR condition.
   * 
   * @returns {boolean} true if OR; false else
   */
  this.isOr = function() {
    return (this.filterType == Filter.OR);
  };

  /**
   * Tests if this instance is matching filter (leaf) having a single filter condition but no further children.
   * 
   * @returns {boolean} true if a leaf; false else
   */
  this.isFilter = function() {
    return (this.filterType == Filter.MATCH);
  };
  
  /**
   * Tests if this instance is supports boolean filtering on API level (e.g. HTTP GET query parameter)
   * 
   * @returns {boolean} true if low-level API filtering is supported; false else
   */
  this.isBooleanPreFilter = function() {
    var field = this.field;
    var filter = this.filter;
    if (!field || !filter)
      return false;
      
    return (field.filter == true && field.type == cc.FieldType.BOOLEAN && filter.operator == 'EQUALS');
  }

  /**
   * Tests if this instance is supports string filtering on API level (e.g. HTTP GET query parameter)
   * 
   * @returns {boolean} true if low-level API filtering is supported; false else
   */
  this.isTextPreFilter = function() {
    var field = this.field;
    var filter = this.filter;
    if (!field || !filter)
      return false;
      
    return (field.filter == true && field.type == cc.FieldType.TEXT && filter.type == 'INCLUDE' && (filter.operator == 'EQUALS' || filter.operator == 'CONTAINS'));
  }
  
  /**
   * Tests if this instance is supports number (integer) filtering on API level (e.g. HTTP GET query parameter)
   * 
   * @returns {boolean} true if low-level API filtering is supported; false else
   */
  this.isDefaultPreFilter = function() {
    var field = this.field;
    var filter = this.filter;
    if (!field || !filter)
      return false;
      
    return (field.filter == true && filter.type == 'INCLUDE' && (filter.operator == 'EQUALS' || filter.operator == 'IN_LIST'));
  }
 
   /**
   * Tests if this instance is supports any filtering on API level (e.g. HTTP GET query parameter)
   * 
   * @returns {boolean} true if low-level API filtering is supported; false else
   */
  this.isPreFilter = function() {
    if (this.key)
      return this.key.isPreFilter();
    
    return (this.isDefaultPreFilter() || this.isBooleanPreFilter() || this.isTextPreFilter());
  }

  /**
   * If this instance supports any filtering on API level it will add its HTTP GET query parameters to the params.
   * 
   * @param {object} params - the HTTP GET query parameters as an object in JSON notation (dictionary)
   */
  this.preFilterDefault = function(params) {
    if (!params)
      return;
    
    var values = [];
    if (params.hasOwnProperty(this.id))
      values = params[this.id];
    values.push(this.filter.values);
    params[this.id] = values;
  }
  
  /**
   * If this instance supports any boolean filtering on API level it will add its HTTP GET query parameters to the params.
   * 
   * @param {object} params - the HTTP GET query parameters as an object in JSON notation (dictionary)
   */
  this.preFilterBoolean = function(params) {
    if (!params || this.field.type != cc.FieldType.BOOLEAN)
      return;

    var value = this.filter.values[0];
    if (this.filter.type == 'EXCLUDE')
      value = !value;
    
    params[this.id] = value;
  }

  /**
   * If this instance supports any string filtering on API level it will add its HTTP GET query parameters to the params.
   * 
   * @param {object} params - the HTTP GET query parameters as an object in JSON notation (dictionary)
   */
  this.preFilterText = function(params) {
    if (!params || this.field.type != cc.FieldType.TEXT || this.filter.type != 'INCLUDE')
      return;

    var value = this.filter.values[0];
    params[this.id] = value;
  }
  
  /**
   * Looks for key-value mappings (e.g. user_name to user_id) in the specified dimensions filters and tries 
   * to convert those that are not supported by on API level (e.g. user_name) to those that are supported 
   * (e.g. user_id).
   * 
   * @param {object} mappings - the known key-value mappings whereas the key is the original field name (e.g. user_name) and the value is a dictionary with original values (e.g. user_name="John Doe") as keys and their corresponding id as value (e.g. user_id=123).
   * @param {object} schema - the data schema in JSON object notation
   */
  this.resolveIdMappings = function(mappings, schema) {
    if (this.isAnd() || this.isOr()) {
      this.filter.forEach(filter => filter.resolveIdMappings(mappings, schema));
      return;
    }

    // 'user' as type string might be mapped onto 'user_id' of type number
    if (!this.field.hasOwnProperty('key'))
      return;
    
    // get the field onto which is mapped; e.g. 'user' => 'user_id'
    var key = this.field['key'];
    var idField = schema.find(field => field.id == key);
    if (!idField)
      return;
    
    // get currently known / cached mappings for the current filter; e.g. 'user'
    var idMappings = mappings[this.field.id];
    if (!idMappings)
      return;
    
    // map all filter values onto their corresponding values; e.g. 'user'='John Doe' => 'user_id'=1234
    var mappedValues = this.filter.values.reduce((result, value) => ([...result, idMappings[value]]), []);
    
    // if there has been more than one filter value, make sure all mapped values have been found in the known / cached values
    var allFound = mappedValues.every(value => value);
    if (!allFound)
      return;
    
    // now we can finally change the filter from 'user' to 'user_id'
    var clone = Object.assign({}, this.filter);
    clone.fieldName = idField.id;
    clone.values = mappedValues;
    
    this.key = new Filter(schema, clone, this.filterType);
    
    // invoke the same function on the newly mapped filter just in case it will be mapped onto another filter again (chain of mappings)
    this.key.resolveIdMappings(mappings, schema);
  }
  
  /**
   * If this instance or any of its children supports any filtering on API level it will add all HTTP GET query parameters to the params.
   * 
   * @param {object} params - the HTTP GET query parameters as an object in JSON notation (dictionary)
   */
  this.preFilter = function(params) {
    if (!params || !this.filter)
      return;    
    
    if (!this.isFilter())
      this.filter.forEach(filter => filter.preFilter(params));
    else if (this.key)
      return this.key.preFilter(params);
    else if (this.isBooleanPreFilter())
      return this.preFilterBoolean(params);
    else if (this.isTextPreFilter())
      return this.preFilterText(params);
    else if (this.isDefaultPreFilter())
      return this.preFilterDefault(params);

    return;
  }
  
  /**
   * Tries to match this instance or any of its children with the values given in the data row (high-level post-filtering).
   * 
   * @param {object} row - the data row as an object in JSON notation (dictionary)
   */
  this.match = function(row) {
    if (!this.filter || this.isPreFilter())
      // no filters defined
      return true;
    
    if (this.isAnd())
      return this.filter.every(filter => filter.match(row) == true);
    if (this.isOr())
      return this.filter.some(filter => filter.match(row) == true);
    if (this.key)
      return this.key.match(row);
    
    var filter = this.filter;
    var value = row[this.field.id];    // use UI field ID
    var match = false;
    
    switch(filter.operator) {
      case 'EQUALS':
        match = filter.values.every(v => value == v);
        break;
      case 'CONTAINS':
        // ToDo: check if CONTAINS applies for Strings only; what about numbers?
        match = filter.values.every(v => String(value).includes(v));
        break;
      case 'REGEXP_PARTIAL_MATCH':
      case 'REGEXP_EXACT_MATCH':
        match = filter.values.every(function(v) {
          var pattern = new RegExp(v)
          var test = pattern.exec(value);
          return test && test.length > 0;
        });
        break;
      case 'IN_LIST':
        match = filter.values.some(v => value == v);
        break;
      case 'IS_NULL':
        match = !value || value == null || isNaN(value);
        break;
      case 'BETWEEN':
        match = (value >= filter.values[0]) && (value <= filter.values[1]);
        break;
      case 'NUMERIC_GREATER_THAN':
        match = filter.values.every(v => value > v);
        break;
      case 'NUMERIC_GREATER_THAN_OR_EQUAL':
        match = filter.values.every(v => value => v);
        break;
      case 'NUMERIC_LESS_THAN':
        match = filter.values.every(v => value < v);
        break;
      case 'NUMERIC_LESS_THAN_OR_EQUAL':
        match = filter.values.every(v => value <= v);
        break;
    }
        
    return filter.type == 'INCLUDE' ? match : !match;
  }

  return this;
};

/** @constant filter with children logically combined by AND */
Filter.AND = 0;

/** @constant filter with children logically combined by OR */
Filter.OR = 1;

/** @constant single filter with a logical match condition and no further children */
Filter.MATCH = 2;

/**
 * Tests the filter implementation based on a Google Data Studio request with dimensionsFilters.
 */
function testFilters() {
  var request = {
    dateRange: {
      endDate: '2020-05-04',
      startDate: '2020-05-04'
    },
    dimensionsFilters: [[{
      fieldName: 'customer_id',
      type: 'INCLUDE',
      values: [437380.0],
      operator: 'EQUALS'
    }, {
      fieldName: 'customer_id',
      type: 'INCLUDE',
      values: [493646.0],
      operator: 'EQUALS'
    }], [{
      fieldName: 'billable',
      type: 'INCLUDE',
      values: [true],
      operator: 'EQUALS'
    }, {
      fieldName: 'locked',
      type: 'INCLUDE',
      values: [false],
      operator: 'EQUALS'
    }]],
    configParams: {
      api: 'time_entries'
    },
    scriptParams: {
      lastRefresh: 1588712095513
    },
    fields: [{
      name: 'customer'
    }, {
      name: 'project'
    }, {
      name: 'project_id',
      forFilterOnly: true
    }, {
      name: 'time'
    }, {
      name: 'user'
    }]
  };
  
  var date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var params = {
    from: date,      
    to: date,
    limit: 20
  }
  
  var api_ = new MiteTimeEntries();
  var filter = new Filter(api_.getSchema(), request.dimensionsFilters, Filter.AND);
  filter.preFilter(params);

  return;
}
